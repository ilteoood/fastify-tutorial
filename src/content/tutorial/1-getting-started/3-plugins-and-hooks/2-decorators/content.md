---
type: lesson
title: Decorators
focus: '/src/server.js'
---

# Decorators

A **decorator** adds a property to the Fastify instance. It is how you share one object, such as a database connection, a configuration object or a store, with every route, without passing it around by hand.

```js
fastify.decorate('tasks', new Map());
```

After that line, `fastify.tasks` is the map you created, and every handler and plugin can use it.

## The code

```file:/src/server.js
```

## Decorating the server

| Method | What it does |
|---|---|
| `fastify.decorate(name, value)` | Adds `value` to the server |
| `fastify.hasDecorator(name)` | Answers `true` if the name is already taken |

You can decorate a function too. Fastify does not care what the value is: the name you decorate becomes a property of the server, and if the value happens to be a function you call it as `fastify.<name>()` from a handler.

## Decorating the request

`fastify.decorateRequest(name, value)` adds a property to every `request` object. It is much faster than assigning a brand new property on each request, because Fastify then knows the shape of the object in advance.

```js
fastify.decorateRequest('taskId', null);
```

Now `request.taskId` exists everywhere, and you can set it in a hook and read it in a handler.

## Why it matters

Decorators are shared downwards, never upwards: a plugin can use the decorators of its parent, but the parent cannot see the decorators of its children. That is what keeps plugins independent.

:::warn
Decorating a name that already exists throws an error. Use `hasDecorator` first if the value may already be there.
:::

## Your turn

Decorate the server with a function called `clock` that returns the current time as an ISO string, then use it in the `GET /` handler so the response gains a `now` field next to `hello`.

Add the decorator above the routes, next to `fastify.decorate('tasks', new Map())`, and call `fastify.clock()` inside the handler; `new Date().toISOString()` gives you the string. The answer of `GET /` must look like `{ "hello": "world", "now": "2026-01-01T00:00:00.000Z" }`.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i http://127.0.0.1:3000/
curl -i http://127.0.0.1:3000/tasks/7
```

The first response includes the `now` field, the second the `id` you put on the request.
