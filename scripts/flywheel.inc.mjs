// Programmatic SEO + GEO flywheel for VPSLedger. Cross-links O11y Watch where relevant.
export default function flywheel(ctx){
const {STUDY,providers,plans,changes,P,page:page0,W,SITE,NAME,esc,usd,yr,tco,ver,lastChecked,EG,SPECS,equiv,rankFor,mailBox,meth,asOf,FX,FX_EUR_USD,tag,aff}=ctx;
const page=o=>page0(STUDY&&o.file.startsWith('guides/')?{...o,body:o.body.replace('<section class="mail">',STUDY.callout+'<section class="mail">')}:o);
const O11Y='https://o11y-watch.pages.dev';
const ORG={
  '@context':'https://schema.org','@type':'Organization','@id':SITE+'/#org',
  name:NAME,url:SITE+'/',
  sameAs:['https://bsky.app/profile/o11ywatch.bsky.social','https://github.com/Basileion/vpsledger']
};
const crumbs=(parts)=>`<nav class="crumbs" aria-label="Breadcrumb" style="font-size:13px;color:var(--mut);margin:18px 0 8px">${parts.map((p,i)=>i<parts.length-1?`<a href="${p.href}">${esc(p.label)}</a> · `:`<span>${esc(p.label)}</span>`).join('')}</nav>`;
const crumbLd=(parts)=>({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:parts.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.label,item:p.href.startsWith('http')?p.href:SITE+p.href}))});
const keyStats=(items)=>`<div class="panel"><div class="eyebrow">Key stats</div><ul style="margin:10px 0 0;padding-left:18px">${items.map(([k,v])=>`<li><b>${esc(k)}:</b> ${esc(v)}</li>`).join('')}</ul><p class="note" style="margin-top:10px">Last verified ${lastChecked}. ${meth}.</p></div>`;
const cite=(label)=>`<div class="panel"><h3 class="h3">Cite this</h3><p class="note">CC BY 4.0 — please attribute “${NAME}” with a link to ${SITE}/.</p><pre style="white-space:pre-wrap;font-size:12px">${esc(`Data: ${label}. Source: ${NAME} (${SITE}). License: CC BY 4.0.`)}</pre></div>`;
const o11yNote=(topic)=>`<div class="panel" style="border-style:dashed"><div class="eyebrow">Related · observability cost</div><p class="mut">Monitoring your VPS fleet? See what observability costs on <a href="${O11Y}/guides/">O11y Watch pricing guides</a> or run the free <a href="${O11Y}/audit.html">$149 audit estimate</a> (${topic}).</p></div>`;
const hub=[];

