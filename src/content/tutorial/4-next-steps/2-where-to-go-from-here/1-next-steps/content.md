---
type: lesson
title: Where to go from here
focus: '/src/server.js'
---

# Where to go from here

Over the previous parts you built a working Fastify API: routes, plugins, decorators, hooks, validation, serialization, error handling, tests, a file as storage, content type parsers, security headers, a rate limit, logging, and the request lifecycle. The single file you have in front of you now is the small server of the last chapter, but the ideas are the same ones. Here is where to go next.

## The documentation

The [Fastify documentation](https://fastify.dev/docs/latest/) is the reference for every option in this tutorial. The pages worth reading next are:

| Page | What you will find |
|---|---|
| [Guides](https://fastify.dev/docs/latest/Guides/) | Database access, writing plugins, serverless, recommendations |
| [Reference](https://fastify.dev/docs/latest/Reference/) | Every option of the server, the routes and the hooks |
| [Ecosystem](https://fastify.dev/docs/latest/Guides/Ecosystem/) | The official plugins, from CORS to static files |

## The plugins you will need next

You have already used `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit`, `@fastify/sensible`, `@fastify/autoload`, `@fastify/static` and `fastify-plugin`. The ones you will want next:

- [`@fastify/jwt`](https://github.com/fastify/fastify-jwt) signs and verifies tokens.
- [`@fastify/websocket`](https://github.com/fastify/fastify-websocket) handles real-time connections.

They all work the same way:

```js
import cors from '@fastify/cors';

await fastify.register(cors);
```

## Making it real

The next steps of this API, in order:

1. Replace the JSON file with a database. The [Database guide](https://fastify.dev/docs/latest/Guides/Database/) shows how to keep the decorators as your data access layer.
2. Add authentication with a plugin and a `preHandler` hook.
3. Add pagination to `GET /api/tasks`. The `limit` schema of the validation chapter is a good start.
4. Publish the documentation of the API as an OpenAPI document. That is the next lesson.

## Your turn

One item of that list needs no new package, so you can do it now: authentication. Add a `preHandler` hook that runs before every route and answers `401` with `{ error: 'Unauthorized' }` unless the `x-api-key` header of the request is the key in `process.env?.API_KEY`, falling back to `dev-key` while you develop. After it, the API you leave behind asks for a key on every single request. The next lesson, the last of the tutorial, puts an OpenAPI document on top of it.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i http://127.0.0.1:3000/
curl -i -H 'x-api-key: dev-key' http://127.0.0.1:3000/
```

The first answer is `HTTP/1.1 401 Unauthorized` with the body `{"error":"Unauthorized"}`; the second is `HTTP/1.1 200 OK` with `{"hello":"world"}`. To use a key of your own, restart the server with `API_KEY=my-key npm start` and send `x-api-key: my-key`. Without the hook both calls answer `200`: a route that is not guarded is a route anyone can call.

## Keep practicing

The best way to learn Fastify is to build something you actually need. Take the API you have here and add one feature at a time, with a test for each one.

:::tip
When you get stuck, the [Fastify discussions](https://github.com/fastify/fastify/discussions) and the [Fastify Discord](https://github.com/fastify/fastify#getting-help) are full of people who have been exactly where you are.
:::
