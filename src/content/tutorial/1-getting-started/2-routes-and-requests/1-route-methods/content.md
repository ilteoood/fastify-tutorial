---
type: lesson
title: Route methods
focus: '/src/server.js'
---

# Route methods

So far our server only answers `GET /`. A real API needs more: reading a list, creating an item, changing an item, removing it.

Fastify gives you one function per HTTP method:

| Method | What it means | Typical URL |
|---|---|---|
| `GET` | Read something | `GET /tasks` |
| `POST` | Create something | `POST /tasks` |
| `PUT` | Replace something entirely | `PUT /tasks/1` |
| `PATCH` | Change part of something | `PATCH /tasks/1` |
| `DELETE` | Remove something | `DELETE /tasks/1` |

## The code

```file:/src/server.js
```

## How a route is built

Every route has three parts:

1. The method: `fastify.get`, `fastify.post`, `fastify.patch`, `fastify.delete`.
2. The path: the URL the client has to call, like `'/tasks'`.
3. The handler: an `async` function that receives the request and produces the answer.

The handler has two arguments:

```js
fastify.get('/tasks', async (request, reply) => {
  return reply.code(200).send({ tasks: [] });
});
```

- `request` is everything the client sent: the path, the query string, the headers, the body.
- `reply` is the response you are building: its status code, its headers, its body.

## The long form

`fastify.get(...)` is a shortcut. The complete version is `fastify.route(...)`:

```js
fastify.route({ method, url, handler });
```

`method` is the HTTP method — or an array of methods — `url` is the path, and `handler` is the same `async (request, reply)` function you would pass to `fastify.get`. Both forms do the same thing. Use the shortcut while you are learning, and `fastify.route` when you need the extra options you will meet in the next chapters.

## Your turn

`GET /tasks` and `POST /tasks` are missing, and they should be a single route: both methods share the same URL, so register them with one `fastify.route()` call whose `method` is `['GET', 'POST']`.

`GET /tasks` must answer `200` with `{ tasks: [] }`, and `POST /tasks` must answer `201` with `{ title: request.body?.title }`, so use `reply.code(...)` and `request.method` to tell the two apart in the handler. Leave the `PATCH` and `DELETE` routes that are already in the file as they are.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Open the **Terminal** panel and run:

```bash
curl -i http://127.0.0.1:3000/tasks
curl -i -X POST http://127.0.0.1:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Fastify"}'
curl -i -X DELETE http://127.0.0.1:3000/tasks/1
```

:::tip
The `curl -i` flag prints the response headers too, so you can see the status code (`200 OK`, `201 Created`) above the body.
:::

:::warn
Never send the response twice. Either `return { ... }` **or** `reply.send({ ... })`, never both. When you call `reply.send()` inside an `async` handler, also `return reply` (or `await reply`), otherwise Fastify tries to send the returned value as well and logs a warning: `Reply was already sent, did you forget to "return reply"?`
:::
