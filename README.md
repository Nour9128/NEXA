# NEXA — Your life, connected.

> An AI-powered personal life platform that helps people turn everyday intentions, messages, screenshots, ideas, and plans into organized actions.

![NEXA Banner](frontend/public/logo.svg)

---

## 1. Project Overview

**NEXA** is a full-stack, production-minded life copilot and workspace designed to bridge the gap between unstructured daily thoughts (screenshots, voice memos, chats, notes) and real-world execution.

Initially targeting users in Egypt (with localized context, timezone support, and dual currency options) and built for global scale, NEXA delivers a dark-first visual identity featuring an interactive **3D NEXA Core** powered by Three.js and React Three Fiber.

### Key Highlights
- **Interactive 3D NEXA Core**: Translucent, layered geometric sphere with ambient particle clouds, gentle mouse parallax, and dynamic visual states (`idle`, `listening`, `processing`, `completed`).
- **Conversational AI Workspace**: Real OpenAI SDK integration for natural language goal structuring, milestone generation, and budget estimation.
- **Universal Capture Engine**: Unified capture modal for notes, links, screenshots, and in-browser voice recognition (Web Speech API).
- **Relational PostgreSQL Data Model**: 19 normalized entities managed via Prisma ORM with cascading constraints, transactions, and foreign keys.
- **Team & Family Shared Spaces**: Role-based access control (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`), tokenized invitation links, and shared expense splitting ledgers.
- **Security & Privacy**: Argon2/bcrypt hashing, JWT access/refresh token rotation, rate limiting, Helmet, CORS, and one-click data export/deletion.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite & TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism utilities & dark midnight palette
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Motion**: Framer Motion
- **Icons**: Lucide React
- **Routing & State**: React Router DOM v6, TanStack Query v5
- **Forms & Validation**: React Hook Form with Zod

### Backend
- **Runtime**: Node.js & Express.js with TypeScript
- **Architecture**: REST API with layered Controller-Service-Repository pattern
- **ORM & Database**: Prisma ORM with PostgreSQL
- **Authentication**: JWT access & refresh tokens, bcrypt password hashing
- **Validation**: Zod schema validation middleware
- **Security**: Helmet, CORS, Express-Rate-Limit
- **AI Integration**: Official OpenAI SDK (`openai`) with structured outputs & usage tracking
- **File Uploads**: Multer with MIME verification and size limits
- **API Documentation**: OpenAPI 3.0 / Swagger UI (`/api/docs`)

---

## 3. Project Structure

```
NEXA/
├── backend/
│   ├── src/
│   │   ├── controllers/         # Auth, User, Plan, Task, Space, SavedItem, AI, Notification
│   │   ├── middleware/          # JWT auth, Zod validation, Centralized errorHandler
│   │   ├── routes/              # Express route modules
│   │   ├── services/            # AIService (OpenAI SDK & structured plan synthesis)
│   │   ├── utils/               # JWT & bcrypt utilities
│   │   ├── validators/          # Zod request validation schemas
│   │   ├── app.ts               # Express configuration, Helmet, CORS, Rate limiting
│   │   ├── server.ts            # Server entry point
│   │   └── swagger.ts           # OpenAPI 3.0 documentation
│   ├── prisma/
│   │   ├── schema.prisma        # 19 relational entities
│   │   └── seed.ts              # Realistic demo seed data (Karim Hassan, Dahab expedition)
│   ├── tests/
│   │   └── api.test.ts          # Vitest & Supertest API integration suite
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/              # NexaCore.tsx, NexaCoreCanvas.tsx
│   │   │   ├── capture/         # Universal CaptureModal (Voice, Screenshot, Link, Note)
│   │   │   └── layout/          # Navbar, Footer, AppLayout with collapsible sidebar
│   │   ├── context/             # AuthContext (sessions, tokens, profile stats)
│   │   ├── pages/               # LandingPage, Dashboard, AI Copilot, Plans, Tasks, Calendar, Spaces, Saved, Settings
│   │   ├── services/            # Axios API client with token refresh interceptors
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Router & route guards
│   │   └── index.css            # Dark midnight styling, glassmorphism, glow utilities
│   ├── public/                  # SVG logo & icons
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml           # PostgreSQL container & backend service
├── .env.example                 # Documented configuration variables
└── README.md
```

---

## 4. Getting Started

### Prerequisites
- **Node.js**: v20 or higher (`v22.x` recommended)
- **PostgreSQL**: Local PostgreSQL 15+ instance or Docker Compose

### Step 1: Clone and Configure Environment

```bash
git clone <repository_url>
cd NEXA
```

Backend configuration (`backend/.env`):
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexa_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
OPENAI_API_KEY="" # Optional: Add sk-... for real OpenAI GPT-4o intelligence
OPENAI_MODEL="gpt-4o-mini"
FRONTEND_URL="http://localhost:5173"
```

### Step 2: Install Dependencies

```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### Step 3: Database Migration & Seeding

Ensure PostgreSQL is running, then run:

```bash
cd backend
npm run db:push
npm run db:seed
```

> **Seeded Demo Account:**
> - Email: `demo@nexa.app`
> - Password: `Password123!`
> - Name: **Karim Hassan** (Cairo, Egypt)

---

## 5. Running the Application

### Development Servers

Open two terminal tabs:

**Terminal 1 — Backend (Port 4000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Real AI Integration

NEXA integrates the official **OpenAI SDK** for:
1. **Conversational Copilot**: `/api/ai/chat`
2. **Structured Plan Synthesis**: `/api/ai/organize` (outputs JSON schema with titles, deadlines, subtasks, priorities, and budget breakdown)
3. **Multi-Modal Content Extraction**: `/api/ai/extract` (extracts dates, locations, tasks, and costs from notes, URLs, or uploaded screenshots)

### Development vs Production Mode
- **With API Key**: Set `OPENAI_API_KEY="sk-..."` in `backend/.env`. NEXA connects live to OpenAI models (`gpt-4o-mini` or `gpt-4o`).
- **Without API Key (Development)**: NEXA provides local heuristic parsing so all features, previews, and database persistence can be evaluated end-to-end without disruption.
- **Production Safety**: In production mode, if the API key is missing, NEXA returns a clear `AI_NOT_CONFIGURED` response and never executes external actions without user confirmation.

---

## 7. Running Automated Tests

Run the backend integration test suite with Vitest and Supertest:

```bash
cd backend
npm test
```

This verifies:
- Health check & AI status endpoints
- User registration, login, and JWT validation
- Protected routes and 401 unauthorized rejection
- Plan CRUD operations with nested tasks, subtasks, and budgets
- Task state updates and completions
- AI request validation and structured output parsing
- Plan deletion cascading

---

## 8. Docker Deployment

To run PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

To run both PostgreSQL and the backend containerized:

```bash
docker compose up -d
```

---

## 9. API Documentation (Swagger)

Interactive OpenAPI 3.0 documentation is available when running the backend:
- URL: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 10. License

Proprietary © 2026 NEXA Technologies Inc. All rights reserved.
