<script lang="ts">
    import "../app.css";
    let { children }: { children: any } = $props();
</script>

<svelte:head>
    <script>
        if (localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark");
        }
    </script>
</svelte:head>

{@render children()}
