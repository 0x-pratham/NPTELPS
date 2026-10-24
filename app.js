const $=s=>document.querySelector(s),app=$("#app");
let S={},sel=new Set(),timer=null;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function best(v){try{if(v!=null)localStorage.setItem("psosm_best",v);return localStorage.getItem("psosm_best")}catch(e){return null}}
function home(){clearInterval(timer);const b=best();const picked=S.weeks||new Set(Object.keys(W).map(Number));S.weeks=picked;
app.innerHTML=`<h1><span class="redact">Privacy</span> &amp; Security in Online Social Media</h1>
<p class="sub">NPTEL course noc23_cs13 · 12 weeks. ${Q.length} practice questions with explanations, grouped by week. ${b?`Best mock score: <b>${b}%</b>.`:""}</p>
<div class="card"><h2>Start practising</h2><div class="modes">
<button class="mode" id="m1"><b>Practice by week</b><span>Instant feedback and explanations. Pick weeks below.</span></button>
<button class="mode" id="m2"><b>Mock test</b><span>20 random questions, 30 minutes, score at the end.</span></button></div></div>
<div class="card"><h2>Weeks to include</h2><div class="chips" id="chips"></div>
<p class="hint">Weeks 9 to 12 of the official run are research-paper discussion, so questions there cover related policy and ethics topics.</p></div>`;
const c=$("#chips");Object.keys(W).map(Number).forEach(k=>{const n=Q.filter(q=>q[0]===k).length;if(!n)return;const e=document.createElement("button");e.className="chip";e.textContent=(k?"Week "+k+": ":"")+W[k]+" ("+n+")";e.setAttribute("aria-pressed",picked.has(k));e.onclick=()=>{picked.has(k)?picked.delete(k):picked.add(k);e.setAttribute("aria-pressed",picked.has(k))};c.appendChild(e)});
$("#m1").onclick=()=>start("practice");$("#m2").onclick=()=>start("mock")}
function start(mode){let pool=Q.filter(q=>S.weeks.has(q[0]));if(!pool.length)pool=Q.slice();shuffle(pool);if(mode==="mock")pool=pool.slice(0,20);
S.mode=mode;S.i=0;S.res=[];S.end=Date.now()+30*60000;
S.items=pool.map(q=>{const o=q[2].map((t,k)=>[t,k]);shuffle(o);const A=Array.isArray(q[3])?q[3]:[q[3]];return{w:q[0],q:q[1],o:o.map(x=>x[0]),a:A.map(k=>o.findIndex(x=>x[1]===k)),why:q[4],m:Array.isArray(q[3])}});
if(mode==="mock"){timer=setInterval(()=>{const l=S.end-Date.now();if(l<=0){clearInterval(timer);finish()}else{const t=$("#tm");if(t)t.textContent=Math.floor(l/60000)+":"+String(Math.floor(l/1000)%60).padStart(2,"0")}},500)}
show()}
function show(){const it=S.items[S.i],n=S.items.length;sel=new Set();S.locked=false;
app.innerHTML=`<div class="top"><span>Question ${S.i+1} of ${n}</span><span>${S.mode==="mock"?"Time left <b id='tm'></b>":"Practice mode"}</span></div>
<div class="prog"><i style="width:${S.i/n*100}%"></i></div>
<div class="card"><span class="tag">${it.w?"Week "+it.w:"Security"}</span><span class="tag">${it.m?"Select all that apply":"Single choice"}</span>
<p class="q">${it.q}</p><div id="opts"></div><div id="fb"></div>
<div class="row"><button class="btn ghost" id="quit">Exit</button><button class="btn" id="go" disabled>${S.mode==="mock"?(S.i===n-1?"Submit test":"Next"):"Check answer"}</button></div></div>`;
const box=$("#opts");it.o.forEach((t,k)=>{const b=document.createElement("button");b.className="opt";b.innerHTML=`<span class="k">${"ABCD"[k]}</span><span>${t}</span>`;
b.onclick=()=>{if(S.locked)return;if(it.m){sel.has(k)?sel.delete(k):sel.add(k)}else{sel=new Set([k])}[...box.children].forEach((x,j)=>x.classList.toggle("sel",sel.has(j)));$("#go").disabled=!sel.size};box.appendChild(b)});
$("#quit").onclick=home;$("#go").onclick=()=>S.locked?next():submit()}
function submit(){const it=S.items[S.i];const ok=sel.size===it.a.length&&it.a.every(k=>sel.has(k));S.res[S.i]={sel:[...sel],ok};
if(S.mode==="mock")return next();
S.locked=true;[...$("#opts").children].forEach((x,j)=>{x.disabled=true;x.classList.remove("sel");if(it.a.includes(j))x.classList.add("ok");else if(sel.has(j))x.classList.add("no")});
$("#fb").innerHTML=`<div class="why"><b>${ok?"Correct.":"Not quite."}</b> ${it.why}</div>`;$("#go").textContent=S.i===S.items.length-1?"See results":"Next question"}
function next(){S.locked=false;if(S.i<S.items.length-1){S.i++;show()}else finish()}
function finish(){clearInterval(timer);const n=S.items.length;let c=0;const by={};
S.items.forEach((it,i)=>{const r=S.res[i];const ok=r&&r.ok;if(ok)c++;const b=by[it.w]||(by[it.w]=[0,0]);b[1]++;if(ok)b[0]++});
const pct=Math.round(c/n*100);if(S.mode==="mock"){const p=+best()||0;if(pct>p)best(pct)}
const msg=pct===100?"Perfect score. You’re exam-ready.":pct>=80?"Strong. Review the misses below and retry.":pct>=60?"Getting there. Revisit the weak weeks.":"Re-watch the lectures for the weeks below, then retry.";
const rows=Object.keys(by).sort((a,b)=>a-b).map(k=>`<div class="wk"><span>${+k?"Week "+k:"Security"}</span><div><i style="width:${by[k][0]/by[k][1]*100}%"></i></div><span>${by[k][0]}/${by[k][1]}</span></div>`).join("");
const rev=S.items.map((it,i)=>{const r=S.res[i];if(r&&r.ok)return"";const L=a=>a.map(k=>"ABCD"[k]+". "+it.o[k]).join("; ");
return`<div class="rv"><small>${it.w?"Week "+it.w:"Security"}</small><p style="margin:4px 0"><b>${it.q}</b></p><p style="margin:4px 0;color:var(--bad)">Your answer: ${r&&r.sel.length?L(r.sel):"Not answered"}</p><p style="margin:4px 0;color:var(--ok)">Correct: ${L(it.a)}</p><p style="margin:4px 0;color:var(--mute)">${it.why}</p></div>`}).join("");
app.innerHTML=`<div class="card"><div class="score">${pct}%</div><p class="sub" style="margin:8px 0 0">${c} of ${n} correct. ${msg}</p></div>
<div class="card"><h2>Score by week</h2>${rows}</div>
<div class="card"><h2>${rev?"Review your mistakes":"No mistakes to review"}</h2>${rev}</div>
<div class="row"><button class="btn ghost" id="h">Home</button><button class="btn" id="r">Retry same mode</button></div>`;
$("#h").onclick=home;$("#r").onclick=()=>start(S.mode);window.scrollTo(0,0)}
home();
