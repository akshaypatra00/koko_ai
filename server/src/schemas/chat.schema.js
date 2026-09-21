import { z } from 'zod';

export const chatMessageSchema = z.object({
  conversationId: z.string().uuid().optional().or(z.string().min(1).optional()),
  message: z.string().min(1, 'Message cannot be empty').max(32000, 'Message is too long'),
  attachments: z.array(z.any()).optional().default([]),
  preferredProvider: z.string().optional().default('auto'),
  responseMode: z.enum(['normal', 'concise', 'detailed', 'code', 'code_only', 'document', 'image', 'video']).optional().default('normal'),
});

export const regenerateMessageSchema = z.object({
  conversationId: z.string().uuid('Valid conversation ID is required'),
  messageId: z.string().uuid().optional(),
  preferredProvider: z.string().optional().default('auto'),
});
