import Fastify from 'fastify';
import taskRoutes from './routes/tasks.js';

const fastify = Fastify({ logger: true });

fastify.get('/', async () => {
  return { hello: 'world' };
});

fastify.get('/version', async () => {
  return { name: 'tasks-api', version: '1.0.0' };
});

fastify.get('/health', async () => {
  return { ok: true };
});

fastify.patch('/tasks/:id', async (request) => {
  return { id: request.params.id, updated: true };
});

fastify.delete('/tasks/:id', async (request) => {
  return { id: request.params.id, deleted: true };
});

fastify.get('/echo', async (request) => {
  return {
    id: request.id,
    method: request.method,
    url: request.url,
    query: request.query,
    userAgent: request.headers['user-agent'] ?? null,
  };
});

fastify.post('/echo', async (request, reply) => {
  return reply.code(201).send({
    received: request.body,
    contentType: request.headers['content-type'] ?? null,
  });
});

fastify.get('/tasks/:id', async (request) => {
  return { id: request.params.id };
});

fastify.get('/tasks/:id/notes/:noteId', async (request) => {
  return { params: request.params };
});

fastify.get('/files/*', async (request) => {
  return { path: request.params['*'] };
});

fastify.register(taskRoutes, { prefix: '/api' });

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
