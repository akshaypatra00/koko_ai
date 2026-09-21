import { z } from 'zod';

export const createMemorySchema = z.object({
  memory_text: z.string().min(1, 'Memory text cannot be empty').max(1000),
  memory_type: z.enum(['preference', 'fact', 'project', 'goal']).optional().default('preference'),
  importance: z.number().int().min(1).max(5).optional().default(1),
});

export const updateMemorySchema = z.object({
  memory_text: z.string().min(1).max(1000).optional(),
  memory_type: z.enum(['preference', 'fact', 'project', 'goal']).optional(),
  importance: z.number().int().min(1).max(5).optional(),
});

export const memoryParamsSchema = z.object({
  memoryId: z.string().min(1, 'Memory ID is required'),
});
