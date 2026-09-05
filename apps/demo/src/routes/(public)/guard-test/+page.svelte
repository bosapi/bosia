<script lang="ts">
	// Clicking the link below is the path that used to fail: the router fetches
	// /__bosia/data/guard-test/panel.json, the hook refuses it, and before 0.9.5
	// the refusal came back as "500 Internal Server Error". Typing the URL in the
	// address bar always worked — that asymmetry was the bug.
</script>

<section class="mx-auto max-w-2xl space-y-4 px-4 py-10">
	<h1 class="text-2xl font-bold">Hook guard</h1>
	<p class="text-muted-foreground">
		<code>/guard-test/panel</code> is gated in <code>src/hooks.server.ts</code>. Both routes below
		lead to the same place; only the first one goes through the client router.
	</p>

	<div class="flex flex-col gap-2">
		<a class="underline" href="/guard-test/panel">Click through (client navigation)</a>
		<a class="underline" href="/guard-test/panel" rel="external">Hard load (full page request)</a>
	</div>

	<p class="text-sm text-muted-foreground">
		Both should land on the login page. Neither should show an error, and the panel's loader data
		must not appear in either response.
	</p>
</section>
