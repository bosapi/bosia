# Chat form — design principles

## Why disable submit, not input

Users compose the next message while the previous one streams. Disabling the input forces them to wait — but the stream may take 30+ seconds for long completions. Keep the input live; gate only the submit so a second request can't fire in parallel.

## Why optimistic clear

The visible delay between "I pressed send" and "my message rendered in the feed" is the perceived latency of the whole product. Clearing the input the instant the form submits hides the network round-trip behind the user's own action.

## Why trim before check

Production chats see a steady trickle of accidental sends: `\n` from a misfire, ` ` from a stuck spacebar. Trim + length-check filters these without surfacing an error.

## Why duplicate-send is the #1 chat bug

Without a `disabled={busy}` gate on submit, hitting Enter twice in quick succession before `chat.status` flips to `submitted` spawns two parallel requests. The AI SDK does not deduplicate — both calls hit the LLM and bill twice. The user sees their message rendered twice and a confused response.

The fix is a single line. Forgetting it is universal.

## Why Enter / Shift+Enter (textarea variant)

Slack, Discord, ChatGPT, Claude — all use Enter to send, Shift+Enter for newline. Users will type Enter and expect send. A textarea's default Enter-inserts-newline behavior surprises them.

`isComposing` guards against IME (Japanese, Chinese, Korean) composition: Enter mid-composition commits the candidate, not the message. Skip the guard and you alienate every IME user.

## a11y — label vs placeholder

A placeholder is not a label. Screen readers do not always announce it. It vanishes the moment the user starts typing, removing context for anyone who pauses mid-message. Either `<label>` or `aria-label` is mandatory for the composer.

## Upstream

- Anthropic `claude.ai` chat composer — the disable-submit / live-input pattern.
- Vercel `ai-chatbot` reference — the optimistic-clear-before-await rule.
