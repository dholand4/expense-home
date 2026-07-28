import { Router } from 'express';
import authRoutes             from './auth.routes.js';
import usersRoutes            from './users.routes.js';
import cardsRoutes            from './cards.routes.js';
import billAccountsRoutes     from './billAccounts.routes.js';
import expensesRoutes         from './expenses.routes.js';
import installmentPayments    from './installmentPayments.routes.js';
import cardInvoicePayments    from './cardInvoicePayments.routes.js';
import runningDebtsRoutes     from './runningDebts.routes.js';
import sharedAccessesRoutes   from './sharedAccesses.routes.js';

const router = Router();

router.use('/auth',                   authRoutes);
router.use('/users',                  usersRoutes);
router.use('/cards',                  cardsRoutes);
router.use('/bill-accounts',          billAccountsRoutes);
router.use('/expenses',               expensesRoutes);
router.use('/installment-payments',   installmentPayments);
router.use('/card-invoice-payments',  cardInvoicePayments);
router.use('/running-debts',          runningDebtsRoutes);
router.use('/shared-accesses',        sharedAccessesRoutes);

export default router;
