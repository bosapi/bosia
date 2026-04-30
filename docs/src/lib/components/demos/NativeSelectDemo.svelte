<script lang="ts">
	import {
		NativeSelect,
		NativeSelectOption,
		NativeSelectOptGroup,
	} from "$registry/native-select";
	import { Label } from "$registry/label";

	let fruit = $state("apple");
	let country = $state("");
</script>

<div class="flex flex-col gap-6 w-full max-w-sm">
	<div class="grid gap-1.5">
		<Label for="fruit">Fruit</Label>
		<NativeSelect id="fruit" bind:value={fruit}>
			<NativeSelectOption value="apple">Apple</NativeSelectOption>
			<NativeSelectOption value="banana">Banana</NativeSelectOption>
			<NativeSelectOption value="mango">Mango</NativeSelectOption>
		</NativeSelect>
		<p class="text-sm text-muted-foreground">
			Selected: <span class="font-medium text-foreground">{fruit}</span>
		</p>
	</div>

	<div class="grid gap-1.5">
		<Label for="country">Country (grouped)</Label>
		<NativeSelect id="country" bind:value={country}>
			<NativeSelectOption value="" disabled>Select a country...</NativeSelectOption>
			<NativeSelectOptGroup label="Asia">
				<NativeSelectOption value="id">Indonesia</NativeSelectOption>
				<NativeSelectOption value="jp">Japan</NativeSelectOption>
				<NativeSelectOption value="kr">South Korea</NativeSelectOption>
			</NativeSelectOptGroup>
			<NativeSelectOptGroup label="Europe">
				<NativeSelectOption value="de">Germany</NativeSelectOption>
				<NativeSelectOption value="fr">France</NativeSelectOption>
				<NativeSelectOption value="uk">United Kingdom</NativeSelectOption>
			</NativeSelectOptGroup>
		</NativeSelect>
	</div>

	<div class="grid gap-1.5">
		<Label for="disabled-select">Disabled</Label>
		<NativeSelect id="disabled-select" disabled>
			<NativeSelectOption value="none">Cannot select</NativeSelectOption>
		</NativeSelect>
	</div>
</div>
