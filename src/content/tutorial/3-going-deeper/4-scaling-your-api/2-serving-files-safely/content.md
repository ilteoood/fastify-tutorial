---
type: lesson
title: Serving files safely
focus: '/src/app.js'
---

# Serving files safely

An API often has to hand out a file: a report, an export, a static page. Doing it by hand means building a path out of what the client sent, and that is how a server ends up serving files it should not. The plugin `@fastify/static` serves a folder and keeps every request inside it.

## The code

```file:/src/app.js
```

## One folder, one plugin

The import at the top of `src/app.js` is already there and nothing uses it yet: the `// TODO:` is where it belongs. `@fastify/static` is registered with a `root`: the one folder it is allowed to serve. Our folder is `public`, next to `src`. The folder lives one level above `src`, so the path of the folder is built with `..` in it.

By default the plugin adds a wildcard route, so every file of the folder is served at its own path. The file `public/hello.txt` is answered at `/hello.txt`.

`reply.sendFile(name)` sends one named file of the folder. It refuses to leave the folder, and it answers `403 Forbidden` when the name tries to escape it, so a name like `..%2fpackage.json` never reaches the `package.json` of the app. The check happens for you.

The opposite trap is building the path yourself with `path.join(publicFolder, request.params.name)` and sending it with `reply.send`. That is how servers leak files, because the name is joined onto the folder without being checked. Never do that.

The plugin only serves what it finds in the folder, so the folder has to exist with the files in it. Our app ships `public/hello.txt`, so the lesson has something to serve.

The package is called `@fastify/static`, and this lesson adds it to the `package.json` of the app.

## Your turn

Serve the `public` folder with `@fastify/static`, and add a route that answers with the file the client asks for. The route path should be `/files/:name`, so a request for `/files/hello.txt` answers with the file `hello.txt` of the folder.

<details>
<summary>Show the solution</summary>

```solution:/src/app.js
```

</details>

Press the **Solve** button in the editor toolbar to apply it to your files.

## Try it

```bash
curl -i http://127.0.0.1:3000/files/hello.txt
curl -i --path-as-is 'http://127.0.0.1:3000/files/..%2fpackage.json'
curl -i http://127.0.0.1:3000/api/tasks
```

Before your change there is no file route, so the first request answers `404`:

```text
$ curl -i http://127.0.0.1:3000/files/hello.txt
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8

{"message":"Route GET:/files/hello.txt not found","error":"Not Found","statusCode":404}
```

After your change the file is served, the name that tries to leave the folder is refused, and the task routes answer exactly as before:

```text
$ curl -i http://127.0.0.1:3000/files/hello.txt
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8

hello from the public folder

$ curl -i --path-as-is 'http://127.0.0.1:3000/files/..%2fpackage.json'
HTTP/1.1 403 Forbidden
content-type: application/json; charset=utf-8

{"statusCode":403,"error":"Forbidden","message":"Forbidden"}

$ curl -i http://127.0.0.1:3000/api/tasks
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8

{"tasks":[]}
```

The first request answers `200` with the content of the file. The second one answers `403 Forbidden`, because the name tries to leave the folder, and the `package.json` of the app stays private. The third one shows that the task routes still answer exactly as before.

The test suite follows the task routes, so `npm test` passes all 7 tests in both states.
