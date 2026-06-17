---
title: Inspector
description: Alt+klik elemen mana pun di halaman dev Anda untuk melompat ke sumbernya — atau serahkan ke agen AI.
---

Plugin inspector mengubah setiap elemen yang dirender menjadi tautan ke sumbernya. Tahan **Option** (Alt) untuk menyorot elemen; klik salah satu untuk membuka file `.svelte`-nya tepat di barisnya di editor Anda. Opsional, konfigurasi sebuah endpoint AI untuk mengirim komentar singkat bersama lokasinya untuk serah-terima perbaikan kode otomatis.

Ini plugin first-party — tanpa instalasi. Bekerja melalui injeksi atribut saat compile: setiap elemen HTML biasa di file `.svelte` Anda diberi anotasi `data-bosia-loc="path:line:col"` selama build dev. Plugin ini juga membungkus setiap pemanggilan `<Component>`, `<svelte:component>`, dan `<svelte:self>` dengan penanda komentar `<!--bosia:o=…--> … <!--bosia:c-->`, sehingga overlay dapat merekonstruksi **rantai call-site komponen** lengkap (mis. `+page.svelte:42 → Button.svelte:5`) — berguna ketika elemen yang diklik sebenarnya berada di dalam komponen bersama tetapi Anda ingin mengedit halaman yang merendernya. Build produksi tidak menginjeksi apa pun dan tidak memasang endpoint.

## Setup

Proyek baru yang di-scaffold dengan `bun create bosia` (template apa pun — `default`, `demo`, atau `shop`) sudah menyertakan `bosia.config.ts` dengan `inspector({ editor: "code" })` aktif — lewati bagian ini kecuali Anda menambahkannya ke proyek yang sudah ada atau ingin mengganti editor.

Tambahkan `inspector()` ke `bosia.config.ts` Anda:

```ts
import { defineConfig } from "bosia";
import { inspector } from "bosia/plugins/inspector";

export default defineConfig({
	plugins: [inspector()],
});
```

Jalankan `bun run dev` dan selesai. Default: editor `code`, tanpa endpoint AI.

## Penggunaan

- **Option + hover** — outline + tooltip menampilkan rantai call-site komponen lengkap (`+page.svelte:42 → Button.svelte:5`), atau sekadar `file:line` untuk elemen yang tidak bersarang di dalam komponen
- **Option + klik** — buka lokasi sumber daun (leaf) di editor Anda (atau buka form AI, jika `aiEndpoint` diset)
- **Esc** — tutup form AI

## Opsi

```ts
inspector({
	editor: "cursor", // "code" | "cursor" | "zed" | any CLI
	aiEndpoint: "http://localhost:9999/fix", // optional — POST handoff
	endpoint: "/__bosia/locate", // overlay → server endpoint (default)
});
```

### `editor`

Perintah CLI yang dipakai untuk membuka file. Default-nya `code` (VS Code). Dukungan bawaan untuk `cursor` dan `zed`. Editor lain yang menerima `<command> -g file:line:col` (atau `<command> file:line:col` untuk CLI seperti zed) juga bekerja — plugin menangani bentuk argv secara otomatis untuk tiga editor yang dikenal.

Untuk VS Code: instal perintah "Shell Command: Install 'code' command in PATH" dari Command Palette agar `code` terbaca di `$PATH`.

### `aiEndpoint`

Saat diset, Option+klik membuka form berlabuh (textarea + Send/Cancel) alih-alih melompat ke editor. Header form terisi otomatis dengan rantai call-site komponen (yang sudah dibersihkan dari frame framework) sehingga Anda bisa melihat persis konteks halaman/komponen mana yang akan diterima AI. Saat submit, overlay melakukan POST ke endpoint AI Anda:

```json
{
	"file": "src/lib/blocks/storefront/product-options/block.svelte",
	"line": 37,
	"col": 2,
	"comment": "[Inspector]\nurl:       http://localhost:5173/katalog/kemeja-batik\npageFile:  src/routes/(public)/katalog/[slug]/+page.svelte:69:6\ncomponent: src/lib/blocks/storefront/product-options/block.svelte:37:2\ntext:      \"Kemeja Batik Premium\"\ntree:      src/routes/(public)/katalog/[slug]/+page.svelte:69:6 → src/lib/blocks/storefront/product-options/block.svelte:37:2\n---\nchange the product name"
}
```

