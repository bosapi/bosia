---
title: Cards — Utility & System
description: Notification, weather, event, file, task, storage, code, map, integration, poll, stepper, and chat cards.
demo: CardsUtilityDemo
---

The widest category — system and product UI cards. Status colours follow the shadcn convention
(`emerald` success, `amber` warning, `blue` info, `destructive` danger) so they read correctly in
light and dark, while the brand colour maps to `--primary` and follows the active theme.

## Preview

## Install

Each card installs on its own:

```bash
bun x bosia@latest add block cards/notification
bun x bosia@latest add block cards/weather
bun x bosia@latest add block cards/event
bun x bosia@latest add block cards/file
bun x bosia@latest add block cards/task
bun x bosia@latest add block cards/storage
bun x bosia@latest add block cards/code
bun x bosia@latest add block cards/map
bun x bosia@latest add block cards/integration
bun x bosia@latest add block cards/poll
bun x bosia@latest add block cards/stepper
bun x bosia@latest add block cards/chat
```

Each pulls the [`@lucide/svelte`](/components/ui/icon/) npm package for icons.

## Usage

```svelte
<script lang="ts">
	import Task from "$lib/blocks/cards/task/block.svelte";
</script>

<Task />
```

The task checklist, integration switch, and poll selection are cosmetic local `$state` — wire
them to your own data and handlers.
