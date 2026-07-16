-- ============================================================
--  ESTFlix - Script de criação da Base de Dados (MySQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS estflix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE estflix;

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(100) NOT NULL,
  role       ENUM('admin','user') NOT NULL DEFAULT 'user',
  createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── CONTENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contents (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL UNIQUE,
  description  TEXT         NOT NULL,
  genre        VARCHAR(100) NOT NULL,
  release_year INT          NOT NULL,
  rating       DECIMAL(3,1) NOT NULL,
  image_url    VARCHAR(500) NOT NULL,
  category_id  INT          NOT NULL,
  createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_content_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ── PROFILES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  avatar    VARCHAR(20)  NOT NULL DEFAULT '👤',
  user_id   INT          NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- ── FAVORITES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT NOT NULL,
  content_id INT NOT NULL,
  createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fav (profile_id, content_id),
  CONSTRAINT fk_fav_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_content FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- ── HISTORY ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS history (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT      NOT NULL,
  content_id INT      NOT NULL,
  watched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_hist (profile_id, content_id),
  CONSTRAINT fk_hist_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_hist_content FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- ── SESSION STORE (connect-session-sequelize) ─────────────────
CREATE TABLE IF NOT EXISTS Sessions (
  sid    VARCHAR(36)  NOT NULL,
  expires DATETIME,
  data   TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (sid)
);

-- ── DADOS INICIAIS ────────────────────────────────────────────
INSERT IGNORE INTO categories (name) VALUES
  ('Sci-Fi'), ('Drama'), ('Ação'), ('Comédia'), ('Animação');

INSERT IGNORE INTO contents (title, description, genre, release_year, rating, image_url, category_id) VALUES
  ('Inception',
   'Um ladrão habilidoso que rouba segredos corporativos através da tecnologia de partilha de sonhos.',
   'Sci-Fi', 2010, 4.8,
   'https://images.pexels.com/photos/33545/sunrise-rose-clouds-sky.jpg?auto=compress&cs=tinysrgb&w=600',
   (SELECT id FROM categories WHERE name = 'Sci-Fi')),
  ('Joker',
   'Um comediante em dificuldades descobre-se à deriva na sociedade.',
   'Drama', 2019, 4.5,
   'https://images.pexels.com/photos/2156886/pexels-photo-2156886.jpeg?auto=compress&cs=tinysrgb&w=600',
   (SELECT id FROM categories WHERE name = 'Drama')),
  ('The Matrix',
   'Um programador descobre que a realidade é uma simulação.',
   'Sci-Fi', 1999, 4.7,
   'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=600',
   (SELECT id FROM categories WHERE name = 'Sci-Fi')),
  ('The Dark Knight',
   'O Batman enfrenta o Joker, que quer mergulhar Gotham no caos.',
   'Ação', 2008, 4.9,
   'https://images.pexels.com/photos/1809644/pexels-photo-1809644.jpeg?auto=compress&cs=tinysrgb&w=600',
   (SELECT id FROM categories WHERE name = 'Ação'));

-- Utilizador administrador (password: admin1234)
INSERT IGNORE INTO users (email, password, name, role) VALUES
  ('admin@estflix.pt',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Administrador', 'admin');
-- NOTA: O hash acima é apenas de exemplo. O seed.js gera o hash correto automaticamente.
-- Para produção, use apenas o seed.js ou execute o servidor uma vez para gerar os dados.
