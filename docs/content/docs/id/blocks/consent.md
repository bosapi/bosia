---
title: Banner Persetujuan
description: Bar persetujuan cookie yang menempel di tepi bawah — pilihan terima/tolak tersimpan di localStorage.
demo: ConsentBannerDemo
---

Bar persetujuan cookie yang menempel di bagian bawah viewport sampai pengunjung menerima atau
menolak. Pilihannya disimpan di `localStorage`, jadi banner tidak muncul lagi di kunjungan
berikutnya. Dibangun hanya dari token semantik — coba pengalih tema di atas preview.

## Preview

Preview membatasi banner di dalam kotak demo; di aplikasimu banner membentang di bawah viewport.

## Install

```bash
bun x bosia@latest add block consent/banner
```

## Penggunaan

Render sekali di layout root:

```svelte
<script lang="ts">
	import ConsentBanner from "$lib/blocks/consent/banner/block.svelte";

	let { children } = $props();
</script>

{@render children()}
<ConsentBanner
	onDecision={(accepted) => {
		if (accepted) {
			// muat analytics di sini
		}
	}}
/>
```

Props: `message`, `policyHref`/`policyLabel`, `acceptLabel`/`declineLabel`, `storageKey` (default
`cookie-consent` — ganti untuk bertanya ulang ke semua orang setelah kebijakan berubah), dan
`onDecision(accepted)` untuk menggerbangi analytics. Menolak juga menyembunyikan banner; tidak ada
yang rusak tanpa persetujuan.

## Sumber

`src/lib/blocks/consent/banner/block.svelte`
