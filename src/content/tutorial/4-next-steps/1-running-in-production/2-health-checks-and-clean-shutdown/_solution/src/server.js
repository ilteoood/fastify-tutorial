import Fastify from 'fastify';

const port = Number(process.env?.PORT ?? 3000);
const host = process.env?.HOST ?? '127.0.0.1';

const fastify = Fastify({
  logger: {
    level: process.env?.LOG_LEVEL ?? 'info',
  },
});

fastify.get('/health', async () => {
  return { status: 'ok' };
});

fastify.get('/', async () => {
  return { hello: 'world' };
});

const start = async () => {
  const shutdown = async (signal) => {
    fastify.log.info(`${signal} received, closing the server`);
    await fastify.close();
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await fastify.listen({ port, host });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
