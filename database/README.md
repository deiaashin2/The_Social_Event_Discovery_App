# Database (PostgreSQL)

## Migrations
- `database/migrations/0001_init.sql` creates core tables used by the backend.

## Local validation (Docker)
From repo root:

```bash
docker compose up -d
bash database/tests/verify_db_local.sh
