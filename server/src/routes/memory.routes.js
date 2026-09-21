import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createMemorySchema,
  updateMemorySchema,
  memoryParamsSchema,
} from '../schemas/memory.schema.js';
import {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
} from '../controllers/memory.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getMemories);
router.post('/', validate(createMemorySchema, 'body'), createMemory);
router.patch(
  '/:memoryId',
  validate(memoryParamsSchema, 'params'),
  validate(updateMemorySchema, 'body'),
  updateMemory
);
router.delete('/:memoryId', validate(memoryParamsSchema, 'params'), deleteMemory);

export default router;
