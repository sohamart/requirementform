import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || '',
  ALLOW_IN_MEMORY_DB: process.env.ALLOW_IN_MEMORY_DB !== 'false',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secure_jwt_secret_key_for_digital_development_portal_32chars',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'super_secure_cookie_secret_key_for_digital_development_portal_32chars',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DEFAULT_BRAND_NAME: process.env.DEFAULT_BRAND_NAME || 'Weblets',
  DEFAULT_BRAND_COLOR: process.env.DEFAULT_BRAND_COLOR || '#FF6B00',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@agency.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@Agency2026!',
  SESSION_EXPIRY_DAYS: 7,
  // GoDaddy Domains API
  GODADDY_API_KEY: process.env.GODADDY_API_KEY || '',
  GODADDY_API_SECRET: process.env.GODADDY_API_SECRET || '',
  GODADDY_ENV: (process.env.GODADDY_ENV || 'production').toLowerCase() as 'production' | 'ote' | 'test',
};

