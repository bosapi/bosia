---
title: Table
description: Sekumpulan sub-komponen tabel bergaya untuk membangun tampilan data.
demo: TableDemo
---

```bash
bun x bosia@latest add table
```

Komponen wrapper tipis di sekitar elemen tabel HTML native (`<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>`) dengan styling konsisten dan penggabungan kelas `cn()`.

## Preview

## Sub-Komponen

| Komponen       | Elemen HTML | Deskripsi                                              |
| -------------- | ----------- | ------------------------------------------------------ |
| `Table`        | `<table>`   | Tabel root dibungkus dalam `<div>` yang bisa di-scroll |
| `TableHeader`  | `<thead>`   | Grup header tabel                                      |
| `TableBody`    | `<tbody>`   | Grup body tabel                                        |
| `TableFooter`  | `<tfoot>`   | Grup footer tabel                                      |
| `TableRow`     | `<tr>`      | Baris tabel dengan state hover dan terpilih            |
| `TableHead`    | `<th>`      | Sel header                                             |
| `TableCell`    | `<td>`      | Sel data                                               |
| `TableCaption` | `<caption>` | Caption tabel                                          |

## Props

Semua sub-komponen menerima:

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Plus atribut HTML tambahan apa pun via `...restProps`.

## Penggunaan

```svelte
<script lang="ts">
	import {
		Table,
		TableHeader,
		TableBody,
		TableFooter,
		TableRow,
		TableHead,
		TableCell,
		TableCaption,
	} from "$lib/components/ui/table";
</script>

<Table>
	<TableCaption>A list of your recent invoices.</TableCaption>
	<TableHeader>
		<TableRow>
			<TableHead class="w-[100px]">Invoice</TableHead>
			<TableHead>Status</TableHead>
			<TableHead>Method</TableHead>
			<TableHead class="text-right">Amount</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell class="font-medium">INV001</TableCell>
			<TableCell>Paid</TableCell>
			<TableCell>Credit Card</TableCell>
			<TableCell class="text-right">$250.00</TableCell>
		</TableRow>
	</TableBody>
	<TableFooter>
		<TableRow>
			<TableCell colspan={3}>Total</TableCell>
			<TableCell class="text-right">$2,500.00</TableCell>
		</TableRow>
	</TableFooter>
</Table>
```
