/**
 * Fix timezone bleed: dates stored as midnight UTC shift back 3h in Brazil (UTC-3),
 * causing "2026-06-01T00:00:00Z" to read as May 31 on the frontend.
 * Adds 12 hours to all date-only fields so they safely represent the correct day.
 * Safe to run multiple times — only touches rows where hour = 0 (midnight).
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config();

const prisma = new PrismaClient();

async function main() {
  const expenses = await prisma.$executeRaw`
    UPDATE expenses
    SET first_charge_date = first_charge_date + INTERVAL '12 hours'
    WHERE EXTRACT(HOUR FROM first_charge_date) = 0
  `;

  const installments = await prisma.$executeRaw`
    UPDATE installment_payments
    SET paid_date = paid_date + INTERVAL '12 hours'
    WHERE EXTRACT(HOUR FROM paid_date) = 0
  `;

  const invoices = await prisma.$executeRaw`
    UPDATE card_invoice_payments
    SET paid_date = paid_date + INTERVAL '12 hours'
    WHERE EXTRACT(HOUR FROM paid_date) = 0
  `;

  console.log(`Fixed: ${expenses} expenses, ${installments} installment payments, ${invoices} card invoice payments`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
