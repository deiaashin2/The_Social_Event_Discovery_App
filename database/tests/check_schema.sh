#!/usr/bin/env bash
set -euo pipefail

# Ensure schema/migration files exist and are not empty
test -s database/schema.sql
test -s database/migrations/0001_init.sql

# Ensure key tables exist in schema text (basic validation)
grep -qi "create table.*users" database/schema.sql
grep -qi "create table.*events" database/schema.sql

echo "DB schema validation passed."
