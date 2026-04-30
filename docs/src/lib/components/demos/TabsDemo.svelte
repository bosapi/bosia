<script lang="ts">
	import { Tabs, TabsList, TabsTrigger, TabsContent } from "$registry/tabs";
	import { Label } from "$registry/label";
	import { Input } from "$registry/input";

	let value = $state("account");
</script>

<div class="w-full max-w-sm">
	<Tabs bind:value>
		<TabsList class="grid w-full grid-cols-2">
			<TabsTrigger value="account">Account</TabsTrigger>
			<TabsTrigger value="password">Password</TabsTrigger>
		</TabsList>

		<TabsContent value="account">
			<div class="rounded-lg border bg-card p-4">
				<div class="mb-3">
					<h3 class="text-sm font-semibold leading-none">Account</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						Make changes to your account here.
					</p>
				</div>
				<div class="flex flex-col gap-3">
					<div class="grid gap-1.5">
						<Label for="tabs-demo-name">Name</Label>
						<Input id="tabs-demo-name" value="Jane Doe" />
					</div>
					<div class="grid gap-1.5">
						<Label for="tabs-demo-username">Username</Label>
						<Input id="tabs-demo-username" value="@jane" />
					</div>
				</div>
			</div>
		</TabsContent>

		<TabsContent value="password">
			<div class="rounded-lg border bg-card p-4">
				<div class="mb-3">
					<h3 class="text-sm font-semibold leading-none">Password</h3>
					<p class="mt-1 text-sm text-muted-foreground">Change your password here.</p>
				</div>
				<div class="flex flex-col gap-3">
					<div class="grid gap-1.5">
						<Label for="tabs-demo-current">Current password</Label>
						<Input id="tabs-demo-current" type="password" />
					</div>
					<div class="grid gap-1.5">
						<Label for="tabs-demo-new">New password</Label>
						<Input id="tabs-demo-new" type="password" />
					</div>
				</div>
			</div>
		</TabsContent>
	</Tabs>
</div>
