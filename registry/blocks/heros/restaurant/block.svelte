<script lang="ts">
	import { Calendar, MapPin, Phone, Star } from "@lucide/svelte";
</script>

<section
	class="relative w-full overflow-hidden bg-foreground text-background"
	style="min-height:88vh"
>
	<!-- Photo + scrim -->
	<img
		src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600&q=80"
		alt=""
		loading="lazy"
		class="absolute inset-0 h-full w-full object-cover"
	/>
	<div
		class="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/55 to-foreground/15"
	></div>

	<div class="relative z-10 flex min-h-[88vh] flex-col">
		<!-- Content -->
		<div class="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-20">
			<div
				class="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-primary"
			>
				<span class="h-px w-8 bg-primary/60"></span> Seasonal · Wood-fired · Est. 2009
			</div>
			<h1
				class="max-w-2xl font-display text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl"
			>
				A table set around the fire.
			</h1>
			<p class="mt-5 max-w-lg text-lg text-background/80">
				Ingredient-led plates, an ever-changing menu, and a cellar worth lingering over. Twelve
				seats. Book ahead.
			</p>
			<div class="mt-8 flex flex-wrap gap-3.5">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:brightness-110"
				>
					<Calendar size={18} /> Reserve a table
				</button>
				<button
					type="button"
					class="rounded-lg border border-background/30 px-6 py-3 text-base font-semibold text-background hover:bg-background/10"
				>
					View the menu
				</button>
			</div>
			<div class="mt-9 flex flex-wrap items-center gap-7 text-sm text-background/80">
				<div class="flex items-center gap-2">
					<MapPin size={17} class="text-primary" /> 14 Kiln Lane, Eastside
				</div>
				<div class="flex items-center gap-2">
					<Phone size={16} class="text-primary" /> Tue–Sun · 5–11pm
				</div>
				<div class="flex items-center gap-2">
					<Star size={16} class="fill-primary text-primary" />
					<span class="font-semibold text-background">4.9</span> Michelin guide
				</div>
			</div>
		</div>
	</div>
</section>
