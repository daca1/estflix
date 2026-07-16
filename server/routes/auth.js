// ── AUTH ROUTES ─────────────────────────────────────────────────────────────
const express  = require('express');
const passport = require('passport');
const bcrypt   = require('bcryptjs');
const { User } = require('../db/models');
const router   = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: 'email, password e name são obrigatórios' });
  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email já registado' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, name });
    req.login(user, err => {
      if (err) return res.status(500).json({ error: 'Erro ao iniciar sessão' });
      res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err)    return next(err);
    if (!user)  return res.status(401).json({ error: info?.message || 'Credenciais inválidas' });
    req.login(user, err2 => {
      if (err2) return next(err2);
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    });
  })(req, res, next);
});

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ message: 'Sessão terminada' });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: 'Não autenticado' });
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role });
});

module.exports = router;
