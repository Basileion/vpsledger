// Shared switch-target logic (RT-20261030-52): used by the home "Are you overpaying?" check, the calculator
// and the build guard in scripts/build.mjs. Sold-out plans (availability === 'unavailable') are never suggested.
export const buyable=p=>!!p&&p.availability!=='unavailable';
export const soldOut=p=>!!p&&p.availability==='unavailable';
// TCO: base + IPv4 + backups + overage at egress TB. Mirrors scripts/build.mjs.
export function tco(p,prov,fx,egress,backups){if(p.price_mo==null)return null;const k=p.currency==='EUR'?fx:1,f=prov.fees;const base=p.price_mo*k;
 const ip=f.ipv4??0,bk=backups?(p.backup_mo!=null?p.backup_mo:f.backup_pct!=null?base*f.backup_pct/100:0):0;
 let ov=0;if(p.transfer_tb!=null&&egress>p.transfer_tb){if(f.overage==null)return null;ov=(egress-p.transfer_tb)*1000*f.overage*(f.cur==='EUR'?fx:1)}
 return {base,ip,bk,ov,total:base+ip+bk+ov}}
const provMap=d=>Object.fromEntries(d.providers.map(p=>[p.id,p]));
// Home widget: up to n cheaper, verified, orderable plans with at least the current plan's vCPU and RAM.
export function switchTargets(d,cur,eg,bk,n=3){const P=provMap(d),ct=cur&&tco(cur,P[cur.provider_id],d.fx_eur_usd,eg,bk);if(!ct)return {ct:null,alt:[]};
 const alt=d.plans.filter(p=>p.status==='verified'&&buyable(p)&&p.id!==cur.id&&p.vcpu>=cur.vcpu&&p.ram_gb>=cur.ram_gb).map(p=>({p,t:tco(p,P[p.provider_id],d.fx_eur_usd,eg,bk)})).filter(x=>x.t&&x.t.total<ct.total).sort((a,b)=>a.t.total-b.t.total).slice(0,n);
 return {ct,alt}}
// Calculator ranking: orderable plans meeting minimum specs, cheapest first. Sold-out plans are returned separately (shown, never ranked).
export function calcRank(d,q,eg,bk,vo){const P=provMap(d);const meets=p=>(!vo||p.status==='verified')&&p.vcpu>=q.cpu&&p.ram_gb>=q.ram&&(p.disk_gb??0)>=q.disk;
 const price=ps=>ps.map(p=>({p,t:tco(p,P[p.provider_id],d.fx_eur_usd,eg,bk)})).filter(x=>x.t).sort((a,b)=>a.t.total-b.t.total);
 return {rows:price(d.plans.filter(p=>meets(p)&&buyable(p))),sold:price(d.plans.filter(p=>meets(p)&&soldOut(p)))}}
