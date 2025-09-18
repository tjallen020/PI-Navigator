import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import toolRoutes from './routes/toolRoutes';
import decisionRoutes from './routes/decisionRoutes';
import sessionRoutes from './routes/sessionRoutes';
import exportRoutes from './routes/exportRoutes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(helmet());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/', toolRoutes);
app.use('/', decisionRoutes);
app.use('/', sessionRoutes);
app.use('/', exportRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
