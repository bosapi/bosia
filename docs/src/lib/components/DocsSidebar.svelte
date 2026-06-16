<script lang="ts">
	import type { NavGroup } from "$lib/docs/nav";
	import { localizeUrl, type Locale } from "$lib/docs/i18n";
	import { ChevronRight } from "@lucide/svelte";

	let {
		groups,
		currentSlug,
		locale,
		onnavigate,
	}: {
		groups: NavGroup[];
		currentSlug: string;
		locale: Locale;
		onnavigate?: () => void;
	} = $props();

	let open = $state<Record<string, boolean>>({});

	function isActive(slug: string): boolean {
		return currentSlug === slug;
	}

	function parentHasActive(item: { children?: { slug?: string }[] }): boolean {
		return item.children?.some((c) => isActive(c.slug ?? "")) ?? false;
	}

	function label(item: { label: string; labelId?: string }): string {
		return locale === "id" && item.labelId ? item.labelId : item.label;
	}
</script>

<nav class="flex flex-col gap-6 text-sm">
	{#each groups as group, gi}
		<div>
			<h4 class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{label(group)}
			</h4>
			<ul class="flex flex-col gap-0.5">
				{#each group.items as item, i}
					{#if item.children}
						{@const key = `${gi}-${i}`}
						{@const effectiveOpen = open[key] ?? parentHasActive(item)}
						<li>
							<button
								type="button"
								onclick={() => (open[key] = !effectiveOpen)}
								class="mt-2 flex w-full items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground/70 hover:text-foreground"
							>
								{label(item)}
								<ChevronRight
									class="h-3.5 w-3.5 transition-transform {effectiveOpen ? 'rotate-90' : ''}"
								/>
							</button>
							{#if effectiveOpen}
								<ul class="flex flex-col gap-0.5 pl-2">
									{#each item.children as child}
										<li>
											<a
												href={localizeUrl(child.slug ?? "", locale)}
												onclick={onnavigate}
												class="block rounded-md px-2 py-1.5 transition-colors {isActive(
													child.slug ?? '',
												)
													? 'bg-accent text-accent-foreground font-medium'
													: 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}"
											>
												{label(child)}
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{:else}
						<li>
							<a
								href={localizeUrl(item.slug ?? "", locale)}
								onclick={onnavigate}
								class="block rounded-md px-2 py-1.5 transition-colors {isActive(item.slug ?? '')
									? 'bg-accent text-accent-foreground font-medium'
									: 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}"
							>
								{label(item)}
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	{/each}
</nav>
