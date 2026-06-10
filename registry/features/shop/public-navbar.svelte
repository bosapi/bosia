<!-- EDIT THIS FILE: change brand, add menu items, swap copy. -->
<script lang="ts">
	import { Navbar } from "$lib/components/ui/navbar";
	import type { SessionUser } from "../../features/auth";

	let { currentPath = "/", user = undefined }: { currentPath?: string; user?: SessionUser | null } =
		$props();

	const links = [
		{ label: "Home", href: "/" },
		{ label: "Products", href: "/products" },
		{ label: "Sign in", href: "/login" },
	];

	const userView = user
		? {
				name: user.email.split("@")[0],
				email: user.email,
				initials: (user.email[0] ?? "?").toUpperCase(),
			}
		: undefined;
</script>

<Navbar brand="Shop" {currentPath} {links} user={userView} />
