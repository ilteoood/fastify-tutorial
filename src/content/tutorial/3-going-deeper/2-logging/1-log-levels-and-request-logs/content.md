---
type: lesson
title: Log levels and request logs
focus: '/src/app.js'
---

# Log levels and request logs

A log line is the only witness of what your server did at 3 a.m. Let us look at what Fastify writes and how to read it.

## Turn it on in one place

The application is built by `buildApp()`, so the logger is configured there:

```file:/src/app.js

```

`logger: { level: 'info' }` means "write every line at level `info` or more severe". `logger: true` is the same: Fastify then uses `info`.

The tests build the app too, but they should stay quiet:

```js
const fastify = await buildApp({ logger: false });
```

`...options` comes last, so the caller wins over the defaults.

## The levels

| Level    | Number | When to use it                                 |
| -------- | ------ | ---------------------------------------------- |
| `fatal`  | 60     | the process is about to die                    |
| `error`  | 50     | a request failed because of a bug              |
| `warn`   | 40     | something is wrong, but the request was served |
| `info`   | 30     | normal events: startup, a task created         |
| `debug`  | 20     | details you need while developing              |
| `trace`  | 10     | everything, including library internals        |
| `silent` | —      | write nothing at all                           |

The `"level":30` field is the number of the level that produced the line: `30` is `info`.

With `'debug'`, the `debug` and `trace` calls start to appear; with `'warn'`, both request lines disappear. A call below the configured level costs almost nothing, so you can leave `log.debug()` in production code.

## Two loggers

Fastify gives you two loggers, both instances of pino, the logging library Fastify uses:

- `fastify.log` belongs to the server. Use it outside requests: startup, plugin loading, background jobs.
- `request.log` belongs to one request. It is the same logger plus a `reqId`.

```file:/src/routes/tasks.js

```

Inside a handler, `request.log.info({ taskId }, 'task created')` adds `taskId` to the line, and Fastify adds `reqId` for you. The 404 path uses `warn`: nothing is broken, but the request did not do what was asked.

:::tip
`fastify.log.child({ module: 'tasks' })` returns a new logger that adds those fields to every line it writes. The route plugin above uses one, which is why its line carries `"module":"tasks"`. Use a child logger per module or feature.
:::

## One request, several lines

A single `POST /api/tasks` writes three lines (several fields removed here):

```text
{"level":30,"reqId":"req-2","req":{"method":"POST","url":"/api/tasks"},"msg":"incoming request"}
{"level":30,"reqId":"req-2","taskId":1,"msg":"task created"}
{"level":30,"reqId":"req-2","res":{"statusCode":201},"msg":"request completed"}
```

The `reqId` is the same on all three. When a user reports "my task did not save", one id gives you the whole story of that request, in order.

## One JSON object per line

Each line is a complete JSON object, and the file is one object per line, also called **JSON Lines**. Log collectors index it without guessing, and an error stays on one line, its stack inside the `err` field. The `time` field is a Unix timestamp in milliseconds.

## Try it

Open the **Terminal** panel and run:

```bash
curl -i http://127.0.0.1:3000/api/tasks
curl -X POST -H 'Content-Type: application/json' -d '{"title":"Read the logs"}' http://127.0.0.1:3000/api/tasks
curl -i http://127.0.0.1:3000/api/tasks/999
```

Find the `reqId` of the last request in the **Output** panel: its three lines share it. The POST also shows your `taskId` field.
