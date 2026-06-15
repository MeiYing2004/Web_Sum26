#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Install dependencies"
npm install

echo "==> Build all workspaces"
npm run build

echo "==> Production tests (Redis required)"
npm run test:production || echo "WARN: tests skipped or failed — ensure Redis is running"

echo "==> Docker build & up"
docker compose build
docker compose up -d

echo "==> Wait for platform health"
sleep 15
curl -sf http://localhost:8080/health | head -c 2000 || true

echo ""
echo "Done. Web: http://localhost:3000 | GraphQL: http://localhost:8080/graphql | Health: http://localhost:8080/health"
