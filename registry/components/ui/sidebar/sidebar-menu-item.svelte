<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import { onDestroy } from "svelte";
	import type { Snippet } from "svelte";
	import { getSidebarContext } from "./context.ts";
	import SidebarPopover from "./sidebar-popover.svelte";

	let {
		class: className = "",
		href = "",
		label = "",
		active = false,
		trigger = "click" as "click" | "hover",
		icon,
		children,
		...restProps
	}: {
		class?: string;
		href?: string;
		label?: string;
		active?: boolean;
		trigger?: "click" | "hover";
		icon?: Snippet;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const sidebar = getSidebarContext();

	let open = $state(false);
	const hasChildren = $derived(!!children);

	// --- Fixed-position popover for collapsed parents ---
	let triggerEl: HTMLButtonElement | undefined = $state();
	let popoverOpen = $state(false);
	let popoverStyle = $state("");
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const CLOSE_DELAY = 150;

	function updatePopoverPosition() {
		if (!triggerEl) return;
		const rect = triggerEl.getBoundingClientRect();
		popoverStyle = `position:fixed;top:${rect.top}px;left:${rect.right + 4}px;z-index:50;`;
	}

	function openPopover() {
		clearTimeout(closeTimer);
		if (!popoverOpen) {
			popoverOpen = true;
			updatePopoverPosition();
		}
	}

	function closePopover() {
		clearTimeout(closeTimer);
		closeTimer = setTimeout(() => {
			popoverOpen = false;
		}, CLOSE_DELAY);
	}

	function togglePopover() {
		if (popoverOpen) {
			popoverOpen = false;
		} else {
			openPopover();
		}
	}

	onDestroy(() => clearTimeout(closeTimer));

	function handlePopoverClickOutside(e: MouseEvent) {
		if (trigger !== "click") return;
		if (!popoverOpen) return;
		const target = e.target as Node;
		if (triggerEl?.contains(target)) return;
		const popoverContent = document.getElementById(popoverId);
		if (popoverContent?.contains(target)) return;
		popoverOpen = false;
	}

	function handlePopoverKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && popoverOpen) popoverOpen = false;
	}

	const isHover = $derived(trigger === "hover");
	const popoverId = `sidebar-popover-${crypto.randomUUID().slice(0, 8)}`;
</script>

<svelte:window onclick={handlePopoverClickOutside} onkeydown={handlePopoverKeydown} />

<li class={cn("list-none", className)} {...restProps}>
	{#if hasChildren}
		{#if sidebar.collapsed}
			<button
				bind:this={triggerEl}
				type="button"
				onclick={togglePopover}
				onmouseenter={() => {
					if (isHover) openPopover();
				}}
				onmouseleave={() => {
					if (isHover) closePopover();
				}}
				onfocus={() => {
					if (isHover) openPopover();
				}}
				onblur={() => {
					if (isHover) closePopover();
				}}
				ontouchstart={(e) => {
					if (isHover) {
						e.preventDefault();
						togglePopover();
					}
				}}
				aria-haspopup="dialog"
				aria-expanded={popoverOpen}
				aria-controls={popoverId}
				class={cn(
					"flex w-full items-center justify-center rounded-md py-1.5 text-sm transition-colors",
					"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
					active && "bg-sidebar-accent text-sidebar-accent-foreground",
				)}
			>
				{#if icon}
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
						>{@render icon()}</span
					>
				{/if}
			</button>
			{#if popoverOpen}
				<div
					id={popoverId}
					role="dialog"
					class="w-48 rounded-md border bg-popover p-2 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
					style={popoverStyle}
					onmouseenter={() => {
						if (isHover) openPopover();
					}}
					onmouseleave={() => {
						if (isHover) closePopover();
					}}
				>
					<p class="px-2 py-1 text-sm font-medium">{label}</p>
					<ul class="flex flex-col gap-0.5">
						<SidebarPopover>
							{@render children()}
						</SidebarPopover>
					</ul>
				</div>
			{/if}
		{:else}
			<button
				onclick={(e) => {
					e.preventDefault();
					open = !open;
				}}
				class={cn(
					"flex w-full items-center rounded-md py-1.5 text-sm transition-colors",
					"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
					active && "bg-sidebar-accent text-sidebar-accent-foreground",
					"gap-2 px-2",
				)}
			>
				{#if icon}
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
						>{@render icon()}</span
					>
				{/if}
				<span class="flex-1 truncate text-left">{label}</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class={cn("shrink-0 transition-transform", open && "rotate-180")}
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</button>
			{#if open}
				<ul class="ml-4 mt-0.5 flex flex-col gap-0.5 border-l pl-2">
					{@render children()}
				</ul>
			{/if}
		{/if}
	{:else if href}
		{#if sidebar.collapsed}
			<a
				{href}
				class={cn(
					"flex items-center justify-center rounded-md py-1.5 text-sm transition-colors",
					"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
					active
						? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
						: "text-sidebar-foreground",
				)}
			>
				{#if icon}
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
						>{@render icon()}</span
					>
				{/if}
			</a>
		{:else}
			<a
				{href}
				class={cn(
					"flex items-center rounded-md py-1.5 text-sm transition-colors gap-2 px-2",
					"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
					active
						? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
						: "text-sidebar-foreground",
				)}
			>
				{#if icon}
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
						>{@render icon()}</span
					>
				{/if}
				<span class="truncate">{label}</span>
			</a>
		{/if}
	{:else}
		<span
			class={cn(
				"flex items-center rounded-md py-1.5 text-sm text-sidebar-foreground",
				sidebar.collapsed ? "justify-center px-0" : "gap-2 px-2",
			)}
		>
			{#if icon}
				<span
					class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
					>{@render icon()}</span
				>
			{/if}
			{#if !sidebar.collapsed}
				<span class="truncate">{label}</span>
			{/if}
		</span>
	{/if}
</li>