`file` / `line` / `col` tetap menunjuk ke daun (tempat elemen yang diklik berada) sehingga jalur cadangan buka-editor tidak berubah. `comment` membawa blok konteks berlabel di atas pemisah `---`:

- **`url`** — halaman tempat elemen diklik (`location.href`), sehingga AI tahu _record mana_ yang dirender (mis. slug produk mana).
- **`pageFile`** — `+page.svelte` / `+layout.svelte` terdekat dalam rantai render. Ini penting karena data biasanya berasal dari halaman (atau `+page.server.ts`-nya) dan mengalir _turun_ ke komponen sebagai props. Saat Anda meminta "ubah nama produk", nilainya ada di halaman, bukan di komponen daun — memunculkan `pageFile` membuat AI menelusuri prop kembali ke sumbernya alih-alih mengedit daun.
- **`component`** — `data-bosia-loc` daun (dihilangkan saat elemen berada langsung di halaman).
- **`text`** — teks langsung milik elemen itu sendiri, dengan spasi yang diciutkan dan dibatasi panjangnya (dihilangkan saat tidak ada).
- **`tree`** — rantai call-site kode pengguna lengkap (frame framework dibersihkan), dihilangkan saat hanya satu frame tersisa.

Jika pengguna mengirim komentar kosong, request kembali ke pembukaan editor — praktis untuk "saya cuma ingin melompat ke sana" tanpa mengganti mode.

Plugin tidak berasumsi apa pun tentang layanan AI; Anda yang mengimplementasikan endpoint-nya. Setup tipikal: skrip lokal yang menerima payload, menjalankan agen coding pilihan Anda terhadap file, lalu menerapkan patch.

## Cara Kerjanya

1. **Injeksi saat compile.** Plugin menyumbang sebuah Bun build plugin yang berjalan sebelum `SveltePlugin()`. Untuk tiap file `.svelte`, ia mem-parse sumber dengan `parse()` dari `svelte/compiler`, menelusuri AST, dan memakai `magic-string` untuk (a) menyisipkan atribut `data-bosia-loc` tepat setelah tiap nama tag HTML huruf kecil, dan (b) membungkus tiap pemanggilan `Component` / `SvelteComponent` / `SvelteSelf` dengan komentar HTML `<!--bosia:o=path:line:col-->` / `<!--bosia:c-->`. Komentar bertahan ke DOM yang dirender karena `preserveComments` aktif di dev. Source map dipertahankan sehingga stack trace error di dev tetap menunjuk baris yang benar.

2. **Tag yang dilewati.** Tag komponen berhuruf kapital (`<MyButton>`), elemen khusus `<svelte:*>`, dan blok `<script>` / `<style>` tidak mendapat atribut `data-bosia-loc`. Gaya Vite: mengklik sebuah `<button>` yang dirender di dalam `<MyButton>` membuka `MyButton.svelte` di baris button, bukan parent-nya. Tooltip hover dan form AI juga menampilkan rantai call-site `<MyButton>` yang direkonstruksi dari penanda komentar, sehingga Anda selalu tahu halaman mana yang merender elemen yang sedang Anda inspeksi.

3. **Overlay runtime.** Sebuah skrip kecil diinjeksi melalui `render.bodyEnd`. Ia mendengarkan Alt-down + mousemove untuk menggambar sorotan, dan Alt+klik untuk memicu aksi. Skrip membaca `window.__BOSIA_INSPECTOR__` untuk konfigurasi — tanpa secret inline.

4. **Endpoint server.** Plugin memasang `POST /__bosia/locate` melalui `backend.before`. Tanpa komentar, ia menjalankan perintah editor lalu kembali. Dengan komentar + `aiEndpoint`, ia meneruskan payload ke endpoint Anda.

## Produksi

Plugin tidak melakukan apa pun saat `NODE_ENV !== "development"`:

- Tidak ada atribut yang diinjeksi ke output build
- Tidak ada skrip overlay di HTML
- Tidak ada endpoint `/__bosia/locate` yang dipasang

Verifikasi dengan `bun run build && grep -rE "data-bosia-loc|bosia:o=" dist/` — seharusnya tidak mencetak apa pun (baik injektor atribut maupun injektor penanda komentar tidak berjalan di produksi).
