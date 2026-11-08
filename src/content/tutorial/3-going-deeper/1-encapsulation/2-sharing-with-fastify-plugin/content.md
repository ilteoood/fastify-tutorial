---
type: lesson
title: Sharing with fastify-plugin
focus: '/src/plugins/settings.js'
---

# Sharing with fastify-plugin

The fix from the last lesson works, but it pulls task logic into `src/app.js`. Some code really belongs to a plugin: the name and version of the API, for instance, and a hook that stamps them on every response. Move that into `src/plugins/settings.js` and the root loses access to it again.

Unless the plugin is wrapped with `fastify-plugin`.

## The wrapper

```file:/src/plugins/settings.js
```

`fp` is the default export of `fastify-plugin`. It returns the same plugin marked so that Fastify does not create a new context for it: it runs on its parent instance. Everything the plugin adds directly — decorators, hooks — then belongs to the parent, here the root.

- `fastify.decorate('settings', ...)` makes `fastify.settings` readable in `app.js`, so `/` can return the name and the version.
- `fastify.addHook('onRequest', ...)` runs for `/`, for `/stats` and for the routes of `taskRoutes`. That is where the `x-api-name` header comes from.

Without the wrapper, the plugin still runs, but `fastify.settings` is `undefined` in `app.js` and `/` answers `500` with `Cannot read properties of undefined (reading 'name')`.

## It only reaches one level

`fastify-plugin` removes the context of the plugin it wraps. It does not remove the contexts created inside it:

```js
fastify.register(
  fp(async function shared(fastify) {
    fastify.decorate('shared', true);

    fastify.register(async function nested(fastify) {
      fastify.decorate('nested', true);
    });
  }),
);
```

At the root, `fastify.shared` exists and `fastify.nested` does not. Every `register` still opens a context.

## The prefix caveat

:::warn
The options Fastify acts on itself — `prefix`, `logLevel` — are ignored for a wrapped plugin. They are still handed to the plugin function, but Fastify does not apply them. `prefix` belongs to a context, and the wrapper removes that context.

If you wrapped `taskRoutes`, `register(taskRoutes, { prefix: '/api' })` would answer at `/tasks` and the tests would fail. To keep a shared plugin and a prefix, wrap a plugin in a plugin:

```js
export default fp(async function api(fastify) {
  fastify.register(taskRoutes, { prefix: '/api' });
});
```

:::

## Where the prefix lives

Open `src/app.js`:

```file:/src/app.js
```

The two registrations have two different jobs:

```js
fastify.register(settings);
fastify.register(taskRoutes, { prefix: '/api' });
```

`settings` adds no routes, so it needs no prefix and is wrapped. `taskRoutes` owns the routes, so it stays a plain plugin, and the `/api` prefix stays on its registration in `app.js`.

## Your turn

The plugin in `src/plugins/settings.js` is not wrapped: it runs, it decorates, it adds its hook, and none of that reaches the root. Import `fp` from `fastify-plugin` and export the same function wrapped in it. Change nothing else — not the decorator, not the hook, and not the registration in `src/app.js`. The solution also puts back the test that checks the shared name, so `npm test` ends green only once the wrapper is there.

<details>
<summary>Show the solution</summary>

```solution:/src/plugins/settings.js
```

</details>

<details>
<summary>Show the solution</summary>

```solution:/test/tasks.test.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i http://127.0.0.1:3000/
curl -i http://127.0.0.1:3000/stats
curl -i http://127.0.0.1:3000/api/tasks
```

Every response carries `x-api-name: Tasks API`. The first also returns the name and version that the plugin decorated, and the last still answers under `/api`. `GET /tasks` without the prefix is a `404`.

Before the wrapper, none of that happens: `/api/tasks` has no `x-api-name` header, and `/` is the `500` the lesson describes, with `Cannot read properties of undefined (reading 'name')` in the body. The test that covers both cases goes from red to green when you add `fp`, so `npm test` follows the change.
