#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

trap "echo 'Encerrando processos...'; kill 0" INT TERM EXIT

echo "Iniciando backend (porta 3001) e frontend (porta 3000)..."

(cd "${ROOT_DIR}/backend" && npm run dev) &
BACKEND_PID=$!

(cd "${ROOT_DIR}/frontend" && npm run dev) &
FRONTEND_PID=$!

wait "${BACKEND_PID}" "${FRONTEND_PID}"
