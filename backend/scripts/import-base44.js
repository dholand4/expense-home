/**
 * Import Base44 exported data into the PostgreSQL database.
 *
 * Usage:
 *   node scripts/import-base44.js <path-to-export.json>
 *
 * The JSON file must contain one or more of these top-level arrays:
 *   User, Card, BillAccount, Expense, InstallmentPayment,
 *   CardInvoicePayment, RunningDebt, SharedAccess
 *
 * Import order is enforced to satisfy FK constraints:
 *   User → Card/BillAccount → Expense → InstallmentPayment
 *                                      → CardInvoicePayment
 *                           → RunningDebt → SharedAccess
 *
 * IDs present in the JSON are preserved so existing relationships survive.
 * If a record with the same id already exists it is skipped (upsert via
 * createMany skipDuplicates).
 *
 * Users referenced only by email in other entities are auto-created as
 * placeholder accounts so FK constraints are satisfied. They receive a
 * random unusable password hash and status = invited.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────────

function toSnake(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const snake = k.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[snake] = v;
  }
  return result;
}

function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function parseDecimal(val) {
  if (val === undefined || val === null) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function parseIntSafe(val) {
  if (val === undefined || val === null) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

// email -> User.id  (populated while importing users, lazily created for orphans)
const emailToId = new Map();

async function resolveUserId(emailOrId) {
  if (!emailOrId) return null;

  // Already a UUID-shaped string — could be a real user id
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRe.test(emailOrId)) {
    const exists = await prisma.user.findUnique({ where: { id: emailOrId } });
    if (exists) return emailOrId;
  }

  // Treat it as an email
  const email = emailOrId;
  if (emailToId.has(email)) return emailToId.get(email);

  // Auto-create placeholder user so FKs are satisfied
  const fakeHash = await bcrypt.hash(randomUUID(), 4);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password_hash: fakeHash,
      role: 'user',
      status: 'invited',
    },
  });
  emailToId.set(email, user.id);
  console.log(`  [auto-created placeholder user] ${email} → ${user.id}`);
  return user.id;
}

// ─── importers ────────────────────────────────────────────────────────────────

async function importUsers(rows) {
  console.log(`\nImporting ${rows.length} User(s)...`);
  let ok = 0;
  let skip = 0;

  for (const raw of rows) {
    const r = toSnake(raw);
    const email = r.email;
    if (!email) { console.warn('  Skipping user without email'); skip++; continue; }

    const id = r.id || randomUUID();
    const passwordHash = r.password_hash || r.passwordhash || await bcrypt.hash(randomUUID(), 4);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        full_name: r.full_name || null,
        role: r.role ?? 'user',
        status: r.status ?? 'active',
      },
      create: {
        id,
        email,
        full_name: r.full_name || null,
        password_hash: passwordHash,
        role: r.role ?? 'user',
        status: r.status ?? 'active',
        created_at: parseDate(r.created_at) ?? undefined,
        updated_at: parseDate(r.updated_at) ?? undefined,
      },
    });
    emailToId.set(email, user.id);
    ok++;
  }
  console.log(`  done — ${ok} upserted, ${skip} skipped`);
}

async function importCards(rows) {
  console.log(`\nImporting ${rows.length} Card(s)...`);
  let ok = 0; let skip = 0;

  for (const raw of rows) {
    const r = toSnake(raw);
    const created_by = await resolveUserId(r.created_by);
    if (!created_by) { console.warn('  Skipping card without created_by'); skip++; continue; }

    const credit_limit = parseDecimal(r.credit_limit);
    const due_day = parseIntSafe(r.due_day);
    if (!r.name || credit_limit === null || due_day === null) {
      console.warn(`  Skipping card "${r.name}" — missing required fields`); skip++; continue;
    }

    await prisma.card.upsert({
      where: { id: r.id || randomUUID() },
      update: { name: r.name, credit_limit, due_day, created_by },
      create: {
        id: r.id || randomUUID(),
        name: r.name,
        credit_limit,
        due_day,
        created_by,
        created_at: parseDate(r.created_at) ?? undefined,
        updated_at: parseDate(r.updated_at) ?? undefined,
      },
    });
    ok++;
  }
  console.log(`  done — ${ok} upserted, ${skip} skipped`);
}

async function importBillAccounts(rows) {
  console.log(`\nImporting ${rows.length} BillAccount(s)...`);
  let ok = 0; let skip = 0;

  for (const raw of rows) {
    const r = toSnake(raw);
    const created_by = await resolveUserId(r.created_by);
    if (!created_by || !r.name) { console.warn('  Skipping bill_account — missing fields'); skip++; continue; }

    await prisma.billAccount.upsert({
      where: { id: r.id || randomUUID() },
      update: { name: r.name, description: r.description || null, due_day: parseIntSafe(r.due_day), created_by },
      create: {
        id: r.id || randomUUID(),
        name: r.name,
        description: r.description || null,
        due_day: parseIntSafe(r.due_day),
        created_by,
        created_at: parseDate(r.created_at) ?? undefined,
        updated_at: parseDate(r.updated_at) ?? undefined,
      },
    });
    ok++;
  }
  console.log(`  done — ${ok} upserted, ${skip} skipped`);
}

async function importExpenses(rows) {
  console.log(`\nImporting ${rows.length} Expense(s)...`);
  let ok = 0; let skip = 0;

  for (const raw of rows) {
    const r = toSnake(raw);
    const created_by = await resolveUserId(r.created_by);
    const total_amount = parseDecimal(r.total_amount);
    const installments = parseIntSafe(r.installments) ?? 1;
    const first_charge_date = parseDate(r.first_charge_date);
    const source_id = r.source_id;
    const source_type = r.source_type;

    if (!created_by || total_amount === null || !first_charge_date || !source_id || !source_type) {
      console.warn(`  Skipping expense "${r.description}" — missing required fields`); skip++; continue;
    }

    const validSourceTypes = ['card', 'bill_account'];
    if (!validSourceTypes.includes(source_type)) {
      console.warn(`  Skipping expense "${r.description}" — invalid source_type "${source_type}"`); skip++; continue;
    }

    const validCategories = ['alimentacao','transporte','moradia','saude','educacao','lazer','vestuario','tecnologia','assinaturas','financiamento','emprestimo','pet','outros'];
    const category = validCategories.includes(r.category) ? r.category : null;

    const validPaymentTypes = ['avista', 'parcelado', 'recorrente'];
    const payment_type = validPaymentTypes.includes(r.payment_type) ? r.payment_type : 'avista';

    await prisma.expense.upsert({
      where: { id: r.id || randomUUID() },
      update: { description: r.description, total_amount, installments, first_charge_date, payment_type, category, source_type, source_id, created_by },
      create: {
        id: r.id || randomUUID(),
        description: r.description,
        total_amount,
        installments,
        first_charge_date,
        payment_type,
        category,
        source_type,
        source_id,
        created_by,
        created_at: parseDate(r.created_at) ?? undefined,
        updated_at: parseDate(r.updated_at) ?? undefined,
      },
    });
    ok++;
  }
  console.log(`  done — ${ok} upserted, ${skip} skipped`);
}

async function importInstallmentPayments(rows) {
  console.log(`\nImporting ${rows.length} InstallmentPayment(s)...`);
  let ok = 0; let skip = 0;

  for (const raw of rows) {
    const r = toSnake(raw);
    const created_by = await resolveUserId(r.created_by);
    const paid_amount = parseDecimal(r.paid_amount);
    const paid_date = parseDate(r.paid_date);
    const installment_number = parseIntSafe(r.installment_number);

    if (!created_by || !r.expense_id || paid_amount === null || !paid_date || !r.month_key || installment_number === null) {
      console.warn('  Skipping installment_payment — missing required fields'); skip++; continue;
    }

    await prisma.installmentPayment.upsert({
      where: { id: r.id || randomUUID() },
      update: { expense_id: r.expense_id, installment_number, paid_amount, paid_date, month_key: r.month_key, created_by },
      create: {
        id: r.id || randomUUID(),
        expense_id: r.expense_id,
        installment_number,
        paid_amount,
        paid_date,
        month_key: r.month_key,
        created_by,
        created_at: parseDate(r.created_at) ?? undefined,
        updated_at: parseDate(r.updated_at) ?? undefined,
      },
    });
    ok++;
  }
  console.log(`  done — ${ok} upserted, ${skip} skipped`);
}

async function importCardInvoicePayments(rows) {
  console.log(`\nImporting ${rows.length} CardInvoicePayment(s)...`);
  let ok = 0; let skip = 0;

  for (const raw of rows) {
    const r = toSnake(raw);
    const created_by = await resolveUserId(r.created_by);
    const paid_amount = parseDecimal(r.paid_amount);
    const paid_date = parseDate(r.paid_date);

    if (!created_by || !r.card_id || paid_amount === null || !paid_date || !r.month_key) {
      console.warn('  Skipping card_invoice_payment — missing required fields'); skip++; continue;
    }

    await prisma.cardInvoicePayment.upsert({
      where: { id: r.id || randomUUID() },
      update: { card_id: r.card_id, month_key: r.month_key, paid_amount, paid_date, created_by },
      create: {
        id: r.id || randomUUID(),
        card_id: r.card_id,
        month_key: r.month_key,
        paid_amount,
        paid_date,
        created_by,
        created_at: parseDate(r.created_at) ?? undefined,
        updated_at: parseDate(r.updated_at) ?? undefined,
      },
    });
    ok++;
  }
  console.log(`  done — ${ok} upserted, ${skip} skipped`);
}

async function importRunningDebts(rows) {
  console.log(`\nImporting ${rows.length} RunningDebt(s)...`);
  let ok = 0; let skip = 0;

  for (const raw of rows) {
    const r = toSnake(raw);
    const created_by = await resolveUserId(r.created_by);
    const total_amount = parseDecimal(r.total_amount);
    const amount_paid = parseDecimal(r.amount_paid) ?? 0;

    if (!created_by || !r.name || total_amount === null) {
      console.warn(`  Skipping running_debt "${r.name}" — missing required fields`); skip++; continue;
    }

    await prisma.runningDebt.upsert({
      where: { id: r.id || randomUUID() },
      update: { name: r.name, total_amount, amount_paid, notes: r.notes || null, created_by },
      create: {
        id: r.id || randomUUID(),
        name: r.name,
        total_amount,
        amount_paid,
        notes: r.notes || null,
        created_by,
        created_at: parseDate(r.created_at) ?? undefined,
        updated_at: parseDate(r.updated_at) ?? undefined,
      },
    });
    ok++;
  }
  console.log(`  done — ${ok} upserted, ${skip} skipped`);
}

async function importSharedAccesses(rows) {
  console.log(`\nImporting ${rows.length} SharedAccess(es)...`);
  let ok = 0; let skip = 0;

  // Ensure both owner and shared_with exist as users
  for (const raw of rows) {
    const r = toSnake(raw);
    const owner_email = r.owner_email;
    const shared_with_email = r.shared_with_email;

    if (!owner_email || !shared_with_email) {
      console.warn('  Skipping shared_access — missing emails'); skip++; continue;
    }

    await resolveUserId(owner_email);
    await resolveUserId(shared_with_email);

    const validStatuses = ['pending', 'accepted', 'rejected'];
    const status = validStatuses.includes(r.status) ? r.status : 'pending';

    await prisma.sharedAccess.upsert({
      where: { owner_email_shared_with_email: { owner_email, shared_with_email } },
      update: { status },
      create: {
        id: r.id || randomUUID(),
        owner_email,
        shared_with_email,
        status,
        created_at: parseDate(r.created_at) ?? undefined,
        updated_at: parseDate(r.updated_at) ?? undefined,
      },
    });
    ok++;
  }
  console.log(`  done — ${ok} upserted, ${skip} skipped`);
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/import-base44.js <path-to-export.json>');
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Failed to read/parse JSON file: ${err.message}`);
    process.exit(1);
  }

  console.log('Starting Base44 import...');
  console.log('Keys found in JSON:', Object.keys(data).join(', '));

  // Order matters — respect FK dependencies
  if (data.User?.length)                await importUsers(data.User);
  if (data.Card?.length)                await importCards(data.Card);
  if (data.BillAccount?.length)         await importBillAccounts(data.BillAccount);
  if (data.Expense?.length)             await importExpenses(data.Expense);
  if (data.InstallmentPayment?.length)  await importInstallmentPayments(data.InstallmentPayment);
  if (data.CardInvoicePayment?.length)  await importCardInvoicePayments(data.CardInvoicePayment);
  if (data.RunningDebt?.length)         await importRunningDebts(data.RunningDebt);
  if (data.SharedAccess?.length)        await importSharedAccesses(data.SharedAccess);

  console.log('\nImport complete.');
}

main()
  .catch((err) => {
    console.error('\nImport failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
