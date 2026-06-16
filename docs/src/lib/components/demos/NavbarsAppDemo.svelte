<script lang="ts">
	import Dashboard from "$blocks/navbars/dashboard/block.svelte";
	import Ecommerce from "$blocks/navbars/ecommerce/block.svelte";
	import Docs from "$blocks/navbars/docs/block.svelte";
	import MegaMenu from "$blocks/navbars/mega-menu/block.svelte";
	import Announcement from "$blocks/navbars/announcement/block.svelte";
	import Mobile from "$blocks/navbars/mobile/block.svelte";
</script>

<div class="max-h-[80vh] space-y-6 overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
	<Dashboard />
	<Ecommerce />
	<Docs />
	<MegaMenu />
	<Announcement />
	<Mobile />
</div>
