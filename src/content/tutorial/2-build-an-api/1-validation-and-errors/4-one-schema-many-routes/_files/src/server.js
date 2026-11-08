import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

// TODO: register the task schema once with fastify.addSchema and point both routes at it with $ref

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

fastify.put(
  '/tasks/:id',
  {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'integer' },
        },
      },
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
  async (request) => {
    return { id: request.params.id, ...request.body };
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
