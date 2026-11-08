---
type: lesson
title: Publishing your API documentation
focus: '/src/server.js'
---

# Publishing your API documentation

Your server answers requests, and only you know what those requests are. The frontend team, the next person on the project, and the client generator you will need one day all have to read your code or ask you. This last lesson turns your routes into a document that machines can read and a page that people can browse.

## The code

```file:/src/server.js
```

This is the server from earlier lessons: `/health`, `/`, the API-key guard, the shutdown on `SIGINT` and `SIGTERM`, and the route tree printed after `listen()`. Two imports are already at the top of the file and nothing uses them yet. One `// TODO:` marks the place where they belong. Until you fill it in, the server starts and answers exactly as before, and the documentation routes simply do not exist.

## From schemas to a document

The two routes in this file have no schemas, so there is little to document yet beyond their paths. In Part 2 you wrote a lot of them: the body of a task, the querystring of a list, the response shapes, the error shapes. Those schemas were doing one job there, checking and serializing data at runtime. They are also the raw material of an OpenAPI document, because an OpenAPI document describes exactly the things a route schema already holds: the path, the method, the parameters, the body, the responses.

`@fastify/swagger` does the translation. You register it once, it reads the routes of the instance and the schemas attached to them, and it keeps a document you can ask for later with `fastify.swagger()`.

The order matters. The plugin collects the routes that exist when it loads, so it has to be registered before the routes you want to document. Register it after them and the server still works, but the document comes back with an empty `paths` object and the page shows nothing. That is why the registration goes right after the instance is created, before any `fastify.get(...)`.

The plugin speaks two dialects and you pick one with the registration options. Without an `openapi` option you get a Swagger 2.0 document, and the same is true if you pass a `swagger` option instead: the document starts with `"swagger": "2.0"`. Pass `openapi` and you get OpenAPI 3.x instead, `"openapi": "3.0.3"` with the versions in this lesson. If you send neither, the document is Swagger 2.0 with the plugin's own name as the title, which is rarely what you want: always give it an `info` object with at least a title and a version.

Route schemas carry more than types. A schema can also have `description`, `summary`, `tags` and `operationId`, and `@fastify/swagger` copies those into the document as they are: the summary and description become the text next to the route, the tags group routes into sections, and the `operationId` names the operation for generated clients. That is the cheapest documentation work you can do, because it lives in the file next to the code that it describes and it cannot drift away from it.

## A page for humans

The document is JSON, which is fine for a tool and hopeless for a reader. `@fastify/swagger-ui` serves it as a page: it ships a copy of Swagger UI, points it at the document, and adds the routes that make it work.

The `routePrefix` option decides where all of that lives, `/documentation` here. The page itself is a short HTML file at the prefix, and the document is served as JSON at `<routePrefix>/json`, which in this case is `/documentation/json`; the page loads that URL and renders it. There is a `/documentation/yaml` next to it if you prefer YAML. When you fetch the page with `curl` you get the HTML shell, not the rendered routes, because the rendering happens in the browser.

A live page that lists every route of your API is a gift to anyone who wants to find an unguarded endpoint. In production you usually protect it or leave it out. To protect it, give `@fastify/swagger-ui` a `uiHooks` option: the same `onRequest` and `preHandler` functions a route takes, applied to every route the plugin adds, the JSON one included. To leave it out, register the UI plugin only when you are not in production. `@fastify/swagger` itself no longer serves a route of its own: version 8 removed its `exposeRoute` option, so the document is reachable only through the prefix of the UI plugin.

## Your turn

Register both plugins in this file, before the two routes. Give the document an OpenAPI `info` object with the title `Fastify tutorial API` and the version `1.0.0`, and serve the page on `/documentation`.

Then start the server and check the **Output** panel: the route tree should now show the documentation routes under `documentation`, next to `/` and `health`. Request `/documentation` and you get the page; request `/documentation/json` and the document lists both of your routes.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

Every call below carries the `x-api-key: dev-key` header the last lesson added; without it each of them answers `401`. In the exercise state, before you register anything, the documentation page does not exist:

```bash
curl -i -H 'x-api-key: dev-key' http://127.0.0.1:3000/documentation
```

