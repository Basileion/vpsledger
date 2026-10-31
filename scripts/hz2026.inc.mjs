// RT-20261030-60 + RT-20261031-49: "Hetzner 2026 price changes: keep, rescale or move?" decision guide.
// Every Hetzner fact comes from data/hetzner-2026.json (each with an official source + a text snapshot under snapshots/ that must contain the quoted words/price rows;
// the build fails otherwise). Alternatives and true costs come from data/plans.json through the same tco()/rankFor() engine as every other page.
// 24/36-month totals: monthly plans = true monthly cost x months (list/renewal price; intro discounts not counted); prepaid deals reuse the Black Friday guide's
// same-term renewal rule (first term paid up front, each renewal billed up front for its renewal term at the renewal price).
import fs from 'node:fs';
export function hzGuard(H,plans,root){const bad=[];const ns=s=>String(s||'').replace(/\s+/g,'');const snap=f=>{const p=root+'/'+f;return fs.existsSync(p)?ns(fs.readFileSync(p,'utf8')):null};
 const need=(f,q,id)=>{const t=snap(f);if(t==null)bad.push(`${id}: snapshot missing ${f}`);else if(!t.includes(ns(q)))bad.push(`${id}: “${q}” not found in ${f}`)};
 if(!/^\d{4}-\d{2}-\d{2}$/.test(H.checked||''))bad.push('hetzner-2026.json: checked missing');
 need(H.ipv4_snapshot,H.ipv4_quote,'ipv4');need(H.keep_quote.snapshot,H.keep_quote.text,'keep quote');
 for(const q of [...H.rescale_rule.switch,...H.rescale_rule.no_switch])need(H.rescale_rule.snapshot,q,'rescale rule');
 for(const e of H.events){if(!/^https:\/\//.test(e.source))bad.push(`event ${e.date}: no https source`);need(e.snapshot,e.quote,'event '+e.date)}
 for(const r of H.prices){need(H.apr_snapshot,r.apr_row,'April row '+r.plan);need(H.jun_snapshot,r.jun_row,'June row '+r.plan);
  const p=plans.find(x=>x.id===r.plan_id);if(!p){bad.push(`${r.plan}: plan_id ${r.plan_id} not in plans.json`);continue}
  // Hetzner's product pages show "Price incl. IPv4": the ledger price must equal the June list price + the Primary IPv4 fee.
  if(Math.abs(p.price_mo-(r.jun+H.ipv4_eur))>0.001)bad.push(`${r.plan}: plans.json €${p.price_mo} != June list €${r.jun} + IPv4 €${H.ipv4_eur}`);
  if(process.env.VPSL_NEGTEST_HZ==='1'&&r.plan==='CPX22')bad.push('negative test: forced failure')}
 return bad}
export default function hz({page,SITE,NAME,esc,mailBox,crumbs,crumbLd,ORG,cite,root,plans,P,tco,rankFor,SPECS,EG,FX_EUR_USD,FX,unavail,lastChecked}){
const H=JSON.parse(fs.readFileSync(root+'/data/hetzner-2026.json','utf8'));
{const bad=hzGuard(H,plans,root);if(bad.length){console.error(`Hetzner 2026 guide guard: ${bad.length} problem(s):\n`+bad.join('\n'));process.exit(1)}console.log(`Hetzner 2026 guard: ${H.events.length} events + ${H.prices.length} price rows match their snapshots; ledger prices = June list + IPv4`)}
const B=JSON.parse(fs.readFileSync(root+'/data/promos-bf-2026.json','utf8'));
const file='guides/hetzner-price-increase-2026.html',url=SITE+'/guides/hetzner-price-increase-2026',C=H.checked;
const m$=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});const e$=v=>'€'+v.toFixed(2);
const fmtD=s=>new Date(s+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const IP=H.ipv4_eur,R=Object.fromEntries(H.prices.map(r=>[r.plan,r])),PL=id=>plans.find(p=>p.id===id);
const L=(label,inner,cls='')=>`<td${cls?` class="${cls}"`:''} data-label="${label}"><span>${inner}</span></td>`;
const src=(u,d=C,t='source')=>`<a href="${u}" rel="noopener">${t}</a> · checked ${d}`;
// ---- Rescale scenarios (Hetzner bills these in EUR; incl. IPv4 so they match Hetzner's own page prices)
const keep=r=>r.apr+IP,neu=r=>r.jun+IP;
const SC=[
 {k:'Keep your EU CPX22 as is',from:R.CPX22,to:R.CPX22,keep:true},
 {k:'Rescale EU CPX22 up to CPX32',from:R.CPX22,to:R.CPX32},
 {k:'Rescale EU CPX32 down to CPX22',from:R.CPX32,to:R.CPX22},
 {k:'Keep your US CPX11 as is',from:R.CPX11,to:R.CPX11,keep:true},
 {k:'Rescale US CPX11 up to CPX21',from:R.CPX11,to:R.CPX21},
 {k:'Rescale US CPX21 down to CPX11',from:R.CPX21,to:R.CPX11}
].map(s=>{const a=keep(s.from),b=s.keep?a:neu(s.to),d=b-a;return {...s,a,b,d,d24:d*24,d36:d*36,usd36:d*36*FX_EUR_USD}});
const down=SC.find(s=>s.k.includes('CPX32 down')),up=SC.find(s=>s.k.includes('CPX22 up')),usUp=SC.find(s=>s.k.includes('CPX11 up'));
// ---- Move: true cost (EG TB egress, backups on) vs keep / new Hetzner, plus the 5 cheapest orderable non-Hetzner plans
const synth=(r)=>({...PL(r.plan_id),id:PL(r.plan_id).id+'-legacy',price_mo:keep(r)});
const nRen=(d,n)=>Math.max(0,Math.ceil((n-d.term_months)/d.renew_months)),dealCash=(d,n)=>d.pay_today+nRen(d,n)*d.renew_total;
const specs=SPECS.map(s=>{const r=rankFor(s);const hz=r.filter(x=>x.p.provider_id==='hetzner'&&x.p.ram_gb===s.ram);const oth=r.filter(x=>x.p.provider_id!=='hetzner'),same=oth.filter(x=>x.p.ram_gb===s.ram);const alts=(same.length>=5?same:oth).slice(0,5);
 const legacy=H.prices.filter(x=>x.vcpu>=s.cpu&&x.vcpu<=2*s.cpu&&x.ram_gb===s.ram&&!/^CX/.test(x.plan)).map(x=>({r:x,p:synth(x),t:tco(synth(x),EG,true,true)}));
 const deal=B.deals.filter(d=>d.ram_gb===s.ram&&d.renews_same==='yes'&&['live','special'].includes(d.status)).sort((a,b)=>dealCash(a,36)-dealCash(b,36))[0];
 const rank=r.findIndex(x=>x.p.provider_id==='hetzner')+1;return {s,r,hz,alts,legacy,deal,rank,n:r.length}});
const s24=specs[0],cheap=s24.alts[0],newHz=s24.hz[0],keepHz=s24.legacy.find(x=>x.r.region==='EU');
const tot=(t,n)=>t.total*n;
// ---- Answer (2 sentences, dated)
const answer=`Hetzner raised cloud prices twice in 2026: on ${fmtD('2026-04-01')} for every server (EU CPX22 ${e$(R.CPX22.pre_apr)} → ${e$(R.CPX22.apr)}/mo excl. VAT and IPv4) and on ${fmtD('2026-06-15')} for new orders and any rescale only (CPX22 ${e$(R.CPX22.jun)}, ${(R.CPX22.jun/R.CPX22.apr).toFixed(1)}× the pre-June price; US CPX11 ${e$(R.CPX11.apr)} → ${e$(R.CPX11.jun)}). So keep a pre-June server untouched, because even scaling it down switches it to the new list (CPX32 → CPX22 costs ${e$(down.d)}/mo more), and if you need a different size, move: as of ${C}, ${cheap.p.provider} ${cheap.p.plan} costs ${m$(cheap.t.total)}/mo all-in vs ${m$(newHz.t.total)} for a new Hetzner ${newHz.p.plan} (${EG} TB egress, backups on).`;
const voice=H.voices;const vq=i=>`<q>${esc(voice[i].q)}</q> <span class="note">(${esc(voice[i].who)}, <a href="${voice[i].url}" rel="noopener nofollow">thread</a>)</span>`;
const lsUS=plans.find(p=>p.id==='lightsail-linux-4-gb'),lsT=lsUS&&tco(lsUS,EG,true,true),cpx21=s24.hz.find(x=>x.p.id==='hetzner-cpx21-us');
const ovh=s24.alts.find(x=>x.p.provider_id==='ovhcloud');
const obj=[
 ['Do I have to migrate?',`No. Hetzner: “${H.keep_quote.text}” A server ordered before ${fmtD('2026-06-15')} keeps its price (EU CPX22 ${e$(keep(R.CPX22))}/mo incl. IPv4) until you rescale it, restore it after deleting it, or move it to a project in another currency. Rebuilding it or moving it to a same-currency project does not change the price.`],
 ['Is Hetzner still the cheapest?',`Not for new servers. For ${s24.s.cpu} vCPU / ${s24.s.ram} GB at ${EG} TB egress with backups, a new ${newHz.p.plan} is ${m$(newHz.t.total)}/mo all-in and ranks #${s24.rank} of ${s24.n} orderable plans we track; the cheapest is ${cheap.p.provider} ${cheap.p.plan} at ${m$(cheap.t.total)}. A pre-June CPX22 you keep is ${m$(keepHz.t.total)}/mo on the same basis; ${(()=>{const c=s24.r.filter(x=>x.p.provider_id!=='hetzner'&&x.t.total<keepHz.t.total);return c.length?`${c.length} orderable plan${c.length>1?'s are':' is'} cheaper even than that (${c.slice(0,3).map(x=>`${esc(x.p.provider)} ${esc(x.p.plan)} ${m$(x.t.total)}`).join(', ')}), so weigh the saving against the work of migrating`:'nothing orderable we track beats that'})()}.`],
 ['Can I scale down to save money?',`No. Hetzner's billing FAQ lists “${H.rescale_rule.switch[0]}” as an action that moves a server to current pricing. Scaling a pre-June CPX32 (${e$(down.a)}) down to CPX22 bills ${e$(down.b)}/mo, ${e$(down.d)} more each month.`],
 ['What does a rescale cost me?',`EU CPX22 → CPX32: ${e$(up.a)} → ${e$(up.b)}/mo (+${e$(up.d)}, ${e$(up.d36)} over 36 months). US CPX11 → CPX21: ${e$(usUp.a)} → ${e$(usUp.b)}/mo (+${e$(usUp.d)}). Prices excl. VAT, incl. the ${e$(IP)} IPv4.`],
 ['Is Hetzner US still worth it?',cpx21&&lsT?`A new US CPX21 (3 vCPU / 4 GB) is ${m$(cpx21.t.total)}/mo all-in at ${EG} TB; AWS Lightsail 4 GB is ${m$(lsT.total)} and ${cheap.p.provider} ${cheap.p.plan} ${m$(cheap.t.total)} on the same basis. US Hetzner plans include 1–2 TB of traffic, not 20 TB.`:'See the table below.'],
 ['Is it better or worse than OVH right now?',ovh?`For a new 2 vCPU / 4 GB server, yes, OVHcloud ${ovh.p.plan} is cheaper: ${m$(ovh.t.total)}/mo vs ${m$(newHz.t.total)} for Hetzner ${newHz.p.plan} (${EG} TB, backups on). A grandfathered CPX22 (${m$(keepHz.t.total)}) is ${keepHz.t.total<ovh.t.total?'still cheaper than OVH':`still ${m$(keepHz.t.total-ovh.t.total)}/mo more than OVH ${esc(ovh.p.plan)}, a ${m$((keepHz.t.total-ovh.t.total)*36)} gap over 36 months`}.`:'OVHcloud is not in the orderable 2/4 ranking today.'],
 ['What about netcup, Leaseweb or Contabo?','Not verified in our ledger yet (Contabo is listed as unverified). We only rank prices we read on the vendor\'s own page; check theirs before you move.']
];
const legacyRow=(x,s)=>`<tr>${L('Option',`<b>Keep Hetzner ${esc(x.r.plan)} (${x.r.region})</b> <span class="note">ordered before Jun 15 · ${x.r.vcpu} vCPU / ${x.r.ram_gb} GB</span>`,'wrap')}${L('All-in / mo',m$(x.t.total),'n')}${L('12 months',m$(tot(x.t,12)),'n')}${L('24 months',m$(tot(x.t,24)),'n')}${L('36 months',m$(tot(x.t,36)),'n')}${L('Note',`${e$(keep(x.r))}/mo incl. IPv4 (${e$(x.r.apr)} + ${e$(IP)}); only while you don't rescale · ${src(H.rescale_rule.source)}`,'note wrap')}</tr>`;
const ledgerRow=(x,hzNew)=>{const p=x.p;return `<tr>${L('Option',`${hzNew?'<b>New Hetzner ':'<b>'}${esc(p.provider===('Hetzner')?p.plan:p.provider+' '+p.plan)}</b> <span class="note">${hzNew?'new order or any rescale · ':''}${p.vcpu} vCPU / ${p.ram_gb} GB${p.region_scope?' · '+esc(p.region_scope):''}</span>`,'wrap')}${L('All-in / mo',m$(x.t.total),'n')}${L('12 months',m$(tot(x.t,12)),'n')}${L('24 months',m$(tot(x.t,24)),'n')}${L('36 months',m$(tot(x.t,36)),'n')}${L('Note',`list ${p.currency==='EUR'?'€':'$'}${p.price_mo.toFixed(2)}/mo${p.promo_mo?` (${p.promo_type==='intro'?'intro':'prepay'} ${p.currency==='EUR'?'€':'$'}${p.promo_mo.toFixed(2)} not counted)`:''}, monthly, no commitment · ${src(p.source,p.checked)}`,'note wrap')}</tr>`};
const dealRow=d=>`<tr>${L('Option',`<b>${esc(d.provider)} ${esc(d.plan)}</b> <span class="note">prepay ${d.term_months} mo · ${d.vcpu} vCPU / ${d.ram_gb} GB · renews at the same price (vendor)</span>`,'wrap')}${L('All-in / mo',`${m$(d.sale_mo)} <span class="note">billed ${m$(d.pay_today)}/yr</span>`,'n')}${L('12 months',m$(dealCash(d,12)),'n')}${L('24 months',m$(dealCash(d,24)),'n')}${L('36 months',m$(dealCash(d,36)),'n')}${L('Note',`Black Friday special, cash incl. same-term renewals; backups/IPv4 as the vendor bundles them · ${src(d.source,d.checked)} · <a href="/guides/black-friday-vps-deals-2026">BF renewal math</a>`,'note wrap')}</tr>`;
const moveHead=`<thead><tr><th>Option</th><th class="n">All-in / mo</th><th class="n">12 months</th><th class="n">24 months</th><th class="n">36 months</th><th>Note</th></tr></thead>`;
const faq=[['What changed in Hetzner’s 2026 prices?',answer],...obj,['When was this checked?',`${C}. Every Hetzner number links to Hetzner's own page or docs, and we keep a text snapshot of each. Alternative prices come from the VPSLedger ledger (each row has its own source and check date).`]];
const crumbP=[{href:'/',label:'Home'},{href:'/guides/',label:'Guides'},{href:'/guides/hetzner-price-increase-2026',label:'Hetzner 2026 price changes'}];
const cites=[...new Set([...H.events.map(e=>e.source),H.keep_quote.source,H.rescale_rule.source,H.ipv4_source,...specs.flatMap(x=>x.alts.map(a=>a.p.source))])];
page({file,og:'p-hetzner',title:`Hetzner 2026 price changes: keep, rescale or move? (checked ${C}) | ${NAME}`,desc:`Hetzner raised cloud prices on Apr 1 and Jun 15, 2026 (CPX22 €5.99 → €7.99 → €19.49). What existing servers keep, what a rescale costs, and 5 cheaper alternatives by true cost. Checked ${C}.`,ld:[
 ORG,crumbLd(crumbP),
 {'@context':'https://schema.org','@type':'WebPage',name:'Hetzner 2026 price changes: keep, rescale or move?',description:answer,url,datePublished:C,dateModified:C,isPartOf:{'@id':SITE+'/#website'},publisher:{'@id':SITE+'/#org'},about:{'@type':'Organization',name:'Hetzner Online GmbH'},citation:cites},
 {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
],body:`
${crumbs(crumbP)}
<section class="hero"><div class="eyebrow">Decision guide · Hetzner Cloud · checked ${C}</div><h1>Hetzner 2026 price changes: keep, rescale or move?</h1>
<p class="lede"><b>Answer:</b> ${esc(answer)}</p><p class="note">Checked ${C} on Hetzner's own pages and docs. Prices excl. VAT. All-in = list price + IPv4 + backups + traffic overage at ${EG} TB/month; EUR at ${FX_EUR_USD} USD (ECB, ${FX.date}). For Hetzner's full current plan list see <a href="/guides/hetzner-pricing">Hetzner VPS pricing</a>; for every alternative ranked, <a href="/guides/hetzner-alternatives">Hetzner alternatives</a>.</p></section>
<div class="panel"><div class="eyebrow">Key numbers</div><ul style="margin:10px 0 0;padding-left:18px">
<li><b>EU CPX22 (2 vCPU / 4 GB):</b> ${e$(R.CPX22.pre_apr)} → ${e$(R.CPX22.apr)} (Apr 1, everyone) → ${e$(R.CPX22.jun)} (Jun 15, new orders + rescales), excl. VAT and IPv4</li>
<li><b>US CPX11 (2 vCPU / 2 GB):</b> ${e$(R.CPX11.pre_apr)} → ${e$(R.CPX11.apr)} → ${e$(R.CPX11.jun)} (${(R.CPX11.jun/R.CPX11.apr).toFixed(1)}× in June)</li>
<li><b>Scaling down still costs more:</b> pre-June CPX32 → CPX22 = +${e$(down.d)}/mo</li>
<li><b>New CPX22 ranks</b> #${s24.rank} of ${s24.n} orderable 2 vCPU / 4 GB plans; cheapest is ${esc(cheap.p.provider)} ${esc(cheap.p.plan)} at ${m$(cheap.t.total)}/mo all-in</li>
<li><b>Cost-Optimized CX23/CX33:</b> sold out on Hetzner's page (checked ${PL('hetzner-cx23').availability_checked}), so the cheap Hetzner option isn't orderable</li></ul></div>
<h2>Timeline: what Hetzner changed in 2026</h2>
<div class="tbl cards"><table><thead><tr><th>Date</th><th>What changed</th><th>Hetzner's words</th><th>Source</th></tr></thead><tbody>
${H.events.map(e=>`<tr>${L('Date',`<b>${fmtD(e.date)}</b>`)}${L('What changed',`<b>${esc(e.title)}.</b> ${esc(e.summary)}`,'wrap')}${L("Hetzner's words",`<q>${esc(e.quote)}</q>`,'wrap note')}${L('Source',src(e.source,C,/web\.archive/.test(e.source)?'Hetzner Docs (archived copy)':/pressroom/.test(e.source)?'Hetzner press release':'Hetzner Docs'),'src')}</tr>`).join('')}
</tbody></table></div>
<h3 class="h3" style="margin-top:20px">Price per plan (€ / month, excl. VAT and IPv4)</h3>
<div class="tbl cards"><table><thead><tr><th>Plan</th><th class="n">Before Apr 1</th><th class="n">Apr 1 (you keep this)</th><th class="n">Jun 15 (new / rescale)</th><th class="n">Jun vs Apr</th><th>Orderable today?</th></tr></thead><tbody>
${H.prices.map(r=>{const p=PL(r.plan_id);return `<tr>${L('Plan',`<b>${r.plan}</b> <span class="note">${r.region} · ${r.vcpu} vCPU / ${r.ram_gb} GB</span>`)}${L('Before Apr 1',e$(r.pre_apr),'n')}${L('Apr 1 (you keep this)',e$(r.apr),'n')}${L('Jun 15 (new / rescale)',`<b>${e$(r.jun)}</b>`,'n')}${L('Jun vs Apr',`${(r.jun/r.apr).toFixed(2)}×`,'n')}${L('Orderable today?',unavail(p)?`No, sold out (checked ${p.availability_checked})`:`Yes, ${e$(p.price_mo)} incl. IPv4 (checked ${p.availability_checked})`,'wrap')}</tr>`}).join('')}
</tbody></table></div>
<p class="note">Sources: April list from <a href="${H.events[1].source}" rel="noopener">Hetzner Docs (archived 2026-05-13; the live URL now shows the June list)</a>; June list from <a href="${H.events[3].source}" rel="noopener">Hetzner Docs</a>; today's price and stock from Hetzner's <a href="https://www.hetzner.com/cloud/regular-performance" rel="noopener">Regular Performance</a> and <a href="https://www.hetzner.com/cloud/cost-optimized" rel="noopener">Cost-Optimized</a> pages, which show prices incl. IPv4 (${e$(IP)}/mo per <a href="${H.ipv4_source}" rel="noopener">Hetzner Docs</a>). All checked ${C}. Hetzner also bills in USD for USD accounts at separate prices (same docs tables).</p>
<h2>What a rescale costs</h2>
<p class="mut">Hetzner's billing FAQ: these actions move a pre-June server to current prices: ${H.rescale_rule.switch.map(x=>`“${esc(x)}”`).join(', ')}. These don't: ${H.rescale_rule.no_switch.map(x=>`“${esc(x)}”`).join(', ')} (${src(H.rescale_rule.source)}).</p>
<div class="tbl cards"><table><thead><tr><th>Scenario</th><th class="n">You pay now</th><th class="n">After</th><th class="n">Change / mo</th><th class="n">Extra over 24 months</th><th class="n">Extra over 36 months</th></tr></thead><tbody>
${SC.map(s=>`<tr>${L('Scenario',`<b>${esc(s.k)}</b>`,'wrap')}${L('You pay now',e$(s.a),'n')}${L('After',e$(s.b),'n')}${L('Change / mo',s.keep?'—':`${s.d>0?'+':''}${e$(s.d)}`,'n')}${L('Extra over 24 months',s.keep?'—':e$(s.d24),'n')}${L('Extra over 36 months',s.keep?'—':`${e$(s.d36)} <span class="note">≈ ${m$(s.usd36)}</span>`,'n')}</tr>`).join('')}
</tbody></table></div>
<p class="note">€/month excl. VAT, incl. the ${e$(IP)} Primary IPv4, from the April (“you pay now”, for servers ordered before Jun 15) and June (“after”) Hetzner price lists above. Backups (+20% of the server price) and traffic not included here. Hetzner Cloud bills hourly up to a monthly cap, so there is no prepay or renewal term: the same monthly price applies every month.</p>
<h2>Keep or move: Hetzner vs 5 cheaper alternatives by true cost</h2>
<p class="mut">All-in = list price + IPv4 + backups + overage at ${EG} TB/month, from the VPSLedger ledger (orderable, verified plans; same engine as the <a href="/calculator">TCO calculator</a>). Monthly plans: 12/24/36-month totals are that monthly cost × months (no intro discount counted, so these are the renewal prices). The prepay row uses the Black Friday guide's renewal rule: first term up front, then each renewal billed for its term.</p>
${specs.map(x=>`<h3 class="h3" style="margin-top:20px">${x.s.cpu} vCPU / ${x.s.ram} GB class</h3><div class="tbl cards"><table>${moveHead}<tbody>
${x.legacy.map(l=>legacyRow(l,x.s)).join('')}${x.hz.map(h=>ledgerRow(h,true)).join('')}${x.alts.map(a=>ledgerRow(a,false)).join('')}${x.deal?dealRow(x.deal):''}
</tbody></table></div><p class="note">New Hetzner ${x.hz.map(h=>esc(h.p.plan)).join(' / ')} ${x.hz.length>1?'rank':'ranks'} ${x.hz.map(h=>'#'+(x.r.indexOf(h)+1)).join(' / ')} of ${x.n} orderable plans in this class. ${x.alts.length<5?` Only ${x.alts.length} orderable, verified non-Hetzner plans are in this class today.`:''} Specs differ (vCPU, disk, traffic included, region): EU Hetzner includes 20 TB of traffic, US Hetzner 1–2 TB. Fees a provider doesn't publish count as $0 and are flagged on its provider page.</p>`).join('')}
<h2>What people are saying, and our answers</h2>
<ul class="voices">${voice.map((v,i)=>`<li>${vq(i)}</li>`).join('')}</ul>
${obj.map(([q,a])=>`<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
<div class="panel"><div class="eyebrow">How to decide</div><ul style="margin:8px 0 0;padding-left:18px"><li><b>Pre-June server that still fits?</b> Keep it and don't rescale: you keep ${e$(keep(R.CPX22))}/mo for a CPX22.</li><li><b>Need more (or less) CPU/RAM?</b> Price the rescale above against a move; at 2 vCPU / 4 GB ${esc(cheap.p.provider)} ${esc(cheap.p.plan)} is ${m$(cheap.t.total)}/mo all-in.</li><li><b>New project?</b> Hetzner's cheap CX plans are sold out; a new CPX22 is ${m$(newHz.t.total)}/mo all-in. Compare in the <a href="/calculator">calculator</a> or <a href="/compare/digitalocean-vs-hetzner">Hetzner vs DigitalOcean</a>.</li></ul></div>
${mailBox('ghz26','Hear when Hetzner or a cheaper alternative changes price','Send me the weekly ledger')}
${cite(`Hetzner 2026 price changes, keep vs rescale vs move, as of ${C}`)}
`});
const llms=`\n\n## Hetzner 2026 price changes: keep, rescale or move? (checked ${C})\nPage: ${url}\n${answer}\n${H.events.map(e=>`- ${e.date}: ${e.title}. ${e.summary} [${e.source}]`).join('\n')}\n${H.prices.map(r=>`- ${r.plan} (${r.region}, ${r.vcpu} vCPU/${r.ram_gb} GB): before Apr 1 €${r.pre_apr}, Apr 1 €${r.apr} (existing servers keep), Jun 15 €${r.jun} (new orders + rescales); excl. VAT and IPv4 (€${IP.toFixed(2)})`).join('\n')}\n${SC.filter(s=>!s.keep).map(s=>`- ${s.k}: €${s.a.toFixed(2)} → €${s.b.toFixed(2)}/mo (${s.d>0?'+':''}€${s.d.toFixed(2)}; €${s.d36.toFixed(2)} over 36 months)`).join('\n')}\n${specs.map(x=>`- ${x.s.cpu} vCPU/${x.s.ram} GB all-in at ${EG} TB with backups: ${[...x.legacy.map(l=>`keep Hetzner ${l.r.plan} ${l.r.region} $${l.t.total.toFixed(2)}`),...x.hz.map(h=>`new Hetzner ${h.p.plan} $${h.t.total.toFixed(2)}`),...x.alts.map(a=>`${a.p.provider} ${a.p.plan} $${a.t.total.toFixed(2)}`)].join('; ')}/mo`).join('\n')}\n${faq.map(([q,a])=>`- Q: ${q}\n  A: ${a}`).join('\n')}\n`;
return {hub:{file,title:'Hetzner 2026 price changes: keep, rescale or move?',blurb:`CPX22 ${e$(R.CPX22.pre_apr)} → ${e$(R.CPX22.apr)} → ${e$(R.CPX22.jun)}; rescale costs; ${cheap.p.provider} ${m$(cheap.t.total)}/mo all-in`},llms,url,answer,specs,SC};
}
