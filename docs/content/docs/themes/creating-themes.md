---
title: Creating themes
description: Author your own Bosia theme — token contract, file layout, and CLI integration.
---

## Token contract

Blocks consume these tokens by semantic name. As long as you define them, every block restyles automatically.

| Token                                               | Purpose                      |
| --------------------------------------------------- | ---------------------------- |
| `--color-background`                                | Page background              |
| `--color-foreground`                                | Default text                 |
| `--color-card` / `--color-card-foreground`          | Card surfaces                |
| `--color-primary` / `--color-primary-foreground`    | Primary CTAs                 |
| `--color-muted` / `--color-muted-foreground`        | Secondary text, dividers     |
| `--color-accent` / `--color-accent-foreground`      | Accent highlights            |
| `--color-border` / `--color-input` / `--color-ring` | Borders, inputs, focus rings |
| `--font-display`                                    | Headings (titles, eyebrows)  |
| `--font-body`                                       | Paragraphs                   |
| `--radius`                                          | Base radius                  |

Use HSL custom properties (`hsl(var(--card))`) so Tailwind opacity modifiers like `bg-card/80` keep working.

## File layout

```
registry/themes/<name>/
├── tokens.css     # @theme { … } + :root + .dark variables
└── meta.json      # name, description, files[], fonts{}, npmDeps{}
```

## meta.json

```json
{
	"name": "my-theme",
	"description": "Short description shown in docs.",
	"files": ["tokens.css"],
	"fonts": {
		"Family Name": "https://fonts.googleapis.com/css2?family=Family+Name&display=swap"
	},
	"npmDeps": {}
}
```

The `fonts` field auto-injects idempotent `@import url(...)` lines into `src/app.css` when the theme installs.

## Local install while authoring

From an app directory:

```bash
bun x bosia@latest add theme my-theme --local
```

`--local` resolves the registry from the workspace (`registry/themes/my-theme/`) instead of fetching from GitHub.

## Publish

Add `"my-theme"` to `registry/index.json` under `themes`, push to `main`.
