---
name: bosia-chat-form
description: Chat composer — text input + submit button with disabled-during-stream gating, trim-empty guard, optimistic input clear, a11y labels.
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
        components: [ui/input, ui/button]
        feats: []
    targets:
        routes: []
    stack: [svelte-5-runes, tailwind-v4]
---

# bosia-chat-form

## What it builds

The input row at the bottom of a chat surface — text field + submit button. Wired to an `@ai-sdk/svelte` `Chat` instance (or any async `sendMessage` handler) with the gating + a11y rules a production chat needs.

## When to use

Any view that lets the user send a message to an AI / human / queue and gets a streamed or async response. Pairs with `bosia-chat-message-list` on the same surface.

## The contract

For any chat composer:

```
chat.status === "ready"           → input enabled, submit enabled
chat.status === "submitted"       → input enabled, submit disabled (request in-flight, no stream yet)
chat.status === "streaming"       → input enabled, submit disabled (tokens arriving)
chat.status === "error"           → input enabled, submit enabled (let user retry)
text trimmed to ""                → submit disabled
keyboard: Enter submits, Shift+Enter newline (only if textarea)
```

Skip none. The "disable during stream" branch is the one most often missed and produces duplicate sends.

## Required registry items

- `ui/input` — single-line composer (or `ui/textarea` if multi-line needed).
- `ui/button` — submit.

Install:

```bash
bosia add ui/input ui/button
```

## Pattern — single-line composer

```svelte
<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import type { Chat } from "@ai-sdk/svelte";

	let { chat }: { chat: Chat } = $props();
	let text = $state("");

	const busy = $derived(chat.status === "submitted" || chat.status === "streaming");

	async function send(e: Event) {
		e.preventDefault();
		const t = text.trim();
		if (!t || busy) return;
		text = "";
		await chat.sendMessage({ text: t });
	}
</script>

<form onsubmit={send} class="flex gap-2">
	<Input bind:value={text} placeholder="Tulis pesan..." aria-label="Pesan ke AI" />
	<Button type="submit" disabled={busy || text.trim().length === 0}>Kirim</Button>
</form>
```

See `example.svelte` for the multi-line + slash-command variant.

## Rules

### R1 — Always clear input before await

Optimistic clear before `await chat.sendMessage(...)` so the box is empty as soon as the user submits. Re-populate on error if you want to preserve typed text on failure.

### R2 — Trim before length-check

Empty whitespace-only sends are noise. Trim, then check `length === 0`. Do not send the trimmed value back into `bind:value`; let `sendMessage` receive the trimmed copy.

### R3 — Disable submit while in-flight

Both `submitted` and `streaming` count as in-flight. A second send while streaming spawns a parallel request — bug.

### R4 — Keep input enabled

Disable submit, not input. Users may want to type the next message while one streams; on `ready` the queued text flushes.

### R5 — a11y label, not just placeholder

`aria-label="Pesan ke AI"` (or `<label class="sr-only">`). Placeholder is not a label and disappears on focus.

### R6 — Enter submits, Shift+Enter newline (textarea only)

Single-line `Input` already submits on Enter via native form behavior. For `Textarea`, bind `onkeydown` and call `send` on Enter without Shift.

## Bosia conventions

- `bosia-svelte-runes` — `$state`, `$derived` only. No `export let`, no `$:`.
- `bosia-theme-tokens` — `bg-card`, `text-foreground`. No raw colors on the focus ring.
- `bosia-accessibility-review` — visible focus ring on Input + Button; label or `aria-label`; Enter submits.
- `bosia-design-review` — touch target ≥ 44px (`ui/button` default size meets this).

## Checklist gate

P0:

- [ ] Submit disabled during `submitted` + `streaming`.
- [ ] Empty / whitespace-only text cannot submit.
- [ ] Input cleared before `await sendMessage`.
- [ ] `aria-label` or visible label on the input.
- [ ] Enter key submits.

P1:

- [ ] Submit button shows spinner or label change during in-flight.
- [ ] On error, retry possible without re-typing (preserved value).
- [ ] Slash-command autocomplete uses `ui/command` if present.
- [ ] Multi-line variant uses `ui/textarea` with Enter / Shift+Enter rule.

## References

- `example.svelte` — multi-line composer with slash commands.
- `references/design-principles.md` — why disable submit not input + duplicate-send incidents.
