---
name: bosia-chat-form
description: Chat composer — `ui/textarea` (auto-resize, Enter/Shift+Enter, IME-safe) + submit button. Disabled-during-stream gating, trim-empty guard, optimistic clear, a11y label.
triggers:
  - chat input
  - chat composer
  - message form
  - send message form
  - prompt input
od:
  mode: composition
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes: []
    components: [ui/textarea, ui/button]
    feats: []
  targets:
    routes: []
  stack: [svelte-5-runes, tailwind-v4]
---

# bosia-chat-form

## What it builds

The input row at the bottom of a chat surface — multi-line text area + submit button. Wired to an `@ai-sdk/svelte` `Chat` instance (or any async `sendMessage` handler) with the gating + a11y rules a production AI-agent chat needs (Claude / ChatGPT / Cursor style).

## When to use

Any view that lets the user send a message to an AI / human / queue and gets a streamed or async response. Pairs with `bosia-chat-message-list` on the same surface.

## The contract

For any chat composer:

```
chat.status === "ready"     → input enabled, submit enabled
chat.status === "submitted" → input enabled, submit disabled (request in-flight, no stream yet)
chat.status === "streaming" → input enabled, submit disabled (tokens arriving)
chat.status === "error"     → input enabled, submit enabled (let user retry)
text trimmed to ""          → submit disabled
keyboard: Enter submits, Shift+Enter newline, IME composing → no submit
```

Skip none. The "disable submit during stream" branch is the one most often missed and produces duplicate sends.

## Required registry items

- `ui/textarea` — multi-line composer with `field-sizing-content` (auto-grow to content).
- `ui/button` — submit.

Install:

```bash
bosia add ui/textarea ui/button
```

## Canonical pattern

```svelte
<script lang="ts">
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
		placeholder="Tulis pesan… (Enter kirim, Shift+Enter baris baru)"
		rows={2}
	/>
	<div class="flex items-center justify-between">
		<span class="text-muted-foreground text-xs"> Enter untuk kirim · Shift+Enter baris baru </span>
		<Button type="submit" disabled={!canSend}>{busy ? "Mengirim…" : "Kirim"}</Button>
	</div>
</form>
```

See `example.svelte` for the same pattern in a self-contained file.

## Rules

### R1 — Use `ui/textarea`, not `ui/input`

AI-agent chats always allow multi-line input. The registry `ui/textarea` ships with `field-sizing-content`, so the box grows with content up to the CSS max — no autosize hack needed. A single-line `ui/input` is wrong; it forces awkward shift-arrow scrolling for any message > one line.

### R2 — Enter submits, Shift+Enter newline, IME-safe

Native textarea Enter inserts a newline. Override:

```ts
if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
e.preventDefault();
void submit();
```

`isComposing` is mandatory — IME (Japanese / Chinese / Korean) users hit Enter to commit candidate characters mid-word. Without the guard, the message sends before the word is finished.

### R3 — Always clear input before await

Optimistic clear before `await chat.sendMessage(...)` so the box is empty as soon as the user submits. The user's message appears in the feed via `chat.messages` immediately.

### R4 — Trim before length-check

Empty whitespace-only sends are noise. Trim, then check `length === 0`. Pass the trimmed copy to `sendMessage`; leave the original `text` state alone (it was just cleared).

### R5 — Disable submit while in-flight, keep input live

Both `submitted` and `streaming` count as in-flight. Disable submit so a second send can't fire in parallel. Keep the textarea enabled so the user can type the next message while one streams.

### R6 — a11y label, not just placeholder

`aria-label="Pesan ke AI"` (or `<label class="sr-only">`). Placeholder is not a label and disappears on focus.

### R7 — Visible keyboard hint

A small caption beneath the textarea ("Enter untuk kirim · Shift+Enter baris baru") teaches the convention without a tooltip. Free a11y for keyboard users.

## Bosia conventions

- `bosia-svelte-runes` — `$state`, `$derived` only. No `export let`, no `$:`.
- `bosia-theme-tokens` — `text-muted-foreground`, `bg-background`. No raw colors.
- `bosia-accessibility-review` — visible focus ring (free from registry `ui/textarea`); `aria-label`; IME-safe Enter.
- `bosia-design-review` — textarea touch target ≥ 44px (default `min-h-16`).

## Checklist gate

P0:

- [ ] Composer uses `ui/textarea`, not `ui/input`.
- [ ] Enter submits; Shift+Enter inserts newline; `isComposing` guarded.
- [ ] Submit disabled during `submitted` + `streaming`.
- [ ] Empty / whitespace-only text cannot submit.
- [ ] Input cleared before `await sendMessage`.
- [ ] `aria-label` or visible label on the textarea.
- [ ] Textarea stays enabled while in-flight (user can queue next message).

P1:

- [ ] Visible keyboard hint near the textarea.
- [ ] Submit button label changes ("Mengirim…" while busy) or shows spinner.
- [ ] On error, retry possible without re-typing (preserved value).
- [ ] Slash-command autocomplete uses `ui/command` if present.
- [ ] Paste image / attach file affordance (P2 — needs separate skill).

## References

- `example.svelte` — canonical composer in a single file.
- `references/design-principles.md` — why textarea + disable-submit-not-input + IME-safe Enter.
