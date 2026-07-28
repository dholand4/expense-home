import { readFileSync } from 'fs';
import { resolve } from 'path';
import prisma from '../src/config/prisma.js';

const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Informe o caminho do backup: node scripts/import-backup.js <arquivo.json>');
  process.exit(1);
}

const backup = JSON.parse(readFileSync(resolve(filePath), 'utf-8'));

async function run() {
  console.log(`📦 Backup de: ${backup.exported_at}`);
  console.log('🧹 Limpando banco antes de importar...\n');

  // Apaga tudo na ordem correta (FK constraints)
  await prisma.sharedAccess.deleteMany();
  await prisma.installmentPayment.deleteMany();
  await prisma.cardInvoicePayment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.card.deleteMany();
  await prisma.billAccount.deleteMany();
  await prisma.runningDebt.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Banco limpo.\n');

  // Importa na ordem correta
  const users = backup.User ?? [];
  await prisma.user.createMany({ data: users });
  console.log(`👤 users:                   ${users.length} importados`);

  const cards = backup.Card ?? [];
  await prisma.card.createMany({ data: cards.map(c => ({ ...c, credit_limit: Number(c.credit_limit) })) });
  console.log(`💳 cards:                   ${cards.length} importados`);

  const billAccounts = backup.BillAccount ?? [];
  await prisma.billAccount.createMany({ data: billAccounts });
  console.log(`📄 bill_accounts:           ${billAccounts.length} importados`);

  const expenses = backup.Expense ?? [];
  await prisma.expense.createMany({
    data: expenses.map(e => ({ ...e, total_amount: Number(e.total_amount) })),
  });
  console.log(`💸 expenses:                ${expenses.length} importados`);

  const installments = backup.InstallmentPayment ?? [];
  await prisma.installmentPayment.createMany({
    data: installments.map(i => ({ ...i, paid_amount: Number(i.paid_amount) })),
  });
  console.log(`📅 installment_payments:    ${installments.length} importados`);

  const invoices = backup.CardInvoicePayment ?? [];
  await prisma.cardInvoicePayment.createMany({
    data: invoices.map(i => ({ ...i, paid_amount: Number(i.paid_amount) })),
  });
  console.log(`🧾 card_invoice_payments:   ${invoices.length} importados`);

  const debts = backup.RunningDebt ?? [];
  await prisma.runningDebt.createMany({
    data: debts.map(d => ({
      ...d,
      total_amount: Number(d.total_amount),
      amount_paid: Number(d.amount_paid),
    })),
  });
  console.log(`💰 running_debts:           ${debts.length} importados`);

  const accesses = backup.SharedAccess ?? [];
  await prisma.sharedAccess.createMany({ data: accesses });
  console.log(`🤝 shared_accesses:         ${accesses.length} importados`);

  const admin = users.find(u => u.role === 'admin');
  console.log(`\n✅ Importação concluída!`);
  console.log(`   Admin: ${admin?.email ?? 'não encontrado'}`);
  console.log(`   Total: ${users.length + cards.length + billAccounts.length + expenses.length + installments.length + invoices.length + debts.length} registros`);
}

run()
  .catch(e => { console.error('❌ Erro:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
