---
tags: ["javascript", "programming"]
title: "Imutabilitas pada Functional Programming dengan JavaScript"
description: "Apa itu imutabilitas data, dan bagaimana cara implementasinya pada JS?"
date: 2021-12-31
en:
---

Liburan ini saya belajar soal _functional programming_ dari kursus [frontendmaster](https://frontendmasters.com/courses/functional-first-steps/immutability/) mbak Anjana Vakil. Naah ~ saya mau share beberapa hal yang saya pelajari soal imutabilitas.

## Mutabilitas?

Salah satu konsep functional programming adalah imutabilitas nilai primitif atau data struktur. Jadi kita benar benar tidak akan mengubah awal suatu nilai sama sekali.

> Don't change in place, but replace.

```js
let a = 10;
a = a + 1; // Mutasi data secara langsung

// Tidak memutasi data sama sekali,
// Nilai a masih 10, mendeklarasikan variabel baru untuk menyimpan nilai baru
const a = 10;
const newA = a + 1;
```

Kenapa harus _Immutable_? Kenapa harus ga langsung diubah aja, ribet kali _wkwk_. Ini sebenernya ada kaitanya dengan bagaimana kita menstruktur program, di sebuah program, banyak sekali program JS yang menggunakan global variabel yag sering diubah ubah saat runtime, perubahan isi pada variabel ini jika tidak di dokumentasikan dengan baik bisa menjadi boomerang kita sendiri.

Jadi pada JS, kita bakal banyak sekali mebuat `array` maupun `object` baru, lalu reassign lagi, ibarat nya copy dulu baru di rubah ~

```js
// contoh pada object
const merpati = { makan: "Biji", minum: "Susu" };

// untuk merubah merpati minum "Air", kita copy dulu valuenya
const newMerpati = { ...merpati, minum: "Air" }; // Dengan begini kita sama sekali tidak melakukan mutasi.
```

## Harga yang harus di bayar ~

JS sendiri bukan bahasa yang di optimisasikan untuk bekerja secara FP ~ setiap kita membuat _copy and replace_ (ex: `{...obj, a: 1}`) tentu hal tersebut akan mempengaruhi memori, semakin banyak properti `object` tersebut maka akan semakin banyak pula memori yang dipakai.

## Data Struktur Immutable

Adalah sebuah data struktur yang benar - benar tidak bisa diganti saat kita sudah membuatnya. Pada JS biasa kita harus menggunakan `Object.freeze()` dan tentunya tidak di optimisasikan untuk operasi perubahan tanpa mutasi, ya _copy pasta_ `object` seperti tadi (too expensive!).

Seperti kata pepatah

> "Dimana ada masalah disitu ada npm package"

Ternyata ada library yang mengimplementasikan _immutable data structure_ pada JS secara efisien menggunakan algoritma yang bernama _structural sharing_ (Saya ga bisa jelasin ini soalnya masih mencoba dekrip [implementasinya](https://github.com/immutable-js/immutable-js/blob/main/src/Map.js)). Library tersebut bernama [immutable.js](https://immutable-js.com/).

Dengan menggunakan algoritma _structural sharing_ tadi, memungkinkan kita melakukan perubahan pada data hanya sebagian saja, semisal kita hanya mau merubah object di index ke 4 kita tidak perlu menggunakan _copy paste object_ secara manual.

```js
// Plain JS, mutation
const obj = { a: 1, b: 2, c: 3 };
obj.a = 10;

// Plain JS, no mutation
const obj = { a: 1, b: 2, c: 3 };
const obj2 = { ...obj, a: 10 };

// immutable.js
import { Map } from "immutable";
const obj = Map({ a: 1, b: 2, c: 3 });
const obj2 = obj.set("a", 10); // Return new array
obj.a === obj2.a; // false
obj.b === obj2.b; // true
```

Jadi kesimpulannya adalah :

- Data mutable suatu saat akan sulit untuk di mantain
- Immutable data itu bagus, cuma mahal harganya di memori
- Untuk mengurangi harga tersebut, gunakan [Immutable.js](https://immutable-js.com/)

Mungkin mulai besok hari senin, saya akan mencoba mengimplementasikan immutable data _structure_ berikut. Mungkin bisa juga rewrite [game simple saya ini](https://github.com/mandaputtra/brick-breaker-game) ke _functional JS way_ ? Lest see what next year bring to us!.

Beberapa hal yang saya baca:

- [Immutable.js](https://immutable-js.com/)
- [Washing your code: avoid mutation](https://blog.sapegin.me/all/avoid-mutation/)
- [frontendmaster - functional js first step](servablehq.com/collection/@anjana/functional-javascript-first-steps)
