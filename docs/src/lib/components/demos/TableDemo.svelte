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
	} from "$registry/table";

	const invoices = [
		{ invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
		{ invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
		{ invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
		{ invoice: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00" },
		{ invoice: "INV005", status: "Paid", method: "PayPal", amount: "$550.00" },
		{ invoice: "INV006", status: "Pending", method: "Bank Transfer", amount: "$200.00" },
		{ invoice: "INV007", status: "Unpaid", method: "Credit Card", amount: "$300.00" },
	];

	const total = "$2,500.00";
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
		{#each invoices as invoice (invoice.invoice)}
			<TableRow>
				<TableCell class="font-medium">{invoice.invoice}</TableCell>
				<TableCell>{invoice.status}</TableCell>
				<TableCell>{invoice.method}</TableCell>
				<TableCell class="text-right">{invoice.amount}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
	<TableFooter>
		<TableRow>
			<TableCell colspan={3}>Total</TableCell>
			<TableCell class="text-right">{total}</TableCell>
		</TableRow>
	</TableFooter>
</Table>
