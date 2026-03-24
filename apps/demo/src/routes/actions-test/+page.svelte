<script lang="ts">
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="max-w-md mx-auto mt-10 p-6">
  <h1 class="text-2xl font-bold mb-4">{data.greeting}</h1>

  {#if form?.success}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      Welcome, {form.name} ({form.email})!
    </div>
  {/if}

  {#if form?.cleared}
    <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
      Form cleared.
    </div>
  {/if}

  <form method="POST" class="space-y-4">
    <div>
      <label for="name" class="block text-sm font-medium">Name</label>
      <input
        id="name"
        name="name"
        type="text"
        value={form?.name ?? ''}
        class="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
      />
      {#if form?.errors?.name}
        <p class="text-red-500 text-sm mt-1">{form.errors.name}</p>
      {/if}
    </div>

    <div>
      <label for="email" class="block text-sm font-medium">Email</label>
      <input
        id="email"
        name="email"
        type="text"
        value={form?.email ?? ''}
        class="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
      />
      {#if form?.errors?.email}
        <p class="text-red-500 text-sm mt-1">{form.errors.email}</p>
      {/if}
    </div>

    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Submit
    </button>
  </form>

  <form method="POST" action="?/reset" class="mt-4">
    <button type="submit" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
      Reset (named action)
    </button>
  </form>
</div>
