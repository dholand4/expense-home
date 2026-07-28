import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as ctrl from '../controllers/sharedAccesses.controller.js';
import { asyncHandler as h } from '../lib/asyncHandler.js';
import { createSharedAccessSchema, updateSharedAccessSchema } from '../schemas/sharedAccesses.schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',       h(ctrl.list));   // ?owner_email=  &shared_with_email=
router.post('/',      validate(createSharedAccessSchema),  h(ctrl.create));
router.patch('/:id',  validate(updateSharedAccessSchema),  h(ctrl.update));
router.delete('/:id', h(ctrl.remove));

export default router;
