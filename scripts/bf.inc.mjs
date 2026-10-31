// RT-20261031-53: Black Friday / Cyber Monday VPS deals page. Only promos read on the vendor's own page (data/promos-bf-2026.json); renewal math, no guessing.
import fs from 'node:fs';
export default function bf({page,SITE,NAME,esc,mailBox,crumbs,crumbLd,ORG,cite,root}){
const B=JSON.parse(fs.readFileSync(root+'/data/promos-bf-2026.json','utf8'));
const file='guides/black-friday-vps-deals-2026.html',url=SITE+'/guides/black-friday-vps-deals-2026';
const m$=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
// Cost of N months of service. Promo: the prepaid term covers the first prepay_months (you pay it all up front even if you leave early); after that the renewal monthly rate.
const dealCost=(d,n)=>d.prepay_total+Math.max(0,n-d.prepay_months)*d.renew_mo;
const altCost=(a,n)=>a.mo*n;
const rows=B.deals.map(d=>({d,c1:dealCost(d,12),c2:dealCost(d,24),c3:dealCost(d,36),jump:Math.round((d.renew_mo/d.promo_mo-1)*100),renewCharge:d.renew_mo*d.prepay_months,alts:(B.alternatives[String(d.ram_gb)]||[])}));
const big=rows.reduce((a,b)=>b.jump>a.jump?b:a);const k2=rows.find(r=>r.d.plan==='KVM 2')||rows[0];
const answer=`The Black Friday price is not what you pay at renewal. As of ${B.checked}, Hostinger's VPS sale lists KVM 2 (2 vCPU / 8 GB) at ${m$(k2.d.promo_mo)}/mo, but only on a ${k2.d.prepay_months}-month prepay (${m$(k2.d.prepay_total)} today), and it renews at ${m$(k2.d.renew_mo)}/mo (+${k2.jump}%). Its 3-year cost is ${m$(k2.c3)} (${m$(k2.c3/36)}/mo averaged). The biggest renewal jump is ${big.d.plan}: ${m$(big.d.promo_mo)} → ${m$(big.d.renew_mo)} (+${big.jump}%). Even at renewal, these plans stay below Vultr and DigitalOcean list prices for the same RAM; the catch is the up-front prepay and the lock-in.`;
const faq=[
 ['What is the best Black Friday VPS deal in 2026?',`We only list deals we read on the vendor's own page. As of ${B.checked} that is Hostinger's VPS sale: ${rows.map(r=>`${r.d.plan} ${m$(r.d.promo_mo)}/mo (renews ${m$(r.d.renew_mo)})`).join(', ')}, each on a ${B.deals[0].prepay_months}-month prepay. ${B.checked_no_bf_price.map(x=>x.provider).join(', ')} showed no Black Friday VPS price on the pages we read that day.`],
 ['How much does a Hostinger Black Friday VPS cost after renewal?',rows.map(r=>`${r.d.plan}: ${m$(r.d.promo_mo)}/mo now, renews at ${m$(r.d.renew_mo)}/mo (+${r.jump}%)`).join('; ')+`. Hostinger's page says the renewal is "for the same term", so renewing a 24-month plan is billed up front again (KVM 2: ${m$(k2.renewCharge)}).`],
 ['Do I have to prepay to get the Black Friday VPS price?',`Yes for Hostinger: the page says "All plans are paid upfront" and each deal shows the 24-month total (KVM 1 ${m$(rows[0].d.prepay_total)}). Hostinger offers a 30-day money-back guarantee. Vultr and DigitalOcean bill monthly/hourly with no prepay.`],
 ['Is a Black Friday VPS cheaper than DigitalOcean or Vultr over 3 years?',rows.filter(r=>r.alts.length).map(r=>`${r.d.plan} (${r.d.ram_gb} GB): ${m$(r.c3)} over 3 years vs ${r.alts.map(a=>`${a.provider} ${m$(altCost(a,36))}`).join(', ')}`).join('; ')+'. List prices only; Vultr automatic backups add 20%, Hostinger includes weekly backups.'],
 ['When was this checked?',`${B.checked}. Each row links the vendor page we read. Sales change daily; re-check the vendor page before you pay.`]
];
const yr=(n,v,best)=>`<td class="n"${best?' style="font-weight:700"':''}>${m$(v)}</td>`;
page({file,og:'changes',title:`Black Friday VPS deals 2026: the renewal math (checked ${B.checked}) | ${NAME}`,desc:`Black Friday VPS deals 2026 with the price you pay after the promo: Hostinger KVM 1-8 promo, 24-month prepay, renewal and 1/2/3-year cost vs Vultr and DigitalOcean. Checked ${B.checked}.`,ld:[
 ORG,crumbLd([{label:'Home',href:'/'},{label:'Guides',href:'/guides/'},{label:'Black Friday VPS 2026',href:'/guides/black-friday-vps-deals-2026'}]),
 {'@context':'https://schema.org','@type':'Article',headline:'Black Friday VPS deals 2026: what you pay after the promo',datePublished:'2026-10-31',dateModified:B.checked,author:{'@id':SITE+'/#org'},publisher:{'@id':SITE+'/#org'},mainEntityOfPage:url,citation:[...new Set([...B.deals.map(d=>d.source),...Object.values(B.alternatives).flat().map(a=>a.source)])]},
 {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
],body:`
${crumbs([{href:'/',label:'Home'},{href:'/guides/',label:'Guides'},{href:'/guides/black-friday-vps-deals-2026',label:'Black Friday VPS 2026'}])}
<section class="hero"><div class="eyebrow">${esc(B.season)} · checked ${B.checked}</div><h1>The Black Friday VPS price isn’t what you pay at renewal.</h1>
<p class="lede"><b>Answer:</b> ${esc(answer)}</p></section>
<div class="panel"><div class="eyebrow">Key stats</div><ul style="margin:10px 0 0;padding-left:18px">
<li><b>Deals verified on vendor pages:</b> ${rows.length} (Hostinger KVM 1, 2, 4, 8)</li>
<li><b>Prepay required:</b> ${B.deals[0].prepay_months} months, paid up front (${m$(Math.min(...B.deals.map(d=>d.prepay_total)))}–${m$(Math.max(...B.deals.map(d=>d.prepay_total)))})</li>
<li><b>Renewal jump:</b> +${Math.min(...rows.map(r=>r.jump))}% to +${big.jump}%</li>
<li><b>Checked with no Black Friday VPS price shown:</b> ${B.checked_no_bf_price.length} providers</li>
<li><b>Last verified:</b> ${B.checked}</li></ul></div>
<h2>Deal price vs what you actually pay</h2>
<p class="mut">USD, list prices before tax. “1 year” is cash out of pocket: the deal requires a 24-month prepay, so leaving after 12 months still costs the full prepay (after the 30-day money-back window). “3 years” = the prepay + 12 months at the renewal rate.</p>
<div class="tbl"><table><thead><tr><th>Plan</th><th>Specs</th><th class="n">Deal / mo</th><th class="n">Pay today</th><th class="n">Renews / mo</th><th class="n">Jump</th><th class="n">1 year</th><th class="n">2 years</th><th class="n">3 years</th><th>Source</th></tr></thead><tbody>
${rows.map(r=>`<tr><td><b>${esc(r.d.provider)} ${esc(r.d.plan)}</b></td><td>${r.d.vcpu} vCPU · ${r.d.ram_gb} GB · ${r.d.disk_gb} GB NVMe</td><td class="n">${m$(r.d.promo_mo)}</td><td class="n">${m$(r.d.prepay_total)}<br><span class="note">${r.d.prepay_months} mo</span></td><td class="n">${m$(r.d.renew_mo)}</td><td class="n">+${r.jump}%</td><td class="n">${m$(r.c1)}</td><td class="n">${m$(r.c2)}</td><td class="n">${m$(r.c3)}</td><td class="src"><a href="${r.d.source}" rel="noopener">vendor page</a> · ${r.d.checked}</td></tr>`).join('')}
</tbody></table></div>
<p class="note">Quoted from the vendor page: “${esc(B.deals[0].quote)}” Renewal is “for the same term”, so a 24-month renewal is billed up front again (KVM 1 ${m$(rows[0].renewCharge)}, KVM 2 ${m$(rows[1].renewCharge)}, KVM 4 ${m$(rows[2].renewCharge)}, KVM 8 ${m$(rows[3].renewCharge)}). Hostinger shows crossed-out prices (${rows.map(r=>`${r.d.plan} ${m$(r.d.strike_mo)}`).join(', ')}); we don’t use them as a baseline.</p>
<h2>Versus a no-promo VPS with the same RAM</h2>
<p class="mut">Vultr and DigitalOcean bill monthly with no prepay and showed no Black Friday VPS price on ${B.checked}. Their list price is what you pay in year 3.</p>
<div class="tbl"><table><thead><tr><th>RAM</th><th>Option</th><th class="n">/ mo</th><th class="n">1 year</th><th class="n">2 years</th><th class="n">3 years</th><th>Note</th></tr></thead><tbody>
${rows.map(r=>{const opts=[{name:`${r.d.provider} ${r.d.plan} (Black Friday)`,mo:`${m$(r.d.promo_mo)} → ${m$(r.d.renew_mo)}`,c:[r.c1,r.c2,r.c3],note:`${r.d.prepay_months}-mo prepay · ${r.d.includes}`,src:r.d.source},...r.alts.map(a=>({name:`${a.plan_id?`<a href="/providers/${a.provider_id}">${esc(a.provider)}</a>`:esc(a.provider)} ${esc(a.plan)}`,mo:m$(a.mo),c:[12,24,36].map(n=>altCost(a,n)),note:`${a.note} · <a href="${a.source}" rel="noopener">source</a> ${a.checked}`,raw:true}))];const best=[0,1,2].map(i=>Math.min(...opts.map(o=>o.c[i])));return opts.map((o,j)=>`<tr><td>${j?'':`<b>${r.d.ram_gb} GB</b>`}</td><td>${o.raw?o.name:esc(o.name)}</td><td class="n">${o.mo}</td>${o.c.map((v,i)=>yr(i,v,v===best[i])).join('')}<td class="note">${o.raw?o.note:esc(o.note)}</td></tr>`).join('')}).join('')}
</tbody></table></div>
<p class="note">Bold = lowest for that RAM and period. Specs are not identical (vCPU count, disk, bandwidth and CPU class differ); compare on what your workload needs. Hetzner CX23/CX33, the usual cheaper no-promo pick, were sold out in our ${B.checked} check (EU only). For every tracked plan with IPv4, backups and egress added, use the <a href="/calculator">TCO calculator</a>.</p>
<h2>Checked: no Black Friday VPS price shown</h2>
<p class="mut">We read these official pages on ${B.checked} and found no Black Friday / Cyber Monday VPS price on them. Sales can appear later; we re-check and log changes in the <a href="/changes">price log</a>.</p>
<ul>${B.checked_no_bf_price.map(x=>`<li>${esc(x.provider)} — <a href="${x.url}" rel="noopener">${esc(x.url.replace(/^https?:\/\//,''))}</a></li>`).join('')}</ul>
<h2>Not yet checked</h2><p class="mut">${B.not_yet_checked.map(esc).join(' · ')}. We list a sale only after reading the price, term and renewal on the vendor’s own page.</p>
<h2>How to judge any Black Friday VPS deal</h2><ul><li><b>Find the renewal price</b> and the term it renews for. Multiply it out; that is your real price from month 25.</li><li><b>Find the prepay.</b> “$8.79/mo” billed as ${m$(k2.d.prepay_total)} today is a ${k2.d.prepay_months}-month commitment.</li><li><b>Compare 3-year cost</b>, not the headline monthly rate, against a monthly-billed plan you could leave any time.</li><li><b>Count the extras</b>: backups (included at Hostinger, +20% at Vultr), IPv4, bandwidth overage.</li></ul>
<h2>Questions</h2>${faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
${mailBox('gbf','Tell me when a Black Friday VPS promo ends or a new one is verified','Send me the weekly ledger')}
${cite(`Black Friday VPS deals 2026 renewal math as of ${B.checked}`)}
`});
return {hub:{file:'guides/black-friday-vps-deals-2026.html',title:'Black Friday VPS deals 2026: the renewal math',blurb:`${k2.d.plan} ${m$(k2.d.promo_mo)} → ${m$(k2.d.renew_mo)}/mo at renewal (+${k2.jump}%)`},faq,answer,url,rows,B};
}
