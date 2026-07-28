/**
 * fix-and-import.js
 *
 * Regra do sistema:
 *  - Despesas source_type='card'       → pagamento via CardInvoicePayment (nunca InstallmentPayment)
 *  - Despesas source_type='bill_account' → pagamento via InstallmentPayment
 *
 * O que este script faz:
 *  1. Lê o backup original
 *  2. Remove TODOS os InstallmentPayments de despesas de cartão
 *  3. Garante CardInvoicePayment para cada cartão com gastos em 2026-05
 *  4. Garante InstallmentPayments apenas para despesas bill_account em 2026-05
 *  5. Limpa o banco e reimporta
 *
 * Uso: node scripts/fix-and-import.js <arquivo-backup.json>
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { randomUUID } from 'crypto';
import prisma from '../src/config/prisma.js';

const filePath = process.argv[2];
if (!filePath) {
  console.error('❌ Informe o caminho do backup: node scripts/fix-and-import.js <arquivo.json>');
  process.exit(1);
}

const backup = JSON.parse(readFileSync(resolve(filePath), 'utf-8'));

const TARGET_MONTH = '2026-05';
const [TY, TM] = TARGET_MONTH.split('-').map(Number);
const PAID_DATE  = '2026-05-12T00:00:00.000Z';
const NOW        = new Date().toISOString();
const USER_ID    = '95abe113-911d-45da-a35c-73b8afc5deff';

function monthDiff(isoDate) {
  const d = new Date(isoDate);
  return (TY - d.getUTCFullYear()) * 12 + (TM - (d.getUTCMonth() + 1));
}
function round2(n) { return Math.round(n * 100) / 100; }

const expenses    = backup.Expense          ?? [];
const existingIPs = backup.InstallmentPayment ?? [];
const existingCIPs = backup.CardInvoicePayment ?? [];
const cards       = backup.Card             ?? [];

// ─── Passo 1: Monta conjunto de IDs de despesas de cartão ─────────────────────
const cardExpenseIds = new Set(
  expenses.filter(e => e.source_type === 'card').map(e => e.id)
);

// ─── Passo 2: Remove InstallmentPayments de despesas de cartão ────────────────
const cleanedIPs = existingIPs.filter(ip => !cardExpenseIds.has(ip.expense_id));
const removedCount = existingIPs.length - cleanedIPs.length;
console.log(`🗑️  InstallmentPayments de cartão removidos: ${removedCount}`);

// ─── Passo 3: Garante InstallmentPayments para bill_account em maio ───────────
const ipIndex = {};
for (const ip of cleanedIPs) {
  if (!ipIndex[ip.expense_id]) ipIndex[ip.expense_id] = new Set();
  ipIndex[ip.expense_id].add(ip.month_key);
}

const newIPs = [];
for (const exp of expenses) {
  if (exp.source_type !== 'bill_account') continue; // cartão → nunca InstallmentPayment

  const diff = monthDiff(exp.first_charge_date);
  let instNumber;

  if (exp.payment_type === 'avista') {
    if (diff !== 0) continue;
    instNumber = 1;
  } else if (exp.payment_type === 'parcelado') {
    if (diff < 0 || diff >= exp.installments) continue;
    instNumber = diff + 1;
  } else { // recorrente
    if (diff < 0) continue;
    instNumber = diff + 1;
  }

  if (ipIndex[exp.id]?.has(TARGET_MONTH)) continue; // já existe

  const paidAmount =
    exp.payment_type === 'parcelado'
      ? round2(Number(exp.total_amount) / exp.installments)
      : Number(exp.total_amount);

  newIPs.push({
    id: randomUUID(),
    expense_id: exp.id,
    installment_number: instNumber,
    paid_amount: String(paidAmount),
    paid_date: PAID_DATE,
    month_key: TARGET_MONTH,
    created_by: USER_ID,
    created_at: NOW,
    updated_at: NOW,
  });
  if (!ipIndex[exp.id]) ipIndex[exp.id] = new Set();
  ipIndex[exp.id].add(TARGET_MONTH);
}
console.log(`✅ InstallmentPayments bill_account adicionados: ${newIPs.length}`);

// ─── Passo 4: Garante CardInvoicePayment para cartões com gastos em maio ──────
const cipIndex = {};
for (const cip of existingCIPs) {
  if (!cipIndex[cip.card_id]) cipIndex[cip.card_id] = new Set();
  cipIndex[cip.card_id].add(cip.month_key);
}

const newCIPs = [];
for (const card of cards) {
  if (cipIndex[card.id]?.has(TARGET_MONTH)) continue;

  let total = 0;
  for (const exp of expenses) {
    if (exp.source_id !== card.id || exp.source_type !== 'card') continue;
    const diff = monthDiff(exp.first_charge_date);
    let hasCharge = false;
    if      (exp.payment_type === 'avista'    && diff === 0)                            hasCharge = true;
    else if (exp.payment_type === 'parcelado' && diff >= 0 && diff < exp.installments) hasCharge = true;
    else if (exp.payment_type === 'recorrente' && diff >= 0)                            hasCharge = true;
    if (!hasCharge) continue;

    const parcela = exp.payment_type === 'parcelado'
      ? round2(Number(exp.total_amount) / exp.installments)
      : Number(exp.total_amount);
    total = round2(total + parcela);
  }

  if (total === 0) continue;

  const dueDay   = String(card.due_day).padStart(2, '0');
  const paidDate = `${TARGET_MONTH}-${dueDay}T00:00:00.000Z`;

  newCIPs.push({
    id: randomUUID(),
    card_id: card.id,
    month_key: TARGET_MONTH,
    paid_amount: String(total),
    paid_date: paidDate,
    created_by: USER_ID,
    created_at: NOW,
    updated_at: NOW,
  });
  console.log(`💳 CardInvoicePayment gerado: ${card.name} → R$ ${total}`);
}

// ─── Monta backup corrigido ────────────────────────────────────────────────────
const fixedBackup = {
  ...backup,
  InstallmentPayment: [...cleanedIPs, ...newIPs],
  CardInvoicePayment: [...existingCIPs, ...newCIPs],
};

const fixedPath = resolve(filePath).replace('.json', '-fixed.json');
writeFileSync(fixedPath, JSON.stringify(fixedBackup, null, 2), 'utf-8');
console.log(`\n📄 Backup corrigido: ${fixedPath}`);
console.log(`   InstallmentPayments: ${fixedBackup.InstallmentPayment.length}`);
console.log(`   CardInvoicePayments: ${fixedBackup.CardInvoicePayment.length}`);

// ─── Importação ────────────────────────────────────────────────────────────────
async function importBackup(bk) {
  console.log('\n🧹 Limpando banco...');
  await prisma.sharedAccess.deleteMany();
  await prisma.installmentPayment.deleteMany();
  await prisma.cardInvoicePayment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.card.deleteMany();
  await prisma.billAccount.deleteMany();
  await prisma.runningDebt.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Banco limpo.\n');

  const users = bk.User ?? [];
  await prisma.user.createMany({ data: users });
  console.log(`👤 users:                   ${users.length}`);

  const cds = bk.Card ?? [];
  await prisma.card.createMany({ data: cds.map(c => ({ ...c, credit_limit: Number(c.credit_limit) })) });
  console.log(`💳 cards:                   ${cds.length}`);

  const bas = bk.BillAccount ?? [];
  await prisma.billAccount.createMany({ data: bas });
  console.log(`📄 bill_accounts:           ${bas.length}`);

  const exps = bk.Expense ?? [];
  await prisma.expense.createMany({ data: exps.map(e => ({ ...e, total_amount: Number(e.total_amount) })) });
  console.log(`💸 expenses:                ${exps.length}`);

  const ips = bk.InstallmentPayment ?? [];
  await prisma.installmentPayment.createMany({
    data: ips.map(i => ({ ...i, paid_amount: Number(i.paid_amount) })),
  });
  console.log(`📅 installment_payments:    ${ips.length}`);

  const cips = bk.CardInvoicePayment ?? [];
  await prisma.cardInvoicePayment.createMany({
    data: cips.map(i => ({ ...i, paid_amount: Number(i.paid_amount) })),
  });
  console.log(`🧾 card_invoice_payments:   ${cips.length}`);

  const debts = bk.RunningDebt ?? [];
  await prisma.runningDebt.createMany({
    data: debts.map(d => ({ ...d, total_amount: Number(d.total_amount), amount_paid: Number(d.amount_paid) })),
  });
  console.log(`💰 running_debts:           ${debts.length}`);

  const acc = bk.SharedAccess ?? [];
  if (acc.length) await prisma.sharedAccess.createMany({ data: acc });
  console.log(`🤝 shared_accesses:         ${acc.length}`);

  console.log('\n✅ Importação concluída!');
  console.log('   Cartões de crédito: limite calculado apenas via CardInvoicePayment ✓');
}

importBackup(fixedBackup)
  .catch(e => { console.error('❌ Erro:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
