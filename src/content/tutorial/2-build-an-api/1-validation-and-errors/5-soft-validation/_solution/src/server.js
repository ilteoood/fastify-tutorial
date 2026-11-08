import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.post(
  '/tasks',
  {
    attachValidation: true,
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
    if (request.validationError) {
      const errors = request.validationError.validation.map((error) => ({
        field: error.instancePath,
        message: error.message,
      }));

      return reply.code(400).send({ errors });
    }

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
