import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { usersRoutes } from './routes/users';
import { glassesRoutes } from './routes/glasses';
import { postsRoutes } from './routes/posts';
import { boardRoutes } from './routes/board';
import { screeningRoutes } from './routes/screening';
import { interactionsRoutes } from './routes/interactions';
import { runInteractionSimulation } from './services/simulation';
import { cleanupExpiredData } from './services/cleanup';

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/', (c) => {
  return c.json({ status: 'ok', service: 'glasses-pasture' });
});

// API routes
app.route('/api/users', usersRoutes);
app.route('/api/glasses', glassesRoutes);
app.route('/api/posts', postsRoutes);
app.route('/api/board', boardRoutes);
app.route('/api/screening', screeningRoutes);
app.route('/api/interactions', interactionsRoutes);

// Export for Cloudflare Workers
export default {
  fetch: app.fetch,

  // Cron trigger handler
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(Promise.all([
      runInteractionSimulation(env.DB),
      cleanupExpiredData(env.DB),
    ]));
  },
};
