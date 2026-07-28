import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { validate } from '../middlewares/validate.js';
import * as ctrl from '../controllers/auth.controller.js';
import { asyncHandler as h } from '../lib/asyncHandler.js';
import {
  loginSchema,
  registerSchema,
  inviteSchema,
  acceptInviteSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas.js';

const router = Router();

router.post('/login',          validate(loginSchema),        h(ctrl.login));
router.post('/register',       validate(registerSchema),     h(ctrl.register));
router.get('/me',              authenticate,                 h(ctrl.getMe));
router.post('/logout',         authenticate,                 h(ctrl.logout));
router.post('/invite',         authenticate, requireAdmin,   validate(inviteSchema),       h(ctrl.invite));
router.post('/accept-invite',   validate(acceptInviteSchema),   h(ctrl.acceptInvite));
router.post('/forgot-password',   validate(forgotPasswordSchema), h(ctrl.forgotPassword));
router.post('/reset-password',    validate(resetPasswordSchema),  h(ctrl.resetPassword));
router.get('/reset-redirect',                                     h(ctrl.resetRedirect));

export default router;
