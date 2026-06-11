<script lang="ts">
	import { cn } from "$lib/utils.ts";
	import type { Snippet } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
	} from "$lib/components/ui/dropdown-menu";
	import { Sun, Moon, Monitor } from "@lucide/svelte";
	import NavbarLink from "./navbar-link.svelte";
	import NavbarMobileMenu from "./navbar-mobile-menu.svelte";

	let {
		class: className = "",
		brand = "Bosia",
		version = "",
		links = [] as { label: string; href: string }[],
		currentPath = "/",
		user = undefined as
			| { name: string; email: string; initials: string; avatar?: string }
			| undefined,
		children,
		...restProps
	}: {
		class?: string;
		brand?: string;
		version?: string;
		links?: { label: string; href: string }[];
		currentPath?: string;
		user?: { name: string; email: string; initials: string; avatar?: string };
		children?: Snippet;
		[key: string]: any;
	} = $props();

	type ThemeMode = "light" | "dark" | "system";
	const ORDER: ThemeMode[] = ["light", "dark", "system"];
	let mode = $state<ThemeMode>("system");

	function applyTheme(m: ThemeMode) {
		if (typeof document === "undefined") return;
		const dark =
			m === "dark" || (m === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
		document.documentElement.classList.toggle("dark", dark);
	}

	// init from storage once (writes mode, reads nothing reactive → runs once, no read+write-same-state)
	$effect(() => {
		const stored = localStorage.getItem("theme") as ThemeMode | null;
		if (stored) mode = stored;
	});

	// keep DOM in sync with live OS changes while in system mode
	$effect(() => {
		if (mode !== "system" || typeof window === "undefined") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => applyTheme("system");
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	});

	function cycleTheme() {
		mode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
		localStorage.setItem("theme", mode);
		applyTheme(mode);
	}
</script>

<nav
	class={cn(
		"sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 md:px-6",
		"bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
		className,
	)}
	{...restProps}
>
	<!-- Left: Mobile menu + Brand -->
	<div class="flex items-center gap-3">
		<NavbarMobileMenu {links} {currentPath} />

		<a href="/" class="flex items-center gap-2">
			<img src="/logo-dark.svg" alt={brand} class="hidden h-5 w-5 dark:block" />
			<img src="/logo-light.svg" alt={brand} class="block h-5 w-5 dark:hidden" />
			<span class="text-xl font-bold">{brand}</span>
			{#if version}
				<span
					class="hidden sm:inline text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded"
				>
					{version}
				</span>
			{/if}
		</a>
	</div>

	<!-- Center: Desktop nav links -->
	<div class="hidden md:flex items-center gap-6">
		{#each links as link}
			<NavbarLink href={link.href} label={link.label} active={currentPath === link.href} />
		{/each}
	</div>

	<!-- Right: Actions -->
	<div class="flex items-center gap-2">
		{@render children?.()}

		<Button variant="ghost" size="icon" onclick={cycleTheme} aria-label={`Theme: ${mode}`}>
			{#if mode === "light"}
				<Sun size={18} />
			{:else if mode === "dark"}
				<Moon size={18} />
			{:else}
				<Monitor size={18} />
			{/if}
		</Button>

		{#if user}
			<DropdownMenu>
				<DropdownMenuTrigger aria-label="User menu">
					<Avatar
						src={user.avatar}
						class="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
					>
						<AvatarFallback class="text-xs">{user.initials}</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" class="w-56">
					<div class="flex items-center gap-2 p-2">
						<Avatar src={user.avatar} class="h-8 w-8">
							<AvatarFallback class="text-xs">{user.initials}</AvatarFallback>
						</Avatar>
						<div class="flex flex-col space-y-0.5">
							<p class="text-sm font-medium leading-none">{user.name}</p>
							<p class="text-xs text-muted-foreground">{user.email}</p>
						</div>
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuItem>Profile</DropdownMenuItem>
					<DropdownMenuItem>Settings</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem class="text-destructive">Log out</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		{/if}
	</div>
</nav>
