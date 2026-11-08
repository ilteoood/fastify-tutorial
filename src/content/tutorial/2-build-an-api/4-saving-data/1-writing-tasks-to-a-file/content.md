---
type: lesson
title: Writing tasks to a file
focus: "/src/store/tasks.js"
---

# Writing tasks to a file

Restart the server and every task is gone. Nothing is broken: the tasks live in a `Map` inside `createTaskStore`, and a `Map` lives in the memory of one running Node.js process. Stop the process and the memory goes with it.

## Memory versus a file

Memory is fast and belongs to the process that owns it. A file sits on the disk and outlives the process. Anything that has to still be there tomorrow must reach the disk before the process ends.

We keep the `Map` — it already answers lookups by id — and copy the whole list into `data/tasks.json` after every change. Nothing reads that file yet; that is the next lesson.

## Writing the file

`node:fs/promises` is the file-system module of Node.js, in its promise-based version. The `node:` prefix marks a module that is built into Node.js: there is nothing to install, and the prefix makes it obvious that the import does not come from `node_modules`.

`writeFile(path, text)` writes text to a file, replacing whatever was in it before, and answers with a promise. `JSON.stringify` does the other half of the job: it turns a value into text. It understands arrays and objects, not `Map`, so the `Map` has to become an array of tasks first — spreading its values does that.

```js
JSON.stringify({ id: 1, title: 'Learn Fastify' }, null, 2);
```

The third argument is the indentation of the generated text. Without it everything lands on one line; with `2` the file is readable for a human.

`writeFile` returns a promise, so `save` has to be `async`, and every method that calls it must `await` it. That is why `create`, `update` and `remove` became `async` as well.

## The store

```file:/src/store/tasks.js
```

Each write is awaited before the method returns, so a `201 Created` means the task is already in the file.

## The routes

Reading still comes from the `Map`, so `list` and `find` stay synchronous. Only the three methods that write are promises now, and the routes await them:

```js
const task = await fastify.tasks.create(request.body);
const task = await fastify.tasks.update(request.params.id, request.body);
const removed = await fastify.tasks.remove(request.params.id);
```

```file:/src/routes/tasks.js
```

:::info
The path is `data/tasks.json`, relative to the directory the server is started from. `writeFile` creates the file, but not the folder, so `data/` has to exist.
:::

## Your turn

`save()` is empty, so the tasks never reach the disk. Write its body: turn the store's tasks into an array, serialize it with `JSON.stringify` and two spaces of indentation, and write the result to `filePath` with `writeFile`. The function is already `async` and every method that changes a task already awaits it, so nothing else has to change.

<details>
<summary>Show the solution</summary>

```solution:/src/store/tasks.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Fastify"}'
cat data/tasks.json
```

The Terminal is a real shell, so `cat` prints the file you just wrote. Until `save()` is written, the request still answers `201`, but the file stays `[]`. Then delete the task and look again:

```bash
curl -i -X DELETE http://127.0.0.1:3000/api/tasks/1
cat data/tasks.json
```
