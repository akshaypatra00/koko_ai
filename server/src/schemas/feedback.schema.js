import { z } from 'zod';

export const feedbackSchema = z.object({
  messageId: z.string().min(1, 'Valid message ID is required'),
  rating: z.enum(['up', 'down'], {
    errorMap: () => ({ message: "Rating must be 'up' or 'down'" }),
  }),
  reason: z.string().max(1000).optional().default(''),
});
