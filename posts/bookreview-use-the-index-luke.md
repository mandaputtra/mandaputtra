---
tags: ["book review"]
title: "Review Buku: Effective TypeScript"
description: "Tips dan trick menggunakan TypeScript?"
date: 2021-12-05
---

> Untuk buku online yang gratis ~ use the index luke, ini terlalu dermawan. Benar - benar membahas soal index di database menjadi lebih mudah di mengerti 5/5.

Jumpa kembali, pada seri review buku ~ seperti biasa ini bukan review buku yang hanya membahas bagaimana cover dan ketebalan, tapi juga apa yang dipelajari dari membaca buku tersebut, serta sedikit review agar anda tertarik juga membacanya. Kali ini saya akan membahas soal index database, dari buku gratis berjudul [use-the-index-luke](https://use-the-index-luke.com).

Teknologi database ini sudah sehari - hari kita nikmati, mulai dari HP, Penanak nasi yang pakai embel - embel smart, server - server dan sebagainya. Fitur sebuah database adalah simpan, ubah, lihat dan hapus data. Walaupun fungsinya cuma itu - itu aja pada dasarnya ternyata fitur itu - itu aja bisa kompleks, ibarat bikin fitur website cuma login dan register, lalu tiba - tiba client minta bisa login lewat SAML (curhat, wkwk).

_Kadang_ bottleneck sebuah aplikasi bisa disebabkan oleh database, nah optimisasi pada database ini banyak, ada sharding, cluster, cache, ada juga indexing. Sudah lama sebenernya saya tertarik dengan bagaimana indexing ini bekerja, dan buku use-the-index-luke adalah jawabannya.

# The index magic?

Untuk mendemonstrasikan apa yang saya pelajari dari buku ini, saya perlu dataset sample ~ naah daripada buat sendiri saya keingat waktu kuliah dulu saya sempat mempelajari database dari data yang saya download [disini](https://dev.mysql.com/doc/index-other.html), saya memakai _employee_ databse, saya import semua, dengan total jumlah employee mencapai 300 ribu data.

Saya kali ini akan menggunakan MySQL, menurut saya topik index ini hampir - hampir sama di setiap database. Sebelum mulai ini spek komputer saya

```sql
AMD Ryzen 5 4800H
8 Cores 16 Thread
16 Gb RAM
SSD 3000 Mbps speed
```

Data yang akan kita gunakan ini ada ratusan ribu, jadi mungkin ga ada apa - apanya di komputer saya. Tapi di server anda yang ram-nya cuma 256mb dan cpu 1 core, ini berpengaruh. Pada table `employees` ada data sekitar 300 ribu.

```sql
MariaDB [employees]> select count(first_name) from employees;
+-------------------+
| count(first_name) |
+-------------------+
|            300024 |
+-------------------+
1 row in set (0.093 sec)
```

Setelah saya cek, table berikut puya index di kolom `emp_no`, oke saya run lagi perintah `COUNT` diatas dengan kolom `emp_no`.

```sql
MariaDB [employees]> select count(emp_no) from employees;
+---------------+
| count(emp_no) |
+---------------+
|        300024 |
+---------------+
1 row in set (0.000 sec)

MariaDB [employees]>
```

Bagian yang menarika adalah ini `1 row in set (0.000 sec)` , kenapa saat menggunakan `first_name` kita mendapatkan `0.093 sec` tapi pada saat menggunakan `emp_no` kita bisa lebih cepat? Karena index kah? Mari kitacoba.

```sql
create index first_name_employees on employees (first_name)
```

lalu jalankan kembali

```sql
MariaDB [employees]> select count(first_name) from employees;
+-------------------+
| count(first_name) |
+-------------------+
|            300024 |
+-------------------+
1 row in set (0.010 sec)

MariaDB [employees]>
```

Lhadalaah, turun 80 milisecond! 80% improvement cuma karena kita taruh index saja. Apakah semua harus kita index agar cepat semua query pada database kita? Index itu apasih, kok bisa bikin cepat akses data ke database kita? Naah buku ini memang menjawab pertanyaan tersebut.

# Apa itu index?

Layaknya sebuah glossarium pada buku, index bisa di kategorikan seperti itu. Semisal buku menyebut kalimat `manda ganteng` sehanyak 100 kali, anda buka glossarium di belakang buku tersebut cari awalan huruh M, nemu bagian `manda ganteng`, lalu anda bisa menemukan kata `manda ganteng` ini ada di bagian mana saja dengan mudah dan cepat. Dengan begitu cepat pula anda menemukan alasan kenapa saya ganteng.

Fungsi index ini adalah mengurutkan data yang tidak urut, data yang sudah terurutkan tentunya sangat mudah ditemukan daripada yang tidak. Ilustrasi sebagai berikut.

![7HuqG9.md.png](https://iili.io/7HuqG9.md.png)

Algoritma yang dipakai dari index dinamakan _doubly linked list_ dan _B-tree_

1. [Doubly Linked List](https://en.wikipedia.org/wiki/Doubly_linked_list), bisa dikatakan sebuah array/list yang mempunyai informasi data di depan dan dibelakangnya.
2. [B-tree](https://en.wikipedia.org/wiki/B-tree), balanced tree sebuah data struktur yang memungkinkan sebuah data selalu berurutan dan bisa memungkinkan kita untuk menambahkan, menghapus, mencari dan mengakses secara berurutan.

Lho jadi index itu adalah table sendiri? Yap benar sekali, setidaknya ini adalah representasi yang saya pelajari dari [bab pertama](https://use-the-index-luke.com/sql/anatomy). Bisa disimpulkan bahwa adanya index pula menyebabkan database kita menjadi lebih besar, dan index ini berpengaruh juga pada beberapa perintah seperti `create` setiap kita menambahkan data kita juga menambahkan index-nya, hmm. _So not every index is neccessary_, gunakan saat perlu benchmark sebelum deployment.

# EXPLAIN, jelasin perintah SQL ini ngapain aja

Fungsi ini setidaknya sangat berpengaruh kalau kita ingin melakukan sebuah benchmark pada sql, kenapa kok perintah SQL A lebih lamban dengan perintah SQL B.

Pada database yg saya pakai terdapat koneksi table antara `employees`, `salaries`, dan `title`. Pada perintah SQL berikut, saya akan mencari siapakah pegawai dengan employee tertinggi dan apakah jabatannya.

```sql
MariaDB [employees]> select e.emp_no, e.first_name, e.last_name, e.gender, s.salary, t.title from employees e
    -> inner join salaries s on e.emp_no = s.emp_no
    -> inner join titles t on s.emp_no = t.emp_no
    -> order by salary desc
    -> limit 10;

+--------+------------+-----------+--------+--------+--------------+
| emp_no | first_name | last_name | gender | salary | title        |
+--------+------------+-----------+--------+--------+--------------+
|  43624 | Tokuyasu   | Pesch     | M      | 158220 | Staff        |
|  43624 | Tokuyasu   | Pesch     | M      | 158220 | Senior Staff |
|  43624 | Tokuyasu   | Pesch     | M      | 157821 | Staff        |
|  43624 | Tokuyasu   | Pesch     | M      | 157821 | Senior Staff |
| 254466 | Honesty    | Mukaidono | M      | 156286 | Senior Staff |
| 254466 | Honesty    | Mukaidono | M      | 156286 | Staff        |
|  47978 | Xiahua     | Whitcomb  | M      | 155709 | Senior Staff |
| 253939 | Sanjai     | Luders    | M      | 155513 | Senior Staff |
| 109334 | Tsutomu    | Alameldin | M      | 155377 | Senior Staff |
| 109334 | Tsutomu    | Alameldin | M      | 155377 | Staff        |
+--------+------------+-----------+--------+--------+--------------+
10 rows in set (9.712 sec)

```

oke untuk 10 row saja, kita memakan hampir memakan waktu 10 detik, dengan spek komputer saya tentu ini _lamban_ saya pernah dengar yang bikin GMAIL dulu punya semboyan '200ms interaction' dimana semua interaksi harus memakan waktu sekitar 200 miliseconds. Lha kalau akses databasenya aja sampai 10 detik, _wassalaam_.

Kenapa memakan 10 detik? Oke kita coba cek dengan `explain`.

```sql
MariaDB [employees]> explain select e.emp_no, e.first_name, e.last_name, e.gender, s.salary, t.title from employees e inner join salaries s on e.emp_no = s.emp_no  inner join titles t on s.emp_no = t.emp_no  order by salary desc limit 10;
+------+-------------+-------+------+---------------+---------+---------+--------------------+--------+---------------------------------+
| id   | select_type | table | type | possible_keys | key     | key_len | ref                | rows   | Extra                           |
+------+-------------+-------+------+---------------+---------+---------+--------------------+--------+---------------------------------+
|    1 | SIMPLE      | e     | ALL  | PRIMARY       | first_name_employees    | 58    | NULL               | 299025 | Using temporary; Using filesort |
|    1 | SIMPLE      | t     | ref  | PRIMARY       | PRIMARY | 4       | employees.e.emp_no |      1 | Using index                     |
|    1 | SIMPLE      | s     | ref  | PRIMARY       | PRIMARY | 4       | employees.e.emp_no |      4 |                                 |
+------+-------------+-------+------+---------------+---------+---------+--------------------+--------+---------------------------------+
3 rows in set (0.000 sec)
```

Banyak informasinya, saya aku coba jelaskan, paling tidak yang sudah saya ngerti ngerti aja, hahaha :

- `id`, urutan di jalankannya sebuah query, semisal kita menggunakan `sub query` nanti bakal kelihatan query manakah yang saya jalankan pertama kali.
- `select type`, pada intinya operasi select kita tidak menggunakan perintah tambahan seperti `sub query`, `union`, dsb.
- `table`, nama tablenya, saya memakai alias jadi hanya tertulis aliasnya saja
- `possible_keys`, menunjukan key apa yang bisa digunkan untuk mencari data. Pada row pertama kita lihat key berisi `first_name_employees`, dimana kolom tersebut adalah kolom index yang kita buat pada sesi pertama.
- `ref`, mencari kolom constant yang akan dibandingkan dengan index, dikarenakan `first_name` dapat mempunyai duplikat, komlom konstannya tidak hadir `NULL`. Sementara karena table `titles` dan `salaries` menggunakan `key -> PRIMARY` maka menggunakan `ref`, `emp_no` dimana `emp_no` tersebut selalu _unique_.
- `rows`, berapa row yang harus dilihat oleh database saat mengeksekusi query
- `extra`, ini adalah beberapa penjelasan dari MySQL tentang bagaimana cara ia mengakses/mencari data tersebut. Informasi ini masih sangat kriptik bagi saya, tapi ada beberapa penjelasan [pada dokumentasi MySQL](https://dev.mysql.com/doc/refman/5.6/en/explain-output.html#explain-extra-information).

CMIIW, bottleneck query disini adalah dimana kita harus men scan semua rows yaitu 299025 rows. Kenapa harus men scan banyak sekali row? Lalu kita lihat juga bahwa return dari table tersebut tidak merepresentasikan data yang kita dapat.

Kolom `emp_no` ini banyak duplikatnya, dikarenakan 1 pegawai mempunyai catatan gaji yang banyak, dari kapan dia menerima gaji tsb, dan sampai kapan. Padahal kita hanya butuh satu saja yaitu gaji terakhir mereka. Oke ke bagian berikutnya mari kita improve dengan beberapa tambahan query dan index.

# Mempercepat query.

Oke bisakah kita mempercepat query tersebut? Mari kita coba, pertama representasi data kita salah, kita hanya perlu gaji terakhir dan titel terakhir saja.
