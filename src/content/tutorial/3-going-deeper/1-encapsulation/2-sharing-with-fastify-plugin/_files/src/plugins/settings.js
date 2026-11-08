// TODO: import `fastify-plugin` and wrap the plugin function with it

export default async function settings(fastify) {
  fastify.decorate('settings', { name: 'Tasks API', version: '1.0.0' });

  fastify.addHook('onRequest', async (request, reply) => {
    reply.header('x-api-name', fastify.settings.name);
  });
}
