---
type: lesson
title: Error handling
focus: '/src/server.js'
---

# Error handling

Two things can go wrong: a route that does not exist, and a handler that throws.

Fastify handles both for you, and lets you replace what it sends.

## The code

```file:/src/server.js
```

## The error handler

`fastify.setErrorHandler()` replaces the answer Fastify sends when a handler throws. It is called with `(error, request, reply)` and it has to send the reply itself.

- `error.statusCode` is set by Fastify for the errors it knows about: a request that does not match the schema is `400`.
- A route that does not exist never reaches this handler: Fastify sends it to the not found handler below.
- A plain `new Error('...')` has no status code, so it becomes `500`.
- `request.log` writes the real error to the logs, while the client only gets a safe message. Never send the message of a `500` to the client: it can contain details about your internals.

## The not found handler

```js
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    error: `Route ${request.method} ${request.url} not found`,
  });
});
```

## Throwing from a handler

You do not have to build the response by hand. Throwing is enough:

```js
fastify.get('/boom', async () => {
  throw new Error('Something went wrong');
});
```

Fastify catches it, calls the error handler and answers `500`.

:::tip
If you want a specific status code, throw an error that carries one: `throw Object.assign(new Error('Task not found'), { statusCode: 404 })`.
:::

## Your turn

The app has a not found handler but no error handler, so a thrown error still produces Fastify's default answer. Write one: log the error with `request.log.error`, take the status code from `error.statusCode` and fall back to `500`. Answer with a body of `{ error, statusCode }`, where `error` is the text `Internal Server Error` for a status code of `500` or more, and the error's own message below that.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i http://127.0.0.1:3000/boom
curl -i http://127.0.0.1:3000/does-not-exist
```

`/boom` answers `500` with the body `{"error":"Internal Server Error","statusCode":500}`. The message of the error is not in it, but the **Output** panel shows it with its stack trace. `/does-not-exist` is a different story: a route that does not exist never throws, so the answer comes from the not found handler and keeps its own message.
