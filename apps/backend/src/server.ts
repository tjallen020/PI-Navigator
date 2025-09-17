import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { errorHandler } from './middleware/errorHandler.js';
import { registerRoutes } from './routes/index.js';

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  registerRoutes(app);

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist = path.resolve(currentDir, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
};
