---
tags: ["database", "opini"]
title: "Opini Saya Tentang ORM"
description: "Banyak yang kurang suka dengan ORM, padahal bikin mudah"
date: 2021-02-23
en:
---

> TL;DR Gunakanlah ORM, Belajarlah SQL

Saya kenal pemrogramman bukan langsung laravel seperti kebanyakan orang yang memulai pemrogramman sekarang. Jadi menurut saya ORM itu kurang baik, tapi akhir - akhir ini saya merasa bersalah kalau bilang ORM itu ga baik. banyak juga orang - orang yang [berpendapat seperti itu](https://www.youtube.com/watch?v=ya1fwxnmlQs), jika mencari [alasan yang](https://www.youtube.com/watch?v=63tS3HNmhiE) [serius](https://softwareengineering.stackexchange.com/questions/120321/is-orm-an-anti-pattern) [tentu banyak](https://kurapov.ee/eng/tech/ORM-is-harfmul-pattern/).

OK, Apa itu ORM? ORM atau Object Relational Mapping, merupakan sebuah alat untuk mempermudah kita berinteraksi dengan database. Contoh :

Raw SQL:

```sql
SELECT name, email FROM users
```

ORM:

```js
UserModel.query().select("name", "email");
```

Kalau itu mempermudah kenapa banyak yang ga suka? Ada beberapa alasan, berikut adalah beberapa alasan yang sering saya dengar.

## Alasan Kenapa ORM Buruk?

**ORM Lamban**, Ya jelas. Kalau ini saya ndak mau mendebat. Kalau memang alasan tidak menggunakan ORM adalah karena lamban ya gausah pakai ORM. Tapi ~ banyak juga yang pakai driver SQL nulis-nya salah - salah malah jadinya lamban, sama aja.

**ORM menyembunyikan perintah SQL**, Ga selalu. Banyak ORM yang punya fitur `debug` fitur ini nantinya bisa digunakan untuk melihat fungsi yang kita jalankan akan menghasilkan SQL seperti apa.

Kalaupun ingin menggunakan raw query tentu bisa dilakukan di ORM, misal seperti ini:

```js
knex.raw("SELECT * FROM users");
```

Tidaklah susah bukan?

**Banyak hal yang perlu dipelajari untuk menggunakan ORM**, Tidak terlalu. Saya banyak melihat kode orang, ada juga PHP, JS, Python Kode ini relatif banyak sekitar 50LOC (Line of Code) dan sama - sama tidak memakai ORM. Kesalahan yang saya lihat dari proyek tersebut adalah banyak kolom yang tidak terdokumentasi dengan baik, saya harus lihat struktur database sering - sering. Jika menggunakan ORM kemungkinan kalian bakal menggunakan `Model` dimana ini nantinya akan membantu kita menjelaskan kolom pada database, struktur-nya seperti apa, apalagi kalau dapet auto-completion.

Tapi biasanya kalau menggunakan bahasa pemrogramman yang mempunyai _static typing_ seperti C++, Java, dll. Kebanyakan kita akan membuat entiti database tersebut terlebih dahulu, jadi nanti aplikasi ga komplain pas di compile.

Memang kadang beda bahasa pemrogramman beda juga konsep ORM-nya, tapi kan kita bisa pakai _raw query_. Toh juga pasti ada dokumentasi ORM tsb.

## Pentingnya SQL

Memang benar SQL cukup mudah untuk dipelajari dan tentu sangat penting untuk di pelajari.

Jas Merah (Jangan Melupakan Sejarah), suatu saat mungkin kita akan bekerja di perusahan multi-triyuner, dengan user yang mencapai puluhan juta pengguna perhari. Di tempat seperti itu mungkin mengharuskan kita melakukan query tercepat yang bisa dilakukan, jadi kita harus menggunakan _raw query_ dsb.

Atau mungkin ternyata aplikasi kita yang digunakan hanya 25org sehari saja memerlukan join table sampai 17 kali, manipulasi beberapa kolom dsb-nya. Tentu dalam hal ini kita akan menggunakan _raw query_.

Atau kemungkinan lagi anda ingin berganti karir menjadi database engineer, membuat beberapa [TRIGGER](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver15), memigrasi database - database perusahan, banyak sekali hal - hal keren yang dapat dilakukan dengan _raw query_, tapi carilah ORM yang tidak menghalangi hal - hal tersebut.

## Rekomendasi

Saya sendiri pengguna setia ORM (est 2020). Mempunyai beberapa rekomendasi untuk memilih ORM. Berikut beberapa syarat saya untuk menilai apakah ORM itu baik digunakan atau tidak.

1. Bisa melakukan raw query
2. Sintax harus _fluent_ (ex: `Model.query().insert({})` ) dengan begini lebih mudah membaca flow.
3. Mendukung [_sql transaction_](https://www.geeksforgeeks.org/sql-transactions/)
4. Setup cukup simple
5. Maintenance cukup aktif dan dokumentasi cukup bagus.
6. Kode sumber enak dibaca (opsional, berguna untuk mengatasi error / bug)

Sebagai contoh untuk Node.js saya suka dengan [objection.js](https://vincit.github.io/objection.js/guide/getting-started.html) dan [knex.js](https://knexjs.org/), saya kurang suka dengan [prisma](https://www.prisma.io/) dan [TypeORM](https://typeorm.io/#/).

## Kesimpulan

Pakailah alat yang mempermudah, tapi jangan lupakan juga asal muasal-nya, suatu saat kita akan membutuhkannya juga. Mungkin video dari Jhonatan Blow berikut bisa [memberikan peringatan bagi kita](https://www.youtube.com/watch?v=pW-SOdj4Kkk&t=31s)
