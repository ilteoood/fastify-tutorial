---
type: lesson
title: Soft validation
focus: '/src/server.js'
---

# Soft validation

By default Fastify validates the body against the schema and, when it does not match, answers `400` on its own: the client gets a fixed body and your handler never runs. Sometimes you want to decide the status code and the body yourself, and sometimes you want to accept the payload anyway and only report the problems.

## The code

```file:/src/server.js
```

## Letting the handler decide

`attachValidation: true` in the route options makes the request reach the handler even when the body is invalid. The details of what went wrong are then on `request.validationError`: its `message`, its `code` (`FST_ERR_VALIDATION`), its `statusCode` (`400`), its `validationContext` (`body`) and its `validation`, the array with the failures.

Each failure has an `instancePath`, the path of the field that failed (`/title`), and a `message`, the human readable reason (`must NOT have fewer than 3 characters`).

Now you own the answer. You can pick the status code, build the body you want, or accept the payload and only report the problems as warnings.

Fastify's default validator stops at the first failure, so `validation` usually holds a single entry. If you need every failure you can hand Fastify your own Ajv instance with `allErrors: true`, but the Fastify recommendations warn that collecting every error costs more CPU on every request.

`attachValidation` only changes validation. Serialization still fails the request when the answer does not match the response schema.

## Your turn

Turn on `attachValidation` for this route and, when `request.validationError` is set, answer `400` with a body of `{ errors: [...] }`, where every entry holds the `field` and the `message` of one failure. When the body is valid the route must keep answering `201` with the task.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i -X POST http://127.0.0.1:3000/tasks -H 'content-type: application/json' -d '{"title":"ab"}'
curl -i -X POST http://127.0.0.1:3000/tasks -H 'content-type: application/json' -d '{"title":"Learn Fastify","dueDate":"nope"}'
curl -i -X POST http://127.0.0.1:3000/tasks -H 'content-type: application/json' -d '{"title":"Learn Fastify"}'
```

Without the solution the first request never reaches the handler: Fastify answers `400` on its own, with a body that mentions the schema path of the field that failed.

```http
HTTP/1.1 400 Bad Request
content-type: application/json; charset=utf-8
content-length: 129

{"statusCode":400,"code":"FST_ERR_VALIDATION","error":"Bad Request","message":"body/title must NOT have fewer than 3 characters"}
```

With the solution in place the handler answers instead, and the body is the one you built.

```http
HTTP/1.1 400 Bad Request
content-type: application/json; charset=utf-8
content-length: 81

{"errors":[{"field":"/title","message":"must NOT have fewer than 3 characters"}]}
```

The second request has a `dueDate` that is not a date, and it fails in the same way.

```http
HTTP/1.1 400 Bad Request
content-type: application/json; charset=utf-8
content-length: 72

{"errors":[{"field":"/dueDate","message":"must match format \"date\""}]}
```

The third request has a valid body, so the route keeps answering `201` with the task.

```http
HTTP/1.1 201 Created
content-type: application/json; charset=utf-8
content-length: 34

{"task":{"title":"Learn Fastify"}}
```
