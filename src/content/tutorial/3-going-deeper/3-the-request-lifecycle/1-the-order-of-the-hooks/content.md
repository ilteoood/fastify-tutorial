---
type: lesson
title: The order of the hooks
focus: '/src/hooks.js'
---

# The order of the hooks

A request does not go straight from the socket to your handler. Fastify walks it through a fixed list of stages, and every stage has a hook. Knowing the order tells you where to put authentication, where to clean up a body, and what still runs after an error.

| Hook | When it runs |
|---|---|
| `onRequest` | The request arrived; nothing has been read yet |
| `preParsing` | The body stream exists, it has not been parsed |
| `preValidation` | The body is parsed, the schema has not run |
| `preHandler` | Validation passed, the handler is next |
| `preSerialization` | The handler returned a value, it is not JSON yet |
| `onSend` | The payload is serialized, the bytes have not left |
| `onResponse` | The response is sent, you cannot change it |
| `onError` | Something failed: a throw, or schema validation |
| `onTimeout` | The socket timed out |
| `onRequestAbort` | The client closed the connection first |

`onTimeout` and `onRequestAbort` only run when something goes wrong, so you will not see them below.

## The code

```file:/src/hooks.js
```

```file:/src/app.js
```

`registerLifecycleHooks` is called on the root instance, before the routes are registered, so every route of the app goes through it.

## Reading the order

Each hook logs its own name, and `onError` adds the message of the error. `onSend` may change the payload, but a hook that only logs can return nothing: the payload it received is sent as it is.

## Where to put your work

- **Authentication** goes in `onRequest` or `preHandler`. `onRequest` is the cheapest place to say no, because the body has not been read yet. `preHandler` is the place when the check needs validated `params` or `body`.
- **Body-dependent work** goes in `preValidation`. The body is parsed and still untouched, so this is where you trim a title before the schema checks its `minLength`.
- **Returning from a hook** short-circuits the chain: `return reply.code(401).send(...)` in `onRequest` skips the other hooks and the handler. Only the sending steps still run: `preSerialization` for a payload that is not a string, then `onSend` and `onResponse`.

:::tip
Hooks are encapsulated too: a hook added inside a plugin applies only to the routes of that plugin. `registerLifecycleHooks(fastify)` runs on the root instance, so this one sees everything.
:::

## Your turn

`src/hooks.js` shows two hooks, the first and the last of a request that succeeds. Write the six that run in between: `preParsing`, `preValidation`, `preHandler`, `preSerialization`, `onSend` and `onError`, each logging its own name at `info` on the request logger. `onError` receives the error as a third argument: log its message with the name, the way the lesson describes. Add them in the order of the table, and the log lines you get are the evidence that the order is right.

<details>
<summary>Show the solution</summary>

```solution:/src/hooks.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
curl -i http://127.0.0.1:3000/api/tasks
```

In the **Output** panel, one request produces these lines, in this order:

```text
onRequest, preParsing, preValidation, preHandler, preSerialization, onSend, onResponse
```

Now make validation fail:

```bash
curl -i -X POST http://127.0.0.1:3000/api/tasks -H 'content-type: application/json' -d '{}'
```

The answer is `400`, and the log jumps from `preValidation` to `onError`: a failed validation never reaches `preHandler`. The error message is then the payload that `onSend` sends.

With only the two hooks of the exercise, a successful request logs `onRequest` then `onResponse`, and nothing in between: the six lines you are missing are exactly the stages the request passes through.
