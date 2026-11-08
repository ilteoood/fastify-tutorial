---
type: lesson
title: Writing a content type parser
focus: '/src/app.js'
---

# Writing a content type parser

The tasks API speaks JSON only. Send a title as `text/plain` and it fails with `415 Unsupported Media Type`: the previous lesson removed the parser Fastify ships for `text/plain`, so Fastify stops before the route runs.

A **content type parser** bridges the two. It takes the raw body and returns the value that `request.body` should hold.

## The parser

```file:/src/app.js
```

```js
fastify.addContentTypeParser(
  'application/x-www-form-urlencoded',
  { parseAs: 'string' },
  (request, body, done) => {
    done(null, Object.fromEntries(new URLSearchParams(body)));
  },
);
```

The registration names a content type, takes options, and ends with the function that does the parsing. The example above is for a format this API does not use; ours reads a plain text body and answers with a task title.

| Argument  | What it is                                           |
| --------- | ---------------------------------------------------- |
| `request` | The request being parsed, for a parser that needs it |
| `body`    | The raw body, a string here because of `parseAs`     |
| `done`    | The callback that ends parsing                       |

`parseAs` is either `'string'` or `'buffer'`. Without it the body arrives as a `Buffer`, the Node.js object for raw bytes, and `body.trim()` would not exist. With `parseAs`, Fastify reads the stream for you, enforces `bodyLimit`, and only then calls the parser.

The new parser leaves the JSON one alone and puts `text/plain` back, this time as a parser of titles. `POST /api/tasks` itself does not change: the schema sees `{ title }` and accepts it.

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

Both tests live in the solution, because neither can pass while the parser is missing. The first one posts a title as `text/plain` and expects the task back:

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

The second one covers the error branch: spaces only, so there is no title, and the answer is `400`.

## Your turn

Register a parser for `text/plain` in `src/app.js`, where the TODO sits. Read the body as a string, trim it, and hand the route `{ title }`. When the trimmed body is empty there is no title to store: end the parse with an error carrying `statusCode: 400` and the message `title is required`. The JSON parser and the routes stay as they are.

<details>
<summary>Show the solution</summary>

```solution:/src/app.js
```

</details>

<details>
<summary>Show the solution</summary>

```solution:/test/tasks.test.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: text/plain' -d 'Buy milk'
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'Content-Type: text/plain' -d '   '
npm test
```

Before your change both calls are `415`. With the parser in place the first one creates a task from plain text, and the second is answered with `400`, because trimming the body leaves nothing to use as a title. The ten tests pass.
