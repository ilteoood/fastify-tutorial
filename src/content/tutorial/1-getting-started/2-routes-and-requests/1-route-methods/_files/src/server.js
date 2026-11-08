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

// TODO: add one fastify.route() for GET and POST /tasks: GET returns { tasks: [] }, POST answers 201 with the title

fastify.patch('/tasks/:id', async (request) => {
  return { id: request.params.id, updated: true };
});

fastify.delete('/tasks/:id', async (request) => {
  return { id: request.params.id, deleted: true };
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
