import 'express-async-errors';

import { env } from './config/env.js';
import { createApp } from './server.js';

const app = createApp();

app.listen(parseInt(env.PORT, 10), () => {
  // eslint-disable-next-line no-console
  console.log(`QI Tool Selector backend listening on port ${env.PORT}`);
});
