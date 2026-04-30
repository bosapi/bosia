<script lang="ts">
	import { Navbar } from "$registry/navbar";

	const links = [
		{ label: "Home", href: "#" },
		{ label: "Dashboard", href: "#" },
		{ label: "Settings", href: "#" },
	];
</script>

<div class="w-full rounded-lg border overflow-hidden h-60">
	<Navbar
		brand="MyApp"
		version="v1.0"
		{links}
		currentPath="#"
		user={{ name: "Alice", email: "alice@bosia.dev", initials: "A", avatar: "/favicon.svg" }}
	/>
</div>
