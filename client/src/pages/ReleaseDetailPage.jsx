import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRelease, fetchSteps, updateRelease, deleteRelease } from '../services/api.js';
import Breadcrumb from '../components/Breadcrumb.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Toast from '../components/Toast.jsx';

function ReleaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState(null);
  const [steps, setSteps] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Custom UI State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [releaseData, stepsData] = await Promise.all([
          fetchRelease(id),
          fetchSteps(),
        ]);
        setRelease(releaseData);
        setSteps(stepsData);
        setAdditionalInfo(releaseData.additionalInfo || '');
        setError(null);
      } catch (err) {
        setError('Failed to load release');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStepToggle = async (stepKey) => {
    if (!release) return;

    const newStepState = {
      ...release.stepState,
      [stepKey]: !release.stepState[stepKey],
    };

    try {
      const updated = await updateRelease(id, { stepState: newStepState });
      setRelease(updated);
    } catch (err) {
      console.error('Failed to update step:', err);
    }
  };

  const handleSaveInfo = async () => {
    if (!release) return;
    setSaving(true);
    try {
      await updateRelease(id, { additionalInfo: additionalInfo.trim() || null });
      // Navigate back to the home page immediately after a successful save
      // Passing the toast message via state so the home page can display it
      navigate('/', { 
        state: { 
          toast: { message: 'Release updated successfully!', type: 'success' } 
        },
        replace: true // Replace current history entry
      });
    } catch (err) {
      console.error('Failed to save additional info:', err);
      // Try to extract a friendly error message from the response
      let errorMsg = 'Failed to save changes.';
      try {
        const body = await err.response?.json();
        errorMsg = body?.error || errorMsg;
      } catch (e) {
        errorMsg = err.message || errorMsg;
      }
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!release) return;
    try {
      await deleteRelease(id);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete release:', err);
      setToast({ message: 'Failed to delete release.', type: 'error' });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <div className="loading">Loading release...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!release) return <div className="error-message">Release not found</div>;

  return (
    <div className="page release-detail-page">
      <div className="page-header">
        <Breadcrumb
          items={[
            { label: 'All releases', to: '/' },
            { label: release.name },
          ]}
        />
        <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
          Delete <span className="btn-icon">🗑</span>
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-info-row">
          <div className="detail-field">
            <label>Release</label>
            <div className="detail-value">{release.name}</div>
          </div>
          <div className="detail-field">
            <label>Date</label>
            <div className="detail-value">{formatDate(release.releaseDate)}</div>
          </div>
        </div>
      </div>

      <div className="checklist-section">
        {steps.map((step) => (
          <label key={step.key} className="checklist-item">
            <input
              type="checkbox"
              checked={release.stepState[step.key] || false}
              onChange={() => handleStepToggle(step.key)}
              className="checklist-checkbox"
            />
            <span className={`checklist-label ${release.stepState[step.key] ? 'completed' : ''}`}>
              {step.label}
            </span>
          </label>
        ))}
      </div>

      <div className="additional-info-section">
        <h3>Additional remarks / tasks</h3>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Please enter any other important notes for this release"
          rows={5}
          className="additional-info-textarea"
        />
        <div className="additional-info-actions">
          <button
            className="btn btn-primary btn-save"
            onClick={handleSaveInfo}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'} ✓
          </button>
        </div>
      </div>

      {/* Notifications and Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Release"
        message={`Are you sure you want to delete "${release.name}"? This action cannot be undone.`}
        confirmText="Delete Release"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <div className="toast-container">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

export default ReleaseDetailPage;
