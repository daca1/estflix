// ── DATABASE CONNECTION ─────────────────────────────────────────────────────
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME     || 'estflix',
  process.env.DB_USER     || 'root',
  process.env.DB_PASSWORD || '',
  {
    host:    process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

// ── MODELS ──────────────────────────────────────────────────────────────────

const User = sequelize.define('User', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email:    { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  role:     { type: DataTypes.ENUM('admin', 'user'), allowNull: false, defaultValue: 'user' },
}, { tableName: 'users', timestamps: true });

const Category = sequelize.define('Category', {
  id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
}, { tableName: 'categories', timestamps: true });

const Content = sequelize.define('Content', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:       { type: DataTypes.STRING(200), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  genre:       { type: DataTypes.STRING(100), allowNull: false },
  releaseYear: { type: DataTypes.INTEGER, allowNull: false, field: 'release_year' },
  rating:      { type: DataTypes.DECIMAL(3, 1), allowNull: false },
  imageUrl:    { type: DataTypes.STRING(500), allowNull: false, field: 'image_url' },
}, { tableName: 'contents', timestamps: true });

const Profile = sequelize.define('Profile', {
  id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:   { type: DataTypes.STRING(100), allowNull: false },
  avatar: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '👤' },
}, { tableName: 'profiles', timestamps: true });

const Favorite = sequelize.define('Favorite', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, { tableName: 'favorites', timestamps: true });

const History = sequelize.define('History', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  watchedAt:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'watched_at' },
}, { tableName: 'history', timestamps: false });

// ── ASSOCIATIONS ────────────────────────────────────────────────────────────

Content.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Content, { foreignKey: 'category_id', as: 'contents' });

Profile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Profile, { foreignKey: 'user_id', as: 'profiles' });

Favorite.belongsTo(Profile, { foreignKey: 'profile_id' });
Favorite.belongsTo(Content, { foreignKey: 'content_id' });
Profile.hasMany(Favorite, { foreignKey: 'profile_id', as: 'favorites' });

History.belongsTo(Profile, { foreignKey: 'profile_id' });
History.belongsTo(Content, { foreignKey: 'content_id' });
Profile.hasMany(History, { foreignKey: 'profile_id', as: 'history' });

module.exports = { sequelize, User, Category, Content, Profile, Favorite, History };
