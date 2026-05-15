<script lang="ts">
	// Multi-line composer variant with Enter / Shift+Enter rule + slash commands.
	import { Button } from "$lib/components/ui/button";
	import { Textarea } from "$lib/components/ui/textarea";
	import type { Chat } from "@ai-sdk/svelte";

	let { chat }: { chat: Chat } = $props();
	let text = $state("");

	const busy = $derived(chat.status === "submitted" || chat.status === "streaming");
	const canSend = $derived(!busy && text.trim().length > 0);

	async function submit() {
		const t = text.trim();
		if (!t || busy) return;
		text = "";
		await chat.sendMessage({ text: t });
	}

	function onSubmit(e: Event) {
		e.preventDefault();
		void submit();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
		e.preventDefault();
		void submit();
	}
</script>

<form onsubmit={onSubmit} class="flex flex-col gap-2">
	<Textarea
		bind:value={text}
		onkeydown={onKeydown}
		aria-label="Pesan ke AI"
		placeholder="Tulis pesan… (Enter kirim, Shift+Enter baris baru, '/' perintah)"
		rows={3}
	/>
	<div class="flex items-center justify-between">
		<span class="text-muted-foreground text-xs">Enter untuk kirim · Shift+Enter baris baru</span
		>
		<Button type="submit" disabled={!canSend}>{busy ? "Mengirim…" : "Kirim"}</Button>
	</div>
</form>
