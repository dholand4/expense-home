import prisma from '../config/prisma.js';
import { NotFoundError } from '../lib/errors.js';

function safeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

export async function listUsers() {
  const users = await prisma.user.findMany({ orderBy: { created_at: 'asc' } });
  return users.map(safeUser);
}

export async function updateUser(id, data) {
  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError('Usuário não encontrado.');

  const user = await prisma.user.update({ where: { id }, data });
  return safeUser(user);
}

export async function deleteUser(id) {
  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError('Usuário não encontrado.');

  await prisma.$transaction(async (tx) => {
    await tx.sharedAccess.deleteMany({
      where: { OR: [{ owner_email: exists.email }, { shared_with_email: exists.email }] },
    });
    await tx.installmentPayment.deleteMany({ where: { created_by: id } });
    await tx.cardInvoicePayment.deleteMany({ where: { created_by: id } });
    await tx.expense.deleteMany({ where: { created_by: id } });
    await tx.card.deleteMany({ where: { created_by: id } });
    await tx.billAccount.deleteMany({ where: { created_by: id } });
    await tx.runningDebt.deleteMany({ where: { created_by: id } });
    await tx.user.delete({ where: { id } });
  });
}
