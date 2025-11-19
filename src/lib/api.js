const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'İstek başarısız oldu');
  }
  return response.json();
}

export async function createHabit(payload) {
  const response = await fetch('/api/habits', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function toggleHabitEntry(payload) {
  const response = await fetch('/api/habit-entries/toggle', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}
