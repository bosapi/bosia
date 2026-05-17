---
name: bosia-skills-catalog
description: Top-level index of 31 Bosia skills the LLM consults when generating Bosia projects. Two tracks — design (✦) governs visual output, framework (·) governs code correctness. Brief intake (✦) runs once per app before any UI emit.
od:
    mode: catalog
    category: index
---

# Bosia Skills Catalog

31 skills the AI uses when generating Bosia projects. Adapted from `nexu-io/open-design` `SKILL.md` format; bodies rewritten for Bosia's multi-file Bun + Svelte 5 Runes + Elysia output.

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

| Name                   | Triggers                                        | Captures                                                                                                  |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `bosia-brief-intake`   | "new app", "first message", "brief"             | Orchestrator. Walks the four groups, writes `BRIEF.md`, runs `bosia-brief-review`.                        |
| `bosia-brief-identity` | "identity", "audience", "language", "formality" | Name, tagline, audience, language, formality, self-reference. Locks sapaan + UI string language.          |
| `bosia-brief-voice`    | "voice", "tone", "microcopy", "emoji policy"    | Tone adjectives, emoji/exclamation policy, microcopy spine table (empty/error/confirm/success/primary).   |
| `bosia-brief-visual`   | "palette", "theme", "typography", "icons"       | Palette intent → theme pick, shape, density, type, icons. Runs `bosia_add_theme`.                         |
| `bosia-brief-platform` | "platform", "id format", "first screens"        | Form factors, ID/number/date formatters, imagery, first screens, MVP features. Runs `bosia_add_block`.    |
| `bosia-brief-review`   | "brief review", "before first build"            | Quality gate. Confirms BRIEF.md complete, theme installed, formatters scaffolded, no sapaan/policy drift. |

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

| Name                  | Rule                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `bosia-theme-tokens`  | Semantic Tailwind tokens only — `bg-card`/`text-foreground`/`border-border`. Never raw colors. Theme swappable via `tokens.css`. |
| `bosia-block-compose` | Registry-first — call `list_registry()`, prefer blocks over hand-rolling. If no block fits, compose from `ui/*` primitives.      |

## Conventions — framework · — always-active code rules

| Name                    | Rule                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `bosia-routing`         | `+page.svelte` registers the route. Folder with only `+page.server.ts` 404s. Use `+server.ts` for action-only endpoints.            |
| `bosia-svelte-runes`    | Svelte 5 Runes — `$state` / `$derived` / `$effect` / `$props`. Never legacy `let`-reactivity, `$:`, or stores when runes work.      |
| `bosia-elysia-routes`   | `+server.ts` shape — `{ body }: { body: T }` parsing, return plain objects or `new Response()` for status codes. No Express idioms. |
| `bosia-rbac-permission` | Always `can('resource.action', scope?)`. Never `if (role === 'admin')`. Resources in `lib/rbac/resources.ts`.                       |
| `bosia-drizzle-feature` | `*.table.ts` + service + idempotent numbered seeds. Never edit applied seeds — add a new numbered file.                             |

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

0. **First touch of a Bosia app?** Check for `BRIEF.md` at app root. If missing or `## Status: pending`: run `bosia-brief-intake` to completion BEFORE anything below. Re-read BRIEF.md at the start of every later session.
1. Apply relevant **framework conventions** unconditionally (`bosia-routing`, `bosia-svelte-runes`, `bosia-elysia-routes`, `bosia-rbac-permission`, `bosia-drizzle-feature`).
2. If emitting UI, apply **design conventions** (`bosia-theme-tokens`, `bosia-block-compose`) — both honor decisions locked in BRIEF.md.
3. Pick a **page scaffold** or **flow** matching the user request.
4. Compose with helpers (`bosia-empty-states`).
5. Run **quality gates** before finalizing: design gates for UI, `bosia-security-review` for auth/data.
