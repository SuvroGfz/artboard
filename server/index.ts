import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import drawings from './routes/drawings.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Routes
app.route('/api/drawings', drawings);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', service: 'artboard' }));

// Start server
const port = Number(process.env.PORT) || 3001;

console.log(`🎨 Artboard API server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
