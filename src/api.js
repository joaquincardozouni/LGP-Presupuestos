const API_BASE = '/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Settings
  async getSettings() {
    return fetchJson('/settings');
  },
  async updateSettings(settings) {
    return fetchJson('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // Items / Catalog
  async getItems() {
    return fetchJson('/items');
  },
  async createItem(item) {
    return fetchJson('/items', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },
  async updateItem(id, item) {
    return fetchJson(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  },
  async deleteItem(id) {
    return fetchJson(`/items/${id}`, {
      method: 'DELETE'
    });
  },

  // Quotes
  async getQuotes() {
    return fetchJson('/quotes');
  },
  async getQuote(id) {
    return fetchJson(`/quotes/${id}`);
  },
  async createQuote(quote) {
    return fetchJson('/quotes', {
      method: 'POST',
      body: JSON.stringify(quote)
    });
  },
  async updateQuote(id, quote) {
    return fetchJson(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quote)
    });
  },
  async deleteQuote(id) {
    return fetchJson(`/quotes/${id}`, {
      method: 'DELETE'
    });
  },

  // Wiped Backups
  async getBackups() {
    return fetchJson('/backups');
  },
  async createBackup(quote) {
    return fetchJson('/backups', {
      method: 'POST',
      body: JSON.stringify(quote)
    });
  },
  async deleteBackup(id) {
    return fetchJson(`/backups/${id}`, {
      method: 'DELETE'
    });
  },

  // Backup & Restore
  async restoreBackup(backupData) {
    return fetchJson('/restore', {
      method: 'POST',
      body: JSON.stringify(backupData)
    });
  }
};
