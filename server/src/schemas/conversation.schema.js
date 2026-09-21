import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().min(1).max(255).optional().default('New conversation'),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(255, 'Title is too long'),
});

export const conversationParamsSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
});
