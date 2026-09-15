import { ContactMessage } from '../models/ContactMessage.js';
import { WebsiteSettings } from '../models/WebsiteSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendMail } from '../utils/mailer.js';
import { buildPagination } from '../utils/pagination.js';
import { buildSearch, buildSort } from '../utils/query.js';
import { successResponse } from '../utils/response.js';

export const submitContact = asyncHandler(async (req, res) => {
  const { honeypot, ...payload } = req.body;

  const contact = await ContactMessage.create(payload);

  // Notify the team, but treat delivery as non-critical — the lead is saved and
  // visible in the admin dashboard regardless of SMTP health.
  const settings = await WebsiteSettings.findOne().select('email siteName');
  const recipient = settings?.email || process.env.CONTACT_NOTIFY_EMAIL;
  if (recipient) {
    await sendMail({
      to: recipient,
      replyTo: contact.email,
      subject: `New enquiry: ${contact.subject || 'Website contact form'}`,
      text: [
        `Name: ${contact.name}`,
        `Email: ${contact.email}`,
        `Phone: ${contact.phone || 'not provided'}`,
        `Subject: ${contact.subject || 'not provided'}`,
        '',
        contact.message
      ].join('\n')
    });
  }

  // Echo back only what the sender already knows; never the full record.
  successResponse(
    res,
    { id: contact._id, name: contact.name },
    "Thanks for reaching out. We'll be in touch within one business day.",
    201
  );
});

export const listContacts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const search = buildSearch(req.query.search, ['name', 'email', 'subject', 'message']);
  if (search) {
    Object.assign(filter, search);
  }

  const sort = buildSort(req.query.sort, ['name', 'status', 'createdAt'], { createdAt: -1 });

  const [items, total, statusCounts] = await Promise.all([
    ContactMessage.find(filter).skip(skip).limit(limit).sort(sort),
    ContactMessage.countDocuments(filter),
    ContactMessage.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);

  const counts = statusCounts.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {
    new: 0,
    in_progress: 0,
    resolved: 0
  });

  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit), counts });
});

export const getContact = asyncHandler(async (req, res) => {
  const contact = await ContactMessage.findById(req.params.id);
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }
  successResponse(res, contact);
});

export const updateContact = asyncHandler(async (req, res) => {
  const contact = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }
  successResponse(res, contact, 'Contact updated');
});

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }
  successResponse(res, null, 'Contact deleted');
});
