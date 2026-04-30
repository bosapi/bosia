<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter,
	} from "$registry/card";
	import { Button } from "$registry/button";
</script>

<Card class="w-full max-w-sm">
	<CardHeader>
		<CardTitle>Welcome</CardTitle>
		<CardDescription>Get started with Bosia components</CardDescription>
	</CardHeader>
	<CardContent>
		<p class="text-sm text-muted-foreground">
			This is an interactive card preview. Click the button below.
		</p>
	</CardContent>
	<CardFooter>
		<Button>Continue</Button>
	</CardFooter>
</Card>
