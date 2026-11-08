---
type: lesson
title: The task store
focus: '/src/store/tasks.js'
---

# The task store

Our API needs somewhere to keep the tasks. In a real project that would be a database. Here we use a plain JavaScript `Map`, wrapped in a small module, so the shape of the code stays the same when you swap in a real database later.

## The files

```file:/src/store/tasks.js
```

```file:/src/server.js
```

## Reading the store

The function returns an object with the five things the API needs:

| Method | What it does |
|---|---|
| `create({ title, done })` | Adds a task and gives it an id |
| `list()` | Returns every task |
| `find(id)` | Returns one task, or `undefined` |
| `update(id, changes)` | Changes a task and returns the new one |
| `remove(id)` | Deletes a task |

Two details are worth noticing:

- The `Map` lives inside `createTaskStore`. Every call creates a brand new, empty store. This is what makes the tests independent later on.
- `nextId` starts at `1` and goes up. The ids are predictable, which makes the tests easy to write.

## The decorator

```js
fastify.decorate('tasks', createTaskStore());
```

Now every route can reach the store with `fastify.tasks`.

## Your turn

The store is missing the method that deletes a task. Write `remove(id)`: it takes the task out of the map and returns `true` when there was a task with that id, `false` when there was not. The route that calls it comes in the next lesson.

<details>
<summary>Show the solution</summary>

```solution:/src/store/tasks.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i http://127.0.0.1:3000/
node --input-type=module -e "import { createTaskStore } from './src/store/tasks.js'; const store = createTaskStore(); const task = store.create({ title: 'Learn Fastify' }); console.log(store.remove(task.id), store.find(task.id));"
```

The first answer shows `tasks: 0`. The store is empty for now, the next lesson fills it.

The second command builds a store and deletes the task it just created. Once `remove` is there it prints `true undefined`: the task was deleted, and reading it back finds nothing.
