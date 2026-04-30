<script lang="ts">
	import {
		Item,
		ItemMedia,
		ItemContent,
		ItemTitle,
		ItemDescription,
		ItemActions,
		ItemGroup,
		ItemSeparator,
	} from "$registry/item";
	import { Button } from "$registry/button";
</script>

<div class="flex w-full max-w-md flex-col gap-6">
	<!-- Basic item with icon media -->
	<Item>
		<ItemMedia variant="icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
				<polyline points="14 2 14 8 20 8" />
			</svg>
		</ItemMedia>
		<ItemContent>
			<ItemTitle>Project Proposal</ItemTitle>
			<ItemDescription>Last edited 2 hours ago</ItemDescription>
		</ItemContent>
		<ItemActions>
			<Button variant="outline" size="sm">Open</Button>
		</ItemActions>
	</Item>

	<!-- Outline variant with avatar media -->
	<Item variant="outline">
		<ItemMedia variant="icon" class="rounded-full">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
				<circle cx="12" cy="7" r="4" />
			</svg>
		</ItemMedia>
		<ItemContent>
			<ItemTitle>Jane Cooper</ItemTitle>
			<ItemDescription>jane@example.com</ItemDescription>
		</ItemContent>
		<ItemActions>
			<Button variant="ghost" size="sm">Message</Button>
		</ItemActions>
	</Item>

	<!-- ItemGroup with separators -->
	<ItemGroup class="rounded-lg border border-input">
		<Item>
			<ItemMedia variant="icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect width="20" height="16" x="2" y="4" rx="2" />
					<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
				</svg>
			</ItemMedia>
			<ItemContent>
				<ItemTitle>Notifications</ItemTitle>
				<ItemDescription>Manage your notification preferences</ItemDescription>
			</ItemContent>
		</Item>
		<ItemSeparator />
		<Item>
			<ItemMedia variant="icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>
			</ItemMedia>
			<ItemContent>
				<ItemTitle>Security</ItemTitle>
				<ItemDescription>Update your password and 2FA settings</ItemDescription>
			</ItemContent>
		</Item>
		<ItemSeparator />
		<Item>
			<ItemMedia variant="icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="3" />
					<path
						d="M12 1v6m0 6v6m8.66-14.5-5.2 3m-7 4-5.2 3M22.66 18.5l-5.2-3m-7-4-5.2-3"
					/>
				</svg>
			</ItemMedia>
			<ItemContent>
				<ItemTitle>Appearance</ItemTitle>
				<ItemDescription>Customize the look and feel</ItemDescription>
			</ItemContent>
		</Item>
	</ItemGroup>
</div>
