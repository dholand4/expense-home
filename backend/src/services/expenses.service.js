import prisma from '../config/prisma.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import { formatRecord, INCLUDE_CREATOR } from '../lib/format.js';
import { getViewableUserIds } from '../lib/sharedAccess.js';

async function assertOwner(id, userId) {
  const record = await prisma.expense.findUnique({ where: { id }, select: { created_by: true } });
  if (!record) throw new NotFoundError('Despesa não encontrada.');
  if (record.created_by !== userId) throw new ForbiddenError('Acesso negado.');
}

export async function listExpenses(userId, userEmail) {
  const ids = await getViewableUserIds(userId, userEmail);
  const records = await prisma.expense.findMany({
    where: { created_by: { in: ids } },
    include: INCLUDE_CREATOR,
    orderBy: { created_at: 'desc' },
  });
  return records.map(formatRecord);
}

export async function createExpense(userId, data) {
  const record = await prisma.expense.create({
    data: {
      ...data,
      first_charge_date: new Date(data.first_charge_date),
      created_by: userId,
    },
    include: INCLUDE_CREATOR,
  });
  return formatRecord(record);
}

export async function updateExpense(id, userId, data) {
  await assertOwner(id, userId);
  const payload = { ...data };
  if (payload.first_charge_date) payload.first_charge_date = new Date(payload.first_charge_date);
  const record = await prisma.expense.update({ where: { id }, data: payload, include: INCLUDE_CREATOR });
  return formatRecord(record);
}

export async function deleteExpense(id, userId) {
  await assertOwner(id, userId);
  // installment_payments cascade via DB ON DELETE CASCADE
  await prisma.expense.delete({ where: { id } });
}
