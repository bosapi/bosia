<script lang="ts">
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import { Button } from "$lib/components/ui/button";
	import { Kbd } from "$lib/components/ui/kbd";
	import { Separator } from "$lib/components/ui/separator";

	let {
		data,
		children,
	}: {
		data: { nav: Array<{ section: string; items: Array<{ href: string; label: string }> }> };
		children: any;
	} = $props();
	let activePath = $state("");
</script>

<div class="flex min-h-svh flex-col bg-background text-foreground">
	<header
		class="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background px-6"
	>
		<a href="/docs" class="font-semibold">Bosia Docs</a>
		<div class="ml-auto">
			<Button variant="outline" size="sm" class="gap-2">
				<span class="text-muted-foreground">Search…</span>
				<Kbd>⌘K</Kbd>
			</Button>
		</div>
	</header>

	<div class="flex flex-1">
		<aside class="hidden w-60 shrink-0 border-r border-border lg:block">
			<ScrollArea class="h-[calc(100svh-3.5rem)]">
				<nav class="p-4 text-sm">
					{#each data.nav as section (section.section)}
						<div class="mb-6">
							<div
								class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
							>
								{section.section}
							</div>
							<ul class="space-y-1">
								{#each section.items as item (item.href)}
									<li>
										<a
											href={item.href}
											class="block rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground {activePath ===
											item.href
												? 'bg-accent text-accent-foreground'
												: 'text-foreground'}"
										>
											{item.label}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</nav>
			</ScrollArea>
		</aside>

		<main class="flex-1 px-6 py-10">
			<article class="mx-auto max-w-[70ch] prose prose-neutral">
				{@render children()}
			</article>
		</main>

		<aside class="hidden w-52 shrink-0 border-l border-border xl:block">
			<div class="sticky top-14 p-4 text-sm">
				<div
					class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
				>
					On this page
				</div>
				<ul class="space-y-1 text-muted-foreground">
					<li><a href="#intro" class="hover:text-foreground">Introduction</a></li>
					<li><a href="#install" class="hover:text-foreground">Install</a></li>
					<li><a href="#usage" class="hover:text-foreground">Usage</a></li>
				</ul>
			</div>
		</aside>
	</div>
</div>
