<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { untrack } from "svelte";
	import type { Snippet } from "svelte";
	import { Popover, PopoverTrigger, PopoverContent } from "../popover";
	import { Calendar, CalendarHeader, CalendarGrid } from "../calendar";

	let {
		value = $bindable<Date | undefined>(undefined),
		placeholder = "Pick a date",
		min,
		max,
		disabled,
		weekStartsOn = 0,
		fixedWeeks = false,
		buttonDisabled = false,
		formatDate = (d: Date) =>
			d.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
		contentClass = "",
		trigger,
		class: className = "",
	}: {
		value?: Date | undefined;
		placeholder?: string;
		min?: Date | undefined;
		max?: Date | undefined;
		disabled?: ((date: Date) => boolean) | undefined;
		weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
		fixedWeeks?: boolean;
		buttonDisabled?: boolean;
		formatDate?: (date: Date) => string;
		contentClass?: string;
		trigger?: Snippet<[Date | undefined]>;
		class?: string;
	} = $props();

	let open = $state(false);

	// Auto-close popover when a date is selected
	let prevValue = $state<Date | undefined>(undefined);
	$effect(() => {
		const current = value; // tracked
		untrack(() => {
			if (open && current !== undefined && current !== prevValue) {
				open = false;
			}
			prevValue = current;
		});
	});
</script>

<Popover bind:open>
	<PopoverTrigger
		disabled={buttonDisabled}
		class={cn(
			"inline-flex h-9 w-[240px] items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-all duration-150",
			"hover:bg-accent hover:text-accent-foreground",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"active:scale-[0.97] active:opacity-80",
			"disabled:pointer-events-none disabled:opacity-50",
			!value && "text-muted-foreground",
			className,
		)}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="size-4 shrink-0 opacity-50"
			aria-hidden="true"
		>
			<path d="M8 2v4" />
			<path d="M16 2v4" />
			<rect width="18" height="18" x="3" y="4" rx="2" />
			<path d="M3 10h18" />
		</svg>
		{#if trigger}
			{@render trigger(value)}
		{:else}
			<span class="truncate">{value ? formatDate(value) : placeholder}</span>
		{/if}
	</PopoverTrigger>
	<PopoverContent align="start" sideOffset={4} class={cn("w-auto p-0", contentClass)}>
		<Calendar bind:value {min} {max} {disabled} {weekStartsOn} {fixedWeeks}>
			<CalendarHeader />
			<CalendarGrid />
		</Calendar>
	</PopoverContent>
</Popover>