// Cheapest by RAM
for(const ram of [2,4,8]){
  const rows=ver.filter(p=>p.ram_gb===ram).map(p=>({p,t:tco(p,EG,true,true)})).filter(x=>x.t).sort((a,b)=>a.t.total-b.t.total);
  if(rows.length<2) continue;
  const best=rows[0], worst=rows.at(-1);
  const file=`guides/cheapest-${ram}gb-vps.html`;
  const answer=`As of ${lastChecked}, among ${rows.length} verified ${ram} GB RAM plans at ${EG} TB egress with backups, the cheapest true monthly cost is ${best.p.provider} ${best.p.plan} at ${usd(best.t.total)}/mo. The priciest in this slice is ${worst.p.provider} ${worst.p.plan} at ${usd(worst.t.total)}/mo — a gap of ${yr(worst.t.total-best.t.total)}/yr.`;
  const faq=[
    [`What is the cheapest ${ram} GB VPS?`, `${best.p.provider} ${best.p.plan} at ${usd(best.t.total)}/mo true cost (${EG} TB egress, backups on), checked ${best.p.checked}.`],
    ['What is “true monthly cost”?','List/renewal price + IPv4 + backups + bandwidth overage at the egress you choose. EUR converted at the ECB rate on the methodology page.'],
    ['Last verified?', lastChecked],
  ];
  page({file,og:'compare',title:`Cheapest ${ram} GB VPS (${lastChecked.slice(0,4)}) — true monthly cost | ${NAME}`,desc:answer.slice(0,155),ld:[
    ORG,
    crumbLd([{label:'Home',href:'/'},{label:'Guides',href:'/guides/'},{label:`Cheapest ${ram} GB`,href:'/'+file}]),
    {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
  ],body:`
${crumbs([{href:'/',label:'Home'},{href:'/guides/',label:'Guides'},{href:'/'+file,label:`Cheapest ${ram} GB`}])}
<section class="hero"><div class="eyebrow">Guide · ${EG} TB egress · backups on</div><h1>Cheapest ${ram} GB VPS</h1>
<p class="lede"><b>Answer:</b> ${esc(answer)}</p></section>
${keyStats([
  ['Cheapest', `${best.p.provider} ${best.p.plan} — ${usd(best.t.total)}/mo`],
  ['Priciest in slice', `${worst.p.provider} ${worst.p.plan} — ${usd(worst.t.total)}/mo`],
  ['Yearly gap', yr(worst.t.total-best.t.total)],
  ['Plans compared', String(rows.length)],
  ['Last verified', lastChecked],
])}
<h2>Ranked ${ram} GB plans</h2>
<div class="tbl"><table><thead><tr><th>#</th><th>Provider</th><th>Plan</th><th class="n">vCPU</th><th class="n">Disk</th><th class="n">Incl. TB</th><th class="n">List</th><th class="n">True / mo</th><th>Source</th></tr></thead><tbody>
${rows.map((x,i)=>`<tr><td class="n">${i+1}</td><td><a href="/providers/${x.p.provider_id}.html">${esc(x.p.provider)}</a></td><td>${esc(x.p.plan)}</td><td class="n">${x.p.vcpu??'—'}</td><td class="n">${x.p.disk_gb??'—'}</td><td class="n">${x.p.transfer_tb??'—'}</td><td class="n">${usd(x.t.base)}</td><td class="n">${usd(x.t.total)}</td><td class="src"><a href="${x.p.source}">source</a> · ${x.p.checked}</td></tr>`).join('')}
</tbody></table></div>
<p class="note">${asOf}. ${meth}.</p>
${o11yNote(`${ram} GB fleet`)}
${mailBox('g'+ram,`Alert me when a cheaper ${ram} GB plan appears`,'Send the weekly ledger')}
${cite(`Cheapest ${ram} GB VPS ranking as of ${lastChecked}`)}
`});
  hub.push({file,title:`Cheapest ${ram} GB VPS`,blurb:`${best.p.provider} ${best.p.plan} at ${usd(best.t.total)}/mo true cost`});
}

// Hetzner alternatives
{
  const hetz=providers.find(p=>p.id==='hetzner');
  if(hetz){
    const hPlans=ver.filter(p=>p.provider_id==='hetzner');
    const alts=ver.filter(p=>p.provider_id!=='hetzner');
    const file='guides/hetzner-alternatives.html';
    const answers=[];
    for(const s of SPECS){
      const r=rankFor(s);
      const h=r.find(x=>x.p.provider_id==='hetzner');
      if(!h) continue;
      const cheaper=r.filter(x=>x.t.total<h.t.total);
      const next=r.find(x=>x.p.provider_id!=='hetzner');
      answers.push({s,h,cheaper,next});
    }
    const lead=answers[0];
    const answer=lead
      ? `As of ${lastChecked}, for ${lead.s.cpu} vCPU / ${lead.s.ram} GB at ${EG} TB egress with backups, Hetzner ${lead.h.p.plan} costs ${usd(lead.h.t.total)}/mo true cost (rank #${rankFor(lead.s).findIndex(x=>x.p.provider_id==='hetzner')+1} of ${rankFor(lead.s).length}). ${lead.cheaper.length?`${lead.cheaper.length} verified alternative(s) are cheaper — lowest is ${lead.cheaper[0].p.provider} ${lead.cheaper[0].p.plan} at ${usd(lead.cheaper[0].t.total)}/mo.`:`No verified alternative in this dataset is cheaper on true monthly cost.`}`
      : `Hetzner has ${hPlans.length} verified plans in the ledger as of ${lastChecked}; compare true monthly cost against other providers below.`;
    const faq=[
      ['What are the best Hetzner alternatives?', answer],
      ['Do you include fees?', `Yes — true monthly cost adds IPv4, backups and overage at ${EG} TB. ${meth.replace(/<[^>]+>/g,'')}`],
      ['Last verified?', lastChecked],
    ];
    page({file,og:'compare',title:`Hetzner alternatives (${lastChecked.slice(0,4)}) — true monthly cost | ${NAME}`,desc:answer.slice(0,155),ld:[
      ORG, crumbLd([{label:'Home',href:'/'},{label:'Guides',href:'/guides/'},{label:'Hetzner alternatives',href:'/'+file}]),
      {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
    ],body:`
${crumbs([{href:'/',label:'Home'},{href:'/guides/',label:'Guides'},{href:'/'+file,label:'Hetzner alternatives'}])}
<section class="hero"><div class="eyebrow">Alternatives · sourced</div><h1>Hetzner alternatives</h1>
<p class="lede"><b>Answer:</b> ${esc(answer)}</p></section>
${keyStats([
  ['Hetzner plans tracked', String(hPlans.length)],
  ...(lead?[['Hetzner true / mo (2/4 class)', usd(lead.h.t.total)],['Cheaper verified alts', String(lead.cheaper.length)]]:[]),
  ['Last verified', lastChecked],
  ['Hetzner source', hetz.source],
])}
<h2>Hetzner plans in the ledger</h2>
<div class="tbl"><table><thead><tr><th>Plan</th><th class="n">vCPU</th><th class="n">RAM</th><th class="n">List</th><th class="n">True @${EG}TB</th><th>Source</th></tr></thead><tbody>
${hPlans.map(p=>{const t=tco(p,EG,true,true);return `<tr><td>${esc(p.plan)}</td><td class="n">${p.vcpu}</td><td class="n">${p.ram_gb}</td><td class="n">${p.currency==='EUR'?'€':'$'}${p.price_mo?.toFixed(2)}</td><td class="n">${usd(t?.total)}</td><td class="src"><a href="${p.source}">source</a> · ${p.checked}</td></tr>`}).join('')}
</tbody></table></div>
<h2>Head-to-head by spec</h2>
${answers.map(({s,h,cheaper})=>{
  const r=rankFor(s).slice(0,8);
  return `<h3>${s.cpu} vCPU / ${s.ram} GB</h3><div class="tbl"><table><thead><tr><th>#</th><th>Provider</th><th>Plan</th><th class="n">True / mo</th><th class="n">vs Hetzner / yr</th></tr></thead><tbody>
${r.map((x,i)=>`<tr${x.p.provider_id==='hetzner'?' style="font-weight:600"':''}><td class="n">${i+1}</td><td>${esc(x.p.provider)}</td><td>${esc(x.p.plan)}</td><td class="n">${usd(x.t.total)}</td><td class="n">${x.p.provider_id==='hetzner'?'—':yr(x.t.total-h.t.total)}</td></tr>`).join('')}
</tbody></table></div>`;
}).join('')}
<p><a class="btn ghost" href="/providers/hetzner.html">Full Hetzner provider page</a> <a class="btn ghost" href="/compare/hetzner-vs-digitalocean.html">Hetzner vs DigitalOcean</a></p>
${o11yNote('Hetzner or alternative fleet')}
${mailBox('ghz','Watch Hetzner and cheaper alts','Send the weekly ledger')}
${cite(`Hetzner alternatives as of ${lastChecked}`)}
`});
    hub.push({file,title:'Hetzner alternatives',blurb:lead?`Hetzner ${lead.h.p.plan} ${usd(lead.h.t.total)}/mo; ${lead.cheaper.length} cheaper verified alt(s)`:`${hPlans.length} Hetzner plans tracked`});
  }
}

// Generic provider alternatives (cheaper on true monthly cost) for high-intent queries
for(const pid of ['digitalocean','vultr','linode','lightsail','hostinger','ovhcloud']){
  const pr=providers.find(p=>p.id===pid); if(!pr) continue;
  const mine=ver.filter(p=>p.provider_id===pid);
  if(mine.length<1) continue;
  const file=`guides/${pid}-alternatives.html`;
  const answers=[];
  for(const s of SPECS){
    const r=rankFor(s);
    const self=r.find(x=>x.p.provider_id===pid);
    if(!self) continue;
    const cheaper=r.filter(x=>x.p.provider_id!==pid&&x.t.total<self.t.total);
    answers.push({s,self,cheaper,rank:r.findIndex(x=>x.p.provider_id===pid)+1,total:r.length});
  }
  if(!answers.length) continue;
  const lead=answers[0];
  const answer=lead
    ? `As of ${lastChecked}, for ${lead.s.cpu} vCPU / ${lead.s.ram} GB at ${EG} TB egress with backups, ${pr.name} ${lead.self.p.plan} costs ${usd(lead.self.t.total)}/mo true cost (rank #${lead.rank} of ${lead.total}). ${lead.cheaper.length?`${lead.cheaper.length} verified alternative(s) are cheaper — lowest is ${lead.cheaper[0].p.provider} ${lead.cheaper[0].p.plan} at ${usd(lead.cheaper[0].t.total)}/mo.`:`No verified alternative in this dataset is cheaper on true monthly cost for this spec.`}`
    : `${pr.name} has ${mine.length} verified plan(s) in the ledger as of ${lastChecked}.`;
  const faq=[
    [`What are cheaper ${pr.name} alternatives?`, answer],
    ['Do you include fees?', `Yes — true monthly cost adds IPv4, backups and overage at ${EG} TB.`],
    ['Last verified?', lastChecked],
  ];
  page({file,og:'compare',title:`${pr.name} alternatives (${lastChecked.slice(0,4)}) — cheaper VPS by true cost | ${NAME}`,desc:answer.slice(0,155),ld:[
    ORG, crumbLd([{label:'Home',href:'/'},{label:'Guides',href:'/guides/'},{label:`${pr.name} alternatives`,href:'/'+file}]),
    {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
  ],body:`
${crumbs([{href:'/',label:'Home'},{href:'/guides/',label:'Guides'},{href:'/'+file,label:`${pr.name} alternatives`}])}
<section class="hero"><div class="eyebrow">Alternatives · sourced</div><h1>${esc(pr.name)} alternatives (cheaper)</h1>
<p class="lede"><b>Answer:</b> ${esc(answer)}</p></section>
${keyStats([
  [`${pr.name} plans tracked`, String(mine.length)],
  ...(lead?[[`${pr.name} true / mo (${lead.s.cpu}/${lead.s.ram})`, usd(lead.self.t.total)],['Cheaper verified alts', String(lead.cheaper.length)]]:[]),
  ['Last verified', lastChecked],
  ['Source', pr.source],
])}
<h2>${esc(pr.name)} plans in the ledger</h2>
<div class="tbl"><table><thead><tr><th>Plan</th><th class="n">vCPU</th><th class="n">RAM</th><th class="n">List</th><th class="n">True @${EG}TB</th><th>Source</th></tr></thead><tbody>
${mine.map(p=>{const t=tco(p,EG,true,true);return `<tr><td>${esc(p.plan)}</td><td class="n">${p.vcpu}</td><td class="n">${p.ram_gb}</td><td class="n">${p.currency==='EUR'?'€':'$'}${p.price_mo?.toFixed(2)}</td><td class="n">${usd(t?.total)}</td><td class="src"><a href="${p.source}">source</a> · ${p.checked}</td></tr>`}).join('')}
</tbody></table></div>
<h2>Head-to-head by spec</h2>
${answers.map(({s,self,cheaper,rank,total})=>{
  const r=rankFor(s).slice(0,8);
  return `<h3>${s.cpu} vCPU / ${s.ram} GB</h3><div class="tbl"><table><thead><tr><th>#</th><th>Provider</th><th>Plan</th><th class="n">True / mo</th><th class="n">vs ${esc(pr.name)} / yr</th></tr></thead><tbody>
${r.map((x,i)=>`<tr${x.p.provider_id===pid?' style="font-weight:600"':''}><td class="n">${i+1}</td><td>${esc(x.p.provider)}</td><td>${esc(x.p.plan)}</td><td class="n">${usd(x.t.total)}</td><td class="n">${x.p.provider_id===pid?'—':yr(x.t.total-self.t.total)}</td></tr>`).join('')}
</tbody></table></div><p class="note">${esc(pr.name)} rank #${rank} of ${total}; ${cheaper.length} cheaper verified alt(s).</p>`;
}).join('')}
<p><a class="btn ghost" href="/providers/${pid}.html">Full ${esc(pr.name)} page</a> <a class="btn ghost" href="/calculator.html">TCO calculator</a> <a class="btn ghost" href="/guides/${pid}-pricing.html">${esc(pr.name)} pricing</a></p>
${o11yNote(`${pr.name} or alternative fleet`)}
${mailBox('galt'+pid,`Watch ${pr.name} and cheaper alts`,'Send the weekly ledger')}
${cite(`${pr.name} alternatives as of ${lastChecked}`)}
`});
  hub.push({file,title:`${pr.name} alternatives`,blurb:lead?`${pr.name} ${lead.self.p.plan} ${usd(lead.self.t.total)}/mo; ${lead.cheaper.length} cheaper verified alt(s)`:`${mine.length} ${pr.name} plans tracked`});
}


// Renewal / promo price pages
const promoProviders=[...new Set(ver.filter(p=>p.promo_mo!=null).map(p=>p.provider_id))];
for(const pid of promoProviders){
  const pr=P[pid]; if(!pr) continue;
  const ps=ver.filter(p=>p.provider_id===pid&&p.promo_mo!=null);
  if(!ps.length) continue;
  const top=ps.map(p=>({p,jump:p.price_mo-p.promo_mo,pct:(p.price_mo/p.promo_mo-1)*100})).sort((a,b)=>b.pct-a.pct)[0];
  const file=`guides/${pid}-renewal-price.html`;
  const answer=`As of ${ps[0].checked}, ${pr.name} advertises intro prices that renew higher. Example: ${top.p.plan} is $${top.p.promo_mo.toFixed(2)}/mo intro and renews at $${top.p.price_mo.toFixed(2)}/mo (+${Math.round(top.pct)}%). VPSLedger ranks on renewal/list price so year-three cost is visible.`;
  const faq=[
    [`What is the ${pr.name} renewal price?`, answer],
    ['Do you rank on promo or renewal?', 'Renewal / regular list price. Intro prices are shown alongside.'],
    ['Last verified?', ps.map(p=>p.checked).sort().at(-1)],
  ];
  page({file,og:'changes',title:`${pr.name} renewal price vs intro (${lastChecked.slice(0,4)}) | ${NAME}`,desc:answer.slice(0,155),ld:[
    ORG, crumbLd([{label:'Home',href:'/'},{label:'Guides',href:'/guides/'},{label:`${pr.name} renewal`,href:'/'+file}]),
    {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
  ],body:`
${crumbs([{href:'/',label:'Home'},{href:'/guides/',label:'Guides'},{href:'/'+file,label:`${pr.name} renewal`}])}
<section class="hero"><div class="eyebrow">Renewal risk · sourced</div><h1>${esc(pr.name)} renewal price</h1>
<p class="lede"><b>Answer:</b> ${esc(answer)}</p></section>
${keyStats([
  ['Largest jump', `${top.p.plan}: $${top.p.promo_mo.toFixed(2)} → $${top.p.price_mo.toFixed(2)} (+${Math.round(top.pct)}%)`],
  ['Plans with intro price', String(ps.length)],
  ['Source', pr.source],
  ['Last verified', ps.map(p=>p.checked).sort().at(-1)],
])}
<div class="tbl"><table><thead><tr><th>Plan</th><th class="n">Intro / mo</th><th class="n">Renewal / mo</th><th class="n">Jump</th><th class="n">$/yr extra</th><th>Source</th></tr></thead><tbody>
${ps.map(p=>`<tr><td>${esc(p.plan)}</td><td class="n">$${p.promo_mo.toFixed(2)}</td><td class="n">$${p.price_mo.toFixed(2)}</td><td class="n">+${Math.round((p.price_mo/p.promo_mo-1)*100)}%</td><td class="n">$${((p.price_mo-p.promo_mo)*12).toFixed(0)}</td><td class="src"><a href="${p.source}">source</a> · ${p.checked}</td></tr>`).join('')}
</tbody></table></div>
<p><a href="/providers/${pid}.html">${esc(pr.name)} provider page</a> · <a href="/changes.html">Price log</a></p>
${o11yNote(`${pr.name} hosts`)}
${mailBox('gr'+pid,`Warn me before ${pr.name} renewals jump`,'Send the weekly ledger')}
${cite(`${pr.name} renewal vs intro as of ${lastChecked}`)}
`});
  hub.push({file,title:`${pr.name} renewal price`,blurb:`${top.p.plan} +${Math.round(top.pct)}% at renewal`});
}

// Provider pricing explainers for majors (answer-first wrappers around provider data)
for(const pid of ['digitalocean','vultr','linode','ovhcloud','lightsail','hostinger','hetzner','kamatera','upcloud','gcp','azure','contabo','scaleway','ionos','dreamhost']){
  const pr=P[pid]; if(!pr) continue;
  const ps=plans.filter(p=>p.provider_id===pid);
  const vps=ps.filter(p=>p.status==='verified'&&p.price_mo!=null);
  if(!vps.length) continue;
  const cheapest=vps.map(p=>({p,t:tco(p,EG,true,true)})).filter(x=>x.t).sort((a,b)=>a.t.total-b.t.total)[0];
  if(!cheapest) continue;
  const file=`guides/${pid}-pricing.html`;
  const answer=`As of ${pr.checked}, ${pr.name} has ${vps.length} verified plan(s) in VPSLedger. The lowest true monthly cost at ${EG} TB egress with backups is ${cheapest.p.plan} at ${usd(cheapest.t.total)}/mo (list ${cheapest.p.currency==='EUR'?'€':'$'}${cheapest.p.price_mo.toFixed(2)}${cheapest.p.promo_mo?`; intro $${cheapest.p.promo_mo.toFixed(2)}`:''}). Source: ${pr.source}.`;
  const faq=[
    [`What does ${pr.name} VPS cost?`, answer],
    ['Last verified?', pr.checked],
    ['How are fees counted?', `IPv4 ${pr.fees.ipv4==null?'not published':usd(pr.fees.ipv4)+'/mo'}; backups ${pr.fees.backup_pct!=null?pr.fees.backup_pct+'%':'see plan'}; overage ${pr.fees.overage==null?'not published':'$'+pr.fees.overage+'/GB'}.`],
  ];
  page({file,og:'p-'+pid,title:`${pr.name} VPS pricing (${pr.checked.slice(0,4)}) — true monthly cost | ${NAME}`,desc:answer.slice(0,155),ld:[
    ORG, crumbLd([{label:'Home',href:'/'},{label:'Guides',href:'/guides/'},{label:`${pr.name} pricing`,href:'/'+file}]),
    {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}
  ],body:`
${crumbs([{href:'/',label:'Home'},{href:'/guides/',label:'Guides'},{href:'/'+file,label:`${pr.name} pricing`}])}
<section class="hero"><div class="eyebrow">Provider pricing · checked ${esc(pr.checked)}</div><h1>${esc(pr.name)} VPS pricing</h1>
<p class="lede"><b>Answer:</b> ${esc(answer)}</p></section>
${keyStats([
  ['Cheapest true / mo', `${cheapest.p.plan} — ${usd(cheapest.t.total)}`],
  ['Verified plans', String(vps.length)],
  ['IPv4', pr.fees.ipv4==null?'not published':usd(pr.fees.ipv4)+'/mo'],
  ['Last verified', pr.checked],
  ['Source', pr.source],
])}
<div class="tbl"><table><thead><tr><th>Plan</th><th class="n">vCPU</th><th class="n">RAM</th><th class="n">List</th><th class="n">Intro</th><th class="n">True @${EG}TB</th><th>Status</th></tr></thead><tbody>
${vps.map(p=>{const t=tco(p,EG,true,true);return `<tr><td>${esc(p.plan)}</td><td class="n">${p.vcpu??'—'}</td><td class="n">${p.ram_gb??'—'}</td><td class="n">${p.currency==='EUR'?'€':'$'}${p.price_mo.toFixed(2)}</td><td class="n">${p.promo_mo?'$'+p.promo_mo.toFixed(2):'—'}</td><td class="n">${usd(t?.total)}</td><td>${tag(p.status)}</td></tr>`}).join('')}
</tbody></table></div>
<p><a class="btn" href="/providers/${pid}.html">Full ${esc(pr.name)} page</a> <a class="btn ghost" href="/calculator.html">TCO calculator</a> <a class="btn ghost" href="/guides/${pid}-alternatives.html">${esc(pr.name)} alternatives</a></p>
${o11yNote(`${pr.name} VPS`)}
${mailBox('gp'+pid,`Watch ${pr.name} prices`,'Send the weekly ledger')}
${cite(`${pr.name} VPS pricing as of ${pr.checked}`)}
`});
  hub.push({file,title:`${pr.name} VPS pricing`,blurb:`Cheapest verified: ${cheapest.p.plan} ${usd(cheapest.t.total)}/mo`});
}

// Hub
if(STUDY)hub.unshift({file:STUDY.file,title:STUDY.title,blurb:STUDY.blurb});
page({file:'guides/index.html',og:'compare',title:`VPS pricing guides — cheapest plans, renewals, alternatives | ${NAME}`,desc:`${hub.length} sourced VPS guides: cheapest by RAM, renewal jumps, Hetzner alternatives and provider pricing explainers.`,ld:[
  ORG, crumbLd([{label:'Home',href:'/'},{label:'Guides',href:'/guides/'}]),
  {'@context':'https://schema.org','@type':'CollectionPage',name:'VPS pricing guides',url:SITE+'/guides/'}
],body:`
${crumbs([{href:'/',label:'Home'},{href:'/guides/',label:'Guides'}])}
<section class="hero"><div class="eyebrow">Guides hub · ${asOf}</div><h1>VPS pricing guides</h1>
<p class="lede"><b>Answer:</b> ${esc(`VPSLedger publishes ${hub.length} high-intent guides from ${ver.length} verified plans across ${providers.length} providers (last check ${lastChecked}). Every figure is source-linked; we never invent a price.`)}</p></section>
${keyStats([['Guides',String(hub.length)],['Verified plans',String(ver.length)],['Providers',String(providers.length)],['Last verified',lastChecked]])}
<div class="pairs">${hub.map(h=>`<a href="/${h.file}"><b>${esc(h.title)}</b><br><span class="note">${esc(h.blurb)}</span></a>`).join('')}</div>
${o11yNote('any VPS fleet')}
${mailBox('gh','The cheapest plan for your specs, weekly','Send me the weekly ledger')}
${cite(`VPSLedger guides hub as of ${lastChecked}`)}
`});

// CSV exports
const csvEsc=s=>`"${String(s??'').replace(/"/g,'""')}"`;
const planHeader=['id','provider_id','provider','plan','vcpu','ram_gb','disk_gb','transfer_tb','price_mo','currency','promo_mo','backup_mo','tier','status','source','checked','notes'];
W('api/plans.csv',[planHeader.join(','),...plans.map(p=>planHeader.map(k=>csvEsc(p[k])).join(','))].join('\n'));
W('api/changes.csv',[['date','provider','kind','summary','source','observed','plan_id'].join(','),...changes.map(c=>[c.date,c.provider,c.kind,c.summary,c.source,c.observed,c.plan_id].map(csvEsc).join(','))].join('\n'));

return {org:ORG,hub,guideCount:hub.length+1};
}
