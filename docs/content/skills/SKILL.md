---
name: bosia-skills-catalog
description: Top-level index of 34 Bosia skills the LLM consults when generating Bosia projects. Two tracks — design (✦) governs visual output, framework (·) governs code correctness. Brief intake (✦) runs once per app before any UI emit.
od:
    mode: catalog
    category: index
---

# Bosia Skills Catalog

34 skills the AI uses when generating Bosia projects. Adapted from `nexu-io/open-design` `SKILL.md` format; bodies rewritten for Bosia's multi-file Bun + Svelte 5 Runes + Elysia output.

## Usage

- LLM calls `list_skills()` → reads this index.
- Picks a skill by trigger phrase, mode, or track.
- Calls `read_skill(name)` → full body + references + example.
- Follows that skill's workflow + checklist gate before emitting code.

## Tracks

- **Design skills (✦)** — apply on every UI-emitting task, **including Bosapi's own views** (login, project list, editor pane).
- **Framework skills (·)** — apply on every task. Code correctness, routing, data, RBAC, security.

Design skills carry a `references/design-principles.md` file tracing rules back to open-design upstreams (`frontend-design`, `ui-skills`).

---

## Brief intake — design ✦ — run once per app before any UI emit

| Name                   | Triggers                                        | Captures                                                                                                                                                              |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bosia-brief-intake`   | "new app", "first message", "brief"             | Orchestrator. Walks the four groups + frontend-design stance, writes `BRIEF.md`, runs `bosia-brief-review`.                                                           |
| `bosia-brief-identity` | "identity", "audience", "language", "formality" | Name, tagline, audience, language, formality, self-reference. Locks sapaan + UI string language.                                                                      |
| `bosia-brief-voice`    | "voice", "tone", "microcopy", "emoji policy"    | Tone adjectives, emoji/exclamation policy, microcopy spine table (empty/error/confirm/success/primary).                                                               |
| `bosia-brief-visual`   | "palette", "theme", "typography", "icons"       | Palette intent → theme pick, shape, density, type, icons. Runs `bosia_add_theme`. Hands off to stance step.                                                           |
| `bosia-brief-platform` | "platform", "id format", "first screens"        | Form factors, ID/number/date formatters, imagery, first screens, MVP features. Runs `bosia_add_block`.                                                                |
| `bosia-brief-review`   | "brief review", "before first build"            | Quality gate. Confirms BRIEF.md complete (incl. § Aesthetic stance, distinctive fonts wired, accent override applied), formatters scaffolded, no sapaan/policy drift. |

> Note: intake step 4 also invokes `bosia-frontend-design` (listed under design conventions). The stance step writes the `## Aesthetic` section of BRIEF.md and is what `bosia-brief-review` B18–B20 enforce.

## Page scaffolds — design ✦ — pick one as starting point for a new route

| Name                  | Triggers                                             | Registry deps                                                                |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `bosia-landing`       | "landing page", "marketing page"                     | `blocks/cards/feature-editorial`, `theme/editorial`, `ui/button`, `ui/badge` |
| `bosia-saas-landing`  | "saas landing", "marketing site", "saas homepage"    | + `ui/card`, `ui/separator`                                                  |
| `bosia-dashboard`     | "admin dashboard", "app dashboard", "sidebar layout" | `ui/sidebar`, `ui/data-table`, `ui/card`, `ui/chart`, `theme/neutral`        |
| `bosia-docs-site`     | "docs site", "documentation", "3-column docs"        | `ui/sidebar`, `ui/typography`, `ui/separator`                                |
| `bosia-blog`          | "blog", "editorial site", "article pages"            | `ui/typography`, `ui/card`, `theme/editorial`                                |
| `bosia-pricing`       | "pricing page", "pricing tiers", "compare plans"     | `ui/card`, `ui/table`, `ui/badge`, `ui/accordion`                            |
| `bosia-mobile-screen` | "mobile screen", "375px", "mobile-first"             | `ui/button`, `ui/input`, `ui/dialog`                                         |

## Flows — design ✦ — UX-heavy multi-route patterns

| Name                    | Triggers                                       | Registry deps                         |
| ----------------------- | ---------------------------------------------- | ------------------------------------- |
| `bosia-onboarding-flow` | "onboarding", "first-run", "wizard"            | `ui/progress`, `ui/button`, `ui/form` |
| `bosia-checkout-flow`   | "checkout", "cart to payment", "purchase flow" | `ui/form`, `ui/card`, `ui/separator`  |

## Flows — framework · — data + auth multi-route patterns

| Name              | Triggers                                      | Registry deps                                           |
| ----------------- | --------------------------------------------- | ------------------------------------------------------- |
| `bosia-auth-flow` | "login", "register", "auth", "sign-in"        | `feat/drizzle`, `ui/form`, `ui/field`, `ui/input`       |
| `bosia-crud-flow` | "crud", "resource", "list create edit delete" | `feat/drizzle`, `ui/data-table`, `ui/dialog`, `ui/form` |

