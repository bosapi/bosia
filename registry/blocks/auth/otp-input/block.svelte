<script lang="ts">
	interface Props {
		length?: number;
		oncomplete?: (code: string) => void;
	}

	let { length = 6, oncomplete }: Props = $props();

	let digits = $state<string[]>(Array(length).fill(""));
	let inputs: HTMLInputElement[] = $state([]);

	function emit() {
		const code = digits.join("");
		if (code.length === length && !digits.includes("")) oncomplete?.(code);
	}

	function handleInput(i: number, event: Event) {
		const el = event.target as HTMLInputElement;
		const digit = el.value.replace(/\D/g, "").slice(-1);
		digits[i] = digit;
		el.value = digit;
		if (digit && i < length - 1) inputs[i + 1]?.focus();
		emit();
	}

	function handleKey(i: number, event: KeyboardEvent) {
		if (event.key === "Backspace" && !digits[i] && i > 0) inputs[i - 1]?.focus();
	}

	function handlePaste(event: ClipboardEvent) {
		const text = (event.clipboardData?.getData("text") ?? "").replace(/\D/g, "").slice(0, length);
		if (!text) return;
		event.preventDefault();
		for (let i = 0; i < length; i++) {
			digits[i] = text[i] ?? "";
			if (inputs[i]) inputs[i].value = digits[i];
		}
		emit();
	}
</script>

<div class="flex gap-2" onpaste={handlePaste}>
	{#each digits as digit, i (i)}
		<input
			bind:this={inputs[i]}
			inputmode="numeric"
			maxlength="1"
			value={digit}
			oninput={(e) => handleInput(i, e)}
			onkeydown={(e) => handleKey(i, e)}
			aria-label="Digit {i + 1}"
			class="h-12 w-full rounded-lg border bg-card text-center font-mono text-lg text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring {digit
				? 'border-primary'
				: 'border-input'}"
		/>
	{/each}
</div>
