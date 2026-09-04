---
tags: ["javascript", "tips"]
title: "Click to send WhatsApp with JavaScript"
description: "Make a link that triggers send whatsapp from javascript"
date: 2018-09-29
---

> TL;DR You can use the link below and place it on your button, or whatever. It will open WhatsApp on the user’s phone, but it does not send automatically. Use the [WhatsApp click-to-chat link](https://api.whatsapp.com/send?phone=+<YOURNUMBER>&text=%20<YOURMESSAGE>) with `encodeURIComponent('your text here')`.

What we build here is a dynamic “send to WhatsApp” link with JavaScript. You can use the link above and give it a try.

I’ll use JSBin for this. First, open it, then you will use `split()` and `join()` string methods in JavaScript. Here is my script.

```js
// https://api.whatsapp.com/send
// ?phone=+{{ YOURNUMBER }}&text=%20{{ YOURMESSAGE }}

var yourNumber = "your number in string";
var yourMessage = "your message in string";

// %20 means space in link
// If you already have an array, join the items with '%20'

function getLinkWhastapp(number, message) {
  number = yourNumber;
  message = yourMessage.split(" ").join("%20");

  return console.log(
    "https://api.whatsapp.com/send?phone=" + number + "&text=%20" + message
  );
}

getLinkWhastapp();
```

Copy that to JSBin, set the phone number and message you want, and make sure you use WhatsApp. It will open WhatsApp on your phone with the message you wrote.

Further reading:

- [split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
- [join()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join)

## Use encodeURIComponent in production

This post was made to learn JS `split` and `join`. For production, use `encodeURIComponent()`:

```js
function getLinkWhastapp(number, message) {
  var url =
    "https://api.whatsapp.com/send?phone=" +
    number +
    "&text=" +
    encodeURIComponent(message);

  return url;
}
```
