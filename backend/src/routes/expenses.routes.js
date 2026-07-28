import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as ctrl from '../controllers/expenses.controller.js';
import { asyncHandler as h } from '../lib/asyncHandler.js';
import { createExpenseSchema, updateExpenseSchema } from '../schemas/expenses.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',       h(ctrl.list));
router.post('/',      validate(createExpenseSchema),  h(ctrl.create));
router.patch('/:id',  validate(updateExpenseSchema),  h(ctrl.update));
router.delete('/:id', h(ctrl.remove));

export default router;
