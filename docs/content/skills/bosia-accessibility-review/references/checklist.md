# Accessibility review — full checklist

## P0 — must pass

### 1. Labels

- Every `<input>`, `<select>`, `<textarea>` has a `<label for="id">` or `aria-labelledby`.
- Icon-only buttons carry `aria-label="…"`.
- Placeholder text is _additional context_, never the label.

### 2. Focus visibility

- All interactive elements show a focus ring on `:focus-visible`.
- If you set `outline-none`, you must add a replacement (`ring-2 ring-ring ring-offset-2`).
- Registry primitives carry this for free — hand-rolled buttons usually do not.

### 3. Keyboard navigation

- Tab reaches every interactive element.
- Tab order matches visual order (no positive `tabindex`).
- Enter/Space activate buttons; Enter submits forms.
- Arrow keys navigate menus, listboxes, radio groups (registry primitives handle this).

### 4. Escape & focus trapping

- Dialogs trap focus inside while open.
- Escape closes the topmost overlay.
- Focus returns to the trigger element on close.
- `ui/dialog`, `ui/popover`, `ui/dropdown-menu` do this automatically.

### 5. Semantic elements

- Buttons → `<button>`.
- Links → `<a href="…">`.
- Form controls → real inputs.
- Headings → `<h1>`–`<h6>`, not styled divs.
- Lists → `<ul>` / `<ol>`.

### 6. Contrast ≥ 4.5:1

- Use semantic token pairings (`text-X` on `bg-X` where X is the same role, or its `-foreground` complement).
- Verify after any theme tweak.

### 7. Images & icons

- Informative images: `alt="describes the content"`.
- Decorative: `alt=""` (not omitted).
- SVG icons inside buttons: `aria-hidden="true"` on the SVG (button has the label).

## P1 — should pass

### 8. Landmarks

- `<main>` wraps the primary content.
- `<nav>` for navigation.
- `<header>` / `<footer>` where appropriate.
- One `<main>` per page.

### 9. Skip-to-content

- A skip link at the top of long pages: visible on focus, jumps past nav into `<main>`.

### 10. Error association

- Inputs with errors: `aria-invalid="true"` + `aria-describedby` pointing to the error message.

### 11. Live regions

- Toasts, form-save status, async updates: `aria-live="polite"` (or `"assertive"` for errors).
- `ui/sonner` handles this.

### 12. Heading structure

- No skipped levels (h1 → h3 ❌).
- Heading text describes the section.

### 13. Color independence

- State (error, success, selected) communicated via text + icon + shape, not color alone.

### 14. Reduced motion

- Decorative motion gated by `@media (prefers-reduced-motion: reduce)` or Tailwind's `motion-reduce:` variant.

## ARIA anti-patterns

- `role="button"` on a `<button>` — duplicate.
- `aria-label="Save"` on `<button>Save</button>` — duplicate.
- `role="dialog"` on a div without focus management — fake dialog.
- `tabindex="1"` (or any positive value) — breaks tab order.
- `aria-hidden="true"` on focusable elements — they remain reachable by Tab, creating ghosts.
