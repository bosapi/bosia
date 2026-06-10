// Dev-only 500 response with an embedded SSE reload client.
//
// Without this, a bare text/JSON 500 leaves the browser stuck on the error
// page even after the next successful build — the SSE reload event has no
// listener attached, so the user must manually reload to see the recovered
// route. Returning HTML with the same SSE subscriber that hydrate.ts uses
// closes the loop: fix the source → next build → SSE "reload" → location.reload().

import { escapeHtml, safeJsonForScript } from "./html.ts";
import { loadPlugins } from "./config.ts";
import type { BosiaPlugin, RenderContext } from "./types/plugin.ts";

// Mirrors renderer.ts:pluginRenderFragments but lives here so server.ts can
// reach it without importing renderer (which would pull in the whole SSR graph
// just for an error response).
async function bodyEndFragments(ctx: RenderContext): Promise<string[]> {
	const plugins = await loadPlugins();
	const out: string[] = [];
	for (const p of plugins as BosiaPlugin[]) {
		const fn = p.render?.bodyEnd;
		if (!fn) continue;
		try {
			const fragment = await fn(ctx);
			if (fragment) out.push(fragment);
		} catch {
			// A broken plugin render must not mask the original error we're
			// reporting; swallow and continue with the remaining fragments.
		}
	}
	return out;
}

// Wraps dev500Response with the inspector overlay (and any other plugin
// bodyEnd fragments) pre-attached. Use from catch sites that don't already
// have a RenderContext on hand.
export async function dev500WithPlugins(
	opts: Omit<Dev500Options, "bodyEndExtras"> & { url: URL },
): Promise<Response> {
	const ctx: RenderContext = {
		request: opts.request,
		url: opts.url,
		route: { pattern: "" },
		metadata: null,
	};
	const bodyEndExtras = await bodyEndFragments(ctx);
	return dev500Response({ ...opts, bodyEndExtras });
}

export interface Dev500Options {
	request: Request;
	status?: number;
	message: string;
	detail?: string;
	// Plugin bodyEnd fragments (e.g. the inspector overlay). The renderer
	// already computes these for the normal error path; pass them through so
	// the red-badge runtime error reporter stays attached on the fallback page.
	bodyEndExtras?: string[];
}

export function dev500Response({
	request,
	status = 500,
	message,
	detail,
	bodyEndExtras,
}: Dev500Options): Response {
	// JSON clients (fetch loaders, API consumers) still get JSON — only browser
	// navigations land on the HTML auto-reload page.
	const accept = request.headers.get("accept") ?? "";
	if (!accept.includes("text/html")) {
		return Response.json({ error: message, ...(detail ? { detail } : {}) }, { status });
	}

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${status} — ${escapeHtml(message)}</title>
  <style>
    html,body{margin:0;padding:0;height:100%;background:#0a0a0a;color:#e5e5e5;font:14px/1.5 ui-sans-serif,system-ui,-apple-system,sans-serif}
    .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
    .card{max-width:720px;width:100%}
    .dot{display:inline-block;width:10px;height:10px;background:#dc2626;border-radius:50%;margin-right:8px;vertical-align:middle;animation:p 1.4s ease-in-out infinite}
    @keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
    h1{font-size:18px;font-weight:600;margin:0 0 12px}
    p{margin:0 0 8px;color:#a3a3a3;font-size:13px}
    pre{margin:12px 0 0;padding:12px;background:#1a1a1a;border:1px solid #262626;border-radius:4px;color:#fafafa;font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;word-break:break-word;max-height:50vh;overflow:auto}
    .hint{font-size:12px;color:#737373;margin-top:12px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1><span class="dot"></span>${status} ${escapeHtml(message)}</h1>
      <p>The server threw while rendering this route. Fix the source and this page will reload automatically when the next build succeeds.</p>
      ${detail ? `<pre>${escapeHtml(detail)}</pre>` : ""}
      <p class="hint">Auto-reload listens on <code>/__bosia/sse</code>. Reconnects every 2s if the dev server is restarting.</p>
    </div>
  </div>
  <script>
    !function r(){
      try{
        var e=new EventSource("/__bosia/sse");
        e.addEventListener("reload",function(){location.reload()});
        e.onerror=function(){e.close();setTimeout(r,2000)};
      }catch(_){setTimeout(r,2000)}
    }();
  </script>
  <script type="application/json" id="__bosia-dev-errors__">${safeJsonForScript([
		{
			id: `dev500-${Date.now()}`,
			ts: Date.now(),
			source: "server",
			message,
			stack: detail,
		},
	])}</script>
  ${bodyEndExtras?.join("\n") ?? ""}
</body>
</html>`;

	return new Response(html, {
		status,
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
}
