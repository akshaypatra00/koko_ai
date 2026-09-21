import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { feedbackSchema } from '../schemas/feedback.schema.js';
import { submitFeedback } from '../controllers/feedback.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(feedbackSchema, 'body'), submitFeedback);

export default router;
