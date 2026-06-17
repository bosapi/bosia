---
title: Creating themes
description: Buat tema Bosia Anda sendiri — kontrak token, tata letak file, dan integrasi CLI.
---

## Kontrak token

Block mengonsumsi token ini berdasarkan nama semantik. Selama Anda mendefinisikannya, setiap block berganti gaya secara otomatis.

| Token                                               | Purpose                   |
| --------------------------------------------------- | ------------------------- |
| `--color-background`                                | Latar halaman             |
| `--color-foreground`                                | Teks default              |
| `--color-card` / `--color-card-foreground`          | Permukaan kartu           |
| `--color-primary` / `--color-primary-foreground`    | CTA primary               |
| `--color-muted` / `--color-muted-foreground`        | Teks sekunder, pembatas   |
| `--color-accent` / `--color-accent-foreground`      | Sorotan aksen             |
| `--color-border` / `--color-input` / `--color-ring` | Border, input, ring fokus |
| `--font-display`                                    | Heading (judul, eyebrow)  |
| `--font-body`                                       | Paragraf                  |
| `--radius`                                          | Radius dasar              |

Gunakan custom property HSL (`hsl(var(--card))`) agar modifier opasitas Tailwind seperti `bg-card/80` tetap berfungsi.

## Tata letak file

```
registry/themes/<name>/
├── tokens.css     # @theme { … } + :root + .dark variables
└── meta.json      # name, description, files[], fonts{}, npmDeps{}
```

## meta.json

```json
{
	"name": "my-theme",
	"description": "Short description shown in docs.",
	"files": ["tokens.css"],
	"fonts": {
		"Family Name": "https://fonts.googleapis.com/css2?family=Family+Name&display=swap"
	},
	"npmDeps": {}
}
```

Field `fonts` otomatis menyuntikkan baris `@import url(...)` yang idempoten ke `src/app.css` saat tema diinstal.

## Install lokal saat membuat

Dari direktori aplikasi:

```bash
bun x bosia@latest add theme my-theme --local
```

`--local` me-resolve registry dari workspace (`registry/themes/my-theme/`) alih-alih mengambil dari GitHub.

## Publish

Tambahkan `"my-theme"` ke `registry/index.json` di bawah `themes`, push ke `main`.
