import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

const tasks = new Map([[1, { id: 1, title: 'Learn Fastify', done: false }]]);

// TODO: register @fastify/sensible and use its helpers for the two "not found" answers

fastify.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error }, 'the request failed');
  const statusCode = error.statusCode ?? 500;

  return reply.code(statusCode).send({
    error: statusCode >= 500 ? 'Internal Server Error' : error.message,
    statusCode,
  });
});

fastify.setNotFoundHandler((request, reply) => {
  return reply.code(404).send({ error: 'Route not found' });
});

fastify.get(
  '/tasks/:id',
  {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } },
        required: ['id'],
      },
    },
  },
  async (request, reply) => {
    const task = tasks.get(request.params.id);

    if (!task) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    return reply.send({ task });
  },
);

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
