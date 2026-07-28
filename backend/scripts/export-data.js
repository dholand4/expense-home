/**
 * Export all data from the database to a JSON backup file.
 * Usage: node scripts/export-data.js [output-path]
 * Default output: exports/backup-YYYY-MM-DD.json
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { config } from 'dotenv';
import path from 'path';

config();

const prisma = new PrismaClient();

async function main() {
  const outputPath = process.argv[2] ?? `exports/backup-${new Date().toISOString().slice(0, 10)}.json`;

  mkdirSync(path.dirname(outputPath), { recursive: true });

  console.log('Exporting data...');

  const [users, cards, billAccounts, expenses, installmentPayments, cardInvoicePayments, runningDebts, sharedAccesses] = await Promise.all([
    prisma.user.findMany({ orderBy: { created_at: 'asc' } }),
    prisma.card.findMany({ orderBy: { created_at: 'asc' } }),
    prisma.billAccount.findMany({ orderBy: { created_at: 'asc' } }),
    prisma.expense.findMany({ orderBy: { created_at: 'asc' } }),
    prisma.installmentPayment.findMany({ orderBy: { created_at: 'asc' } }),
    prisma.cardInvoicePayment.findMany({ orderBy: { created_at: 'asc' } }),
    prisma.runningDebt.findMany({ orderBy: { created_at: 'asc' } }),
    prisma.sharedAccess.findMany({ orderBy: { created_at: 'asc' } }),
  ]);

  const backup = {
    exported_at: new Date().toISOString(),
    User: users,
    Card: cards,
    BillAccount: billAccounts,
    Expense: expenses,
    InstallmentPayment: installmentPayments,
    CardInvoicePayment: cardInvoicePayments,
    RunningDebt: runningDebts,
    SharedAccess: sharedAccesses,
  };

  writeFileSync(outputPath, JSON.stringify(backup, null, 2), 'utf-8');

  console.log(`\nExport complete → ${outputPath}`);
  console.log(`  Users: ${users.length}`);
  console.log(`  Cards: ${cards.length}`);
  console.log(`  Bill Accounts: ${billAccounts.length}`);
  console.log(`  Expenses: ${expenses.length}`);
  console.log(`  Installment Payments: ${installmentPayments.length}`);
  console.log(`  Card Invoice Payments: ${cardInvoicePayments.length}`);
  console.log(`  Running Debts: ${runningDebts.length}`);
  console.log(`  Shared Accesses: ${sharedAccesses.length}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
