---
type: lesson
title: One schema, many routes
focus: '/src/server.js'
---

# One schema, many routes

The same task body schema is written twice: once in `POST /tasks` and once in `PUT /tasks/:id`. Change one field and you have to change it in two places. Forget one of them and the two routes stop accepting the same payload.

## The code

```file:/src/server.js
```

## One schema, two routes

Fastify keeps a registry of schemas on the instance. `fastify.addSchema()` puts one schema into that registry, and the `$id` you give it becomes the name that other schemas use to point at it.

A route then refers to the registered schema with `$ref`. The value before the `#` is the `$id` of the registered schema, and the part after the `#` is the piece of it you want. A bare `#` means the whole schema.

The registry is encapsulated. A schema registered inside a plugin is only visible to that plugin and its children, so a schema that several routes share has to be registered on the instance those routes live on.

You can look at the registry at any time: `fastify.getSchemas()` returns every registered schema, and `fastify.getSchema('task')` returns the one with that id.

## Your turn

Register the task schema once on the Fastify instance with the id `task`, delete the two inline copies of it, and point both routes at the shared schema. The two routes must keep answering exactly as before: the same status codes, the same bodies and the same validation errors.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i -X POST http://127.0.0.1:3000/tasks -H 'content-type: application/json' -d '{"title":"Learn Fastify"}'
curl -i -X POST http://127.0.0.1:3000/tasks -H 'content-type: application/json' -d '{"title":""}'
curl -i -X PUT http://127.0.0.1:3000/tasks/7 -H 'content-type: application/json' -d '{"title":"Learn Fastify"}'
```

The first request answers `201` with `{"task":{"title":"Learn Fastify","done":false}}`:

```http
HTTP/1.1 201 Created
content-type: application/json; charset=utf-8
content-length: 47

{"task":{"title":"Learn Fastify","done":false}}
```

The `done` property is not in the request body, the schema fills it in with its default value.

The second request has an empty title, which is shorter than the `minLength` of the schema, so Fastify answers `400` with a validation error:

```http
HTTP/1.1 400 Bad Request
content-type: application/json; charset=utf-8
content-length: 129

{"statusCode":400,"code":"FST_ERR_VALIDATION","error":"Bad Request","message":"body/title must NOT have fewer than 1 characters"}
```

The third request answers `200` with `{"id":7,"title":"Learn Fastify","done":false}`:

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 45

{"id":7,"title":"Learn Fastify","done":false}
```

The id comes from the route parameters, the rest of the body is validated by the same shared schema.
