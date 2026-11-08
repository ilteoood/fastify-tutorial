import Fastify from 'fastify';

const fastify = Fastify();

fastify.get('/', async () => {
  return { hello: 'world' };
});

const response = await fastify.inject({ method: 'GET', url: '/' });

console.log(response.statusCode);
