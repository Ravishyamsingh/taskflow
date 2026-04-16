# TaskFlow API

TaskFlow is a backend-focused assignment project with JWT authentication, role-based access control, and Task CRUD APIs, supported by a minimal React frontend.

## Tech Stack
- Backend: Node.js, Express, Prisma ORM
- Database: PostgreSQL
- Auth: JWT, bcrypt
- Frontend: React
- API Docs: Swagger

## Assignment Scope
- User registration and login
- Protected routes using JWT
- Role-based behavior (USER and ADMIN)
- Task CRUD operations
- Validation and centralized error handling
- API versioning under /api/v1
- Basic frontend for auth and task management

## Quick Start (Local)

### 1) Backend
```bash
cd backend
cp .env.example .env
# Update DATABASE_URL in .env with your real PostgreSQL password
# Example: postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskflow_db
# Then create the database: taskflow_db
npm install
npx prisma migrate dev --name init
npx prisma generate
node src/utils/seed.js
npm run dev
```

Backend: http://localhost:5000  
Swagger: http://localhost:5000/api-docs

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Frontend: http://localhost:3000

## Deploy on Railway

Railway is a good option for this project. It is simple to host backend, frontend, and PostgreSQL in one place.

### 1) Create Services
- Add a PostgreSQL service in Railway.
- Add a Backend service from this repo with root directory: `backend`.
- Add a Frontend service from this repo with root directory: `frontend`.

### 2) Backend Settings (Railway)
- Start Command: `npm run start:railway`
- Required variables:
	- `DATABASE_URL` (from Railway PostgreSQL service)
	- `JWT_SECRET` (your strong secret)
	- `NODE_ENV=production`
	- `FRONTEND_URL=https://<your-frontend-domain>.railway.app`

Note: `start:railway` runs `prisma migrate deploy` automatically before starting the API.

### 3) Frontend Settings (Railway)
- Build Command: `npm run build`
- Start Command: `npm run start:railway`
- Required variable:
	- `REACT_APP_API_URL=https://<your-backend-domain>.railway.app/api/v1`

After first backend deploy, copy its public domain and set it in frontend `REACT_APP_API_URL`.

### 4) Optional Seed (One Time)
Run this from backend service shell after deployment:

```bash
npm run db:seed
```

## API Overview

### Auth
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me

### Tasks
- GET /api/v1/tasks
- POST /api/v1/tasks
- GET /api/v1/tasks/:id
- PUT /api/v1/tasks/:id
- DELETE /api/v1/tasks/:id

## Demo Credentials
- Admin: admin@taskflow.dev / Admin@123
- User: ravi@taskflow.dev / User@1234

## Scalability Note
A short scalability summary is available in SCALABILITY.md.
