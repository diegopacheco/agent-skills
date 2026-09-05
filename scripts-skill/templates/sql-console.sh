#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

DB_KIND=postgres
DB_NAME=app
DB_USER=app
DB_PASSWORD=app
DB_CONTAINER=app-postgres

port="$(service_port "$DB_KIND")"
[ -n "$port" ] || fail "$DB_KIND is not declared in scripts/ports.env"
port_up "$port" || fail "$DB_KIND is not running on $port, run ./scripts/start-all.sh first"

case "$DB_KIND" in
  postgres)
    if command -v psql >/dev/null 2>&1; then
      PGPASSWORD="$DB_PASSWORD" psql -h localhost -p "$port" -U "$DB_USER" -d "$DB_NAME" "$@"
    else
      podman exec -it "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" "$@"
    fi
    ;;
  mysql|mariadb)
    if command -v mysql >/dev/null 2>&1; then
      mysql -h 127.0.0.1 -P "$port" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" "$@"
    else
      podman exec -it "$DB_CONTAINER" mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" "$@"
    fi
    ;;
  redis|valkey)
    if command -v redis-cli >/dev/null 2>&1; then
      redis-cli -h localhost -p "$port" "$@"
    else
      podman exec -it "$DB_CONTAINER" redis-cli "$@"
    fi
    ;;
  mongodb)
    if command -v mongosh >/dev/null 2>&1; then
      mongosh "mongodb://localhost:$port/$DB_NAME" "$@"
    else
      podman exec -it "$DB_CONTAINER" mongosh "$DB_NAME" "$@"
    fi
    ;;
  *)
    fail "unsupported database $DB_KIND"
    ;;
esac
