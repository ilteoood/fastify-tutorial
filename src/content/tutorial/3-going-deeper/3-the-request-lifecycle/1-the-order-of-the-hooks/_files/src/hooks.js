export function registerLifecycleHooks(fastify) {
  fastify.addHook('onRequest', async (request) => {
    request.log.info('onRequest');
  });

  // TODO: add the six hooks that run between these two, each logging its own name

  fastify.addHook('onResponse', async (request) => {
    request.log.info('onResponse');
  });
}
