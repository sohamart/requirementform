/**
 * Shared System Constants & Seed Definitions
 */

export interface SeedPackage {
  slug: string;
  category: 'website' | 'app';
  name: string;
  description: string;
  pricingMode: 'fixed' | 'starting_price' | 'manual_review';
  standardPricePaise: number;
  offerPricePaise: number;
  billingFrequency: 'one_time' | 'monthly' | 'yearly';
  features: string[];
  maxRevisions: number;
  isActive: boolean;
  order: number;
}

export interface SeedAddon {
  slug: string;
  category: 'website' | 'app' | 'both';
  name: string;
  description: string;
  billingType: 'one_time' | 'monthly' | 'per_unit';
  unitPricePaise: number;
  unitLabel?: string;
  isActive: boolean;
  order: number;
}

export interface SeedBrand {
  name: string;
  tagline: string;
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  addressLines: string[];
  isDefault: boolean;
  isActive: boolean;
}

export const INITIAL_WEBSITE_PACKAGES: SeedPackage[] = [
  {
    slug: 'landing-page',
    category: 'website',
    name: 'Landing Page',
    description: 'High-conversion single page landing experience tailored for marketing campaigns and product launches.',
    pricingMode: 'fixed',
    standardPricePaise: 799900, // ₹7,999
    offerPricePaise: 499900,    // ₹4,999
    billingFrequency: 'one_time',
    features: [
      'Single High-Converting Page',
      'Hero Section with Call-to-Action',
      'Mobile Responsive & Fast Loading',
      'Contact Form & Lead Capture',
      'Basic On-Page SEO Setup',
      'Social Media Integration'
    ],
    maxRevisions: 2,
    isActive: true,
    order: 1,
  },
  {
    slug: 'portfolio-website',
    category: 'website',
    name: 'Portfolio Website',
    description: 'Showcase creative work, projects, and professional credibility with a bespoke interactive portfolio.',
    pricingMode: 'fixed',
    standardPricePaise: 999900, // ₹9,999
    offerPricePaise: 599900,    // ₹5,999
    billingFrequency: 'one_time',
    features: [
      'Up to 4 Custom Pages',
      'Interactive Work / Project Gallery',
      'About & Resume Section',
      'Inquiry & Contact Form',
      'High-Speed Performance Optimization',
      'Mobile-First Layout'
    ],
    maxRevisions: 2,
    isActive: true,
    order: 2,
  },
  {
    slug: 'business-website',
    category: 'website',
    name: 'Business Website',
    description: 'Corporate presence designed to build authority, explain services, and generate qualified B2B/B2C leads.',
    pricingMode: 'fixed',
    standardPricePaise: 1499900, // ₹14,999
    offerPricePaise: 899900,     // ₹8,999
    billingFrequency: 'one_time',
    features: [
      'Up to 7 Structured Pages',
      'Services & Case Studies Showcase',
      'Interactive Contact & Quote Forms',
      'Google Maps & Business Location',
      'Speed & SEO Optimized Architecture',
      'Security & SSL Configuration'
    ],
    maxRevisions: 3,
    isActive: true,
    order: 3,
  },
  {
    slug: 'blog-news-website',
    category: 'website',
    name: 'Blog / News Website',
    description: 'Content-driven publishing platform with categories, author profiles, and reader engagement.',
    pricingMode: 'fixed',
    standardPricePaise: 1399900, // ₹13,999
    offerPricePaise: 799900,     // ₹7,999
    billingFrequency: 'one_time',
    features: [
      'Modern Editorial Content Layout',
      'Dynamic Categories & Tagging',
      'Author Profiles & Social Sharing',
      'Search & Archive Navigation',
      'Newsletter Subscription Integration',
      'Ad Slot / Monetization Readiness'
    ],
    maxRevisions: 2,
    isActive: true,
    order: 4,
  },
  {
    slug: 'booking-website',
    category: 'website',
    name: 'Booking Website',
    description: 'Direct appointment scheduling, calendar synchronization, and service bookings for professionals and studios.',
    pricingMode: 'fixed',
    standardPricePaise: 2299900, // ₹22,999
    offerPricePaise: 1299900,    // ₹12,999
    billingFrequency: 'one_time',
    features: [
      'Automated Appointment Booking Flow',
      'Calendar Slot Synchronization',
      'Email / SMS Booking Confirmations',
      'Service Menu with Pricing',
      'Customer Management Dashboard',
      'Advance Payment Integration'
    ],
    maxRevisions: 3,
    isActive: true,
    order: 5,
  },
  {
    slug: 'ecommerce-store',
    category: 'website',
    name: 'E-commerce Store',
    description: 'Feature-rich online store with catalog, shopping cart, checkout, payment gateway, and order notifications.',
    pricingMode: 'fixed',
    standardPricePaise: 2999900, // ₹29,999
    offerPricePaise: 1699900,    // ₹16,999
    billingFrequency: 'one_time',
    features: [
      'Full Product Catalog & Categories',
      'Shopping Cart & Secure Checkout',
      'Indian / International Payment Gateways',
      'Order Confirmation & Invoicing',
      'Coupon Codes & Discounts Support',
      'Inventory & Stock Tracking'
    ],
    maxRevisions: 3,
    isActive: true,
    order: 6,
  },
  {
    slug: 'course-lms-website',
    category: 'website',
    name: 'Course / LMS Website',
    description: 'Learning management system with video lectures, student enrollment, lesson progress, and completion certificates.',
    pricingMode: 'fixed',
    standardPricePaise: 3999900, // ₹39,999
    offerPricePaise: 2299900,    // ₹22,999
    billingFrequency: 'one_time',
    features: [
      'Course Curriculum & Chapter Viewer',
      'Student Login & Progress Tracking',
      'Secured Video & Material Access',
      'Enrollment Checkout & Instant Access',
      'Quiz & Assessment Capability',
      'Automated Course Completion Certificates'
    ],
    maxRevisions: 4,
    isActive: true,
    order: 7,
  },
  {
    slug: 'custom-web-app',
    category: 'website',
    name: 'Custom Web App',
    description: 'Bespoke web application with custom business logic, dashboards, relational databases, and third-party APIs.',
    pricingMode: 'starting_price',
    standardPricePaise: 4999900, // ₹49,999
    offerPricePaise: 2999900,    // ₹29,999
    billingFrequency: 'one_time',
    features: [
      'Custom Role-Based Web Application',
      'Interactive Client / Admin Dashboards',
      'Scalable Database & REST API Architecture',
      'Third-Party Services & Webhook Integration',
      'Complex Workflow & Automation Logic',
      'Dedicated Deployment & Cloud Architecture'
    ],
    maxRevisions: 4,
    isActive: true,
    order: 8,
  },
];

