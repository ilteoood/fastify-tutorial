---
type: lesson
title: Tidy HTTP errors
focus: '/src/server.js'
---

# Tidy HTTP errors

Every "not found" written by hand repeats the same three things: the status code, the message and the shape of the body. Miss one of them and the client sees a different error on every route. `@fastify/sensible` gives you one helper per status code, so the status code and the message travel together, and the error reaches your error handler like any other error.

## The code

```file:/src/server.js
```

## One helper per status code

`fastify.httpErrors.notFound('Task not found')` builds an error whose `statusCode` is `404` and whose message is the one you pass. `throw` it inside a handler and your error handler answers it, exactly like a validation error.

There is one factory per status: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `methodNotAllowed`, `conflict`, `unprocessableEntity`, and more.

`reply.notFound()` is the same idea for the not found handler: it sends a `404` error, so the body comes from your error handler instead of a hand-written `send`.

`fastify.assert(condition, statusCode, message)` throws when the condition is false. It is the short version of an `if` that builds a `4xx` answer.

`fastify.createError(statusCode, message)` is the generic version, for the statuses that have no named factory.

The dependency is already listed in `package.json` (the tutorial runs `npm install` for you), but the import and the registration are gone: add both.

## Your turn

Register `@fastify/sensible`, then answer the two "not found" cases with it. The missing task must throw the `notFound` error with the message `Task not found`, and the unknown route must be answered by `reply.notFound()`. Keep the error handler as it is, so every error of the API ends up with the same body shape.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i http://127.0.0.1:3000/tasks/1
curl -i http://127.0.0.1:3000/tasks/9
curl -i http://127.0.0.1:3000/nope
```

The first request finds the task and answers `200` with the task itself.

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 54

{"task":{"id":1,"title":"Learn Fastify","done":false}}
```

Without the solution the last two requests are answered by hand: the missing task with its own body, and the unknown route with the one from the not found handler.

```http
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8
content-length: 26

{"error":"Task not found"}
```

```http
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8
content-length: 27

{"error":"Route not found"}
```

With the solution in place both answers come from the error handler instead, so they carry the same shape as every other error of the API.

```http
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8
content-length: 43

{"error":"Task not found","statusCode":404}
```

```http
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8
content-length: 38

{"error":"Not Found","statusCode":404}
```

The hand-written bodies have no `statusCode` at all, and the two of them do not even use the same text. The ones built by sensible go through the error handler, which adds the `statusCode` to every one of them.
