<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { Popover, PopoverTrigger, PopoverContent } from "../popover";
	import {
		Command,
		CommandInput,
		CommandList,
		CommandEmpty,
		CommandGroup,
		CommandItem,
	} from "../command";

	type ComboboxItem = {
		value: string;
		label: string;
		keywords?: string[];
		disabled?: boolean;
	};

	let {
		items = [] as ComboboxItem[],
		value = $bindable(undefined as string | undefined),
		placeholder = "Select item...",
		searchPlaceholder = "Search...",
		emptyText = "No results found.",
		disabled = false,
		class: className = "",
		contentClass = "",
	}: {
		items?: ComboboxItem[];
		value?: string;
		placeholder?: string;
		searchPlaceholder?: string;
		emptyText?: string;
		disabled?: boolean;
		class?: string;
		contentClass?: string;
	} = $props();

	let open = $state(false);

	const selectedLabel = $derived(items.find((i) => i.value === value)?.label);

	function handleSelect(v: string) {
		value = v === value ? undefined : v;
		open = false;
	}
</script>

<Popover bind:open>
	<PopoverTrigger
		role="combobox"
		aria-haspopup="listbox"
		{disabled}
		class={cn(
			"inline-flex h-9 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-all duration-150",
			"hover:bg-accent hover:text-accent-foreground",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"active:scale-[0.97] active:opacity-80",
			"disabled:pointer-events-none disabled:opacity-50",
			!selectedLabel && "text-muted-foreground",
			className,
		)}
	>
		<span class="truncate">{selectedLabel ?? placeholder}</span>
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
			class="ml-2 size-4 shrink-0 opacity-50"
			aria-hidden="true"
		>
			<path d="m7 15 5 5 5-5" />
			<path d="m7 9 5-5 5 5" />
		</svg>
	</PopoverTrigger>
	<PopoverContent align="start" sideOffset={4} class={cn("w-[200px] p-0", contentClass)}>
		<Command>
			<CommandInput placeholder={searchPlaceholder} />
			<CommandList>
				<CommandEmpty>{emptyText}</CommandEmpty>
				<CommandGroup>
					{#each items as item (item.value)}
						<CommandItem
							value={item.value}
							keywords={item.keywords}
							disabled={item.disabled}
							onSelect={handleSelect}
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
								class={cn(
									"mr-2 size-4",
									item.value === value ? "opacity-100" : "opacity-0",
								)}
								aria-hidden="true"
							>
								<path d="M20 6 9 17l-5-5" />
							</svg>
							{item.label}
						</CommandItem>
					{/each}
				</CommandGroup>
			</CommandList>
		</Command>
	</PopoverContent>
</Popover>
