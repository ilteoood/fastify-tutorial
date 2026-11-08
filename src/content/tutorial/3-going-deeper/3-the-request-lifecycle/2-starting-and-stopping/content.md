---
type: lesson
title: Starting and stopping
focus: '/src/server.js'
---

# Starting and stopping

A Fastify instance is an object, not a server. Building it loads your code; nothing is listening until you say so.

| Call | What it does |
|---|---|
| `fastify.ready()` | Loads every plugin; no port is opened |
| `fastify.listen({ port })` | Calls `ready()`, then opens the port |
| `fastify.close()` | Stops the server, waits for in-flight requests, runs the `onClose` hooks |

## Why server.js and app.js are two files

`buildApp()` in `app.js` only builds: decorate, register routes, return the instance. It never calls `listen()`, because importing a module must not open a port. If it did, every test would fight for port 3000, and the test file would have to start and stop a real server.

`server.js` is the program: it builds the app and listens. The tests take the other road, `buildApp()` plus `ready()` plus `inject`, which sends a request without a socket.

## The code

```file:/src/server.js
```

```file:/src/app.js
```

The `onClose` hook runs after the server has stopped listening and every in-flight request has finished, so nothing can use the store while it is closed. Here `fastify.tasks.close()` only empties the `Map`; with a real database client it would close the pool in the same place.

The tests use the same hook: `t.after(() => fastify.close())` releases the resources of each test, and a test that leaves them open keeps the whole process alive.

## The signals

`Ctrl` + `C` sends `SIGINT`. `docker stop` sends `SIGTERM`. With no handler the process dies at once: `close()` never runs, `onClose` never runs, and a request in flight is cut in the middle.

So `server.js` listens for both signals, logs which one arrived, waits for `close()` and exits with code `0`. `process.once` registers one handler per signal, so a second `Ctrl` + `C` does not start a second shutdown.

:::warn
`close()` waits for in-flight requests. A request that never finishes keeps the process alive, and Docker kills it after its timeout. Bigger services add a timer that exits anyway.
:::

## Your turn

`server.js` builds the app and listens, and stops there: `Ctrl` + `C` kills the process where it stands, so `close()` and the `onClose` hook never run and a request in flight is cut. Write the `shutdown(signal)` function the lesson describes: log `${signal} received, closing the server`, await `fastify.close()`, then exit with code `0`. Register it for both signals with `process.once`, before `listen()` is called. Then start the server, press `Ctrl` + `C` and read the last two lines of the **Output** panel.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i http://127.0.0.1:3000/api/tasks
```

Then press `Ctrl` + `C` in the **Terminal** panel. In the **Output** panel, the last two messages are:

```text
SIGINT received, closing the server
closing the task store
```

Start it again with `npm start`, then run the tests:

```bash
npm test
```

Seven green tests, and no port was opened for any of them.

Without your handler the two lines never appear: the process ends on the spot, `closing the task store` is never logged, and the shell reports `130` for the interrupted process instead of `0`.
