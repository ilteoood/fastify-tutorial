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

// TODO: add a GET /echo route that reports the request id, the method, the url, the query string and the user-agent header

fastify.post('/echo', async (request, reply) => {
  return reply.code(201).send({
    received: request.body,
    contentType: request.headers['content-type'] ?? null,
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
