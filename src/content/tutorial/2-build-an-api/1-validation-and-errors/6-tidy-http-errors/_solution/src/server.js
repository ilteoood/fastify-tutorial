import Fastify from 'fastify';
import sensible from '@fastify/sensible';

const fastify = Fastify({ logger: true });

const tasks = new Map([[1, { id: 1, title: 'Learn Fastify', done: false }]]);

await fastify.register(sensible);

fastify.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error }, 'the request failed');
  const statusCode = error.statusCode ?? 500;

  return reply.code(statusCode).send({
    error: statusCode >= 500 ? 'Internal Server Error' : error.message,
    statusCode,
  });
});

fastify.setNotFoundHandler((request, reply) => {
  return reply.notFound();
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
      throw fastify.httpErrors.notFound('Task not found');
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
