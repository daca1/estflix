// ── DATA LAYER (Fase 2 – AJAX / REST API) ──────────────────────────────────
// Substitui o localStorage pela API REST do servidor Node.js

const API = '/api';

// ── HTTP HELPER ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

// ── AUTH ────────────────────────────────────────────────────────────────────
const Auth = {
  _user: null,

  async me() {
    try { this._user = await apiFetch('/auth/me'); return this._user; }
    catch { this._user = null; return null; }
  },

  async login(email, password) {
    this._user = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
    return this._user;
  },

  async register(email, password, name) {
    this._user = await apiFetch('/auth/register', { method: 'POST', body: { email, password, name } });
    return this._user;
  },

  async logout() {
    await apiFetch('/auth/logout', { method: 'POST' });
    this._user = null;
  },

  current()        { return this._user; },
  isAdmin()        { return this._user?.role === 'admin'; },
};

// ── CONTENTS ────────────────────────────────────────────────────────────────
const Contents = {
  async getAll(categoryId) {
    const qs = categoryId ? `?category=${categoryId}` : '';
    return apiFetch('/contents' + qs);
  },
  async getById(id)    { return apiFetch('/contents/' + id); },
  async add(data)      { return apiFetch('/contents', { method: 'POST', body: data }); },
  async update(id, data){ return apiFetch('/contents/' + id, { method: 'PUT', body: data }); },
  async delete(id)     { return apiFetch('/contents/' + id, { method: 'DELETE' }); },
};

// ── CATEGORIES ──────────────────────────────────────────────────────────────
const Categories = {
  async getAll()       { return apiFetch('/categories'); },
  async getById(id)    { return apiFetch('/categories/' + id); },
  async add(name)      { return apiFetch('/categories', { method: 'POST', body: { name } }); },
  async update(id, name){ return apiFetch('/categories/' + id, { method: 'PUT', body: { name } }); },
  async delete(id)     { return apiFetch('/categories/' + id, { method: 'DELETE' }); },
};

// ── PROFILES ────────────────────────────────────────────────────────────────
const Profiles = {
  async getAll()          { return apiFetch('/profiles'); },
  async getById(id)       { return apiFetch('/profiles/' + id); },
  async add(name, avatar) { return apiFetch('/profiles', { method: 'POST', body: { name, avatar } }); },
  async delete(id)        { return apiFetch('/profiles/' + id, { method: 'DELETE' }); },

  async getFavorites(profileId)            { return apiFetch('/profiles/' + profileId + '/favorites'); },
  async addFavorite(profileId, contentId)  {
    return apiFetch('/profiles/' + profileId + '/favorites', { method: 'POST', body: { contentId } });
  },
  async removeFavorite(profileId, contentId) {
    return apiFetch('/profiles/' + profileId + '/favorites/' + contentId, { method: 'DELETE' });
  },

  async getHistory(profileId)              { return apiFetch('/profiles/' + profileId + '/history'); },
  async addToHistory(profileId, contentId) {
    return apiFetch('/profiles/' + profileId + '/history', { method: 'POST', body: { contentId } });
  },

  async getRecommendations(profileId)      { return apiFetch('/profiles/' + profileId + '/recommendations'); },
};

// ── AVATARES ─────────────────────────────────────────────────────────────────
const AVATARS = ['👨‍💼', '👩‍💻', '👦', '👧', '👨‍🎓', '👩‍🎨', '🧑‍🚀', '👨‍🍳'];

// ── USERS (admin) ────────────────────────────────────────────────────────────
const Users = {
  async getAll()             { return apiFetch('/users'); },
  async getById(id)          { return apiFetch('/users/' + id); },
  async setRole(id, role)    { return apiFetch('/users/' + id + '/role', { method: 'PUT', body: { role } }); },
  async delete(id)           { return apiFetch('/users/' + id, { method: 'DELETE' }); },
};
