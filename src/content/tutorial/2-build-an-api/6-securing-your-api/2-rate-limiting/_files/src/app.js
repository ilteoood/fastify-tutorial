import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import taskRoutes from './routes/tasks.js';
import { createTaskStore } from './store/tasks.js';

export async function buildApp({ storeFilePath, ...options } = {}) {
  const fastify = Fastify({ ...options, logger: options.logger ?? false });

  await fastify.register(cors, {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
    xFrameOptions: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  // TODO: import and register @fastify/rate-limit for every route, 100 requests per minute

  fastify.decorate('tasks', await createTaskStore({ filePath: storeFilePath }));

  fastify.removeContentTypeParser('text/plain');

  fastify.addContentTypeParser(
    'text/plain',
    { parseAs: 'string' },
    (request, body, done) => {
      const title = body.trim();

      if (title === '') {
        const error = new Error('title is required');
        error.statusCode = 400;

        return done(error);
      }

      done(null, { title });
    },
  );

  fastify.register(taskRoutes, { prefix: '/api' });

  fastify.get('/', async () => {
    return {
      name: 'Tasks API',
      endpoints: [
        'GET /api/tasks',
        'POST /api/tasks',
        'GET /api/tasks/:id',
        'PATCH /api/tasks/:id',
        'DELETE /api/tasks/:id',
      ],
    };
  });

  return fastify;
}
