// RT-20261031-53: Black Friday / Cyber Monday VPS deals page. Only promos read on the vendor's own page (data/promos-bf-2026.json); renewal math, no guessing.
// RT-20261031-89: each RAM tier also shows the cheapest verified, in-stock, no-prepay plan from data/plans.json, so "lowest" is true across our own ledger.
// RT-20261031-91: 3-year cash = prepay + same-term renewals as each vendor states them (assumptions printed per row); no unstated renewal term is invented.
// RT-20261031-92: tables carry data-label so <600px renders them as stacked labelled cards (.tbl.cards in style.css).
// RT-20261031-90: multi-vendor deals (Hostinger, RackNerd, ScalaHosting, AwakeHost, Bluehost; Devoster announced) with a "Renews at same price?" answer + vendor quote per row.
// Deal-row guard (dealGuard below, run on every build): every row needs an https source, checked == B.checked, a snapshot file under snapshots/ that contains its price + renewal quotes, renews_same in {yes,no,unknown}. VPSL_NEGTEST_BFROW=1 breaks one row to prove it fails.
// Price-parity guard (build.mjs) checks every data-bf-lowest claim equals the min of its tier/period cells (data-bf). VPSL_NEGTEST_BF=1 reproduces the old cherry-pick to prove the guard fails.
import fs from 'node:fs';
export function dealGuard(B,root){const bad=[];const ns=s=>String(s||'').replace(/\s+/g,'');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(B.checked||''))bad.push('promos-bf-2026.json: checked date missing');
 B.deals.forEach((d,i)=>{const id=`deal #${i} ${d.provider} ${d.plan}`;
  if(!/^https:\/\/[^\s]+$/.test(d.source||''))bad.push(`${id}: no https source URL`);
  if(d.checked!==B.checked)bad.push(`${id}: checked ${d.checked} != ${B.checked}`);
  if(!['yes','no','unknown'].includes(d.renews_same))bad.push(`${id}: renews_same "${d.renews_same}" not in {yes,no,unknown}`);
  if(!['live','special','intro','upcoming'].includes(d.status))bad.push(`${id}: status "${d.status}"`);
  for(const k of ['sale_mo','term_months','pay_today','renew_mo','renew_months','renew_total','ram_gb'])if(!(typeof d[k]==='number'&&d[k]>0))bad.push(`${id}: ${k} missing`);
  const sp=d.snapshot&&root+'/'+d.snapshot;
  if(!d.snapshot||!/^snapshots\/[A-Za-z0-9_]+\.txt$/.test(d.snapshot)||!fs.existsSync(sp))bad.push(`${id}: snapshot file missing (${d.snapshot||'none'})`);
  else{const t=fs.readFileSync(sp,'utf8'),h=t.match(/^# Source: (\S+)/);if(h&&h[1]!==d.source)bad.push(`${id}: snapshot is of ${h[1]}, not ${d.source}`);const n=ns(t);
   if(!d.quote||!n.includes(ns(d.quote)))bad.push(`${id}: price quote not found in ${d.snapshot}`);
   if(!d.renew_quote||!n.includes(ns(d.renew_quote)))bad.push(`${id}: renewal quote not found in ${d.snapshot}`)}});
 return bad}
