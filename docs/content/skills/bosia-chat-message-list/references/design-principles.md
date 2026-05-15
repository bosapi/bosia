# Chat message list — design principles

## Why `parts[]` beats `content`

A streamed AI message is not one string. It is a sequence of typed parts arriving in order: text tokens, tool calls, tool results, reasoning blocks, file references, citations.

A chat that only renders `m.content` (or the first text part) silently drops everything else. Tool outputs disappear. Reasoning is lost. The UI looks like the AI did nothing between the prompt and the answer.

Switching on `part.type` is the only way to render the full truth of what happened.

## Why auto-scroll keyed to length, not array

`$effect(() => { chat.messages; ... })` re-runs on every token tick. With a long stream, this fights the GPU — the scroll position is reassigned 60 times per second.

`$effect(() => { chat.messages.length; ... })` re-runs only when a new message appears. The streaming message itself stays at the bottom because tokens are appended to its existing object, not by pushing a new entry.

## Why respect user scroll

When the user scrolls up to read an earlier message, auto-scroll yanks them back to the bottom on the next token. Users abandon chats where this happens.

Track a `stickToBottom` flag: true while the user is at the bottom, false the moment they scroll up. Only force scroll when sticky. Re-sticky when the user scrolls back to the bottom themselves.

## Why tool calls collapse by default

A typical agent step is 200+ lines of JSON. Inline-rendered, it pushes the actual answer off-screen.

`<details>` is the cheapest progressive disclosure available — zero JS, zero ARIA work, full keyboard support. Curious users expand; everyone else sees a one-line summary.

## Why `aria-live="polite"` not `assertive`

`assertive` interrupts whatever the screen reader is saying — including the user's own typing in the composer. `polite` queues the announcement for the next pause. Chat is a polite medium.

## Why empty state with a body

A blank scroll region looks broken. Users who landed on a fresh thread don't know whether the app is loading, errored, or empty.

The empty state must do three things: name the absence ("Belum ada pesan"), explain how to start ("Tulis pertanyaan di kolom bawah"), and look intentional (use `ui/empty`, not naked text).

## Why never blank on error

A network error or model timeout is silent without a render branch. The user sees their last message and nothing happens. They send it again. Now there are two pending requests.

Render `chat.error.message` in a destructive style. Even a one-line "Gagal — coba lagi" is enough to convert silence into a recoverable state.

## Upstream

- Vercel `ai-chatbot` reference — `UIMessage.parts` pattern.
- Anthropic `claude.ai` — collapsed tool-use blocks, polite-live region.
- shadcn-svelte `ui/empty` — the empty-state primitive shape.
