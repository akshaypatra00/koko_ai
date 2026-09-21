import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { chatRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { chatMessageSchema, regenerateMessageSchema } from '../schemas/chat.schema.js';
import { handleChat, handleRegenerate, handleOptimizePrompt } from '../controllers/chat.controller.js';

const router = Router();

router.use(authenticate);
router.use(chatRateLimiter);

router.post('/', validate(chatMessageSchema, 'body'), handleChat);
router.post('/regenerate', validate(regenerateMessageSchema, 'body'), handleRegenerate);
router.post('/optimize-prompt', handleOptimizePrompt);

export default router;
