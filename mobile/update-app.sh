#!/usr/bin/env bash
set -e

MSG="${1:-Atualização do aplicativo}"

echo "=================================================="
echo "⚡ ATUALIZAÇÃO OVER-THE-AIR (SEM NOVO APK)"
echo "=================================================="
echo "Mensagem: $MSG"
echo ""

cd "$(dirname "$0")"

# 1. Enviar atualização OTA para os aparelhos que já têm o APK instalado
echo "🚀 Publicando atualização para o canal 'preview'..."
npx --yes eas-cli update --channel preview --message "$MSG"

echo ""
echo "✅ Atualização enviada com sucesso!"
echo "Ao abrir o aplicativo no celular, ele baixará a nova versão automaticamente."
