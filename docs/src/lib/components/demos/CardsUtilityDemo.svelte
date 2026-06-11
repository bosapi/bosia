<script lang="ts">
	import Notification from "$blocks/cards/notification/block.svelte";
	import Weather from "$blocks/cards/weather/block.svelte";
	import Event from "$blocks/cards/event/block.svelte";
	import File from "$blocks/cards/file/block.svelte";
	import Task from "$blocks/cards/task/block.svelte";
	import Storage from "$blocks/cards/storage/block.svelte";
	import Code from "$blocks/cards/code/block.svelte";
	import Map from "$blocks/cards/map/block.svelte";
	import Integration from "$blocks/cards/integration/block.svelte";
	import Poll from "$blocks/cards/poll/block.svelte";
	import Stepper from "$blocks/cards/stepper/block.svelte";
	import Chat from "$blocks/cards/chat/block.svelte";
</script>

<div class="flex flex-wrap items-start justify-center gap-5 p-6">
	<Notification />
	<Weather />
	<Event />
	<File />
	<Task />
	<Storage />
	<Code />
	<Map />
	<Integration />
	<Poll />
	<Stepper />
	<Chat />
</div>
