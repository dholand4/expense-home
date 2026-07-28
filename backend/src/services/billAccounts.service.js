import prisma from '../config/prisma.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import { formatRecord, INCLUDE_CREATOR } from '../lib/format.js';
import { getViewableUserIds } from '../lib/sharedAccess.js';

async function assertOwner(id, userId) {
  const record = await prisma.billAccount.findUnique({ where: { id }, select: { created_by: true } });
  if (!record) throw new NotFoundError('Conta não encontrada.');
  if (record.created_by !== userId) throw new ForbiddenError('Acesso negado.');
}

export async function listBillAccounts(userId, userEmail) {
  const ids = await getViewableUserIds(userId, userEmail);
  const records = await prisma.billAccount.findMany({
    where: { created_by: { in: ids } },
    include: INCLUDE_CREATOR,
    orderBy: { created_at: 'desc' },
  });
  return records.map(formatRecord);
}

export async function createBillAccount(userId, data) {
  const record = await prisma.billAccount.create({
    data: { ...data, created_by: userId },
    include: INCLUDE_CREATOR,
  });
  return formatRecord(record);
}

export async function updateBillAccount(id, userId, data) {
  await assertOwner(id, userId);
  const record = await prisma.billAccount.update({ where: { id }, data, include: INCLUDE_CREATOR });
  return formatRecord(record);
}

export async function deleteBillAccount(id, userId) {
  await assertOwner(id, userId);
  await prisma.$transaction(async (tx) => {
    await tx.expense.deleteMany({ where: { source_type: 'bill_account', source_id: id } });
    await tx.billAccount.delete({ where: { id } });
  });
}
