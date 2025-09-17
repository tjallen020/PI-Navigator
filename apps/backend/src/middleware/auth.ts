import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { HttpError } from './errorHandler.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (roles?: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpError(401, 'Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
      req.user = payload;
      if (roles && !roles.includes(payload.role)) {
        throw new HttpError(403, 'Insufficient permissions');
      }
      next();
    } catch (error) {
      throw new HttpError(401, 'Invalid or expired token');
    }
  };
};
