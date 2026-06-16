<script lang="ts">
	import { Search, Heart, User, ShoppingBag } from "@lucide/svelte";

	const cats = [
		{ label: "New" },
		{ label: "Women" },
		{ label: "Men" },
		{ label: "Home" },
		{ label: "Sale", sale: true },
	];
</script>

<header
	class="flex w-full items-center justify-between gap-5 border-b border-border bg-card px-6 text-card-foreground"
	style="height:68px"
>
	<div class="flex items-center gap-7">
		<a href="/" class="flex items-center gap-2.5">
			<div
				class="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
			>
				B
			</div>
			<span class="font-display text-lg font-extrabold tracking-tight">Brand</span>
		</a>
		<nav class="hidden items-center gap-5 md:flex">
			{#each cats as c (c.label)}
				<a
					href="/"
					class="text-sm font-medium {c.sale
						? 'text-destructive'
						: 'text-muted-foreground hover:text-foreground'}">{c.label}</a
				>
			{/each}
		</nav>
	</div>

	<div class="flex items-center gap-2">
		<label
			class="hidden h-9 w-48 items-center gap-2 rounded-md border border-border bg-muted px-3 text-muted-foreground sm:inline-flex"
		>
			<Search size={16} class="opacity-60" />
			<input
				type="search"
				placeholder="Search products"
				class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
			/>
		</label>
		<button
			type="button"
			class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
			aria-label="Wishlist"><Heart size={19} /></button
		>
		<button
			type="button"
			class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
			aria-label="Account"><User size={19} /></button
		>
		<button
			type="button"
			class="relative grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
			aria-label="Cart"
		>
			<ShoppingBag size={19} />
			<span
				class="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground"
				>2</span
			>
		</button>
	</div>
</header>
