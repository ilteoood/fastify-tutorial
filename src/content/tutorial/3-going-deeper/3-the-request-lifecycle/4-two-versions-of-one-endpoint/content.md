---
type: lesson
title: Two versions of one endpoint
focus: '/src/routes/tasks.js'
---

# Two versions of one endpoint

The shape of an answer is a promise. The moment a client reads `{ tasks: [...] }` you cannot change it without breaking that client. Fastify lets you keep both promises on the same url: the route carries a version, and the client says which version it wants.

## The code

```file:/src/routes/tasks.js
```

## Versioning with a constraint

A route can carry a `constraints` object, and the `version` constraint is matched against the `Accept-Version` header of the request:

- a request without the header matches the route that has no constraint — the old answer;
- a request with `Accept-Version: 2.0.0` matches the route that declares `constraints: { version: '2.0.0' }` — the new answer.

Both routes live at the same url, so a client can change the shape of the answer without changing the url it calls. The route declares an exact version, while the client may ask with a range such as `2.x` or `*`, so `2.0.0` is the only route version that answers a client asking for `2.0.0`.

The `Accept-Version` the client sent is on `request.routeOptions.version` (it is `undefined` when the header is absent), so a handler can also behave differently depending on what the client asked for.

:::info
A request that names a version only sees versioned routes. If you ask for `1.0.0` and no route declares that version, the answer is `404`, even when an unversioned route exists for the same url. Send the header only to the endpoints that are versioned.
:::

## Your turn

Add a second `GET /api/tasks` route that declares the constraint `2.0.0` and answers with the tasks inside a `data` property, together with a `count` of how many there are. The route without a constraint stays as it is, so the clients that do not send the header keep the answer they know. No code block with the answer.

<details>
<summary>Show the solution</summary>

```solution:/src/routes/tasks.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i http://127.0.0.1:3000/api/tasks
curl -i -H 'accept-version: 2.0.0' http://127.0.0.1:3000/api/tasks
curl -i -H 'accept-version: 1.0.0' http://127.0.0.1:3000/api/tasks
```

The store is empty when the server starts, so the lists come back empty.

Before your change no route declares a version, so all three requests get the old answer:

```text
$ curl -i http://127.0.0.1:3000/api/tasks
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"tasks":[]}

$ curl -i -H 'accept-version: 2.0.0' http://127.0.0.1:3000/api/tasks
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"tasks":[]}

$ curl -i -H 'accept-version: 1.0.0' http://127.0.0.1:3000/api/tasks
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"tasks":[]}
```

After your change the first request has no header and gets the old answer, the second one asks for `2.0.0` and gets the new one, the third one asks for a version that does not exist and gets a `404`:

```text
$ curl -i http://127.0.0.1:3000/api/tasks
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"tasks":[]}

$ curl -i -H 'accept-version: 2.0.0' http://127.0.0.1:3000/api/tasks
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"data":[],"count":0}

$ curl -i -H 'accept-version: 1.0.0' http://127.0.0.1:3000/api/tasks
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8

{"message":"Route GET:/api/tasks not found","error":"Not Found","statusCode":404}
```
