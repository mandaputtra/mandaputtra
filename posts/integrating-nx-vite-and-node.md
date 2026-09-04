---
tags: ["javascript", "node"]
title: "Integrating Nx Vite for Node.js development"
description: "Integrating NX Vite for Node.js Development"
date: 2023-01-01
---

> Happy new year!

I use [NX](https://nx.dev/) at work, it has been good for me: turns out monorepo is a good idea after all. You can have all of your product code in one place, sharing everything together, which eases your CI/CD too. But having a big monorepo with lots of libraries and all of it using TypeScript slows the HMR update, test (most of the transforming part), even our boot time in development is slow.

There is a solution for this, a new bundler called [Vite](https://vitejs.dev/). Lately Nx also released version [15.3](https://dev.to/nx/nx-153-standalone-projects-vite-task-graph-and-more-49ic#new-task-graph-visualization) and it comes with new official package for [Vite](https://nx.dev/packages/vite): what a blessing! Time to integrate it with my workflow.

But Vite is known for its usage on the frontend, how do you integrate it for Node.js backend development? Turns out it was straightforward.

## Let’s get started

First, create a new Nx workspace:

```bash
# choose apps, for application/product development
$ npx create-nx-workspace
```

After that you can install all of the required packages:

```bash
$ npm i -D @nrwl/node @nrwl/vite vite-plugin-node
```
After all the packages are installed, we can generate our Node application and integrate Vite:

```bash
# generate our app entry point in apps folder
$ pnpm nx g @nrwl/node:application --unitTestRunner=none
# integrate vite
$ pnpm nx g @nrwl/vite:configuration --project=api
```

Since we use Vite, why not also use its test runner [Vitest](https://vitest.dev/)? So we pass `--unitTestRunner=none`.

After that delete the `index.html` file, we don’t need it, and start configuring your Vite project for Node.js development:

```json
// apps/<your-project-name>/project.json
    ... // to run test on apps using vitest
    "test": {
      "executor": "@nrwl/vite:test",
      "options": {
        "config": "vite.config.ts"
      }
    }
  }
```

```ts
// apps/<your-project-name>/vite.config.ts
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const API_PORT = process.env.API_PORT;

export default defineConfig({
  server: { port: +API_PORT || 9001, host: 'localhost' },
  plugins: [
    viteTsConfigPaths({ root: '../../' }),
    ...VitePluginNode({
      adapter: 'fastify',
      appPath: './src/main.ts',
    }),
  ],
  test: { environment: 'node', coverage: { provider: 'c8' } },
});
```

And that’s it, you can start developing backend apps with Vite! For libraries it’s almost the same:

```bash
# generate it with --unitTestRunner=none
$ pnpm nx g @nrwl/node:lib <lib-name> \
  --directory=<app-name> --unitTestRunner=none
# configure the test
$ pnpm nx generate vitest --project=<app-name>-<lib-name>
```

And tweak the test environment part on `vite.config.ts` in your libs folder to use `node`:
```ts
import { defineConfig } from 'vite';

import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      root: '../../../../',
    }),
  ],

  test: {
    globals: true,
    cache: {
      dir: '../../../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
```

## Wrapping up and next improvements

Of course you should move to Vite when you can. If the DX pain is unbearable why not?

There is room for improvement, since the Vite package is officially supported now I think it’s better to also integrate the unit test runner, so we can do `--unitTestRunner=vitest` and the bundler so we can do `--bundler=vite`. Might try to do a PR for this, but let’s explore the integration a bit more for now.
