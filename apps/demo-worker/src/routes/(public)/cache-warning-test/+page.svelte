<script lang="ts">
	let { data } = $props();
</script>

<h1>Cache warning test</h1>
<p>
	This page's loader reads the cookie <code>my_app_sess</code>, which is not in
	<code>CACHE_KEYS</code>. Send it and the server logs a security warning:
</p>
<pre>curl -H 'Cookie: my_app_sess=abc' http://localhost:9002/cache-warning-test</pre>
<p>Loader saw: <code>{data.sess}</code></p>
