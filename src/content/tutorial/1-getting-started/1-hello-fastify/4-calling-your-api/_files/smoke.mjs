import Fastify from 'fastify';

const fastify = Fastify();

fastify.get('/', async () => {
  return { hello: 'world' };
});

// TODO: send a GET request for '/' to that server with fastify.inject() and log the response status code
