import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as ctrl from '../controllers/billAccounts.controller.js';
import { asyncHandler as h } from '../lib/asyncHandler.js';
import { createBillAccountSchema, updateBillAccountSchema } from '../schemas/billAccounts.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',       h(ctrl.list));
router.post('/',      validate(createBillAccountSchema),  h(ctrl.create));
router.patch('/:id',  validate(updateBillAccountSchema),  h(ctrl.update));
router.delete('/:id', h(ctrl.remove));

export default router;
