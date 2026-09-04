---
tags: ["ai", "opini"]
title: "How I Feel Pair Programming with AI"
description: "I’ve never experienced this much speed!"
date: 2025-02-13
en:
---

I believed AI was good for humanity, but when ChatGPT first launched I did not feel threatened. The code it generated rarely matched my taste, it often suggested obsolete methods that did not run, and I could not find a Neovim integration I liked.

So I skipped it for real work. I kept an AI code companion around for boring tasks like translating XML to TypeScript types or scaffolding a table, where it did a decent job and stayed out of my way.

## Why I avoided AI code companions at first

My taste matters when I read code later, and early ChatGPT rarely matched it. It also suggested APIs that no longer worked, so I spent time correcting the output instead of writing.

The bigger blocker was editor integration. I live in Neovim, and back then I could not find a companion that supported me without interfering while I typed.

## What changed with ChatGPT-4o and a local runner

After OpenAI made ChatGPT-4o available to VS Code users, I gave it another try and noticed a shift. The suggestions followed my style much more closely, and for popular languages like PHP, Python, and JavaScript they land correctly about 80% of the time. For newer or niche languages like Rust, I still see weaker suggestions and I double-check them.

That nudge pushed me to set up a local runner. I use [Ollama](https://ollama.com/library?sort=popular) with `qwen2.5-coder:14b`, and for Neovim I use [codecompanion](https://codecompanion.olimorris.dev/). The local setup responds quickly, it does not interrupt my flow, and I keep control over what gets sent out. This is the part that finally made pairing feel natural to me.

## How I use AI now without letting it drive

I let AI handle the parts where it saves me time and I keep the decisions. Here is how I use it most:

1. **Generate tests that need mock setup.** I ask AI to draft the test and the expectations when the test needs database or mock wiring. I review the assertions, I adjust the boundaries, and I keep responsibility for what the test proves. I admit I was slow to write these tests because the setup felt tedious, and AI removes that drag.

2. **Learn a new library or language with your own code as context.** I paste the code I am reading and ask how the library actually behaves. I have done this with Swift, PHP, Python, and Rust. The explanation is helpful, though with Rust I still verify the suggestion against docs before I trust it.

3. **Handle repetitive transforms and small refactors.** I use it to convert JSON to TypeScript types or to collapse a long `else if` chain. It gets the repetitive mapping right in most cases, and I do a final pass to name things the way I want them.

I do not use an AI editor like [Trae](https://www.trae.ai/) yet, but the pattern feels similar. With this approach I ship about 50% faster because I no longer hand-write every test factory, so I spend that time on the actual feature.

## The check that keeps me ahead of the model

AI does not replace context. I read every generated block, I refactor it, and I keep the domain knowledge that the model lacks. If you try this, treat the output as a draft from a pair partner who types fast but does not know your system.

Try one of the three uses above on a small task this week, keep what reads like you wrote it, and send the rest back for revision. That habit has kept me productive without handing over judgment.
