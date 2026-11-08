---
type: lesson
title: Running in production
focus: '/src/server.js'
---

# Running in production

The server you have been building listens on `localhost`, which means only your own computer can reach it. Its settings are also hard-coded. Let us fix both.

This last part starts from a small server again, the `{ hello: 'world' }` one of the very first lessons, so that every step here fits in a single file. The tasks API you built in the previous parts is done; what follows is about the server itself.

## The code

```file:/src/server.js
```

## The three changes

The port comes from the environment. `process.env` holds the environment variables of the process. `??` means "use this if the left side is missing or `null`", so the port falls back to `3000`. The environment gives you strings and `listen` wants a number, so the value has to be converted before it is passed on.

The host is configurable in the same way, with `127.0.0.1` as its fallback. In production you want `0.0.0.0`, which listens on every network interface and not only on the loopback one.

The log level is configurable:

```js
const fastify = Fastify({
  logger: {
    level: process.env?.LOG_LEVEL ?? 'info',
  },
});
```

`fatal`, `error`, `warn`, `info`, `debug` and `trace` are the levels, from the quietest to the noisiest. `debug` is very useful while you develop.

## Your turn

`server.js` listens on `3000` and `127.0.0.1` whatever the environment says: the log level already reads `LOG_LEVEL`, but the port and the host are hard-coded. Read `PORT` and `HOST` from `process.env`, with `3000` and `127.0.0.1` as the fallbacks, convert the port to a number and pass both to `fastify.listen`. Then start the server with `PORT=4000` and read the line it prints.

<details>
<summary>Show the solution</summary>

```solution:/src/server.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Stop the server in the **Terminal** panel with `Ctrl` + `C`, then start it again on another port:

```bash
PORT=4000 npm start
```

The **Output** panel prints `Server listening at http://127.0.0.1:4000` instead of `http://127.0.0.1:3000`. Stop it and add the host:

```bash
HOST=0.0.0.0 PORT=4000 npm start
```

The server now listens on every network interface, and the **Output** panel prints one `Server listening at` line per interface instead of the single `127.0.0.1` one. Without the two environment reads the port is always `3000`, whatever `PORT` says, so `PORT=4000` changes nothing at all.

:::tip
This is the one place where the preview panel stops following you: it is set to port 3000, so with `PORT=4000` it has nothing to show. Start the server with `HOST=0.0.0.0 npm start` instead: the port stays 3000, and the preview keeps working.
:::

## What you still need for a real deployment

- A process manager. A server that crashes stays crashed. Use systemd, Docker, or a platform that restarts it for you.
- A real database. The `Map` in this tutorial forgets everything.
- Secrets in the environment. Never write a password in the code.
- A reverse proxy. Put nginx or Caddy in front of it to handle TLS.
- Health checks. A `GET /health` route that answers when everything is fine.

:::danger
Never bind to `0.0.0.0` on a machine that is directly exposed to the internet without a firewall and a reverse proxy in front of it.
:::
