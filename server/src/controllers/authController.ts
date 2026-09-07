import { Request, Response } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import Admin from '../models/Admin';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
const passwordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

async function getAdmin() {
  const existing = await Admin.findOne({ email: env.adminEmail.toLowerCase() }).select(
    '+passwordHash',
  );
  if (existing) return existing;
  return Admin.create({ email: env.adminEmail.toLowerCase(), passwordHash: env.adminHash });
}

export async function login(req: Request, res: Response) {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const admin = await getAdmin();
  if (
    value.email.toLowerCase() !== admin.email ||
    !(await bcrypt.compare(value.password, admin.passwordHash))
  ) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  return res.json({ token: jwt.sign({ email: admin.email }, env.jwtSecret, { expiresIn: '7d' }) });
}

export async function changePassword(req: Request, res: Response) {
  const { error, value } = passwordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const admin = await getAdmin();
  if (!(await bcrypt.compare(value.currentPassword, admin.passwordHash))) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }
  admin.passwordHash = await bcrypt.hash(value.newPassword, 12);
  await admin.save();
  return res.status(204).end();
}
