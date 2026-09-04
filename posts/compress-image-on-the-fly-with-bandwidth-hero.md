---
tags: ["javascript", "howk"]
title: "Compress image on the fly with bandwidth hero"
description: "Make your browsing more fuzz, with reduced image quality"
date: 2019-09-19
---

> Learning sticks better when you read other people’s code, so I started “Howk” (How does it work): read an open source project, explain it technically, and pull out insights you can reuse.

I stumbled on an open source Chrome extension named [bandwidth-hero](https://github.com/ayastreb/bandwidth-hero) by **@ayastreb**. It works like this: install the extension from the Chrome or Firefox store, paste in your [server](https://github.com/ayastreb/bandwidth-hero-proxy) URL (I run my own proxy server; localhost works too), and enable it.

The extension saves your data plan by compressing every image you request.

So I cloned the repo to see how it works.

## How the proxy rewrites image requests

> In computer networks, a proxy server is a server that acts as an intermediary for requests from clients seeking resources from other servers: Wikipedia

With the extension enabled, open DevTools and request `https://placekeanu.com/700/350`. The Network tab shows `http://myserver.dev/?url=https%3A%2F%2Fplacekeanu.com%2F700%2F350&l=40`: the request went to your proxy, which returned the image as binary, while the `img` tag still points to `https://placekeanu.com/700/350`.

The server does not store images: it compresses on the fly. Your server fetches the image, not the browser, so cookies and headers flow through the proxy.

Then I noticed something: when the browser fires an image request (or any request), the page only needs a correct response to render. Cookies or not, a valid response is enough (the proxy validates cookies in headers, see [here](https://github.com/ayastreb/bandwidth-hero-proxy/blob/master/src/proxy.js)).

The proxy compresses images with [sharp](https://www.npmjs.com/package/sharp), the fastest image library I have used in Node.js: it wraps [libvips](https://github.com/libvips/libvips) at its core.

The server code itself stays compact: it compresses the image, buffers the result, and sends it back with the correct content type. You control quality through query params (see the [compress module](https://github.com/ayastreb/bandwidth-hero-proxy/blob/master/src/compress.js)).

## The webRequest API that makes it possible

![web request cycle](https://developer.chrome.com/static/images/webrequestapi.png)

If you build a Chrome extension, you can tap networking APIs by adding this to `manifest.json`:

```json
  "permissions": [
    "activeTab",
    "tabs",
    "storage",
    "webRequest",
    "webRequestBlocking",
    "<all_urls>"
  ]
```

The project relies on three `webRequest` listeners:

- `webRequest.onBeforeRequest`
- `webRequest.onCompleted`
- `webRequest.onHeadersReceived`

The main player is the `onBeforeRequest` listener. It captures the URL you requested, plus payload and headers: everything the Network tab shows. All listeners live in [`background.js`](https://github.com/ayastreb/bandwidth-hero/blob/master/src/background.js).

> Beware with browser extensions: prefer secure, open source ones. More eyes on the code means less chance of hidden tracking.

The snippet below builds the redirect URL and returns it, so the Network tab shows your proxy URL instead of the original:

```js
  // ...
  let redirectUrl = `${state.proxyUrl}?url=${encodeURIComponent(url)}`
  if (!isWebpSupported) redirectUrl += '&jpeg=1'
  if (!state.convertBw) redirectUrl += '&bw=0'
  if (state.compressionLevel) {
      redirectUrl += '&l=' + parseInt(state.compressionLevel, 10)
  }
  if (!isFirefox()) return { redirectUrl }
  // Firefox allows onBeforeRequest to return a Promise
  // and perform redirect when this Promise resolves.
  // This allows us to run HEAD request before redirecting
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

Some sites enforce CSP. The extension bypasses that by patching headers in `webRequest.onHeadersReceived` (see code [here](https://github.com/ayastreb/bandwidth-hero/blob/master/src/background/patchContentSecurity.js)).

`webRequest.onCompleted` only counts saved bytes and reports them to you.

## Why some images skip compression

Yes. Because the extension works as a web request proxy, it cannot process images already inlined as `blob` or `base64` in `src`, like this:

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." />
```

You see this pattern on Google search results, but the extension still helps on image-heavy sites: Facebook, Reddit, 9Gag, and others.

Thanks for reading! I often visit open source projects to figure out how they work, because that teaches me new ways to build things. See you in the next _Howk_. Have a good day, and be good people.
