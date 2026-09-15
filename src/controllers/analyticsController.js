import { Admin } from '../models/Admin.js';
import { Blog } from '../models/Blog.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { Job } from '../models/Job.js';
import { JobApplication } from '../models/JobApplication.js';
import { Project } from '../models/Project.js';
import { Service } from '../models/Service.js';
import { TeamMember } from '../models/TeamMember.js';
import { Testimonial } from '../models/Testimonial.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Zero-filled month buckets for the last `months` months, oldest first. */
const buildMonthWindow = (months) => {
  const now = new Date();
  const buckets = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: MONTH_LABELS[date.getMonth()],
      year: date.getFullYear(),
      leads: 0,
      posts: 0,
      applications: 0
    });
  }
  return buckets;
};

const groupByMonth = (Model, since) =>
  Model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 }
      }
    }
  ]);

export const getAnalytics = asyncHandler(async (req, res) => {
  const months = 6;
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [
    adminCount,
    serviceCount,
    projectCount,
    blogCount,
    publishedBlogCount,
    teamCount,
    testimonialCount,
    jobCount,
    openJobCount,
    contactCount,
    newContacts,
    resolvedContacts,
    leadsByMonth,
    postsByMonth,
    recentContacts,
    recentBlogs,
    applicationCount,
    newApplications,
    applicationsByMonth,
    recentApplications
  ] = await Promise.all([
    Admin.countDocuments(),
    Service.countDocuments(),
    Project.countDocuments(),
    Blog.countDocuments(),
    Blog.countDocuments({ status: 'published' }),
    TeamMember.countDocuments(),
    Testimonial.countDocuments(),
    Job.countDocuments(),
    Job.countDocuments({ isActive: true }),
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ status: 'new' }),
    ContactMessage.countDocuments({ status: 'resolved' }),
    groupByMonth(ContactMessage, since),
    groupByMonth(Blog, since),
    ContactMessage.find().sort({ createdAt: -1 }).limit(5).select('name email subject status createdAt'),
    Blog.find().sort({ createdAt: -1 }).limit(5).select('title slug status publishedAt createdAt'),
    JobApplication.countDocuments(),
    JobApplication.countDocuments({ status: 'new' }),
    groupByMonth(JobApplication, since),
    JobApplication.find().sort({ createdAt: -1 }).limit(5).select('name email jobTitle status createdAt')
  ]);

  const timeline = buildMonthWindow(months);
  const indexByKey = new Map(timeline.map((bucket, index) => [bucket.key, index]));

  const fill = (rows, field) => {
    rows.forEach((row) => {
      const index = indexByKey.get(`${row._id.year}-${row._id.month}`);
      if (index !== undefined) {
        timeline[index][field] = row.count;
      }
    });
  };
  fill(leadsByMonth, 'leads');
  fill(postsByMonth, 'posts');
  fill(applicationsByMonth, 'applications');

  successResponse(res, {
    adminCount,
    serviceCount,
    projectCount,
    blogCount,
    publishedBlogCount,
    draftBlogCount: blogCount - publishedBlogCount,
    teamCount,
    testimonialCount,
    jobCount,
    openJobCount,
    contactCount,
    newContacts,
    resolvedContacts,
    inProgressContacts: contactCount - newContacts - resolvedContacts,
    timeline,
    recentContacts,
    recentBlogs,
    applicationCount,
    newApplications,
    recentApplications
  });
});
