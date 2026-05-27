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
		user={{ name: "Jeki", email: "jeki@bosia.dev", initials: "J", avatar: "/favicon.svg" }}
	/>
</div>
