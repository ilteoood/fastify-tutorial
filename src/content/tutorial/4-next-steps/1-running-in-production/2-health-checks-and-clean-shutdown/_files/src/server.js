import Fastify from 'fastify';

const port = Number(process.env?.PORT ?? 3000);
const host = process.env?.HOST ?? '127.0.0.1';

const fastify = Fastify({
  logger: {
    level: process.env?.LOG_LEVEL ?? 'info',
  },
});

// TODO: add a GET /health route that answers { status: 'ok' } so a load balancer can check that the server is up

fastify.get('/', async () => {
  return { hello: 'world' };
});

const start = async () => {
  // TODO: add a shutdown function that logs the signal, closes the server and exits with code 0, then register it for SIGINT and SIGTERM

  try {
    await fastify.listen({ port, host });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
