const mongoose = require('mongoose');
const db = require('./db');
const Release = require('./models/Release');
const { getDefaultStepState } = require('./utils/computeStatus');

const isMock = process.env.USE_MOCK_DB === 'true' || (!process.env.MONGODB_URI && !process.env.DATABASE_URL);

async function initDb() {
  console.log('🚀 Initializing database...');

  try {
    if (isMock) {
        console.log('ℹ️ Running in Mock mode. No persistent schema to initialize.');
        return;
    }

    // 1. Clear existing data to ensure a fresh start with the new schema
    console.log('🧹 Clearing existing data...');
    await Release.deleteMany({});

    // 2. Seed data
    console.log('🌱 Seeding sample data...');
    const releases = [
      {
        name: 'Version 1.0.1',
        releaseDate: new Date('2022-09-20'),
        additionalInfo: 'Initial stable release',
        status: 'active',
        stepState: {
          github_prs_merged: true,
          changelog_updated: true,
          all_tests_passing: true,
          release_created: true,
          deployed_in_demo: true,
          tested_in_demo: true,
          deployed_in_production: true,
        },
      },
      {
        name: 'Version 1.1.0',
        releaseDate: new Date('2022-10-10'),
        additionalInfo: 'Feature release with new dashboard',
        status: 'active',
        stepState: {
          github_prs_merged: true,
          changelog_updated: true,
          all_tests_passing: true,
          release_created: true,
          deployed_in_demo: true,
          tested_in_demo: false,
          deployed_in_production: false,
        },
      },
      {
        name: 'Version 1.2.0',
        releaseDate: new Date('2022-11-05'),
        additionalInfo: 'Security patch and performance updates',
        status: 'active',
        stepState: {
          github_prs_merged: true,
          changelog_updated: true,
          all_tests_passing: true,
          release_created: false,
          deployed_in_demo: false,
          tested_in_demo: false,
          deployed_in_production: false,
        },
      },
      {
        name: 'Version 2.0.0-rc1',
        releaseDate: new Date('2022-12-01'),
        additionalInfo: 'Release candidate for major version',
        status: 'active',
        stepState: getDefaultStepState(),
      },
      {
        name: 'Hotfix 1.2.1',
        releaseDate: new Date('2022-11-15'),
        additionalInfo: 'Critical fix for auth bug',
        status: 'active',
        stepState: {
          github_prs_merged: true,
          changelog_updated: false,
          all_tests_passing: true,
          release_created: false,
          deployed_in_demo: false,
          tested_in_demo: false,
          deployed_in_production: false,
        },
      },
      {
        name: 'Internal Tools v0.5',
        releaseDate: new Date('2022-10-25'),
        additionalInfo: 'Internal scripts update',
        status: 'active',
        stepState: getDefaultStepState(),
      },
      {
        name: 'Mobile App Sync',
        releaseDate: new Date('2022-11-20'),
        additionalInfo: 'Syncing with mobile release cycle',
        status: 'active',
        stepState: getDefaultStepState(),
      },
      {
        name: 'Holiday Special Feature',
        releaseDate: new Date('2022-12-25'),
        additionalInfo: 'Limited time holiday theme',
        status: 'active',
        stepState: getDefaultStepState(),
      },
      {
        name: 'Abandoned v0.1',
        releaseDate: new Date('2021-01-01'),
        additionalInfo: 'Project was scrapped',
        status: 'deleted',
        stepState: getDefaultStepState(),
      },
      {
        name: 'Duplicate Test Build',
        releaseDate: new Date('2022-01-01'),
        additionalInfo: 'Used for testing soft delete',
        status: 'deleted',
        stepState: getDefaultStepState(),
      },
    ];

    await Release.insertMany(releases);

    console.log(`✅ Seeded ${releases.length} releases (${releases.filter(r => r.status === 'active').length} active, ${releases.filter(r => r.status === 'deleted').length} deleted).`);
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
 finally {
    if (!isMock) await mongoose.connection.close();
  }
}

initDb();
