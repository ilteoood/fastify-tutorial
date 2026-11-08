import Fastify from 'fastify';

const port = Number(process.env?.PORT ?? 3000);
const host = process.env?.HOST ?? '127.0.0.1';

const fastify = Fastify({
  logger: {
    level: process.env?.LOG_LEVEL ?? 'info',
  },
});

fastify.addHook('preHandler', async (request, reply) => {
  if (request.headers['x-api-key'] !== (process.env?.API_KEY ?? 'dev-key')) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});

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
