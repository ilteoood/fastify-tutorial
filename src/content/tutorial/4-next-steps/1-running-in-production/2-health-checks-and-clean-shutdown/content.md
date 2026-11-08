---
type: lesson
title: Health checks and clean shutdown
focus: '/src/server.js'
---

# Health checks and clean shutdown

A server that runs in production has two jobs nobody talks about: it has to tell everybody that it is alive, and it has to stop without dropping the requests it is already serving.

## The code

```file:/src/server.js
```

The file is the same single-file server you have been building, with two things missing. The `/health` route does not exist yet, so asking for it answers `404`. The server also stops the moment it is killed, without waiting for anything.

## A way to ask if the server is alive

A health check is a tiny route that answers one question: is the process up and serving? Nothing more. A load balancer calls it before it sends traffic to your server. A container platform calls it to decide whether to keep the container running. A monitoring system calls it to draw the green or the red line on your dashboard.

The route you write here is a liveness check. It says "the process is alive", and nothing about whether the process can do useful work. In a bigger API you would add a second route, a readiness check, that answers `503` until the app can really serve traffic: until the database is connected, until the cache is warm, until the migration has run. The liveness route then answers `200` as long as the process exists, and the readiness route is the one the load balancer waits for.

Two rules keep a health check useful. It has to be fast, because it is called every few seconds by several systems at once. And it must not touch slow dependencies, because a health check that queries the database turns a database problem into an outage: the balancer takes your server out of rotation because the check is slow, and the server stops receiving the traffic it could still have served. Return a fixed object. That is all it needs.

The route is registered next to the other route, before the server starts listening. Fastify only accepts requests once `listen` has been called, so the order inside the file does not matter for the client, but it keeps the file easy to read: all the routes together, then the program that starts.

## Closing without dropping requests

When you press `Ctrl` + `C` in a terminal, the shell sends the process a `SIGINT`. When a container platform stops a container, it sends a `SIGTERM`. Both are only a request: the operating system is telling your process "it is time to stop".

Fastify does nothing with those signals on its own. Without a handler, the process dies on the spot. The socket closes, the request that was halfway through is cut in the middle, and the client sees a connection error instead of an answer.

So you handle the signals yourself. On `SIGINT` or `SIGTERM` you call `fastify.close()`. `close()` stops the server from accepting new connections and waits for the requests that are already running to finish. While that happens, Fastify answers any new request with `503 Service Unavailable`, because the `return503OnClosing` option is on by default. That is the point of the wait: the load balancer notices the `503` and stops sending traffic to a server that is on its way out, so nobody gets a broken connection.

When `close()` has finished, the handler calls `process.exit(0)`. The exit code `0` tells the supervisor that the process stopped on purpose, so it is not restarted as if it had crashed.

You already wrote exactly this shutdown in Part 3, in the lesson on starting and stopping. The only thing that changed here is that the server is a single file instead of a pair, so `fastify` is the instance you built in the same file. The shape of the handler is the same: log the signal, close, exit with `0`.

## Your turn

Two things are missing from `server.js`.

First, add a `GET /health` route that answers `{ status: 'ok' }`. Put it next to the `GET /` route, before the server starts listening.

Second, add a shutdown function and register it for the signals. The function takes the name of the signal, logs that the signal was received, awaits `fastify.close()` and exits with code `0`. Register it for `SIGINT` and `SIGTERM` with `process.once`, inside `start()` and before `listen()` is called.

Then start the server and send it a `SIGTERM` to watch it stop in an orderly way.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

With the solution applied, start the server and ask it how it is doing:

```bash
curl -i http://127.0.0.1:3000/health
```

```text
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 15
Connection: keep-alive
Keep-Alive: timeout=72

{"status":"ok"}
```

And the route you already had still answers:

```bash
curl -i http://127.0.0.1:3000/
```

```text
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 17
Connection: keep-alive
Keep-Alive: timeout=72

{"hello":"world"}
```

Now stop the server the way a container platform stops it. Start the server in the background, note the process id, and send it the signal:

```bash
node src/server.js &
SERVER_PID=$!
kill -TERM $SERVER_PID
wait $SERVER_PID
echo "exit code: $?"
```

The **Output** panel shows one JSON line per log entry, and the last one says that the signal arrived:

```text
{"level":30,"time":1794140019957,"pid":337770,"hostname":"RPi","msg":"Server listening at http://127.0.0.1:3000"}
{"level":30,"time":1794140021403,"pid":337770,"hostname":"RPi","reqId":"req-1","req":{"method":"GET","url":"/health","host":"127.0.0.1:3000","remoteAddress":"127.0.0.1","remotePort":39916},"msg":"incoming request"}
{"level":30,"time":1794140021421,"pid":337770,"hostname":"RPi","reqId":"req-1","res":{"statusCode":200},"responseTime":16.441542000000027,"msg":"request completed"}
{"level":30,"time":1794140021440,"pid":337770,"hostname":"RPi","reqId":"req-2","req":{"method":"GET","url":"/","host":"127.0.0.1:3000","remoteAddress":"127.0.0.1","remotePort":39932},"msg":"incoming request"}
{"level":30,"time":1794140021441,"pid":337770,"hostname":"RPi","reqId":"req-2","res":{"statusCode":200},"responseTime":0.9998199999999997,"msg":"request completed"}
{"level":30,"time":1794140021444,"pid":337770,"hostname":"RPi","msg":"SIGTERM received, closing the server"}
```

The shell prints the exit code of the process:

```text
exit code: 0
```

Without the handler the last log line never appears, the process dies where it stands, and the shell reports `143` for a process killed by `SIGTERM` instead of `0`.

:::tip
In the exercise state the server still runs and `GET /` still answers `200`, but `GET /health` answers `404`, because the route does not exist yet.
:::
