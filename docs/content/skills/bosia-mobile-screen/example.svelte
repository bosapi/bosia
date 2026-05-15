<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import {
		Dialog,
		DialogTrigger,
		DialogContent,
		DialogHeader,
		DialogTitle,
	} from "$lib/components/ui/dialog";
	import Icon from "$lib/components/ui/icon/Icon.svelte";

	let query = $state("");
</script>

<div class="flex h-svh flex-col bg-background text-foreground">
	<header
		class="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] pb-3"
	>
		<Button variant="ghost" size="icon" aria-label="Back">
			<Icon name="chevron-left" />
		</Button>
		<h1 class="text-lg font-semibold">Students</h1>
	</header>

	<main class="flex-1 overflow-y-auto">
		<div class="space-y-3 p-4">
			<Input type="search" placeholder="Search…" bind:value={query} class="text-base" />
			<ul class="divide-y divide-border rounded-md border border-border bg-card">
				{#each [{ id: 1, name: "Aisyah" }, { id: 2, name: "Budi" }] as s (s.id)}
					<li class="flex min-h-11 items-center justify-between p-4">
						<span class="text-card-foreground">{s.name}</span>
						<Icon name="chevron-right" class="text-muted-foreground" />
					</li>
				{/each}
			</ul>
		</div>
	</main>

	<footer
		class="border-t border-border bg-background p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
	>
		<Dialog>
			<DialogTrigger>
				<Button class="w-full" size="lg">Add student</Button>
			</DialogTrigger>
			<DialogContent
				class="bottom-0 inset-x-0 top-auto translate-y-0 rounded-t-xl rounded-b-none sm:rounded-md"
			>
				<DialogHeader>
					<DialogTitle>New student</DialogTitle>
				</DialogHeader>
				<form class="space-y-3 p-4">
					<Input placeholder="Name" class="text-base" />
					<Button type="submit" class="w-full" size="lg">Save</Button>
				</form>
			</DialogContent>
		</Dialog>
	</footer>
</div>
