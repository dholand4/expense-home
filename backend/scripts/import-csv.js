/**
 * Import Base44 CSV exports into PostgreSQL.
 *
 * Usage:
 *   node scripts/import-csv.js <csv-folder>
 *
 * Example:
 *   node scripts/import-csv.js ./data/csvs
 *
 * Expected files inside <csv-folder>:
 *   Card_export.csv, BillAccount_export.csv, Expense_export.csv,
 *   InstallmentPayment_export.csv, CardInvoicePayment_export.csv,
 *   RunningDebt_export.csv
 *
 * The admin user (ADMIN_EMAIL in .env) must exist — run "npm run db:seed" first.
 * All records are assigned to that user.
 * Base44 ObjectIDs are mapped to UUIDs consistently so FK relations are preserved.
 *
 * Payment-type correction applied on import:
 *   - installments > 1  → parcelado  (Base44 often exported these as avista/empty)
 *   - installments = 1, payment_type = recorrente → recorrente
 *   - otherwise → avista
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import path from 'path';

config();

const prisma = new PrismaClient();

// ── ID mapping ───────────────────────────────────────────────────────────────
const idMap = new Map();
function uuid(base44Id) {
  if (!base44Id) return null;
  if (!idMap.has(base44Id)) idMap.set(base44Id, randomUUID());
  return idMap.get(base44Id);
}

// ── CSV parser ───────────────────────────────────────────────────────────────
function parseCsv(filePath) {
  const text = readFileSync(filePath, 'utf-8').replace(/\r/g, '');
  const lines = text.split('\n').filter(l => l.trim());
  const headers = splitLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] ?? '').trim(); });
    return obj;
  });
}

function splitLine(line) {
  const result = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur);
  return result;
}

function date(v) {
  if (!v) return null;
  // Date-only strings (YYYY-MM-DD) parse as UTC midnight in JS.
  // Storing at noon UTC avoids timezone-day shifts (noon ± 12h stays on same calendar day).
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + 'T12:00:00.000Z');
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

function decimal(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function int(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const csvDir = process.argv[2];
  if (!csvDir) {
    console.error('Usage: node scripts/import-csv.js <csv-folder>');
    console.error('Example: node scripts/import-csv.js ./data/csvs');
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error('ADMIN_EMAIL not set in .env');

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) throw new Error(`Admin user "${adminEmail}" not found — run "npm run db:seed" first`);
  const adminId = admin.id;
  console.log(`Admin: ${admin.email} (${adminId})\n`);

  const csv = (name) => path.join(csvDir, name);

  // Cards
  const cards = parseCsv(csv('Card_export.csv'));
  console.log(`Importing ${cards.length} cards...`);
  for (const r of cards) {
    await prisma.card.upsert({
      where: { id: uuid(r.id) },
      update: {},
      create: {
        id: uuid(r.id),
        name: r.name,
        credit_limit: decimal(r.credit_limit),
        due_day: int(r.due_day),
        created_by: adminId,
        created_at: date(r.created_date) ?? undefined,
        updated_at: date(r.updated_date) ?? undefined,
      },
    });
  }
  const importedCardUuids = new Set(cards.map(r => uuid(r.id)));
  console.log(`  ${cards.length} cards OK`);

  // Bill Accounts
  const bills = parseCsv(csv('BillAccount_export.csv'));
  console.log(`\nImporting ${bills.length} bill accounts...`);
  for (const r of bills) {
    await prisma.billAccount.upsert({
      where: { id: uuid(r.id) },
      update: {},
      create: {
        id: uuid(r.id),
        name: r.name,
        description: r.description || null,
        due_day: int(r.due_day),
        created_by: adminId,
        created_at: date(r.created_date) ?? undefined,
        updated_at: date(r.updated_date) ?? undefined,
      },
    });
  }
  const importedBillUuids = new Set(bills.map(r => uuid(r.id)));
  console.log(`  ${bills.length} bill accounts OK`);

  // Expenses
  const expenses = parseCsv(csv('Expense_export.csv'));
  console.log(`\nImporting ${expenses.length} expenses...`);
  const validCategories = new Set(['alimentacao','transporte','moradia','saude','educacao','lazer','vestuario','tecnologia','assinaturas','financiamento','emprestimo','pet','outros']);
  let expOk = 0; let expSkip = 0;
  const importedExpenseUuids = new Set();

  for (const r of expenses) {
    const sourceUuid = uuid(r.source_id);
    const sourceSet = r.source_type === 'card' ? importedCardUuids : importedBillUuids;
    if (!sourceUuid || !sourceSet.has(sourceUuid)) {
      console.warn(`  SKIP expense "${r.description}" — source not found (${r.source_type}:${r.source_id})`);
      expSkip++;
      continue;
    }
    const expId = uuid(r.id);
    const installments = int(r.installments) ?? 1;

    let payment_type;
    if (installments > 1) {
      payment_type = 'parcelado';
    } else if (r.payment_type === 'recorrente') {
      payment_type = 'recorrente';
    } else {
      payment_type = 'avista';
    }

    await prisma.expense.upsert({
      where: { id: expId },
      update: {},
      create: {
        id: expId,
        description: r.description,
        total_amount: decimal(r.total_amount),
        installments,
        first_charge_date: date(r.first_charge_date),
        payment_type,
        category: validCategories.has(r.category) ? r.category : null,
        source_type: r.source_type,
        source_id: sourceUuid,
        created_by: adminId,
        created_at: date(r.created_date) ?? undefined,
        updated_at: date(r.updated_date) ?? undefined,
      },
    });
    importedExpenseUuids.add(expId);
    expOk++;
  }
  console.log(`  ${expOk} OK, ${expSkip} skipped`);

  // Installment Payments
  const installmentRows = parseCsv(csv('InstallmentPayment_export.csv'));
  console.log(`\nImporting ${installmentRows.length} installment payments...`);
  let ipOk = 0; let ipSkip = 0;
  for (const r of installmentRows) {
    const expId = uuid(r.expense_id);
    if (!expId || !importedExpenseUuids.has(expId)) {
      console.warn(`  SKIP installment — expense not imported (${r.expense_id})`);
      ipSkip++;
      continue;
    }
    try {
      await prisma.installmentPayment.upsert({
        where: { id: uuid(r.id) },
        update: {},
        create: {
          id: uuid(r.id),
          expense_id: expId,
          installment_number: int(r.installment_number),
          paid_amount: decimal(r.paid_amount),
          paid_date: date(r.paid_date),
          month_key: r.month_key,
          created_by: adminId,
          created_at: date(r.created_date) ?? undefined,
          updated_at: date(r.updated_date) ?? undefined,
        },
      });
      ipOk++;
    } catch (e) {
      console.warn(`  SKIP installment ${r.id}: ${e.message}`);
      ipSkip++;
    }
  }
  console.log(`  ${ipOk} OK, ${ipSkip} skipped`);

  // Card Invoice Payments
  const invoices = parseCsv(csv('CardInvoicePayment_export.csv'));
  console.log(`\nImporting ${invoices.length} card invoice payments...`);
  let civOk = 0; let civSkip = 0;
  for (const r of invoices) {
    const cardId = uuid(r.card_id);
    if (!cardId || !importedCardUuids.has(cardId)) {
      console.warn(`  SKIP invoice — card not imported (${r.card_id})`);
      civSkip++;
      continue;
    }
    try {
      await prisma.cardInvoicePayment.upsert({
        where: { id: uuid(r.id) },
        update: {},
        create: {
          id: uuid(r.id),
          card_id: cardId,
          month_key: r.month_key,
          paid_amount: decimal(r.paid_amount),
          paid_date: date(r.paid_date),
          created_by: adminId,
          created_at: date(r.created_date) ?? undefined,
          updated_at: date(r.updated_date) ?? undefined,
        },
      });
      civOk++;
    } catch (e) {
      console.warn(`  SKIP invoice ${r.id}: ${e.message}`);
      civSkip++;
    }
  }
  console.log(`  ${civOk} OK, ${civSkip} skipped`);

  // Running Debts
  const debts = parseCsv(csv('RunningDebt_export.csv'));
  console.log(`\nImporting ${debts.length} running debts...`);
  for (const r of debts) {
    await prisma.runningDebt.upsert({
      where: { id: uuid(r.id) },
      update: {},
      create: {
        id: uuid(r.id),
        name: r.name,
        total_amount: decimal(r.total_amount),
        amount_paid: decimal(r.amount_paid) ?? 0,
        notes: r.notes || null,
        created_by: adminId,
        created_at: date(r.created_date) ?? undefined,
        updated_at: date(r.updated_date) ?? undefined,
      },
    });
  }
  console.log(`  ${debts.length} running debts OK`);

  console.log('\nImport complete!');
}

main()
  .catch(err => { console.error('\nImport failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
