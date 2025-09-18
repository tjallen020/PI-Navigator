import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export function authenticate(requiredRoles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const [, token] = auth.split(' ');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret') as TokenPayload;
      (req as Request & { user?: { id: string; role: string } }).user = { id: decoded.sub, role: decoded.role };
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}
