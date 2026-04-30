---
title: Table
description: A set of styled table sub-components for building data displays.
demo: TableDemo
---

```bash
bosia add table
```

Thin wrapper components around native HTML table elements (`<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>`) with consistent styling and `cn()` class merging.

## Preview

## Sub-Components

| Component      | HTML Element | Description                                |
| -------------- | ------------ | ------------------------------------------ |
| `Table`        | `<table>`    | Root table wrapped in a scrollable `<div>` |
| `TableHeader`  | `<thead>`    | Table header group                         |
| `TableBody`    | `<tbody>`    | Table body group                           |
| `TableFooter`  | `<tfoot>`    | Table footer group                         |
| `TableRow`     | `<tr>`       | Table row with hover and selected states   |
| `TableHead`    | `<th>`       | Header cell                                |
| `TableCell`    | `<td>`       | Data cell                                  |
| `TableCaption` | `<caption>`  | Table caption                              |

## Props

All sub-components accept:

| Prop    | Type     | Default |
| ------- | -------- | ------- |
| `class` | `string` | `""`    |

Plus any additional HTML attributes via `...restProps`.

## Usage

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
