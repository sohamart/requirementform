/**
 * Shared System Constants & Seed Definitions
 */

export interface SeedPackage {
  slug: string;
  category: 'website' | 'app' | 'desktop';
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
  category: 'website' | 'app' | 'desktop' | 'both' | 'all';
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
    description: 'High-conversion single page landing experience tailored for marketing campaigns, ad lead generation, and product launches.',
    pricingMode: 'fixed',
    standardPricePaise: 799900, // ₹7,999
    offerPricePaise: 499900,    // ₹4,999
    billingFrequency: 'one_time',
    features: [
      'Single High-Converting Lead Generation Page',
      'Hero Section with Compelling Call-to-Action',
      'Mobile Responsive & Ultra-Fast Loading Speed',
      'Contact Form & Direct WhatsApp Chat Button',
      'Basic On-Page SEO & Social Meta Tags',
      'Google Analytics 4 & Meta Pixel Setup',
      'Free Lifetime SSL Security Certificate',
      '100% Full Source Code & Asset Handover',
    ],
    maxRevisions: 2,
    isActive: true,
    order: 1,
  },
  {
    slug: 'portfolio-website',
    category: 'website',
    name: 'Portfolio Website',
    description: 'Showcase creative work, client projects, and professional credibility with a bespoke interactive portfolio.',
    pricingMode: 'fixed',
    standardPricePaise: 999900, // ₹9,999
    offerPricePaise: 599900,    // ₹5,999
    billingFrequency: 'one_time',
    features: [
      'Up to 4 Custom Interactive Pages',
      'Creative Work & Project Case Studies Gallery',
      'About, Biography & CV/Resume Download Section',
      'Direct Client Inquiry & Contact Form',
      'High-Speed Performance & CDN Caching',
      'Mobile-First Layout with Smooth Animations',
      'Free Lifetime SSL Certificate & Cloudflare CDN',
      'Google Search Console & Basic SEO Setup',
      '100% Full Source Code & Copyright Ownership',
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
    standardPricePaise: 1899900, // ₹18,999
    offerPricePaise: 1049900,    // ₹10,499 (Save ₹8,500)
    billingFrequency: 'one_time',
    features: [
      '1st Year Free Domain (.com / .in) Included (Renewal applicable from 2nd year)',
      '1st Year High-Speed SSD Cloud Hosting Included (Renewal applicable from 2nd year)',
      'Up to 7 Custom Business Pages',
      'Services & Case Studies Interactive Showcase',
      'Lead Capture Contact & Quote Request Forms',
      'Direct WhatsApp Floating Chat Integration',
      'Google Maps & Local Business Location Setup',
      'Speed & Technical On-Page SEO Optimization',
      'Free Lifetime SSL Security Certificate',
      'Full Source Code & 100% IP Ownership',
    ],
    maxRevisions: 3,
    isActive: true,
    order: 3,
  },
  {
    slug: 'blog-news-website',
    category: 'website',
    name: 'Blog / News Website',
    description: 'Content-driven publishing platform with categories, author profiles, ad monetization, and reader engagement.',
    pricingMode: 'fixed',
    standardPricePaise: 1799900, // ₹17,999
    offerPricePaise: 999900,     // ₹9,999 (Save ₹8,000)
    billingFrequency: 'one_time',
    features: [
      '1st Year Free Domain (.com / .in) Included (Renewal applicable from 2nd year)',
      '1st Year High-Speed SSD Cloud Hosting Included (Renewal applicable from 2nd year)',
      'Modern Editorial Content & Article Layout',
      'Dynamic Categories, Tags & Search Archive',
      'Author Profiles & Social Media Sharing',
      'Newsletter / Subscriber Lead Integration',
      'Ad Slot & Google AdSense Monetization Readiness',
      'Fast Page Speed & Core Web Vitals Optimization',
      'Free SSL Certificate & Cloudflare DDoS Shield',
      '100% Full Source Code Handover',
    ],
    maxRevisions: 2,
    isActive: true,
    order: 4,
  },
  {
    slug: 'booking-website',
    category: 'website',
    name: 'Booking Website',
    description: 'Direct appointment scheduling, calendar synchronization, and service bookings for clinics, consultants, and studios.',
    pricingMode: 'fixed',
    standardPricePaise: 2699900, // ₹26,999
    offerPricePaise: 1499900,    // ₹14,999 (Save ₹12,000)
    billingFrequency: 'one_time',
    features: [
      '1st Year Free Domain (.com / .in) Included (Renewal applicable from 2nd year)',
      '1st Year High-Speed SSD Cloud Hosting Included (Renewal applicable from 2nd year)',
      'Automated Appointment Booking & Scheduling Flow',
      'Google Calendar & Real-Time Slot Synchronization',
      'Email & WhatsApp/SMS Booking Confirmations',
      'Service Menu with Dynamic Pricing & Durations',
      'Customer & Booking Management Dashboard',
      'Advance Payment Gateway Integration (Razorpay/UPI)',
      'Automated Daily Backups & SSL Encryption',
      '100% Full Source Code & Admin Handover',
    ],
    maxRevisions: 3,
    isActive: true,
    order: 5,
  },
  {
    slug: 'ecommerce-store',
    category: 'website',
    name: 'E-commerce Store',
    description: 'Feature-rich online store with catalog, shopping cart, checkout, payment gateway, inventory, and order notifications.',
    pricingMode: 'fixed',
    standardPricePaise: 3499900, // ₹34,999
    offerPricePaise: 1899900,    // ₹18,999 (Save ₹16,000)
    billingFrequency: 'one_time',
    features: [
      '1st Year Free Domain (.com / .in) Included (Renewal applicable from 2nd year)',
      '1st Year High-Speed SSD Cloud Hosting Included (Renewal applicable from 2nd year)',
      'Full Product Catalog & Multi-Level Categories',
      'Shopping Cart & High-Converting One-Page Checkout',
      'Indian & International Payment Gateways (Razorpay/Stripe/UPI)',
      'Automated Order Invoicing & GST Tax Calculation',
      'Discount Coupons, Promo Codes & Sale Banners',
      'Real-Time Inventory & Stock Depletion Tracking',
      'Customer Accounts, Wishlist & Order Tracking Portal',
      'Dedicated Admin Dashboard & Sales Analytics',
      'SSL Security & Cloudflare DDoS Protection',
      '100% Full Source Code & Product Upload Training',
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
    standardPricePaise: 4499900, // ₹44,999
    offerPricePaise: 2499900,    // ₹24,999 (Save ₹20,000)
    billingFrequency: 'one_time',
    features: [
      '1st Year Free Domain (.com / .in) Included (Renewal applicable from 2nd year)',
      '1st Year High-Speed SSD Cloud Hosting Included (Renewal applicable from 2nd year)',
      'Full Course Curriculum & Chapter Video Player',
      'Student Enrollment, Login & Chapter Progress Tracking',
      'Secured Video Streaming & Anti-Download Protection',
      'Instant Checkout & Automated Course Enrollment',
      'Quizzes, Assessments & Evaluation Module',
      'Automated PDF Course Completion Certificates',
      'Instructor & Student Discussion Q&A Forum',
      'Dedicated Admin Dashboard & Revenue Analytics',
      'Daily Cloud Backups & SSL Security',
      '100% Full Source Code & System Handover',
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
    standardPricePaise: 5499900, // ₹54,999
    offerPricePaise: 3199900,    // ₹31,999 (Save ₹23,000)
    billingFrequency: 'one_time',
    features: [
      '1st Year Free Domain (.com / .in) Included (Renewal applicable from 2nd year)',
      '1st Year High-Speed SSD Cloud Hosting Included (Renewal applicable from 2nd year)',
      'Custom Role-Based Web Application Architecture',
      'Interactive Client & Admin Real-Time Dashboards',
      'Scalable Database & REST API Architecture',
      'Third-Party Services, Webhook & Payment Integrations',
      'Complex Workflow & Business Automation Logic',
      'Dedicated Cloud Deployment (AWS/Vercel/DigitalOcean)',
      'Automated CI/CD Pipeline & GitHub Repository Setup',
      'Comprehensive Technical Documentation & 100% IP Ownership',
    ],
    maxRevisions: 4,
    isActive: true,
    order: 8,
  },
];

export const INITIAL_APP_PACKAGES: SeedPackage[] = [
  {
    slug: 'starter-mobile-app',
    category: 'app',
    name: 'Starter Mobile App (Android/iOS)',
    description: 'MVP mobile app with core interactive screens, user authentication, and Firebase cloud backend integration.',
    pricingMode: 'fixed',
    standardPricePaise: 2499900, // ₹24,999
    offerPricePaise: 1499900,    // ₹14,999
    billingFrequency: 'one_time',
    features: [
      'Up to 5 Custom Mobile Screens',
      'Cross-Platform Flutter / React Native Build',
      'User Authentication (Email & Google Sign-In)',
      'Firebase Cloud Firestore & Storage Setup',
      'Automated Push Notifications via FCM',
      'Production APK & iOS IPA Build Export',
      '100% Full Source Code & Handover',
    ],
    maxRevisions: 2,
    isActive: true,
    order: 1,
  },
  {
    slug: 'business-mobile-app',
    category: 'app',
    name: 'Business Mobile App',
    description: 'Commercial business application with catalog, customer booking, profile management, and payment gateway.',
    pricingMode: 'fixed',
    standardPricePaise: 3999900, // ₹39,999
    offerPricePaise: 2499900,    // ₹24,999
    billingFrequency: 'one_time',
    features: [
      'Up to 12 Interactive Custom Screens',
      'Direct WhatsApp & Phone Click-to-Call Actions',
      'Indian Payment Gateway (Razorpay/UPI Integration)',
      'In-App Push Notifications & Customer Alerts',
      'Customer Profile, Favorites & Order History',
      'Google Maps & Location Store Locator',
      'App Store & Google Play Upload Assistance',
      'Full Source Code & 100% IP Ownership',
    ],
    maxRevisions: 3,
    isActive: true,
    order: 2,
  },
  {
    slug: 'ecommerce-mobile-app',
    category: 'app',
    name: 'E-commerce Mobile App',
    description: 'High-converting mobile shopping app with product catalog, cart, coupons, orders, and real-time order tracking.',
    pricingMode: 'fixed',
    standardPricePaise: 5999900, // ₹59,999
    offerPricePaise: 3899900,    // ₹38,999
    billingFrequency: 'one_time',
    features: [
      'Multi-Category Product Catalog & Fast Search',
      'Shopping Cart & One-Click Razorpay/Stripe Checkout',
      'Real-Time Live Order Status & Delivery Tracking',
      'Discount Coupons, Promo Codes & Sale Banners',
      'Customer Wishlist & Multi-Address Book',
      'Dedicated Admin Dashboard & Sales Analytics',
      'Automated Push Notification Marketing Campaigns',
      '100% Full Source Code Handover',
    ],
    maxRevisions: 3,
    isActive: true,
    order: 3,
  },
  {
    slug: 'custom-enterprise-app',
    category: 'app',
    name: 'Custom Enterprise Mobile App',
    description: 'Mission-critical enterprise mobile app with offline synchronization, role-based workflows, and ERP backend integration.',
    pricingMode: 'starting_price',
    standardPricePaise: 8999900, // ₹89,999
    offerPricePaise: 5999900,    // ₹59,999
    billingFrequency: 'one_time',
    features: [
      'Complex Custom Business Logic & Multi-Role RBAC',
      'Real-Time WebSockets & Offline Data Synchronization',
      'Biometric Authentication (FaceID & Fingerprint)',
      'Custom Node.js / Express REST & GraphQL Backend',
      'Enterprise Cloud Architecture (AWS / GCP / Docker)',
      'Automated CI/CD Fastlane Build & Release Pipeline',
      'Comprehensive Technical Architecture Documentation',
      '100% Lifetime Source Code & Full IP Ownership',
    ],
    maxRevisions: 4,
    isActive: true,
    order: 4,
  },
];

export const INITIAL_DESKTOP_PACKAGES: SeedPackage[] = [
  {
    slug: 'desktop-utility-tool',
    category: 'desktop',
    name: 'Desktop Utility & Tool App',
    description: 'Fast standalone desktop application for Windows & macOS with local file processing, offline utility, and modern UI.',
    pricingMode: 'fixed',
    standardPricePaise: 1999900, // ₹19,999
    offerPricePaise: 1299900,    // ₹12,999
    billingFrequency: 'one_time',
    features: [
      'Cross-Platform Windows (.exe/MSI) & macOS (.dmg) Build',
      'High-Speed Electron / Tauri Architecture',
      'Local File System Access & Document Processing',
      '100% Offline Operation (Zero Cloud Dependency)',
      'Modern Dark & Light Mode Glassmorphism Interface',
      'Auto-Updater Configuration for Smooth Releases',
      '100% Full Source Code & Project Handover',
    ],
    maxRevisions: 2,
    isActive: true,
    order: 1,
  },
  {
    slug: 'desktop-business-pos',
    category: 'desktop',
    name: 'Business POS & Billing Desktop App',
    description: 'Offline-first Point-of-Sale billing software with barcode scanning, thermal receipt printing, and local SQLite database.',
    pricingMode: 'fixed',
    standardPricePaise: 3699900, // ₹36,999
    offerPricePaise: 2299900,    // ₹22,999
    billingFrequency: 'one_time',
    features: [
      'Fast POS Billing & Quick Cash Counter Keyboard Shortcuts',
      'ESC/POS Thermal Receipt Printer Integration (2" & 3")',
      'USB & Bluetooth Barcode / QR Scanner Compatibility',
      'Offline SQLite Encrypted Database (SQLCipher Security)',
      'Daily Sales, Tax Summary & Stock Depletion Reports',
      'Customer Credit Ledger & Udhar Khata Management',
      'Automated Daily Local Database Backups',
      '100% Source Code Ownership & Desktop Setup Support',
    ],
    maxRevisions: 3,
    isActive: true,
    order: 2,
  },
  {
    slug: 'desktop-enterprise-erp',
    category: 'desktop',
    name: 'Enterprise Desktop ERP Software',
    description: 'Comprehensive desktop management system with local network multi-terminal sync, accounting, and cloud hybrid backup.',
    pricingMode: 'fixed',
    standardPricePaise: 6499900, // ₹64,999
    offerPricePaise: 3999900,    // ₹39,999
    billingFrequency: 'one_time',
    features: [
      'Multi-Terminal Local Network (LAN) Real-Time Data Sync',
      'Comprehensive Inventory, Billing, GST & Multi-Store Accounting',
      'Role-Based Employee Access (Admin, Cashier, Manager)',
      'One-Click Excel / PDF Bulk Report Generator & Exports',
      'Hybrid Local SQLite & Encrypted Cloud Backup Sync',
      'Custom Shortcut Hotkeys for High-Speed Typing',
      'Dedicated Windows & macOS Desktop Installer Wizard',
      'Lifetime Source Code & Full IP Ownership Handover',
    ],
    maxRevisions: 3,
    isActive: true,
    order: 3,
  },
  {
    slug: 'desktop-custom-app',
    category: 'desktop',
    name: 'Custom Native Desktop Software',
    description: 'Bespoke high-performance native desktop application with hardware acceleration, background daemon workers, and custom device integration.',
    pricingMode: 'starting_price',
    standardPricePaise: 8999900, // ₹89,999
    offerPricePaise: 5499900,    // ₹54,999
    billingFrequency: 'one_time',
    features: [
      'C# / .NET / Rust / Tauri Native High-Performance Build',
      'Serial Port, COM Port & Custom Hardware Device Drivers',
      'Background Service / Daemon Worker Capabilities',
      'Hardware-Locked License Key & DRM Protection System',
      'Ultra-Low RAM Footprint & Rapid Sub-Second Startup',
      'Automated Windows / Mac Code Signing & Installer Generation',
      'Enterprise Source Code & Architectural Documentation',
      '100% IP & Copyright Handover',
    ],
    maxRevisions: 4,
    isActive: true,
    order: 4,
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
    category: 'website',
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
    category: 'all',
    name: 'Monthly Maintenance & Support',
    description: 'Continuous uptime monitoring, security patching, monthly backups, and minor text/image updates.',
    billingType: 'monthly',
    unitPricePaise: 99900, // ₹999 / month
    isActive: true,
    order: 4,
  },
  {
    slug: 'priority-delivery',
    category: 'all',
    name: 'Priority Fast-Track Delivery',
    description: 'Accelerated development sprint delivering the completed initial build in record turnaround time.',
    billingType: 'one_time',
    unitPricePaise: 200000, // ₹2,000
    isActive: true,
    order: 5,
  },
  {
    slug: 'extra-standard-page',
    category: 'website',
    name: 'Extra Standard Web Page',
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
  {
    slug: 'code-signing-certificate',
    category: 'desktop',
    name: 'Code Signing Certificate & Windows SmartScreen Setup',
    description: 'Configures EV / OV Code Signing certificates to prevent "Unknown Publisher" security warnings during desktop app installation.',
    billingType: 'one_time',
    unitPricePaise: 350000, // ₹3,500
    isActive: true,
    order: 8,
  },
  {
    slug: 'thermal-printer-driver',
    category: 'desktop',
    name: 'Thermal Receipt Printer Driver Integration',
    description: 'Direct ESC/POS hardware integration for thermal receipt printers (2" and 3" roll formats).',
    billingType: 'one_time',
    unitPricePaise: 250000, // ₹2,500
    isActive: true,
    order: 9,
  },
  {
    slug: 'sqlite-encrypted-db',
    category: 'desktop',
    name: 'SQLCipher Encrypted Local Database Module',
    description: '256-bit AES encryption on the local desktop database to prevent unauthorized access or data theft.',
    billingType: 'one_time',
    unitPricePaise: 200000, // ₹2,000
    isActive: true,
    order: 10,
  },
  {
    slug: 'app-store-publishing',
    category: 'app',
    name: 'Apple App Store & Google Play Publishing Assistance',
    description: 'Complete hands-on assistance preparing screenshots, store metadata, privacy policy compliance, and review submission.',
    billingType: 'one_time',
    unitPricePaise: 300000, // ₹3,000
    isActive: true,
    order: 11,
  },
];

export const INITIAL_BRANDS: SeedBrand[] = [
  {
    name: 'Esyus × Weblets',
    tagline: 'Joint Venture: Full-Spectrum Web, Mobile & Enterprise Engineering',
    logoText: 'ESYUS × WEBLETS',
    primaryColor: '#F97316',
    secondaryColor: '#18181B',
    contactEmail: 'solutions@esyus-weblets.com',
    contactPhone: '+91 98765 99999',
    websiteUrl: 'https://esyus-weblets.com',
    addressLines: ['Consortium Center, Suite 100', 'Bandra Kurla Complex, Mumbai 400051', 'India'],
    isDefault: true,
    isActive: true,
  },
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
    isDefault: false,
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
  'view_google_drive',     // Required to view Google Drive Hub and synced project folders
  'manage_google_drive',   // Required to 1-click bulk sync, upload images & files to Google Drive
  'manage_users',
  'manage_settings',
] as const;

export type SystemPermission = typeof SYSTEM_PERMISSIONS[number];
