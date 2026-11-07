---
type: lesson
title: Loading at startup
focus: "/src/store/tasks.js"
---

# Loading at startup

The app now writes every change to `data/tasks.json`, and never reads it. A file nobody reads is just a log. This lesson turns it into the memory of the app.

## Reading the file

```js
stored = JSON.parse(await readFile(filePath, "utf8"));
```

`readFile` returns the content of the file. Without `'utf8'` you get bytes; with it you get a string, which is what `JSON.parse` needs to rebuild the tasks.

## The missing file

On the very first start there is no file, and `readFile` rejects with an error whose `code` is `ENOENT`, short for "error, no entity". That is not a failure, it is an empty task list.

```js
try {
  stored = JSON.parse(await readFile(filePath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }

  return;
}
```

Everything that is not `ENOENT` — a permission problem, a file full of broken JSON — is a real problem, so it is thrown again. Silently starting with an empty list would make the app look fine while the data of yesterday sits unreadable on the disk.

## Rebuilding the state

Loading has to rebuild the two things the store keeps: the `Map` and the id counter.

```js
for (const task of stored) {
  tasks.set(task.id, task);
  nextId = Math.max(nextId, task.id + 1);
}
```

If `nextId` started again at `1`, the next created task would reuse an id that already exists, and two tasks would share it. `Math.max` keeps the counter one above the biggest id in the file, whatever order the tasks are stored in.

## An async factory

Loading happens before the store is usable, so `createTaskStore` cannot return anything until the file has been read. It becomes `async`, and `buildApp` awaits it:

```file:/src/store/tasks.js
```

```file:/src/app.js
```

`storeFilePath` is optional: the store falls back to `data/tasks.json`. The tests pass their own path, because a test must not depend on the file a previous run left behind.

```file:/test/tasks.test.js
```

The last test creates a task, closes the app, builds a second app on the same file and expects the task back, with the next id at `2`. That is exactly what a restart does.

## Try it

```bash
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Fastify"}'
cat data/tasks.json
npm test
```

The file now holds what the API answered, and the eight tests pass. From here on, the file is what the app knows: whatever the last process wrote is what the next one reads.
