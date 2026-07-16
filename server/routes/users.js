// ── USERS ROUTES (Admin) ─────────────────────────────────────────────────────
const express   = require('express');
const { User, Profile, Favorite, History } = require('../db/models');
const { requireAdmin } = require('../middleware/auth');
const router    = express.Router();

// GET /api/users           — lista todos os utilizadores (exceto password)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'ASC']],
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/users/:id       — detalhe de um utilizador
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    });
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/users/:id/role  — alterar o role de um utilizador
router.put('/:id/role', requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!role || !['admin', 'user'].includes(role))
    return res.status(400).json({ error: 'role deve ser "admin" ou "user"' });

  // Impede que o admin se rebaixe a si próprio
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'Não pode alterar o seu próprio role' });

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    await user.update({ role });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/users/:id    — eliminar utilizador (e todos os seus dados)
router.delete('/:id', requireAdmin, async (req, res) => {
  // Impede auto-eliminação
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'Não pode eliminar a sua própria conta' });

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });

    // Os perfis (e respetivos favoritos/histórico) são apagados em cascata
    // graças ao ON DELETE CASCADE definido na base de dados.
    await user.destroy();
    res.json({ message: 'Utilizador eliminado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
