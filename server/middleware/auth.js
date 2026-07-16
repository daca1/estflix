// ── AUTH MIDDLEWARE ─────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Não autenticado. Faça login.' });
}

function requireAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Acesso reservado a administradores.' });
}

function requireGuest(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.status(400).json({ error: 'Já tem sessão iniciada.' });
}

module.exports = { requireAuth, requireAdmin, requireGuest };
