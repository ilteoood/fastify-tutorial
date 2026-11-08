---
type: lesson
title: Creating and reading tasks
focus: '/src/routes/tasks.js'
---

# Creating and reading tasks

Now the routes have something real to talk about.

## The files

```file:/src/routes/tasks.js
```

```file:/src/server.js
```

## Reading the routes

Listing the tasks:

```js
fastify.get('/tasks', async () => {
  return { tasks: fastify.tasks.list() };
});
```

Creating a task is the same shape in the other direction: a `POST` on `/tasks` with a `body` schema, and a handler that puts the validated body into the store.

- The schema rejects a body without a title with `400`, before the handler runs.
- `reply.code(201)` says "I created something". `201 Created` is the correct answer for a `POST` that creates a resource.

Reading one task:

```js
fastify.get('/tasks/:id', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'integer' },
      },
    },
  },
}, async (request, reply) => {
  const task = fastify.tasks.find(request.params.id);

  if (task === undefined) {
    return reply.code(404).send({ error: 'Task not found' });
  }

  return { task };
});
```

## Your turn

The route that creates a task is missing, so `POST /api/tasks` does not exist yet. Add it: a `body` schema that requires a non-empty `title`, a handler that stores the body with `fastify.tasks.create()`, and an answer of `201` that carries the new task in a `task` field. Leave the two reading routes alone.

<details>
<summary>Show the solution</summary>

```solution:/src/routes/tasks.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Fastify"}'
curl -i http://127.0.0.1:3000/api/tasks
curl -i http://127.0.0.1:3000/api/tasks/1
curl -i http://127.0.0.1:3000/api/tasks/99
```

The first call answers `201 Created`, with the task in the body. The last one answers `404`: the id is in the URL, but not in the store.

:::info
The tasks live in memory. Restart the server and they are gone. That is fine for a tutorial, and it is also why the tests in the next chapter can start from a clean slate.
:::
