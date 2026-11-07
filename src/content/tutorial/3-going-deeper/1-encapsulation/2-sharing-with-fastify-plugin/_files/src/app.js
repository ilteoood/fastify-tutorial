import Fastify from 'fastify';
import settings from './plugins/settings.js';
import taskRoutes from './routes/tasks.js';
import { createTaskStore } from './store/tasks.js';

export async function buildApp(options = {}) {
  const fastify = Fastify({ ...options, logger: options.logger ?? false });

  fastify.decorate('tasks', createTaskStore());
  fastify.decorate('countOpenTasks', () => {
    return fastify.tasks.list().filter((task) => !task.done).length;
  });

  fastify.register(settings);
  fastify.register(taskRoutes, { prefix: '/api' });

  fastify.get('/', async () => {
    return {
      name: fastify.settings.name,
      version: fastify.settings.version,
      endpoints: [
        'GET /api/tasks',
        'POST /api/tasks',
        'GET /api/tasks/:id',
        'PATCH /api/tasks/:id',
        'DELETE /api/tasks/:id',
        'GET /stats',
      ],
    };
  });

  fastify.get('/stats', async () => {
    return { open: fastify.countOpenTasks() };
  });

  return fastify;
}
