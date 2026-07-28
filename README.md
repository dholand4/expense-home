# expense-home

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

> Aplicação full-stack de gestão financeira pessoal — controle de despesas, cartões, boletos, parcelamentos e fiados com suporte a múltiplos usuários via convites. Disponível na web e como aplicativo mobile (iOS/Android).

---

## Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Como rodar](#-como-rodar)
- [Mobile (Expo)](#-mobile-expo)
- [Banco de dados](#-banco-de-dados)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Scripts disponíveis](#-scripts-disponíveis)

---

## Sobre

O **expense-home** é um sistema de controle financeiro pessoal. O usuário registra despesas por cartão ou conta/boleto, acompanha parcelas, monitora faturas futuras e controla dívidas em andamento. O admin pode convidar outras pessoas para compartilhar acesso aos dados via link de convite.

---

## ✨ Funcionalidades

**Dashboard**
- 📊 Resumo mensal com totais por fonte de pagamento
- 📈 Gráficos de gastos por categoria
- ✅ Status de pagamento por cartão e conta (tudo pago / pendente / parcial)

**Lançamentos**
- 💸 Cadastro de despesas avista, parceladas e recorrentes
- 🏷️ 13 categorias (alimentação, transporte, moradia, saúde, educação, lazer, etc.)
- ✏️ Edição e exclusão de despesas com cascata nas parcelas

**Fontes de pagamento**
- 💳 Gerenciamento de cartões de crédito com limite e dia de vencimento
- 📄 Contas e boletos com dia de vencimento

**Parcelas e faturas**
- 📅 Registro de pagamentos por parcela com `month_key`
- 🧾 Pagamento de fatura mensal do cartão

**Próximas faturas**
- 🔮 Previsão de cobranças por mês

**Dívidas**
- 💰 Controle de empréstimos e dívidas com progresso de pagamento

**Acesso compartilhado**
- 📧 Convide outras pessoas para visualizar seus dados
- 🔗 Link de convite gerado pelo admin sem precisar de SMTP

**Painel admin**
- 👥 Gerenciamento de usuários (criar, desativar, convidar)

---

## Arquitetura

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)           │
│  /                 → Dashboard              │
│  /lancamentos      → Despesas               │
│  /fontes           → Cartões e Contas       │
│  /proximas-faturas → Próximas cobranças     │
│  /dividas          → Dívidas                │
│  /perfil           → Perfil do usuário      │
│  /login            → Autenticação           │
│  /accept-invite    → Aceitar convite        │
└─────────────────────┬───────────────────────┘
                      │ HTTP + Bearer JWT
┌─────────────────────▼───────────────────────┐
│           Backend (Node.js + Express)       │
│  /api/auth                 → autenticação   │
│  /api/cards                → cartões        │
│  /api/bill-accounts        → contas         │
│  /api/expenses             → despesas       │
│  /api/installment-payments → parcelas       │
│  /api/card-invoice-payments → faturas       │
│  /api/running-debts        → dívidas        │
│  /api/shared-accesses      → compartilhado  │
│  /api/users                → admin          │
└─────────────────────┬───────────────────────┘
                      │ Prisma ORM
┌─────────────────────▼───────────────────────┐
│              PostgreSQL 14+                 │
│  8 entidades + 5 enums                      │
└─────────────────────────────────────────────┘
```

### Estrutura de pastas

```
expense-home/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # schema do banco (8 entidades)
│   │   ├── seed.js             # cria usuário admin
│   │   └── migrations/         # histórico de migrations
│   ├── scripts/
│   │   └── export-data.js      # exportação de backup JSON
│   ├── src/
│   │   ├── config/             # singleton Prisma Client
│   │   ├── controllers/        # handlers HTTP por entidade
│   │   ├── services/           # lógica de negócio + queries
│   │   ├── routes/             # definição de rotas Express
│   │   ├── middlewares/        # auth JWT, validação Zod, erros
│   │   ├── schemas/            # schemas Zod por entidade
│   │   └── lib/                # utilitários (format, errors, etc.)
│   └── docs/
│       └── api-examples.sh     # exemplos curl de todos os endpoints
├── frontend/
│   └── src/
│       ├── api/                # httpClient com Bearer token
│       ├── components/         # componentes reutilizáveis + Radix UI
│       ├── pages/              # páginas por rota
│       ├── services/           # abstrações de chamadas à API
│       ├── lib/                # AuthContext, React Query config
│       └── utils/              # cálculos financeiros, formatação
└── mobile/
    └── src/
        ├── @types/             # tipagens globais TypeScript
        ├── assets/             # imagens, fontes e ícones locais
        ├── components/         # componentes reutilizáveis (buttonGlobal, inputGlobal, etc.)
        ├── constants/          # tema de cores e valores fixos
        ├── hooks/              # hooks de dados e autenticação
        ├── providers/          # contexto global (profileProvider com animação)
        ├── routes/             # AppStack, AuthStack, CustomTabBar
        ├── services/           # chamadas à API por entidade
        ├── utils/              # formatação e cálculos
        └── view/               # telas (loginScreen, dashboardScreen, etc.)
```

---

## Tecnologias

### Backend
| Tecnologia | Uso |
|------------|-----|
| Node.js 20 + Express 4 | Servidor e API REST |
| PostgreSQL 14+ | Banco de dados relacional |
| Prisma 6 | ORM e migrations |
| JWT + bcrypt | Autenticação e senhas |
| Zod | Validação de dados |

### Frontend (Web)
| Tecnologia | Uso |
|------------|-----|
| React 18 | Interface do usuário |
| React Router v6 | Roteamento SPA |
| TanStack React Query | Cache e sincronização de estado servidor |
| TailwindCSS 3 + Radix UI | Estilização e componentes headless |
| Recharts | Gráficos e visualizações |
| React Hook Form | Gerenciamento de formulários |
| Lucide React | Ícones |
| Framer Motion | Animações |
| jsPDF + html2canvas | Exportação em PDF |

### Mobile (React Native)
| Tecnologia | Uso |
|------------|-----|
| React Native 0.81.5 + Expo SDK 54 | Base do aplicativo iOS/Android |
| TypeScript | Tipagem estática |
| styled-components v6 | Estilização com tema de tokens |
| React Navigation 6 | Navegação (tab bar + stacks) |
| @react-navigation/material-top-tabs | Swipe horizontal entre abas |
| React Hook Form + Zod | Formulários com validação |
| AsyncStorage | Persistência do token JWT |
| Expo Vector Icons (Ionicons) | Ícones |
| react-native-safe-area-context | Espaçamento correto em Android/iOS |

---

## Como rodar

### Pré-requisitos

- Node.js 20+
- PostgreSQL 14+
- npm 10+

### Backend

```bash
# Entrar na pasta
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais (veja seção de variáveis abaixo)

# Criar as tabelas no banco
npm run db:migrate
# Quando solicitado, dê um nome para a migration (ex: init)

# Criar o usuário administrador
npm run db:seed

# Iniciar o servidor
npm run dev
```

O servidor sobe em `http://localhost:3001`.

### Frontend

```bash
# Entrar na pasta
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local

# Iniciar
npm run dev
```

A aplicação abre em `http://localhost:5173`.

---

## 📱 Mobile (Expo)

### Pré-requisitos

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- App **Expo Go** no celular (iOS ou Android) — ou emulador configurado

### Rodar o app

```bash
# Entrar na pasta
cd mobile

# Instalar dependências
npm install

# Configurar variável de ambiente
cp .env.example .env
# Edite o .env com a URL da sua API

# Iniciar o servidor Expo
npx expo start
```

Escaneie o QR Code com o Expo Go ou pressione `a` (Android) / `i` (iOS) para abrir no emulador.

### Variável de ambiente — `.env`

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3001/api
```

> Use o IP local da sua máquina (não `localhost`) para o celular físico conseguir acessar o backend.

### Funcionalidades do app mobile

| Tela | Descrição |
|------|-----------|
| Login / Registro | Transição animada sem flash, olhinho na senha |
| Dashboard | Resumo mensal, navegação por mês, cards de categoria com barra de progresso |
| Fontes | Cartões e contas com edição e exclusão |
| Lançamentos | Despesas avista e parceladas (2 modos de entrada) |
| Faturas | Próximas cobranças com navegação por mês |
| Fiados | Controle de dívidas com progresso de pagamento |
| Perfil | Acessos compartilhados, painel admin, logout com confirmação |

### Destaques técnicos

- Tab bar 100% customizada com ícones e labels
- Perfil como overlay animado (`Animated.Value` + `Easing.poly`) — sem flash ao navegar
- Transição Login ↔ Registro via `Animated.View` lateral — sem Stack nativo entre as telas
- `confirmModalGlobal` substituindo `Alert.alert` em todas as ações destrutivas
- Picker de categoria flutuante com scroll
- Limite de cartão disponível em tempo real (descontando gastos do mês)

---

## 🗄️ Banco de dados

### Entidades

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários e autenticação |
| `cards` | Cartões de crédito |
| `bill_accounts` | Contas e boletos |
| `expenses` | Despesas (avista, parcelado, recorrente) |
| `installment_payments` | Pagamentos de parcelas individuais |
| `card_invoice_payments` | Pagamentos de fatura do cartão |
| `running_debts` | Dívidas em andamento |
| `shared_accesses` | Convites de acesso compartilhado |

### Comandos úteis

```bash
# Abrir interface visual do banco
npm run db:studio

# Resetar tudo e recriar (⚠️ apaga os dados)
npm run db:reset

# Exportar backup completo em JSON
npm run db:export
```

---

## ⚙️ Variáveis de ambiente

### Backend — `.env`

```env
# Conexão com o banco de dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/expense_home

# Segredo para assinar tokens JWT (use uma string longa e aleatória)
JWT_SECRET=seu-segredo-aqui

# Usuário administrador criado no seed
ADMIN_EMAIL=seu@email.com
ADMIN_PASSWORD=sua-senha
ADMIN_NAME=Seu Nome

# URL do frontend (usada para gerar links de convite)
FRONTEND_URL=http://localhost:5173

# Origens permitidas no CORS (separe por vírgula se houver mais de uma)
CORS_ORIGINS=http://localhost:5173
```

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `DATABASE_URL` | ✅ | String de conexão PostgreSQL |
| `JWT_SECRET` | ✅ | Segredo para assinar tokens JWT |
| `ADMIN_EMAIL` | ✅ | E-mail do admin criado no seed |
| `ADMIN_PASSWORD` | ✅ | Senha do admin criado no seed |
| `ADMIN_NAME` | ✅ | Nome do admin criado no seed |
| `FRONTEND_URL` | ✅ | URL do frontend (links de convite) |
| `CORS_ORIGINS` | ❌ | Origens CORS permitidas (padrão: `FRONTEND_URL`) |
| `PORT` | ❌ | Porta do servidor (padrão: `3001`) |

### Frontend — `.env.local`

```env
VITE_API_URL=http://localhost:3001/api
```

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `VITE_API_URL` | ✅ | URL base da API backend |

---

## 📋 Scripts disponíveis

### Backend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor com hot-reload |
| `npm start` | Servidor em produção |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Cria/atualiza as tabelas |
| `npm run db:seed` | Cria o usuário admin |
| `npm run db:reset` | ⚠️ Apaga tudo e recria o banco |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run db:export` | Exporta todos os dados para JSON |

### Frontend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server com HMR |
| `npm run build` | Build de produção |
| `npm run preview` | Visualiza o build localmente |
| `npm run lint` | Verifica erros de lint |
| `npm run typecheck` | Verifica tipos TypeScript |

### Mobile

| Comando | Descrição |
|---------|-----------|
| `npx expo start` | Inicia o servidor Expo (QR Code) |
| `npx expo start --android` | Abre direto no emulador Android |
| `npx expo start --ios` | Abre direto no simulador iOS |
| `npx expo build` | Gera build nativo (EAS Build) |