```text
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8
content-length: 85
Date: Sun, 08 Nov 2026 12:40:28 GMT
Connection: keep-alive
Keep-Alive: timeout=72

{"message":"Route GET:/documentation not found","error":"Not Found","statusCode":404}
```

The two routes of the API still answer, which is the point: the missing plugin takes nothing away from the server.

```bash
curl -i -H 'x-api-key: dev-key' http://127.0.0.1:3000/
```

```text
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 17
Date: Sun, 08 Nov 2026 12:40:28 GMT
Connection: keep-alive
Keep-Alive: timeout=72

{"hello":"world"}
```

Now press **Solve**, or write the registration yourself, and ask for the page again:

```bash
curl -i -H 'x-api-key: dev-key' http://127.0.0.1:3000/documentation
```

```text
HTTP/1.1 200 OK
content-type: text/html; charset=utf-8
content-length: 964
Date: Sun, 08 Nov 2026 12:40:45 GMT
Connection: keep-alive
Keep-Alive: timeout=72

<!-- HTML for static distribution bundle build -->
```

Same URL, a different answer: an HTML page instead of `404`. Open `http://127.0.0.1:3000/documentation` in a browser and you see that HTML turned into a list of your routes. The page and the document are separate requests:

```bash
curl -s -H 'x-api-key: dev-key' http://127.0.0.1:3000/documentation/json
```

```text
{"openapi":"3.0.3","info":{"title":"Fastify tutorial API","version":"1.0.0"},"components":{"schemas":{}},"paths":{"/health":{"get":{"responses":{"200":{"description":"Default Response"}}}},"/":{"get":{"responses":{"200":{"description":"Default Response"}}}}}}
```

This is the whole document, 259 bytes of it. `openapi` is the dialect, `info` is the title and version you wrote, and `paths` has one entry per route, with the method under it and the responses it can give. Each response says `Default Response` because no route here declares a schema for it: add a `response` schema and that description becomes yours, together with the shape of the body.

The normal routes are untouched by any of this:

```bash
curl -i -H 'x-api-key: dev-key' http://127.0.0.1:3000/
```

```text
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 17
Date: Sun, 08 Nov 2026 12:40:45 GMT
Connection: keep-alive
Keep-Alive: timeout=72

{"hello":"world"}
```

:::tip
In the exercise state the server starts, `/health` and `/` answer `200`, and `/documentation` answers `404`. Once both plugins are registered before the routes, `/documentation` answers `200` with HTML and `/documentation/json` answers `200` with a document that has both paths in it.
:::

## Where to go next

This tutorial stopped at the edge of the API. There are a few directions from here, and each one is a project of its own.

**The documentation.** The [Fastify documentation](https://fastify.dev/docs/latest/) is the reference for everything you used here and everything you did not. The Guides cover databases, plugin writing, serverless, deployment and the recommendations, and the Reference has a page for the options of the server, the routes and the hooks. Read the pages for the features you actually use, and keep the rest for the day you need them.

**Tests.** You wrote a few tests with `node:test` and `fastify.inject()`. Your own project deserves more of them, around the routes that matter and the errors you expect. A test that sends a request and checks the status and the body catches the regression you would otherwise find in production, and it is the reason you can change the code at all.

**TypeScript.** Fastify is written in TypeScript and ships its own types. The types of a route follow the schemas you attach to it, so a handler that answers the wrong shape fails to compile instead of failing at runtime. Port one route first and see how the schemas pay for themselves twice.

**Deployment.** You ran this server on your machine with `node --watch`. A real deployment needs a process manager or a container, a proxy in front, a log collector that understands JSON lines, and a health check pointed at `/health`. The Guides have the recipes, and the clean shutdown you wrote in the chapter on running in production is the part most projects forget.

**The ecosystem.** Most of what a real API needs is already a plugin: `@fastify/jwt` for tokens, `@fastify/static` for files, `@fastify/websocket` for real-time connections, and databases of every kind. They register the way the two plugins of this lesson did, so you already know the shape of the work. Pick the one your project needs next, read its README, and register it before the routes that use it.
