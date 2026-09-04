---
tags: ["errand", "opinion"]
title: "My Rules When Creating A Product"
description: "Think twice, the boring solution could lead to a better one"
date: 2023-07-17
---

Five years in agencies taught me one thing: the software that lasts is not rocket science. It runs on boring technology and boring infrastructure. Once I saw that, a few opinions hardened.

### What I tried and dropped

I tried microservices for a team of one to five. It added complexity without payoff, and I hated it. Even with six developers, I would still skip it.

I tried strict design patterns with `.controller.js`, `.dto.js`, `.service.js` and dependency injection before writing a single line of business logic. It slowed me down, and I dropped it.

I tried accepting every client request at face value because clients own domain knowledge. Flawed flows slipped in: steps that misrepresent reality or add no value. Now I ask, is this step necessary, or do you want it there because it feels safer?

### The rules I keep

These are not frameworks. They are common sense for shipping with a small team that wants to move fast and stay lazy in the right way.

1. Start with a monorepo. I write in JavaScript and add another language only when required. Shared code and a single CI/CD pipeline compound.
2. You likely need three endpoints: frontend, backend, and scheduler or job queue. No microservices. Better yet, keep frontend and backend in one codebase when you can.
3. Use what exists. Auth providers, chat SDKs, and other ready-made products save time I would spend rebuilding them.
4. Every bug has a root cause. Find the real source before you patch the symptom.
5. Test your own work. I write integration tests. Good engineers verify their craft.
6. On UI and UX, a programmer should know a solid approach. For most products that are not design-heavy, a good programmer makes good design calls without a dedicated designer.
7. Use boring programming languages. When problems arise, answers are everywhere.
8. Performance matters when it matters. My line: keep client interactions under 800ms unless the work genuinely requires more.
9. Respect constraints when you implement requirements. Name them before you code.
10. Write procedural code first. Split files or functions when they earn it.

That is the set. Boring, opinionated, and enough for what I build now.