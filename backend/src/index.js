import express from 'express';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ─── Placeholder routes (to be implemented) ───────────────────────────────────

app.use('/api/users',                   (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
app.use('/api/cards',                   (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
app.use('/api/bill-accounts',           (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
app.use('/api/expenses',                (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
app.use('/api/installment-payments',    (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
app.use('/api/card-invoice-payments',   (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
app.use('/api/running-debts',           (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));
app.use('/api/shared-accesses',         (_req, res) => res.status(501).json({ message: 'Not implemented yet' }));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { prisma };
