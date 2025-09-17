import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '../config/env.js';
import { prisma } from '../utils/prisma.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(1),
  role: z.enum(['FRONTLINE', 'MANAGER', 'FACILITATOR', 'ADMIN']).default('FRONTLINE'),
  unit: z.string().optional(),
});

const preferenceSchema = z.object({
  plainLanguage: z.boolean().optional(),
});

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const payload = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role,
      unit: payload.unit,
      preferences: { plainLanguage: true },
    },
  });
  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '12h' });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      unit: user.unit,
      preferences: user.preferences,
    },
  });
});

authRouter.post('/login', async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '12h' });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      unit: user.unit,
      preferences: user.preferences,
    },
  });
});

authRouter.patch('/preferences', authenticate(), async (req: AuthenticatedRequest, res) => {
  const payload = preferenceSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!existing) {
    return res.status(404).json({ message: 'User not found' });
  }
  const preferences = { ...(existing.preferences as Record<string, unknown> | null) ?? {}, ...payload };
  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: { preferences },
    select: { id: true, name: true, email: true, role: true, unit: true, preferences: true },
  });
  res.json({ user: updated });
});
