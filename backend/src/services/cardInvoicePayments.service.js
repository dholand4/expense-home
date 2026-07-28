import prisma from '../config/prisma.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import { formatRecord, INCLUDE_CREATOR } from '../lib/format.js';
import { getViewableUserIds } from '../lib/sharedAccess.js';

async function assertOwner(id, userId) {
  const record = await prisma.cardInvoicePayment.findUnique({ where: { id }, select: { created_by: true } });
  if (!record) throw new NotFoundError('Pagamento de fatura não encontrado.');
  if (record.created_by !== userId) throw new ForbiddenError('Acesso negado.');
}

export async function listCardInvoicePayments(userId, userEmail, filters = {}) {
  const ids = await getViewableUserIds(userId, userEmail);
  const where = { created_by: { in: ids } };
  if (filters.card_id) where.card_id = filters.card_id;
  if (filters.month_key) where.month_key = filters.month_key;

  const records = await prisma.cardInvoicePayment.findMany({
    where,
    include: INCLUDE_CREATOR,
    orderBy: [{ month_key: 'desc' }],
  });
  return records.map(formatRecord);
}

export async function createCardInvoicePayment(userId, data) {
  const record = await prisma.cardInvoicePayment.create({
    data: {
      ...data,
      paid_date: new Date(data.paid_date),
      created_by: userId,
    },
    include: INCLUDE_CREATOR,
  });
  return formatRecord(record);
}

export async function updateCardInvoicePayment(id, userId, data) {
  await assertOwner(id, userId);
  const payload = { ...data };
  if (payload.paid_date) payload.paid_date = new Date(payload.paid_date);
  const record = await prisma.cardInvoicePayment.update({ where: { id }, data: payload, include: INCLUDE_CREATOR });
  return formatRecord(record);
}

export async function deleteCardInvoicePayment(id, userId) {
  await assertOwner(id, userId);
  await prisma.cardInvoicePayment.delete({ where: { id } });
}
