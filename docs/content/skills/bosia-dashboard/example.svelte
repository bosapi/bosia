<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { Separator } from "$lib/components/ui/separator";
	import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
	} from "$lib/components/ui/dropdown-menu";
	import { Home, Users, Settings, BarChart, TrendingUp, TrendingDown, Minus } from "@lucide/svelte";
	import type { Component } from "svelte";

	const navIcons: Record<string, Component> = {
		home: Home,
		users: Users,
		settings: Settings,
		"bar-chart": BarChart,
	};

	const directionIcons = {
		up: TrendingUp,
		down: TrendingDown,
		flat: Minus,
	} as const;

	let {
		data,
	}: {
		data: {
			user: { name: string; email: string };
			nav: Array<{ href: string; label: string; icon: string }>;
			kpis: Array<{
				label: string;
				value: string;
				delta: string;
				direction: "up" | "down" | "flat";
			}>;
		};
	} = $props();

	let sidebarOpen = $state(true);
</script>

<div class="flex h-svh bg-background text-foreground">
	<aside class="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
		<div class="flex h-14 items-center px-4 font-semibold">Bosia</div>
		<Separator />
		<nav class="flex-1 space-y-1 p-2 text-sm">
			{#each data.nav as item (item.href)}
				{@const NavIcon = navIcons[item.icon] ?? Home}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-md px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground"
				>
					<NavIcon class="size-4" />
					{item.label}
				</a>
			{/each}
		</nav>
		<Separator />
		<div class="p-3">
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button variant="ghost" class="w-full justify-start gap-2">
						<Avatar class="size-7"><AvatarFallback>{data.user.name[0]}</AvatarFallback></Avatar>
						<div class="flex-1 text-left text-sm">
							<div>{data.user.name}</div>
							<div class="text-muted-foreground">{data.user.email}</div>
						</div>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>Settings</DropdownMenuItem>
					<form method="POST" action="/logout">
						<button type="submit" class="w-full">
							<DropdownMenuItem>Log out</DropdownMenuItem>
						</button>
					</form>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	</aside>

	<div class="flex flex-1 flex-col">
		<header class="flex h-14 items-center justify-between border-b border-border px-6">
			<h1 class="text-lg font-semibold">Dashboard</h1>
			<Badge variant="secondary">Beta</Badge>
		</header>

		<main class="flex-1 space-y-6 overflow-y-auto p-6">
			<section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each data.kpis as k}
					{@const DirIcon = directionIcons[k.direction]}
					<Card>
						<CardHeader class="pb-2">
							<CardTitle class="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
						</CardHeader>
						<CardContent class="space-y-1">
							<div class="text-3xl font-semibold">{k.value}</div>
							<div class="flex items-center gap-1 text-sm text-muted-foreground">
								<DirIcon class="size-4" />
								<span>{k.delta}</span>
							</div>
						</CardContent>
					</Card>
				{/each}
			</section>

			<Card>
				<CardHeader><CardTitle>Activity</CardTitle></CardHeader>
				<CardContent>
					<div class="h-64 rounded-md bg-muted" aria-label="Chart placeholder" />
				</CardContent>
			</Card>
		</main>
	</div>
</div>
