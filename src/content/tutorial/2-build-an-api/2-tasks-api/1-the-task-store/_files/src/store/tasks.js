export function createTaskStore() {
  const tasks = new Map();
  let nextId = 1;

  return {
    create({ title, done = false }) {
      const task = { id: nextId++, title, done };
      tasks.set(task.id, task);

      return task;
    },
    list() {
      return [...tasks.values()];
    },
    find(id) {
      return tasks.get(id);
    },
    update(id, changes) {
      const task = tasks.get(id);

      if (task === undefined) {
        return undefined;
      }

      const updated = { ...task, ...changes };
      tasks.set(id, updated);

      return updated;
    },
    // TODO: add a remove(id) method that deletes the task and returns true when it was there
  };
}
