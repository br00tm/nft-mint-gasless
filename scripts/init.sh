#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Instalando dependências do projeto..."

for dir in contracts backend frontend; do
  echo ""
  echo "▶ ${dir}"
  (cd "${ROOT_DIR}/${dir}" && npm install)
done

echo ""
echo "Dependências instaladas com sucesso."
