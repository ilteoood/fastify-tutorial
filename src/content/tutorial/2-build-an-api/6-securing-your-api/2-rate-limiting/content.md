---
type: lesson
title: Rate limiting
focus: '/src/app.js'
---

# Rate limiting

A client can call your API as often as it likes. A buggy loop or someone guessing task ids can send thousands of requests per minute. A **rate limit** counts the requests of each client and answers `429 Too Many Requests` once the count is too high.

## A limit for every route

```file:/src/app.js
```

`max` is how many requests one client may make inside `timeWindow`. Clients are told apart by IP address, and the count starts again when the window ends.

The plugin also adds headers to every response:

| Header                  | Meaning                        |
| ----------------------- | ------------------------------ |
| `x-ratelimit-limit`     | requests allowed in the window |
| `x-ratelimit-remaining` | requests left                  |
| `x-ratelimit-reset`     | seconds until the count resets |
| `retry-after`           | only on `429`: seconds to wait |

## A stricter limit on writes

A hundred reads per minute is fine. A hundred new tasks per minute is not, so the route that writes asks for less:

```file:/src/routes/tasks.js
```

`config` is a place Fastify keeps for plugins; `@fastify/rate-limit` reads `config.rateLimit` and uses it instead of the global numbers. This route gets its own counter: five tasks per minute.

:::info
To limit only some routes, register the plugin with `global: false`:

```js
await fastify.register(rateLimit, {
  global: false,
  max: 100,
  timeWindow: '1 minute',
});
```

Then a route is limited only when it declares `config.rateLimit`.
:::

:::warn
The plugin counts in memory, inside one process. Run two servers and each one allows the full `max`; use the `redis` option to share the count. Behind a proxy, set `trustProxy` on the Fastify instance too, or every client looks like the proxy's IP.
:::

## Try it

```bash
curl -i http://127.0.0.1:3000/api/tasks
for i in 1 2 3 4 5; do
  curl -s -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Spam"}'
done
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Spam"}'
```

The first response reports `x-ratelimit-limit: 100`. The loop prints five `201`s, one per task. The last request is the sixth one in the window: `429`, with `x-ratelimit-remaining: 0`, `retry-after: 60` and a body that says when to retry. The tests still pass, because every test builds its own app and starts with a fresh counter.
