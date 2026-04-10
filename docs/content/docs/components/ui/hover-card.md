---
title: Hover Card
description: A hover-triggered floating content panel for rich previews.
demo: HoverCardDemo
---

```bash
bosia add hover-card
```

A hover-triggered floating panel for showing rich previews (user cards, link previews, etc.) when a pointer hovers or focuses a trigger.

## Preview

## Props

### HoverCard

| Prop         | Type      | Default |
| ------------ | --------- | ------- |
| `open`       | `boolean` | `false` |
| `openDelay`  | `number`  | `700`   |
| `closeDelay` | `number`  | `300`   |
| `class`      | `string`  | `""`    |

### HoverCardTrigger

| Prop    | Type     | Default     |
| ------- | -------- | ----------- |
| `href`  | `string` | `undefined` |
| `class` | `string` | `""`        |

### HoverCardContent

| Prop         | Type                                          | Default    |
| ------------ | --------------------------------------------- | ---------- |
| `side`       | `"top"` \| `"right"` \| `"bottom"` \| `"left"` | `"bottom"` |
| `align`      | `"start"` \| `"center"` \| `"end"`            | `"center"` |
| `sideOffset` | `number`                                      | `4`        |
| `class`      | `string`                                      | `""`       |

## Sub-components

- `HoverCard` — root wrapper, manages open state and hover delays
- `HoverCardTrigger` — link/element that opens the card on hover or focus
- `HoverCardContent` — the floating panel

## Usage

```svelte
<script lang="ts">
  import { HoverCard, HoverCardTrigger, HoverCardContent } from "$lib/components/ui/hover-card";
  import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
</script>

<HoverCard>
  <HoverCardTrigger href="https://svelte.dev">@sveltejs</HoverCardTrigger>
  <HoverCardContent class="w-80">
    <div class="flex justify-between gap-4">
      <Avatar src="https://github.com/sveltejs.png" alt="@sveltejs">
        <AvatarFallback>SV</AvatarFallback>
      </Avatar>
      <div class="space-y-1">
        <h4 class="text-sm font-semibold">@sveltejs</h4>
        <p class="text-sm">Cybernetically enhanced web apps.</p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

## Positioning

Use `side` and `align` to place the content relative to the trigger.

```svelte
<HoverCardContent side="top" align="start">...</HoverCardContent>
<HoverCardContent side="right">...</HoverCardContent>
<HoverCardContent side="bottom" align="end" sideOffset={8}>...</HoverCardContent>
```

## Custom Delays

Tune how quickly the card appears and disappears on hover.

```svelte
<HoverCard openDelay={200} closeDelay={100}>
  <HoverCardTrigger href="/profile">Profile</HoverCardTrigger>
  <HoverCardContent>Quick preview</HoverCardContent>
</HoverCard>
```

## Controlled Open State

```svelte
<script lang="ts">
  let open = $state(false);
</script>

<HoverCard bind:open>
  <HoverCardTrigger href="#">Hover me</HoverCardTrigger>
  <HoverCardContent>Content</HoverCardContent>
</HoverCard>

<p>Card is {open ? "open" : "closed"}</p>
```
