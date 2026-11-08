export function registerLifecycleHooks(fastify) {
  fastify.addHook('onRequest', async (request) => {
    request.log.info('onRequest');
  });

  fastify.addHook('preParsing', async (request) => {
    request.log.info('preParsing');
  });

  fastify.addHook('preValidation', async (request) => {
    request.log.info('preValidation');
  });

  fastify.addHook('preHandler', async (request) => {
    request.log.info('preHandler');
  });

  fastify.addHook('preSerialization', async (request) => {
    request.log.info('preSerialization');
  });

  fastify.addHook('onSend', async (request) => {
    request.log.info('onSend');
  });

  fastify.addHook('onResponse', async (request) => {
    request.log.info('onResponse');
  });

  fastify.addHook('onError', async (request, reply, error) => {
    request.log.info(`onError: ${error.message}`);
  });

  fastify.addHook('onRoute', (routeOptions) => {
    fastify.log.info(`route registered: ${routeOptions.method} ${routeOptions.url}`);
  });

  fastify.addHook('onRequestAbort', async (request) => {
    request.log.warn('the client went away');
  });
}
