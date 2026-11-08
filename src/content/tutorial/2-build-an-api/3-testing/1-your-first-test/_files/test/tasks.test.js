import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { buildApp } from '../src/app.js';

let fastify;

before(async () => {
  fastify = await buildApp();
  await fastify.ready();
});

after(async () => {
  await fastify.close();
});

test('GET / returns the API index', async () => {
  const response = await fastify.inject({
    method: 'GET',
    url: '/',
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().name, 'Tasks API');
});

test('POST /api/tasks rejects a body without a title', async () => {
  const response = await fastify.inject({
    method: 'POST',
    url: '/api/tasks',
    payload: {},
  });

  assert.equal(response.statusCode, 400);
});

// TODO: add a test for POST /api/tasks that creates a task and checks the 201 answer
