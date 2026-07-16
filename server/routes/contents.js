// ── CONTENTS ROUTES ─────────────────────────────────────────────────────────
const express  = require('express');
const { Content, Category } = require('../db/models');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { Op }   = require('sequelize');
const router   = express.Router();

const include = [{ model: Category, as: 'category', attributes: ['id', 'name'] }];

// GET /api/contents                   — lista todos (filtro opcional: ?category=id)
router.get('/', async (req, res) => {
  const where = {};
  if (req.query.category) where.category_id = req.query.category;
  const contents = await Content.findAll({ where, include, order: [['title', 'ASC']] });
  res.json(contents);
});

// GET /api/contents/:id               — obter um
router.get('/:id', async (req, res) => {
  const content = await Content.findByPk(req.params.id, { include });
  if (!content) return res.status(404).json({ error: 'Conteúdo não encontrado' });
  res.json(content);
});

// POST /api/contents                  — criar
router.post('/', requireAdmin, async (req, res) => {
  const { title, description, genre, releaseYear, rating, imageUrl, categoryId } = req.body;
  if (!title || !description || !genre || !releaseYear || !rating || !imageUrl || !categoryId)
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  try {
    const content = await Content.create({
      title: title.trim(), description, genre, releaseYear, rating, imageUrl,
      category_id: categoryId,
    });
    res.status(201).json(await Content.findByPk(content.id, { include }));
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'Já existe conteúdo com esse título' });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/contents/:id               — atualizar
router.put('/:id', requireAdmin, async (req, res) => {
  const content = await Content.findByPk(req.params.id);
  if (!content) return res.status(404).json({ error: 'Conteúdo não encontrado' });
  const { title, description, genre, releaseYear, rating, imageUrl, categoryId } = req.body;
  try {
    await content.update({
      title: title?.trim() || content.title,
      description: description || content.description,
      genre: genre || content.genre,
      releaseYear: releaseYear || content.releaseYear,
      rating: rating || content.rating,
      imageUrl: imageUrl || content.imageUrl,
      category_id: categoryId || content.category_id,
    });
    res.json(await Content.findByPk(content.id, { include }));
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'Já existe conteúdo com esse título' });
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/contents/:id            — eliminar
router.delete('/:id', requireAdmin, async (req, res) => {
  const content = await Content.findByPk(req.params.id);
  if (!content) return res.status(404).json({ error: 'Conteúdo não encontrado' });
  await content.destroy();
  res.json({ message: 'Conteúdo eliminado' });
});

module.exports = router;
