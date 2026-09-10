<script lang="ts">
	import { page } from "bosia/client";
	import type { LayoutData } from "../$types";

	let { children, data }: { children: any; data: LayoutData } = $props();

	// Active-link state sourced from `page.url.pathname`, per bosia-page-shell R6.
	// This is server-rendered: the correct item is already highlighted in the SSR
	// HTML, so there is no flash of "Home" before hydration.
	const links = [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About" },
		{ href: "/blog", label: "Blog" },
		{ href: "/all/foo/bar", label: "Catch-all" },
		{ href: "/ssr-off", label: "SSR off" },
		{ href: "/dedup-demo", label: "Dedup" },
		{ href: "/loading-test", label: "Loading" },
		{ href: "/set-headers-demo", label: "Headers" },
		{ href: "/page-url-test", label: "page.url" },
		{ href: "/guard-test", label: "Guard" },
		{ href: "/fouc-test", label: "FOUC" },
	];

	const isActive = (href: string, current: string) =>
		href === "/" ? current === "/" : current === href || current.startsWith(`${href}/`);
</script>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
		<nav class="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
			<a href="/" class="font-bold tracking-tight flex items-center gap-2"
				><img src="/favicon.svg" alt="" class="size-5" /> Bosia</a
			>
			{#each links as link (link.href)}
				{@const active = isActive(link.href, page.url.pathname)}
				<a
					href={link.href}
					data-nav={link.href}
					data-active={active}
					aria-current={active ? "page" : undefined}
					class="text-sm transition-colors hover:text-foreground {active
						? 'font-semibold text-foreground underline underline-offset-4'
						: 'text-muted-foreground'}">{link.label}</a
				>
			{/each}
			<a
				href="/api/hello"
				target="_blank"
				class="text-sm text-muted-foreground hover:text-foreground transition-colors">API</a
			>
		</nav>
	</header>

	<main class="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
		{@render children()}
	</main>

	<footer class="border-t py-4 text-center text-sm text-muted-foreground">
		Powered by Bosia
		{#if data.requestTime}
			<span class="ml-2 opacity-40 font-mono text-xs">
				req at {new Date(data.requestTime).toISOString()}
			</span>
		{/if}
	</footer>
</div>
