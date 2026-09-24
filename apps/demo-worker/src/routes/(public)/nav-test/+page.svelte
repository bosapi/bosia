<script lang="ts">
	import { goto, beforeNavigate, afterNavigate } from "bosia/client";

	let log = $state<string[]>([]);
	let blockNext = $state(false);

	function note(msg: string) {
		log = [`${new Date().toLocaleTimeString()} — ${msg}`, ...log].slice(0, 20);
	}

	beforeNavigate((nav) => {
		if (blockNext && !nav.willUnload) {
			nav.cancel();
			blockNext = false;
			note(`beforeNavigate: cancelled nav to ${nav.to?.url.pathname}`);
		} else {
			note(`beforeNavigate: ${nav.type} → ${nav.to?.url.pathname ?? "(unload)"}`);
		}
	});

	afterNavigate((nav) => {
		note(`afterNavigate: ${nav.type} → ${nav.to?.url.pathname}`);
	});

	async function go(url: string, opts: Parameters<typeof goto>[1] = {}) {
		note(`goto(${url}, ${JSON.stringify(opts)})`);
		await goto(url, opts);
		note(`goto resolved`);
	}
</script>

<svelte:head>
	<title>Navigation Test | Bosia Demo</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
	<h1 class="text-3xl font-bold">Navigation patterns</h1>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">1. Plain &lt;a href&gt;</h2>
		<div class="flex gap-2">
			<a href="/about" class="underline">/about</a>
			<a href="/blog" class="underline">/blog</a>
		</div>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">2. goto()</h2>
		<div class="flex flex-wrap gap-2">
			<button class="border px-3 py-1 rounded" onclick={() => go("/about")}> goto /about </button>
			<button class="border px-3 py-1 rounded" onclick={() => go("/about", { replaceState: true })}>
				goto /about (replaceState)
			</button>
			<button class="border px-3 py-1 rounded" onclick={() => go("/blog", { invalidateAll: true })}>
				goto /blog (invalidateAll)
			</button>
			<button class="border px-3 py-1 rounded" onclick={() => go("/about", { noScroll: true })}>
				goto /about (noScroll)
			</button>
		</div>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">3. beforeNavigate cancel</h2>
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={blockNext} />
			Block the next navigation
		</label>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">4. Full reload</h2>
		<button
			class="border px-3 py-1 rounded"
			onclick={() => {
				window.location.href = "/";
			}}
		>
			window.location.href = "/"
		</button>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-semibold">Event log</h2>
		<ol class="text-sm space-y-1 font-mono">
			{#each log as line}
				<li>{line}</li>
			{/each}
		</ol>
	</section>
</div>
