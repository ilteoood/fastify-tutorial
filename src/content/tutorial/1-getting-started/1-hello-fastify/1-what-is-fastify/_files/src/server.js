import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/', async () => {
  return { hello: 'world' };
});

// TODO: add a GET /version route that returns { name: 'tasks-api', version: '1.0.0' }

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
