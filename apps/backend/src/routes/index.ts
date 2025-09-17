import type { Express } from 'express';

import { authenticate } from '../middleware/auth.js';
import { authRouter } from './auth.js';
import { decisionRouter } from './nodes.js';
import { packagesRouter } from './packages.js';
import { sessionsRouter } from './sessions.js';
import { toolsRouter } from './tools.js';
import { exportRouter } from './pptExport.js';
import { feedbackRouter } from './feedback.js';
import { dashboardRouter } from './usage.js';

export const registerRoutes = (app: Express) => {
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use('/tools', authenticate(), toolsRouter);
  app.use('/packages', authenticate(), packagesRouter);
  app.use('/nodes', authenticate(), decisionRouter);
  app.use('/sessions', authenticate(), sessionsRouter);
  app.use('/export', authenticate(), exportRouter);
  app.use('/feedback', authenticate(), feedbackRouter);
  app.use('/dashboard', authenticate(['FACILITATOR', 'ADMIN']), dashboardRouter);
};
