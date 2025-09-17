import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', details: err.errors });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
};
