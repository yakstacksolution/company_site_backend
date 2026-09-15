import { Admin } from './models/Admin.js';
import { Blog } from './models/Blog.js';
import { ContactMessage } from './models/ContactMessage.js';
import { Job } from './models/Job.js';
import { Project } from './models/Project.js';
import { Service } from './models/Service.js';
import { TeamMember } from './models/TeamMember.js';
import { Testimonial } from './models/Testimonial.js';
import { Customer } from './models/Customer.js';
import { WebsiteSettings } from './models/WebsiteSettings.js';

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const services = [
  {
    title: 'Cloud & Platform Engineering',
    slug: 'cloud-platform-engineering',
    description:
      'We design and operate cloud foundations that stay predictable under load: infrastructure as code, zero-downtime delivery pipelines, and observability built in from day one.',
    icon: 'cloud',
    features: ['AWS, Azure & GCP', 'Terraform & IaC', 'Kubernetes platforms', 'Cost optimisation'],
    order: 1
  },
  {
    title: 'Product Engineering',
    slug: 'product-engineering',
    description:
      'Cross-functional squads that take a product from discovery to launch and keep shipping after it. Design, frontend, backend and QA in one accountable team.',
    icon: 'layers',
    features: ['Discovery & prototyping', 'Web & mobile delivery', 'API design', 'Automated testing'],
    order: 2
  },
  {
    title: 'Data & Analytics',
    slug: 'data-analytics',
    description:
      'Pipelines, warehouses and dashboards that turn scattered operational data into decisions your leadership team actually trusts.',
    icon: 'chart',
    features: ['ETL & streaming pipelines', 'Warehouse modelling', 'BI dashboards', 'Data governance'],
    order: 3
  },
  {
    title: 'AI & Automation',
    slug: 'ai-automation',
    description:
      'Practical machine learning and LLM integrations aimed at measurable throughput: document processing, support triage, forecasting and internal copilots.',
    icon: 'sparkles',
    features: ['LLM integration', 'Document intelligence', 'Forecasting models', 'Workflow automation'],
    order: 4
  },
  {
    title: 'Cybersecurity & Compliance',
    slug: 'cybersecurity-compliance',
    description:
      'Security reviews, hardening and audit readiness for teams that need to prove their controls, not just describe them.',
    icon: 'shield',
    features: ['Threat modelling', 'Penetration testing', 'SOC 2 & ISO 27001 readiness', 'Incident response'],
    order: 5
  },
  {
    title: 'Managed IT & Support',
    slug: 'managed-it-support',
    description:
      'Round-the-clock monitoring, patching and a named support team, so internal tooling stops being someone’s side project.',
    icon: 'headset',
    features: ['24/7 monitoring', 'Named support pod', 'SLA-backed response', 'Disaster recovery'],
    order: 6
  }
];

const projects = [
  {
    title: 'Fintech Core Banking Revamp',
    slug: 'fintech-core-banking-revamp',
    summary: 'Modernised a legacy payments core to handle 4x transaction volume with zero planned downtime.',
    description:
      'NexBank’s payment core was a fifteen-year-old monolith that took a weekend maintenance window to deploy. We introduced a strangler-fig migration: new domain services behind a routing layer, dual-writes for safety, and a cutover measured in minutes rather than days. Throughput now peaks at four times the previous ceiling and deploys happen during business hours.',
    client: 'NexBank',
    industry: 'Financial Services',
    techStack: ['Node.js', 'PostgreSQL', 'Kafka', 'Kubernetes', 'Terraform'],
    isFeatured: true
  },
  {
    title: 'Telehealth Platform Launch',
    slug: 'telehealth-platform-launch',
    summary: 'Built a HIPAA-aligned virtual care platform from discovery to public launch in nine months.',
    description:
      'A greenfield build covering patient scheduling, video consultations, e-prescribing and clinician workflows. We ran a two-week discovery, shipped a clickable prototype in month one, and launched to three states before expanding nationally.',
    client: 'Clarity Health',
    industry: 'Healthcare',
    techStack: ['React', 'TypeScript', 'WebRTC', 'AWS', 'DynamoDB'],
    isFeatured: true
  },
  {
    title: 'Logistics Visibility Dashboard',
    slug: 'logistics-visibility-dashboard',
    summary: 'Unified fifteen carrier feeds into one live view, cutting status-check calls by 62%.',
    description:
      'Freight operations were tracking shipments across fifteen carrier portals and a spreadsheet. We built a normalising ingestion layer and a real-time operations dashboard, then instrumented the exception workflow so delays surface before customers call.',
    client: 'Meridian Freight',
    industry: 'Logistics',
    techStack: ['Python', 'Airflow', 'Snowflake', 'React', 'Redis'],
    isFeatured: true
  },
  {
    title: 'Retail Demand Forecasting',
    slug: 'retail-demand-forecasting',
    summary: 'Replaced spreadsheet forecasting with an ML pipeline that cut stockouts by 34%.',
    description:
      'A demand model trained on three years of sales, promotions and weather data, delivered to planners inside the tools they already used rather than as a separate report.',
    client: 'Harbour Retail Group',
    industry: 'Retail',
    techStack: ['Python', 'scikit-learn', 'BigQuery', 'dbt'],
    isFeatured: false
  },
  {
    title: 'Manufacturing IoT Telemetry',
    slug: 'manufacturing-iot-telemetry',
    summary: 'Instrumented 400 machines across six plants for predictive maintenance.',
    description:
      'Edge collectors feeding a time-series backbone, with anomaly detection that flags bearing wear weeks before failure. Unplanned downtime fell by a fifth in the first quarter.',
    client: 'Volta Industries',
    industry: 'Manufacturing',
    techStack: ['Go', 'MQTT', 'TimescaleDB', 'Grafana'],
    isFeatured: false
  },
  {
    title: 'Government Services Portal',
    slug: 'government-services-portal',
    summary: 'Consolidated 40 paper-based processes into one accessible citizen portal.',
    description:
      'A WCAG 2.1 AA compliant portal replacing in-person paperwork for permits, licences and records requests, built with a shared form engine so new services launch in days.',
    client: 'Regional Authority',
    industry: 'Public Sector',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Azure'],
    isFeatured: false
  }
];

