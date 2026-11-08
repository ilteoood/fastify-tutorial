export default async function taskRoutes(fastify) {
  const log = fastify.log.child({ module: 'tasks' });

  log.info('task routes loaded');

  fastify.get('/tasks', async () => {
    return { tasks: fastify.tasks.list() };
  });

  fastify.post(
    '/tasks',
    {
      schema: {
        body: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1 },
            done: { type: 'boolean', default: false },
          },
        },
      },
    },
    async (request, reply) => {
      const task = fastify.tasks.create(request.body);

      // TODO: log the new task with request.log.info, carrying its id in a `taskId` field

      return reply.code(201).send({ task });
    },
  );

  fastify.get(
    '/tasks/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
      },
    },
    async (request, reply) => {
      const task = fastify.tasks.find(request.params.id);

      if (task === undefined) {
        request.log.warn({ taskId: request.params.id }, 'task not found');

        return reply.code(404).send({ error: 'Task not found' });
      }

      return { task };
    },
  );

  fastify.patch(
    '/tasks/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1 },
            done: { type: 'boolean' },
          },
        },
      },
    },
    async (request, reply) => {
      const task = fastify.tasks.update(request.params.id, request.body);

      if (task === undefined) {
        request.log.warn({ taskId: request.params.id }, 'task not found');

        return reply.code(404).send({ error: 'Task not found' });
      }

      return { task };
    },
  );

  fastify.delete(
    '/tasks/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' },
          },
        },
      },
    },
    async (request, reply) => {
      const removed = fastify.tasks.remove(request.params.id);

      if (!removed) {
        request.log.warn({ taskId: request.params.id }, 'task not found');

        return reply.code(404).send({ error: 'Task not found' });
      }

      request.log.info({ taskId: request.params.id }, 'task deleted');

      return reply.code(204).send();
    },
  );
}
