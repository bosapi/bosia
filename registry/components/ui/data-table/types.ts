import type { Component, Snippet } from "svelte";

// ---------------------------------------------------------------------------
// Cell / Header render descriptor
// ---------------------------------------------------------------------------

export type SnippetDescriptor = {
	type: "snippet";
	snippet: Snippet;
};

export type ComponentDescriptor = {
	type: "component";
	component: Component<any>;
	props: Record<string, any>;
};

export type RenderDescriptor = SnippetDescriptor | ComponentDescriptor;

// ---------------------------------------------------------------------------
// Column context types
// ---------------------------------------------------------------------------

export type CellContext<T> = {
	row: T;
	value: any;
	index: number;
};

export type HeaderContext<T> = {
	column: ColumnDef<T>;
	sorted: "asc" | "desc" | false;
};

// ---------------------------------------------------------------------------
// Column definition
// ---------------------------------------------------------------------------

export type ColumnDef<T> = {
	id: string;
	accessorKey?: keyof T & string;
	accessorFn?: (row: T) => any;

	/** Plain string for simple text, or a function returning a RenderDescriptor */
	header: string | ((ctx: HeaderContext<T>) => RenderDescriptor);

	/** Custom cell renderer. If omitted, the raw value is rendered as text. */
	cell?: (ctx: CellContext<T>) => RenderDescriptor;

	enableSorting?: boolean;
	class?: string;
	headerClass?: string;
};

// ---------------------------------------------------------------------------
// Filter definition
// ---------------------------------------------------------------------------

export type FilterDef = {
	id: string;
	label: string;
	type: "text" | "select" | "date";
	placeholder?: string;
	options?: { label: string; value: string }[];
};

// ---------------------------------------------------------------------------
// Table state
// ---------------------------------------------------------------------------

export type SortState = { id: string; desc: boolean } | null;

export type PaginationState = {
	page: number;
	pageSize: number;
};

export type TableState = {
	sort: SortState;
	filters: Record<string, string>;
	pagination: PaginationState;
};

// ---------------------------------------------------------------------------
// DataTable props
// ---------------------------------------------------------------------------

export type DataTableProps<T> = {
	columns: ColumnDef<T>[];
	filters?: FilterDef[];
	data: T[];
	totalRows: number;
	pageSize?: number;
	loading?: boolean;
	emptyMessage?: string;
	onStateChange?: (state: TableState) => void | Promise<void>;
	class?: string;
};
