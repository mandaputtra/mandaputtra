---
tags: ["workflow", "ai", "tools"]
title: "My (Cheap) AI Workflows"
description: "A cheap daily workflow using Paseo and Opencode Go"
date: 2026-06-16
---

Back in January, I figured: if AI can do it faster, why not?

> Update (September 2026): The $6 VPS below no longer runs this workflow. It now handles deployments only. Everything here runs locally via Tailscale. See [My agentic workflow in 2026](/posts/my-agentic-workflow-luvus-opencode-2026/) for the current stack.

To skip the fluff, here is my setup.

## My setup

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

## Models I use

All cheap. I cannot even burn through my $10 sub each month. I use MiniMax M3 for the orchestrator, DeepSeek v4 Pro/Flash for everything else.

## How I use it

First, I set up my GitHub and GitLab API tokens (read-only) to read issues assigned to me. With Paseo, I schedule that as a daily task.

```txt
paseo schedule create \
  --cron "0 0 0 0" \
  --timezone UTC \
  --run-now \
  --name gitlab-issues-summarizer \
  --provider opencode/deepseek-v4-pro \
  --cwd ~/dev/my-app \
  "Fetch Issues that assigned to me using skills /gitlab-issues-summarizer"
```

It ranks my issues for the day and I pick them off in order. One-line issues get a worktree; the heavier ones need real context.

I skim it on my phone: there is a complexity/priority breakdown, so I pick the easy one first. While the AI is grinding, I read the PRD for the more complex task and figure out the business logic in my head: what it should look like, which existing functions I can reuse. So my prompts stay mostly technical.

I always review the diff. Paseo has a decent phone diff viewer, but on desktop I stick to Neovim.

That is the day to day. I use AI to search the codebase and ramp up on the platform and the business logic, because sometimes business requirements do not translate cleanly into code. How do you tell a PM that product search hits a denormalized table instead of joining row by row?

Paseo also has per-project config (lifecycle hooks, etc.), handy for spinning up worktrees without lifting a finger.

That is the whole setup. The killer feature: it runs on my phone. So I can “work” from anywhere with a signal: bus stops, queues, the dentist chair.

## Server security

How I keep my AI from doing something dumb and irreversible:

- Run the AI as a non-root user, no sudo
- Block destructive shell commands (`rm -rf`, force pushes) at the hook level
- Never expose the server publicly: I use Tailscale

## Going cheaper

Next: move from OpenCode Go to OpenCode Zen or OpenRouter pay-as-you-go pricing.

## Drawbacks

AI starts fresh every session, so I use a skill to gather context before it executes a fix or feature.
