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
