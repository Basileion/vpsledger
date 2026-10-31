// RT-20261031-53: Black Friday / Cyber Monday VPS deals page. Only promos read on the vendor's own page (data/promos-bf-2026.json); renewal math, no guessing.
// RT-20261031-89: each RAM tier also shows the cheapest verified, in-stock, no-prepay plan from data/plans.json, so "lowest" is true across our own ledger.
// RT-20261031-91: 3-year cash = prepay + one same-term renewal (Hostinger: "Renews ... for the same term"); no 12-month renewal is assumed.
// RT-20261031-92: tables carry data-label so <600px renders them as stacked labelled cards (.tbl.cards in style.css).
// Price-parity guard (build.mjs) checks every data-bf-lowest claim equals the min of its tier/period cells (data-bf). VPSL_NEGTEST_BF=1 reproduces the old cherry-pick to prove the guard fails.
import fs from 'node:fs';
export default function bf({page,SITE,NAME,esc,mailBox,crumbs,crumbLd,ORG,cite,root}){
const B=JSON.parse(fs.readFileSync(root+'/data/promos-bf-2026.json','utf8'));
const PL=JSON.parse(fs.readFileSync(root+'/data/plans.json','utf8'));
const NEG=process.env.VPSL_NEGTEST_BF==='1';
const file='guides/black-friday-vps-deals-2026.html',url=SITE+'/guides/black-friday-vps-deals-2026';
const m$=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtD=s=>new Date(s+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
const SW=B.sale_window,saleTxt=SW?`${fmtD(SW.start)} – ${fmtD(SW.end)}, ${SW.end.slice(0,4)}`:'';
// Cash out of pocket to keep the server for n months. The deal is prepaid; each renewal is billed up front again for the same term at the renewal rate.
const dealCash=(d,n)=>d.prepay_total+Math.max(0,Math.ceil((n-d.prepay_months)/d.prepay_months))*d.renew_mo*d.prepay_months;
const dealCovers=(d,n)=>Math.max(1,Math.ceil(n/d.prepay_months))*d.prepay_months;
const altCost=(a,n)=>a.mo*n;
const dealIds=new Set(B.deals.map(d=>d.provider_id));
// Cheapest verified + in-stock + monthly no-commitment plan per RAM tier from our own ledger (deal vendor excluded; list price, intro discounts not counted).
const noPrepay=ram=>PL.filter(p=>p.ram_gb===ram&&p.status==='verified'&&p.availability==='in_stock'&&p.price_mo!=null&&p.currency==='USD'&&!dealIds.has(p.provider_id)).sort((a,b)=>a.price_mo-b.price_mo)[0];
const rows=B.deals.map(d=>{const alts=(B.alternatives[String(d.ram_gb)]||[]).map(a=>({...a,kind:'list'}));const np=noPrepay(d.ram_gb);
 if(np&&!alts.some(a=>a.plan_id===np.id)){const extra=np.promo_type==='commitment'?`no commitment; ${m$(np.promo_mo)}/mo needs a 12-month prepay (not used)`:np.promo_type==='intro'?`intro ${m$(np.promo_mo)}/mo not counted (list price used)`:'no commitment';alts.push({provider_id:np.provider_id,provider:np.provider,plan:`${np.plan} · ${np.vcpu} vCPU / ${np.ram_gb} GB`,plan_id:np.id,mo:np.price_mo,note:extra,source:np.source,checked:np.checked,kind:'noprepay'})}
 alts.sort((a,b)=>a.mo-b.mo);
 const c=[12,24,36].map(n=>dealCash(d,n));
 return {d,c1:c[0],c2:c[1],c3:c[2],cov3:dealCovers(d,36),jump:Math.round((d.renew_mo/d.promo_mo-1)*100),renewCharge:d.renew_mo*d.prepay_months,alts}});
// Lowest per tier and period across every row shown.
const H=['1 year','2 years','3 years'];
for(const r of rows){r.opts=[{name:`${r.d.provider} ${r.d.plan}`,deal:true,c:[r.c1,r.c2,r.c3]},...r.alts.map(a=>({name:`${a.provider} ${a.plan}`,a,c:[12,24,36].map(n=>altCost(a,n))}))];
 const pool=NEG?r.opts.filter(o=>!o.a||o.a.kind!=='noprepay'):r.opts;r.best=[0,1,2].map(i=>Math.min(...pool.map(o=>o.c[i])));r.win=[0,1,2].map(i=>pool.find(o=>o.c[i]===r.best[i]))}
const big=rows.reduce((a,b)=>b.jump>a.jump?b:a);const k2=rows.find(r=>r.d.plan==='KVM 2')||rows[0];
const beatAll=rows.map(r=>({r,o:r.opts.find(o=>o.a&&o.a.kind==='noprepay'&&[0,1,2].every(i=>o.c[i]<r.opts[0].c[i]))})).filter(x=>x.o);
const beatLine=beatAll.length?` If you can’t prepay 24 months: ${beatAll.map(({r,o})=>`${o.a.provider} ${o.a.plan.split(' · ')[0]} (${o.a.plan.split(' · ')[1]}, ${m$(o.a.mo)}/mo, no commitment) costs less than ${r.d.provider} ${r.d.plan} at 1, 2 and 3 years (${m$(o.c[2])} vs ${m$(r.c3)} over 3 years)`).join('; ')}.`:'';
const answer=`The Black Friday price is not what you pay at renewal. As of ${B.checked}, Hostinger's VPS sale${SW?` (runs ${saleTxt})`:''} lists KVM 2 (2 vCPU / 8 GB) at ${m$(k2.d.promo_mo)}/mo, but only on a ${k2.d.prepay_months}-month prepay (${m$(k2.d.prepay_total)} today). It renews at ${m$(k2.d.renew_mo)}/mo (+${k2.jump}%) for the same ${k2.d.prepay_months}-month term, billed up front again (${m$(k2.renewCharge)}), so keeping it past 2 years costs ${m$(k2.c3)} in cash by month 25. The biggest renewal jump is ${big.d.plan}: ${m$(big.d.promo_mo)} → ${m$(big.d.renew_mo)} (+${big.jump}%).${beatLine}`;
const lowestLines=rows.map(r=>({r,txt:`${r.d.ram_gb} GB: lowest 1 year ${r.win[0].name.split(' · ')[0]} ${m$(r.best[0])}; 2 years ${r.win[1].name.split(' · ')[0]} ${m$(r.best[1])}; 3 years ${r.win[2].name.split(' · ')[0]} ${m$(r.best[2])}`}));
const faq=[
 ['What is the best Black Friday VPS deal in 2026?',`We only list deals we read on the vendor's own page. As of ${B.checked} that is Hostinger's VPS sale${SW?` (${saleTxt})`:''}: ${rows.map(r=>`${r.d.plan} ${m$(r.d.promo_mo)}/mo (renews ${m$(r.d.renew_mo)})`).join(', ')}, each on a ${B.deals[0].prepay_months}-month prepay. It is not always the cheapest option:${beatLine||' see the 3-year table.'} ${B.checked_no_bf_price.map(x=>x.provider).join(', ')} showed no Black Friday VPS price on the pages we read that day.`],
 ['How much does a Hostinger Black Friday VPS cost after renewal?',rows.map(r=>`${r.d.plan}: ${m$(r.d.promo_mo)}/mo now, renews at ${m$(r.d.renew_mo)}/mo (+${r.jump}%)`).join('; ')+`. Hostinger's page says the renewal is "for the same term", so renewing a 24-month plan is billed up front again (KVM 2: ${m$(k2.renewCharge)}). Cash by month 25: ${rows.map(r=>`${r.d.plan} ${m$(r.c3)}`).join(', ')}.`],
 ['When does the Hostinger Black Friday sale end?',SW?`Hostinger's Black Friday page says: "${SW.quote}" (read ${SW.checked}). Prices can change during the sale; re-check before you pay.`:'Not verified yet.'],
 ['Do I have to prepay to get the Black Friday VPS price?',`Yes for Hostinger: the page says "All plans are paid upfront" and each deal shows the 24-month total (KVM 1 ${m$(rows[0].d.prepay_total)}). Hostinger offers a 30-day money-back guarantee. OVHcloud, Vultr and DigitalOcean plans in our table bill monthly with no prepay.`],
 ['Is a Black Friday VPS cheaper than a no-prepay VPS over 3 years?',lowestLines.map(x=>x.txt).join('; ')+`. 3-year Hostinger figures are cash if you renew the same 24-month term (it covers service to month 48). List prices before tax; specs differ.`],
 ['When was this checked?',`${B.checked}. Each row links the vendor page we read. Sales change daily; re-check the vendor page before you pay.`]
];
const L=(label,inner,attrs='',cls='')=>`<td${cls?` class="${cls}"`:''} data-label="${label}"${attrs}><span>${inner}</span></td>`;
page({file,og:'changes',title:`Black Friday VPS deals 2026: the renewal math (checked ${B.checked}) | ${NAME}`,desc:`Black Friday VPS deals 2026 with the price you pay after the promo: Hostinger KVM 1-8 promo, 24-month prepay, same-term renewal and 1/2/3-year cash vs no-prepay OVHcloud, Vultr and DigitalOcean. Checked ${B.checked}.`,ld:[
 ORG,crumbLd([{label:'Home',href:'/'},{label:'Guides',href:'/guides/'},{label:'Black Friday VPS 2026',href:'/guides/black-friday-vps-deals-2026'}]),
 {'@context':'https://schema.org','@type':'Article',headline:'Black Friday VPS deals 2026: what you pay after the promo',datePublished:'2026-10-31',dateModified:B.checked,author:{'@id':SITE+'/#org'},publisher:{'@id':SITE+'/#org'},mainEntityOfPage:url,citation:[...new Set([...B.deals.map(d=>d.source),...(SW?[SW.source]:[]),...rows.flatMap(r=>r.alts.map(a=>a.source))])]},
 {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
],body:`
${crumbs([{href:'/',label:'Home'},{href:'/guides/',label:'Guides'},{href:'/guides/black-friday-vps-deals-2026',label:'Black Friday VPS 2026'}])}
<section class="hero"><div class="eyebrow">${esc(B.season)} · checked ${B.checked}</div><h1>The Black Friday VPS price isn’t what you pay at renewal.</h1>
<p class="lede"><b>Answer:</b> ${esc(answer)}</p></section>
<div class="panel"><div class="eyebrow">Key stats</div><ul style="margin:10px 0 0;padding-left:18px">
<li><b>Deals verified on vendor pages:</b> ${rows.length} (Hostinger KVM 1, 2, 4, 8)</li>
${SW?`<li><b>Sale window:</b> ${saleTxt} (<a href="${SW.source}" rel="noopener">Hostinger’s Black Friday page</a>, read ${SW.checked})</li>`:''}
<li><b>Prepay required:</b> ${B.deals[0].prepay_months} months, paid up front (${m$(Math.min(...B.deals.map(d=>d.prepay_total)))}–${m$(Math.max(...B.deals.map(d=>d.prepay_total)))})</li>
<li><b>Renewal jump:</b> +${Math.min(...rows.map(r=>r.jump))}% to +${big.jump}%, billed for the same ${B.deals[0].prepay_months}-month term</li>
<li><b>Checked with no Black Friday VPS price shown:</b> ${B.checked_no_bf_price.length} providers</li>
<li><b>Last verified:</b> ${B.checked}</li></ul></div>
<h2>Lowest cash cost per RAM tier</h2>
<ul class="bf-lowest">${lowestLines.map(({r,txt})=>`<li data-bf-lowest="${r.d.ram_gb}|0|${r.best[0].toFixed(2)}" data-bf-lowest2="${r.d.ram_gb}|1|${r.best[1].toFixed(2)}" data-bf-lowest3="${r.d.ram_gb}|2|${r.best[2].toFixed(2)}">${esc(txt)}</li>`).join('')}</ul>
<p class="note">Across every row in the tables below, including the cheapest verified, in-stock, no-prepay plan in our ledger for each RAM size.</p>
<h2>Deal price vs what you actually pay</h2>
<p class="mut">USD, list prices before tax. “1 year” is cash out of pocket: the deal requires a 24-month prepay, so leaving after 12 months still costs the full prepay (after the 30-day money-back window). “3 years (cash)” = the prepay + one renewal, because Hostinger’s page says it “Renews at $X/mo for the same term”: at month 25 you pay another 24 months up front, which covers you to month 48. Hostinger’s page shows no 12-month renewal price, so we don’t assume one. Moving off at month 24 instead? Your cost is the “2 years” column.</p>
<div class="tbl cards"><table><thead><tr><th>Plan</th><th class="n">Deal / mo</th><th class="n">Pay today</th><th class="n">Renews / mo</th><th class="n">3 years (cash)</th><th class="n">Jump</th><th class="n">1 year</th><th class="n">2 years</th><th>Specs</th><th>Source</th></tr></thead><tbody>
${rows.map(r=>`<tr>${L('Plan',`<b>${esc(r.d.provider)} ${esc(r.d.plan)}</b>`)}${L('Deal / mo',m$(r.d.promo_mo),'','n')}${L('Pay today',`${m$(r.d.prepay_total)} <span class="note">for ${r.d.prepay_months} mo</span>`,'','n')}${L('Renews / mo',m$(r.d.renew_mo),'','n')}${L('3 years (cash)',`${m$(r.c3)} <span class="note">covers ${r.cov3} mo</span>`,'','n')}${L('Jump',`+${r.jump}%`,'','n')}${L('1 year',m$(r.c1),'','n')}${L('2 years',m$(r.c2),'','n')}${L('Specs',`${r.d.vcpu} vCPU · ${r.d.ram_gb} GB · ${r.d.disk_gb} GB NVMe`)}${L('Source',`<a href="${r.d.source}" rel="noopener">vendor page</a> · ${r.d.checked}`,'','src')}</tr>`).join('')}
</tbody></table></div>
<p class="note">Quoted from the vendor page: “${esc(B.deals[0].quote)}” A 24-month renewal is billed up front: KVM 1 ${m$(rows[0].renewCharge)}, KVM 2 ${m$(rows[1].renewCharge)}, KVM 4 ${m$(rows[2].renewCharge)}, KVM 8 ${m$(rows[3].renewCharge)}. Per month of service over those 48 months: ${rows.map(r=>`${r.d.plan} ${m$(r.c3/r.cov3)}`).join(', ')}. Hostinger shows crossed-out prices (${rows.map(r=>`${r.d.plan} ${m$(r.d.strike_mo)}`).join(', ')}); we don’t use them as a baseline.</p>
<h2>Versus a no-prepay VPS with the same RAM</h2>
<p class="mut">Each RAM tier adds the cheapest verified, in-stock plan in our ledger that bills monthly with no commitment (OVHcloud re-read ${rows.flatMap(r=>r.alts).find(a=>a.provider_id==='ovhcloud')?.checked||B.checked} on its <a href="https://api.us.ovhcloud.com/v1/order/catalog/public/vps?ovhSubsidiary=US" rel="noopener">public US catalog</a>), plus Vultr and DigitalOcean. None of them showed a Black Friday VPS price on ${B.checked}; their list price is what you pay every year. Hostinger’s 3-year figure is cash with a same-term renewal.</p>
<div class="tbl cards"><table><thead><tr><th>RAM</th><th>Option</th><th class="n">/ mo</th>${H.map(h=>`<th class="n">${h}</th>`).join('')}<th>Note</th></tr></thead><tbody>
${rows.map(r=>r.opts.map((o,j)=>{const name=o.deal?`${esc(o.name)} (Black Friday)`:`${o.a.plan_id?`<a href="/providers/${o.a.provider_id}">${esc(o.a.provider)}</a>`:esc(o.a.provider)} ${esc(o.a.plan)}`;const mo=o.deal?`${m$(r.d.promo_mo)} → ${m$(r.d.renew_mo)}`:m$(o.a.mo);const note=o.deal?`${r.d.prepay_months}-mo prepay, renews same term · ${esc(r.d.includes)}`:`${esc(o.a.note)} · <a href="${o.a.source}" rel="noopener">source</a> ${o.a.checked}`;
 return `<tr>${L('RAM',`<b>${r.d.ram_gb} GB</b>`)}${L('Option',name)}${L('/ mo',mo,'','n')}${o.c.map((v,i)=>L(H[i],m$(v),` data-bf="${r.d.ram_gb}|${i}|${v.toFixed(2)}"${v===r.best[i]?' data-bf-best="1" style="font-weight:700"':''}`,'n')).join('')}${L('Note',note,'','note')}</tr>`}).join('')).join('')}
</tbody></table></div>
<p class="note">Bold = lowest for that RAM and period among every row shown. Specs are not identical (vCPU count, disk, bandwidth and CPU class differ); compare on what your workload needs. Hetzner CX23/CX33, the usual cheaper no-promo pick, were sold out in our ${B.checked} check (EU only). Contabo and IONOS list lower headline prices but their rows aren’t verified in our ledger yet, so they’re not shown. For every tracked plan with IPv4, backups and egress added, use the <a href="/calculator">TCO calculator</a>.</p>
<h2>Checked: no Black Friday VPS price shown</h2>
<p class="mut">We read these official pages on ${B.checked} and found no Black Friday / Cyber Monday VPS price on them. Sales can appear later; we re-check and log changes in the <a href="/changes">price log</a>.</p>
<ul>${B.checked_no_bf_price.map(x=>`<li>${esc(x.provider)} — <a href="${x.url}" rel="noopener">${esc(x.url.replace(/^https?:\/\//,''))}</a></li>`).join('')}</ul>
<h2>Not yet checked</h2><p class="mut">${B.not_yet_checked.map(esc).join(' · ')}. We list a sale only after reading the price, term and renewal on the vendor’s own page.</p>
<h2>How to judge any Black Friday VPS deal</h2><ul><li><b>Find the renewal price</b> and the term it renews for. If it renews for the same 24-month term, that whole term is billed up front at month 25.</li><li><b>Find the prepay.</b> “$8.79/mo” billed as ${m$(k2.d.prepay_total)} today is a ${k2.d.prepay_months}-month commitment.</li><li><b>Compare 3-year cash</b>, not the headline monthly rate, against a monthly-billed plan you could leave any time.</li><li><b>Count the extras</b>: backups (included at Hostinger, +20% at Vultr), IPv4, bandwidth overage.</li></ul>
<h2>Questions</h2>${faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
${mailBox('gbf','Tell me when a Black Friday VPS promo ends or a new one is verified','Send me the weekly ledger')}
${cite(`Black Friday VPS deals 2026 renewal math as of ${B.checked}`)}
`});
return {hub:{file:'guides/black-friday-vps-deals-2026.html',title:'Black Friday VPS deals 2026: the renewal math',blurb:`${k2.d.plan} ${m$(k2.d.promo_mo)} → ${m$(k2.d.renew_mo)}/mo at renewal (+${k2.jump}%)`},faq,answer,url,rows,B,lowest:lowestLines.map(x=>x.txt)};
}
