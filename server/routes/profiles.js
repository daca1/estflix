// ── PROFILES ROUTES ─────────────────────────────────────────────────────────
const express   = require('express');
const { Profile, Favorite, History, Content, Category } = require('../db/models');
const { requireAuth } = require('../middleware/auth');
const router    = express.Router();

const contentInclude = [{ model: Content, include: [{ model: Category, as: 'category' }] }];

// GET /api/profiles              — perfis do utilizador autenticado
router.get('/', requireAuth, async (req, res) => {
  const profiles = await Profile.findAll({ where: { user_id: req.user.id } });
  res.json(profiles);
});

// GET /api/profiles/:id          — perfil específico
router.get('/:id', requireAuth, async (req, res) => {
  const profile = await Profile.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  res.json(profile);
});

// POST /api/profiles             — criar perfil
router.post('/', requireAuth, async (req, res) => {
  const { name, avatar } = req.body;
  if (!name) return res.status(400).json({ error: 'name é obrigatório' });
  const profile = await Profile.create({ name, avatar: avatar || '👤', user_id: req.user.id });
  res.status(201).json(profile);
});

// PUT /api/profiles/:id          — atualizar perfil
router.put('/:id', requireAuth, async (req, res) => {
  const profile = await Profile.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  const { name, avatar } = req.body;
  await profile.update({ name: name || profile.name, avatar: avatar || profile.avatar });
  res.json(profile);
});

// DELETE /api/profiles/:id       — eliminar perfil
router.delete('/:id', requireAuth, async (req, res) => {
  const profile = await Profile.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  await Favorite.destroy({ where: { profile_id: profile.id } });
  await History.destroy({ where: { profile_id: profile.id } });
  await profile.destroy();
  res.json({ message: 'Perfil eliminado' });
});

// GET /api/profiles/:id/favorites
router.get('/:id/favorites', requireAuth, async (req, res) => {
  const profile = await Profile.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  const favs = await Favorite.findAll({
    where: { profile_id: profile.id },
    include: contentInclude,
  });
  res.json(favs.map(f => f.Content));
});

// POST /api/profiles/:id/favorites
router.post('/:id/favorites', requireAuth, async (req, res) => {
  const { contentId } = req.body;
  const profile = await Profile.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  const [fav, created] = await Favorite.findOrCreate({
    where: { profile_id: profile.id, content_id: contentId },
  });
  res.status(created ? 201 : 200).json({ message: created ? 'Adicionado' : 'Já existe' });
});

// DELETE /api/profiles/:id/favorites/:contentId
router.delete('/:id/favorites/:contentId', requireAuth, async (req, res) => {
  const profile = await Profile.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  await Favorite.destroy({ where: { profile_id: profile.id, content_id: req.params.contentId } });
  res.json({ message: 'Removido dos favoritos' });
});

// GET /api/profiles/:id/history
router.get('/:id/history', requireAuth, async (req, res) => {
  const profile = await Profile.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  const hist = await History.findAll({
    where: { profile_id: profile.id },
    include: contentInclude,
    order: [['watched_at', 'DESC']],
    limit: 50,
  });
  res.json(hist.map(h => ({ ...h.Content.toJSON(), watchedAt: h.watchedAt })));
});

// POST /api/profiles/:id/history
router.post('/:id/history', requireAuth, async (req, res) => {
  const { contentId } = req.body;
  const profile = await Profile.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
  // Remove entrada anterior para mover para o topo
  await History.destroy({ where: { profile_id: profile.id, content_id: contentId } });
  await History.create({ profile_id: profile.id, content_id: contentId, watchedAt: new Date() });
  res.status(201).json({ message: 'Adicionado ao histórico' });
});

// GET /api/profiles/:id/recommendations
router.get('/:id/recommendations', requireAuth, async (req, res) => {
  const profile = await Profile.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });

  // Géneros mais vistos
  const hist = await History.findAll({
    where: { profile_id: profile.id },
    include: [{ model: Content, include: [{ model: Category, as: 'category' }] }],
    limit: 20,
  });
  const genreCount = {};
  hist.forEach(h => {
    const g = h.Content?.genre;
    if (g) genreCount[g] = (genreCount[g] || 0) + 1;
  });
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const watchedIds = hist.map(h => h.content_id);
  const favIds = (await Favorite.findAll({ where: { profile_id: profile.id } })).map(f => f.content_id);

  const { Op } = require('sequelize');
  let recs = [];
  if (topGenres.length > 0) {
    recs = await Content.findAll({
      where: { genre: topGenres[0], id: { [Op.notIn]: [...watchedIds, ...favIds] } },
      include: [{ model: Category, as: 'category' }],
      limit: 8,
    });
  }
  if (recs.length < 4) {
    const extra = await Content.findAll({
      where: { id: { [Op.notIn]: [...watchedIds, ...favIds, ...recs.map(r => r.id)] } },
      include: [{ model: Category, as: 'category' }],
      order: [['rating', 'DESC']],
      limit: 8 - recs.length,
    });
    recs = [...recs, ...extra];
  }
  res.json(recs);
});

module.exports = router;
