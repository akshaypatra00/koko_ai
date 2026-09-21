import { memoryService } from '../services/memory.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMemories = asyncHandler(async (req, res) => {
  const memories = await memoryService.getMemories(req.user.id);
  res.json({ success: true, data: memories });
});

export const createMemory = asyncHandler(async (req, res) => {
  const memory = await memoryService.createMemory(req.user.id, req.body);
  res.status(201).json({ success: true, data: memory });
});

export const updateMemory = asyncHandler(async (req, res) => {
  const { memoryId } = req.params;
  const memory = await memoryService.updateMemory(req.user.id, memoryId, req.body);
  res.json({ success: true, data: memory });
});

export const deleteMemory = asyncHandler(async (req, res) => {
  const { memoryId } = req.params;
  const result = await memoryService.deleteMemory(req.user.id, memoryId);
  res.json({ success: true, data: result });
});
