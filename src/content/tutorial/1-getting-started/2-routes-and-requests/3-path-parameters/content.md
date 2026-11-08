---
type: lesson
title: Path parameters
focus: '/src/server.js'
---

# Path parameters

`/tasks/42` and `/tasks/43` are the same route with a different value. Fastify lets you capture that value with a **parameter**: a name between two slashes, prefixed with a colon.

```js
fastify.get('/tasks/:id', async (request) => {
  return { id: request.params.id };
});
```

Calling `GET /tasks/42` gives you `request.params.id === '42'`.

## The code

```file:/src/server.js
```

## The rules

- A parameter is written `:name` and always matches exactly one path segment.
- Parameters are always strings in `request.params`: `'42'`, never the number `42`. You will convert them yourself, or let a schema do it for you.
- The order in the URL matters: `/tasks/:id` and `/tasks/:id/notes/:noteId` are two different routes.

## Wildcards

`:name` matches a single segment. To capture many segments, put `*` in the path instead of a named parameter: a route whose path ends in `/*` receives everything after that slash in one parameter, which is called `*`.

`GET /files/docs/guide.md` gives you `request.params['*'] === 'docs/guide.md'`.

:::warn
The wildcard parameter is named `*`, so you read it with `request.params['*']` and not `request.params.*`.
:::

## Static routes win

Fastify checks the routes that have no parameters first, so `/tasks/stats` will never be swallowed by `/tasks/:id`.

## Your turn

Two routes are missing, and the `curl` commands below call both of them. Add `GET /tasks/:id/notes/:noteId`, which returns the whole `request.params` object, and `GET /files/*`, which returns the part of the path after `/files/` as `{ path: ... }`.

`/tasks/:id` is already in the file and matches a single segment, so `/tasks/42/notes/7` needs a route of its own: `/tasks/:id/notes/:noteId` gives you `{ id: '42', noteId: '7' }` in `request.params`. Read the wildcard with the bracket syntax, `request.params['*']`.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i http://127.0.0.1:3000/tasks/42
curl -i http://127.0.0.1:3000/tasks/42/notes/7
curl -i http://127.0.0.1:3000/files/docs/guide.md
```