export default function bf({page,SITE,NAME,esc,mailBox,crumbs,crumbLd,ORG,cite,root}){
const B=JSON.parse(fs.readFileSync(root+'/data/promos-bf-2026.json','utf8'));
const PL=JSON.parse(fs.readFileSync(root+'/data/plans.json','utf8'));
const NEG=process.env.VPSL_NEGTEST_BF==='1';
if(process.env.VPSL_NEGTEST_BFROW==='1'){const d=B.deals.find(x=>x.provider_id==='racknerd');d.renews_same='maybe';d.snapshot='snapshots/does_not_exist.txt';B.deals.find(x=>x.provider_id==='awakehost').checked='2026-10-30'}
{const bad=dealGuard(B,root);if(bad.length){console.error(`BF deal-row guard: ${bad.length} problem(s):\n`+bad.join('\n'));process.exit(1)}console.log(`BF deal-row guard: ${B.deals.length} rows have source + checked ${B.checked} + snapshot with both quotes + renews_same`)}
const file='guides/black-friday-vps-deals-2026.html',url=SITE+'/guides/black-friday-vps-deals-2026';
const m$=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtD=s=>new Date(s+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
const SW=B.sale_window,saleTxt=SW?`${fmtD(SW.start)} – ${fmtD(SW.end)}, ${SW.end.slice(0,4)}`:'';
// Cash out of pocket to keep the server for n months: the first term is paid up front; each renewal is billed up front for its renewal term at the renewal price.
const nRen=(d,n)=>Math.max(0,Math.ceil((n-d.term_months)/d.renew_months));
const dealCash=(d,n)=>d.pay_today+nRen(d,n)*d.renew_total;
const dealCovers=(d,n)=>d.term_months+nRen(d,n)*d.renew_months;
const altCost=(a,n)=>a.mo*n;
const SAME={yes:'Yes',no:'No',unknown:'Unknown'};
const termTxt=d=>d.term_months===1?'monthly':`${d.term_months} mo`;
const all=B.deals.map(d=>{const c=[12,24,36].map(n=>dealCash(d,n));return {d,c,cov3:dealCovers(d,36),jump:Math.round((d.renew_mo/d.sale_mo-1)*100),name:`${d.provider} ${d.plan}`}});
const ORD={live:0,special:0,intro:1,upcoming:2},RS={yes:0,unknown:1,no:2},PO={hostinger:0};all.sort((a,b)=>ORD[a.d.status]-ORD[b.d.status]||RS[a.d.renews_same]-RS[b.d.renews_same]||(PO[a.d.provider_id]??1)-(PO[b.d.provider_id]??1)||a.d.provider.localeCompare(b.d.provider)||a.d.ram_gb-b.d.ram_gb||a.d.term_months-b.d.term_months);
const buyable=all.filter(x=>x.d.status!=='upcoming'),upcoming=all.filter(x=>x.d.status==='upcoming');
const vendorsOf=xs=>[...new Set(xs.map(x=>x.d.provider))];
const H=B.deals.filter(d=>d.provider_id==='hostinger');
const dealIds=new Set(B.deals.map(d=>d.provider_id));
// Cheapest verified + in-stock + monthly no-commitment plan per RAM tier from our own ledger (deal vendors excluded; list price, intro discounts not counted).
const noPrepay=ram=>PL.filter(p=>p.ram_gb===ram&&p.status==='verified'&&p.availability==='in_stock'&&p.price_mo!=null&&p.currency==='USD'&&!dealIds.has(p.provider_id)).sort((a,b)=>a.price_mo-b.price_mo)[0];
const rows=H.map(d=>{const alts=(B.alternatives[String(d.ram_gb)]||[]).map(a=>({...a,kind:'list'}));const np=noPrepay(d.ram_gb);
 if(np&&!alts.some(a=>a.plan_id===np.id)){const extra=np.promo_type==='commitment'?`no commitment; ${m$(np.promo_mo)}/mo needs a 12-month prepay (not used)`:np.promo_type==='intro'?`intro ${m$(np.promo_mo)}/mo not counted (list price used)`:'no commitment';alts.push({provider_id:np.provider_id,provider:np.provider,plan:`${np.plan} · ${np.vcpu} vCPU / ${np.ram_gb} GB`,plan_id:np.id,mo:np.price_mo,note:extra,source:np.source,checked:np.checked,kind:'noprepay'})}
 alts.sort((a,b)=>a.mo-b.mo);
 const me=all.find(x=>x.d===d);const peers=buyable.filter(x=>x.d!==d&&x.d.ram_gb===d.ram_gb&&x.d.provider_id!=='hostinger');
 return {d,c1:me.c[0],c2:me.c[1],c3:me.c[2],cov3:me.cov3,jump:me.jump,renewCharge:d.renew_total,alts,peers}});
const PER=['1 year','2 years','3 years'];
for(const r of rows){r.opts=[{name:`${r.d.provider} ${r.d.plan}`,deal:true,x:{d:r.d},c:[r.c1,r.c2,r.c3]},...r.peers.map(x=>({name:x.name,deal:true,x,c:x.c})),...r.alts.map(a=>({name:`${a.provider} ${a.plan}`,a,c:[12,24,36].map(n=>altCost(a,n))}))];
 const pool=NEG?r.opts.filter(o=>!(o.a&&o.a.kind==='noprepay')&&!(o.deal&&o.x.d.provider_id!=='hostinger')):r.opts;/* NEG = old cherry-pick: Hostinger vs Vultr/DO only */r.best=[0,1,2].map(i=>Math.min(...pool.map(o=>o.c[i])));r.win=[0,1,2].map(i=>pool.find(o=>o.c[i]===r.best[i]))}
const big=rows.reduce((a,b)=>b.jump>a.jump?b:a);const k2=rows.find(r=>r.d.plan==='KVM 2')||rows[0];
const beatAll=rows.map(r=>({r,o:r.opts.find(o=>o.a&&o.a.kind==='noprepay'&&[0,1,2].every(i=>o.c[i]<r.opts[0].c[i]))})).filter(x=>x.o);
const beatLine=beatAll.length?` If you can’t prepay 24 months: ${beatAll.map(({r,o})=>`${o.a.provider} ${o.a.plan.split(' · ')[0]} (${o.a.plan.split(' · ')[1]}, ${m$(o.a.mo)}/mo, no commitment) costs less than ${r.d.provider} ${r.d.plan} at 1, 2 and 3 years (${m$(o.c[2])} vs ${m$(r.c3)} over 3 years)`).join('; ')}.`:'';
const sameYes=vendorsOf(buyable.filter(x=>x.d.renews_same==='yes')),sameNo=vendorsOf(buyable.filter(x=>x.d.renews_same==='no'));
const liveV=vendorsOf(buyable);
const r4=rows.find(r=>r.d.ram_gb===4);
const sameLine=`${liveV.length} vendors show a price on their own page today (${liveV.join(', ')}). ${sameYes.length?`Only ${sameYes.join(', ')} says its plans renew at the same price`:'None says its plans renew at the same price'}${r4?`; its ${r4.win[2].name.replace(/^RackNerd /,'')} is the lowest 3-year cash for 4 GB in our table (${m$(r4.best[2])})`.replace(/^; its .*$/,x=>r4.win[2].name.startsWith(sameYes[0]||'~')?x:''):''}. ${sameNo.join(', ')} renew higher.`;
const answer=`The Black Friday price is not what you pay at renewal. ${sameLine} As of ${B.checked}, Hostinger's VPS sale${SW?` (runs ${saleTxt})`:''} lists KVM 2 (2 vCPU / 8 GB) at ${m$(k2.d.sale_mo)}/mo, but only on a ${k2.d.term_months}-month prepay (${m$(k2.d.pay_today)} today). It renews at ${m$(k2.d.renew_mo)}/mo (+${k2.jump}%) for the same ${k2.d.term_months}-month term, billed up front again (${m$(k2.renewCharge)}), so keeping it past 2 years costs ${m$(k2.c3)} in cash by month 25.${beatLine}`;
const lowestLines=rows.map(r=>({r,txt:`${r.d.ram_gb} GB: lowest 1 year ${r.win[0].name.split(' · ')[0]} ${m$(r.best[0])}; 2 years ${r.win[1].name.split(' · ')[0]} ${m$(r.best[1])}; 3 years ${r.win[2].name.split(' · ')[0]} ${m$(r.best[2])}`}));
const recheck=(B.rechecks||[]).map(x=>`${fmtD(x.date)} (${x.label})`).join(' and ');
const upTxt=upcoming.length?`${vendorsOf(upcoming).join(', ')} announced prices that start later (${upcoming[0].d.label.replace(/^Announced: /,'')}); listed separately, not counted as lowest.`:'';
const faq=[
 ['What is the best Black Friday VPS deal in 2026?',`We only list deals we read on the vendor's own page. As of ${B.checked}: ${liveV.map(v=>{const xs=buyable.filter(x=>x.d.provider===v).sort((a,b)=>a.d.sale_mo-b.d.sale_mo);const x=xs[0];return `${v} from ${m$(x.d.pay_today)} for ${x.d.term_months===1?'the first month':x.d.term_months+' months'} (${x.d.plan}, renews ${x.d.renews_same==='yes'?'at the same price':m$(x.d.renew_mo)+'/mo'})`}).join('; ')}. Cheapest 3-year cash per RAM size: ${lowestLines.map(x=>`${x.r.d.ram_gb} GB ${x.r.win[2].name.split(' · ')[0]} ${m$(x.r.best[2])}`).join(', ')}. ${upTxt}`],
 ['Which Black Friday VPS deals renew at the same price?',`${sameYes.length?`${sameYes.join(', ')}: “${buyable.find(x=>x.d.renews_same==='yes').d.renew_quote}”`:'None we verified.'} ${sameNo.join(', ')} renew at a higher regular price (quotes in the table). ${(B.watching||[]).filter(w=>w.renews_same==='yes').map(w=>`${w.provider} says promo prices stay the same at renewal, but has no Black Friday VPS price yet`).join('; ')}.`],
 ['How much does a Hostinger Black Friday VPS cost after renewal?',rows.map(r=>`${r.d.plan}: ${m$(r.d.sale_mo)}/mo now, renews at ${m$(r.d.renew_mo)}/mo (+${r.jump}%)`).join('; ')+`. Hostinger's page says the renewal is "for the same term", so renewing a 24-month plan is billed up front again (KVM 2: ${m$(k2.renewCharge)}). Cash by month 25: ${rows.map(r=>`${r.d.plan} ${m$(r.c3)}`).join(', ')}.`],
 ['When does the Hostinger Black Friday sale end?',SW?`Hostinger's Black Friday page says: "${SW.quote}" (read ${SW.checked}). Prices can change during the sale; re-check before you pay.`:'Not verified yet.'],
 ['Do I have to prepay to get the Black Friday VPS price?',`It depends on the vendor: ${liveV.map(v=>{const ts=[...new Set(buyable.filter(x=>x.d.provider===v).map(x=>x.d.term_months).sort((a,b)=>a-b))];return `${v} ${ts.map(t=>t===1?'1 month (billed monthly)':t+' months').join(' or ')} up front`}).join('; ')}. Hostinger's page says "All plans are paid upfront". OVHcloud, Vultr and DigitalOcean plans in our table bill monthly with no prepay.`],
 ['Is a Black Friday VPS cheaper than a no-prepay VPS over 3 years?',lowestLines.map(x=>x.txt).join('; ')+`. 3-year figures are cash including each vendor's stated renewal (assumptions in the table). List prices before tax; specs differ.`],
 ['When was this checked?',`${B.checked}. Each row links the vendor page we read and we keep a text snapshot of it. We re-check every vendor on ${recheck}. Sales change daily; re-check the vendor page before you pay.`]
];
const L=(label,inner,attrs='',cls='')=>`<td${cls?` class="${cls}"`:''} data-label="${label}"${attrs}><span>${inner}</span></td>`;
const stLabel={live:'Live · Black Friday',special:'Live · special',intro:'Live · intro price',upcoming:'Announced'};
const dealRow=x=>{const d=x.d;return `<tr data-deal="${esc(d.provider_id)}" data-deal-src="${esc(d.source)}" data-deal-checked="${d.checked}" data-deal-snap="${esc(d.snapshot)}" data-deal-renew="${d.renews_same}">${L('Plan',`<b>${esc(d.provider)} ${esc(d.plan)}</b>`)}${L('Same price at renewal?',`<b>${SAME[d.renews_same]}</b> <span class="note">“${esc(d.renew_quote)}”</span>`,'','wrap q')}${L('Term',termTxt(d))}${L('Sale price',`${m$(d.sale_mo)}/mo`,'','n')}${L('Pay today',m$(d.pay_today),'','n')}${L('Renews at',`${m$(d.renew_mo)}/mo${x.jump>0?` <span class="note">+${x.jump}%</span>`:''}`,'','n')}${L('3 years (cash)',`${m$(x.c[2])} <span class="note">covers ${x.cov3} mo</span>`,'','n')}${L('1 year',m$(x.c[0]),'','n')}${L('2 years',m$(x.c[1]),'','n')}${L('Status',`${stLabel[d.status]}<br><span class="note">${esc(d.label)}</span>`,'','wrap')}${L('Assumption',esc(d.renew_assumption),'','wrap note')}${L('Specs',`${d.vcpu} vCPU · ${d.ram_gb} GB · ${d.disk_gb} GB ${d.disk}`)}${L('Source',`<a href="${d.source}" rel="noopener">vendor page</a> · ${d.checked}`,'','src')}</tr>`};
const dealHead=`<thead><tr><th>Plan</th><th>Same price at renewal?</th><th>Term</th><th class="n">Sale price</th><th class="n">Pay today</th><th class="n">Renews at</th><th class="n">3 years (cash)</th><th class="n">1 year</th><th class="n">2 years</th><th>Status</th><th>Assumption</th><th>Specs</th><th>Source</th></tr></thead>`;
page({file,og:'changes',title:`Black Friday VPS deals 2026: renewal prices from ${liveV.length} vendors (checked ${B.checked}) | ${NAME}`,desc:`Black Friday VPS deals 2026 from ${liveV.join(', ')}${upcoming.length?` (+${vendorsOf(upcoming).join(', ')} announced)`:''}: sale price, term, renewal price, “renews at the same price?” with the vendor's own words, and 1/2/3-year cash vs no-prepay plans. Checked ${B.checked}.`,ld:[
 ORG,crumbLd([{label:'Home',href:'/'},{label:'Guides',href:'/guides/'},{label:'Black Friday VPS 2026',href:'/guides/black-friday-vps-deals-2026'}]),
 {'@context':'https://schema.org','@type':'Article',headline:'Black Friday VPS deals 2026: what you pay after the promo',datePublished:'2026-10-31',dateModified:B.checked,author:{'@id':SITE+'/#org'},publisher:{'@id':SITE+'/#org'},mainEntityOfPage:url,citation:[...new Set([...B.deals.map(d=>d.source),...(SW?[SW.source]:[]),...rows.flatMap(r=>r.alts.map(a=>a.source))])]},
 {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
],body:`
${crumbs([{href:'/',label:'Home'},{href:'/guides/',label:'Guides'},{href:'/guides/black-friday-vps-deals-2026',label:'Black Friday VPS 2026'}])}
<section class="hero"><div class="eyebrow">${esc(B.season)} · checked ${B.checked}</div><h1>The Black Friday VPS price isn’t what you pay at renewal.</h1>
<p class="lede"><b>Answer:</b> ${esc(answer)}</p></section>
<div class="panel"><div class="eyebrow">Key stats</div><ul style="margin:10px 0 0;padding-left:18px">
<li><b>Vendors with a price verified on their own page:</b> ${liveV.length} (${liveV.join(', ')}), ${buyable.length} plans${upcoming.length?`; plus ${vendorsOf(upcoming).join(', ')} announced (${upcoming.length} plans, starts later)`:''}</li>
<li><b>Renews at the same price:</b> ${sameYes.length?sameYes.join(', '):'none'} · <b>renews higher:</b> ${sameNo.join(', ')}</li>
${SW?`<li><b>Hostinger sale window:</b> ${saleTxt} (<a href="${SW.source}" rel="noopener">Hostinger’s Black Friday page</a>, read ${SW.checked})</li>`:''}
<li><b>Hostinger renewal jump:</b> +${Math.min(...rows.map(r=>r.jump))}% to +${big.jump}%, billed for the same 24-month term</li>
<li><b>Checked with no Black Friday VPS price shown:</b> ${B.checked_no_bf_price.length} providers · <b>watching:</b> ${(B.watching||[]).length}</li>
<li><b>Next re-check:</b> ${recheck}</li>
<li><b>Last verified:</b> ${B.checked}</li></ul></div>
<h2>Lowest cash cost per RAM tier</h2>
<ul class="bf-lowest">${lowestLines.map(({r,txt})=>`<li data-bf-lowest="${r.d.ram_gb}|0|${r.best[0].toFixed(2)}" data-bf-lowest2="${r.d.ram_gb}|1|${r.best[1].toFixed(2)}" data-bf-lowest3="${r.d.ram_gb}|2|${r.best[2].toFixed(2)}">${esc(txt)}</li>`).join('')}</ul>
<p class="note">Across every row in the per-RAM table below: each live deal with that RAM, plus the cheapest verified, in-stock, no-prepay plan in our ledger. Announced deals that start later (${vendorsOf(upcoming).join(', ')||'none'}) are not counted.</p>
<h2>Every verified deal: does it renew at the same price?</h2>
<p class="mut">USD, before tax. “Pay today” is the first term, billed up front. “1/2/3 years” is cash out of pocket if you keep the server that long, including each renewal billed up front for its renewal term (the “Assumption” column says how each vendor renews). Leaving early after a prepay still costs the full prepay (money-back windows aside). “Same price at renewal?” quotes the vendor’s own page.</p>
<div class="tbl cards bf-deals"><table>${dealHead}<tbody>
${buyable.map(dealRow).join('')}
</tbody></table></div>
${upcoming.length?`<h3 class="h3" style="margin-top:20px">Announced, not live yet</h3><p class="mut">Prices the vendor already publishes for a sale that starts later. You can’t buy at these prices today.</p><div class="tbl cards bf-deals"><table>${dealHead}<tbody>${upcoming.map(dealRow).join('')}</tbody></table></div>`:''}
<p class="note">Hostinger quote: “${esc(H[0].quote)}” Per month of service over 48 months: ${rows.map(r=>`${r.d.plan} ${m$(r.c3/r.cov3)}`).join(', ')}. Hostinger shows crossed-out prices (${rows.map(r=>`${r.d.plan} ${m$(r.d.strike_mo)}`).join(', ')}); we don’t use them as a baseline. RackNerd’s /BlackFriday address redirects to its “VPS specials” page, which doesn’t use the words Black Friday. Bluehost’s price is a regular intro offer, not labelled Black Friday. ScalaHosting’s sale covers managed cloud only.</p>
<h2>Same RAM, every option: 1, 2 and 3 years</h2>
<p class="mut">Each Hostinger RAM tier with every live deal of the same RAM, plus the cheapest verified, in-stock plan in our ledger that bills monthly with no commitment (OVHcloud re-read ${rows.flatMap(r=>r.alts).find(a=>a.provider_id==='ovhcloud')?.checked||B.checked} on its <a href="https://api.us.ovhcloud.com/v1/order/catalog/public/vps?ovhSubsidiary=US" rel="noopener">public US catalog</a>), plus Vultr and DigitalOcean list prices.</p>
<div class="tbl cards"><table><thead><tr><th>RAM</th><th>Option</th><th class="n">/ mo</th>${PER.map(h=>`<th class="n">${h}</th>`).join('')}<th>Note</th></tr></thead><tbody>
${rows.map(r=>r.opts.map(o=>{let name,mo,note;if(o.deal){const d=o.x.d;name=`${esc(o.name)} <span class="note">(${stLabel[d.status]})</span>`;mo=d.renews_same==='yes'?`${m$(d.sale_mo)} <span class="note">same at renewal</span>`:`${m$(d.sale_mo)} → ${m$(d.renew_mo)}`;note=`${termTxt(d)} term · same price at renewal: ${SAME[d.renews_same]} · ${d.vcpu} vCPU / ${d.disk_gb} GB ${d.disk} · <a href="${d.source}" rel="noopener">source</a> ${d.checked}`}else{name=`${o.a.plan_id?`<a href="/providers/${o.a.provider_id}">${esc(o.a.provider)}</a>`:esc(o.a.provider)} ${esc(o.a.plan)}`;mo=m$(o.a.mo);note=`${esc(o.a.note)} · <a href="${o.a.source}" rel="noopener">source</a> ${o.a.checked}`}
 return `<tr>${L('RAM',`<b>${r.d.ram_gb} GB</b>`)}${L('Option',name,'','wrap')}${L('/ mo',mo,'','n')}${o.c.map((v,i)=>L(PER[i],m$(v),` data-bf="${r.d.ram_gb}|${i}|${v.toFixed(2)}"${v===r.best[i]?' data-bf-best="1" style="font-weight:700"':''}`,'n')).join('')}${L('Note',note,'','note wrap')}</tr>`}).join('')).join('')}
</tbody></table></div>
<p class="note">Bold = lowest for that RAM and period among every row shown. Specs are not identical (vCPU count, disk type, bandwidth, CPU class, managed vs unmanaged differ); compare on what your workload needs. Hetzner CX23/CX33, the usual cheaper no-promo pick, were sold out in our ${B.checked} check (EU only). Already on Hetzner? See <a href="/guides/hetzner-price-increase-2026">Hetzner 2026 price changes: keep, rescale or move</a>. For every tracked plan with IPv4, backups and egress added, use the <a href="/calculator">TCO calculator</a>.</p>
<h2>Watching: announced or not verified (no price listed)</h2>
<ul>${(B.watching||[]).map(w=>`<li><b>${esc(w.provider)}</b> — ${esc(w.status)}. ${esc(w.note)} <a href="${w.url}" rel="noopener">${esc(w.url.replace(/^https?:\/\//,''))}</a></li>`).join('')}</ul>
<h2>Checked: no Black Friday VPS price shown</h2>
<p class="mut">We read these official pages on ${B.checked} and found no Black Friday / Cyber Monday VPS price on them.</p>
<ul>${B.checked_no_bf_price.map(x=>`<li>${esc(x.provider)} — <a href="${x.url}" rel="noopener">${esc(x.url.replace(/^https?:\/\//,''))}</a></li>`).join('')}</ul>
<h2>Not yet checked</h2><p class="mut">${B.not_yet_checked.map(esc).join(' · ')}. We list a sale only after reading the price, term and renewal on the vendor’s own page.</p>
<div class="panel" style="border-style:dashed"><div class="eyebrow">Planned re-checks</div><p>We re-read every vendor page above on <b>${recheck}</b>, update this table, and log every price, renewal or end-date change in the dated <a href="/changes">price log</a> (<a href="/rss.xml">RSS</a>).</p></div>
<h2>How to judge any Black Friday VPS deal</h2><ul><li><b>Find the renewal price</b> and the term it renews for. If it renews for the same 24-month term, that whole term is billed up front at month 25.</li><li><b>Ask “same price at renewal?”</b> Only a vendor quote counts; we show it per row.</li><li><b>Find the prepay.</b> “$8.79/mo” billed as ${m$(k2.d.pay_today)} today is a ${k2.d.term_months}-month commitment.</li><li><b>Compare 3-year cash</b>, not the headline monthly rate, against a monthly-billed plan you could leave any time.</li><li><b>Count the extras</b>: backups (included at Hostinger, +20% at Vultr), IPv4, bandwidth overage, managed vs unmanaged.</li></ul>
<h2>Questions</h2>${faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
${mailBox('gbf','Tell me when a Black Friday VPS promo ends or a new one is verified','Send me the weekly ledger')}
${cite(`Black Friday VPS deals 2026 renewal math as of ${B.checked}`)}
`});
const llms=`\n\n## Black Friday VPS deals 2026: renewal math (checked ${B.checked})\nPage: ${url}\n${answer}\n${all.map(x=>`- ${x.d.provider} ${x.d.plan} (${x.d.vcpu} vCPU/${x.d.ram_gb} GB) [${x.d.status}]: $${x.d.sale_mo.toFixed(2)}/mo on ${termTxt(x.d)} term ($${x.d.pay_today.toFixed(2)} today), renews $${x.d.renew_mo.toFixed(2)}/mo; same price at renewal: ${SAME[x.d.renews_same]} ("${x.d.renew_quote}"); cash 1y $${x.c[0].toFixed(2)}, 2y $${x.c[1].toFixed(2)}, 3y $${x.c[2].toFixed(2)} (${x.d.renew_assumption}); source ${x.d.source}`).join('\n')}\n${lowestLines.map(x=>`- ${x.txt}`).join('\n')}\n${(B.watching||[]).map(w=>`- Watching: ${w.provider}: ${w.status}. ${w.note}`).join('\n')}\n- Planned re-checks: ${recheck}\n${faq.map(([q,a])=>`- Q: ${q}\n  A: ${a}`).join('\n')}\n`;
return {hub:{file:'guides/black-friday-vps-deals-2026.html',title:'Black Friday VPS deals 2026: the renewal math',blurb:`${liveV.length} vendors; which renew at the same price; ${k2.d.plan} ${m$(k2.d.sale_mo)} → ${m$(k2.d.renew_mo)}/mo`},faq,answer,url,rows,B,llms,lowest:lowestLines.map(x=>x.txt)};
}
