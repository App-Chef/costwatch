#!/usr/bin/env bash
# Runs the migrations, seed and RLS tests against a PostgreSQL database.
#
#   DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres ./supabase/tests/run.sh
#
# Without DATABASE_URL, a throwaway local cluster is created with initdb
# (requires PostgreSQL 15+ server binaries on PATH or in /usr/lib/postgresql).
# The target database is dropped and recreated, so never point this at a real
# Supabase project.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DB_NAME="costwatch_test"
TMP=""

cleanup() {
  if [[ -n "$TMP" ]]; then
    pg_ctl -D "$TMP/data" -m immediate stop >/dev/null 2>&1 || true
    rm -rf "$TMP"
  fi
}
trap cleanup EXIT

if [[ -z "${DATABASE_URL:-}" ]]; then
  if ! command -v initdb >/dev/null 2>&1; then
    PG_BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
    [[ -n "$PG_BIN" ]] && export PATH="$PG_BIN:$PATH"
  fi
  command -v initdb >/dev/null || { echo "initdb not found; set DATABASE_URL instead." >&2; exit 1; }

  TMP="$(mktemp -d)"
  PORT="${PGPORT_TEST:-54329}"
  initdb -D "$TMP/data" -U postgres --auth=trust >/dev/null
  # TCP on localhost only: socket paths inside deep temp dirs can exceed the OS limit.
  pg_ctl -D "$TMP/data" -o "-p $PORT -c listen_addresses=localhost -c unix_socket_directories=''" \
    -l "$TMP/log" -w start >/dev/null || { cat "$TMP/log" >&2; exit 1; }
  ADMIN_URL="postgresql://postgres@localhost:$PORT/postgres"
  TEST_URL="postgresql://postgres@localhost:$PORT/$DB_NAME"
else
  ADMIN_URL="$DATABASE_URL"
  TEST_URL="${DATABASE_URL%/*}/$DB_NAME"
fi

PSQL=(psql -X -q -v ON_ERROR_STOP=1)

"${PSQL[@]}" "$ADMIN_URL" -c "set client_min_messages = warning" -c "drop database if exists $DB_NAME" -c "create database $DB_NAME" >/dev/null

echo "→ Supabase stub"
"${PSQL[@]}" "$TEST_URL" -f "$ROOT/supabase/tests/supabase_stub.sql" >/dev/null

for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "→ $(basename "$f")"
  "${PSQL[@]}" "$TEST_URL" -f "$f" >/dev/null
done

echo "→ seed.sql"
"${PSQL[@]}" "$TEST_URL" -f "$ROOT/supabase/seed.sql" >/dev/null
"${PSQL[@]}" "$TEST_URL" -c "delete from auth.users" >/dev/null

echo "→ rls.test.sql"
"${PSQL[@]}" "$TEST_URL" -f "$ROOT/supabase/tests/rls.test.sql" 2>&1 | sed 's/^psql:[^ ]* NOTICE:  /  /'