const blogs = [
  {
    title: 'Scaling Secure Platforms Without Slowing Delivery',
    slug: 'scaling-secure-platforms',
    excerpt:
      'Security and delivery speed are usually framed as a trade-off. In practice, the teams that ship fastest are the ones who automated their controls.',
    tags: ['Security', 'Platform Engineering'],
    author: 'Ari Patel',
    status: 'published',
    publishedAt: daysAgo(6),
    content: `Most engineering leaders we meet describe security as a tax on delivery. Every release waits on a review, every review surfaces the same class of finding, and the backlog of "we should fix that" grows quietly in the corner.

## The bottleneck is rarely the review

When we audit a delivery pipeline, the review itself is almost never the slow part. The slow part is that the review finds problems late, when the cost of changing course is highest. A misconfigured storage bucket caught in design costs a conversation. Caught in staging it costs a sprint.

## Move the control, not the deadline

The teams that ship fastest have moved their controls left, into the tooling:

- Infrastructure as code with policy checks that run on every pull request
- Secrets management that makes the insecure path harder than the secure one
- Dependency scanning wired into CI, failing builds on known-exploitable versions
- Pre-merge threat modelling for anything touching authentication or payments

None of this is exotic. What makes it work is that the feedback arrives while the author still has the context in their head.

## Measure the loop, not the findings

A security programme that reports "142 issues closed this quarter" is measuring activity. Measure instead the time from introduction to detection. When that number drops, everything else follows: fewer escalations, smaller fixes, and reviews that confirm rather than discover.

The goal is not to eliminate the review. It is to make the review boring.`
  },
  {
    title: 'A Pragmatic Guide to Legacy Migration',
    slug: 'pragmatic-guide-legacy-migration',
    excerpt:
      'Big-bang rewrites fail for predictable reasons. Here is the incremental pattern we use instead, and when it is genuinely worth rewriting.',
    tags: ['Architecture', 'Migration'],
    author: 'Dana Whitfield',
    status: 'published',
    publishedAt: daysAgo(19),
    content: `Every legacy system has a rewrite proposal in a drawer somewhere. Most of them should stay there.

## Why rewrites fail

A rewrite asks you to reproduce years of accumulated behaviour, including the undocumented edge cases that quietly keep revenue flowing, while the original system keeps changing underneath you. You are shooting at a moving target with an incomplete specification.

## The strangler fig, concretely

Instead we put a routing layer in front of the old system and move one capability at a time:

1. **Pick a seam.** A bounded capability with clear inputs and outputs. Reporting and notifications are good first candidates; core transaction paths are not.
2. **Route through a facade.** All traffic goes through a layer you control, even while 100% of it still lands on the legacy system.
3. **Dual-write and compare.** Run the new implementation in shadow mode. Log divergences. This is where you discover the undocumented behaviour.
4. **Flip a percentage.** Move 1%, then 10%, then all of it, with a fast path back.
5. **Delete the old code.** The step teams skip, and the reason migrations run for years.

## When a rewrite is right

Sometimes the platform itself is the constraint: an unsupported runtime, a database at end of life, a vendor exiting the market. If the substrate has to change, incrementalism buys you less. Even then, migrate data and behaviour separately.

The measure of a good migration is how unremarkable the cutover was.`
  },
  {
    title: 'What We Learned Putting LLMs into Production',
    slug: 'llms-in-production-lessons',
    excerpt:
      'Six deployments in, the hard parts were never the model. They were evaluation, latency budgets, and knowing when not to use one.',
    tags: ['AI', 'Engineering'],
    author: 'Miguel Santos',
    status: 'published',
    publishedAt: daysAgo(33),
    content: `We have shipped six LLM-backed features to production over the past year. The model choice mattered far less than we expected.

## Evaluation is the whole job

A demo that works on ten hand-picked inputs tells you nothing. Before writing integration code we build an evaluation set of a few hundred real examples with expected outcomes, plus a scoring harness we can run on every change. Without it, "the prompt got better" is an opinion.

## Latency is a product decision

Users tolerate a slow answer they asked for and resent a slow page they did not. Streaming a response that starts in 400ms beats a complete response at three seconds. Where the task allows it, we move the work off the request path entirely.

## Know when not to use one

Three of our six candidate features shipped without a model. Classification with stable categories and plenty of labelled history is still better served by a small supervised model: cheaper, faster, and far easier to reason about when it is wrong.

## Design for being wrong

Every one of these systems is wrong sometimes. The features that survived contact with users were the ones where being wrong was cheap: a suggested reply rather than a sent one, a flagged document rather than a rejected one.`
  },
  {
    title: 'Designing an Internal Platform Teams Actually Adopt',
    slug: 'internal-platform-adoption',
    excerpt: 'A draft exploring why golden paths get ignored and what changes when platform teams treat developers as customers.',
    tags: ['Platform Engineering', 'Culture'],
    author: 'Ari Patel',
    status: 'draft',
    content: `Notes toward a longer piece on internal platform adoption.

The pattern we keep seeing: a platform team builds a golden path, announces it, and eighteen months later half the organisation is still on bespoke pipelines. The technology is rarely the reason.

Working thesis: adoption follows from the platform being the path of least resistance for the next thing a team needs to do, not from it being better in the abstract. That means investing in migration tooling and documentation at the same level as the platform itself.

Still to write: metrics that indicate real adoption versus mandated compliance.`
  }
];