export const INITIAL_ADDONS: SeedAddon[] = [
  {
    slug: 'content-assistance',
    category: 'both',
    name: 'Content Assistance',
    description: 'Professional copy editing and structure optimization for pages and promotional sections.',
    billingType: 'one_time',
    unitPricePaise: 150000, // ₹1,500
    isActive: true,
    order: 1,
  },
  {
    slug: 'enhanced-seo',
    category: 'both',
    name: 'Enhanced SEO',
    description: 'Deep meta optimization, schema markup, OpenGraph tags, sitemap submission, and indexing setup.',
    billingType: 'one_time',
    unitPricePaise: 250000, // ₹2,500
    isActive: true,
    order: 2,
  },
  {
    slug: 'business-email-setup',
    category: 'both',
    name: 'Business Email Setup Assistance',
    description: 'Configuration of custom business domain email (Google Workspace / Zoho / Microsoft 365) with DKIM and SPF.',
    billingType: 'one_time',
    unitPricePaise: 99900, // ₹999
    isActive: true,
    order: 3,
  },
  {
    slug: 'monthly-maintenance',
    category: 'both',
    name: 'Monthly Maintenance',
    description: 'Continuous uptime monitoring, security patching, monthly backups, and minor text/image updates.',
    billingType: 'monthly',
    unitPricePaise: 99900, // ₹999 / month
    isActive: true,
    order: 4,
  },
  {
    slug: 'priority-delivery',
    category: 'both',
    name: 'Priority Delivery',
    description: 'Accelerated development sprint delivering the completed initial build in record turnaround time.',
    billingType: 'one_time',
    unitPricePaise: 200000, // ₹2,000
    isActive: true,
    order: 5,
  },
  {
    slug: 'extra-standard-page',
    category: 'website',
    name: 'Extra Standard Page',
    description: 'Additional structured standard page with customized styling, responsive layout, and content placement.',
    billingType: 'per_unit',
    unitPricePaise: 50000, // ₹500 / page
    unitLabel: 'pages',
    isActive: true,
    order: 6,
  },
  {
    slug: 'extra-functional-app-screen',
    category: 'app',
    name: 'Extra Functional App Screen',
    description: 'Additional interactive application screen with UI components, state management, and backend wiring.',
    billingType: 'per_unit',
    unitPricePaise: 120000, // ₹1,200 / screen
    unitLabel: 'screens',
    isActive: true,
    order: 7,
  },
];

export const INITIAL_BRANDS: SeedBrand[] = [
  {
    name: 'Weblets',
    tagline: 'Modern Digital Engineering & High-Impact Web Solutions',
    logoText: 'WEBLETS',
    primaryColor: '#FF6B00',
    secondaryColor: '#121216',
    contactEmail: 'contact@weblets.io',
    contactPhone: '+91 98765 43210',
    websiteUrl: 'https://weblets.io',
    addressLines: ['Tech Hub Tower, Level 4', 'Cyber City, Bangalore 560100', 'India'],
    isDefault: true,
    isActive: true,
  },
  {
    name: 'Esyus',
    tagline: 'Enterprise Applications & Scalable Cloud Software',
    logoText: 'ESYUS',
    primaryColor: '#3B82F6',
    secondaryColor: '#0F172A',
    contactEmail: 'hello@esyus.com',
    contactPhone: '+91 98765 12345',
    websiteUrl: 'https://esyus.com',
    addressLines: ['Innovations Park, Block B', 'HITEC City, Hyderabad 500081', 'India'],
    isDefault: false,
    isActive: true,
  },
  {
    name: 'Weblets × Esyus',
    tagline: 'Joint Venture: Full-Spectrum Web, Mobile & Enterprise Engineering',
    logoText: 'WEBLETS × ESYUS',
    primaryColor: '#F97316',
    secondaryColor: '#18181B',
    contactEmail: 'solutions@weblets-esyus.com',
    contactPhone: '+91 98765 99999',
    websiteUrl: 'https://weblets-esyus.com',
    addressLines: ['Consortium Center, Suite 100', 'Bandra Kurla Complex, Mumbai 400051', 'India'],
    isDefault: false,
    isActive: true,
  },
];

export const SYSTEM_PERMISSIONS = [
  'manage_forms',
  'manage_packages',
  'manage_submissions',
  'manage_quotations',
  'manage_brands',
  'manage_internal_notes', // Required to see/edit private form step notes and submission notes
  'view_financials',       // Required to see Profit & Margin dashboard, costs, profit figures
  'manage_financials',     // Required to add/edit direct costs, expenses, target margins
  'manage_users',
  'manage_settings',
] as const;

export type SystemPermission = typeof SYSTEM_PERMISSIONS[number];
