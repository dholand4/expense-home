import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as ctrl from '../controllers/runningDebts.controller.js';
import { asyncHandler as h } from '../lib/asyncHandler.js';
import { createRunningDebtSchema, updateRunningDebtSchema } from '../schemas/runningDebts.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',       h(ctrl.list));
router.post('/',      validate(createRunningDebtSchema),  h(ctrl.create));
router.patch('/:id',  validate(updateRunningDebtSchema),  h(ctrl.update));
router.delete('/:id', h(ctrl.remove));

export default router;
