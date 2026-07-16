// ── ESTFLIX SERVER ──────────────────────────────────────────────────────────
const express        = require('express');
const session        = require('express-session');
const passport       = require('passport');
const LocalStrategy  = require('passport-local').Strategy;
const bcrypt         = require('bcryptjs');
const path           = require('path');
const cors           = require('cors');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const { sequelize, User } = require('./db/models');
const seed               = require('./db/seed');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARES ─────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessão com persistência em MySQL
const sessionStore = new SequelizeStore({ db: sequelize });
app.use(session({
  secret:            process.env.SESSION_SECRET || 'estflix-secret-2025',
  resave:            false,
  saveUninitialized: false,
  store:             sessionStore,
  cookie:            { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 7 dias
}));
sessionStore.sync();

// ── PASSPORT ────────────────────────────────────────────────────────────────
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user)                           return done(null, false, { message: 'Email não encontrado' });
      const match = await bcrypt.compare(password, user.password);
      if (!match)                          return done(null, false, { message: 'Password incorreta' });
      return done(null, user);
    } catch (e) { return done(e); }
  }
));

passport.serializeUser((user, done)   => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findByPk(id)); }
  catch (e) { done(e); }
});

app.use(passport.initialize());
app.use(passport.session());

// ── API ROUTES ──────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/contents',   require('./routes/contents'));
app.use('/api/profiles',   require('./routes/profiles'));
app.use('/api/users',      require('./routes/users'));

// ── SERVE FRONTEND ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'client')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// ── ERROR HANDLER ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ── START ───────────────────────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('[db] Ligação MySQL estabelecida.');
    await sequelize.sync({ alter: true });
    console.log('[db] Tabelas sincronizadas.');
    await seed();
    app.listen(PORT, () => {
      console.log(`[server] ESTFlix a correr em http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('[server] Erro ao iniciar:', e.message);
    process.exit(1);
  }
}

start();
