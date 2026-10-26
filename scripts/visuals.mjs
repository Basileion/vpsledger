// Renders favicon, PWA icons and OG images into assets/ with headless Chrome. Run: node scripts/visuals.mjs && node scripts/build.mjs
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');const A=p=>path.join(root,'assets',p);fs.mkdirSync(A('og'),{recursive:true});
const CH=process.env.CHROME_BIN||'/usr/bin/google-chrome';const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'vl-'));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const render=(body,out,w=1200,h=630)=>{const f=path.join(tmp,'p.html');fs.writeFileSync(f,`<!doctype html><meta charset=utf-8><style>*{box-sizing:border-box;margin:0}body{width:${w}px;height:${h}px;overflow:hidden;font-family:ui-sans-serif,Roboto,Arial,sans-serif;font-variant-numeric:tabular-nums}.s{font-family:"Iowan Old Style",Palatino,Georgia,serif}.m{font-family:ui-monospace,Menlo,"DejaVu Sans Mono",monospace}</style>${body}`);execFileSync(CH,['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=1',`--window-size=${w},${h}`,`--screenshot=${out}`,'file://'+f],{stdio:'ignore'})};
const mark=s=>`<svg width="${s}" height="${s}" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#14181f"/><path d="M8 9v14h16" stroke="#fbfaf7" stroke-width="2.2" fill="none"/><path d="M12 19l4-4 3 2 5-6" stroke="#d98a93" stroke-width="2.2" fill="none"/></svg>`;
fs.writeFileSync(A('favicon.svg'),mark(32).replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"'));
for(const s of [192,512])render(`<div style="width:${s}px;height:${s}px;background:#14181f;display:flex;align-items:center;justify-content:center">${mark(s*.72)}</div>`,A(`icon-${s}.png`),s,s);
const plans=JSON.parse(fs.readFileSync(path.join(root,'data/plans.json'),'utf8')),providers=JSON.parse(fs.readFileSync(path.join(root,'data/providers.json'),'utf8'));
const og=(eyebrow,title,sub,right='')=>`<div style="width:1200px;height:630px;background:#fbfaf7;color:#14181f;padding:60px 72px;display:flex;flex-direction:column;border-top:10px solid #8c2f39">
<div style="display:flex;align-items:center;gap:14px;font-size:30px;font-weight:600" class="s">${mark(40)}VPSLedger</div>
<div style="display:flex;gap:48px;flex:1;align-items:center"><div style="flex:1"><div class="m" style="font-size:17px;letter-spacing:.14em;text-transform:uppercase;color:#8c2f39;font-weight:600">${esc(eyebrow)}</div>
<div class="s" style="font-size:${title.length>40?50:60}px;font-weight:600;line-height:1.08;margin:14px 0 18px">${esc(title)}</div><div style="font-size:24px;line-height:1.4;color:#3b4250">${esc(sub)}</div></div>${right}</div>
<div class="m" style="font-size:17px;color:#6b7180;border-top:1px solid #e4e1da;padding-top:16px">${plans.length} plans · ${providers.length} providers · base + IPv4 + backups + overage · every price sourced</div></div>`;
const card=rows=>`<div style="width:420px;border:1px solid #e4e1da;background:#fff"><div class="m" style="display:flex;justify-content:space-between;padding:10px 16px;background:#f6f4ef;font-size:13px;letter-spacing:.08em;color:#6b7180"><span>PLAN</span><span>LIST / MO</span></div>${rows.map(p=>`<div style="display:flex;justify-content:space-between;padding:11px 16px;border-top:1px solid #efece6;font-size:18px"><span>${esc(p.provider)} ${esc(p.plan)}</span><span class="m">${p.currency==='EUR'?'€':'$'}${p.price_mo.toFixed(2)}</span></div>`).join('')}</div>`;
const v=plans.filter(p=>p.status==='verified'&&p.tier==='entry').sort((a,b)=>a.price_mo-b.price_mo).slice(0,6);
render(og('VPS ledger','What a VPS actually costs each month.','IPv4, backups and bandwidth added back. $/vCPU and $/GB RAM, linked to official pages.',card(v)),A('og/home.png'));
render(og('TCO calculator','Your specs in, cheapest plans out.','vCPU, RAM, storage and egress. Monthly and annual cost, ranked.',card(v.slice(0,4))),A('og/calculator.png'));
render(og('Compare','Head to head, on the whole bill.','Every pair of major VPS providers at 1 TB and 5 TB egress.'),A('og/compare.png'));
render(og('Price log','Every change, dated and sourced.','Price moves, promos and billing changes from official pages.'),A('og/changes.png'));
render(og('VPSLedger Pro · $9/mo','Hear about the price drop first.','Price-drop alerts, promo-expiry alerts and CSV export. Early access.'),A('og/pro.png'));
render(og('Sponsorship','Reach buyers picking a server.','One labeled sponsor per monthly ledger. Founding rates.'),A('og/sponsor.png'));
for(const pr of providers){const ps=plans.filter(p=>p.provider_id===pr.id&&p.price_mo!=null);render(og('Provider pricing',`${pr.name} VPS pricing`,`True monthly cost, checked ${pr.checked}.`,ps.length?card(ps.slice(0,4)):''),A(`og/p-${pr.id}.png`))}
fs.rmSync(tmp,{recursive:true,force:true});console.log('visuals done');
