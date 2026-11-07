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

A **serializer** is a function pino calls before writing an object: it receives the object and returns the fields to keep. Fastify has its own `req` serializer; the one above replaces it and adds `headers`.

The name of the key selects the serializer: any field called `req` in a log object goes through it. That is how Fastify can log `{ req: request }` without knowing anything about your code.

The same options also contain a `redact` list. The next sections explain why it is there.

## A token in the log

```bash
curl -i -H 'Authorization: Bearer secret-token' http://127.0.0.1:3000/api/tasks
```

Without redaction, the incoming request line would contain `"authorization":"Bearer secret-token"`. Whoever reads it can act as that user, and log files get copied, backed up and indexed like any other file.

## Redact the dangerous fields

```js
redact: ['req.headers.authorization', 'req.headers.cookie'],
```

`redact` takes paths inside the object you log. Before a line is written, each value found at those paths is replaced by `[Redacted]`, so the header is still visible as a key: you can tell that a token was sent, but not which one. With the file as it is, the line contains:

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

## Try it

```bash
curl -i -H 'Authorization: Bearer secret-token' http://127.0.0.1:3000/api/tasks
curl -i -H 'Cookie: session=abc123' http://127.0.0.1:3000/api/tasks
```

The first line in the **Output** panel shows `"authorization":"[Redacted]"`, the second shows `"cookie":"[Redacted]"`. Search the panel for `secret-token`: there is no match.
