#!/usr/bin/env bash
set -euo pipefail

echo "== DB local validation =="

# Start services (postgres/redis) in background
docker compose up -d postgres

echo "Waiting briefly for Postgres..."
sleep 3

echo "Applying migration 0001..."
docker compose exec -T postgres psql -U myuser -d mydb \
  -f /docker-entrypoint-initdb.d/0001_init.sql

echo "Listing tables..."
docker compose exec -T postgres psql -U myuser -d mydb -c "\dt"

echo "Local DB validation complete."
