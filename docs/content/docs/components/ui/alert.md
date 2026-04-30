---
title: Alert
description: Displays a callout for important messages with default and destructive variants.
demo: AlertDemo
---

```bash
bosia add alert
```

A compound alert component with title and description slots.

## Preview

## Sub-components

| Component          | Element | Purpose                                                |
| ------------------ | ------- | ------------------------------------------------------ |
| `Alert`            | `<div>` | Root container with variant styling and `role="alert"` |
| `AlertTitle`       | `<h5>`  | Bold heading                                           |
| `AlertDescription` | `<div>` | Body text                                              |

## Props

### Alert

| Prop      | Type                           | Default     |
| --------- | ------------------------------ | ----------- |
| `variant` | `"default"` \| `"destructive"` | `"default"` |

## Usage

```svelte
<script lang="ts">
	import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert";
</script>

<Alert>
	<AlertTitle>Heads up!</AlertTitle>
	<AlertDescription>You can add components using the CLI.</AlertDescription>
</Alert>

<Alert variant="destructive">
	<AlertTitle>Error</AlertTitle>
	<AlertDescription>Your session has expired.</AlertDescription>
</Alert>
```
