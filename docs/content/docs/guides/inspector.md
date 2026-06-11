---
title: Inspector
description: Alt+click any element in your dev page to jump to its source — or hand off to an AI agent.
---

The inspector plugin turns every rendered element into a link to its source. Hold **Option** (Alt) to highlight elements; click one to open its `.svelte` file at the exact line in your editor. Optionally, configure an AI endpoint to send a short comment alongside the location for automated code-fixing handoff.

It's a first-party plugin — no install. Works through compile-time attribute injection: every regular HTML element in your `.svelte` files is annotated with `data-bosia-loc="path:line:col"` during the dev build. The plugin additionally brackets every `<Component>`, `<svelte:component>`, and `<svelte:self>` invocation with `<!--bosia:o=…--> … <!--bosia:c-->` comment markers, so the overlay can reconstruct the full **component call-site chain** (e.g. `+page.svelte:42 → Button.svelte:5`) — useful when the clicked element actually lives inside a shared component but you want to edit the page that rendered it. Production builds inject nothing and mount no endpoint.

## Setup

New projects scaffolded with `bun create bosia` (any template — `default`, `demo`, or `shop`) already ship a `bosia.config.ts` with `inspector({ editor: "code" })` enabled — skip this section unless you're adding it to an existing project or want to change the editor.

Add `inspector()` to your `bosia.config.ts`:

```ts
import { defineConfig } from "bosia";
import { inspector } from "bosia/plugins/inspector";

export default defineConfig({
	plugins: [inspector()],
});
```

Run `bun run dev` and you're done. Defaults: editor `code`, no AI endpoint.

## Usage

- **Option + hover** — outline + tooltip showing the full component call-site chain (`+page.svelte:42 → Button.svelte:5`), or just `file:line` for elements that aren't nested inside a component
- **Option + click** — open the leaf source location in your editor (or open the AI form, if `aiEndpoint` is set)
- **Esc** — dismiss the AI form

## Options

```ts
inspector({
	editor: "cursor", // "code" | "cursor" | "zed" | any CLI
	aiEndpoint: "http://localhost:9999/fix", // optional — POST handoff
	endpoint: "/__bosia/locate", // overlay → server endpoint (default)
});
```

### `editor`

CLI command used to open the file. Defaults to `code` (VS Code). Built-in support for `cursor` and `zed`. Any other editor that takes `<command> -g file:line:col` (or `<command> file:line:col` for zed-like CLIs) works — the plugin handles the argv shape automatically for the three known editors.

For VS Code: install the "Shell Command: Install 'code' command in PATH" command from the Command Palette so `code` resolves on `$PATH`.

### `aiEndpoint`

When set, Option+click opens an anchored form (textarea + Send/Cancel) instead of jumping to the editor. The form header pre-fills with the full component call-site chain so you can see exactly which page/layout context the AI will receive. On submit, the overlay POSTs to your AI endpoint:

```json
{
	"file": "registry/components/ui/button/Button.svelte",
	"line": 5,
	"col": 1,
	"comment": "Component tree (outer → leaf): src/routes/+page.svelte:42:5 → registry/components/ui/button/Button.svelte:5:1\n\nthis button should be disabled when loading"
}
```

The `file` / `line` / `col` still point at the leaf (where the actual `<button>` lives) so the editor-open fallback path is unchanged. The chain is prepended to `comment` so an AI agent receives the full render context and can edit the page rather than the shared component definition.

If the user submits an empty comment, the request falls back to opening the editor — handy for "I just want to jump there" without changing modes.

The plugin makes no assumption about the AI service; you implement the endpoint. Typical setup: a local script that takes the payload, runs your preferred coding agent against the file, and applies a patch.

## How It Works

1. **Compile-time injection.** The plugin contributes a Bun build plugin that runs before `SveltePlugin()`. For each `.svelte` file, it parses the source with `svelte/compiler`'s `parse()`, walks the AST, and uses `magic-string` to (a) insert a `data-bosia-loc` attribute right after each lowercase HTML tag name, and (b) bracket each `Component` / `SvelteComponent` / `SvelteSelf` invocation with `<!--bosia:o=path:line:col-->` / `<!--bosia:c-->` HTML comments. Comments survive into the rendered DOM because `preserveComments` is enabled in dev. Source maps are preserved so error stack traces in dev still point at the right line.

2. **Skipped tags.** Capitalized component tags (`<MyButton>`), `<svelte:*>` special elements, and `<script>` / `<style>` blocks don't get the `data-bosia-loc` attribute. Vite-style: clicking a `<button>` rendered inside a `<MyButton>` opens `MyButton.svelte` at the button's line, not the parent. The hover tooltip and the AI form additionally show the `<MyButton>` call-site chain reconstructed from the comment markers, so you always know which page rendered the element you're inspecting.

3. **Runtime overlay.** A small script is injected via `render.bodyEnd`. It listens for Alt-down + mousemove to draw the highlight, and Alt+click to trigger the action. The script reads `window.__BOSIA_INSPECTOR__` for config — no inline secrets.

4. **Server endpoint.** The plugin mounts `POST /__bosia/locate` via `backend.before`. With no comment, it spawns the editor command and returns. With a comment + `aiEndpoint`, it forwards the payload to your endpoint.

## Production

The plugin no-ops when `NODE_ENV !== "development"`:

- No attributes injected into the build output
- No overlay script in HTML
- No `/__bosia/locate` endpoint mounted

Verify with `bun run build && grep -rE "data-bosia-loc|bosia:o=" dist/` — should print nothing (neither the attribute injector nor the comment-marker injector runs in production).
