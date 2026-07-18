<script lang="ts">
	import { Dialog, DialogContent, DialogTitle } from "$registry/dialog";
	import { Command, CommandList, CommandEmpty, CommandItem } from "$registry/command";
	import { Search, FileText, Hash } from "@lucide/svelte";
	import type { Locale } from "$lib/docs/i18n";

	type Entry = {
		title: string;
		url: string;
		locale: Locale;
		headings: { text: string; id: string }[];
	};

	let { open = $bindable(false), locale }: { open?: boolean; locale: Locale } = $props();

	let index = $state<Entry[] | null>(null);
	let query = $state("");

	$effect(() => {
		if (open && !index) {
			fetch("/search-index.json")
				.then((r) => r.json())
				.then((data) => (index = data))
				.catch(() => (index = []));
		}
	});

	$effect(() => {
		if (!open) query = "";
	});

	// Filtering happens here, not in Command (filter={() => true}): registering all
	// 371 pages × headings as CommandItems would be wasteful; we render matches only.
	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!index || !q) return [];
		const out: { entry: Entry; headings: Entry["headings"] }[] = [];
		for (const entry of index) {
			if (entry.locale !== locale) continue;
			const titleHit = entry.title.toLowerCase().includes(q);
			const headings = entry.headings.filter((h) => h.text.toLowerCase().includes(q));
			if (!titleHit && headings.length === 0) continue;
			out.push({ entry, headings });
			if (out.length >= 20) break;
		}
		return out;
	});

	function onkeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			open = !open;
		}
	}

	function go(url: string) {
		open = false;
		// full page navigation, like every other link on the site; swap
		// for a client-side goto if Bosia grows one.
		window.location.href = url;
	}
</script>

<svelte:window {onkeydown} />

<Dialog bind:open>
	<DialogContent class="p-0">
		<DialogTitle class="sr-only">{locale === "id" ? "Cari" : "Search"}</DialogTitle>
		<Command filter={() => true}>
			<div class="flex items-center border-b px-3">
				<Search size={16} class="mr-2 shrink-0 opacity-50" aria-hidden="true" />
				<input
					type="text"
					role="combobox"
					aria-autocomplete="list"
					aria-expanded="true"
					autocomplete="off"
					autocorrect="off"
					spellcheck="false"
					bind:value={query}
					placeholder={locale === "id" ? "Cari dokumentasi..." : "Search docs..."}
					class="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
				/>
			</div>
			<CommandList>
				{#if query.trim()}
					<CommandEmpty>
						{locale === "id" ? "Tidak ada hasil." : "No results found."}
					</CommandEmpty>
					<!-- Re-key on query so items re-register in visual order (Command's
					     arrow-key order follows registration order). -->
					{#key query}
						{#each results as { entry, headings } (entry.url)}
							<CommandItem value={entry.url} onSelect={go}>
								<FileText size={16} class="shrink-0 opacity-60" aria-hidden="true" />
								{entry.title}
							</CommandItem>
							{#each headings as h (`${entry.url}#${h.id}`)}
								<CommandItem value={`${entry.url}#${h.id}`} onSelect={go} class="pl-8">
									<Hash size={14} class="shrink-0 opacity-60" aria-hidden="true" />
									{h.text}
								</CommandItem>
							{/each}
						{/each}
					{/key}
				{:else}
					<div class="py-6 text-center text-sm text-muted-foreground">
						{locale === "id"
							? "Ketik untuk mencari halaman dan bagian..."
							: "Type to search pages and sections..."}
					</div>
				{/if}
			</CommandList>
		</Command>
	</DialogContent>
</Dialog>
