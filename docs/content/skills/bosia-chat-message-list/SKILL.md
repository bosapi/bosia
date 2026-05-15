---
name: bosia-chat-message-list
description: Chat feed — scrollable region, role-tagged messages, multi-part rendering (text, reasoning, tool calls), auto-scroll on append, empty/streaming/error states.
triggers:
    - chat messages
    - chat feed
    - message list
    - message thread
    - conversation view
od:
    mode: composition
    category: design
bosia:
    design: true
    requires:
        blocks: []
        themes: []
        components: [ui/empty, ui/badge]
        feats: []
    targets:
        routes: []
    stack: [svelte-5-runes, tailwind-v4]
---

# bosia-chat-message-list

## What it builds

The scrollable feed above a `bosia-chat-form`. Renders an `@ai-sdk/svelte` `Chat.messages` array (or any `UIMessage[]`) with the rules a streaming chat surface needs: per-role styling, multi-part rendering (text + reasoning + tool calls), auto-scroll on append, and the four async branches (empty / streaming / error / content).

## When to use

Any view that renders a sequence of role-tagged messages from an AI conversation. Pairs with `bosia-chat-form` on the same surface.

## The contract

For any chat feed:

```
messages.length === 0           → <Empty …>  (icon + headline + body)
chat.status === "submitted"     → "Mengirim…" indicator at tail
chat.status === "streaming"     → "Menulis…" indicator at tail
chat.error                      → destructive error row + retry affordance (form-side)
otherwise                       → per-message render
```

Plus:

- Auto-scroll to bottom on new message append (`$effect` keyed to `messages.length`).
- Each message renders its `parts[]`, switching on `part.type`.

Skip none. The empty branch is the one most often missed — a blank scroll region looks broken.

## Required registry items

- `ui/empty` — empty-thread state.
- `ui/badge` — role markers (`Inspector`, `system`, `tool`).

Install:

```bash
bosia add ui/empty ui/badge
```

## Pattern — feed

```svelte
<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "$lib/components/ui/empty";
	import { renderInlineMd } from "$lib/markdown";
	import type { Chat } from "@ai-sdk/svelte";
	import type { UIMessage } from "ai";

	let { chat }: { chat: Chat } = $props();

	let scrollEl = $state<HTMLDivElement | null>(null);

	$effect(() => {
		chat.messages.length;
		if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
	});

	function isInspector(m: UIMessage): boolean {
		const first = m.parts.find((p) => p.type === "text");
		return !!first && first.type === "text" && first.text.startsWith("[Inspector] ");
	}
</script>

<div
	bind:this={scrollEl}
	aria-live="polite"
	class="border-border flex-1 overflow-y-auto rounded-md border p-3 text-sm"
>
	{#if chat.messages.length === 0}
		<Empty class="h-full border-0 p-4">
			<EmptyHeader>
				<EmptyTitle>Belum ada pesan</EmptyTitle>
				<EmptyDescription>Mulai percakapan di kolom bawah.</EmptyDescription>
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
						<div class="whitespace-pre-wrap">{@html renderInlineMd(p.text)}</div>
					{:else if p.type === "reasoning"}
						<div
							class="text-muted-foreground border-border mb-1 border-l-2 pl-2 text-xs italic"
						>
							{p.text}
						</div>
					{/if}
					<!-- tool-call branch: see example.svelte -->
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
```

See `example.svelte` for the full tool-call + reasoning + role-color variant.

## Rules

### R1 — Key each iteration

`{#each chat.messages as m (m.id)}` and `{#each m.parts as p, i (i)}`. Without keys, Svelte re-renders the whole list every stream tick — visible flicker + lost focus.

### R2 — Auto-scroll on append only

Read `chat.messages.length` (not the array itself) inside `$effect`. Subscribing to the whole array re-scrolls on every token tick, which fights the user if they scroll up to read older messages.

To respect user scroll position, check `scrollTop + clientHeight ≈ scrollHeight` before forcing scroll (P1).

### R3 — Render `parts[]`, not a single `content`

`UIMessage.parts` is an array — text, reasoning, tool calls, file attachments. A chat that only renders `m.content` (or the first text part) silently drops reasoning + tool output.

Switch on `part.type`:

- `"text"` → inline-markdown render (R3a), whitespace preserved on container.
- `"reasoning"` → muted italic block (collapsible if long), plain text.
- `"dynamic-tool"` or `"tool-*"` → `<ToolCall>` component (collapsible details).
- unknown → ignore (forward-compat).

### R3a — Inline markdown for text parts

LLM output ships `**bold**`, `*italic*`, and `[label](url)` constantly. Rendering them as raw asterisks is a visible defect.

Ship a tiny in-house renderer that covers **only** these three. Anything else (headings, code blocks, lists, tables, images) stays as plain text for now — add cases when the product needs them.

```ts
// $lib/markdown.ts
function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function safeUrl(href: string): string | null {
	const t = href.trim();
	return /^(https?:|mailto:|\/|#)/i.test(t) ? t : null;
}

export function renderInlineMd(raw: string): string {
	let s = escapeHtml(raw);
	s = s.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
	s = s.replace(/(^|[^*])\*([^*\s][^*\n]*?)\*(?!\*)/g, "$1<em>$2</em>");
	s = s.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (m, label: string, url: string) => {
		const safe = safeUrl(url);
		return safe
			? `<a href="${safe}" target="_blank" rel="noreferrer" class="underline">${label}</a>`
			: m;
	});
	return s;
}
```

Usage:

```svelte
<div class="whitespace-pre-wrap">{@html renderInlineMd(p.text)}</div>
```

Order matters: **escape first**, then bold (greedier than italic), then italic, then links. `safeUrl` blocks `javascript:` / `data:` schemes — never skip it. Do not pull in `marked` / `markdown-it` for these three cases — a regex pass is smaller, auditable, and adds zero deps.

### R4 — Tool calls go in `<details>`

Tool input + output JSON is verbose and rarely the user's focus. Collapse by default; let curious users expand. See `example.svelte`.

### R5 — Inspector badge for prefixed messages

If the first text part starts with `"[Inspector] "`, render a `<Badge>` next to the role. Lets the user see at a glance which messages came from an alt-click on the preview iframe.

### R6 — `aria-live="polite"` on the scroll region

Screen readers announce new messages without interrupting. `assertive` is too aggressive for chat.

### R7 — Empty state has a body

`"Belum ada pesan"` alone is failure. Add one sentence telling the user _how_ to start a message ("Tulis pertanyaan di kolom bawah" / "Alt-click elemen di pratinjau").

### R8 — Never blank on error

`chat.error` renders a destructive row. Do not throw the error away. The retry affordance lives in the composer (`bosia-chat-form`), not here.

## Bosia conventions

- `bosia-svelte-runes` — `$state` / `$derived` / `$effect` only.
- `bosia-theme-tokens` — `text-muted-foreground`, `text-destructive`, `bg-card`. No raw colors.
- `bosia-empty-states` — empty branch must cover headline + body.
- `bosia-accessibility-review` — `aria-live="polite"`; role indicator readable; focus order intact.
- `bosia-design-review` — auto-scroll respects user, tool calls collapsed by default.

## Checklist gate

P0:

- [ ] Empty state renders headline + body when `messages.length === 0`.
- [ ] Each message + part has a stable key.
- [ ] Auto-scroll keyed to `messages.length`, not the array.
- [ ] `parts[]` rendered — `text` + `reasoning` + tool parts each have a branch.
- [ ] Text parts pass through `renderInlineMd` (or equivalent) so `**bold**`, `*italic*`, `[link](url)` render correctly.
- [ ] Renderer escapes HTML before pattern-matching; link URLs gated by `safeUrl`.
- [ ] `chat.error` renders a destructive row.
- [ ] `aria-live="polite"` on the scroll container.

P1:

- [ ] Auto-scroll skipped when user has scrolled up.
- [ ] Tool calls collapsed in `<details>`.
- [ ] Inspector / system / tool roles get distinct badges.
- [ ] Long reasoning blocks collapsible.
- [ ] Code blocks in text parts get syntax highlighting (`ui/code-block`).

## References

- `example.svelte` — full feed with tool-call rendering, role colors, inspector badge.
- `references/design-principles.md` — why parts-array beats content-string + scroll respect rules.