const team = [
  {
    name: 'Ari Patel',
    title: 'Head of Delivery',
    bio: 'Fifteen years leading cross-functional teams through platform migrations and regulated launches. Believes the best architecture is the one the team can operate at 3am.',
    order: 1,
    socials: { linkedin: 'https://linkedin.com/in/example', github: 'https://github.com/example' }
  },
  {
    name: 'Dana Whitfield',
    title: 'Principal Architect',
    bio: 'Specialises in untangling legacy estates without stopping the business. Has never met a monolith she could not decompose.',
    order: 2,
    socials: { linkedin: 'https://linkedin.com/in/example' }
  },
  {
    name: 'Miguel Santos',
    title: 'Lead Data & AI Engineer',
    bio: 'Builds data platforms and ML systems with a bias toward the simplest model that clears the bar.',
    order: 3,
    socials: { linkedin: 'https://linkedin.com/in/example', github: 'https://github.com/example' }
  },
  {
    name: 'Priya Raman',
    title: 'Security Lead',
    bio: 'Former incident responder, now focused on making secure defaults the easy path for delivery teams.',
    order: 4,
    socials: { linkedin: 'https://linkedin.com/in/example' }
  },
  {
    name: 'Tom Okafor',
    title: 'Design Director',
    bio: 'Product designer who prototypes in code. Obsessive about interface clarity under real data.',
    order: 5,
    socials: { linkedin: 'https://linkedin.com/in/example', twitter: 'https://twitter.com/example' }
  },
  {
    name: 'Lena Fischer',
    title: 'Client Partner',
    bio: 'Translates between boardroom outcomes and engineering roadmaps, and keeps both honest.',
    order: 6,
    socials: { linkedin: 'https://linkedin.com/in/example' }
  }
];

