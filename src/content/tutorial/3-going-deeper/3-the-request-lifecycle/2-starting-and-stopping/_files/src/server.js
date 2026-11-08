import { buildApp } from './app.js';

const start = async () => {
  const fastify = await buildApp({ logger: true });

  // TODO: add a `shutdown` function that logs the signal, closes the server and exits with code 0, then register it for SIGINT and SIGTERM

  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
