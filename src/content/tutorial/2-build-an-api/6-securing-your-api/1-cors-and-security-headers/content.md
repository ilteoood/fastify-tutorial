---
type: lesson
title: CORS and security headers
focus: '/src/app.js'
---

# CORS and security headers

Two plugins shape how browsers treat your API: which pages may read it, and how.

## The browser hides the response

A page's **origin** is the scheme, host and port it was loaded from. `http://localhost:5173` and `http://localhost:3000` differ only in the port, so they are different origins.

When JavaScript on one origin calls another, the browser sends the request, then checks the response for an `Access-Control-Allow-Origin` header that allows the page's origin. Without it the browser throws the response away: the request happened, but your code cannot read the result. The rule is called **CORS**, Cross-Origin Resource Sharing.

Fastify sends no CORS header, so another origin could not read this API. `@fastify/cors` adds the headers.

```file:/src/app.js
```

`origin` lists the pages allowed to read a response, here a front end on Vite's default port: replace it with your address. `methods` lists the methods they may call. The CORS defaults cover `GET`, `HEAD` and `POST` only, so without `PATCH` and `DELETE` in the list the browser would block editing and deleting.

:::info
Before a request that can change data, the browser sends a **preflight**: an `OPTIONS` request asking what is allowed. `@fastify/cors` answers it. When the origin is not allowed, the answer carries no `Access-Control-Allow-Origin` and the browser stops there.
:::

## Helmet

`@fastify/helmet` adds headers that tell the browser to be strict. For an API, the useful ones are:

| Header                            | What it does                                                               |
| --------------------------------- | -------------------------------------------------------------------------- |
| `x-content-type-options: nosniff` | stops the browser guessing a response is a script                          |
| `strict-transport-security`       | makes the browser load the site over HTTPS later, even from an `http` link |
| `referrer-policy: no-referrer`    | stops your URLs leaking to other sites through the `Referer` header        |
| `cross-origin-opener-policy`      | cuts the link to a page that opened yours                                  |

Helmet runs as an `onRequest` hook, so every response carries them, errors included.

:::warn
This app relaxes three headers, because the preview panel shows it in an iframe on another origin: `contentSecurityPolicy` and `xFrameOptions` are off, and `crossOriginResourcePolicy` allows `cross-origin` instead of helmet's `same-origin`. In an app that serves HTML to your own domain, keep all three strict.
:::

:::tip
CORS is not authentication. It only tells browsers what they may read. `curl`, a script or another server can still call your API and ignore every CORS header.
:::

## Your turn

Neither plugin is registered any more: `src/app.js` has the TODO where they belong. Register `@fastify/cors` with `origin` set to `['http://localhost:5173']` and the methods `GET`, `POST`, `PATCH` and `DELETE`, then `@fastify/helmet` with the three relaxed options the warning above lists. Both imports are gone too, so add them back. Keep the registrations above the routes.

<details>
<summary>Show the solution</summary>

```solution:/src/app.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i -H 'Origin: http://localhost:5173' http://127.0.0.1:3000/api/tasks
curl -i -H 'Origin: http://example.com' http://127.0.0.1:3000/api/tasks
curl -i -X OPTIONS http://127.0.0.1:3000/api/tasks -H 'Origin: http://localhost:5173' -H 'Access-Control-Request-Method: PATCH'
```

The first response has `access-control-allow-origin: http://localhost:5173` and the helmet headers, `x-content-type-options: nosniff` among them. The second has the helmet headers but no `access-control-allow-origin`, so a browser there would discard it. The third is the preflight answer: `204` with `access-control-allow-methods: GET, POST, PATCH, DELETE`. Before your change the first response has neither kind of header, and the preflight is a `404`.
