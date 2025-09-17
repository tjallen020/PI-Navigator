import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { inMemoryStore } from '../services/inMemoryStore';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['FRONTLINE', 'MANAGER', 'FACILITATOR', 'ADMIN']).default('FRONTLINE'),
  unit: z.string().optional(),
  preferences: z.object({ plainLanguage: z.boolean().optional() }).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function signToken(userId: string, role: string) {
  const secret = process.env.JWT_SECRET || 'supersecret';
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: '12h' });
}

export const register = (req: Request, res: Response) => {
  const parsed = registerSchema.parse(req.body);
  const hashed = bcrypt.hashSync(parsed.password, 10);
  const saved = inMemoryStore.createUser({
    name: parsed.name,
    email: parsed.email,
    password: hashed,
    role: parsed.role,
    unit: parsed.unit,
    preferences: parsed.preferences
  });
  const token = signToken(saved.id, saved.role);
  res.status(201).json({
    token,
    user: {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      unit: saved.unit,
      preferences: saved.preferences
    }
  });
};

export const login = (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body);
  const user = inMemoryStore.findUserByEmail(parsed.email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const match = bcrypt.compareSync(parsed.password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signToken(user.id, user.role);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      unit: user.unit,
      preferences: user.preferences
    }
  });
};
