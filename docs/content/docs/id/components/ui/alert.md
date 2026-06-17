---
title: Alert
description: Menampilkan callout untuk pesan penting dengan varian default dan destructive.
demo: AlertDemo
---

```bash
bun x bosia@latest add alert
```

Komponen alert majemuk dengan slot judul dan deskripsi.

## Preview

## Sub-komponen

| Komponen           | Elemen  | Tujuan                                                  |
| ------------------ | ------- | ------------------------------------------------------- |
| `Alert`            | `<div>` | Kontainer root dengan styling varian dan `role="alert"` |
| `AlertTitle`       | `<h5>`  | Heading tebal                                           |
| `AlertDescription` | `<div>` | Teks isi                                                |

## Props

### Alert

| Prop      | Type                           | Default     |
| --------- | ------------------------------ | ----------- |
| `variant` | `"default"` \| `"destructive"` | `"default"` |

## Penggunaan

```svelte
<script lang="ts">
	import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert";
</script>

<Alert>
	<AlertTitle>Heads up!</AlertTitle>
	<AlertDescription>You can add components using the CLI.</AlertDescription>
</Alert>

<Alert variant="destructive">
	<AlertTitle>Error</AlertTitle>
	<AlertDescription>Your session has expired.</AlertDescription>
</Alert>
```
