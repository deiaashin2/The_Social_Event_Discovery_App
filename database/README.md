# Database Layer — Social Event Discovery App

This directory contains the PostgreSQL schema, migration files, and validation tools
for the Social Event Discovery App.

The database is containerized using Docker to ensure consistent setup across
development, testing, and CI environments.

---

---

## Technology Stack

- PostgreSQL 16
- Docker / Docker Compose
- SQL migrations
- GitHub Actions (CI)

---

## Running the Database Locally

### Prerequisites

- Docker Desktop
- Git

Verify installation:

```bash
docker compose version

-------------------------------------------------
###Start Services
# From the project root:
docker compose up -d
docker compose ps
# Ensure postgres and redis are running.


###Connect to PostgreSQL
docker compose exec postgres psql -U myuser -d mydb


###Exit with:
\q


###Applying Migrations
# Run the initial migration:
docker compose exec -T postgres \
  psql -U myuser -d mydb \
  -f /docker-entrypoint-initdb.d/0001_init.sql
# Migration files are versioned and should not be modified after merging.
# All schema changes must be added as new migration files.


###Verifying Database Schema
# List tables:
docker compose exec postgres \
  psql -U myuser -d mydb -c "\dt"

#Expected tables:
#users
#events
#event_attendees
#tags
#event_tags

###Local Validation Script
# A helper script is provided to automate local validation.
# Run:
bash database/tests/verify_db_local.sh

# This script:
# Starts PostgreSQL
# Applies migrations
# Verifies tables

Continuous Integration (CI)

Database validation is automated using GitHub Actions.

Workflow:

.github/workflows/db-validation.yml


The workflow:

Starts a PostgreSQL service container

Applies migrations

Verifies schema

Reports status on PRs and pushes

Only validated changes are merged.

Security and Integrity

Passwords are stored as bcrypt hashes

Unique email constraint enforced

Parameterized queries prevent SQL injection

Foreign keys enforce relational integrity

### Troubleshooting
## Docker Not Running
# Start Docker Desktop and retry:
docker compose up -d

## Missing Tables
# Re-run validation:
bash database/tests/verify_db_local.sh

## CI Failure
# Check GitHub Actions logs for migration or connection errors.