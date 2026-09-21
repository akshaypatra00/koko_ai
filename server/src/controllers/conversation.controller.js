import { conversationService } from '../services/conversation.service.js';
import { messageService } from '../services/message.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await conversationService.getConversations(req.user.id);
  res.json({ success: true, data: conversations });
});

export const createConversation = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const conversation = await conversationService.createConversation(req.user.id, title);
  res.status(201).json({ success: true, data: conversation });
});

export const getConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await conversationService.getConversation(req.user.id, conversationId);
  res.json({ success: true, data: conversation });
});

export const updateConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const updated = await conversationService.updateConversation(req.user.id, conversationId, req.body);
  res.json({ success: true, data: updated });
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const result = await conversationService.deleteConversation(req.user.id, conversationId);
  res.json({ success: true, data: result });
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const messages = await messageService.getMessages(req.user.id, conversationId);
  res.json({ success: true, data: messages });
});
