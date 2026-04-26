function StatusBadge({ status }) {
  const labels = {
    planned: 'Planned',
    ongoing: 'Ongoing',
    done: 'Done',
  };

  return (
    <span className={`status-badge status-badge--${status}`}>
      {labels[status] || status}
    </span>
  );
}

export default StatusBadge;
