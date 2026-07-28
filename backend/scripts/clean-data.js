import prisma from '../src/config/prisma.js';

async function cleanData() {
  console.log('🧹 Iniciando limpeza do banco...\n');

  const admin = await prisma.user.findFirst({
    where: { role: 'admin' },
  });

  if (!admin) {
    console.error('❌ Nenhum usuário admin encontrado. Abortando.');
    process.exit(1);
  }

  console.log(`✅ Admin encontrado: ${admin.email} — será mantido.\n`);

  // Ordem importa por causa das FK constraints
  const sa  = await prisma.sharedAccess.deleteMany();
  console.log(`🗑️  shared_accesses:         ${sa.count} registros removidos`);

  const ip  = await prisma.installmentPayment.deleteMany();
  console.log(`🗑️  installment_payments:    ${ip.count} registros removidos`);

  const cip = await prisma.cardInvoicePayment.deleteMany();
  console.log(`🗑️  card_invoice_payments:   ${cip.count} registros removidos`);

  const exp = await prisma.expense.deleteMany();
  console.log(`🗑️  expenses:                ${exp.count} registros removidos`);

  const crd = await prisma.card.deleteMany();
  console.log(`🗑️  cards:                   ${crd.count} registros removidos`);

  const ba  = await prisma.billAccount.deleteMany();
  console.log(`🗑️  bill_accounts:           ${ba.count} registros removidos`);

  const rd  = await prisma.runningDebt.deleteMany();
  console.log(`🗑️  running_debts:           ${rd.count} registros removidos`);

  const usr = await prisma.user.deleteMany({
    where: { id: { not: admin.id } },
  });
  console.log(`🗑️  users (exceto admin):    ${usr.count} registros removidos`);

  console.log('\n✅ Banco limpo! Apenas o admin foi mantido.');
  console.log(`   Email: ${admin.email}`);
}

cleanData()
  .catch((e) => { console.error('❌ Erro:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
