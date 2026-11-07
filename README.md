# Fastify Tutorial

An interactive, hands-on tutorial for [Fastify](https://fastify.dev) built with [TutorialKit](https://tutorialkit.dev).

The tutorial starts from zero: it assumes you know JavaScript but nothing about Node.js, HTTP servers, or Fastify. By the end you will have built a small, tested REST API and know where to go next.

## What you will learn

| Part                                       | What it covers                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Getting started**                        | What Fastify is, the Node.js bits you need, your first server, routes, requests, path parameters, plugins, decorators, hooks |
| **Build a real API**                       | JSON schema validation, response serialization, error handling, a Tasks API, testing with `node:test` |
| **Next steps**                             | Configuring the server for production, where to go from here                        |

Every lesson ships the complete set of files for that step, so you can read the code, change it in the in-browser editor, and run it in the terminal next to the lesson.

## Run it locally

```bash
pnpm install
pnpm run dev
```

The site is served on <http://localhost:4321>. The tutorial runs entirely in your browser: the code runs in a WebContainer, so nothing is installed on your machine.

To produce a static build:

```bash
pnpm run build
pnpm run preview
```

## Repository structure

```bash
.
├── astro.config.ts          # TutorialKit is built on Astro
├── public                   # Logo and favicon
├── src
│   ├── content
│   │   └── tutorial         # The tutorial content
│   └── templates            # The project the reader starts from
└── uno.config.ts            # UnoCSS config
```

The content follows the TutorialKit structure of parts, chapters, and lessons:

```bash
src/content/tutorial
├── 1-getting-started           # Part
│   ├── 1-hello-fastify         # Chapter
│   │   ├── 1-what-is-fastify   # Lesson
│   │   │   ├── content.md      # The prose of the lesson
│   │   │   └── _files          # The files the reader sees in this lesson
│   │   └── ...
│   └── meta.md                 # Metadata for the chapter
├── 2-build-an-api
└── meta.md                     # Metadata for the tutorial
```

Every lesson has its own `_files` directory with the **complete** application for that step. TutorialKit replaces the workspace with these files when the lesson opens, so a lesson is always self-contained.

### Embedding a file in the prose

Use the `file:` code fence to show a file that also exists in the lesson's `_files` directory:

````markdown
```file:/src/server.js
```
````

The fence is replaced with the real content of the file.

## Content guidelines

- Keep the prose for someone who has never used Node.js: explain the vocabulary the first time it appears.
- Show the code before explaining it, and keep every snippet short enough to read at a glance.
- Every lesson ends with something the reader can try in the terminal.
- Prefer the Fastify documentation over inventing an API: <https://fastify.dev/docs/latest/>.

## Contributing

1. Fork the repository and create a branch.
2. Run `pnpm install` and `pnpm run dev` to work on the tutorial.
3. Keep `pnpm run build` green: it validates the content against the TutorialKit schema.
4. Open a pull request describing what the lesson teaches and how you verified it.

## Credits

Built with [TutorialKit](https://tutorialkit.dev). The content follows the [Fastify documentation](https://fastify.dev/docs/latest/).
