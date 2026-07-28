import prisma from '../config/prisma.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import { formatRecord, INCLUDE_CREATOR } from '../lib/format.js';
import { getViewableUserIds } from '../lib/sharedAccess.js';

async function assertOwner(id, userId) {
  const record = await prisma.installmentPayment.findUnique({ where: { id }, select: { created_by: true } });
  if (!record) throw new NotFoundError('Pagamento não encontrado.');
  if (record.created_by !== userId) throw new ForbiddenError('Acesso negado.');
}

export async function listInstallmentPayments(userId, userEmail, filters = {}) {
  const ids = await getViewableUserIds(userId, userEmail);
  const where = { created_by: { in: ids } };
  if (filters.month_key) where.month_key = filters.month_key;
  if (filters.expense_id) where.expense_id = filters.expense_id;

  const records = await prisma.installmentPayment.findMany({
    where,
    include: INCLUDE_CREATOR,
    orderBy: [{ month_key: 'asc' }, { installment_number: 'asc' }],
  });
  return records.map(formatRecord);
}

export async function createInstallmentPayment(userId, data) {
  const record = await prisma.installmentPayment.create({
    data: {
      ...data,
      paid_date: new Date(data.paid_date),
      created_by: userId,
    },
    include: INCLUDE_CREATOR,
  });
  return formatRecord(record);
}

export async function deleteInstallmentPayment(id, userId) {
  await assertOwner(id, userId);
  await prisma.installmentPayment.delete({ where: { id } });
}
