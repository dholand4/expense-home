import prisma from '../config/prisma.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../lib/errors.js';

function fmt(r) {
  const { created_at, updated_at, ...rest } = r;
  return { ...rest, created_date: created_at, updated_date: updated_at };
}

export async function listSharedAccesses(filters = {}) {
  const where = {};
  if (filters.owner_email) where.owner_email = filters.owner_email;
  if (filters.shared_with_email) where.shared_with_email = filters.shared_with_email;

  const records = await prisma.sharedAccess.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });
  return records.map(fmt);
}

export async function createSharedAccess(ownerEmail, sharedWithEmail) {
  if (ownerEmail === sharedWithEmail) throw new BadRequestError('Você não pode compartilhar acesso com você mesmo.');

  const target = await prisma.user.findUnique({ where: { email: sharedWithEmail } });
  if (!target) throw new NotFoundError(`Usuário ${sharedWithEmail} não encontrado.`);

  try {
    const record = await prisma.sharedAccess.create({
      data: { owner_email: ownerEmail, shared_with_email: sharedWithEmail, status: 'pending' },
    });
    return fmt(record);
  } catch (err) {
    if (err.code === 'P2002') throw new ConflictError('Este acesso compartilhado já existe.');
    throw err;
  }
}

export async function updateSharedAccess(id, userEmail, status) {
  const record = await prisma.sharedAccess.findUnique({ where: { id } });
  if (!record) throw new NotFoundError('Acesso compartilhado não encontrado.');

  const canUpdate =
    (record.shared_with_email === userEmail && ['accepted', 'rejected'].includes(status)) ||
    record.owner_email === userEmail;

  if (!canUpdate) throw new ForbiddenError('Acesso negado.');

  const updated = await prisma.sharedAccess.update({ where: { id }, data: { status } });
  return fmt(updated);
}

export async function deleteSharedAccess(id, userEmail) {
  const record = await prisma.sharedAccess.findUnique({ where: { id } });
  if (!record) throw new NotFoundError('Acesso compartilhado não encontrado.');
  if (record.owner_email !== userEmail && record.shared_with_email !== userEmail) {
    throw new ForbiddenError('Acesso negado.');
  }
  await prisma.sharedAccess.delete({ where: { id } });
}
