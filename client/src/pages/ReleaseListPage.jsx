import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { fetchReleases, createRelease, deleteRelease } from '../services/api.js';
import Breadcrumb from '../components/Breadcrumb.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import NewReleaseModal from '../components/NewReleaseModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Toast from '../components/Toast.jsx';

function ReleaseListPage() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Custom UI State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const loadReleases = async () => {
    try {
      setLoading(true);
      const data = await fetchReleases();
      setReleases(data);
      setError(null);
    } catch (err) {
      setError('Failed to load releases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReleases();

    // Check if there's a toast message in the navigation state
    if (location.state?.toast) {
      setToast(location.state.toast);
      // Clear the state so the toast doesn't reappear on manual refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  const handleCreate = async (data) => {
    await createRelease(data);
    await loadReleases();
    setToast({ message: 'Release created successfully!', type: 'success' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRelease(deleteTarget.id);
      await loadReleases();
      setToast({ message: 'Release deleted.', type: 'success' });
    } catch (err) {
      console.error('Failed to delete release:', err);
      setToast({ message: 'Failed to delete release.', type: 'error' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="page release-list-page">
      <div className="page-header">
        <Breadcrumb items={[{ label: 'All releases' }]} />
        <button
          className="btn btn-primary btn-new-release"
          onClick={() => setShowModal(true)}
        >
          New release <span className="btn-icon">＋</span>
        </button>
      </div>

      {loading && <div className="loading">Loading releases...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="table-container">
          <table className="release-table">
            <thead>
              <tr>
                <th>Release</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {releases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No releases yet. Create your first release!
                  </td>
                </tr>
              ) : (
                releases.map((release) => (
                  <tr key={release.id}>
                    <td className="release-name">{release.name}</td>
                    <td className="release-date">{formatDate(release.releaseDate)}</td>
                    <td>
                      <StatusBadge status={release.lifecycleStatus} />
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-view"
                        onClick={() => navigate(`/releases/${release.id}`)}
                      >
                        View <span className="btn-icon-sm">👁</span>
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => setDeleteTarget(release)}
                      >
                        Delete <span className="btn-icon-sm">🗑</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <NewReleaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Release"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmText="Delete"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
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

export default ReleaseListPage;
