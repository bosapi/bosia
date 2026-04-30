<script lang="ts">
	import { DataTable } from "$registry/data-table";
	import type { ColumnDef, FilterDef, TableState } from "$registry/data-table";

	type User = { name: string; email: string; role: string; status: string };

	const columns: ColumnDef<User>[] = [
		{ id: "name", accessorKey: "name", header: "Name" },
		{ id: "email", accessorKey: "email", header: "Email" },
		{ id: "role", accessorKey: "role", header: "Role", enableSorting: false },
		{ id: "status", accessorKey: "status", header: "Status", enableSorting: false },
	];

	const filters: FilterDef[] = [
		{ id: "search", label: "Search", type: "text", placeholder: "Filter by name..." },
	];

	const allUsers: User[] = [
		{ name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active" },
		{ name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active" },
		{ name: "Carol White", email: "carol@example.com", role: "Viewer", status: "Inactive" },
		{ name: "Dave Brown", email: "dave@example.com", role: "Editor", status: "Active" },
		{ name: "Eve Davis", email: "eve@example.com", role: "Admin", status: "Active" },
		{ name: "Frank Miller", email: "frank@example.com", role: "Viewer", status: "Inactive" },
	];

	let users: User[] = $state(allUsers);
	let total = $state(allUsers.length);

	function handleStateChange(state: TableState) {
		let result = [...allUsers];

		// Apply text filter
		const search = state.filters.search?.toLowerCase();
		if (search) {
			result = result.filter(
				(u) =>
					u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
			);
		}

		// Apply sort
		if (state.sort) {
			const key = state.sort.id as keyof User;
			const dir = state.sort.desc ? -1 : 1;
			result.sort((a, b) => String(a[key]).localeCompare(String(b[key])) * dir);
		}

		total = result.length;
		const start = (state.pagination.page - 1) * state.pagination.pageSize;
		users = result.slice(start, start + state.pagination.pageSize);
	}
</script>

<div class="w-full">
	<DataTable
		{columns}
		{filters}
		data={users}
		totalRows={total}
		pageSize={5}
		onStateChange={handleStateChange}
	/>
</div>
