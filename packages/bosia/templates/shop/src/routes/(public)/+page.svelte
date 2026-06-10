<main class="flex min-h-[80vh] flex-col items-center justify-center gap-6 p-8">
	<div class="flex flex-col items-center gap-3 text-center">
		<img src="/favicon.svg" alt="" class="size-16" />
		<h1 class="text-4xl font-bold tracking-tight">Welcome to your shop</h1>
		<p class="text-muted-foreground text-lg">
			A Bosia shop starter — auth, RBAC, S3 uploads, products & cart.
		</p>
	</div>

	<div class="mt-4 flex gap-3">
		<a
			href="/products"
			class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
		>
			Browse products
		</a>
		<a
			href="/login"
			class="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
		>
			Sign in
		</a>
	</div>

	<p class="text-muted-foreground mt-6 text-sm">
		Edit <code class="bg-muted rounded px-1 py-0.5 font-mono text-xs"
			>src/routes/(public)/+page.svelte</code
		> to get started
	</p>
</main>
