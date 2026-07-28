# expense-home — Backend

Node.js 20 + Express 4 + Prisma 6 + PostgreSQL.

Substitui completamente o Base44 como backend da aplicação expense-home.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 20 |
| PostgreSQL | 14 |
| npm | 9 |

---

## Configuração inicial

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Criar o arquivo `.env`

```bash
cp .env.example .env
```

Edite `.env`:

```env
DATABASE_URL="postgresql://postgres:suasenha@localhost:5432/expense_home"

ADMIN_EMAIL="admin@seudominio.com"
ADMIN_PASSWORD="senha-segura"
ADMIN_NAME="Admin"

PORT=3001
NODE_ENV=development

JWT_SECRET="troque-por-string-aleatoria-longa"
JWT_EXPIRES_IN="8h"

# Origens permitidas pelo CORS (separe por vírgula se necessário)
CORS_ORIGINS="http://localhost:5173"

# URL do frontend — usada no link de invite
FRONTEND_URL="http://localhost:5173"
```

---

## Banco de dados

### Criar schema e aplicar migrations

```bash
npm run db:migrate
# alias:
npm run prisma:migrate
```

### Gerar Prisma Client após mudanças no schema

```bash
npm run db:generate
```

### Seed — criar usuário admin padrão

```bash
npm run db:seed
# alias:
npm run prisma:seed
```

Usa `upsert` — pode ser rodado várias vezes.

### Resetar banco (⚠️ destrutivo — apaga todos os dados)

```bash
npm run db:reset
```

### Prisma Studio (interface visual)

```bash
npm run db:studio
```

---

## Iniciar o servidor

```bash
# desenvolvimento (reload automático)
npm run dev

# produção
npm start
```

Teste: `curl http://localhost:3001/health`

---

## Importar dados do Base44

```bash
npm run db:import -- caminho/para/export.json
```

Ver [scripts/import-base44.js](scripts/import-base44.js) para detalhes do formato JSON esperado.

---

## Exemplos de uso (curl)

```bash
bash docs/api-examples.sh
```

---

## Estrutura do projeto

```
backend/
├── prisma/
│   ├── schema.prisma           # 8 entidades do domínio financeiro
│   ├── seed.js                 # Admin padrão via ADMIN_EMAIL/PASSWORD/NAME
│   └── migrations/             # Geradas pelo Prisma
├── scripts/
│   └── import-base44.js        # Importa dados exportados do Base44
├── src/
│   ├── server.js               # Entry point — conecta DB e inicia Express
│   ├── app.js                  # Express factory (CORS, routes, error handler)
│   ├── config/
│   │   └── prisma.js           # Singleton do PrismaClient
│   ├── lib/
│   │   ├── asyncHandler.js     # Wrapper para controllers async
│   │   ├── errors.js           # Classes de erro HTTP customizadas
│   │   ├── format.js           # Normaliza registros Prisma para o frontend
│   │   └── sharedAccess.js     # Resolve IDs visíveis pelo usuário atual
│   ├── middlewares/
│   │   ├── auth.js             # Verifica JWT Bearer token
│   │   ├── requireAdmin.js     # Guarda de rotas admin-only
│   │   ├── validate.js         # Validação Zod do req.body
│   │   └── errorHandler.js     # Handler global de erros (Prisma + AppError)
│   ├── schemas/                # Zod schemas por entidade
│   ├── services/               # Lógica de negócio + queries Prisma
│   ├── controllers/            # Handlers HTTP (delegam para services)
│   └── routes/                 # Express routers por entidade
├── docs/
│   └── api-examples.sh         # Exemplos curl de todos os endpoints
├── .env.example
└── package.json
```

---

## Endpoints

### Auth

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login com email/senha, retorna JWT |
| POST | `/api/auth/register` | — | Cadastro de novo usuário |
| GET | `/api/auth/me` | ✅ | Dados do usuário autenticado |
| POST | `/api/auth/logout` | ✅ | Client-side (descarta token) |
| POST | `/api/auth/invite` | ✅ admin | Cria usuário convidado, retorna invite_token e invite_url |
| POST | `/api/auth/accept-invite` | — | Ativa conta com token de convite + senha |

### Users (admin only)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/users` | Lista todos os usuários |
| PATCH | `/api/users/:id` | Atualiza role / status / full_name |
| DELETE | `/api/users/:id` | Remove usuário |

### Recursos financeiros

Todos os endpoints abaixo requerem autenticação (`Authorization: Bearer <token>`).

**Cards** — `GET POST PATCH DELETE /api/cards/:id?`

**Bill Accounts** — `GET POST PATCH DELETE /api/bill-accounts/:id?`

**Expenses** — `GET POST PATCH DELETE /api/expenses/:id?`

**Installment Payments** — `GET POST DELETE /api/installment-payments/:id?`
- Filtros: `?month_key=yyyy-MM`, `?expense_id=uuid`

**Card Invoice Payments** — `GET POST PATCH DELETE /api/card-invoice-payments/:id?`
- Filtros: `?card_id=uuid`, `?month_key=yyyy-MM`

**Running Debts** — `GET POST PATCH DELETE /api/running-debts/:id?`

**Shared Accesses** — `GET POST PATCH DELETE /api/shared-accesses/:id?`
- Filtros: `?owner_email=email`, `?shared_with_email=email`

---

## Formato de resposta

Todos os registros retornam:

```json
{
  "id": "uuid",
  "created_by": "email-do-dono@example.com",
  "created_date": "2026-05-12T10:00:00.000Z",
  "updated_date": "2026-05-12T10:00:00.000Z",
  "...outros campos do recurso..."
}
```

- `created_by` é sempre o **e-mail** do criador (compatível com o frontend Base44)
- `created_date` / `updated_date` mapeiam `created_at` / `updated_at` do banco

---

## Regras de acesso

| Ação | Quem pode |
|---|---|
| Leitura de registros financeiros | Dono + usuários que receberam shared_access aceito |
| Criar / editar / deletar | Apenas o **dono** do registro (`created_by`) |
| Gerenciar usuários | Admin |
| Aceitar/rejeitar shared_access | Destinatário do compartilhamento |
| Revogar shared_access | Dono do compartilhamento |

O campo `created_by` é sempre preenchido pelo backend a partir do JWT — o frontend não pode forjá-lo.

---

## Cascades ao deletar

| Recurso deletado | O que é removido junto |
|---|---|
| Card | Todas as `expenses` do card + seus `installment_payments` + `card_invoice_payments` |
| Bill Account | Todas as `expenses` da conta + seus `installment_payments` |
| Expense | Todos os `installment_payments` da despesa |
