---
type: lesson
title: What encapsulation means
focus: '/src/app.js'
---

# What encapsulation means

`fastify.register(taskRoutes, { prefix: '/api' })` installs a plugin. It also does something you cannot see in that line: it creates a **context** for the plugin, a child scope on the same server.

A child context inherits everything its parent has: decorators, hooks, plugins. The parent inherits nothing from the child. That one rule is encapsulation, and it is what keeps plugins from stepping on each other.

:::info
This chapter starts again from the plain Tasks API, without the JSON file, the CORS headers and the rate limit of the last chapters. A chapter should show one idea at a time, and the files in front of you are always complete and runnable.
:::
## The bug

We want `GET /stats` to report how many tasks are still open, so we wrote the helper next to the task code, inside `src/routes/tasks.js`: a decorator called `countOpenTasks` that counts the stored tasks whose `done` field is `false`.

Then we called it from a route defined in `src/app.js`: a `GET /stats` handler that answers with the number the helper returns.

The server starts fine and `/api/tasks` answers, but the new route does not:

```
$ curl -i http://127.0.0.1:3000/stats
HTTP/1.1 500 Internal Server Error

{"statusCode":500,"error":"Internal Server Error","message":"fastify.countOpenTasks is not a function"}
```

The decorator lives in the plugin's context. `/stats` is registered at the root, one level above, where that name does not exist. Inside `app.js`, `fastify.hasDecorator('countOpenTasks')` is `false`; inside `taskRoutes` it is `true`.

| What you add | A child can use it                  | The parent can use it |
| ------------ | ----------------------------------- | --------------------- |
| decorator    | yes                                 | no                    |
| hook         | yes, it runs for the child's routes | no                    |

The same is true for routes: those registered inside a plugin belong to its context, prefix included, which is why the tasks answer at `/api/tasks` and not at `/tasks`.

The root file, without that route:

```file:/src/app.js
```

## Your turn

Neither half is in the files: `src/routes/tasks.js` does not decorate anything, and `src/app.js` has no `/stats` route. Write both. Inside the plugin, decorate the instance with a `countOpenTasks` function that counts the tasks where `done` is `false`. At the root of `app.js`, after the index route, add `GET /stats` answering `{ open: fastify.countOpenTasks() }`. Restart the server and call `/stats`: it answers `500`, exactly as the transcript above says. That failure is the point of the lesson, so do not try to make the route work yet.

<details>
<summary>Show the solution</summary>

```solution:/src/app.js
```

</details>

<details>
<summary>Show the solution</summary>

```solution:/src/routes/tasks.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## The fix

Put the decorator in the context both places share: the root. In `src/app.js`, right after the store and before the `register` call:

```js
fastify.decorate('countOpenTasks', () => {
  return fastify.tasks.list().filter((task) => !task.done).length;
});
```

Then delete the `decorate` call from `src/routes/tasks.js`. Nothing else changes: the plugin routes still see `fastify.tasks`, and `/stats` can now call the helper.

:::tip
Place a decorator at the level where it is first needed. If two sibling plugins need it, it belongs to their common parent.
:::

:::warn
Hooks follow the same direction. A hook added in `app.js` runs for the routes of `taskRoutes`; a hook added inside `taskRoutes` never runs for `/`.
:::

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

With the two halves written but the decorator still in the wrong place:

```bash
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Fastify"}'
curl -i http://127.0.0.1:3000/stats
```

The first call answers `201`. The second is the `500` above, with `fastify.countOpenTasks is not a function` in the body. Before you write the two halves it is a `404` instead: there is no `/stats` route at all. Once the decorator lives in `src/app.js` and the copy in `src/routes/tasks.js` is gone, the same call answers `{"open":1}`.

The next lesson is the same idea in the other direction: a plugin that has to share what it adds with its parent.
