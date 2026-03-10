// src/api/client.js
const BASE_URL = "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("access_token");
}

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    return;
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.detail || data?.error || JSON.stringify(data) || "Request failed";
    throw new Error(msg);
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (username, email, password) =>
      request("/auth/register/", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      }),

    login: async (username, password) => {
      const data = await request("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (data?.access) localStorage.setItem("access_token", data.access);
      return data;
    },

    me: () => request("/auth/me/"),
    logout: () => localStorage.removeItem("access_token"),
  },

  // ── Files ────────────────────────────────────────────────────────────────
  files: {
    list: () => request("/files/"),

    upload: (file, onProgress) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${BASE_URL}/files/`);
        xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });
    },

    delete: (id) => request(`/files/${id}/`, { method: "DELETE" }),
  },

  // ── Shares ───────────────────────────────────────────────────────────────
  shares: {
    list: () => request("/shares/"),

    create: (fileId, { recipientEmail = "", message = "", expiresAt = null, maxDownloads = null } = {}) =>
      request("/shares/", {
        method: "POST",
        body: JSON.stringify({
          file_id: fileId,
          recipient_email: recipientEmail,
          message,
          expires_at: expiresAt,
          max_downloads: maxDownloads,
        }),
      }),

    delete: (token) => request(`/shares/${token}/`, { method: "DELETE" }),
  },

  // ── Public ───────────────────────────────────────────────────────────────
  download: {
    info: (token) => request(`/download/${token}/`),
    url: (token) => `${BASE_URL}/download/${token}/`,
  },
};
