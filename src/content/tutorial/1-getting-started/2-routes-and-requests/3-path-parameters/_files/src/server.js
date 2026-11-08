import Fastify from 'fastify';

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

fastify.route({
  method: ['GET', 'POST'],
  url: '/tasks',
  handler: async (request, reply) => {
    if (request.method === 'POST') {
      return reply.code(201).send({ title: request.body?.title });
    }

    return { tasks: [] };
  },
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

// TODO: add GET /tasks/:id/notes/:noteId that returns the whole request.params object

// TODO: add GET /files/* that returns the part of the path after /files/ as `path`

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
