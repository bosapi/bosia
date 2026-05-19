import { safeJsonStringify } from "../../html.ts";

export interface OverlayConfig {
	aiEndpoint?: string;
	endpoint: string;
	errorsEnabled?: boolean;
}

export function getOverlayScript(config: OverlayConfig): string {
	const cfg = safeJsonStringify(config);
	return (
		`<script>window.__BOSIA_INSPECTOR__=${cfg};</script>\n` + `<script>${OVERLAY_IIFE}</script>`
	);
}

const OVERLAY_IIFE = `(function(){
var CFG=window.__BOSIA_INSPECTOR__||{};
var EP=CFG.endpoint||"/__bosia/locate";
var AI=CFG.aiEndpoint||null;
var ERR_ENABLED=CFG.errorsEnabled!==false;
var altDown=false,outline=null,tip=null,form=null;

function ensureOutline(){
  if(outline)return;
  outline=document.createElement("div");
  outline.style.cssText="position:fixed;pointer-events:none;border:2px solid #f73b27;background:rgba(247,59,39,.08);z-index:2147483646;border-radius:2px;transition:all .05s linear;display:none";
  document.body.appendChild(outline);
  tip=document.createElement("div");
  tip.style.cssText="position:fixed;pointer-events:none;background:#111;color:#fff;font:11px/1.4 ui-monospace,monospace;padding:3px 6px;border-radius:3px;z-index:2147483647;display:none;white-space:nowrap";
  document.body.appendChild(tip);
}
function hideOutline(){if(outline)outline.style.display="none";if(tip)tip.style.display="none"}
function showOutline(el,loc){
  ensureOutline();
  var r=el.getBoundingClientRect();
  outline.style.display="block";
  outline.style.left=r.left+"px";outline.style.top=r.top+"px";
  outline.style.width=r.width+"px";outline.style.height=r.height+"px";
  tip.style.display="block";tip.textContent=loc;
  var ty=r.top-22;if(ty<0)ty=r.bottom+4;
  tip.style.left=r.left+"px";tip.style.top=ty+"px";
}
function parseLoc(s){var m=/^(.+):(\\d+):(\\d+)$/.exec(s);if(!m)return null;return{file:m[1],line:+m[2],col:+m[3]}}
function findTarget(e){var n=e.target;while(n&&n.nodeType===1){if(n.hasAttribute&&n.hasAttribute("data-bosia-loc"))return n;n=n.parentNode}return null}

function toast(msg,err){
  var t=document.createElement("div");
  t.textContent=msg;
  t.style.cssText="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:"+(err?"#dc2626":"#111")+";color:#fff;padding:8px 14px;border-radius:6px;font:13px ui-sans-serif,system-ui,sans-serif;z-index:2147483647;box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:0;transition:opacity .15s";
  document.body.appendChild(t);
  requestAnimationFrame(function(){t.style.opacity="1"});
  setTimeout(function(){t.style.opacity="0";setTimeout(function(){t.remove()},200)},2200);
}

function send(payload,onOk,onErr){
  fetch(EP,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)})
    .then(function(r){return r.json().catch(function(){return{}})})
    .then(function(j){if(j&&j.ok){onOk&&onOk(j)}else{toast("Inspector: request failed",true);onErr&&onErr()}})
    .catch(function(){toast("Inspector: network error",true);onErr&&onErr()});
}

function closeForm(){if(form){form.remove();form=null}}
function openForm(loc,el){
  closeForm();
  var r=el.getBoundingClientRect();
  form=document.createElement("div");
  form.style.cssText="position:fixed;left:"+r.left+"px;top:"+(r.bottom+6)+"px;background:#fff;color:#111;border:1px solid #d4d4d8;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:10px;width:340px;z-index:2147483647;font:13px ui-sans-serif,system-ui,sans-serif";
  form.innerHTML='<div style="font-size:11px;color:#71717a;margin-bottom:6px;font-family:ui-monospace,monospace">'+loc.file+":"+loc.line+'</div>'+
    '<textarea placeholder="Describe a fix (Enter to send, Esc to cancel, empty = open in editor)" style="width:100%;min-height:64px;border:1px solid #e4e4e7;border-radius:4px;padding:6px;font:13px ui-sans-serif,system-ui,sans-serif;resize:vertical;box-sizing:border-box;outline:none"></textarea>'+
    '<div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end">'+
    '<button data-cancel style="padding:4px 10px;border:1px solid #e4e4e7;background:#fff;border-radius:4px;cursor:pointer;font-size:12px">Cancel</button>'+
    '<button data-send style="padding:4px 10px;border:0;background:#111;color:#fff;border-radius:4px;cursor:pointer;font-size:12px">Send</button>'+
    '</div>';
  document.body.appendChild(form);
  var ta=form.querySelector("textarea");
  ta.focus();
  function submit(){
    var comment=ta.value.trim();
    var payload={file:loc.file,line:loc.line,col:loc.col};
    if(comment)payload.comment=comment;
    send(payload,function(j){toast(j.mode==="ai"?"sent to AI":"opened "+loc.file+":"+loc.line)});
    closeForm();
  }
  form.querySelector("[data-send]").addEventListener("click",submit);
  form.querySelector("[data-cancel]").addEventListener("click",closeForm);
  ta.addEventListener("keydown",function(e){
    if(e.key==="Escape"){e.preventDefault();closeForm()}
    else if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit()}
  });
}

window.addEventListener("keydown",function(e){
  if(e.key==="Alt"||e.altKey)altDown=true;
  if(e.key==="Escape")closeForm();
},true);
window.addEventListener("keyup",function(e){if(e.key==="Alt"){altDown=false;hideOutline()}},true);
window.addEventListener("blur",function(){altDown=false;hideOutline()});

window.addEventListener("mousemove",function(e){
  if(!altDown||form){hideOutline();return}
  var el=findTarget(e);
  if(!el){hideOutline();return}
  showOutline(el,el.getAttribute("data-bosia-loc"));
},true);

window.addEventListener("click",function(e){
  if(!altDown)return;
  if(form&&form.contains(e.target))return;
  var el=findTarget(e);
  if(!el)return;
  e.preventDefault();e.stopPropagation();
  var loc=parseLoc(el.getAttribute("data-bosia-loc"));
  if(!loc)return;
  hideOutline();
  if(AI)openForm(loc,el);
  else send(loc,function(){toast("opened "+loc.file+":"+loc.line)});
},true);

// ─── Error capture + badge UI ─────────────────────────────────
if(ERR_ENABLED){
  var errors=[];
  var lastInteraction=null;
  var badge=null,panel=null,seenIds={};

  function uid(){return "c-"+Math.random().toString(36).slice(2)+Date.now().toString(36)}
  function escapeHtml(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","'":"&#39;"}[c]})}

  function parseTopFrame(stack){
    if(!stack)return null;
    var m=/\\((https?:\\/\\/[^)]+|\\/[^)]+):(\\d+):(\\d+)\\)/.exec(stack)
        ||/at\\s+(\\S+):(\\d+):(\\d+)/.exec(stack)
        ||/@(\\S+):(\\d+):(\\d+)/.exec(stack);
    return m?{file:m[1],line:+m[2],col:+m[3]}:null;
  }

  function trackInteraction(e){
    var t=e.target;
    if(!t||!t.closest)return;
    var el=t.closest("[data-bosia-loc]");
    if(el)lastInteraction=el.getAttribute("data-bosia-loc");
  }
  window.addEventListener("mousedown",trackInteraction,true);
  window.addEventListener("keydown",trackInteraction,true);

  function ensureBadge(){
    if(badge)return;
    badge=document.createElement("div");
    badge.style.cssText="position:fixed;bottom:16px;right:16px;background:#dc2626;color:#fff;font:600 12px/1 ui-sans-serif,system-ui,sans-serif;padding:8px 12px;border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,.2);cursor:pointer;z-index:2147483646;display:none;user-select:none";
    badge.addEventListener("click",togglePanel);
    document.body.appendChild(badge);
  }
  function renderBadge(){
    ensureBadge();
    if(!errors.length){badge.style.display="none";if(panel){panel.remove();panel=null}return}
    badge.style.display="block";
    badge.textContent="● "+errors.length+" error"+(errors.length===1?"":"s");
    if(panel)renderPanel();
  }
  function togglePanel(){
    if(panel){panel.remove();panel=null;return}
    renderPanel();
  }
  function renderPanel(){
    if(panel)panel.remove();
    panel=document.createElement("div");
    panel.style.cssText="position:fixed;bottom:56px;right:16px;width:420px;max-height:60vh;overflow:auto;background:#fff;color:#111;border:1px solid #e4e4e7;border-radius:8px;box-shadow:0 12px 32px rgba(0,0,0,.18);font:13px ui-sans-serif,system-ui,sans-serif;z-index:2147483647";
    var head='<div style="padding:8px 12px;border-bottom:1px solid #e4e4e7;display:flex;justify-content:space-between;align-items:center"><strong>Runtime errors</strong><button data-clear style="border:0;background:transparent;color:#71717a;font:12px ui-sans-serif,system-ui,sans-serif;cursor:pointer">Clear all</button></div>';
    var rows="";
    for(var i=0;i<errors.length;i++){
      var er=errors[i];
      var locStr=er.file?(er.file+(er.line?":"+er.line:"")):er.source;
      rows+='<div data-row="'+er.id+'" style="padding:10px 12px;border-bottom:1px solid #f4f4f5">'
        +'<div style="font:11px ui-monospace,monospace;color:#71717a;margin-bottom:4px">['+escapeHtml(er.source)+'] '+escapeHtml(locStr)+'</div>'
        +'<div style="margin-bottom:6px;font-weight:500;word-break:break-word">'+escapeHtml(er.message)+'</div>'
        +(er.stack?'<details><summary style="cursor:pointer;color:#71717a;font-size:11px">Stack</summary><pre style="margin:6px 0 0;padding:8px;background:#f4f4f5;border-radius:4px;font:11px/1.4 ui-monospace,monospace;white-space:pre-wrap;overflow:auto;max-height:200px">'+escapeHtml(er.stack)+'</pre></details>':"")
        +'<div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end">'
        +(AI?'<button data-send="'+er.id+'" style="padding:4px 10px;border:0;background:#111;color:#fff;border-radius:4px;cursor:pointer;font-size:12px">Send to AI</button>':"")
        +'<button data-dismiss="'+er.id+'" style="padding:4px 10px;border:1px solid #e4e4e7;background:#fff;border-radius:4px;cursor:pointer;font-size:12px">Dismiss</button>'
        +'</div>'
        +'</div>';
    }
    panel.innerHTML=head+(rows||'<div style="padding:16px;color:#71717a">No errors</div>');
    document.body.appendChild(panel);
    panel.querySelector("[data-clear]").addEventListener("click",function(){errors=[];seenIds={};renderBadge()});
    var sendBtns=panel.querySelectorAll("[data-send]");
    for(var s=0;s<sendBtns.length;s++)sendBtns[s].addEventListener("click",function(ev){
      var id=ev.currentTarget.getAttribute("data-send");
      sendError(id);
    });
    var dis=panel.querySelectorAll("[data-dismiss]");
    for(var d=0;d<dis.length;d++)dis[d].addEventListener("click",function(ev){
      var id=ev.currentTarget.getAttribute("data-dismiss");
      removeError(id);
    });
  }

  function removeError(id){
    for(var i=0;i<errors.length;i++)if(errors[i].id===id){errors.splice(i,1);break}
    delete seenIds[id];
    renderBadge();
  }

  function sendError(id){
    var er=null;
    for(var i=0;i<errors.length;i++)if(errors[i].id===id){er=errors[i];break}
    if(!er)return;
    var top=parseTopFrame(er.stack);
    var file=er.file||(top&&top.file)||"runtime";
    var line=er.line||(top&&top.line)||1;
    var col=er.col||(top&&top.col)||1;
    var comment="[runtime error] "+er.message+"\\n\\n"+(er.stack||"(no stack)");
    if(er.lastInteraction)comment+="\\n\\nLast user interaction: "+er.lastInteraction;
    send({file:file,line:line,col:col,comment:comment},function(){
      toast("sent to AI");
      removeError(id);
    });
  }

  function pushError(e){
    var id=e.id||uid();
    if(seenIds[id])return;
    seenIds[id]=true;
    var entry={
      id:id,
      ts:e.ts||Date.now(),
      source:e.source||"unknown",
      message:e.message||"(no message)",
      stack:e.stack,
      file:e.file,line:e.line,col:e.col,
      lastInteraction:lastInteraction
    };
    errors.push(entry);
    renderBadge();
  }

  window.addEventListener("error",function(ev){
    // ev.filename/lineno/colno point at the *dispatch site* — for delegated
    // events that's Svelte's internal events.js, not the user's handler. Prefer
    // the top frame of ev.error.stack so the resolved source path lands in
    // user code; fall back to event coords only when no stack is available.
    var stack=ev.error&&ev.error.stack;
    var top=parseTopFrame(stack);
    pushError({
      source:"window",
      message:ev.message||"Unhandled error",
      stack:stack,
      file:(top&&top.file)||ev.filename,
      line:(top&&top.line)||ev.lineno,
      col:(top&&top.col)||ev.colno
    });
  });
  window.addEventListener("unhandledrejection",function(ev){
    var reason=ev.reason;
    var stack=reason&&reason.stack;
    var loc=parseTopFrame(stack);
    pushError({
      source:"rejection",
      message:String(reason&&reason.message||reason||"Unhandled rejection"),
      stack:stack,
      file:loc&&loc.file,line:loc&&loc.line,col:loc&&loc.col
    });
  });

  try{
    var es=new EventSource("/__bosia/errors");
    es.addEventListener("bosia-error",function(ev){
      try{pushError(JSON.parse(ev.data))}catch(_){}
    });
  }catch(_){/* EventSource not available — ignore */}
}
})();`;
