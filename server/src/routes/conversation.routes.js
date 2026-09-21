import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createConversationSchema,
  updateConversationSchema,
  conversationParamsSchema,
} from '../schemas/conversation.schema.js';
import {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
  getConversationMessages,
} from '../controllers/conversation.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.post('/', validate(createConversationSchema, 'body'), createConversation);

router.get('/:conversationId', validate(conversationParamsSchema, 'params'), getConversation);
router.patch(
  '/:conversationId',
  validate(conversationParamsSchema, 'params'),
  validate(updateConversationSchema, 'body'),
  updateConversation
);
router.delete('/:conversationId', validate(conversationParamsSchema, 'params'), deleteConversation);

router.get(
  '/:conversationId/messages',
  validate(conversationParamsSchema, 'params'),
  getConversationMessages
);

export default router;
