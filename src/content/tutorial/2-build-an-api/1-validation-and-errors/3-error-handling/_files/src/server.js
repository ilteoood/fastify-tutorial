import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

// TODO: add an error handler that logs the error and answers with a statusCode and a safe error message

fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    error: `Route ${request.method} ${request.url} not found`,
  });
});

fastify.get('/boom', async () => {
  throw new Error('Something went wrong');
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
