---
tags: ["workflow", "ai", "tools"]
title: "My (Cheap) AI Workflows"
description: "A cheap daily workflow using Paseo and Opencode Go"
date: 2026-06-16
---

Back in January, I figured: if AI can do it faster, why not?

To skip the fluff, here's my setup.

## My Setup

- Opencode Go (using [oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim))
- [Paseo](https://paseo.sh/)

### Notable AI tools/extensions

- [rtk](https://github.com/rtk-ai/rtk)
- [fff-mcp](https://fff.dmtrkovalenko.dev/)
- [grill-me](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md)
- [handoff](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md)
- [caveman](https://github.com/JuliusBrussee/caveman)

### Cost

- Server (for `paseo` CLI so I'm not opening my laptop that often) ($6)
- Opencode Go ($10)

My smoking budget is dead because of this. I call that a win-win.

## Models that I use

All cheap. I can't even burn through my $10 sub each month. I use MiniMax M3 for the orchestrator, DeepSeek v4 Pro/Flash for everything else.

## How I use it?

First, I set up my GitHub and GitLab API tokens (read-only) — just to read issues assigned to me. With Paseo, I schedule that as a daily task.

```
paseo schedule create \
  --cron "0 0 0 0" \
  --timezone UTC \
  --run-now \
  --name gitlab-issues-summarizer \
  --provider opencode/deepseek-v4-pro \
  --cwd ~/dev/my-app \
  "Fetch Issues that asigned to me using skills /gitlab-issues-summarizer"
```

It ranks my issues for the day and I pick them off in order. One-line issues get a worktree; the heavier ones need real context.

I skim it on my phone — there's a complexity/priority breakdown, so I pick the easy one first. While the AI is grinding, I read the PRD for more complex task and figure out the business logic in my head: what it should look like, which existing functions I can reuse. So my prompts stay mostly technical.

I always review the diff. Paseo has a decent phone diff viewer, but on desktop I stick to Neovim.

That's the day-to-day. I use AI to search the codebase and ramp up on the platform and the business logic — because sometimes business requirements don't translate cleanly into code. How do you tell a PM that product search hits a denormalized table instead of joining row-by-row?

Paseo also has per-project config (lifecycle hooks, etc.) — handy for spinning up worktrees without lifting a finger.

That's the whole setup. The killer feature: it runs on my phone. So I can "work" from anywhere with a signal — bus stops, queues, the dentist's chair.

## Server Security

How I keep my AI from doing something dumb and irreversible:

- Run the AI as a non-root user, no sudo
- Block destructive shell commands (`rm -rf`, force pushes) at the hook level
- Never expose the server publicly — I'm using Tailscale

## I want to go cheaper

Next: move from OpenCode Go to OpenCode Zen or OpenRouter's pay-as-you-go pricing.

## Drawbacks

AI start fresh every sessions, so I got a skills to gather the context before it executes fix/feature
