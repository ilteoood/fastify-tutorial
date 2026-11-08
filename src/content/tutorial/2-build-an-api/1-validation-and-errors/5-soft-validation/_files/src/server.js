import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

// TODO: turn on attachValidation for this route and answer with the fields that failed when the body is invalid

fastify.post(
  '/tasks',
  {
    schema: {
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 3 },
          dueDate: { type: 'string', format: 'date' },
        },
      },
    },
  },
  async (request, reply) => {
    return reply.code(201).send({ task: request.body });
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
