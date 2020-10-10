---
tags: ["javascript", "tips" ]
title: "Click to send whatsapp with javascript"
description: "Make a link that triggers send whatsapp from javascript"
date: 2018-09-29
---

> TL;DR You can use link below and place it on your button, or whatever. Its simply will open up whatsapp on user phone. But it isn't automatically send. https://api.whatsapp.com/send?phone=+*YOURNUMBER*&text=%20*YOURMESSAGE*. use encodeURIComponent('your text here')

What we were built here it is a dynamic send to WhatsApp link with JavaScript approach you can use the link above and give it a try

Okay I'll use JSBin with this, first open up then its just easy you will use `split()` and `join()` string property on JavaScript here my script.

```js
  // https://api.whatsapp.com/send?phone=+{{ *YOURNUMBER* }}&text=%20{{ *YOUR MESSAGE* }}

  var yourNumber = "{{ your number in string}}"
  var yourMessage = "{{ your message in string }}"

  // %20 mean space in link
  // If you already had an array then you just join them with '%20'
  // easy right

  function getLinkWhastapp(number, message) {
    number = yourNumber
    message = yourMessage.split(' ').join('%20')
    
    return console.log('https://api.whatsapp.com/send?phone=' + number + '&text=%20' + message)
  }

  getLinkWhastapp()
```

Copy that on jsbin, give phone number and message do you want, make sure you use WhatsApp, It will open up WhatsApp on your phone with the message you wrote.

Further reading :

- [split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
- [join()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join)

---
## Important

This post was made to learn JS `split` and `join` for production purpose you should use `encodeURIComponent()`

```js
  function getLinkWhastapp(number, message) {
    var url = 'https://api.whatsapp.com/send?phone=' 
       + number 
       + '&text=' 
       + encodeURIComponent(message)
    
    return url
  }
```
