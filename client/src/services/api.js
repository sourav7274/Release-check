const API_BASE = '/api';

async function handleResponse(res, defaultError) {
  if (!res.ok) {
    const error = new Error(defaultError);
    error.response = res;
    throw error;
  }
  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchReleases() {
  const res = await fetch(`${API_BASE}/releases`);
  return handleResponse(res, 'Failed to fetch releases');
}

export async function fetchRelease(id) {
  const res = await fetch(`${API_BASE}/releases/${id}`);
  return handleResponse(res, 'Failed to fetch release');
}

export async function createRelease(data) {
  const res = await fetch(`${API_BASE}/releases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res, 'Failed to create release');
}

export async function updateRelease(id, data) {
  const res = await fetch(`${API_BASE}/releases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res, 'Failed to update release');
}

export async function deleteRelease(id) {
  const res = await fetch(`${API_BASE}/releases/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res, 'Failed to delete release');
}

export async function fetchSteps() {
  const res = await fetch(`${API_BASE}/steps`);
  if (!res.ok) throw new Error('Failed to fetch steps');
  return res.json();
}
