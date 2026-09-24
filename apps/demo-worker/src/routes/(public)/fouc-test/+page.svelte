<script lang="ts">
	import type { PageProps } from "./$types";
	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>FOUC Test | Bosia Demo</title>
</svelte:head>

<!--
  Regression fixture for scoped-CSS delivery. Every rule below lives in this
  file's <style> block and nowhere else — no Tailwind utility does any of this
  layout. Until 0.9.6 that CSS shipped inside the JS bundle, so the SSR'd markup
  painted as a bare stack of text and only became this once hydration ran.

  How to check it by hand: load this page with JavaScript disabled. If the card
  is centred, tinted and rotated, the stylesheet reached the head. If it is a
  plain left-aligned stack, component CSS is riding on the JS bundle again.
-->
<div class="fouc-stage">
	<div class="fouc-card">
		<div class="fouc-seal"></div>
		<p class="fouc-eyebrow">scoped &lt;style&gt; only</p>
		<h1 class="fouc-title">No flash of unstyled content</h1>
		<p class="fouc-body">
			These rules come from this component's own <code>&lt;style&gt;</code> block. If you can see the
			tint, the rotation and the centring, they arrived as a render-blocking stylesheet rather than inside
			the JS bundle.
		</p>
		<p class="fouc-stamp">loaded at {data.loadedAt}</p>
	</div>
</div>

<style>
	.fouc-stage {
		display: grid;
		place-items: center;
		min-height: 60vh;
		padding: 2rem;
	}

	.fouc-card {
		max-width: 30rem;
		padding: 2rem;
		border-radius: 1rem;
		background: linear-gradient(140deg, #6d28d9, #2563eb);
		color: #fff;
		box-shadow: 0 24px 60px -20px rgba(37, 99, 235, 0.7);
		transform: rotate(-2deg);
		text-align: center;
	}

	/* Root-absolute url() inside a component's <style>. Under a BASE_PATH mount it
	   has to be rewritten to /<base>/favicon.svg, or it resolves against the
	   origin and silently 404s — the same rebase twHash does for Tailwind. */
	.fouc-seal {
		width: 2rem;
		height: 2rem;
		margin: 0 auto 0.75rem;
		background: url(/favicon.svg) center / contain no-repeat;
	}

	.fouc-eyebrow {
		margin: 0;
		font-family: ui-monospace, monospace;
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		opacity: 0.75;
	}

	.fouc-title {
		margin: 0.5rem 0 0;
		font-size: 1.9rem;
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.fouc-body {
		margin: 1rem 0 0;
		font-size: 0.95rem;
		line-height: 1.6;
		opacity: 0.9;
	}

	.fouc-body code {
		background: rgba(255, 255, 255, 0.18);
		padding: 0.1rem 0.35rem;
		border-radius: 0.3rem;
	}

	.fouc-stamp {
		margin: 1.25rem 0 0;
		font-family: ui-monospace, monospace;
		font-size: 0.7rem;
		opacity: 0.6;
	}
</style>
