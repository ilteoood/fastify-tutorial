import Fastify from 'fastify';

const port = Number(process.env?.PORT ?? 3000);
const host = process.env?.HOST ?? '127.0.0.1';

const fastify = Fastify({
  logger: {
    level: process.env?.LOG_LEVEL ?? 'info',
  },
});

// TODO: add a `preHandler` hook that answers 401 with `{ error: 'Unauthorized' }` unless the `x-api-key` header matches `process.env?.API_KEY ?? 'dev-key'`

fastify.get('/', async () => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await fastify.listen({ port, host });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
