---
title: Data Table
description: Tabel data berfitur lengkap dengan sorting, filtering, dan paginasi.
demo: DataTableDemo
---

```bash
bun x bosia@latest add data-table
```

Tabel data berfitur lengkap dengan sorting, filtering, dan paginasi. Otomatis menginstal dependensi: `button`, `input`, `separator`.

## Preview

## Penggunaan Dasar

```svelte
<script lang="ts">
	import { DataTable } from "$lib/components/ui/data-table";
	import type { ColumnDef, TableState } from "$lib/components/ui/data-table";

	type User = { name: string; email: string; role: string };

	const columns: ColumnDef<User>[] = [
		{ id: "name", accessorKey: "name", header: "Name" },
		{ id: "email", accessorKey: "email", header: "Email" },
		{ id: "role", accessorKey: "role", header: "Role", enableSorting: false },
	];

	let users: User[] = $state([
		{ name: "Alice", email: "alice@example.com", role: "Admin" },
		{ name: "Bob", email: "bob@example.com", role: "User" },
	]);

	function handleStateChange(state: TableState) {
		console.log("Table state:", state);
	}
</script>

<DataTable
	{columns}
	data={users}
	totalRows={users.length}
	pageSize={10}
	onStateChange={handleStateChange}
/>
```

## Props

| Prop            | Type                          | Default               |
| --------------- | ----------------------------- | --------------------- |
| `columns`       | `ColumnDef<T>[]`              | `[]`                  |
| `data`          | `T[]`                         | `[]`                  |
| `totalRows`     | `number`                      | `0`                   |
| `pageSize`      | `number`                      | `10`                  |
| `filters`       | `FilterDef[]`                 | `[]`                  |
| `loading`       | `boolean`                     | `false`               |
| `emptyMessage`  | `string`                      | `"No results found."` |
| `onStateChange` | `(state: TableState) => void` | —                     |

## Definisi Kolom

```ts
type ColumnDef<T> = {
	id: string;
	accessorKey?: keyof T & string;
	accessorFn?: (row: T) => any;
	header: string | ((ctx: HeaderContext<T>) => RenderDescriptor);
	cell?: (ctx: CellContext<T>) => RenderDescriptor;
	enableSorting?: boolean; // default: true
	class?: string; // applied to <td>
	headerClass?: string; // applied to <th>
};
```

## Rendering Sel Kustom

Gunakan `renderSnippet` untuk HTML inline atau `renderComponent` untuk komponen Svelte:

```ts
import { createRawSnippet } from "svelte";
import { renderSnippet, renderComponent } from "$lib/components/ui/data-table";
import Actions from "./actions.svelte";

const columns: ColumnDef<User>[] = [
	{
		id: "name",
		accessorKey: "name",
		header: "Name",
		cell: ({ value }) => {
			const s = createRawSnippet(() => ({
				render: () => `<span class="font-bold">${value}</span>`,
			}));
			return renderSnippet(s);
		},
	},
	{
		id: "actions",
		header: "Actions",
		enableSorting: false,
		cell: ({ row }) => renderComponent(Actions, { id: row.id }),
	},
];
```

## Filter

```svelte
<script lang="ts">
	import type { FilterDef } from "$lib/components/ui/data-table";

	const filters: FilterDef[] = [
		{ id: "search", label: "Search", type: "text", placeholder: "Filter by name..." },
		{
			id: "role",
			label: "Role",
			type: "select",
			options: [
				{ label: "All", value: "" },
				{ label: "Admin", value: "admin" },
				{ label: "User", value: "user" },
			],
		},
	];
</script>

<DataTable {columns} {filters} data={users} totalRows={users.length} />
```

## Penggunaan Sisi-Server

Callback `onStateChange` menerima state tabel lengkap (sort, filter, paginasi), sehingga mudah menggerakkan pengambilan data sisi-server:

```svelte
<script lang="ts">
	let data: User[] = $state([]);
	let total = $state(0);
	let loading = $state(false);

	async function handleStateChange(state: TableState) {
		loading = true;
		const res = await fetch(
			`/api/users?${new URLSearchParams({
				page: String(state.pagination.page),
				pageSize: String(state.pagination.pageSize),
				sortBy: state.sort?.id ?? "",
				sortDesc: String(state.sort?.desc ?? false),
				...state.filters,
			})}`,
		);
		const json = await res.json();
		data = json.rows;
		total = json.total;
		loading = false;
	}
</script>

<DataTable {columns} {data} totalRows={total} {loading} onStateChange={handleStateChange} />
```
