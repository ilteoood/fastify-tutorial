import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.post(
  '/tasks',
  {
    schema: {
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1 },
          done: { type: 'boolean', default: false },
        },
      },
    },
  },
  async (request, reply) => {
    return reply.code(201).send({ task: request.body });
  },
);

fastify.get(
  '/tasks',
  {
    schema: {
      // TODO: add a querystring schema: done is a boolean, limit is an integer from 1 to 100 and defaults to 10
    },
  },
  async (request) => {
    return { tasks: [], query: request.query };
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
