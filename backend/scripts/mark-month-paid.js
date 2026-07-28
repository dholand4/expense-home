/**
 * mark-month-paid.js
 * Marca todos os lançamentos de um determinado mês como pagos,
 * criando InstallmentPayment para cada expense que ainda não tem registro no mês.
 *
 * Uso: node scripts/mark-month-paid.js [YYYY-MM]
 * Exemplo: node scripts/mark-month-paid.js 2026-05
 */

import { randomUUID } from 'crypto';
import prisma from '../src/config/prisma.js';

const monthArg = process.argv[2];
const monthKey = monthArg ?? new Date().toISOString().slice(0, 7); // default: mês atual

const [yearStr, monthStr] = monthKey.split('-');
const targetYear = parseInt(yearStr, 10);
const targetMonth = parseInt(monthStr, 10); // 1–12

if (!targetYear || !targetMonth) {
  console.error('❌ Formato inválido. Use YYYY-MM. Ex: node scripts/mark-month-paid.js 2026-05');
  process.exit(1);
}

function monthDiff(firstChargeDate, year, month) {
  const d = new Date(firstChargeDate);
  const fy = d.getUTCFullYear();
  const fm = d.getUTCMonth() + 1; // 1–12
  return (year - fy) * 12 + (month - fm);
}

async function run() {
  console.log(`\n📅 Marcando como pago: ${monthKey}\n`);

  // Busca todos os expenses do usuário Daniel (ou todos)
  const expenses = await prisma.expense.findMany();
  console.log(`📦 Total de expenses no banco: ${expenses.length}`);

  let criados = 0;
  let jaExistiam = 0;
  let foraDoMes = 0;

  for (const expense of expenses) {
    const diff = monthDiff(expense.first_charge_date, targetYear, targetMonth);

    // Verifica se o mês alvo está dentro do ciclo do expense
    let instNumber = diff + 1; // installment_number começa em 1

    if (expense.payment_type === 'avista') {
      // Apenas o mês exato da first_charge_date
      if (diff !== 0) { foraDoMes++; continue; }
      instNumber = 1;
    } else if (expense.payment_type === 'parcelado') {
      // Deve estar entre a 1ª e a última parcela
      if (diff < 0 || diff >= expense.installments) { foraDoMes++; continue; }
    } else if (expense.payment_type === 'recorrente') {
      // Recorrente: qualquer mês a partir da first_charge_date
      if (diff < 0) { foraDoMes++; continue; }
    }

    // Verifica se já existe InstallmentPayment para esse expense+mês
    const exists = await prisma.installmentPayment.findFirst({
      where: {
        expense_id: expense.id,
        month_key: monthKey,
      },
    });

    if (exists) {
      jaExistiam++;
      continue;
    }

    // Calcula o valor da parcela
    let paidAmount;
    if (expense.payment_type === 'parcelado') {
      paidAmount = Number(expense.total_amount) / expense.installments;
    } else {
      paidAmount = Number(expense.total_amount);
    }

    // Data de pagamento: usa o dia da first_charge_date mas no mês alvo
    const firstDate = new Date(expense.first_charge_date);
    const paidDate = new Date(Date.UTC(targetYear, targetMonth - 1, firstDate.getUTCDate()));

    await prisma.installmentPayment.create({
      data: {
        id: randomUUID(),
        expense_id: expense.id,
        installment_number: instNumber,
        paid_amount: paidAmount,
        paid_date: paidDate,
        month_key: monthKey,
        created_by: expense.created_by,
      },
    });

    criados++;
  }

  console.log(`\n✅ Concluído para ${monthKey}:`);
  console.log(`   ✔  ${criados} pagamentos criados`);
  console.log(`   ⏭  ${jaExistiam} já estavam pagos`);
  console.log(`   ⏩  ${foraDoMes} expenses fora do período`);
}

run()
  .catch(e => { console.error('❌ Erro:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
