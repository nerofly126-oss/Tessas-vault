import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config();
const required = [
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
];
for (const key of required)
  if (!process.env[key]) console.warn(`Missing environment variable: ${key}`);
export const env = {
  mongoUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  adminEmail: process.env.ADMIN_EMAIL!,
  adminHash: process.env.ADMIN_PASSWORD_HASH!,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  },
};
