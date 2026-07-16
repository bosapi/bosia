<script lang="ts">
	const members = [
		{ name: "Jeki Maulana", role: "Founder & CEO", img: 12 },
		{ name: "Priya Shah", role: "Head of Design", img: 47 },
		{ name: "Marcus Lee", role: "Engineering Lead", img: 33 },
		{ name: "Elena Ruiz", role: "Product Manager", img: 24 },
		{ name: "Tom Becker", role: "Growth", img: 59 },
		{ name: "Aisha Khan", role: "Customer Success", img: 41 },
	];
</script>

<section class="w-full bg-background">
	<div class="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-2xl text-center">
			<span class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Team</span>
			<h2 class="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
				The people behind the product
			</h2>
			<p class="mt-4 text-muted-foreground">
				A small team that ships fast and answers its own support tickets.
			</p>
		</div>

		<div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each members as m (m.name)}
				<div
					class="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center text-card-foreground"
				>
					<img
						src="https://i.pravatar.cc/160?img={m.img}"
						alt={m.name}
						class="h-20 w-20 rounded-full object-cover"
						loading="lazy"
					/>
					<h3 class="mt-4 font-display text-base font-bold">{m.name}</h3>
					<p class="mt-1 text-sm text-muted-foreground">{m.role}</p>
					<div class="mt-4 flex gap-4 text-xs font-semibold text-muted-foreground">
						<a href="#linkedin" class="transition hover:text-primary">LinkedIn</a>
						<a href="#x" class="transition hover:text-primary">X</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
