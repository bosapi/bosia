---
title: WebSocket
description: Koneksi dua arah yang tahan lama dari route +server.ts — auth lewat hooks, frame teks dan binary, backpressure, dan shutdown yang rapi. Khusus Bun.
---

Route `+server.ts` bisa menerima koneksi WebSocket dengan mengekspor `websocket`. Upgrade melewati pipeline request yang biasa dulu, jadi `hooks.server.ts`, `locals`, cookie, `BASE_PATH` dan `params` route berjalan seperti request lainnya.

```ts
// src/routes/rig/[id]/+server.ts
import type { WebSocketHandler } from "./$types";

type Conn = { rigId: string; user: string };

export const websocket: WebSocketHandler<Conn> = {
	// Jalan setelah hooks.server.ts. Kembalikan data koneksi, atau Response untuk menolak.
	async upgrade({ params, locals }) {
		if (!locals.user) return new Response(null, { status: 401 });
		return { rigId: params.id, user: locals.user.id };
	},
	open(ws) {
		ws.subscribe(`rig:${ws.data.rigId}`);
	},
	message(ws, msg) {
		// string untuk frame teks, Buffer untuk frame binary
		ws.publish(`rig:${ws.data.rigId}`, msg);
	},
	close(ws, code, reason) {},
};
```

