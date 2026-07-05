---
title: Navigasi
description: Navigasi programatik dan berbasis tautan di Bosia — goto(), beforeNavigate, afterNavigate, form actions, dan escape hatch full-reload.
---

Bosia menyediakan empat pola navigasi yang mencerminkan SvelteKit:

1. Tautan `<a href>` biasa — router mencegatnya.
2. `goto()` — navigasi SPA programatik.
3. Form action `redirect(303, '/x')` — navigasi pasca-submit yang digerakkan server.
4. `window.location.href` — reload browser penuh (escape hatch).

Tiga yang pertama bersifat SPA — tidak mengeksekusi ulang skrip entry. Yang keempat membongkar dan menghidrasi ulang.

## Tautan anchor

```svelte
<a href="/dashboard">Dashboard</a>
```

Handler klik milik Bosia mencegat klik anchor biasa dan menjalankan `router.navigate()`. Klik dengan modifier (Cmd, Ctrl, klik tengah) dan `target="_blank"` diteruskan ke browser, sehingga "buka di tab baru" tetap bekerja seperti yang diharapkan. `rel="external"` dan `download` juga ikut keluar.

## `goto()`

```ts
import { goto } from "bosia/client";

await goto("/dashboard");
await goto("/login", { replaceState: true, invalidateAll: true });
```

`goto()` mengembalikan sebuah Promise yang resolve setelah navigasi mengendap (loader berjalan, komponen ter-mount).

### Opsi

| Opsi            | Default | Deskripsi                                                                       |
| --------------- | ------- | ------------------------------------------------------------------------------- |
| `replaceState`  | `false` | Memakai `history.replaceState` alih-alih `pushState`.                           |
| `invalidateAll` | `false` | Menandai setiap loader kotor agar tujuan menjalankan ulang semua server loader. |
| `noScroll`      | `false` | Melewati scroll-to-top default setelah navigasi.                                |
| `keepFocus`     | `false` | Dicadangkan — belum dihormati.                                                  |
| `state`         | —       | Dicadangkan — Bosia belum punya shallow routing.                                |

Jika URL cocok dengan route saat ini, `goto()` resolve langsung tanpa menjalankan ulang loader. Opsi `invalidateAll: true` **tidak** dihormati pada panggilan ke path yang sama — panggil `invalidateAll()` langsung (diimpor dari `bosia/client`) untuk menyegarkan di tempat.

## Perilaku scroll

- **Navigasi maju** (link, `goto()`, redirect form) scroll ke atas — atau ke elemen `#hash` jika URL tujuan memilikinya. `goto(url, { noScroll: true })` melewatinya untuk satu navigasi.
- **Back/forward (popstate)** memulihkan posisi scroll halaman saat ditinggalkan. Router menyimpan posisi per entri history dan memulihkannya _setelah_ halaman tujuan dirender, jadi listing panjang tidak melompat ke atas saat pengguna menekan Back. Posisi bertahan melewati reload via `sessionStorage`.

Ini otomatis — tanpa kode aplikasi.

## Lifecycle hooks

`beforeNavigate` berjalan sebelum setiap navigasi sisi-klien. Callback boleh memanggil `nav.cancel()` untuk memblokir navigasi (kecuali pada back/forward browser — lihat di bawah).

```svelte
<script lang="ts">
	import { beforeNavigate, afterNavigate } from "bosia/client";

	beforeNavigate((nav) => {
		if (hasUnsavedChanges && !confirm("Discard changes?")) {
			nav.cancel();
		}
	});

	afterNavigate((nav) => {
		console.log("navigated to", nav.to?.url.pathname);
	});
</script>
```

Keduanya otomatis tidak terdaftar lagi saat komponen pemanggil dihancurkan.

### Objek Navigation

```ts
interface Navigation {
	from: { url: URL; params: Record<string, string> } | null;
	to: { url: URL; params: Record<string, string> } | null;
	type: "link" | "goto" | "popstate" | "form" | "enter";
	willUnload: boolean;
	cancel: () => void;
}
```

- `type` — bagaimana navigasi dipicu.
- `willUnload` — `true` saat browser akan membongkar halaman (tab ditutup, tautan eksternal). Untuk peristiwa ini `cancel()` tidak berefek; gunakan `addEventListener("beforeunload", ...)` langsung untuk meminta konfirmasi pengguna.
- `cancel()` pada navigasi `popstate` (back/forward) juga tidak berefek — browser sudah memindahkan pointer history-nya saat listener berjalan.

## Indikator Loading

Bosia menampilkan bilah progres tipis di bagian atas halaman selama setiap navigasi klien. Untuk transisi yang lebih kaya, letakkan `+loading.svelte` di folder route dan Bosia merender kerangka itu secara otomatis saat tujuan dimuat — tertanam di dalam layout yang dibagi, tanpa perlu mengatur `beforeNavigate`. Lihat [Kerangka Loading](/docs/guides/routing/#kerangka-loading).

## Form actions

Form action yang melempar `redirect(303, "/x")` bernavigasi melalui router secara otomatis saat dibungkus dengan `use:enhance`:

```svelte
<form method="POST" action="?/logout" use:enhance>
	<button>Log out</button>
</form>
```

Lihat [Form Actions](/docs/guides/form-actions/) untuk cerita lengkapnya.

## `window.location.href` — reload penuh

Gunakan hanya saat Anda benar-benar perlu membongkar semua state klien (mis. logout, berganti tenant di aplikasi multi-tenant ketika konteks runtime yang segar diinginkan):

```ts
function hardLogout() {
	document.cookie = "session=; Max-Age=0";
	window.location.href = "/";
}
```

Untuk navigasi internal, lebih baik `goto()` — lebih cepat (tanpa parse ulang skrip, tanpa biaya hidrasi ulang) dan mempertahankan cache loader sebisa mungkin.
