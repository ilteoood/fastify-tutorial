---
type: lesson
title: Seeing what Fastify built
focus: '/src/server.js'
---

# Seeing what Fastify built

You know which routes this file defines, because you can read them. In a bigger app, plugins and folders decide that, and no file lists the result in one place. Fastify keeps that list for you. You only have to ask for it.

## The code

```file:/src/server.js
```

This is the server from the last two lessons: the `/health` route, the shutdown on `SIGINT` and `SIGTERM`, and the logger reading its level from the environment. It starts, it answers, it stops cleanly. What it never does is tell you what it registered. One line after `listen()` is enough to fix that.

## Asking Fastify what it built

Every route you register ends up in a tree inside the instance, and the routes of a plugin go into the same tree. `fastify.printRoutes()` returns that tree as a plain string: one line per route, with the path and the HTTP methods the route answers. A route registered under a prefix keeps the prefix in the path, so `/v1/tasks` appears as `v1/tasks (GET, HEAD)`. Because the result is a plain string, `console.log` writes it exactly as it was built, one route per line.

`fastify.printPlugins()` does the same for the plugin tree: every plugin in the order it was registered, with the time it took to load. When startup feels slower than it should, this tree tells you which plugin spends the time.

`fastify.hasRoute({ method: 'GET', url: '/' })` answers `true` or `false` for one route. In a test it is the cheapest way to assert that a plugin registered the route you expect, without sending a request.

Two things are worth knowing before you print the tree. First, the tree is only complete once the plugins have loaded, and `await fastify.listen(...)` waits for that: print after `listen()`, not at the top of the file, or routes registered by plugins are still missing. Second, `fastify.log.info(fastify.printRoutes())` puts the whole tree into one field of one JSON line, where every newline becomes a `\n` and the tree arrives flattened. `console.log` keeps it readable.

The tree earns its line whenever something other than you registers your routes. With `@fastify/autoload`, as in the chapter on scaling your API, a folder becomes routes, and this tree is the fastest way to see what the folder actually produced: the paths, the methods, the prefixes. It is also the first thing to print when a request answers `404` and you are certain the route exists.

## The Fastify CLI

`fastify-cli` is a small command line tool that loads your app file for you, so you do not start the server by hand. It is not part of Fastify; you add it to the project as a development dependency. `fastify print-routes <file>` prints the internal router tree, the same tree `printRoutes()` returns, so you do not have to add a print to the file to see it. `fastify start <file>` starts the app it loads, and takes `-l, --log-level` to set the level and `-P, --pretty-logs` for logs you can read instead of JSON lines.

Both commands expect a file that exports your Fastify instance or a plugin, because that export is the app they load and then start. This `server.js` starts itself the moment it is loaded and exports nothing, so the CLI has nothing to register: `fastify print-routes src/server.js` starts the server first, because that is what loading this file does, and then stops with `FastifyError [Error]: Plugin must be a function or a promise. Received: 'object'` and exit code `1`. While your app is one file that starts itself, keep the `console.log`; the CLI is what you reach for once that file exports the server instead.

## Your turn

Add one line after `await fastify.listen({ port, host })` that prints the route tree, so the **Output** panel shows every route the server registered as soon as it is up.

Print it with `console.log` rather than the logger, so the tree keeps its own lines. Start the server and check the **Output** panel: you should see `/` and `/health`, each with the methods it answers.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Start the server:

```bash
node src/server.js
```

The **Output** panel prints the listening line, and then the tree:

```text
└── / (GET, HEAD)
    └── health (GET, HEAD)
```

Each line is a path, and what follows in parentheses are the methods that path answers. `/` answers `GET` and `HEAD`, because Fastify adds `HEAD` to every `GET` route. `health` sits one level under `/`, which is how the tree is walked: down the path, segment by segment.

The two routes still answer while the tree is being printed:

```bash
curl -i http://127.0.0.1:3000/health
```

```text
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 15
Date: Sun, 08 Nov 2026 12:28:53 GMT
Connection: keep-alive
Keep-Alive: timeout=72

{"status":"ok"}
```

Now try the CLI on the same file:

```bash
npx fastify print-routes src/server.js
```

It prints the tree first, because loading the file starts the server and your line runs, and then stops on the missing export:

```text
FastifyError [Error]: Plugin must be a function or a promise. Received: 'object'
```

The command exits with code `1`, and the lines after that error are a stack trace inside `node_modules`. That is the CLI telling you it wanted a file that exports the app, not a file that starts it.

:::tip
In the exercise state the server still starts and both routes answer `200`, but the **Output** panel shows only the listening line, with no tree under it.
:::
