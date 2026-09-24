<script lang="ts">
	function clientThrow() {
		throw new Error("boom (client)");
	}

	function asyncReject() {
		Promise.reject(new Error("async boom"));
	}

	function delayedThrow() {
		setTimeout(() => {
			throw new Error("delayed");
		}, 100);
	}

	function loopThrow() {
		// 50× same error in a tight loop — exercises the 500ms dedup window.
		// Without dedup the badge would show 50 rows; with dedup it shows 1.
		for (let i = 0; i < 50; i++) {
			try {
				throw new Error("loop");
			} catch (e) {
				window.dispatchEvent(new ErrorEvent("error", { error: e, message: (e as Error).message }));
			}
		}
	}
</script>

<svelte:head>
	<title>Inspector errors test — Bosia demo</title>
</svelte:head>

<div class="space-y-6 max-w-2xl">
	<h1 class="text-3xl font-bold">Inspector — runtime error capture</h1>

	<p class="text-muted-foreground">
		Trigger each error class below and watch the bottom-right badge populate. Click the badge to
		expand the panel; click <b>Send to AI</b> on a row to POST to <code>aiEndpoint</code> — the demo
		handler at <code>/api/inspector-ai</code> logs the resolved source path to the dev terminal.
	</p>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Client</h2>
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm"
				onclick={clientThrow}
			>
				throw (sync)
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm"
				onclick={asyncReject}
			>
				unhandled rejection
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm"
				onclick={delayedThrow}
			>
				delayed throw (100ms)
			</button>
			<button
				type="button"
				class="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm"
				onclick={loopThrow}
			>
				50× loop (dedup)
			</button>
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Server</h2>
		<p class="text-sm text-muted-foreground">
			Navigate to <a class="underline" href="/errors-test/server-throw">/errors-test/server-throw</a
			>
			— the <code>+page.server.ts</code> <code>load()</code> throws; the inspector catches it via
			Elysia
			<code>.onError()</code> and pushes through SSE to all open tabs.
		</p>
	</section>

	<section class="space-y-2 border-t pt-4 text-sm text-muted-foreground">
		<h2 class="text-base font-semibold text-foreground">What to verify</h2>
		<ol class="list-decimal pl-5 space-y-1">
			<li>Each button click → badge increments within ~1s.</li>
			<li>50× loop → badge shows <b>1</b> row, not 50 (500ms dedup).</li>
			<li>
				Open this page in two tabs → server error from <code>/server-throw</code> shows in both.
			</li>
			<li>F5 reload → badge clears; recent server errors (≤30s) replay from buffer.</li>
			<li>
				Click <b>Send to AI</b> → demo terminal logs <code>🪲 inspector AI handoff</code>
				with a
				<code>src/...</code> path, not <code>.bosia/dev/...</code>.
			</li>
			<li>
				Click <b>Send to AI</b> on the delayed-throw row → comment includes
				<code>Last user interaction:</code> pointing at the button.
			</li>
		</ol>
	</section>
</div>
