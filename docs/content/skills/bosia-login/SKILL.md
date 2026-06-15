---
name: bosia-login
description: Catalog of the Bosia login/auth page family — 6 composed pages (login, register, forgot, magic-link, otp, sso) + 9 reusable auth/* blocks. Install pages with `bosia add page auth/<name>`, blocks with `bosia add block auth/<name>`. Visual layer only — one card, two layouts (centered ↔ split) via a one-line prop swap. Pair with bosia-auth-flow for the backend.
triggers:
  - login page
  - sign in page
  - sign up page
  - register page
  - auth page
  - auth screen
  - forgot password page
  - reset password page
  - magic link
  - passwordless
  - otp
  - 2fa
  - two-factor
  - sso
  - single sign-on
  - social login
od:
  mode: convention
  category: design
bosia:
  design: true
  requires:
    blocks: []
    themes: []
    components: []
    feats: []
  targets:
    routes: []
  stack: [svelte-5-runes, tailwind-v4]
---

Bosia ships a **login/auth page family**: **6 composed pages** assembled from **9 reusable
`auth/*` blocks**. One card renders in two layouts — a centered card or a split brand/photo panel —
swapped with a single prop. Everything is built from semantic tokens, so it restyles across all 19
themes with no edits.

This skill is the **visual/template layer only** — no sessions, hashing or server actions. For real
authentication (session cookies, `Bun.password` argon2id, route guards, redirects) pair it with
[[bosia-auth-flow]]. No overlap: that wires the server, this composes the screens.

## Install

Pages pull every block they need:

```bash
bosia add page auth/login        # → src/lib/pages/auth/login/page.svelte
bosia add page auth/register
bosia add page auth/forgot
bosia add page auth/magic-link
bosia add page auth/otp
bosia add page auth/sso
```

Individual blocks:

```bash
bosia add block auth/<name>      # → src/lib/blocks/auth/<name>/
```

> Registry install rule: **one page or one block per call** — never batch. Each call shells out and
> writes files; big batches blow the streaming window.

## The six pages

| Page         | Install                    | Composes (besides shell/card/brand)                          |
| ------------ | -------------------------- | ------------------------------------------------------------ |
| `login`      | `add page auth/login`      | social-row · divider · auth-field×2 · remember · switch line |
| `register`   | `add page auth/register`   | social-row · divider · auth-field×3 · password-strength      |
| `forgot`     | `add page auth/forgot`     | auth-field (email) · form-message                            |
| `magic-link` | `add page auth/magic-link` | form-message ("check your inbox") · resend                   |
| `otp`        | `add page auth/otp`        | otp-input · form-message · resend                            |
| `sso`        | `add page auth/sso`        | auth-field (work email/domain) · `Building2` icon            |

## The nine blocks (`auth/*`)

- **Layout:** `auth-shell` (centered ↔ split frame) · `auth-card` (brand, badge, heading, lede,
  content, switch-line footer)
- **Brand:** `brand` (logomark + wordmark; `tone="inherit"` for coloured panels)
- **Social:** `social-row` (Google / Apple / GitHub / Microsoft, inlined brand logos) · `divider`
- **Inputs:** `auth-field` (icon, password show/hide, helper/error) · `otp-input` (segmented
  6-digit) · `password-strength` (3-segment meter)
- **Feedback:** `form-message` (success / error / info alert row)

## One card, two layouts — the centered ↔ split swap

Every page takes a `variant` prop defaulting to `"centered"`. Render `<Login variant="split" />`
(or change the default at the top of `page.svelte`) to switch to the two-panel split. The split
panel takes `panelTitle`, `panelQuote`, `panelFoot` and an optional `image`; with no image it falls
back to a solid `primary` panel.

```svelte
<AuthShell variant="split" image="/cover.jpg">
	<AuthCard title="Welcome back" lede="Sign in to pick up where you left off.">
		<!-- fields … -->
	</AuthCard>
</AuthShell>
```

## The golden rule — brand is `primary`, never `accent`

Every brand action, the brand mark, eyebrows and links map to **`primary`** (`bg-primary`,
`text-primary`, `bg-primary/10`). The split panel is `bg-primary text-primary-foreground`. The only
non-brand colour is **status**: the password meter and form messages use destructive / amber /
emerald, and social brand logos keep their official colours (Google, Microsoft).

## Token rules (semantic tokens only — never hex)

| Role                       | Utility                                                                  |
| -------------------------- | ------------------------------------------------------------------------ |
| Page / card                | `bg-background` / `bg-card text-card-foreground`                         |
| Split panel                | `bg-primary text-primary-foreground` (photo gets a `bg-primary/70` wash) |
| Foreground / muted / faint | `text-foreground` / `text-muted-foreground` / `text-muted-foreground/60` |
| Brand                      | `bg-primary` / `text-primary` / `text-primary-foreground`                |
| Soft brand tint            | `bg-primary/10` (badge icon)                                             |
| Status                     | `bg-emerald-500/10` · `bg-destructive/10` · `bg-amber-500`               |
| Input / focus              | `border-input` · `focus:border-primary` · `focus:ring-2 focus:ring-ring` |
| Border                     | `border-border`                                                          |
| Type                       | headings `font-display`, body `font-body`, OTP `font-mono`               |

## Voice (preserve when editing copy)

- Sentence case everywhere **except** the tracked-uppercase eyebrow (`uppercase tracking-[0.14em]`).
- Verb-first buttons ("Sign in", "Create account", "Send reset link"); warm, concrete ledes
  ("Sign in to pick up where you left off"); **no emoji**.
- Switch lines are quiet and centered ("New here? Create an account").

## Anti-patterns

- ❌ Hardcoded hex / `bg-blue-*` for the brand → use `bg-primary`.
- ❌ Brand on `accent` → it won't follow the theme.
- ❌ Title Case or emoji in copy → sentence case, no emoji.
- ❌ Wiring real auth here → this is design only; use [[bosia-auth-flow]] for sessions + hashing.
- ❌ Hand-rolling a field/social button → install the matching `auth/*` block.

## Backend

Design only — no server. For login/register/logout/forgot wired to sessions + Drizzle, see
[[bosia-auth-flow]]; it ships the `(public)/login` + `(public)/register` routes, password hashing,
and the post-login redirect/guard rules these screens drop into.
