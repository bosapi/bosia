<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	// Top-level browser-only access — would crash if SSR were enabled.
	const userAgent = window.navigator.userAgent;
	const screenSize = `${window.innerWidth}×${window.innerHeight}`;
	const mountedAt = new Date().toISOString();

	let count = $state(0);
</script>

<svelte:head>
	<title>SSR off — Bosia demo</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
	<h1 class="text-3xl font-bold">Page with <code>ssr = false</code></h1>

	<p class="text-muted-foreground">
		This page reads <code>window</code> at module top-level. If SSR ran on the server it would
		crash with <code>ReferenceError: window is not defined</code>. It works because
		<code>+page.server.ts</code>
		exports <code>ssr = false</code>.
	</p>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">Server load() data</h2>
		<pre class="rounded bg-muted p-3 text-sm">{JSON.stringify(data, null, 2)}</pre>
		<p class="text-xs text-muted-foreground">
			Server still ran <code>load()</code> — its return value is injected as
			<code>__BOSIA_PAGE_DATA__</code> and consumed during client mount.
		</p>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">Browser-only state</h2>
		<ul class="text-sm space-y-1">
			<li><b>Mounted at:</b> {mountedAt}</li>
			<li><b>Screen:</b> {screenSize}</li>
			<li><b>UA:</b> <span class="break-all">{userAgent}</span></li>
		</ul>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">Reactivity check</h2>
		<button
			type="button"
			class="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm"
			onclick={() => count++}
		>
			count = {count}
		</button>
	</section>

	<section class="space-y-2 border-t pt-4 text-sm text-muted-foreground">
		<h2 class="text-base font-semibold text-foreground">Verification checklist</h2>
		<ol class="list-decimal pl-5 space-y-1">
			<li>
				View source — <code>&lt;div id="app"&gt;&lt;/div&gt;</code> is empty (no SSR body).
			</li>
			<li>
				View source — script contains <code>window.__BOSIA_SSR__=false</code> and the
				<code>load()</code> data.
			</li>
			<li>Page renders after hydration with no SSR mismatch warnings in the console.</li>
			<li>
				Other pages (e.g. <code>/</code>) still SSR normally — view source shows rendered
				markup.
			</li>
		</ol>
	</section>
</div>