const customers = [
  { name: 'NexBank', industry: 'Financial Services', country: 'United Kingdom', since: 2019, summary: 'Core banking rebuild and a cutover nobody noticed.', projectSlug: '', isFeatured: true, order: 1 },
  { name: 'Clarity Health', industry: 'Healthcare', country: 'United States', since: 2021, summary: 'Clinical workflow platform used across 14 sites.', isFeatured: true, order: 2 },
  { name: 'Meridian Freight', industry: 'Logistics', country: 'Netherlands', since: 2020, summary: 'Real-time visibility across 3,000 daily shipments.', isFeatured: true, order: 3 },
  { name: 'Northwind Retail', industry: 'Retail', country: 'United Kingdom', since: 2022, summary: 'Unified commerce across web, app and 60 stores.', isFeatured: true, order: 4 },
  { name: 'Halden Manufacturing', industry: 'Manufacturing', country: 'Germany', since: 2021, order: 5 },
  { name: 'Civic Digital', industry: 'Public Sector', country: 'United Kingdom', since: 2023, order: 6 },
  { name: 'Voltra Energy', industry: 'Energy', country: 'Norway', since: 2022, order: 7 },
  { name: 'Lumen Education', industry: 'Education', country: 'Nepal', since: 2023, order: 8 }
];

const testimonials = [
  {
    name: 'Casey Tran',
    role: 'Chief Technology Officer',
    company: 'NexBank',
    quote:
      'Yak Stack delivered our core rebuild ahead of schedule with a rigour we had not seen from a partner before. The cutover took eleven minutes and nobody outside the team noticed.',
    rating: 5,
    isFeatured: true
  },
  {
    name: 'Dr. Amara Osei',
    role: 'Chief Medical Officer',
    company: 'Clarity Health',
    quote:
      'They understood the clinical workflow better than some of our own vendors. Nine months from first conversation to a platform our clinicians genuinely like using.',
    rating: 5,
    isFeatured: true
  },
  {
    name: 'Jonas Berg',
    role: 'VP Operations',
    company: 'Meridian Freight',
    quote:
      'The visibility dashboard paid for itself in the first quarter. Our exception handling went from reactive phone calls to something we actually manage.',
    rating: 5,
    isFeatured: true
  },
  {
    name: 'Rachel Kim',
    role: 'Head of Data',
    company: 'Harbour Retail Group',
    quote:
      'What impressed me was the restraint. They talked us out of two features we thought we wanted, and the forecast was better for it.',
    rating: 5,
    isFeatured: false
  },
  {
    name: 'Stefan Novak',
    role: 'Plant Systems Director',
    company: 'Volta Industries',
    quote:
      'Six plants, four hundred machines, and a rollout that never interrupted a production shift. Their delivery discipline is the real product.',
    rating: 5,
    isFeatured: false
  }
];

const jobs = [
  {
    title: 'Senior Full-Stack Engineer',
    slug: 'senior-full-stack-engineer',
    department: 'Engineering',
    location: 'Remote (UTC±3)',
    type: 'Full-time',
    description:
      'Join a delivery squad building production platforms for clients in finance, health and logistics. You will own features end to end, from API design through to what happens when they page you.',
    requirements: [
      '5+ years building production web applications',
      'Strong TypeScript and Node.js',
      'Comfortable with relational data modelling',
      'Experience owning services in production'
    ],
    applyEmail: 'careers@yakstack.com'
  },
  {
    title: 'Cloud Platform Engineer',
    slug: 'cloud-platform-engineer',
    department: 'Platform',
    location: 'Hybrid, London',
    type: 'Full-time',
    description:
      'Build and operate the Kubernetes and Terraform foundations our delivery teams ship on, with a strong bias toward automation over ticket queues.',
    requirements: [
      'Deep AWS or Azure experience',
      'Terraform in a team setting',
      'Kubernetes operations at scale',
      'CI/CD pipeline design'
    ],
    applyEmail: 'careers@yakstack.com'
  },
  {
    title: 'Product Designer',
    slug: 'product-designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Shape complex enterprise workflows into interfaces people can use under pressure. You will work directly with clients and engineers, prototyping early and often.',
    requirements: [
      'Portfolio of shipped product work',
      'Strong systems thinking and design-system fluency',
      'Comfortable facilitating client workshops'
    ],
    applyEmail: 'careers@yakstack.com'
  },
  {
    title: 'Data Engineer',
    slug: 'data-engineer',
    department: 'Data & AI',
    location: 'Remote (UTC±3)',
    type: 'Full-time',
    description:
      'Design ingestion and transformation pipelines that analysts trust, and the tests that keep them trustworthy.',
    requirements: ['Strong Python and SQL', 'dbt or equivalent modelling experience', 'Orchestration with Airflow or Dagster'],
    applyEmail: 'careers@yakstack.com'
  },
  {
    title: 'Security Engineer',
    slug: 'security-engineer',
    department: 'Security',
    location: 'Hybrid, London',
    type: 'Full-time',
    description:
      'Embed with delivery squads to threat model, review and harden the systems we build, and help clients reach audit readiness.',
    requirements: ['Application security review experience', 'Threat modelling practice', 'Familiarity with SOC 2 or ISO 27001'],
    applyEmail: 'careers@yakstack.com'
  },
  {
    title: 'Engineering Intern (Summer)',
    slug: 'engineering-intern-summer',
    department: 'Engineering',
    location: 'Hybrid, London',
    type: 'Internship',
    description:
      'A twelve-week paid internship pairing with a delivery squad on real client work, with a mentor and a scoped project of your own.',
    requirements: ['Working knowledge of one programming language', 'Curiosity and a willingness to ask questions'],
    applyEmail: 'careers@yakstack.com'
  }
];

