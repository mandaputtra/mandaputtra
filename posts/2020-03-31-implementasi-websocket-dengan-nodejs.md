---
tags: ["javascript", "node"]
title: "Implementasi Mudah Websocket dengan Node.js"
description: "Implementasi Mudah Websocket dengan Node.js"
date: 2020-03-31
---

[SocketIO](https://socket.io/) selalu jadi pilihan kawula developer kalau mau implementasi WebSocket pada browser, dan yap SocketIO sebenernya cukup cukup aja untuk masalah ini.

Tapi masalahnya satu, SocketIO ini termasuk _fosil_ teknologi. Banyak browser sudah [support websocket](https://caniuse.com/#feat=websockets) dan tidak memerlukan teknik `long-polling` lagi. Library client [SocketIO pada browser besar](https://bundlephobia.com/result?p=socket.io-client@2.3.0), dan banyak major product seperti Trello yag migrasi dari SocketIO ke native WebSocket dikarenakan performanya lebih baik.

Saya tidak akan menjelaskan satu persatu langkah pembuatannya jika tertarik untuk melihat code-nya bisa langsung [cek disini](https://github.com/mandaputtra/working-example/tree/master/websocket-demo-pollin)

## Membuat Koneksi Websocket Pada Server

Cukup mudah saya disini memakai [fastify](https://www.fastify.io/) dan [ws](https://github.com/websockets/ws).

Kita hanya perlu memasukan _instance object_ server pada aplikasi server HTTP kita (fastify)

```js
  const fastify = require('fastify')
  const WebSocket = require('ws')

  // inisiasi websocket server
  const wss = new Websocket({ server: fastify.server }) // _server object_ dari fastify

  wss.on('connection', (ws) => {
    // ws berisikan _instance object_ tiap tiap client yang terkoneksi
  })

  // mulai server fastify
  async function start() {
    await fastify.listen(3000)
    console.log('berjalan pada port 3000')
  }
```

Jikalau anda menggunakan express bisa lihat contoh [disini](https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js)

## Event Handling

Saat memakai `ws` banyak orang bingung soal implementasi _event_-nya bagaimana. Kalau di SocketIO sangat mudah karena kita bisa pakai `emit` dan `on` yang sudah disediakan oleh library.

Tenang Node.js punya modul namanya [events](https://nodejs.org/api/events.html), modul tersebut bisa kita gunakan untuk memperhatikan (_watch_) event yang kita buat pada websocket kita.

Contoh simple penggunaan events.

```js
  const EventEmitter = require('events');

  // inisiasi event emmiter
  class MyEmitter extends EventEmitter {}
  const myEmitter = new MyEmitter();

  myEmitter.on('event', () => {
    console.log('an event occurred!');
  });

  myEmitter.emit('event'); // kirim message ke event
```

Oke jadi dengan teknik tsb kita bisa refaktor file di awal kita tadi menjadi seperti ini.

```js
  const WebSocket = require('ws')
  const EventEmmiter = require('events')

  class SocketConnection extends EventEmmiter {
    constructor({ server }) {
      super()
      
      // inisiasi server websocket 
      this.wss = new WebSocket({ server })

      this.wss.on('connection', (ws) => {
        // menerima pesan yang dikirim user.
        ws.on('message', () => {
            // mengirimkan event 
            this.emit('voting', { voting: 'Jokawi' })
        })
      })
    }
  }

  module.exports = SocketConnection
```

Untuk menerima pesan voting tsb kita bisa gunakan dalam `index.js` kita seperti ini:

```js
  const fastify = require('fastify')
  const Socket = require('./socket') // namain aja file tadi socket

  const room = new Socket({ server: fastify.server })

  // kita bisa mendengarkan event dari sini
  room.on('voting', () => {
  // lakukan sesuatu saat voting
  })
```

Implementasi bisa dilihat [disini](https://github.com/mandaputtra/working-example/blob/master/websocket-demo-pollin/socket.js)

## Broadcast

WebSocket Merupakan komunikasi bidireksional (2 arah) dan hanya One to One antara server dan client saja. Jadi Untuk broadcast pesan kesemua orang  / ke salah satu client yang terkoneksi kita harus menyimpan setiap koneksi yang ada.

contoh :

```js
 // this.sockets merupakan object yang kita simpan di server
 // yang berisikan setiap user yang terkoneksi
 broadcast(msg) {
    for (const key in this.sockets) {
      this.send(key, msg)
    }
 }
```

## Scaling

Untuk scaling secara horizontal kita bisa menggunakan redis dan sticky session. Anda bisa baca [di sini](https://tsh.io/blog/how-to-scale-websocket/) atau bisa juga lihat implementasi dengan docker di [video ini](https://www.youtube.com/watch?v=shJo8Wj7jMA).

## Routing

Jika kita kepingin routing websocket kita bisa juga kita manfaatkan opsi routing pada `ws`.

```js
  const fastify = require('fastify')
  const Websocket = require('ws')


  const room1 = new WebSocket({ server: fastify.server, path: '/room1' })
  const room2 = new WebSocket({ server: fastify.server, path: '/room2' })
  ``` 

  dan nanti di client (browser) kita bisa koneksi seperti ini

  ```js
  // konek ke room1
  new WebSocket('ws://localhost:3000/room1') // ws: kalau http kalau htpps pakai wss:
  new WebSocket('ws://localhost:3000/room2') // konek ke room 2
```

## Kesimpulan

Pakai yang kamu nyaman, SocketIO bagus digunakan kalau kamu bikin aplikasi yang tidak terlalu banyak user, masih menargetkan browser lama seperti IE9, dan mencari solusi cepat. Tapi jika ingin memaksimalkan peforma kita bisa memakai library lain seperti [ws](https://github.com/websockets/ws), [uWebsocket.js](https://github.com/uNetworking/uWebSockets.js/blob/master/README.md), atau library lain. Ingat selalu melihat feedback saat ingin menggunkan library yang cukup krusial pada aplikasi kita.

Yuk mari berkarya!

## Link Referensi

- [dokumentasi ws](https://github.com/websockets/ws/blob/master/doc/ws.md)
- [aplikasi polling](https://github.com/mandaputtra/working-example/tree/master/websocket-demo-pollin)