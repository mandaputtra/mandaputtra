---
tags: ["javascript", "node"]
title: "Integrating Nx Vite for Node.js development"
description: "Integrating NX Vite for Node.js Development"
date: 2023-01-01
---

> Happy new year!

I use [NX](https://nx.dev/) at work, it has been good for me - turns out monorepo is a good idea after all. You can have all of your product code in one place, sharing everything together, eases your CI/CD too. But, having a big monorepo with lots of libraries and all of it using TypeScript slows the HMR update, test (most of the transforming part), even our boot time on development is slow.

There are a solution for this, a new bundler called [Vite](https://vitejs.dev/). Lately Nx also released version [15.3](https://dev.to/nx/nx-153-standalone-projects-vite-task-graph-and-more-49ic#new-task-graph-visualization) and it comes with new official package for [Vite](https://nx.dev/packages/vite) what a bless! Time to integrate it with my workflow.

But Vite are known for it's usage on the frontend, how do you integrate it for Node.js backend development? Turns out it was easy.

## Lest start

First of all create new Nx workspace :

```bash
# choose apps, for application/product development
$ npx create-nx-workspace
```

After that you can install all of this required package :

```bash
$ npm i -D @nrwl/node @nrwl/vite vite-plugin-node
```

After all the package installed, we can start to generate our application node application and integrate Nx

```bash
# generate our app entry point in apps folder
$ pnpm nx g @nrwl/node:application --unitTestRunner=none
# integrate vite
$ pnpm nx g @nrwl/vite:configuration --project=api    
```

Since we use Vite, why not also using it's test runner [Vitest](https://vitest.dev/)? So we pass `--unitTestRunner=none`.

After that delete the `index.html` file, we dont need it and start configuring your Vite project for Node.js development :

```json
// apps/<your-project-name>/project.json
....
"targets": {
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
// apps/<your-projectname>vite.config.ts
// Referencing our vitest type
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

import viteTsConfigPaths from 'vite-tsconfig-paths';

// We still read using process.env here, but on main.ts, we use import.meta.env
const API_PORT = process.env.API_PORT;

export default defineConfig({
  server: {
    port: +API_PORT || 9001,
    host: 'localhost',
  },
  plugins: [
    viteTsConfigPaths({
      root: '../../',
    }),
    // Configure vite for backend development
    ...VitePluginNode({
      adapter: 'fastify', // I use fastify, you can see what options are available on vite-plugin-node docs
      appPath: './src/main.ts', // our entry point
    }),
  ],
  // to configure our test
  test: {
    environment: 'node',
    coverage: {
      provider: 'c8'
    }
  }
});
```

And baaam, you can start developing backend apps with Vite! For libraries it's almost the same :

```bash
# generate it with --unitTestRunner=none
$ pnpm nx g @nrwl/node:lib <lib-name> --directory=<app-name> --unitTestRunner=none
# configure the test
$ pnpm nx generate vitest --project=<app-name>-<lib-name>
```

And tweak the test environment part on `vite.config.ts` on your libs folder to using `node` :

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

## Conclusion & Some improvement

Of course you should move to Vite when you can, lol. If the DX pain are unbearable why not?

There are rooms for improvement, since the Vite package are officially supported now I think its better to also integrate the unit test runner, so we can just do `--unitTestRunner=vitest` and the bundler so we can just do `--bundler=vite`. Might try to do a PR for this, but lest just explore the integration a bit more for now.

