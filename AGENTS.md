# AGENTS.md — mandaputtra.github.io

Personal blog built with [Eleventy](https://www.11ty.dev/) (11ty) static site generator.

## Quick Commands

```bash
# Dev server with hot reload (Eleventy + Sass watcher)
npm start

# Production build
npm run build

# Debug build
npm run debug
```

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `_site/` | Build output (gitignored, deployed to Netlify) |
| `_includes/layouts/` | Nunjucks templates (`*.njk`) |
| `_sass/` | SCSS source → compiled to `css/` |
| `_11ty/` | Custom Eleventy filters/collections (Node.js) |
| `_data/` | Global data files (metadata.json, processEnv.js) |
| `posts/` | Blog posts in Markdown with YAML frontmatter |
| `css/`, `img/`, `js/`, `fonts/` | Static assets (passthrough copied) |

## Key Tech Stack

- **Node 20.x** (see `.nvmrc`)
- **Eleventy 1.0.1** with plugins: RSS, syntax highlighting
- **Gulp + Sass** for SCSS compilation
- **Nunjucks** primary templating (also supports Liquid, Markdown)
- **pnpm** for package management

## Build Quirks

- **SCSS compilation**: `gulp build-sass` compiles `_sass/**/*.scss` → `css/` (compressed)
- **Concurrent dev**: `npm start` runs Eleventy serve + Sass watcher together
- **Production-only RSS**: RSS plugin only loads when `NODE_ENV=production`
- **Ignored templates**: `sitemap.xml.njk` and `feed/feed.njk` are explicitly ignored in `.eleventy.js`
- **Passthrough copies**: `img/`, `fonts/`, `css/`, `js/`, `CNAME` copied as-is

## Creating Content

**New blog post**: Add `.md` file to `posts/` with frontmatter:
```yaml
---
title: Post Title
date: 2024-01-15
tags:
  - tag-name
---
```

All posts auto-use `layouts/post.njk` via `posts/posts.11tydata.json`.

**New SCSS**: Add to `_sass/`, imported via `main.scss`. Gulp watcher auto-compiles on dev.

## Deployment

- **Platform**: Netlify (see `netlify.toml`)
- **Build command**: `DEBUG=* eleventy`
- **Publish directory**: `_site/`
- **Note**: Netlify build command only runs Eleventy (Sass must be pre-built or handled separately)

## Conventions

- **Dates**: Use ISO format in frontmatter; `readableDate` filter formats for display
- **Tags**: Filtered list excludes: `all`, `nav`, `post`, `posts` (see `_11ty/getTagList.js`)
- **Markdown**: `markdown-it` with `markdown-it-anchor` for header permalinks
- **Syntax highlighting**: Uses `@11ty/eleventy-plugin-syntaxhighlight`
