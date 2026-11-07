---
type: lesson
title: How Fastify reads a body
focus: '/src/routes/tasks.js'
---

# How Fastify reads a body

A request body is only bytes on the wire. `{"title":"Learn Fastify"}` and `Learn Fastify` are both text, so Fastify cannot guess which one your route expects. The client has to say it.

## The Content-Type header

The `Content-Type` header, also called the **media type**, names the format of the body:

| Header                              | The body contains    |
| ----------------------------------- | -------------------- |
| `application/json`                  | A JSON document      |
| `text/plain`                        | Plain text           |
| `application/x-www-form-urlencoded` | A form, as `a=1&b=2` |

The header may carry a charset, as in `application/json; charset=utf-8`. Fastify matches the parser on the type, not on the charset.

## Parsers

Fastify keeps a **content type parser** per format. The parser receives the raw body and returns a JavaScript value. Fastify puts that value on `request.body`, and that is what your handler sees. Two parsers are built in:

- `application/json` parses the body with `JSON.parse`, so `request.body` is an object.
- `text/plain` hands you the body as a plain string.

Every other type is refused with `415 Unsupported Media Type`, before the handler runs. A `POST` with a body and no `Content-Type` header is refused the same way.

:::warn
`curl -d` does not send JSON by default. Without `-H 'Content-Type: application/json'`, curl labels the body `application/x-www-form-urlencoded`, and Fastify answers `415`. This is the most common reason a hand-written `curl` call fails while the same request works from a browser.
:::

`GET` and `HEAD` requests have no body to parse, so their parsers never run.

## How large a body may be

Fastify stops reading at `bodyLimit` bytes, `1048576` (1 MiB) by default, and answers `413 Payload Too Large`. You can change the limit when you create the server:

```js
const fastify = Fastify({ bodyLimit: 10 * 1024 });
```

The limit is per request, and a body over the limit never reaches the parser.

## The route

```file:/src/routes/tasks.js
```

`fastify.tasks.create(request.body)` works because the JSON parser already turned the bytes into `{ title: 'Learn Fastify' }`.

## Try it

```bash
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Fastify"}'
curl -i -X POST http://127.0.0.1:3000/api/tasks -d '{"title":"Learn Fastify"}'
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: application/xml' -d '<task/>'
```

The first request creates a task. The second and third are answered with `415`, because neither header names a format Fastify parses.
