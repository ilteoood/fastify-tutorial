import Fastify from 'fastify';
import { createTaskStore } from './store/tasks.js';
import { registerLifecycleHooks } from './hooks.js';

export async function buildApp(options = {}) {
  const fastify = Fastify({ ...options, logger: options.logger ?? false });

  fastify.decorate('tasks', createTaskStore());

  fastify.addHook('onClose', async () => {
    fastify.log.info('closing the task store');
    fastify.tasks.close();
  });

  registerLifecycleHooks(fastify);

  // TODO: load the routes folder with @fastify/autoload, so app.js stops importing each route file, and keep every route under /api

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

  fastify.get('/slow', async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return { slow: true };
  });

  return fastify;
}
