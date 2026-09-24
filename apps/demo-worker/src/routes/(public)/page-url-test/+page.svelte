<script lang="ts">
	import { page } from "bosia/client";
</script>

<h1 class="text-2xl font-bold">page.url during SSR</h1>

<p class="mt-2 text-sm text-muted-foreground">
	Every value below is rendered on the server. View source and you will see the same strings that
	are in the DOM — before 0.9.4 the server said <code>http://localhost/</code> and the nav above highlighted
	"Home" until hydration corrected it.
</p>

<dl class="mt-6 grid grid-cols-[10rem_1fr] gap-2 font-mono text-sm">
	<dt class="text-muted-foreground">pathname</dt>
	<dd data-probe="pathname">{page.url.pathname}</dd>

	<dt class="text-muted-foreground">href</dt>
	<dd data-probe="href" class="break-all">{page.url.href}</dd>

	<dt class="text-muted-foreground">origin</dt>
	<dd data-probe="origin">{page.url.origin}</dd>

	<dt class="text-muted-foreground">search</dt>
	<dd data-probe="search">{page.url.search || "(none)"}</dd>
</dl>

<p class="mt-6 text-sm">
	Try <a class="underline" href="/page-url-test?tab=roles">?tab=roles</a> — the query string is in the
	server HTML too.
</p>
