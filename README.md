# The_Social_Event_Discovery_App
CPSC 491- Senior Capstone Project in Computer Science

## Frontend (Web)

The web client lives in `frontend/eventconnect-web`.

### Run locally
```bash
cd frontend/eventconnect-web
npm install
npm run dev

## Tech Stack
- Frontend: React + Vite + Tailwind
- Backend: Node.js (planned)
- Database: PostgreSQL (planned)

## Sprint 1 Scope
- Project setup
- Frontend scaffold
- Local development environment

## Known Limitations
- Backend not yet integrated
- Mock data only
```

## Backend
### Team Setup Guide (Backend)
```bash


Follow these steps to run the backend locally.


---


## 1 - Install Required Tools (One-Time Setup)


Make sure you have installed:


- Node.js (LTS version recommended)
- Docker Desktop
- Git


Verify installations:


```bash
node -v
npm -v
docker -v
docker compose version
git --version


## 2 Start PostgreSQL and Redis (Docker)


From the project root (where docker-compose.yml is located):
- docker compose up -d


Verify containers are running:
- docker compose ps


## 3 Create Backend Environment File


Create this file:
- backend/.env


Paste the following:


PORT=4000


# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_USER=myuser
PG_PASSWORD=mypassword
PG_DATABASE=mydb


# Redis
REDIS_URL=redis://localhost:6379
note - Make sure these values match your docker-compose.yml configuration.


## 4 Install Backend Dependencies
- cd backend
- npm install
- npm run dev


## Backend runs at:
- http://localhost:4000


## Running Backend Tests
- npm test