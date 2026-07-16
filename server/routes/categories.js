// ── CATEGORIES ROUTES ───────────────────────────────────────────────────────
const express    = require('express');
const { Category, Content } = require('../db/models');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router     = express.Router();

// GET /api/categories          — lista todas
router.get('/', async (req, res) => {
  const cats = await Category.findAll({ order: [['name', 'ASC']] });
  res.json(cats);
});

// GET /api/categories/:id      — obter uma
router.get('/:id', async (req, res) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Categoria não encontrada' });
  res.json(cat);
});

// POST /api/categories         — criar
router.post('/', requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name é obrigatório' });
  try {
    const cat = await Category.create({ name: name.trim() });
    res.status(201).json(cat);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'Categoria já existe' });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/categories/:id      — atualizar
router.put('/:id', requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name é obrigatório' });
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Categoria não encontrada' });
  try {
    await cat.update({ name: name.trim() });
    res.json(cat);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'Nome já existe' });
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/categories/:id   — eliminar (só se não tiver conteúdos)
router.delete('/:id', requireAdmin, async (req, res) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Categoria não encontrada' });
  const count = await Content.count({ where: { category_id: req.params.id } });
  if (count > 0)
    return res.status(409).json({ error: 'Não é possível eliminar categoria com conteúdos associados' });
  await cat.destroy();
  res.json({ message: 'Categoria eliminada' });
});

module.exports = router;
