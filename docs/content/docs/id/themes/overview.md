---
title: Themes
description: Kumpulan token yang menggerakkan warna, font, dan radius di setiap block dan primitif. Ganti tema tanpa menyentuh komponen.
---

## Apa itu themes

Sebuah tema adalah file `tokens.css` yang mendefinisikan custom property `@theme` Tailwind v4 — `--color-background`, `--color-card`, `--font-display`, `--radius-lg`, dan seterusnya. Block dan primitif merujuk token ini secara semantik (`bg-card`, `font-display`), tidak pernah nilai mentah. Ganti tema → semuanya berganti gaya.

## Install

```bash
bun x bosia@latest add theme editorial
```

CLI menyalin token ke `src/lib/themes/<name>.css` dan menulis ulang import aktif di `src/app.css`. Hanya satu tema yang aktif pada satu waktu (v1).

## Tema yang tersedia

- [neutral](/docs/themes/neutral/) — palet default terinspirasi shadcn + tumpukan sistem
- [editorial](/docs/themes/editorial/) — krem hangat + display Instrument Serif
- [zinc](/docs/themes/zinc/) — biru-abu sejuk, estetika developer-tool
- [stone](/docs/themes/stone/) — abu hangat, estetika dokumen dan penerbitan
- [claude](/docs/themes/claude/) — palet violet, estetika asisten AI dan produktivitas
- [ocean](/docs/themes/ocean/) — navy pekat + teal, estetika SaaS dan aplikasi data
- [forest](/docs/themes/forest/) — hijau earthy + amber, estetika alam dan keberlanjutan
- [rose](/docs/themes/rose/) — palet rose, estetika kreatif dan gaya hidup
- [sunset](/docs/themes/sunset/) — oranye hangat + aksen pink, estetika konsumen dan marketing
- [midnight](/docs/themes/midnight/) — indigo, estetika dashboard dan analitik dark-first
- [mono](/docs/themes/mono/) — monokrom brutalist, sudut tajam + tumpukan monospace
- [amber](/docs/themes/amber/) — amber + kuning, estetika hospitality dan makanan yang nyaman
- [paper](/docs/themes/paper/) — netral cardstock hangat + brand ink-blue, nuansa editorial bersih
- [carbon](/docs/themes/carbon/) — mono brutalist, bayangan offset keras + brand oranye
- [bloom](/docs/themes/bloom/) — pink pastel lembut, radius besar + bayangan bernuansa difus
- [terminal](/docs/themes/terminal/) — fosfor hijau gelap, display mono + kilau aksen
- [sage](/docs/themes/sage/) — hijau redup yang tenang, radius kecil + bayangan kalem
- [grape](/docs/themes/grape/) — ungu lilac gelap dengan kilau aksen lembut

## Membuat tema

Lihat [Membuat tema](/docs/themes/creating-themes/).
