# Fastify Tutorial

An interactive, hands-on tutorial for [Fastify](https://fastify.dev) built with [TutorialKit](https://tutorialkit.dev).

The tutorial starts from zero: it assumes you know JavaScript but nothing about Node.js, HTTP servers, or Fastify. By the end you will have built a small, tested REST API and know where to go next.

## What you will learn

| Part                 | What it covers                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Getting started**  | What Fastify is, the Node.js bits you need, your first server, routes, requests, path parameters, plugins, decorators, hooks                                       |
| **Build a real API** | Validation, serialization, error handling, a Tasks API, tests with `node:test`, saving data to a file, content type parsers, CORS, security headers, rate limiting |
| **Going deeper**     | Encapsulation and `fastify-plugin`, logging and redaction, the request lifecycle, graceful shutdown                                                                |
| **Next steps**       | Configuring the server for production, where to go from here                                                                                                       |

Every lesson ships the complete set of files for that step, so you can read the code, change it in the in-browser editor, and run it in the terminal next to the lesson.

## Run it locally

```bash
pnpm run setup   # clone the TutorialKit fork this tutorial runs on
pnpm install
pnpm run dev
```

The site is served on <http://localhost:4321>. The tutorial runs entirely in your browser: the code runs in the [OpenVessel runtime](https://github.com/ilteoood/tutorialkit), so nothing is installed on your machine.

To produce a static build:

```bash
pnpm run build
pnpm run preview
```

## Deploy

The site is a static build, but the terminal needs the page to be cross-origin isolated: the runtime uses `SharedArrayBuffer`, which only exists in an isolated context. Every response therefore needs

```yaml
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

`astro dev` and `astro preview` already send them, but a static host has to be told. `vercel.json` does it for Vercel; on another host, add the same two headers (Cloudflare and Netlify read a `_headers` file).

## Repository structure

```bash
.
├── astro.config.ts          # TutorialKit is built on Astro
├── public                   # Logo and favicon
├── scripts                  # Clones and builds the TutorialKit fork
├── src
│   ├── content
│   │   └── tutorial         # The tutorial content
│   └── templates            # The project the reader starts from
├── vendor/tutorialkit       # The fork, cloned by "pnpm run setup" (not committed)
├── vercel.json              # Cross-origin isolation headers for the deployment
└── uno.config.ts            # UnoCSS config
```

## Where TutorialKit comes from

The lessons run on the [OpenVessel runtime](https://github.com/ilteoood/tutorialkit), a fork of TutorialKit that replaces the WebContainer with an open runtime. Its packages are not on npm, so `package.json` asks for them with `workspace:*` and `pnpm-workspace.yaml` includes the clone:

```yaml
packages:
  - '.'
  - 'vendor/tutorialkit/packages/astro'
  # ... the other packages the fork ships
```

`pnpm run setup` clones the fork at the pinned tag into `vendor/tutorialkit` (git-ignored), with a sparse checkout that keeps only the five packages above and skips its docs, `e2e` and extensions folders, and `pnpm run dev` / `pnpm run build` build those packages when their `dist` is missing. To follow the fork's `main` instead of the pinned tag, change `FORK_REF` in `scripts/setup-fork.mjs` and run `pnpm run setup` again.

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
├── 3-going-deeper
├── 4-next-steps
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
2. Run `pnpm run setup`, `pnpm install` and `pnpm run dev` to work on the tutorial.
3. Keep `pnpm run build` green: it validates the content against the TutorialKit schema.
4. Open a pull request describing what the lesson teaches and how you verified it.

## Credits

Built with [TutorialKit](https://tutorialkit.dev). The content follows the [Fastify documentation](https://fastify.dev/docs/latest/).
