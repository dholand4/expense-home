import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../lib/errors.js';
import { sendResetPasswordEmail } from '../lib/mailer.js';

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '8h' }
  );
}

function signInvite(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: 'invite' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

export async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) throw new UnauthorizedError('E-mail ou senha inválidos.');
  if (user.status === 'disabled') throw new UnauthorizedError('Conta desativada. Entre em contato com o suporte.');
  if (user.status === 'invited') throw new UnauthorizedError('Conta não ativada. Acesse o convite enviado por e-mail.');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new UnauthorizedError('E-mail ou senha inválidos.');

  return { user: safeUser(user), token: signAccess(user) };
}

export async function register(email, password, full_name) {
  const normalizedEmail = email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (exists) throw new ConflictError('Este e-mail já está cadastrado.');

  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, password_hash, full_name: full_name ?? null, role: 'user', status: 'active' },
  });

  return { user: safeUser(user), token: signAccess(user) };
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('Usuário não encontrado.');
  return safeUser(user);
}

export async function invite(email, full_name, role) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new ConflictError('Este e-mail já está cadastrado.');

  const password_hash = await bcrypt.hash(crypto.randomUUID(), 4);
  const user = await prisma.user.create({
    data: { email, password_hash, full_name: full_name ?? null, role, status: 'invited' },
  });

  const token = signInvite(user);
  const inviteUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/accept-invite?token=${token}`;

  return { user: safeUser(user), invite_token: token, invite_url: inviteUrl };
}

// Armazenamento em memória dos códigos de reset (sem migration)
// Expira em 1h e é de uso único
const resetStore = new Map();

function generateResetCode() {
  // Sem 0, O, 1, I para evitar confusão visual
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function forgotPassword(email) {
  const normalizedEmail = email.toLowerCase().trim();
  console.log(`[AUTH] forgotPassword chamado para: ${normalizedEmail}`);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || user.status !== 'active') {
    console.log(`[AUTH] Usuario nao encontrado ou inativo: ${normalizedEmail}`);
    return;
  }

  const code = generateResetCode();
  resetStore.set(code, { userId: user.id, expiresAt: Date.now() + 60 * 60 * 1000 });

  console.log(`[AUTH] Enviando e-mail para: ${user.email} | codigo: ${code}`);
  await sendResetPasswordEmail(user.email, code);
  console.log(`[AUTH] E-mail enviado com sucesso para: ${user.email}`);
}

export async function resetPassword(code, password) {
  const entry = resetStore.get(code.toUpperCase().trim());
  if (!entry) throw new BadRequestError('Código inválido. Verifique o e-mail ou solicite um novo.');
  if (Date.now() > entry.expiresAt) {
    resetStore.delete(code);
    throw new BadRequestError('Código expirado. Solicite uma nova recuperação.');
  }

  const user = await prisma.user.findUnique({ where: { id: entry.userId } });
  if (!user) throw new NotFoundError('Usuário não encontrado');

  const password_hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password_hash } });
  resetStore.delete(code); // uso único
}

export async function acceptInvite(token, password) {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new BadRequestError('Link de convite inválido ou expirado.');
  }

  if (payload.type !== 'invite') throw new BadRequestError('Token inválido.');

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new NotFoundError('Usuário não encontrado.');
  if (user.status !== 'invited') throw new BadRequestError('Convite já utilizado ou conta já está ativa.');

  const password_hash = await bcrypt.hash(password, 10);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { password_hash, status: 'active' },
  });

  return { user: safeUser(updated), token: signAccess(updated) };
}
