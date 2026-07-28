import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { validate } from '../middlewares/validate.js';
import * as ctrl from '../controllers/users.controller.js';
import { asyncHandler as h } from '../lib/asyncHandler.js';
import { updateUserSchema } from '../schemas/users.schemas.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/',       h(ctrl.list));
router.patch('/:id',  validate(updateUserSchema), h(ctrl.update));
router.delete('/:id', h(ctrl.remove));

export default router;
