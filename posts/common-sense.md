---
tags: ["errand", "opinion"]
title: "My Rules When Creating A Product"
description: "Think twice, the boring solution could lead to better one"
date: 2023-07-17
---

Had spent my 5 year IT career on some agencies, I develop a lot of software in different business. Customer service, finance, manufacture and many others. I realize that all the software that I build are not rocket science in many cases, it uses boring technology and boring infrastructure.

I tried new infrastructure so called Microservice, and I hate It. It's too complex for a 1 - 5 developer software. But if you have 6 developer should you use it? No, lol.

I tried so called new Design Pattern, and I hate it. It slows me down. Creating `.controller.js`, `.odt.js`, `.service.js` , apply the dependency injection, and start writing my code. Oh god, I realize I dont like it now.

I tried to accept all of the client request, because they have the domain knowledge, and I hate it. Because of flawled bussines flow, the one that not represent the truth. Sometimes, it got unnecessary step. Talk with your client, is it realy necessary? or you just want it to be there?

Turns out, there are also many fruitless decission that I made. Right now for me, I develop some rules whenever It comes to choosing new feature, building product, or bug fixing.

And I realize that these rules are just a common sense, a sense of human nature, that want everything to be lazy, fast to develop, and enough for current usage.

So what are the rules?

1. Use monorepo for the get go, it's simple for me since I wrote everything in JS and only use another programming language if needed. It's nice I can share my code, and CI/CD

2. Your product might only need 3 endpoint, it's always frontend, backend, and scheduler/job queue. So why creating microservice? Heck, even better when you got backend and frontend in the same code!

3. Use already made product, for me whenever possible I use auth provider, chat sdk, etc that already made for me. Saving me time, than by implementing it myself.

4. Every bug had its root cause, think twice. Find it's real source.

5. Do automation test yourself - write integration test. In my opinion good engineer always test their craft.

6. On UI/UX, a programmer should know what are the better approach. You don't need a designer for your not so complex product. A good programmer know better design.

7. Use boring programming language, when you got a problem the chance you find a solution is anywhere.

8. Performance matters when it matters. My rule is, client should interact less than 800ms everytime - unless it necessary.

9. When implementing requirements please be aware of it's constrains.

10. Save your time by writing procedural code, split the file pr function when it's needed.

That's it.