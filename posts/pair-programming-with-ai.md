---
tags: ["ai", "opini"]
title: "How I Feels Pair Programming With AI"
description: "The hell, I've never experience this much speed!"
date: 2025-02-13
en:
---

I do believe that AI is for the better of humanity, back then when ChatGPT first released I don't feel any threat. But still I'm not using it since most of the time the code it generated doesn't fit my taste at all. And sometimes they use obsolete not working methods. But that problem aside, the big problem for me is that, there is no good Neovim integrations.

But AI Code companion is still a handy feature, I can make it generate code for boring task like translating xml to Type Script type system, creating a table for me, etc.

After Open AI announce that their newest AI version ChatGPT 4o is free for VSCode users, I decided to revisit again and, ooooh boy! Still not a threat but they way it codes it almost mimic me, and 80% of the time they suggest correct answer (but not a good code lol ~).

I wont get into details, as far as I know if you were using it, you should already know the flaws. For some new programming language that trending like Rust, it still doesn't seem to suggest the better answer. But for popular programming language like PHP, Python, JavaScript sure it improve a lot.

Now I suddenly experience faster development speed. And this time, I also try other tools like ollama to set-up local AI runner. I search for Neovim integrations, I found [codecompanion](https://codecompanion.olimorris.dev/). I works really great!. The AI supports me and not interfering when I code. I use `qwen2.5-coder:14b` with [Ollama](https://ollama.com/library?sort=popular).

Now! I recommend you to try too. Here is some thing that I recommend you to try :

1. Instead of writing your test, especially the one that requires some mock set-up try to use AI instead. It will save you a lot of time. AI will give you some test code and some expectation. I feel like AI is better at writing test, or it just me lazy writing test because it requires some database set-up haha.

2. Use it to learn new tools, now that AI its better at reading code type, I think it resulted in better understanding on how the library that you are using works! I use it a lot to learn some language like Swift, PHP, Python, and Rust (Although for rust seems like it suggesting the wrong way but that's okay)

3. Use is for mundane task, sometimes we programmers (or just me) hate very repetitive task like converting some JSON to a language types, using AI for this is spot on. It almost 99% correct. Or you can also use it to refactor you `else if` statement that are too long to begin with.

.... and many more!

That being said, it is not a threat at all for me. I'm not using AI Editor like [Trae](https://www.trae.ai/) yet. But I think it's the same! Now I'm happy to announce that I'm pair programming with AI and shipping 50% faster (because I don't need to create test factories lol).

I hope you, started to using it too ~ please don't just take it for granted, always read and try to refactor the code generated from AI. To not being replaced is to have more context than the AI itself. Since we are a Human, we know a lot of stuff and understand stuff very - very much than any AI these days.
