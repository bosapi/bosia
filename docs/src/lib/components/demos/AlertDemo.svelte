<script lang="ts">
	import { Alert, AlertTitle, AlertDescription } from "$registry/alert";
</script>

<div class="flex w-full flex-col gap-4">
	<Alert>
		<AlertTitle>Heads up!</AlertTitle>
		<AlertDescription>You can add components to your app using the CLI.</AlertDescription>
	</Alert>

	<Alert variant="destructive">
		<AlertTitle>Error</AlertTitle>
		<AlertDescription>Your session has expired. Please log in again.</AlertDescription>
	</Alert>
</div>
