import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as ctrl from '../controllers/cardInvoicePayments.controller.js';
import { asyncHandler as h } from '../lib/asyncHandler.js';
import {
  createCardInvoicePaymentSchema,
  updateCardInvoicePaymentSchema,
} from '../schemas/cardInvoicePayments.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',       h(ctrl.list));   // ?card_id=uuid  &month_key=yyyy-MM
router.post('/',      validate(createCardInvoicePaymentSchema), h(ctrl.create));
router.patch('/:id',  validate(updateCardInvoicePaymentSchema), h(ctrl.update));
router.delete('/:id', h(ctrl.remove));

export default router;
