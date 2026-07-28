import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as ctrl from '../controllers/installmentPayments.controller.js';
import { asyncHandler as h } from '../lib/asyncHandler.js';
import { createInstallmentPaymentSchema } from '../schemas/installmentPayments.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',       h(ctrl.list));   // ?month_key=yyyy-MM  &expense_id=uuid
router.post('/',      validate(createInstallmentPaymentSchema), h(ctrl.create));
router.delete('/:id', h(ctrl.remove));

export default router;
