#!/usr/bin/env bash
set -e

echo "=================================================="
echo "🚀 GERADOR DE APK ANDROID - DQ FINANÇAS"
echo "=================================================="
echo ""

cd "$(dirname "$0")"

# 1. Instalar dependências se necessário
if [ ! -d "node_modules/expo-updates" ]; then
  echo "📦 Instalando expo-updates..."
  npm install expo-updates@~29.0.17 --save
fi

# 2. Verificar login no EAS
echo "🔑 Verificando autenticação no Expo..."
npx --yes eas-cli whoami || {
  echo "Por favor, faça login na sua conta Expo:"
  npx --yes eas-cli login
}

# 3. Inicializar projeto EAS caso ainda não tenha projectId no app.json
echo "⚙️ Configurando projeto no EAS..."
npx --yes eas-cli project:init

# 4. Iniciar build do APK Android na nuvem do Expo
echo ""
echo "📱 Iniciando a compilação do APK Android (Perfil Preview com Supabase)..."
echo "A nuvem do Expo irá compilar o APK e fornecer um link direto e QR Code para download."
echo ""
npx --yes eas-cli build --platform android --profile preview

echo ""
echo "✅ Concluído com sucesso! Baixe e instale o APK no seu celular."
