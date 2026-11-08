export default async function taskRoutes(fastify) {
  fastify.get('/tasks', async () => {
    return { tasks: fastify.tasks.list() };
  });

  // TODO: add the POST /tasks route that creates a task and answers 201

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
        return reply.code(404).send({ error: 'Task not found' });
      }

      return { task };
    },
  );
}
