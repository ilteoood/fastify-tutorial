---
type: lesson
title: Hooks you rarely see
focus: '/src/hooks.js'
---

# Hooks you rarely see

Most of the hooks in this app run for every request. Two of them do not: `onRoute` runs when a route is registered, not when a request arrives, and `onRequestAbort` runs only when the client gives up before the answer is sent.

## The code

```file:/src/hooks.js
```

```file:/src/app.js
```

`registerLifecycleHooks` is called on the root instance before the routes are registered, so both hooks see everything that comes after them.

## Two hooks outside the request

`onRoute` is not a request hook. Fastify calls it every time a route is registered and hands it the route options: the method, the url, the schema, the config. It is the one place where you can change how a route is registered, whatever file the route is written in — tagging it, adding a default, or simply writing down the API as it is built. Because it runs at registration time, it sees the routes that come after it and nothing else.

`onRequestAbort` runs only when the client closes the connection before the answer is sent: a browser tab closed, a `curl` with a timeout, a phone that lost its network. The handler is still running on the server, and the hook is your chance to notice that nobody is waiting for the answer anymore.

The app has one extra route, `/slow`, that waits five seconds before answering. It is there to have something to disconnect from.

## Your turn

Add both hooks to `registerLifecycleHooks`: an `onRoute` hook that logs every route as it is registered, with its method and its url, and an `onRequestAbort` hook that logs when the client goes away. No code block with the answer.

<details>
<summary>Show the solution</summary>

```solution:/src/hooks.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

Then:

```bash
curl -i http://127.0.0.1:3000/api/tasks
```

In the **Output** panel, the route logs appear when the server starts, before the first request, one line per route. Fastify also registers a `HEAD` route for every `GET` route, so you see both.

```text
route registered: GET /
route registered: HEAD /
route registered: GET /slow
route registered: HEAD /slow
route registered: GET /api/tasks
route registered: HEAD /api/tasks
route registered: POST /api/tasks
route registered: GET /api/tasks/:id
route registered: HEAD /api/tasks/:id
route registered: PATCH /api/tasks/:id
route registered: DELETE /api/tasks/:id
```

```bash
curl -i --max-time 1 http://127.0.0.1:3000/slow
```

This one gives up after a second, and the Output panel shows that the client went away.

```text
the client went away
```
