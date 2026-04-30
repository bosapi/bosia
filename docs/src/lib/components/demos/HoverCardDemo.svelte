<script lang="ts">
	import { HoverCard, HoverCardTrigger, HoverCardContent } from "$registry/hover-card";
	import { Avatar, AvatarFallback } from "$registry/avatar";
</script>

<div class="flex items-center justify-center">
	<HoverCard>
		<HoverCardTrigger href="https://svelte.dev" class="underline underline-offset-4">
			@sveltejs
		</HoverCardTrigger>
		<HoverCardContent class="w-80">
			<div class="flex justify-between gap-4">
				<Avatar src="https://github.com/sveltejs.png" alt="@sveltejs">
					<AvatarFallback>SV</AvatarFallback>
				</Avatar>
				<div class="space-y-1">
					<h4 class="text-sm font-semibold">@sveltejs</h4>
					<p class="text-sm">
						Cybernetically enhanced web apps — the official Svelte organization.
					</p>
					<div class="flex items-center pt-2">
						<span class="text-muted-foreground text-xs"> Joined December 2016 </span>
					</div>
				</div>
			</div>
		</HoverCardContent>
	</HoverCard>
</div>
