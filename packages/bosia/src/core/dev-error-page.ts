import { safeJsonForScript } from "./html.ts";
import { getOverlayScript } from "./plugins/inspector/overlay.ts";

export interface DevServerError {
	id: string;
	ts: number;
	source: string;
	message: string;
	stack?: string;
	file?: string;
	line?: number;
	col?: number;
}

/**
 * Minimal HTML shown when the dev proxy can't reach the app server (initial
 * build failure, crash loop, port conflict). Mounts the same inspector overlay
 * so the red error badge appears identical to the in-app experience, pre-seeds
 * the buffered errors that fired before the page loaded, and subscribes to the
 * dev SSE channel so it auto-reloads when the next build succeeds.
 */
export function renderDevErrorPage(buffered: DevServerError[]): string {
	const overlay = getOverlayScript({ endpoint: "/__bosia/locate", errorsEnabled: true });
	const seed = safeJsonForScript(buffered);

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev server error — Bosia</title>
  <style>
    html,body{margin:0;padding:0;height:100%;background:#0a0a0a;color:#e5e5e5;font:14px/1.5 ui-sans-serif,system-ui,-apple-system,sans-serif}
    .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
    .card{max-width:540px;text-align:center}
    .dot{display:inline-block;width:10px;height:10px;background:#dc2626;border-radius:50%;margin-right:8px;vertical-align:middle;animation:p 1.4s ease-in-out infinite}
    @keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
    h1{font-size:18px;font-weight:600;margin:0 0 8px}
    p{margin:0;color:#a3a3a3;font-size:13px}
    code{font-family:ui-monospace,monospace;color:#fafafa;background:#1f1f1f;padding:1px 6px;border-radius:3px}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1><span class="dot"></span>Dev server error</h1>
      <p>See the red badge in the bottom-right for details. This page will reload automatically when the next build succeeds.</p>
    </div>
  </div>
  <script type="application/json" id="__bosia-dev-errors__">${seed}</script>
  ${overlay}
  <script>
    (function(){
      function seed(){
        var node=document.getElementById("__bosia-dev-errors__");
        if(!node||!window.__BOSIA_PUSH_ERROR__)return false;
        try{
          var list=JSON.parse(node.textContent||"[]");
          for(var i=0;i<list.length;i++)window.__BOSIA_PUSH_ERROR__(list[i]);
        }catch(_){}
        return true;
      }
      if(!seed()){
        var tries=0;
        var iv=setInterval(function(){tries++;if(seed()||tries>20)clearInterval(iv)},50);
      }
      !function r(){
        try{
          var e=new EventSource("/__bosia/sse");
          e.addEventListener("reload",function(){location.reload()});
          e.onerror=function(){e.close();setTimeout(r,2000)};
        }catch(_){setTimeout(r,2000)}
      }();
    })();
  </script>
</body>
</html>`;
}
