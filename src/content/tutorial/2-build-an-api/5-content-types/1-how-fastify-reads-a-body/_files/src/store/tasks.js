import { readFile, writeFile } from 'node:fs/promises';

export async function createTaskStore({ filePath = 'data/tasks.json' } = {}) {
  const tasks = new Map();
  let nextId = 1;

  async function load() {
    let stored;

    try {
      stored = JSON.parse(await readFile(filePath, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }

      return;
    }

    for (const task of stored) {
      tasks.set(task.id, task);
      nextId = Math.max(nextId, task.id + 1);
    }
  }

  async function save() {
    await writeFile(filePath, JSON.stringify([...tasks.values()], null, 2));
  }

  await load();

  return {
    async create({ title, done = false }) {
      const task = { id: nextId++, title, done };
      tasks.set(task.id, task);

      await save();

      return task;
    },
    list() {
      return [...tasks.values()];
    },
    find(id) {
      return tasks.get(id);
    },
    async update(id, changes) {
      const task = tasks.get(id);

      if (task === undefined) {
        return undefined;
      }

      const updated = { ...task, ...changes };
      tasks.set(id, updated);

      await save();

      return updated;
    },
    async remove(id) {
      const removed = tasks.delete(id);

      await save();

      return removed;
    },
  };
}
