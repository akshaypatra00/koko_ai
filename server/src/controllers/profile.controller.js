import { profileService } from '../services/profile.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);
  res.json({ success: true, data: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updated = await profileService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: updated });
});

export const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await profileService.getPreferences(req.user.id);
  res.json({ success: true, data: preferences });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const updated = await profileService.updatePreferences(req.user.id, req.body);
  res.json({ success: true, data: updated });
});
