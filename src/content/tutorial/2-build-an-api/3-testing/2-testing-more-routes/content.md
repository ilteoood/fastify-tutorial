---
type: lesson
title: Testing more routes
focus: '/test/tasks.test.js'
---

# Testing more routes

Now that the pattern works, let us cover the rest of the API. The first thing to fix is how the app is created.

## One app per test

In the previous lesson the app was created once for the whole file, so a task created by one test was still there in the next one. That makes the tests depend on their order, and a test that depends on the order breaks for no reason.

The fix is to build a fresh app for every test and close it when the test ends:

```js
async function buildTestApp(t) {
  const fastify = await buildApp();
  await fastify.ready();

  t.after(() => fastify.close());

  return fastify;
}
```

`t` is the test context that Node.js gives to every test. `t.after` registers a cleanup that runs when the test is over, whether it passed or failed.

## The test file

```file:/test/tasks.test.js
```

## Your turn

Five tests are in place: the index page, creating a task, a rejected body, the list and the `404`. Add the two that are missing: one that creates a task and then `PATCH`es `{ done: true }` onto it and checks the answer, and one that creates a task and `DELETE`s it, checking the status code. Use `buildTestApp(t)` in both, so each test starts from an empty store.

<details>
<summary>Show the solution</summary>

```solution:/test/tasks.test.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

Run these commands in the **Terminal** panel of this tutorial, the one next to the **Output** panel that runs the server.

```bash
npm test
```

Five tests pass now, and seven once you have written the last two.

## What to test

A useful rule: test what the client can see.

- The status code.
- The body, or the fields of the body you care about.
- The errors: `400` for invalid input, `404` for something that does not exist.

:::tip
`assert.equal` from `node:assert/strict` is a strict comparison: `assert.equal(1, '1')` fails, which is exactly what you want.
:::
