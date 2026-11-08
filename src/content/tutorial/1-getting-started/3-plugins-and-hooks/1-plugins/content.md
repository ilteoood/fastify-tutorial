---
type: lesson
title: Plugins
focus: '/src/routes/tasks.js'
---

# Plugins

`src/server.js` is getting long, and it will keep growing. Fastify's answer is **plugins**: a function that receives the server and adds routes, decorators or hooks to it.

```js
export default async function taskRoutes(fastify) {}
```

A plugin is just a function. Two rules make it work:

1. It is an `async` function that takes the Fastify instance, and optionally an options object.
2. It is exported with `export default`, so `import taskRoutes from './routes/tasks.js'` gives you that function.

## Registering a plugin

```js
fastify.register(taskRoutes, { prefix: '/api' });
```

`register` does not run the plugin right away: it queues it. The plugin runs when the server starts, just before it begins listening. The options object you pass is handed to the plugin as its second argument.

## The prefix

`{ prefix: '/api' }` puts every route of the plugin under `/api`:

| In the plugin | What the client calls |
|---|---|
| `'/tasks'` | `GET /api/tasks` |
| `'/tasks/:id'` | `GET /api/tasks/1` |

## The files

```file:/src/server.js
```

```file:/src/routes/tasks.js
```

## Your turn

`src/routes/tasks.js` is an empty plugin: `src/server.js` already imports it, registers it with `{ prefix: '/api' }` and keeps every other route. Your job is the body of the plugin.

Add `GET /tasks` returning `{ tasks: [] }` and `POST /tasks` answering `201` with `{ title: request.body?.title }`. Write both paths without the prefix — `register` puts `/api` in front of them, so the client calls `/api/tasks`.

`GET /tasks` and `POST /tasks` are the two routes you registered with `fastify.route` in the previous chapter; inside the plugin you can write them with `fastify.get` and `fastify.post`.

<details>
<summary>Show the solution</summary>

```solution:/src/routes/tasks.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i http://127.0.0.1:3000/api/tasks
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Fastify"}'
```

## Encapsulation

Every plugin lives in its own **context**. Inside it, you can see the routes, decorators and hooks of the server that registered it, but the server cannot see what the plugin added. That is why the routes of `taskRoutes` are not available at `/tasks`, only at `/api/tasks`.

If you want a plugin to share everything with its parent, wrap it with `fastify-plugin`:

```js
import fastifyPlugin from 'fastify-plugin';

export default fastifyPlugin(async function taskRoutes(fastify) {});
```

:::warn
`fastify-plugin` breaks the encapsulation for the wrapped plugin only, and it makes the `prefix` option stop working. Register the plugin inside the wrapper instead:

```js
await fastify.register(async function routes(fastify) {
  fastify.register(taskRoutes, { prefix: '/api' });
});
```
:::