const contacts = [
  {
    name: 'Helen Marsh',
    email: 'h.marsh@northwind.example',
    phone: '+44 20 7946 0812',
    subject: 'Platform migration scoping',
    message:
      'We are running a ten-year-old .NET estate and need to move to the cloud without a freeze on feature work. Could we book an initial scoping conversation for the next couple of weeks?',
    status: 'new',
    createdAt: daysAgo(1)
  },
  {
    name: 'Devon Clarke',
    email: 'devon@brightpath.example',
    subject: 'Data warehouse rebuild',
    message:
      'Our reporting takes four days to close the month and nobody trusts the numbers. Looking for a partner to rebuild the warehouse layer properly.',
    status: 'in_progress',
    createdAt: daysAgo(4)
  },
  {
    name: 'Sara Lindqvist',
    email: 'sara.l@fjordlogistics.example',
    phone: '+46 8 123 456',
    subject: 'SOC 2 readiness',
    message: 'We have an audit in six months and no formal controls documented. Where would you start?',
    status: 'resolved',
    createdAt: daysAgo(12)
  },
  {
    name: 'Marcus Webb',
    email: 'm.webb@aperture.example',
    subject: 'Mobile app rebuild',
    message: 'Our React Native app is three major versions behind and crashing on newer devices. Interested in a health check.',
    status: 'new',
    createdAt: daysAgo(2)
  }
];

/**
 * Wipes and repopulates every collection. Shared by the `seed` CLI and the
 * in-memory dev server; assumes a live mongoose connection already exists.
 */
export const seedDatabase = async () => {
  await Promise.all([
    Admin.deleteMany({}),
    Service.deleteMany({}),
    Project.deleteMany({}),
    Blog.deleteMany({}),
    TeamMember.deleteMany({}),
    Testimonial.deleteMany({}),
    Customer.deleteMany({}),
    Job.deleteMany({}),
    ContactMessage.deleteMany({}),
    WebsiteSettings.deleteMany({})
  ]);

  const admin = await Admin.create({
    name: 'Yak Stack Admin',
    email: 'admin@yakstack.com',
    password: 'Admin@123456',
    role: 'admin'
  });

  await Admin.create({
    name: 'Content Editor',
    email: 'editor@yakstack.com',
    password: 'Editor@123456',
    role: 'editor'
  });

  await Service.insertMany(services);
  await Project.insertMany(projects);
  await TeamMember.insertMany(team);
  await Testimonial.insertMany(testimonials);
  await Customer.insertMany(customers);
  await Job.insertMany(jobs);
  await ContactMessage.insertMany(contacts);

  // Created individually so the pre-save hook computes reading time.
  await Promise.all(blogs.map((blog) => Blog.create(blog)));

  await WebsiteSettings.create({
    siteName: 'Yak Stack Solution',
    email: 'hello@yakstack.com',
    phone: '+1 (555) 203-8877',
    address: '4th Floor, 128 Prospect Street, London EC2A 4NE',
    primaryColor: '#0B1220',
    secondaryColor: '#F97316',
    socials: {
      linkedin: 'https://linkedin.com/company/example',
      twitter: 'https://twitter.com/example',
      github: 'https://github.com/example'
    },
    seo: {
      metaTitle: 'Yak Stack Solution \u2014 Engineering digital platforms that scale',
      metaDescription:
        'Yak Stack Solution is an IT consultancy delivering cloud platforms, product engineering, data and AI systems for regulated industries.',
      keywords: ['IT consultancy', 'cloud engineering', 'product development', 'data analytics', 'cybersecurity']
    }
  });

  return {
    admin,
    counts: {
      services: services.length,
      projects: projects.length,
      blogs: blogs.length,
      team: team.length,
      testimonials: testimonials.length,
      customers: customers.length,
      jobs: jobs.length,
      contacts: contacts.length
    }
  };
};
