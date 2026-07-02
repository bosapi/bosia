---
title: Pages — Overview
description: Halaman lengkap dan tersusun yang diinstal dengan satu perintah — sekelompok block, tanpa backend.
---

Sebuah **page** adalah tingkat berikutnya di atas block: layar lengkap yang siap dirangkai, disusun
dari block storefront, tanpa backend miliknya sendiri. Instal satu dan Anda mendapatkan `page.svelte`
plus setiap block dan komponen yang menjadi dependensinya:

```bash
bun x bosia@latest add page storefront/home
```

```
src/lib/pages/storefront/home/page.svelte   ← halaman yang tersusun
src/lib/blocks/storefront/*                  ← bagian-bagiannya (diinstal untuk Anda)
```

Anda yang memiliki routing-nya. Letakkan halaman ke dalam sebuah rute dan render:

```svelte
<script lang="ts">
	import Home from "$lib/pages/storefront/home/page.svelte";
</script>

<Home />
```

## Storefront Mercato

Tujuh halaman storefront adalah satu template serbaguna — **Mercato**. Block yang sama merender salah
satu dari enam "purpose" toko; mengganti purpose menukar teks dan katalog, dan mengganti tema
meng-skin ulangnya. Sunting satu baris di bagian atas halaman mana pun:

```ts
import { purposes } from "$lib/blocks/storefront/store/purposes.ts";
const purpose = purposes.fashion; // clay · fashion · grocery · tech · beauty · garden
```

### Pemetaan purpose → tema

Setiap purpose dipasangkan dengan tema Bosia yang ada. Set tema pada aplikasi (atau wrapper apa pun)
sebagaimana biasa Anda lakukan; storefront memakai token semantik, jadi ia mengikuti.

| Purpose | Store type                   | Theme                            |
| ------- | ---------------------------- | -------------------------------- |
| clay    | Toko umum                    | [`clay`](/themes/clay) _(baru)_  |
| fashion | Fashion & pakaian            | [`editorial`](/themes/editorial) |
| grocery | Bahan makanan & segar        | [`forest`](/themes/forest)       |
| tech    | Elektronik & teknologi       | [`paper`](/themes/paper)         |
| beauty  | Kecantikan & perawatan kulit | [`bloom`](/themes/bloom)         |
| garden  | Tanaman & kebun              | [`sage`](/themes/sage)           |

## Halaman-halamannya

- [Home](/pages/storefront/home) — hero, kategori, koleksi unggulan, editorial, dan lainnya
- [Listing](/pages/storefront/listing) — filter, urut, dan grid produk (PLP)
- [Search](/pages/storefront/search) — overlay command-palette, hasil yang bisa diurut, keadaan tanpa-hasil
- [Product](/pages/storefront/product) — galeri, buy box, kepercayaan, detail, dan ulasan (PDP)
- [Cart](/pages/storefront/cart) — baris item, stepper kuantitas, ringkasan, dan empty state
- [Wishlist](/pages/storefront/wishlist) — produk favorit dengan pindah-ke-tas
- [Checkout](/pages/storefront/checkout) — form multi-langkah, ringkasan, dan konfirmasi

Untuk UI yang menghadap pelanggan di sini plus backend, pasangkan dengan scaffold template shop
(`bun x bosia@latest create my-shop --template shop`).

## Halaman auth

Keluarga kedua — enam layar login/auth yang disusun dari [block auth](/blocks/auth) bersama.
Masing-masing default ke kartu terpusat dan beralih ke panel brand/foto terbagi dengan satu prop
(`variant="split"`). Instal satu dan Anda mendapatkan `page.svelte` plus setiap block auth yang
disusunnya:

```bash
bun x bosia@latest add page auth/login
```

- [Login](/pages/auth/login) — baris sosial, email + kata sandi, ingat saya
- [Register](/pages/auth/register) — grid sosial, nama/email/kata sandi, meter kekuatan
- [Forgot Password](/pages/auth/forgot) — field email, catatan tautan reset
- [Magic Link](/pages/auth/magic-link) — konfirmasi periksa-kotak-masuk
- [OTP / 2FA](/pages/auth/otp) — input kode 6 digit bersegmen
- [SSO](/pages/auth/sso) — email kerja / domain perusahaan

Ini hanya lapisan visual — tanpa sesi atau hashing kata sandi. Untuk autentikasi sungguhan,
pasangkan dengan rangkaian server `bosia-auth-flow`.
