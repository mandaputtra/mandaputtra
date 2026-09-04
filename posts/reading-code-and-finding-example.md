---
tags: ["programming", "errand"]
title: "Reading Code, Error, and Find Example"
description: "How being ignorant slows you down"
date: 2022-05-04
---

Sometimes I mentor friends in programming, and I always say that understanding the code you wrote is an important asset.

It has been 5 years since I started coding professionally, and the most important skill I learned is reading code, making sense of errors, and finding examples.

When you join a bootcamp or learn through online tutorials, the first thing you want is to complete the task, to make it work. After it works, the most important part is figuring out why it works.

Most coding bootcamps label someone who can create a React website as understanding JavaScript well enough, but that is not correct. Creating something is a great achievement, but understanding it step by step is greater.

## Reading code

If you learn modern programming, you will see third-party open source libraries and use them. You get them through a package manager (`npm`, `pip`, `composer`, and others).

Those libraries are **other people’s code**, repeat with me: other people’s code!

That means most of the time you can read their implementation. The code is often placed online on platforms like GitHub or GitLab. Search for “your-library source code”.

Let’s say you are curious about how [dayjs](https://github.com/iamkun/dayjs/) does [subtraction](https://day.js.org/docs/en/manipulate/subtract#docsNav) on a date:

![online code editor, searching for subtract function](/img/reading-code.jpg)

Open your editor and you will see the implementation:

```js
add(number, units) {
  number = Number(number)
  const unit = Utils.p(units)
  const instanceFactorySet = (n) => {
    const d = dayjs(this)
    return Utils.w(
      d.date(d.date() + Math.round(n * number)), this)
  }
  if (unit === C.M) {
    return this.set(C.M, this.$M + number)
  }
  // ... handles C.Y, C.D, C.W, step logic
  const step = {
    [C.MIN]: C.MILLISECONDS_A_MINUTE,
    [C.H]: C.MILLISECONDS_A_HOUR,
    [C.S]: C.MILLISECONDS_A_SECOND
  }[unit] || 1
  const nextTimeStamp = this.$d.getTime() + (number * step)
  return Utils.w(nextTimeStamp, this)
}

subtract(number, string) {
  return this.add(number * -1, string)
}
```

From here you can figure out how `subtract` works: it calls `add` with a negative value. Look up the `add` function and you will see it depends on many things. Break it down one by one, and after that you can explain how the functions you use work.

What do you get from reading the source? You learn how something is made and how you can improve it. Be curious, put time in your calendar to read other people’s code. Some people are smarter than you because they know how it works.

You will also see tricks your libraries use, like how your ORM does database pooling, how your library optimizes function call cost, and more. You will find interesting details.

But what if you cannot understand it at all? Take your time, ask around on their GitHub issues or community, ask for direction, or learn your language fundamentals more. Do not stay ignorant: if something bad happens in code you use, at least you can help fix it.

> How could you make something reliable if you don’t know how it works?, Rich Hickey

## Making sense of errors

Errors are a must when you learn. I see many people run `npx create-react-app` because they do not know what is wrong, ditch the tutorial, and try something else. How could you improve if you do this over and over? Learning to code is not instant.

![example of react error on useeffect](https://i.stack.imgur.com/YFRR5.png)

Read the error carefully, search for a guide on how to solve it, and figure out why it happened.

Errors are a blessing. HTML/CSS developers do not get error messages at all! They must figure out how `flex` and `box-sizing` work to fix “why is this not centered” questions. That is why some people translate designs better than you: they make mistakes and learn again and again.

You are often too ready to ignore error messages and copy paste them to Google. Sometimes you find an answer, sometimes not. I see this often with people new to the UNIX ecosystem. CLI tools always have `--help` or `man` sections: read them.

```bash
$ your-cli-tools --help
```

Your error message does not always show up on StackOverflow. Other people use different variable names. If you see `undefined`, it means one thing: you have not declared it yet.

I remember the old days when I learned programming through [Vuejs.id](https://vuejs.id) community. Whenever I asked, they taught me how to find the core problem, not show me how it should be done.

Even when I wrote this article I encountered a strange error message:

```txt
Tried to use templateContent too early
  (./posts/reading-code-and-finding-example.md)
  (via TemplateContentPrematureUseError)
[11ty] Original error stack trace:
  TemplateContentPrematureUseError:
    Tried to use templateContent too early
  at Object.get templateContent
    [as templateContent]
    (/.../eleventy/src/Template.js:708:23)
  at Object.memberLookup
    (/.../nunjucks/src/runtime.js:251:17)
```

Read it carefully, do not ignore the details. It says `TemplateContentPrematureUseError` and “Tried to use templateContent too early” and the error happened on:

```bash
@11ty/eleventy/src/Template.js:708:23
```

So your Google query should be: “11ty TemplateContentPrematureUseError”, because the error happened in `@11ty/eleventy` and the type is `TemplateContentPrematureUseError`. You can add “Tried to use templateContent” for a more verbose query.

Take your time, give it 5 minutes. Understand why it happened. If you must, open `node_modules` and start hacking there (but if your lib uses TypeScript you need to recompile).

![and image quoted, the first generation of TTL was done by the old gray beard guys that know what they are doing, the new generation was done by kids who are straight out of school who didn't know to ask what the change in packaging would do to inductive spikes](/img/chips-ttl-problem.jpg)

> This is why technology degrades. It takes a lot of energy to communicate from generation to generation, there are losses, Jonathan Blow

## Finding examples

Admit it, most of the time you are a _layering brick type of programmer_. Other people’s code already does heavy lifting to make your code run. Like when you want a 3D box, you can write:

```js
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial(
  { color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;
```

And bam, you got a 3D cube. Finding examples is challenging and fun. It follows the same concept as reading code, but where do you find them?

There are many places I look to find code examples:

1. **Documentation:** your library’s official docs
2. **Test folder:** `test` or `example` folders in the repo
3. **Source comments:** comments on top of functions
4. **Web search:** searching on the internet

Your library documentation is sometimes good enough to find an example, but for advanced use you must learn the details! There are no shortcuts. Read the docs carefully to find the true meaning of calling an API.

Most libraries have a `test` folder that contains code to test the library. Learn to read the tests: they often describe scenarios for how to use the library. Here is a clip from dayjs source code:

```js
it('Format invalid date', () => {
  expect(dayjs('').format())
    .toBe(new Date('').toString())
  expect(dayjs('otherString').format())
    .toBe(new Date('otherString').toString())
})

it('Format Month M MM MMM MMMM', () => {
  expect(dayjs().format('M'))
    .toBe(moment().format('M'))
  expect(dayjs().format('MM'))
    .toBe(moment().format('MM'))
  expect(dayjs().format('MMM'))
    .toBe(moment().format('MMM'))
  expect(dayjs().format('MMMM'))
    .toBe(moment().format('MMMM'))
})
```

The code above says the library’s behavior when formatting an invalid date should match how the `Date` library behaves, and the month formatting should match other libraries. This means dayjs wanted to stay compatible with other libs’ behavior, here [moment.js](https://momentjs.com/).

A great programmer always places a comment on top of their function, at least to explain how to use it. This is a must if you make a function that anybody else will use. To search, I clone the source code and read it, searching by keyword.

Let’s say you use this [query builder](https://github.dev/koskimas/kysely) but the docs are minimal and you want to do a database transaction. Most query builders you know have a `transaction` helper, but you cannot find an example. What do you do? Open your editor, clone the project and find the keyword.

![finding how to do transaction in kysely query builder](/img/code-example.webp)

Let’s say you still cannot understand it. The most you can do is search for help from the internet or ask friends. But do not take it for granted: do not stay ignorant, ask how they do it step by step.

That is it. If you want a TL;DR, it is one line: “Do not stay ignorant”. Many people are smarter than you because they try again and again. There are no magic tricks in learning programming, you try again and again, build again and again, fix again and again until you get what you want.

Here is a hot take for Indonesian college students, take it to heart before contacting me to help with your final semester project:

I will not help you do your _skripsi_ (final semester project) if you do not want to open source it, go somewhere else. Your idea needs work, many people already do what you do, you do not have a strong selling point, and your code is not state-of-the-art problem solving.

Why are you afraid that your friend will copy your project? If you wrote the code you should know better, do not be a coward: no wonder most government systems have issues, they contain a lot of cowards.

Take your time, I do not want you in a hurry, but I do want you to learn.
