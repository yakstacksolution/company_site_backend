import { WebsiteSettings } from '../models/WebsiteSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/** Settings are a singleton; create the default row on first read. */
const loadSettings = async () => {
  const existing = await WebsiteSettings.findOne();
  return existing || WebsiteSettings.create({});
};

export const getSettings = asyncHandler(async (req, res) => {
  successResponse(res, await loadSettings());
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  const { socials, seo, ...rest } = req.body;

  Object.assign(settings, rest);

  // Merge the nested groups field-by-field: assigning the subdocument wholesale
  // would wipe any key the form didn't send.
  if (socials) {
    Object.entries(socials).forEach(([key, value]) => {
      settings.socials[key] = value;
    });
  }
  if (seo) {
    Object.entries(seo).forEach(([key, value]) => {
      settings.seo[key] = value;
    });
  }

  await settings.save();
  successResponse(res, settings, 'Settings updated');
});
