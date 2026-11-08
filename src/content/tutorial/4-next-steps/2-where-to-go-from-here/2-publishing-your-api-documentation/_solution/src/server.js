import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

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

await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Fastify tutorial API',
      version: '1.0.0',
    },
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/documentation',
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
    console.log(fastify.printRoutes());
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
