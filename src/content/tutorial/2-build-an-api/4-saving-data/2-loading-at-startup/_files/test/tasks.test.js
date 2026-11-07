import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { buildApp } from "../src/app.js";

async function buildTestApp(t) {
  const storeFilePath = join(tmpdir(), `tasks-${randomUUID()}.json`);
  const fastify = await buildApp({ storeFilePath });
  await fastify.ready();

  t.after(() => fastify.close());

  return fastify;
}

test("GET / returns the API index", async (t) => {
  const fastify = await buildTestApp(t);

  const response = await fastify.inject({
    method: "GET",
    url: "/",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().name, "Tasks API");
});

test("POST /api/tasks creates a task", async (t) => {
  const fastify = await buildTestApp(t);

  const response = await fastify.inject({
    method: "POST",
    url: "/api/tasks",
    payload: { title: "Learn Fastify" },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().task.title, "Learn Fastify");
  assert.equal(response.json().task.done, false);
});

test("POST /api/tasks rejects a body without a title", async (t) => {
  const fastify = await buildTestApp(t);

  const response = await fastify.inject({
    method: "POST",
    url: "/api/tasks",
    payload: {},
  });

  assert.equal(response.statusCode, 400);
});

test("GET /api/tasks returns the stored tasks", async (t) => {
  const fastify = await buildTestApp(t);

  await fastify.inject({
    method: "POST",
    url: "/api/tasks",
    payload: { title: "Write a test" },
  });

  const response = await fastify.inject({
    method: "GET",
    url: "/api/tasks",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().tasks.length, 1);
});

test("GET /api/tasks/:id returns 404 for an unknown task", async (t) => {
  const fastify = await buildTestApp(t);

  const response = await fastify.inject({
    method: "GET",
    url: "/api/tasks/999",
  });

  assert.equal(response.statusCode, 404);
});

test("PATCH /api/tasks/:id updates a task", async (t) => {
  const fastify = await buildTestApp(t);

  await fastify.inject({
    method: "POST",
    url: "/api/tasks",
    payload: { title: "Write a test" },
  });

  const response = await fastify.inject({
    method: "PATCH",
    url: "/api/tasks/1",
    payload: { done: true },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().task.done, true);
});

test("DELETE /api/tasks/:id removes a task", async (t) => {
  const fastify = await buildTestApp(t);

  await fastify.inject({
    method: "POST",
    url: "/api/tasks",
    payload: { title: "Write a test" },
  });

  const response = await fastify.inject({
    method: "DELETE",
    url: "/api/tasks/1",
  });

  assert.equal(response.statusCode, 204);
});

test("tasks survive a restart", async (t) => {
  const storeFilePath = join(tmpdir(), `tasks-${randomUUID()}.json`);

  const before = await buildApp({ storeFilePath });
  await before.ready();

  await before.inject({
    method: "POST",
    url: "/api/tasks",
    payload: { title: "Learn Fastify" },
  });

  await before.close();

  const fastify = await buildApp({ storeFilePath });
  await fastify.ready();

  t.after(() => fastify.close());

  const stored = await fastify.inject({
    method: "GET",
    url: "/api/tasks",
  });

  assert.equal(stored.json().tasks.length, 1);
  assert.equal(stored.json().tasks[0].title, "Learn Fastify");

  const created = await fastify.inject({
    method: "POST",
    url: "/api/tasks",
    payload: { title: "Write a test" },
  });

  assert.equal(created.json().task.id, 2);
});
