# ESTFlix 🎥

A full-stack streaming-platform clone (Netflix-style) built with Node.js, Express, and MySQL. Built as a university web development project (Phase 2), it implements session-based authentication, multi-profile support, a content catalog with categories, favorites, watch history, and a simple recommendation feature, exposed through a REST API and consumed by a vanilla-JS single-page frontend.

## Features

- **Authentication** — register/login/logout with hashed passwords (bcrypt) and server-side sessions (Passport + `express-session`)
- **Multiple profiles per account** — like real streaming platforms, one account can have several viewing profiles
- **Content catalog** — categories and titles with full CRUD for admins
- **Favorites & watch history** — per profile
- **Recommendations** — basic recommendation endpoint per profile
- **Admin panel** — manage categories and content from the client

## Tech stack

**Backend:** Node.js, Express, Sequelize (ORM), MySQL2, Passport (local strategy), bcryptjs, express-session with `connect-session-sequelize`
**Frontend:** Vanilla JavaScript SPA (no framework), hand-rolled router, plain CSS

## Getting started

### Requirements
- Node.js v18+
- MySQL 8+

### 1. Database

```bash
mysql -u root -p < database.sql
```

Or run `database.sql` manually via MySQL Workbench / phpMyAdmin.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DB_HOST=localhost
DB_NAME=estflix
DB_USER=root
DB_PASSWORD=your_password
PORT=3000
SESSION_SECRET=any-secret-value
```

### 4. Run

```bash
npm start
```

Server starts at **http://localhost:3000**

For auto-reload during development:

```bash
npm run dev   # requires nodemon (already in devDependencies)
```

### Demo account

Sample data is seeded on first run:

| Email             | Password  |
|-------------------|-----------|
| demo@estflix.pt   | demo1234  |

## Project structure

```
estflix/
├── server/
│   ├── index.js          # Express app entrypoint (+ Passport, sessions)
│   ├── db/
│   │   ├── models.js     # Sequelize models
│   │   └── seed.js       # Seed data
│   ├── routes/
│   │   ├── auth.js       # POST /api/auth/login|register|logout, GET /me
│   │   ├── categories.js # CRUD /api/categories
│   │   ├── contents.js   # CRUD /api/contents
│   │   └── profiles.js   # CRUD /api/profiles + favorites + history
│   └── middleware/
│       └── auth.js       # requireAuth middleware
├── client/
│   ├── index.html        # SPA shell
│   ├── css/
│   └── js/
│       ├── data.js               # Data layer (fetch calls to the API)
│       ├── app.js                # Router + auth + main render
│       ├── page-profiles.js
│       ├── page-home.js
│       ├── page-categories-detail.js
│       ├── page-admin.js
│       └── utils.js
├── database.sql          # Full schema
├── .env.example           # Environment variable template
└── package.json
```

## API reference

### Auth

| Method | Route                  | Description             | Auth? |
|--------|-------------------------|--------------------------|-------|
| POST   | `/api/auth/register`    | Register a user          | ✗     |
| POST   | `/api/auth/login`       | Log in                   | ✗     |
| POST   | `/api/auth/logout`      | Log out                  | ✓     |
| GET    | `/api/auth/me`          | Current user             | ✓     |

### Categories

| Method | Route                    | Description   | Auth? |
|--------|---------------------------|---------------|-------|
| GET    | `/api/categories`         | List all      | ✗     |
| GET    | `/api/categories/:id`     | Get one       | ✗     |
| POST   | `/api/categories`         | Create        | ✓     |
| PUT    | `/api/categories/:id`     | Update        | ✓     |
| DELETE | `/api/categories/:id`     | Delete        | ✓     |

### Contents

| Method | Route                  | Description   | Auth? |
|--------|--------------------------|---------------|-------|
| GET    | `/api/contents`          | List all      | ✗     |
| GET    | `/api/contents/:id`      | Get one       | ✗     |
| POST   | `/api/contents`          | Create        | ✓     |
| PUT    | `/api/contents/:id`      | Update        | ✓     |
| DELETE | `/api/contents/:id`      | Delete        | ✓     |

### Profiles

| Method | Route                                     | Description          | Auth? |
|--------|---------------------------------------------|-----------------------|-------|
| GET    | `/api/profiles`                             | List profiles         | ✓     |
| GET    | `/api/profiles/:id`                         | Get profile           | ✓     |
| POST   | `/api/profiles`                             | Create profile        | ✓     |
| PUT    | `/api/profiles/:id`                         | Update profile        | ✓     |
| DELETE | `/api/profiles/:id`                         | Delete profile        | ✓     |
| GET    | `/api/profiles/:id/favorites`               | List favorites        | ✓     |
| POST   | `/api/profiles/:id/favorites`               | Add favorite          | ✓     |
| DELETE | `/api/profiles/:id/favorites/:contentId`    | Remove favorite       | ✓     |
| GET    | `/api/profiles/:id/history`                 | Watch history         | ✓     |
| POST   | `/api/profiles/:id/history`                 | Add to history        | ✓     |
| GET    | `/api/profiles/:id/recommendations`         | Recommendations       | ✓     |

## Security note

`.env` is git-ignored — never commit real database credentials or session secrets. Use `.env.example` as the template and set your own values locally.

## Author

Diego Teran — built as a university web development coursework project.

## License

MIT — see [LICENSE](LICENSE).
