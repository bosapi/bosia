---
title: Section Tim
description: Section tim — grid kartu anggota dan spotlight founder dengan kutipan serta bio.
demo: TeamSectionsDemo
---

Section tim untuk halaman about atau perusahaan. Masing-masing adalah Svelte `<section>` mandiri
selebar penuh yang dibangun **hanya** dari token semantik, sehingga gayanya berganti di setiap
tema. Coba pengalih tema di atas preview.

## Preview

## Install

```bash
bun x bosia@latest add block team/grid
bun x bosia@latest add block team/spotlight
```

`spotlight` menarik [`@lucide/svelte`](/components/ui/icon/) untuk panah tautan ceritanya.

## Blok-bloknya

- **`grid`** — kartu anggota dalam grid responsif: avatar, nama, peran dan tautan sosial teks.
- **`spotlight`** — satu kartu founder/pimpinan besar: potret di samping kutipan, bio dan tautan.

## Penggunaan

```svelte
<script lang="ts">
	import Team from "$lib/blocks/team/grid/block.svelte";
</script>

<Team />
```

Data anggota ada di array hardcoded di bagian atas `grid/block.svelte` — ubah nama, peran dan URL
avatar di sana. Potret placeholder berasal dari `i.pravatar.cc`; ganti dengan gambarmu sendiri
sebelum rilis.

## Sumber

`src/lib/blocks/team/*/block.svelte`
