<script lang="ts">
    import DocsNavbar from "$lib/components/DocsNavbar.svelte";
    import { Button } from "$registry/button";

    let { data }: { data: any } = $props();
</script>

<svelte:head>
    <title>Bosia</title>
    <meta name="description" content="Framework fullstack yang cepat dan lengkap, dibangun di atas Bun + Svelte 5 + ElysiaJS." />
</svelte:head>

<div class="min-h-screen flex flex-col">
    <DocsNavbar
        version={data.version}
        locale={data.locale}
        switchLocaleUrl={data.switchLocaleUrl}
    />

    <!-- Hero -->
    <section class="flex-1 px-4 py-24 sm:py-32 text-center">
        <div class="mx-auto max-w-3xl space-y-6">
            <div class="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground mb-2">
                {data.version} — Sekarang tersedia
            </div>
            <h1 class="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
                Framework fullstack<br />untuk <span class="text-primary">Bun + Svelte</span>
            </h1>
            <p class="text-xl text-muted-foreground max-w-xl mx-auto">
                Bangun aplikasi web siap produksi dengan file-based routing, streaming SSR, dan registri komponen bawaan.
            </p>
            <div class="flex flex-wrap gap-3 justify-center pt-2">
                <a href="/id/getting-started">
                    <Button size="lg">Mulai Sekarang →</Button>
                </a>
                <a href="/id/components/overview">
                    <Button variant="outline" size="lg">Jelajahi Komponen</Button>
                </a>
            </div>
            <!-- Quick install -->
            <div class="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 font-mono text-sm text-muted-foreground">
                <span class="text-primary select-none">$</span>
                <span class="select-all">bun create bosia my-app</span>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="px-4 py-20 border-t border-border">
        <div class="mx-auto max-w-5xl">
            <h2 class="text-3xl font-bold text-center mb-4">Semua yang Anda butuhkan</h2>
            <p class="text-center text-muted-foreground mb-12">Framework lengkap yang siap pakai.</p>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each [
                    { icon: "⚡", title: "Ditenagai Bun", desc: "Dev server instan, build cepat, dan satu runtime untuk segalanya." },
                    { icon: "🎯", title: "File-based routing", desc: "+page.svelte, +layout.svelte, +server.ts — seperti SvelteKit." },
                    { icon: "🌊", title: "Streaming SSR", desc: "Render HTML sambil dialirkan (streaming) dengan metadata non-blocking." },
                    { icon: "🔒", title: "Aman dari awal", desc: "Proteksi CSRF, XSS escaping, dan security headers — tanpa konfigurasi." },
                    { icon: "🧩", title: "Registri komponen", desc: "Tambahkan komponen bergaya shadcn dengan `bosia add button`." },
                    { icon: "📐", title: "TypeScript first", desc: "Tipe PageData dan LayoutData dibuat otomatis untuk setiap rute." },
                ] as f}
                    <div class="rounded-lg border border-border p-5 space-y-2">
                        <div class="text-2xl">{f.icon}</div>
                        <h3 class="font-semibold">{f.title}</h3>
                        <p class="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Quick Start -->
    <section class="px-4 py-20 border-t border-border bg-muted/30">
        <div class="mx-auto max-w-3xl">
            <h2 class="text-3xl font-bold text-center mb-12">Mulai dalam hitungan detik</h2>
            <div class="space-y-4">
                {#each [
                    { step: "1", label: "Buat proyek baru", code: "bun create bosia my-app" },
                    { step: "2", label: "Jalankan dev server", code: "cd my-app && bun run dev" },
                    { step: "3", label: "Tambahkan komponen", code: "bosia add button" },
                ] as s}
                    <div class="flex gap-4 items-start">
                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{s.step}</div>
                        <div class="flex-1 space-y-1">
                            <p class="text-sm font-medium">{s.label}</p>
                            <div class="rounded-md bg-background border border-border px-4 py-2 font-mono text-sm text-muted-foreground">
                                <span class="text-primary select-none">$ </span>{s.code}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
            <div class="text-center mt-8">
                <a href="/id/getting-started" class="text-sm text-primary hover:underline underline-offset-4">
                    Baca panduan memulai selengkapnya →
                </a>
            </div>
        </div>
    </section>

    <!-- Tech Stack -->
    <section class="px-4 py-20 border-t border-border">
        <div class="mx-auto max-w-3xl text-center space-y-12">
            <div>
                <h2 class="text-3xl font-bold mb-4">Dibangun di atas teknologi terpercaya</h2>
                <p class="text-muted-foreground">Bosia adalah lapisan tipis di atas perlengkapan yang sudah Anda sukai.</p>
            </div>
            <div class="grid sm:grid-cols-3 gap-8">
                {#each [
                    { name: "Bun", role: "Runtime & bundler", url: "https://bun.sh" },
                    { name: "Svelte 5", role: "UI dengan runes", url: "https://svelte.dev" },
                    { name: "ElysiaJS", role: "HTTP server", url: "https://elysiajs.com" },
                ] as t}
                    <a href={t.url} target="_blank" rel="noopener" class="group rounded-lg border border-border p-6 text-center hover:border-primary transition-colors">
                        <div class="text-xl font-bold group-hover:text-primary transition-colors">{t.name}</div>
                        <div class="text-sm text-muted-foreground mt-1">{t.role}</div>
                    </a>
                {/each}
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="px-4 py-20 border-t border-border text-center">
        <div class="mx-auto max-w-xl space-y-4">
            <h2 class="text-3xl font-bold">Siap untuk membangun?</h2>
            <p class="text-muted-foreground">Mulai proyek Bosia pertama Anda hari ini.</p>
            <div class="flex gap-3 justify-center pt-2">
                <a href="/id/getting-started"><Button size="lg">Mulai Sekarang</Button></a>
                <a href="https://github.com/bosapi/bosia" target="_blank" rel="noopener">
                    <Button variant="outline" size="lg">GitHub</Button>
                </a>
            </div>
        </div>
    </section>

    <footer class="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        Dibangun dengan Bosia · <a href="/id/reference/changelog" class="hover:text-foreground transition-colors">{data.version}</a>
    </footer>
</div>
