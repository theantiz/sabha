const DEFAULT_API_BASE_URL = "/api";

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      payload?.detail ||
      payload?.error ||
      `Request failed with status ${response.status}`;
    throw new Error(detail);
  }

  return payload;
}

export function createSession(body) {
  return apiRequest("/sessions/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function triggerCouncil(sessionId, body) {
  return apiRequest(`/sessions/${sessionId}/messages/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
