<script lang="ts">
	import { RadioGroup, RadioGroupItem } from "$registry/radio-group";
	import { Label } from "$registry/label";

	let plan = $state("pro");
</script>

<div class="flex flex-col gap-6">
	<!-- Basic radio group with labels -->
	<RadioGroup bind:value={plan}>
		<div class="flex items-center gap-2">
			<RadioGroupItem value="free" id="plan-free" />
			<Label for="plan-free">Free</Label>
		</div>
		<div class="flex items-center gap-2">
			<RadioGroupItem value="pro" id="plan-pro" />
			<Label for="plan-pro">Pro</Label>
		</div>
		<div class="flex items-center gap-2">
			<RadioGroupItem value="enterprise" id="plan-enterprise" />
			<Label for="plan-enterprise">Enterprise</Label>
		</div>
	</RadioGroup>
	<p class="text-sm text-muted-foreground">
		Selected plan: <span class="font-medium text-foreground">{plan}</span>
	</p>

	<!-- Disabled item -->
	<RadioGroup value="standard">
		<div class="flex items-center gap-2">
			<RadioGroupItem value="standard" id="ship-standard" />
			<Label for="ship-standard">Standard</Label>
		</div>
		<div class="flex items-center gap-2">
			<RadioGroupItem value="express" id="ship-express" disabled />
			<Label for="ship-express" class="opacity-50">Express (unavailable)</Label>
		</div>
	</RadioGroup>
</div>
