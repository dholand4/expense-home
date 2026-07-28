import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Este registro já existe.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }
    return res.status(400).json({ error: 'Erro no banco de dados.' });
  }

  // App errors (our custom hierarchy)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }

  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Erro interno do servidor. Tente novamente.' });
}
