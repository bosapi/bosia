<script lang="ts">
	import { Empty } from "$lib/components/ui/empty";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert";
	import { Button } from "$lib/components/ui/button";
	import { Users } from "@lucide/svelte";

	type Student = { id: string; name: string };

	let students = $state<Student[] | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);

	async function load() {
		loading = true;
		error = null;
		try {
			const res = await fetch("/api/students");
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			students = await res.json();
		} catch (e) {
			error = "We couldn't load students.";
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		load();
	});
</script>

<section aria-live="polite" class="space-y-4">
	{#if loading}
		<!-- Loading: skeletons sized like final rows. -->
		<div class="space-y-2">
			<Skeleton class="h-12 w-full" />
			<Skeleton class="h-12 w-full" />
			<Skeleton class="h-12 w-full" />
		</div>
	{:else if error}
		<!-- Error: human message + retry. -->
		<Alert variant="destructive">
			<AlertTitle>Something went wrong</AlertTitle>
			<AlertDescription>
				{error}
				<Button variant="outline" size="sm" class="mt-3" onclick={load}>Try again</Button>
			</AlertDescription>
		</Alert>
	{:else if !students || students.length === 0}
		<!-- Empty: icon + headline + body + primary action. -->
		<Empty>
			<Users class="size-10 text-muted-foreground" />
			<Empty.Title>No students yet</Empty.Title>
			<Empty.Description>
				Add your first student to start tracking attendance and grades.
			</Empty.Description>
			<Button>Add student</Button>
		</Empty>
	{:else}
		<!-- Content. -->
		<ul class="divide-y divide-border rounded-md border border-border bg-card">
			{#each students as student (student.id)}
				<li class="flex items-center justify-between p-4">
					<span class="text-card-foreground">{student.name}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
