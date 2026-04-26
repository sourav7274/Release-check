import { useState } from 'react';

function NewReleaseModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !releaseDate) return;
    setError(null);

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        releaseDate: new Date(releaseDate).toISOString(),
        additionalInfo: additionalInfo.trim() || null,
      });
      setName('');
      setReleaseDate('');
      setAdditionalInfo('');
      setError(null);
      onClose();
    } catch (err) {
      console.error('Failed to create release:', err);
      // Try to extract a friendly error message from the response
      try {
          const body = await err.response?.json();
          setError(body?.error || 'Failed to create release');
      } catch {
          setError(err.message || 'Failed to create release');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Release</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {error && <div className="error-message" style={{ margin: '0 0 var(--spacing-md) 0' }}>{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="release-name">Release Name *</label>
            <input
              id="release-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Version 1.0.0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="release-date">Due Date *</label>
            <input
              id="release-date"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="release-info">Additional Info</label>
            <textarea
              id="release-info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Optional notes about this release"
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Release'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewReleaseModal;