`ws` adalah [`ServerWebSocket`](https://bun.sh/docs/api/websockets) milik Bun: `send`, `sendText`, `sendBinary`, `close(code, reason)`, `ping`, `getBufferedAmount()`, `subscribe`/`publish` dan `ws.data` berjalan seperti di dokumentasi Bun. Handler yang bisa diekspor: `upgrade`, `open`, `message`, `drain`, `close`, `ping` dan `pong`. Semuanya opsional.

Satu route boleh mengekspor `websocket` bersama `GET`/`POST`. `GET` atau `HEAD` biasa ke route yang hanya punya `websocket` dapat `426 Upgrade Required`.

:::note[Khusus Bun]
WebSocket butuh runtime Bun. Export `websocket` membuat build Cloudflare Workers gagal dengan pesan yang jelas.
:::

## Auth dan `upgrade()`

`upgrade(event)` menerima event yang sama dengan handler API (`request`, `url`, `params`, `locals`, `cookies`, `platform`) dan boleh `async`, misalnya untuk mencari token di database.

- **Kembalikan object** → jadi `ws.data`, object yang sama persis (boleh disimpan di registry). Kembalikan **object baru untuk tiap koneksi**.
- **Kembalikan `Response`** → koneksi ditolak dengan response itu (misal `401`).
- **Tidak mengembalikan apa-apa** → `ws.data` berisi `{}`.
- **Throw** → dijawab seperti handler API: `error(403)` jadi `403`, `redirect()` jadi 3xx, selain itu `500`.

Browser tidak bisa membaca status WebSocket yang ditolak: ia hanya melihat event `error` dan close dengan kode `1006`. Klien non-browser (Bun, Node) bisa melihat statusnya.

### Cookie saat upgrade

Cookie yang diset hook `handle` **sebelum** `await resolve(event)` (misal sesi yang diperbarui) ikut terkirim di response `101`. Cookie yang diset **setelah** `resolve()` selesai hilang — `101` sudah terkirim. Header yang ditambahkan hook ke response dari `resolve()` diabaikan untuk upgrade.

## Pengecekan Origin

Request `GET` dilewati oleh pengecekan CSRF, padahal halaman dari situs lain tetap bisa membuka WebSocket yang membawa cookie pengguna. Karena itu upgrade punya pengecekan origin sendiri:

- `Origin` yang bukan situs kamu → `403`.
- `CSRF_ALLOWED_ORIGINS` dan `CSRF_EXEMPT_PATHS` berlaku seperti untuk form.
- **Tanpa `Origin` sama sekali diterima.** Browser selalu mengirimnya; request tanpa Origin datang dari klien non-browser (CLI, perangkat) yang tidak membawa cookie otomatis. Autentikasi klien seperti itu dengan token (header `Authorization`) di hook.

## Frame dan backpressure

Frame teks datang sebagai `string`, frame binary sebagai `Buffer` — byte mentah (misal output PTY) sampai tanpa berubah.

`ws.send()` mengembalikan jumlah byte yang terkirim, `-1` kalau data diantrekan karena klien lambat (backpressure), atau `0` kalau data dibuang — terjadi begitu antrean melewati `WS_BACKPRESSURE_LIMIT`. Jadi saat `-1`, berhenti mengirim dan tunggu `drain`:

```ts
export const websocket: WebSocketHandler<{ pty: Pty }> = {
	message(ws, msg) {
		ws.data.pty.write(msg);
	},
	open(ws) {
		ws.data.pty.onData((chunk) => {
			if (ws.send(chunk) === -1) ws.data.pty.pause();
		});
	},
	drain(ws) {
		ws.data.pty.resume();
	},
};
```

`ws.getBufferedAmount()` memberi tahu berapa byte yang masih mengantre.

## Error

Handler yang throw (atau mengembalikan promise yang reject) menutup socket itu dengan `1011` dan mencatat error-nya. Server tetap berjalan.

## Shutdown dan restart

| Kapan                                   | Kode close   | Yang sebaiknya dilakukan klien  |
| --------------------------------------- | ------------ | ------------------------------- |
| Server berhenti (`SIGTERM`, deploy)     | `1001`       | Sambung ulang (dengan backoff)  |
| Rebuild dev (`bun run dev` restart app) | `1012`       | Sambung ulang ke build baru     |
| Error di handler                        | `1011`       | Sambung ulang, mungkin laporkan |
| `ws.close(4xxx, …)` milik kamu          | sesuai kirim | Sesuai protokol kamu            |

Upgrade yang masih berada di dalam `upgrade()` async saat server berhenti tetap terbuka — jadi `open` dan `close` jalan dan kamu bisa membersihkan — lalu langsung ditutup dengan `1001`.

Sambung ulang dengan backoff (misal 0,5 dtk, 1 dtk, 2 dtk … sampai 30 dtk) supaya server yang sedang restart tidak dibanjiri.

## Dev server

`bun run dev` meneruskan WebSocket ke app: proxy tersambung ke app dulu, baru menerima klien, jadi browser melihat penolakan sama seperti di production. Frame teks dan binary serta kode close diteruskan tanpa berubah. Beda khusus dev: handshake yang ditolak dijawab `502`, bukan status dari app (hanya klien non-browser yang bisa melihatnya), cookie yang diset app di `101` tidak sampai ke klien, dan tidak ada backpressure di hop proxy.

## Access log dan `onResponse`

Upgrade tidak punya `Response` sungguhan (`101` tidak bisa dibuat), jadi observer `onResponse` menerima `status: 101` dan `upgraded: true`. Baca `status`, bukan `response.status`. Access log bawaan sudah begitu.

## Batas

| Variabel                | Default | Arti                                                         |
| ----------------------- | ------- | ------------------------------------------------------------ |
| `WS_MAX_PAYLOAD`        | `16M`   | Frame terbesar yang diterima                                 |
| `WS_IDLE_TIMEOUT`       | `120`   | Detik tanpa frame sebelum socket ditutup (Bun ping otomatis) |
| `WS_BACKPRESSURE_LIMIT` | `16M`   | Byte yang diantrekan untuk klien lambat                      |
| `WS_COMPRESS`           | `false` | Kompresi `permessage-deflate`                                |

Socket yang terbuka tidak dihitung ke `MAX_INFLIGHT`; hanya request upgrade-nya.

Subprotocol belum didukung. Bosia belum bisa menjawab `new WebSocket(url, ["chat"])`, jadi browser menggagalkan handshake. Server menulis peringatan di log saat sebuah route pertama kali menerimanya.

## Menjalankan ulang loader saat ada pesan

Untuk memperbarui data halaman saat pesan datang, panggil `invalidate()` di `onmessage` browser — lihat [Invalidasi Data](/id/guides/data-invalidation).
