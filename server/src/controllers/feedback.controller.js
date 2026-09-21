import { feedbackService } from '../services/feedback.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const submitFeedback = asyncHandler(async (req, res) => {
  const result = await feedbackService.submitFeedback(req.user.id, req.body);
  res.status(201).json({ success: true, data: result });
});
