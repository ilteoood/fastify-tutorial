---
type: lesson
title: Writing a content type parser
focus: '/src/app.js'
---

# Writing a content type parser

The tasks API speaks JSON only. Send a title as `text/plain` and it fails: Fastify's built-in parser leaves the body as a string, the body schema expects an object, and the answer is `400`.

A **content type parser** bridges the two. It takes the raw body and returns the value that `request.body` should hold.

## The parser

```file:/src/app.js
```

```js
fastify.addContentTypeParser(
  'text/plain',
  { parseAs: 'string' },
  (request, body, done) => {
    const title = body.trim();

    if (title === '') {
      const error = new Error('title is required');
      error.statusCode = 400;

      return done(error);
    }

    done(null, { title });
  },
);
```

| Argument  | What it is                                           |
| --------- | ---------------------------------------------------- |
| `request` | The request being parsed, for a parser that needs it |
| `body`    | The raw body, a string here because of `parseAs`     |
| `done`    | The callback that ends parsing                       |

`parseAs` is either `'string'` or `'buffer'`. Without it the body arrives as a `Buffer`, the Node.js object for raw bytes, and `body.trim()` would not exist. With `parseAs`, Fastify reads the stream for you, enforces `bodyLimit`, and only then calls the parser.

The new parser replaces the built-in `text/plain` one, because Fastify picks a parser by content type and ours is registered for the same type. `POST /api/tasks` itself does not change: the schema sees `{ title }` and accepts it.

## Reporting a bad body

`done(null, value)` means success: `value` becomes `request.body` and the handler runs. `done(error)` means failure: the handler is skipped and Fastify sends the error.

The status code is the one in `error.statusCode`. Ours sets `400`, so the client gets `400 Bad Request` and the message `title is required`. An error without `statusCode` is treated as a bug in your code and answers `500`.

## Two things to know

`fastify.hasContentTypeParser('text/plain')` answers `true` or `false`, which is useful before adding a parser something else may have added already.

Parsers are **encapsulated**: one added inside a plugin applies to that plugin and the plugins it registers, while one added at the root, as here, applies everywhere. The Encapsulation chapter explains why.

:::info
`addContentTypeParser` also accepts a `bodyLimit` option per parser. It defaults to the limit of the server.
:::

## The test

```js
test('POST /api/tasks accepts a title as text/plain', async (t) => {
  const fastify = await buildTestApp(t);

  const response = await fastify.inject({
    method: 'POST',
    url: '/api/tasks',
    headers: { 'content-type': 'text/plain' },
    payload: 'Buy milk',
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().task.title, 'Buy milk');
});
```

The test file also covers the error branch, an empty text body, which is answered with `400`.

## Try it

```bash
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: text/plain' -d 'Buy milk'
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: text/plain' -d '   '
npm test
```

The first call creates a task from plain text. The second is answered with `400`, because trimming the body leaves nothing to use as a title.
