---
type: lesson
title: Reading the request
focus: '/src/server.js'
---

# Reading the request

Every handler receives the same `request` object. It is your window into what the client sent.

## The code

```file:/src/server.js
```

## The useful parts of `request`

| Property | What it holds | Example |
|---|---|---|
| `request.id` | The id Fastify gives to every request | `'req-1'` |
| `request.method` | The HTTP method | `'GET'` |
| `request.url` | The URL that was called | `'/echo?a=1'` |
| `request.query` | The query string, as an object | `{ a: '1' }` |
| `request.headers` | The request headers, in lower case | `{ host: '127.0.0.1:3000' }` |
| `request.body` | The parsed body, when there is one | `{ title: 'Learn Fastify' }` |
| `request.params` | The path parameters | `{ id: '1' }` |
| `request.ip` | The caller's IP address | `'127.0.0.1'` |
| `request.log` | A logger that knows which request it belongs to | `request.log.info('hi')` |

Header names are always lower case, so you write `request.headers['content-type']` and not `request.headers['Content-Type']`.

## Your turn

`GET /echo` is missing, and the `curl` command below calls it. Build it so that it reports what the request carried: the id Fastify assigned to it, the method, the full URL, the parsed query string, and the `user-agent` header.

Return a single object with the keys `id`, `method`, `url`, `query` and `userAgent`, read them from `request`, and keep the `POST /echo` route that is already in the file. The user agent can be absent, so fall back to `null` with `request.headers['user-agent'] ?? null`.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i 'http://127.0.0.1:3000/echo?name=fastify&done=true'
curl -i -X POST http://127.0.0.1:3000/echo -H 'Content-Type: application/json' -d '{"title":"Learn Fastify"}'
```

The first call shows the query string as an object. The second shows the parsed body.

:::info
Fastify only parses the body when the `Content-Type` header says it is JSON. Send it as JSON and `request.body` is an object; send it as plain text and `request.body` is a string.
:::
