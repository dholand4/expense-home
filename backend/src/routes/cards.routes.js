import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as ctrl from '../controllers/cards.controller.js';
import { asyncHandler as h } from '../lib/asyncHandler.js';
import { createCardSchema, updateCardSchema } from '../schemas/cards.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',       h(ctrl.list));
router.post('/',      validate(createCardSchema),  h(ctrl.create));
router.patch('/:id',  validate(updateCardSchema),  h(ctrl.update));
router.delete('/:id', h(ctrl.remove));

export default router;
