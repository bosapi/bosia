<script lang="ts">
	import DocsNavbar from "./DocsNavbar.svelte";
	import DocsSearch from "./DocsSearch.svelte";
	import { localizeUrl, type Locale } from "$lib/docs/i18n";
	import { Button } from "$registry/button";
	import { Badge } from "$registry/badge";
	import { Input } from "$registry/input";
	import { Switch } from "$registry/switch";
	import {
		ArrowRight,
		Blocks,
		Braces,
		Check,
		Copy,
		FolderTree,
		ShieldCheck,
		Waves,
		Zap,
	} from "@lucide/svelte";

	let {
		version,
		locale,
		switchLocaleUrl,
	}: { version: string; locale: Locale; switchLocaleUrl: string } = $props();

	let searchOpen = $state(false);

	const strings = {
		en: {
			badge: "Production Ready",
			headline1: "The fullstack framework",
			headline2: "for",
			sub: "Production-ready out of the box — built-in security, performance, and reliability. File-based routing, streaming SSR, and a component registry included.",
			ctaStart: "Get Started",
			ctaComponents: "Browse Components",
			featuresTitle: "Everything you need",
			featuresSub: "A complete framework with batteries included.",
			features: [
				{
					title: "Bun-powered",
					desc: "Instant dev server, fast builds, and a single runtime for everything.",
				},
				{
					title: "File-based routing",
					desc: "+page.svelte, +layout.svelte, +server.ts — just like SvelteKit.",
				},
				{
					title: "Streaming SSR",
					desc: "Render HTML as it streams with non-blocking metadata and layouts.",
				},
				{
					title: "Secure by default",
					desc: "CSRF protection, XSS escaping, and security headers — zero config.",
				},
				{
					title: "Component registry",
					desc: "Add shadcn-style components with `bun x bosia@latest add button`.",
				},
				{
					title: "TypeScript first",
					desc: "Auto-generated PageData and LayoutData types for every route.",
				},
			],
			showcaseTitle: "A component registry, built in",
			showcaseSub:
				"60+ accessible, themeable components you copy into your project — shadcn-style, owned by you, styled with Tailwind.",
			showcaseLive: "Live preview",
			showcaseBrowse: "Browse all components",
			showcaseInput: "you@example.com",
			showcaseSwitch: "Enable notifications",
			quickTitle: "Get started in seconds",
			steps: [
				{ label: "Create a new project", code: "bun x bosia@latest create my-app" },
				{ label: "Start the dev server", code: "cd my-app && bun run dev" },
				{ label: "Add a component", code: "bun x bosia@latest add button" },
			],
			quickLink: "Read the full getting started guide",
			stackTitle: "Built on proven foundations",
			stackSub: "Bosia is a thin, opinionated layer on top of tools you already love.",
			stack: [
				{ name: "Bun", role: "Runtime & bundler", url: "https://bun.sh" },
				{ name: "Svelte 5", role: "UI with runes", url: "https://svelte.dev" },
				{ name: "ElysiaJS", role: "HTTP server", url: "https://elysiajs.com" },
			],
			ctaTitle: "Ready to build?",
			ctaSub: "Start your first Bosia project today.",
			footer: "Built with Bosia",
		},
		id: {
			badge: "Siap Produksi",
			headline1: "Framework fullstack",
			headline2: "untuk",
			sub: "Siap produksi sejak awal — keamanan, performa, dan keandalan sudah terpasang. Lengkap dengan file-based routing, streaming SSR, dan registri komponen.",
			ctaStart: "Mulai Sekarang",
			ctaComponents: "Jelajahi Komponen",
			featuresTitle: "Semua yang Anda butuhkan",
			featuresSub: "Framework lengkap yang siap pakai.",
			features: [
				{
					title: "Ditenagai Bun",
					desc: "Dev server instan, build cepat, dan satu runtime untuk segalanya.",
				},
				{
					title: "File-based routing",
					desc: "+page.svelte, +layout.svelte, +server.ts — seperti SvelteKit.",
				},
				{
					title: "Streaming SSR",
					desc: "Render HTML sambil dialirkan (streaming) dengan metadata non-blocking.",
				},
				{
					title: "Aman dari awal",
					desc: "Proteksi CSRF, XSS escaping, dan security headers — tanpa konfigurasi.",
				},
				{
					title: "Registri komponen",
					desc: "Tambahkan komponen bergaya shadcn dengan `bun x bosia@latest add button`.",
				},
				{
					title: "TypeScript first",
					desc: "Tipe PageData dan LayoutData dibuat otomatis untuk setiap rute.",
				},
			],
			showcaseTitle: "Registri komponen, bawaan framework",
			showcaseSub:
				"60+ komponen aksesibel dan bisa di-theme — disalin ke proyek Anda, sepenuhnya milik Anda, ditata dengan Tailwind.",
			showcaseLive: "Pratinjau langsung",
			showcaseBrowse: "Jelajahi semua komponen",
			showcaseInput: "anda@contoh.com",
			showcaseSwitch: "Aktifkan notifikasi",
			quickTitle: "Mulai dalam hitungan detik",
			steps: [
				{ label: "Buat proyek baru", code: "bun x bosia@latest create my-app" },
				{ label: "Jalankan dev server", code: "cd my-app && bun run dev" },
				{ label: "Tambahkan komponen", code: "bun x bosia@latest add button" },
			],
			quickLink: "Baca panduan memulai selengkapnya",
			stackTitle: "Dibangun di atas teknologi terpercaya",
			stackSub: "Bosia adalah lapisan tipis di atas perlengkapan yang sudah Anda sukai.",
			stack: [
				{ name: "Bun", role: "Runtime & bundler", url: "https://bun.sh" },
				{ name: "Svelte 5", role: "UI dengan runes", url: "https://svelte.dev" },
				{ name: "ElysiaJS", role: "HTTP server", url: "https://elysiajs.com" },
			],
			ctaTitle: "Siap untuk membangun?",
			ctaSub: "Mulai proyek Bosia pertama Anda hari ini.",
			footer: "Dibangun dengan Bosia",
		},
	};

	const t = strings[locale];
	const href = (slug: string) => localizeUrl(slug, locale);

	const featureIcons = [Zap, FolderTree, Waves, ShieldCheck, Blocks, Braces];
	const features = t.features.map((f, i) => ({ ...f, icon: featureIcons[i] }));

	// Hand-highlighted code for the hero editor window (static, author-controlled).
	const kw = "text-sky-400";
	const str = "text-emerald-400";
	const fn = "text-violet-300";
	const ty = "text-amber-300";
	const cm = "text-zinc-500";
	const tabs = [
		{
			name: "+page.server.ts",
			html: `<span class="${cm}">// runs on the server — data is typed on the page</span>
<span class="${kw}">import type</span> { <span class="${ty}">LoadEvent</span> } <span class="${kw}">from</span> <span class="${str}">"bosia"</span>;
<span class="${kw}">import</span> { getPosts } <span class="${kw}">from</span> <span class="${str}">"$lib/posts"</span>;

<span class="${kw}">export async function</span> <span class="${fn}">load</span>({ params }: <span class="${ty}">LoadEvent</span>) {
  <span class="${kw}">const</span> posts = <span class="${kw}">await</span> <span class="${fn}">getPosts</span>();
  <span class="${kw}">return</span> { posts };
}

<span class="${kw}">export function</span> <span class="${fn}">metadata</span>() {
  <span class="${kw}">return</span> { title: <span class="${str}">"My Blog"</span> };
}`,
		},
		{
			name: "+page.svelte",
			html: `&lt;<span class="${kw}">script</span> <span class="${ty}">lang</span>=<span class="${str}">"ts"</span>&gt;
  <span class="${kw}">let</span> { data } = <span class="${fn}">$props</span>();
&lt;/<span class="${kw}">script</span>&gt;

&lt;<span class="${kw}">h1</span>&gt;Latest posts&lt;/<span class="${kw}">h1</span>&gt;

{<span class="${kw}">#each</span> data.posts <span class="${kw}">as</span> post}
  &lt;<span class="${kw}">article</span>&gt;{post.title}&lt;/<span class="${kw}">article</span>&gt;
{<span class="${kw}">/each</span>}`,
		},
	];
	let activeTab = $state(0);

	const installCmd = "bun x bosia@latest create my-app";
	let copied = $state(false);
	function copyInstall() {
		navigator.clipboard?.writeText(installCmd);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	let notifications = $state(true);
</script>

<div class="min-h-screen flex flex-col">
	<DocsNavbar {version} {locale} {switchLocaleUrl} onSearch={() => (searchOpen = true)} />

	<DocsSearch bind:open={searchOpen} {locale} />

	<!-- Hero -->
	<section class="relative overflow-hidden px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
		<div
			class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.6)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.6)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_20%,transparent_100%)]"
		></div>
		<div
			class="absolute left-1/2 top-0 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
		></div>

		<div class="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
			<div class="space-y-6 text-center lg:text-left">
				<div
					class="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
					{version} — {t.badge}
				</div>
				<h1 class="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1]">
					{t.headline1}<br />{t.headline2} <span class="text-primary">Bun + Svelte</span>
				</h1>
				<p class="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
					{t.sub}
				</p>
				<div class="flex flex-wrap gap-3 justify-center lg:justify-start">
					<a href={href("getting-started")}>
						<Button size="lg">
							{t.ctaStart}
							<ArrowRight class="ml-1 h-4 w-4" />
						</Button>
					</a>
					<a href={href("components/overview")}>
						<Button variant="outline" size="lg">{t.ctaComponents}</Button>
					</a>
				</div>
				<div
					class="inline-flex items-center gap-3 rounded-lg border border-border bg-muted/50 py-2 pl-4 pr-2 font-mono text-sm text-muted-foreground"
				>
					<span class="text-primary select-none">$</span>
					<span class="select-all">{installCmd}</span>
					<button
						onclick={copyInstall}
						class="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent hover:text-foreground transition-colors"
						aria-label="Copy install command"
					>
						{#if copied}
							<Check class="h-3.5 w-3.5 text-emerald-500" />
						{:else}
							<Copy class="h-3.5 w-3.5" />
						{/if}
					</button>
				</div>
			</div>

			<!-- Editor window -->
			<div class="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
				<div class="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
					<div class="flex gap-1">
						{#each tabs as tab, i}
							<button
								onclick={() => (activeTab = i)}
								class="rounded-md px-2.5 py-1 font-mono text-xs transition-colors {activeTab === i
									? 'bg-zinc-800 text-zinc-100'
									: 'text-zinc-500 hover:text-zinc-300'}"
							>
								{tab.name}
							</button>
						{/each}
					</div>
					<span class="ml-auto hidden font-mono text-xs text-zinc-600 sm:block">src/routes/</span>
				</div>
				<pre
					class="min-h-[268px] overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-zinc-300">{@html tabs[
						activeTab
					].html}</pre>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section class="px-4 py-20 border-t border-border">
		<div class="mx-auto max-w-5xl">
			<h2 class="text-3xl font-bold text-center mb-4">{t.featuresTitle}</h2>
			<p class="text-center text-muted-foreground mb-12">{t.featuresSub}</p>
			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
				{#each features as f}
					<div
						class="group rounded-xl border border-border p-5 space-y-3 transition-all hover:border-primary/40 hover:shadow-md"
					>
						<div
							class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
						>
							<f.icon class="h-5 w-5" />
						</div>
						<h3 class="font-semibold">{f.title}</h3>
						<p class="text-sm text-muted-foreground">{f.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Component registry showcase -->
	<section class="px-4 py-20 border-t border-border bg-muted/30">
		<div class="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
			<div class="space-y-5">
				<h2 class="text-3xl font-bold">{t.showcaseTitle}</h2>
				<p class="text-muted-foreground">{t.showcaseSub}</p>
				<div
					class="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 font-mono text-sm text-muted-foreground"
				>
					<span class="text-primary select-none">$</span>
					<span class="select-all">bun x bosia@latest add button</span>
				</div>
				<div>
					<a
						href={href("components/overview")}
						class="inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4"
					>
						{t.showcaseBrowse}
						<ArrowRight class="h-3.5 w-3.5" />
					</a>
				</div>
			</div>
			<div class="rounded-xl border border-border bg-background p-6 shadow-sm">
				<div class="mb-5 flex items-center justify-between">
					<span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						{t.showcaseLive}
					</span>
					<span class="flex items-center gap-1.5 text-xs text-muted-foreground">
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
						60+ components
					</span>
				</div>
				<div class="space-y-5">
					<div class="flex flex-wrap items-center gap-2">
						<Button size="sm">Button</Button>
						<Button size="sm" variant="secondary">Secondary</Button>
						<Button size="sm" variant="outline">Outline</Button>
						<Button size="sm" variant="destructive">Destructive</Button>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<Badge>Badge</Badge>
						<Badge variant="secondary">Secondary</Badge>
						<Badge variant="outline">Outline</Badge>
					</div>
					<Input placeholder={t.showcaseInput} />
					<label class="flex items-center justify-between gap-4 text-sm">
						{t.showcaseSwitch}
						<Switch bind:checked={notifications} />
					</label>
				</div>
			</div>
		</div>
	</section>

	<!-- Quick Start -->
	<section class="px-4 py-20 border-t border-border">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-3xl font-bold text-center mb-12">{t.quickTitle}</h2>
			<div
				class="relative space-y-8 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-px before:bg-border"
			>
				{#each t.steps as s, i}
					<div class="relative flex gap-4 items-start">
						<div
							class="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold"
						>
							{i + 1}
						</div>
						<div class="flex-1 space-y-1.5 pt-1">
							<p class="text-sm font-medium">{s.label}</p>
							<div
								class="rounded-lg bg-muted/50 border border-border px-4 py-2.5 font-mono text-sm text-muted-foreground"
							>
								<span class="text-primary select-none">$ </span><span class="select-all"
									>{s.code}</span
								>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="text-center mt-10">
				<a
					href={href("getting-started")}
					class="inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4"
				>
					{t.quickLink}
					<ArrowRight class="h-3.5 w-3.5" />
				</a>
			</div>
		</div>
	</section>

	<!-- Tech Stack -->
	<section class="px-4 py-20 border-t border-border">
		<div class="mx-auto max-w-3xl text-center space-y-12">
			<div>
				<h2 class="text-3xl font-bold mb-4">{t.stackTitle}</h2>
				<p class="text-muted-foreground">{t.stackSub}</p>
			</div>
			<div class="grid sm:grid-cols-3 gap-6">
				{#each t.stack as s}
					<a
						href={s.url}
						target="_blank"
						rel="noopener"
						class="group rounded-xl border border-border p-6 text-center transition-all hover:border-primary/40 hover:shadow-md"
					>
						<div class="text-xl font-bold group-hover:text-primary transition-colors">
							{s.name}
						</div>
						<div class="text-sm text-muted-foreground mt-1">{s.role}</div>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="px-4 pb-20 pt-4">
		<div
			class="mx-auto max-w-3xl rounded-2xl border border-border bg-gradient-to-b from-muted/60 to-background px-6 py-16 text-center space-y-4"
		>
			<h2 class="text-3xl font-bold">{t.ctaTitle}</h2>
			<p class="text-muted-foreground">{t.ctaSub}</p>
			<div class="flex flex-wrap gap-3 justify-center pt-2">
				<a href={href("getting-started")}>
					<Button size="lg">
						{t.ctaStart}
						<ArrowRight class="ml-1 h-4 w-4" />
					</Button>
				</a>
				<a href="https://github.com/bosapi/bosia" target="_blank" rel="noopener">
					<Button variant="outline" size="lg">GitHub</Button>
				</a>
			</div>
		</div>
	</section>

	<footer class="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
		{t.footer} ·
		<a href={href("reference/changelog")} class="hover:text-foreground transition-colors"
			>{version}</a
		>
	</footer>
</div>
