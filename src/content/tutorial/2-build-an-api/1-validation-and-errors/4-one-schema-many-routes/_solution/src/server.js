import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.addSchema({
  $id: 'task',
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', minLength: 1 },
    done: { type: 'boolean', default: false },
  },
});

fastify.post(
  '/tasks',
  {
    schema: {
      body: { $ref: 'task#' },
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
      body: { $ref: 'task#' },
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
