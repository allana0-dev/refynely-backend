# Refynly Backend

AI‑Powered Pitch Deck Generator — NestJS + Prisma + Firebase Auth + OpenAI + PDF/PPTX Export + Slide Version Control

---

## Features

- **User Authentication** via Firebase
- **Deck Management** (CRUD + slide reordering)
- **Slide Management** (CRUD + auto snapshot versioning)
- **AI Integration**
  - Generate deck outlines from structured input, free‑form text, or uploaded PDF/DOCX
  - Refine individual slides with user feedback

- **Export**
  - Download decks as PDF or PowerPoint (.pptx)

- **Slide Version Control**
  - List previous versions of a slide
  - Revert to any past version

---

## Quick Start

### Prerequisites

- **Node.js** v18+ (LTS)
- **PostgreSQL** database
- **Firebase Project** (for Auth)
- **OpenAI API Key**

### 1. Clone & Install

```bash
git clone <repo-url> refynly-backend
cd refynly-backend
npm install
```

### 2. Environment Variables

Create a `.env` file at project root:

```ini
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_CLIENT_EMAIL=<firebase-client-email>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
OPENAI_API_KEY=sk-...
```

### 3. Database Setup

Run Prisma migrations and generate client:

```bash
# Apply migrations (creates tables)
npx prisma migrate dev --name init
# Generate Prisma client
npx prisma generate
```

> **Note:** In rapid prototyping, you can also use `npx prisma db push` to sync schema without migration history.

### 4. Start Server

```bash
# Development with hot-reload
npm run start:dev

# Production build + run
npm run build
npm run start:prod
```

Server will run at `http://localhost:3000/` by default.

---

## Testing

```bash
# Unit tests
git pull
npm run test

# E2E tests
git pull
test:e2e
```

---

## API Endpoints

### Authentication

- **GET** `/users/me` — Get authenticated user info

### Decks

- **POST** `/decks` — Create a new deck
- **GET** `/decks` — List all user decks
- **GET** `/decks/:id` — Get single deck with slides
- **PATCH** `/decks/:id` — Update deck title
- **DELETE** `/decks/:id` — Delete deck
- **PATCH** `/decks/:id/reorder` — Reorder slides (body: `{ order: string[] }`)
- **GET** `/decks/:id/export?format=pdf|pptx` — Download deck as file

### Slides

- **POST** `/decks/:deckId/slides` — Add a slide
- **PATCH** `/decks/:deckId/slides/:id` — Update a slide (auto-snapshots version)
- **DELETE** `/decks/:deckId/slides/:id` — Remove a slide

### AI

- **POST** `/ai/generate-outline` — Generate deck outline
  - Supports structured JSON, free-text `description`, optional PDF/DOCX upload

- **POST** `/ai/refine-slide` — Refine slide content (body: `{ title, content, feedback }`)

### Version Control (Slides)

- **GET** `/slides/:slideId/versions` — List slide versions
- **POST** `/slides/:slideId/versions/:versionId/revert` — Revert slide to a previous version

---

## Further Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)

---

## © 2025 Refynly

MIT Licensed
