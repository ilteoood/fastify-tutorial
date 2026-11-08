import Fastify from 'fastify';
import autoload from '@fastify/autoload';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
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

  fastify.register(autoload, {
    dir: path.join(import.meta.dirname, 'routes'),
    options: { prefix: '/api' },
  });

  // TODO: serve the files of the public folder with @fastify/static, and add a route that answers with the file the client asks for

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
