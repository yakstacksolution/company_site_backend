import crypto from 'crypto';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import { Job } from '../models/Job.js';
import { JobApplication } from '../models/JobApplication.js';
import { WebsiteSettings } from '../models/WebsiteSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { deletePrivateObject, privateObjectPath, privateObjectUrl, putPrivateObject } from '../utils/objectStorage.js';
import { buildPagination } from '../utils/pagination.js';
import { successResponse } from '../utils/response.js';
import { sendMail } from '../utils/mailer.js';

const ALLOWED = new Set(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

export const createJobApplication = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.body.jobId, isActive: true });
  if (!job) return res.status(404).json({ success: false, message: 'Open role not found' });
  if (!req.file) return res.status(422).json({ success: false, message: 'CV is required' });

  const detected = await fileTypeFromBuffer(req.file.buffer);
  const mime = detected?.mime;
  if (!mime || !ALLOWED.has(mime)) return res.status(422).json({ success: false, message: 'CV must be a genuine PDF or DOCX file' });

  const key = `applications/${job._id}/${Date.now()}-${crypto.randomBytes(12).toString('hex')}.${detected.ext}`;
  await putPrivateObject({ key, body: req.file.buffer, contentType: mime });

  try {
    const application = await JobApplication.create({
      job: job._id, jobTitle: job.title, name: req.body.name, email: req.body.email,
      phone: req.body.phone, portfolioUrl: req.body.portfolioUrl, coverMessage: req.body.coverMessage,
      cvKey: key, cvFilename: req.file.originalname, cvMimeType: mime, consentAt: new Date()
    });
    const settings = await WebsiteSettings.findOne().select('email');
    const recipient = settings?.email || process.env.CONTACT_NOTIFY_EMAIL;
    if (recipient) await sendMail({ to: recipient, replyTo: application.email, subject: `New application: ${job.title}`, text: `Candidate: ${application.name}\nEmail: ${application.email}\nRole: ${job.title}\n\n${application.coverMessage}` });
    successResponse(res, { id: application._id, name: application.name, jobTitle: application.jobTitle, status: application.status, createdAt: application.createdAt }, 'Application received', 201);
  } catch (error) {
    await deletePrivateObject(key);
    throw error;
  }
});

export const listJobApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([
    JobApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    JobApplication.countDocuments(filter)
  ]);
  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const getJobApplication = asyncHandler(async (req, res) => {
  const item = await JobApplication.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Application not found' });
  successResponse(res, item);
});

export const updateJobApplication = asyncHandler(async (req, res) => {
  const item = await JobApplication.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Application not found' });
  successResponse(res, item, 'Application updated');
});

export const downloadJobApplicationCv = asyncHandler(async (req, res) => {
  const item = await JobApplication.findById(req.params.id).select('+cvKey');
  if (!item) return res.status(404).json({ success: false, message: 'Application not found' });
  const signed = await privateObjectUrl(item.cvKey);
  if (signed) return res.redirect(302, signed);
  res.download(privateObjectPath(item.cvKey), item.cvFilename);
});

export const deleteJobApplication = asyncHandler(async (req, res) => {
  const item = await JobApplication.findByIdAndDelete(req.params.id).select('+cvKey');
  if (!item) return res.status(404).json({ success: false, message: 'Application not found' });
  await deletePrivateObject(item.cvKey);
  successResponse(res, null, 'Application deleted');
});
