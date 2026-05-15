<script lang="ts">
	// Full feed with tool-call rendering, role markers, inspector badge,
	// scroll-respect-user, and the four async branches.
	import { Badge } from "$lib/components/ui/badge";
	import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "$lib/components/ui/empty";
	import type { Chat } from "@ai-sdk/svelte";
	import type { UIMessage, UIMessagePart } from "ai";

	let { chat }: { chat: Chat } = $props();

	let scrollEl = $state<HTMLDivElement | null>(null);
	let stickToBottom = $state(true);

	function onScroll() {
		if (!scrollEl) return;
		const slack = 24;
		stickToBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - slack;
	}

	$effect(() => {
		chat.messages.length;
		if (scrollEl && stickToBottom) scrollEl.scrollTop = scrollEl.scrollHeight;
	});

	function isInspector(m: UIMessage): boolean {
		const first = m.parts.find((p) => p.type === "text");
		return !!first && first.type === "text" && first.text.startsWith("[Inspector] ");
	}

	type AnyPart = UIMessagePart<Record<string, unknown>, Record<string, never>>;
	type ToolPartView = {
		name: string;
		state: string;
		input: unknown;
		output?: unknown;
		errorText?: string;
	};

	function asToolPart(p: AnyPart): ToolPartView | null {
		if (typeof p.type !== "string") return null;
		if (p.type === "dynamic-tool") {
			const dp = p as unknown as {
				toolName: string;
				state: string;
				input?: unknown;
				output?: unknown;
				errorText?: string;
			};
			return {
				name: dp.toolName,
				state: dp.state,
				input: dp.input,
				output: dp.output,
				errorText: dp.errorText,
			};
		}
		if (p.type.startsWith("tool-")) {
			const tp = p as unknown as {
				type: string;
				state: string;
				input?: unknown;
				output?: unknown;
				errorText?: string;
			};
			return {
				name: tp.type.slice("tool-".length),
				state: tp.state,
				input: tp.input,
				output: tp.output,
				errorText: tp.errorText,
			};
		}
		return null;
	}
</script>

<div
	bind:this={scrollEl}
	onscroll={onScroll}
	aria-live="polite"
	class="border-border flex-1 overflow-y-auto rounded-md border p-3 text-sm"
>
	{#if chat.messages.length === 0}
		<Empty class="h-full border-0 p-4">
			<EmptyHeader>
				<EmptyTitle>Belum ada pesan</EmptyTitle>
				<EmptyDescription>
					Tulis pertanyaan di kolom bawah, atau alt-click elemen di pratinjau untuk
					meninggalkan catatan inspector.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	{:else}
		{#each chat.messages as m (m.id)}
			<div class="mb-3">
				<div class="text-muted-foreground mb-1 flex items-center gap-2 font-mono text-xs">
					<span>{m.role}</span>
					{#if isInspector(m)}
						<Badge variant="secondary" class="text-[10px] uppercase tracking-wide">
							Inspector
						</Badge>
					{/if}
				</div>
				{#each m.parts as p, i (i)}
					{#if p.type === "text"}
						<div class="whitespace-pre-wrap">{p.text}</div>
					{:else if p.type === "reasoning"}
						<div
							class="text-muted-foreground border-border mb-1 border-l-2 pl-2 text-xs italic"
						>
							{p.text}
						</div>
					{:else}
						{@const tp = asToolPart(p as AnyPart)}
						{#if tp}
							<details
								class="border-border bg-muted/30 my-2 rounded-md border text-xs"
							>
								<summary
									class="hover:bg-muted/50 cursor-pointer px-2 py-1 font-mono"
								>
									{tp.name}{tp.state === "output-error"
										? " — error"
										: tp.state === "output-available"
											? ""
											: ` — ${tp.state}`}
								</summary>
								<div class="border-border border-t p-2">
									<div class="text-muted-foreground mb-1">input</div>
									<pre
										class="overflow-x-auto whitespace-pre-wrap text-[11px]">{JSON.stringify(
											tp.input,
											null,
											2,
										)}</pre>
									{#if tp.errorText}
										<div class="text-destructive mt-2 whitespace-pre-wrap">
											{tp.errorText}
										</div>
									{:else if tp.output !== undefined}
										<div class="text-muted-foreground mt-2 mb-1">output</div>
										<pre
											class="overflow-x-auto whitespace-pre-wrap text-[11px]">{JSON.stringify(
												tp.output,
												null,
												2,
											)}</pre>
									{/if}
								</div>
							</details>
						{/if}
					{/if}
				{/each}
			</div>
		{/each}
	{/if}

	{#if chat.status === "submitted"}
		<p class="text-muted-foreground text-xs italic">Mengirim…</p>
	{:else if chat.status === "streaming"}
		<p class="text-muted-foreground text-xs italic">Menulis…</p>
	{/if}
	{#if chat.error}
		<p class="text-destructive text-xs">{chat.error.message}</p>
	{/if}
</div>
