<script lang="ts">
	// Regression demo: `/uploads/sample.webp` is served by
	// `src/routes/uploads/[...path]/+server.ts`, NOT the framework's static
	// fallthrough. Before bosia's pipeline reorder, isStaticPath(`.webp`)
	// intercepted this URL and returned 404 because the file lives outside
	// `public/`. Now API routes match first, so the +server.ts handler runs.
</script>

<div style="padding: 2rem; font-family: system-ui;">
	<h1>uploads route precedence demo</h1>
	<p>
		Source file: <code>uploads/sample.webp</code> (outside <code>public/</code>). Served by
		<code>src/routes/uploads/[...path]/+server.ts</code>.
	</p>
	<img
		src="/uploads/sample.webp"
		alt="served via +server.ts"
		style="max-width: 400px; border: 1px solid #ccc; margin-top: 1rem;"
	/>
	<p style="margin-top: 1rem;">
		If you see the image, API routes correctly shadow static fallthrough for extension-bearing URLs.
		Inspect the response — <code>X-Handler: uploads-route</code>
		confirms the +server.ts ran.
	</p>
</div>
