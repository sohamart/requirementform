import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://sohamduttabwn_db_user:uXD7AwhvqeSGdTqV@requirements.rlwvxbx.mongodb.net/?retryWrites=true&w=majority',
  ALLOW_IN_MEMORY_DB: process.env.ALLOW_IN_MEMORY_DB !== 'false',
  JWT_SECRET: process.env.JWT_SECRET || 'NNjvPBkJpb0U7mdgh0RhoIQ1KVo17srkfderoBcLEct',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'KICSENoefvCJtw4h8EeDJzFW3+9xiMkbgKRTQarC/o8=',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DEFAULT_BRAND_NAME: process.env.DEFAULT_BRAND_NAME || 'Weblets',
  DEFAULT_BRAND_COLOR: process.env.DEFAULT_BRAND_COLOR || '#FF6B00',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'sohamduttabwn@gmail.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Rohit@1905',
  SESSION_EXPIRY_DAYS: 7,
  // GoDaddy Domains API
  GODADDY_API_KEY: process.env.GODADDY_API_KEY || 'hkxkAhW8Dtzr_8FG7HRgw2jQUfhY4y4G5NH',
  GODADDY_API_SECRET: process.env.GODADDY_API_SECRET || 'YNbakyetU765nXS7UeHeyT',
  GODADDY_ENV: (process.env.GODADDY_ENV || 'production').toLowerCase() as 'production' | 'ote' | 'test',
};

