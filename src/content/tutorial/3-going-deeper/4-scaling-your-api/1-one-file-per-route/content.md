---
type: lesson
title: One file per route
focus: '/src/app.js'
---

# One file per route

So far `src/app.js` imports the route file and registers it by hand. Every new route file adds an import line and a register line to the same file, and the list of routes grows with every resource you add. The plugin `@fastify/autoload` removes that bookkeeping: it turns a folder into the wiring.

## The code

```file:/src/app.js
```

## The folder is the wiring

`@fastify/autoload` loads every file of a folder as a plugin. Each file has to export a plugin function as its default export, and `src/routes/tasks.js` already does exactly that, so the file is ready to be loaded.

The folder replaces the import list. `app.js` no longer knows how many route files exist, and it does not have to be touched when you add one.

The `options: { prefix: '/api' }` option mounts every route of the folder under `/api`. The route written as `'/tasks'` inside `src/routes/tasks.js` is served at `/api/tasks`, so the URLs stay exactly the same.

By default the name of a subfolder is added to the prefix. This option is called `dirNameRoutePrefix`, and it means that a file in `routes/tasks/index.js` is mounted under `/api/tasks`, while a route written as `'/tasks'` inside it would answer at `/api/tasks/tasks`. Our route files sit directly in `src/routes`, so they only get the `/api` prefix.

Every loaded file gets its own encapsulated context. Hooks and decorators you add inside a route file stay inside that file, exactly like the contexts you saw in the encapsulation chapter.

The path of the folder is built with `import.meta.dirname`, so this needs Node.js 20.11 or newer.

The package is called `@fastify/autoload`, and this lesson adds it to the `package.json` of the app.

## Your turn

Load the routes folder with `@fastify/autoload` instead of importing the route file by hand. Keep every route of the folder under `/api`. The import of the route file is gone from `src/app.js` already; the folder has to fill the hole it left.

<details>
<summary>Show the solution</summary>

```solution:/src/app.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i http://127.0.0.1:3000/api/tasks
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'content-type: application/json' -d '{"title":"Learn Fastify"}'
curl -i http://127.0.0.1:3000/
```

Before your change the folder is not loaded, so the task routes are not mounted and the first two requests answer `404`:

```text
$ curl -i http://127.0.0.1:3000/api/tasks
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8

{"message":"Route GET:/api/tasks not found","error":"Not Found","statusCode":404}

$ curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'content-type: application/json' -d '{"title":"Learn Fastify"}'
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8

{"message":"Route POST:/api/tasks not found","error":"Not Found","statusCode":404}
```

After your change the folder is the wiring, and the answers are the ones you had before. The plugin changed how the routes are registered, not what they answer, and the URLs are the same:

```text
$ curl -i http://127.0.0.1:3000/api/tasks
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"tasks":[]}

$ curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'content-type: application/json' -d '{"title":"Learn Fastify"}'
HTTP/1.1 201 Created
content-type: application/json; charset=utf-8

{"task":{"id":1,"title":"Learn Fastify","done":false}}

$ curl -i http://127.0.0.1:3000/
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"name":"Tasks API","endpoints":["GET /api/tasks","POST /api/tasks","GET /api/tasks/:id","PATCH /api/tasks/:id","DELETE /api/tasks/:id"]}
```

The test suite follows the routes, so `npm test` passes all 7 tests once the folder is loaded. Before that the six tests that call `/api` fail with a `404`; the test on the index route already passes, because `/` is registered in `app.js`.
