---
tags: ["javascript", "howk"]
title: "Compress image on the fly with bandwidth hero"
description: "Make your browsing more fuzz, with reduced image quality"
date: 2019-09-19
---

> So learning code more easy if you read other people code, so be it I made this sort of episode Howk (How does it work) by reading some Open Source project, explain technically and maybe we can get some insight after it.

Recently I got stumbled on Open Source chrome extension named [bandwidth-hero](https://github.com/ayastreb/bandwidth-hero) developed by **@ayastreb** the usage of this extension are very simple, just install the extension from chrome or firefox store, insert your [server](https://github.com/ayastreb/bandwidth-hero-proxy) URL (I use my own proxy server, localhost works too), and enable it.

The extension will start saving your data-plan by compress the image you requested around the web.

So, I `git clone` the repo and try to making sense of how this could work.

## It's just a proxy

> In computer networks, a proxy server is a server that acts as an intermediary for requests from clients seeking resources from other servers. - Wikipedia

If you notice on your _dev tools_ network tab with the extension enabled, you requested `https://placekeanu/700/350` but on network tab, it says _http://myserver.dev/?url=https%3A%2F%2Fplacekeanu.com%2F700%2F350&l=40_ - it pointed to my server and respond a binary result of an image you requested. But the `img-src` tag still on `https://placekeanu/700/350`.

The image aren't saved on the server it is on the fly compression. The cookie itself requested using your server, so it is your server requested the image not the browser.

Then I notice something - when image request / other request get throw out from a browser it only need a correct respond to make something happen on the page. Whether it had some cookie or not, it only need correct response (cookie are validated in header, see [here](https://github.com/ayastreb/bandwidth-hero-proxy/blob/master/src/proxy.js)).

The server part compress image using [sharp](https://www.npmjs.com/package/sharp) the fastest image compression you could get in Node.js, believe me I use it for years, it uses [libvps](https://github.com/libvips/libvips) at the core.

The server code itself are very [simple](https://github.com/ayastreb/bandwidth-hero-proxy/blob/master/src/compress.js) it compress image, make it a buffer, send it back with correct format. It has many options on quality, you can enabled by adding query params.

## What API that makes this possible?

![web request cycle](https://developer.chrome.com/static/images/webrequestapi.png)

If we build a chrome we can get some useful API on networking by enabling this on `manifest.json`

```json
  "permissions": [
    "activeTab",
    "tabs",
    "storage",
    "webRequest", // this permission
    "webRequestBlocking",
    "<all_urls>"
  ]
```

You can use some useful listener in [`webRequest`](https://developer.chrome.com/extensions/webRequest) API. There are 3 main `webRequest` API that used by this project to make this possible :

- `webRequest.onBeforeRequest`
- `webRequest.onCompleted`
- `webRequest.onHeadersReceived`

The main player here are `onBeforeRequest` listener. It capture url you requested, payload, header, everything on network tab show. All listener placed on [`background.js`](https://github.com/ayastreb/bandwidth-hero/blob/master/src/background.js).

> beware on using browser extension, make sure it is secure / opensource, cause it will be validated by many people at least we can make sure that the extension doesn't had unwanted tracking.

```js
  // ...
  let redirectUrl = `${state.proxyUrl}?url=${encodeURIComponent(url)}`
  if (!isWebpSupported) redirectUrl += '&jpeg=1'
  if (!state.convertBw) redirectUrl += '&bw=0'
  if (state.compressionLevel) {
      redirectUrl += '&l=' + parseInt(state.compressionLevel, 10)
  }
  if (!isFirefox()) return { redirectUrl }
  // Firefox allows onBeforeRequest event listener to return a Promise
  // and perform redirect when this Promise is resolved.
  // This allows us to run HEAD request before redirecting to compression
  // to make sure that the image should be compressed.
  return axios.head(url).then(res => {
      if (
          res.status === 200 &&
          res.headers['content-length'] > 1024 &&
          res.headers['content-type'] &&
          res.headers['content-type'].startsWith('image')
      ) {
          return { redirectUrl }
      }
  // ...
```

the code above manipulate image url we requested and return manipulated URL so in network tab you'll see our manipulated url.

Some site had CSP rules on their site, it can be pass by adding the correct header after request completed. It is on `webRequest.onHeadersReceived` you can see the code [here](https://github.com/ayastreb/bandwidth-hero/blob/master/src/background/patchContentSecurity.js)

`webRequest.onCompleted` this api are only used to count how bytes was saved, and show to it the users.

## Some Image wont compressed?

Yes it is, since it uses web request proxy it cant process image that already declared (blob / base64) on src like this

```html
<img src="somehowdev.towont upload some html tag with base64" />
```

You will see this on google search result, however it still usefull if you open website that had lot of images, facebook, reddit, 9gag etc.

Thanks for reading! I usualy visit some opensource project and make sense on how it works, since it can be usefull way on doing somethings. See ya next _Howk_. Have a good day; be good people.
