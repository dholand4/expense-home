import prisma from '../config/prisma.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import { formatRecord, INCLUDE_CREATOR } from '../lib/format.js';
import { getViewableUserIds } from '../lib/sharedAccess.js';

async function assertOwner(id, userId) {
  const record = await prisma.runningDebt.findUnique({ where: { id }, select: { created_by: true } });
  if (!record) throw new NotFoundError('Dívida não encontrada.');
  if (record.created_by !== userId) throw new ForbiddenError('Acesso negado.');
}

export async function listRunningDebts(userId, userEmail) {
  const ids = await getViewableUserIds(userId, userEmail);
  const records = await prisma.runningDebt.findMany({
    where: { created_by: { in: ids } },
    include: INCLUDE_CREATOR,
    orderBy: { created_at: 'desc' },
  });
  return records.map(formatRecord);
}

export async function createRunningDebt(userId, data) {
  const record = await prisma.runningDebt.create({
    data: { ...data, created_by: userId },
    include: INCLUDE_CREATOR,
  });

  if (record.total_amount > 0) {
    await prisma.runningDebtTransaction.create({
      data: {
        debt_id: record.id,
        type: 'charge',
        amount: record.total_amount,
        date: new Date(),
        notes: record.notes || 'Saldo inicial',
        created_by: userId,
      },
    });
  }

  return formatRecord(record);
}

export async function updateRunningDebt(id, userId, data) {
  await assertOwner(id, userId);
  const record = await prisma.runningDebt.update({ where: { id }, data, include: INCLUDE_CREATOR });
  return formatRecord(record);
}

export async function deleteRunningDebt(id, userId) {
  await assertOwner(id, userId);
  await prisma.runningDebt.delete({ where: { id } });
}

export async function listDebtTransactions(debtId, userId, userEmail) {
  const ids = await getViewableUserIds(userId, userEmail);
  const debt = await prisma.runningDebt.findUnique({
    where: { id: debtId },
    select: { created_by: true },
  });
  if (!debt || !ids.includes(debt.created_by)) throw new NotFoundError('Dívida não encontrada.');

  const records = await prisma.runningDebtTransaction.findMany({
    where: { debt_id: debtId },
    include: INCLUDE_CREATOR,
    orderBy: [{ date: 'desc' }, { created_at: 'desc' }],
  });
  return records.map(formatRecord);
}

export async function addDebtTransaction(userId, data) {
  const { debt_id, type, amount, date, notes } = data;
  const debt = await prisma.runningDebt.findUnique({
    where: { id: debt_id },
  });
  if (!debt) throw new NotFoundError('Dívida não encontrada.');
  if (debt.created_by !== userId) throw new ForbiddenError('Acesso negado.');

  const numAmount = Number(amount);
  const record = await prisma.runningDebtTransaction.create({
    data: {
      debt_id,
      type,
      amount: numAmount,
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
      created_by: userId,
    },
    include: INCLUDE_CREATOR,
  });

  if (type === 'charge') {
    await prisma.runningDebt.update({
      where: { id: debt_id },
      data: { total_amount: { increment: numAmount } },
    });
  } else if (type === 'payment') {
    await prisma.runningDebt.update({
      where: { id: debt_id },
      data: { amount_paid: { increment: numAmount } },
    });
  }

  return formatRecord(record);
}

export async function deleteDebtTransaction(id, userId) {
  const tx = await prisma.runningDebtTransaction.findUnique({
    where: { id },
    include: { debt: true },
  });
  if (!tx) throw new NotFoundError('Transação não encontrada.');
  if (tx.created_by !== userId) throw new ForbiddenError('Acesso negado.');

  await prisma.runningDebtTransaction.delete({ where: { id } });
}
