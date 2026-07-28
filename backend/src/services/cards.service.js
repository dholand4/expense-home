import prisma from '../config/prisma.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import { formatRecord, INCLUDE_CREATOR } from '../lib/format.js';
import { getViewableUserIds } from '../lib/sharedAccess.js';

async function assertOwner(id, userId) {
  const record = await prisma.card.findUnique({ where: { id }, select: { created_by: true } });
  if (!record) throw new NotFoundError('Cartão não encontrado.');
  if (record.created_by !== userId) throw new ForbiddenError('Acesso negado.');
}

export async function listCards(userId, userEmail) {
  const ids = await getViewableUserIds(userId, userEmail);
  const records = await prisma.card.findMany({
    where: { created_by: { in: ids } },
    include: INCLUDE_CREATOR,
    orderBy: { created_at: 'desc' },
  });
  return records.map(formatRecord);
}

export async function createCard(userId, data) {
  const record = await prisma.card.create({
    data: { ...data, created_by: userId },
    include: INCLUDE_CREATOR,
  });
  return formatRecord(record);
}

export async function updateCard(id, userId, data) {
  await assertOwner(id, userId);
  const record = await prisma.card.update({ where: { id }, data, include: INCLUDE_CREATOR });
  return formatRecord(record);
}

export async function deleteCard(id, userId) {
  await assertOwner(id, userId);
  await prisma.$transaction(async (tx) => {
    // Cascade: expenses (then their installment_payments via DB cascade) + card_invoice_payments
    await tx.expense.deleteMany({ where: { source_type: 'card', source_id: id } });
    await tx.card.delete({ where: { id } });
  });
}
