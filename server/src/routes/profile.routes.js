import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
} from '../controllers/profile.controller.js';

const router = Router();

// Protect all profile routes
router.use(authenticate);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);

export default router;
