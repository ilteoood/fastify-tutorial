---
type: lesson
title: Hiding secrets in logs
focus: '/src/app.js'
---

# Hiding secrets in logs

A log line is easy to copy: it lands in the **Output** panel, in a file, in a log collector, in a screenshot of a support ticket. Everything written there must be safe to read aloud.

## What a request line contains

By default Fastify logs the method, the url, the host, the client address and the port of a request. Headers are not there, so a token sent by a client is not logged either. While debugging, though, you want to see what clients send.

## Choose the fields with a serializer

```file:/src/app.js

```

A **serializer** is a function pino calls before writing an object: it receives the object and returns the fields to keep. Fastify has its own `req` serializer; yours replaces it, and it is also where `headers` gets into the line.

The name of the key selects the serializer: any field called `req` in a log object goes through it. That is how Fastify can log `{ req: request }` without knowing anything about your code.

The same options also take a `redact` list. The next sections explain why it is there.

## A token in the log

```bash
curl -i -H 'Authorization: Bearer secret-token' http://127.0.0.1:3000/api/tasks
```

Without redaction, the incoming request line would contain `"authorization":"Bearer secret-token"`. Whoever reads it can act as that user, and log files get copied, backed up and indexed like any other file.

## Redact the dangerous fields

The option is called `redact` and takes an array of paths. Each path is a string that walks into the object you log, one key at a time. For a parsed body, a password is hidden like this:

```js
redact: ['body.password'],
```

A path can also name a header, which is what this API needs for the two headers a client sends with a secret in them. Before a line is written, each value found at those paths is replaced by `[Redacted]`, so the header is still visible as a key: you can tell that a token was sent, but not which one. With both options in place, the line contains:

```text
"headers":{"host":"127.0.0.1:3000","user-agent":"curl/8.7.1","accept":"*/*","authorization":"[Redacted]"}
```

Redaction only covers what you log. A secret written by another call, under another path, is not hidden.

## Writing your own completion line

Fastify writes two lines per request: an incoming one and a completed one. To write a single line of your own instead, switch its request logging off:

```js
import Fastify, { LogController } from 'fastify';

const fastify = Fastify({
  logger: { level: 'info' },
  logController: new LogController({ disableRequestLogging: true }),
});

fastify.addHook('onResponse', async (request, reply) => {
  request.log.info({ statusCode: reply.statusCode, responseTimeMs: reply.elapsedTime }, 'request completed');
});
```

`onResponse` runs after the response has been sent, when `reply.elapsedTime` is known.

:::info
Older code puts `disableRequestLogging: true` at the top level. It is deprecated since Fastify 5.12 and will be removed in v6; `logController` replaces it.
:::

## Do not log request bodies

:::warn
Bodies carry passwords, tokens and personal data, and logs keep them for months. A body is also not available in the `req` serializer: the request logger exists before the body is parsed. If you need one field, log that field from a `preHandler` hook.
:::

## Your turn

`src/app.js` configures the logger with its level and nothing else. Add the two options the lesson just described: a `redact` list that hides the `authorization` and `cookie` request headers, and a `req` serializer that keeps `method`, `url`, `host`, `remoteAddress` and `headers`. Write the serializer first and send a request with a token: it appears in clear, because a serializer decides what is written and `redact` only edits what is already written. Then add `redact` and the same value turns into `[Redacted]`.

<details>
<summary>Show the solution</summary>

```solution:/src/app.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i -H 'Authorization: Bearer secret-token' http://127.0.0.1:3000/api/tasks
curl -i -H 'Cookie: session=abc123' http://127.0.0.1:3000/api/tasks
```

The first line in the **Output** panel shows `"authorization":"[Redacted]"`, the second shows `"cookie":"[Redacted]"`. Search the panel for `secret-token`: there is no match.

Before your two options, the incoming request line has no `headers` field at all: `secret-token` is nowhere, not because it is hidden but because nothing asked for it. The serializer alone brings it back in clear; `redact` is what turns it into `[Redacted]`.