## Conventions — design ✦ — always-active design system rules

| Name                    | Rule                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bosia-theme-tokens`    | Semantic Tailwind tokens only — `bg-card`/`text-foreground`/`border-border`. Never raw colors. Theme swappable via `tokens.css`.                     |
| `bosia-app-css`         | Canonical `src/app.css` order. `@import url(...)` (fonts) first or LightningCSS drops them. Fonts via theme tokens (`--font-display`/`--font-body`). |
| `bosia-block-compose`   | Registry-first — call `list_registry()`, prefer blocks over hand-rolling. If no block fits, compose from `ui/*` primitives.                          |
| `bosia-frontend-design` | Commit to a BOLD aesthetic direction before any UI emit. Distinctive type, dominant color + sharp accent, one memorable detail. Avoid AI defaults.   |

## Conventions — framework · — always-active code rules

| Name                           | Rule                                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `bosia-engineering-discipline` | Think before coding, simplicity first, surgical changes, goal-driven execution. Applies before every other skill's workflow.        |
| `bosia-routing`                | `+page.svelte` registers the route. Folder with only `+page.server.ts` 404s. Use `+server.ts` for action-only endpoints.            |
| `bosia-svelte-runes`           | Svelte 5 Runes — `$state` / `$derived` / `$effect` / `$props`. Never legacy `let`-reactivity, `$:`, or stores when runes work.      |
| `bosia-elysia-routes`          | `+server.ts` shape — `{ body }: { body: T }` parsing, return plain objects or `new Response()` for status codes. No Express idioms. |
| `bosia-rbac-permission`        | Always `can('resource.action', scope?)`. Never `if (role === 'admin')`. Resources in `lib/rbac/resources.ts`.                       |
| `bosia-drizzle-feature`        | `*.table.ts` + service + idempotent numbered seeds. Never edit applied seeds — add a new numbered file.                             |

## Quality gates — design ✦ — run before emitting any UI

| Name                         | Catches                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `bosia-design-review`        | Semantic tokens, Runes, empty/loading/error coverage, mobile-safe, typography hierarchy. |
| `bosia-accessibility-review` | Labels, focus rings, keyboard nav, ARIA only when needed, contrast ≥4.5:1.               |

## Quality gates — framework · — run before finalizing auth/data changes

| Name                    | Catches                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `bosia-security-review` | RBAC on every protected route, input validation at boundaries, no secrets in client, path-jail on FS ops, CSRF via origin guard. |

## Composition helpers

| Name                      | Track | Purpose                                                                                            |
| ------------------------- | ----- | -------------------------------------------------------------------------------------------------- |
| `bosia-empty-states`      | ✦     | `ui/empty`, `ui/skeleton`, `ui/spinner`, error boundary. Never blank screen on async failure.      |
| `bosia-chat-form`         | ✦     | Chat composer — `ui/textarea` + `ui/button`, Enter/Shift+Enter IME-safe, disable-submit-on-stream. |
| `bosia-chat-message-list` | ✦     | Chat feed — role markers, `parts[]` + inline markdown (bold/italic/link), respectful auto-scroll.  |
| `bosia-inspector-edit`    | ·     | Parse `[Inspector] file:line — comment` → surgical `fs_edit` scoped to the named node.             |

---

## Discovery order

When emitting code:

0. **Always-on behavioral guardrails.** `bosia-engineering-discipline` applies to every emit — think before coding, minimal scope, surgical edits, verifiable goals.
1. **First touch of a Bosia app?** Check for `BRIEF.md` at app root. If missing or `## Status: pending`: run `bosia-brief-intake` to completion BEFORE anything below. Intake includes the `bosia-frontend-design` stance step — BRIEF.md must end with a populated `## Aesthetic` section. Re-read BRIEF.md at the start of every later session.
2. Apply relevant **framework conventions** unconditionally (`bosia-routing`, `bosia-svelte-runes`, `bosia-elysia-routes`, `bosia-rbac-permission`, `bosia-drizzle-feature`).
3. If emitting UI, apply **design conventions** (`bosia-theme-tokens`, `bosia-block-compose`, `bosia-frontend-design`) — all honor decisions locked in BRIEF.md. `bosia-frontend-design` commits the aesthetic stance before any scaffold runs.
4. Pick a **page scaffold** or **flow** matching the user request.
5. Compose with helpers (`bosia-empty-states`).
6. Run **quality gates** before finalizing: design gates for UI, `bosia-security-review` for auth/data.

## Registry install rule (applies to every skill)

- `bosia_add`: **1–3 components per call.** Never 4+. Split into multiple calls.
- `bosia_add_block`: **one block per call.** Never batch blocks.
- `bosia_add_theme`: one theme per call (only one is active anyway).

Reason: each call shells out to `bunx bosia add` which downloads + writes registry files. Big batches push tool execution past the chat streaming idle window and the user sees "Load failed" mid-flow. Prefer many small calls (the registry caches between calls; cumulative cost is similar).
