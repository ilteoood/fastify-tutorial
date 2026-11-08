import Fastify from 'fastify';
import taskRoutes from './routes/tasks.js';
import { createTaskStore } from './store/tasks.js';

export async function buildApp(options = {}) {
  const fastify = Fastify({
    logger: {
      level: 'info',
      redact: ['req.headers.authorization', 'req.headers.cookie'],
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            host: request.host,
            remoteAddress: request.ip,
            headers: request.headers,
          };
        },
      },
    },
    ...options,
  });

  fastify.decorate('tasks', createTaskStore());

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
