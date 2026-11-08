import Fastify from 'fastify';

const fastify = Fastify({
  logger: {
    level: process.env?.LOG_LEVEL ?? 'info',
  },
});

fastify.get('/', async () => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    // TODO: read PORT and HOST from process.env and pass them to listen, with 3000 and '127.0.0.1' as the fallbacks
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
