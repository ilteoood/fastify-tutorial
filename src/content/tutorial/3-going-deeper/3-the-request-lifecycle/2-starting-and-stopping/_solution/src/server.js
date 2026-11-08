import { buildApp } from './app.js';

const start = async () => {
  const fastify = await buildApp({ logger: true });

  const shutdown = async (signal) => {
    fastify.log.info(`${signal} received, closing the server`);
    await fastify.close();
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
