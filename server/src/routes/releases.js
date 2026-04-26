const express = require('express');
const mongoose = require('mongoose');
const db = require('../db');
const Release = require('../models/Release');
const STEPS = require('../constants/steps');
const { computeStatus, getDefaultStepState } = require('../utils/computeStatus');

const router = express.Router();

const isMock = process.env.USE_MOCK_DB === 'true' || (!process.env.MONGODB_URI && !process.env.DATABASE_URL);

// Helper: attach computed status to a release object
function withStatus(release) {
  const data = release.toJSON ? release.toJSON() : JSON.parse(JSON.stringify(release));
  const stepState = data.stepState || {};
  
  return {
    ...data,
    id: data.id || data._id,
    stepState,
    // Renaming computed status to lifecycleStatus to avoid conflict with the DB status field
    lifecycleStatus: computeStatus(stepState),
  };
}

// Helper to sort releases: Ongoing > Planned > Done
function sortReleases(a, b) {
  const order = { ongoing: 0, planned: 1, done: 2 };
  return order[a.lifecycleStatus] - order[b.lifecycleStatus];
}

// Middleware: Validate ID
function validateId(req, res, next) {
  const { id } = req.params;
  if (!isMock && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Release ID format' });
  }
  next();
}

// GET /api/releases — List all active releases
router.get('/', async (req, res) => {
  try {
    let releases;
    if (isMock) {
      releases = await db`SELECT * FROM releases WHERE status = 'active'`;
    } else {
      // By default only show active releases
      releases = await Release.find({ status: 'active' });
    }
    
    const processed = releases.map(withStatus).sort(sortReleases);
    res.json(processed);
  } catch (err) {
    console.error('Error fetching releases:', err);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

// GET /api/steps — Return predefined step definitions
router.get('/steps', (req, res) => {
  res.json(STEPS);
});

// GET /api/releases/:id — Get single release
router.get('/:id', validateId, async (req, res) => {
  try {
    let release;
    if (isMock) {
      const results = await db`SELECT * FROM releases WHERE id = ${req.params.id}`;
      release = results[0];
    } else {
      release = await Release.findById(req.params.id);
    }

    if (!release) return res.status(404).json({ error: 'Release not found' });
    res.json(withStatus(release));
  } catch (err) {
    console.error('Error fetching release:', err);
    res.status(500).json({ error: 'Failed to fetch release' });
  }
});

// POST /api/releases — Create release
router.post('/', async (req, res) => {
  try {
    const { name, releaseDate, additionalInfo } = req.body;
    if (!name || !releaseDate) {
      return res.status(400).json({ error: 'Name and release date are required' });
    }

    let release;
    const initialStepState = getDefaultStepState();

    if (isMock) {
      // Check for duplicates in mock (manual) - Only among active ones
      const allReleases = await db`SELECT * FROM releases WHERE status = 'active'`;
      if (allReleases.some(r => r.name.toLowerCase() === name.toLowerCase())) {
          return res.status(400).json({ error: 'A release with this name already exists' });
      }

      [release] = await db`
        INSERT INTO releases (name, release_date, additional_info, step_state, status)
        VALUES (${name}, ${new Date(releaseDate)}, ${additionalInfo || null}, ${db.json(initialStepState)}, 'active')
        RETURNING *
      `;
    } else {
      // Manual check for Mongo (Only among active ones)
      // We search for a case-insensitive match for the name that is still 'active'
      const existing = await Release.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        status: 'active'
      });

      if (existing) {
        return res.status(400).json({ error: 'A release with this name already exists' });
      }

      release = await Release.create({
        name: name.trim(),
        releaseDate: new Date(releaseDate),
        additionalInfo: additionalInfo || null,
        stepState: initialStepState,
        status: 'active'
      });
    }

    res.status(201).json(withStatus(release));
  } catch (err) {
    console.error('Error creating release:', err);
    res.status(500).json({ error: 'Failed to create release' });
  }
});

// PATCH /api/releases/:id — Update release
router.patch('/:id', validateId, async (req, res) => {
  try {
    const id = req.params.id;
    let release;

    if (isMock) {
      const results = await db`SELECT * FROM releases WHERE id = ${id}`;
      if (results.length === 0) return res.status(404).json({ error: 'Release not found' });
      
      const data = results[0];

      // Check for duplicate name in mock (case-insensitive) - Only among active ones
      if (req.body.name && req.body.name.toLowerCase() !== data.name.toLowerCase()) {
          const allReleases = await db`SELECT * FROM releases WHERE status = 'active'`;
          if (allReleases.some(r => r.name.toLowerCase() === req.body.name.toLowerCase())) {
              return res.status(400).json({ error: 'A release with this name already exists' });
          }
      }

      const update = {
        name: req.body.name !== undefined ? req.body.name : data.name,
        release_date: req.body.releaseDate !== undefined ? new Date(req.body.releaseDate) : data.releaseDate,
        additional_info: req.body.additionalInfo !== undefined ? req.body.additionalInfo : data.additionalInfo,
        step_state: req.body.stepState !== undefined ? req.body.stepState : data.stepState,
        status: req.body.status !== undefined ? req.body.status : data.status,
        updated_at: new Date()
      };

      [release] = await db`
        UPDATE releases 
        SET ${db(update, 'name', 'release_date', 'additional_info', 'step_state', 'status', 'updated_at')}
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      release = await Release.findById(id);
      if (!release) return res.status(404).json({ error: 'Release not found' });

      // Manual check for Mongo (Only among active ones, ignoring current record)
      if (req.body.name && req.body.name.trim().toLowerCase() !== release.name.toLowerCase()) {
          const existing = await Release.findOne({ 
              name: { $regex: new RegExp(`^${req.body.name.trim()}$`, 'i') },
              status: 'active',
              _id: { $ne: release._id } 
          });
          if (existing) {
              return res.status(400).json({ error: 'A release with this name already exists' });
          }
      }

      if (req.body.name !== undefined) release.name = req.body.name.trim();
      if (req.body.releaseDate !== undefined) release.releaseDate = new Date(req.body.releaseDate);
      if (req.body.additionalInfo !== undefined) release.additionalInfo = req.body.additionalInfo;
      if (req.body.status !== undefined) release.status = req.body.status;
      
      if (req.body.stepState !== undefined) {
        release.stepState = req.body.stepState;
        release.markModified('stepState');
      }

      await release.save();
    }

    if (!release) return res.status(404).json({ error: 'Release not found' });
    res.json(withStatus(release));
  } catch (err) {
    console.error('Error updating release:', err);
    res.status(500).json({ error: 'Failed to update release' });
  }
});

// DELETE /api/releases/:id — Soft delete
router.delete('/:id', validateId, async (req, res) => {
  try {
    const id = req.params.id;
    if (isMock) {
      await db`UPDATE releases SET status = 'deleted' WHERE id = ${id}`;
    } else {
      // Soft delete: just update the status
      const result = await Release.findByIdAndUpdate(id, { status: 'deleted' });
      if (!result) return res.status(404).json({ error: 'Release not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting release:', err);
    res.status(500).json({ error: 'Failed to delete release' });
  }
});

module.exports = router;
