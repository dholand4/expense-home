#!/usr/bin/env bash
# Exemplos de uso da API via curl.
# Substitua BASE_URL, TOKEN, IDs conforme necessário.
#
# Requisito: jq instalado (opcional, apenas para pretty-print)
# Uso: bash docs/api-examples.sh

BASE_URL="http://localhost:3001/api"
TOKEN=""   # preencha após login

# ─── Auth ─────────────────────────────────────────────────────────────────────

echo "=== LOGIN ==="
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"change-me-in-production"}')
echo "$RESPONSE" | jq .
TOKEN=$(echo "$RESPONSE" | jq -r '.token')
echo "Token: $TOKEN"

echo ""
echo "=== REGISTER ==="
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123","full_name":"Alice"}' | jq .

echo ""
echo "=== GET ME ==="
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== INVITE (admin only) ==="
curl -s -X POST "$BASE_URL/auth/invite" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","full_name":"Bob","role":"user"}' | jq .

echo ""
echo "=== ACCEPT INVITE ==="
# Use the invite_token returned from /invite
curl -s -X POST "$BASE_URL/auth/accept-invite" \
  -H "Content-Type: application/json" \
  -d '{"token":"<paste-invite-token-here>","password":"newpassword123"}' | jq .

# ─── Users (admin) ────────────────────────────────────────────────────────────

echo ""
echo "=== LIST USERS ==="
curl -s "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== UPDATE USER ==="
curl -s -X PATCH "$BASE_URL/users/<user-id>" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}' | jq .

echo ""
echo "=== DELETE USER ==="
curl -s -X DELETE "$BASE_URL/users/<user-id>" \
  -H "Authorization: Bearer $TOKEN" -i

# ─── Cards ────────────────────────────────────────────────────────────────────

echo ""
echo "=== LIST CARDS ==="
curl -s "$BASE_URL/cards" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== CREATE CARD ==="
CARD=$(curl -s -X POST "$BASE_URL/cards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nubank","credit_limit":5000,"due_day":10}')
echo "$CARD" | jq .
CARD_ID=$(echo "$CARD" | jq -r '.id')

echo ""
echo "=== UPDATE CARD ==="
curl -s -X PATCH "$BASE_URL/cards/$CARD_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"credit_limit":6000}' | jq .

# ─── Bill Accounts ────────────────────────────────────────────────────────────

echo ""
echo "=== LIST BILL ACCOUNTS ==="
curl -s "$BASE_URL/bill-accounts" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== CREATE BILL ACCOUNT ==="
BILL=$(curl -s -X POST "$BASE_URL/bill-accounts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Conta corrente","description":"Bradesco","due_day":5}')
echo "$BILL" | jq .
BILL_ID=$(echo "$BILL" | jq -r '.id')

# ─── Expenses ─────────────────────────────────────────────────────────────────

echo ""
echo "=== LIST EXPENSES ==="
curl -s "$BASE_URL/expenses" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== CREATE EXPENSE (card, à vista) ==="
EXPENSE=$(curl -s -X POST "$BASE_URL/expenses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Supermercado\",\"total_amount\":350.00,\"installments\":1,\"first_charge_date\":\"2026-06-01\",\"payment_type\":\"avista\",\"category\":\"alimentacao\",\"source_type\":\"card\",\"source_id\":\"$CARD_ID\"}")
echo "$EXPENSE" | jq .
EXPENSE_ID=$(echo "$EXPENSE" | jq -r '.id')

echo ""
echo "=== CREATE EXPENSE (parcelado) ==="
curl -s -X POST "$BASE_URL/expenses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Notebook\",\"total_amount\":4800.00,\"installments\":12,\"first_charge_date\":\"2026-06-01\",\"payment_type\":\"parcelado\",\"category\":\"tecnologia\",\"source_type\":\"card\",\"source_id\":\"$CARD_ID\"}" | jq .

# ─── Installment Payments ─────────────────────────────────────────────────────

echo ""
echo "=== LIST INSTALLMENT PAYMENTS ==="
curl -s "$BASE_URL/installment-payments" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== LIST INSTALLMENT PAYMENTS (filter by month) ==="
curl -s "$BASE_URL/installment-payments?month_key=2026-06" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== CREATE INSTALLMENT PAYMENT ==="
curl -s -X POST "$BASE_URL/installment-payments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"expense_id\":\"$EXPENSE_ID\",\"installment_number\":1,\"paid_amount\":350.00,\"paid_date\":\"2026-06-10\",\"month_key\":\"2026-06\"}" | jq .

# ─── Card Invoice Payments ────────────────────────────────────────────────────

echo ""
echo "=== LIST CARD INVOICE PAYMENTS ==="
curl -s "$BASE_URL/card-invoice-payments?card_id=$CARD_ID&month_key=2026-06" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== CREATE CARD INVOICE PAYMENT ==="
curl -s -X POST "$BASE_URL/card-invoice-payments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"card_id\":\"$CARD_ID\",\"month_key\":\"2026-06\",\"paid_amount\":1200.00,\"paid_date\":\"2026-06-15\"}" | jq .

# ─── Running Debts ────────────────────────────────────────────────────────────

echo ""
echo "=== LIST RUNNING DEBTS ==="
curl -s "$BASE_URL/running-debts" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== CREATE RUNNING DEBT ==="
DEBT=$(curl -s -X POST "$BASE_URL/running-debts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Empréstimo pessoal","total_amount":10000,"amount_paid":2000,"notes":"Banco Inter"}')
echo "$DEBT" | jq .
DEBT_ID=$(echo "$DEBT" | jq -r '.id')

echo ""
echo "=== UPDATE RUNNING DEBT ==="
curl -s -X PATCH "$BASE_URL/running-debts/$DEBT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount_paid":3000}' | jq .

# ─── Shared Accesses ──────────────────────────────────────────────────────────

echo ""
echo "=== CREATE SHARED ACCESS (share my data with bob) ==="
SA=$(curl -s -X POST "$BASE_URL/shared-accesses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shared_with_email":"bob@example.com"}')
echo "$SA" | jq .
SA_ID=$(echo "$SA" | jq -r '.id')

echo ""
echo "=== LIST SHARED ACCESSES (as owner) ==="
curl -s "$BASE_URL/shared-accesses?owner_email=admin@example.com" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== ACCEPT SHARED ACCESS (as recipient) ==="
curl -s -X PATCH "$BASE_URL/shared-accesses/$SA_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}' | jq .

echo ""
echo "=== DELETE CARD (cascades expenses + payments) ==="
curl -s -X DELETE "$BASE_URL/cards/$CARD_ID" \
  -H "Authorization: Bearer $TOKEN" -i
