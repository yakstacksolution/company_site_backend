import { SiteContent } from '../models/SiteContent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { isAdmin } from '../utils/query.js';

export const defaultSiteContent = {
  locale: 'en',
  isPublished: true,
  navigation: {
    links: [
      { label: 'Services', href: '/services' }, { label: 'Work', href: '/projects' },
      { label: 'About', href: '/about' }, { label: 'Insights', href: '/blog' }, { label: 'Careers', href: '/careers' }
    ],
    cta: { label: 'Start a project', href: '/contact' }
  },
  hero: {
    eyebrow: 'Software, cloud and product engineering',
    headline: 'We build digital products that move businesses forward.',
    highlightedText: 'move businesses forward',
    lead: 'We design, build and run websites, mobile and desktop apps, cloud platforms and AI-assisted tools, engineered for reliability and built to last well past launch.',
    primaryCta: { label: 'Start a project', href: '/contact' },
    secondaryCta: { label: 'Explore our work', href: '/projects' }
  },
  stats: [],
  sectors: ['Web applications', 'Mobile apps', 'Desktop applications', 'Cloud & DevOps', 'Backend & API engineering', 'Product design (UI/UX)', 'AI & machine learning', 'Automation & integrations', 'Data engineering & analytics', 'E-commerce platforms', 'CMS & content platforms', 'ERP & CRM systems', 'Payments & billing', 'QA & test automation', 'Cyber security', 'Digital marketing', 'SEO', 'Maintenance & support'],
  about: {
    eyebrow: 'About Yak Stack',
    title: 'Practical engineering, close collaboration.',
    body: 'Founded in 2025, Yak Stack Solution helps organisations turn ideas and operational challenges into reliable digital products, then keeps them running afterwards.',
    story: 'Yak Stack Solution was founded in 2025 by engineers who had spent years fixing software that was rushed. We help organisations design, build and maintain digital products that keep working, and stay affordable to change, years after launch.',
    features: ['Clear communication', 'Maintainable delivery', 'Security-minded engineering']
  },
  differentiators: [],
  process: [
    { title: 'Discover', body: 'Understand the goal, users, constraints, and measures of success.', icon: 'search' },
    { title: 'Design', body: 'Shape the experience and technical plan before committing to the build.', icon: 'layers' },
    { title: 'Build', body: 'Ship tested increments with clear progress and regular review.', icon: 'rocket' },
    { title: 'Support', body: 'Monitor, improve, and maintain the product after launch.', icon: 'headset' }
  ],
  delivery: {
    eyebrow: 'What we deliver',
    title: 'Practical software work, end to end.',
    items: [
      { icon: 'code', title: 'Websites & web apps', body: 'Marketing sites, portals and operational tools that stay fast as they grow.' },
      { icon: 'mobile', title: 'Mobile apps', body: 'iOS and Android from one codebase, built to ship and update often.' },
      { icon: 'desktop', title: 'Desktop apps', body: 'Cross-platform tools for Windows, macOS and Linux teams.' },
      { icon: 'cloud', title: 'Cloud & backend', body: 'APIs, infrastructure and integrations designed for reliability from launch.' },
      { icon: 'bot', title: 'AI & automation', body: 'Assistants, document pipelines and workflows that remove manual steps.' },
      { icon: 'layers', title: 'Product design', body: 'Clear user flows, practical architecture and steady release planning.' },
      { icon: 'megaphone', title: 'Digital marketing', body: 'Campaigns, content and analytics tied to results you can measure.' },
      { icon: 'trendUp', title: 'SEO', body: 'Technical fixes, structure and content that earn durable search traffic.' },
      { icon: 'headset', title: 'Support & improvement', body: 'Monitoring, fixes and product iteration long after the first release.' }
    ]
  },
  principles: {
    heading: 'How we work with you',
    items: [
      { title: 'Clear communication', body: 'One named lead, written updates every week, and no jargon in status reports.' },
      { title: 'Maintainable delivery', body: 'Tested increments and documented decisions, so the next change stays cheap.' },
      { title: 'Security-minded engineering', body: 'Least privilege, dependency hygiene and reviewed access from the first commit.' }
    ],
    assurances: ['Fixed-scope discovery before any build', 'Your code, your infrastructure']
  },
  sections: {
    services: { eyebrow: 'Services', title: 'Technology services, engineered with care.', subtitle: 'Explore the capabilities our team has verified and published.' },
    work: { eyebrow: 'Selected work', title: 'Selected work, shared transparently.', subtitle: 'Verified case studies will appear here as they are approved for publication.' },
    process: { eyebrow: 'How we work', title: 'A clear path from idea to dependable software.', subtitle: 'Each stage has a purpose, visible progress, and a concrete outcome.' },
    team: { eyebrow: 'The team', title: "The people you'll actually work with.", subtitle: 'No account managers relaying messages. You talk to the engineers building your software.' },
    testimonials: { eyebrow: 'Why Yak Stack', title: 'Thoughtful collaboration, reliable delivery.', subtitle: 'A practical engineering partner from first workshop to long-term support.' },
    insights: { eyebrow: 'Insights', title: 'Ideas and lessons, written down.', subtitle: 'Articles published directly by the Yak Stack team.' },
    customers: { eyebrow: 'Customers', title: 'Trusted by teams across sectors', subtitle: 'Organisations we build, run and modernise software for.' },
    benefits: { eyebrow: 'Why here', title: 'What you get, beyond the salary.' },
    differentiators: { eyebrow: 'Why Yak Stack', title: 'What you get that you would not from a body shop.', subtitle: 'The same standards on every engagement, whatever its size.' },
    aboutTeam: { eyebrow: 'Our team', title: 'The people behind the work.', subtitle: 'Engineers, designers and delivery leads who stay with a project from first workshop to long-term support.' },
    roles: { eyebrow: 'Open roles', title: 'Where we\u2019re hiring right now.', subtitle: 'Don\u2019t see your role? Write to us anyway. We open positions for people more often than we plan to.' }
  },
  pages: {
    services: {
      eyebrow: 'Services',
      title: 'Everything you need to build and run modern systems.',
      lead: 'We deliver as one organisation rather than a set of separate vendors, which is what removes the handoffs that usually cost a programme its momentum.',
      seoDescription: 'Cloud engineering, product delivery, data platforms, AI, security and managed IT, delivered by one accountable team.',
      ctaTitle: 'Not sure which of these you need?',
      ctaBody: 'Most engagements start with a two-week discovery. You get a written assessment and a costed plan, with no obligation to continue.'
    },
    projects: {
      eyebrow: 'Selected work',
      title: 'Case studies from live production systems.',
      lead: 'Every engagement below is a system in production today. Names are used with permission; where a client asked us not to, the detail stays anonymous.',
      seoDescription: 'Platform migrations, greenfield products and data systems delivered for finance, healthcare, logistics and the public sector.',
      ctaTitle: 'Have a system that needs this kind of attention?',
      ctaBody: 'Tell us where it hurts. We\u2019ll tell you what we\u2019d do first, and roughly what it costs.'
    },
    blog: {
      eyebrow: 'Insights',
      title: 'Field notes from live engagements.',
      lead: 'Written by the people doing the work: what we tried, what it cost, and what we would do differently.',
      seoDescription: 'Field notes on platform engineering, migrations, data and AI from the Yak Stack Solution delivery teams.',
      ctaTitle: 'Want this kind of thinking on your problem?',
      ctaBody: 'We write about what we practise. Bring us the messy version and we\u2019ll help you find the shape of it.'
    },
    careers: {
      eyebrow: 'Careers',
      title: 'Do the work you\u2019d want to put your name on.',
      lead: 'We hire experienced people, give them real ownership, and protect the conditions that make good engineering possible.',
      seoDescription: 'Open roles at Yak Stack Solution: remote-first engineering, design, data and security positions.',
      ctaTitle: 'Nothing quite right?',
      ctaBody: 'Send us a note about what you do well and what you want to do next. We read every one.'
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Tell us what you\u2019re building.',
      lead: 'One of our delivery leads reads every enquiry and replies within one business day, with a point of view rather than a brochure.',
      seoDescription: "Tell us what you're building. We reply to every enquiry within one business day."
    },
    about: {
      eyebrow: 'About us',
      title: 'Practical engineering, close collaboration.',
      lead: '',
      subtitle: ''
    }
  },
  benefits: [
    { icon: 'pin', title: 'Remote-first', body: 'Work from where you are productive. We meet in person a few times a year, deliberately.' },
    { icon: 'clock', title: 'Four-day fortnight focus', body: 'Every other Friday is protected for learning, tooling and writing, with no client work.' },
    { icon: 'rocket', title: 'Real learning budget', body: 'A yearly training budget and the time to spend it, including conference speaking support.' },
    { icon: 'users', title: 'Senior by design', body: 'Small squads of experienced people. No timesheet theatre, no utilisation targets.' },
    { icon: 'shield', title: 'Proper parental leave', body: 'Six months at full pay for all parents, regardless of how you came to be one.' },
    { icon: 'chart', title: 'Transparent pay bands', body: 'Published internally, reviewed annually, with no negotiation penalty.' }
  ],
  contactSubjects: [
    'New project enquiry',
    'Platform or cloud migration',
    'Data & analytics',
    'AI & automation',
    'Security review',
    'Managed IT & support',
    'Something else'
  ],
  contactSteps: [
    'A delivery lead reads your message, not a sales inbox.',
    'We reply within one business day, with questions or a clear no.',
    'If it looks like a fit, we book 30 minutes to dig into specifics.'
  ],
  ctaAssurances: ['Practical next steps', 'Clear communication', 'No obligation'],
  cta: { eyebrow: 'Have a project in mind?', title: 'Let’s build something useful together.', body: 'Tell us what you are trying to achieve and we will respond with a practical next step.', action: { label: 'Talk to our team', href: '/contact' } },
  careers: { eyebrow: 'Join the team', title: 'Build thoughtful products with a small, senior team.', body: 'See current opportunities and help us create reliable software for ambitious organisations.' },
  footer: { summary: 'Software, cloud and product engineering, designed and built by the team that keeps maintaining it.', columns: [] }
};

const load = async () => (await SiteContent.findOne({ locale: 'en' })) || SiteContent.create(defaultSiteContent);

export const getSiteContent = asyncHandler(async (req, res) => {
  const content = await load();
  if (!content.isPublished && !isAdmin(req)) return res.status(404).json({ success: false, message: 'Site content is not published' });
  successResponse(res, content);
});

export const updateSiteContent = asyncHandler(async (req, res) => {
  const content = await load();
  const mergeable = new Set(['navigation', 'hero', 'about', 'cta', 'careers', 'footer', 'legal', 'seo', 'delivery', 'principles', 'sections', 'pages']);
  Object.entries(req.body).forEach(([key, value]) => {
    if (mergeable.has(key) && value && !Array.isArray(value)) {
      const current = content.get(key)?.toObject?.() || content.get(key) || {};
      content.set(key, { ...current, ...value });
    } else {
      content.set(key, value);
    }
  });
  await content.save();
  successResponse(res, content, 'Site content updated');
});
