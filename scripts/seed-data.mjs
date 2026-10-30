// One-off seed of data/*.json from official pages read 2026-10-26. Edit JSON directly afterwards.
import fs from 'node:fs';const C='2026-10-26';
const P=[
['digitalocean','DigitalOcean','https://www.digitalocean.com/pricing/droplets',{ipv4:0,ipv4_s:'verified',ipv4_n:'Public IPv4 included with each Droplet',backup_pct:20,backup_s:'verified',backup_n:'Weekly backups 20% of Droplet price (daily 30%)',overage:0.01,overage_s:'unverified',overage_n:'$0.01/GiB beyond pooled allowance (bandwidth docs; confirm)'}],
['vultr','Vultr','https://api.vultr.com/v2/plans?type=vc2',{ipv4:0,ipv4_s:'unverified',ipv4_n:'IPv4 included on standard plans (IPv6-only plan cheaper)',backup_pct:20,backup_s:'unverified',backup_n:'Automatic backups ~20% of plan (confirm on vultr.com/pricing)',overage:0.01,overage_s:'unverified',overage_n:'$0.01/GB overage (confirm)'}],
['linode','Linode / Akamai','https://api.linode.com/v4/linode/types',{ipv4:0,ipv4_s:'unverified',ipv4_n:'One IPv4 included',backup_pct:null,backup_s:'verified',backup_n:'Backups priced per plan via official API',overage:0.005,overage_s:'unverified',overage_n:'$0.005/GB overage (confirm)'}],
['hetzner','Hetzner','https://www.hetzner.com/cloud/cost-optimized',{ipv4:null,ipv4_s:'unverified',ipv4_n:'Primary IPv4 billed separately; amount not read on check date',backup_pct:20,backup_s:'unverified',backup_n:'Backups 20% of server price (confirm)',overage:0.001,cur:'EUR',overage_s:'verified',overage_n:'€1.00 per additional TB beyond 20 TB (EU)'}],
['ovhcloud','OVHcloud','https://www.ovhcloud.com/en/vps/',{ipv4:0,ipv4_s:'verified',ipv4_n:'IPv4 included; extra IPv4 is an add-on',backup_pct:0,backup_s:'verified',backup_n:'Daily backup of previous 24h included',overage:0,overage_s:'verified',overage_n:'Unlimited traffic (bandwidth-capped port)'}],
['scaleway','Scaleway','https://www.scaleway.com/en/pricing/virtual-instances/',{ipv4:null,ipv4_s:'unverified',ipv4_n:'Flexible IPv4 billed separately; not read',backup_pct:null,backup_s:'unverified',backup_n:'Snapshots billed per GB',overage:0,overage_s:'unverified',overage_n:'Egress included (confirm)'}],
['upcloud','UpCloud','https://upcloud.com/pricing/',{ipv4:0,ipv4_s:'verified',ipv4_n:'1 IPv4 included',backup_pct:null,backup_s:'unverified',backup_n:'Simple Backups add-on',overage:0,overage_s:'verified',overage_n:'Zero-cost egress, Fair Transfer Policy'}],
['contabo','Contabo','https://contabo.com/en/vps/',{ipv4:0,ipv4_s:'unverified',ipv4_n:'IPv4 included',backup_pct:null,backup_s:'unverified',backup_n:'Snapshots included (1–3); auto backup add-on',overage:0,overage_s:'unverified',overage_n:'Unlimited traffic at port speed'}],
['hostinger','Hostinger VPS','https://www.hostinger.com/vps-hosting',{ipv4:0,ipv4_s:'unverified',ipv4_n:'Dedicated IPv4 included',backup_pct:0,backup_s:'verified',backup_n:'Free weekly backups',overage:0,overage_s:'unverified',overage_n:'Bandwidth allowance per plan; overage policy not published'}],
['lightsail','AWS Lightsail','https://aws.amazon.com/lightsail/pricing/',{ipv4:0,ipv4_s:'verified',ipv4_n:'Bundles include a public IPv4 address',backup_pct:null,backup_s:'unverified',backup_n:'Snapshots $0.05/GB-mo (confirm)',overage:0.09,overage_s:'verified',overage_n:'Overage varies by region, from $0.09/GB'}],
['gcp','Google Cloud e2','https://cloud.google.com/products/compute/pricing/general-purpose',{ipv4:null,ipv4_s:'unverified',ipv4_n:'External IPv4 billed separately',backup_pct:null,backup_s:'unverified',backup_n:'Snapshots billed per GB',overage:null,overage_s:'unverified',overage_n:'Internet egress tiered; not read'}],
['azure','Azure B-series','https://prices.azure.com/api/retail/prices',{ipv4:null,ipv4_s:'unverified',ipv4_n:'Public IP billed separately',backup_pct:null,backup_s:'unverified',backup_n:'Azure Backup billed separately',overage:null,overage_s:'unverified',overage_n:'Internet egress tiered; not read'}],
['kamatera','Kamatera','https://www.kamatera.com/pricing/',{ipv4:0,ipv4_s:'unverified',ipv4_n:'Public IP included',backup_pct:null,backup_s:'unverified',backup_n:'Extended daily backup add-on',overage:0.01,overage_s:'verified',overage_n:'Additional traffic $0.01/GB'}],
['ionos','IONOS','https://www.ionos.com/servers/vps',{ipv4:0,ipv4_s:'verified',ipv4_n:'One IPv4 included; extra $5/month per IPv4',backup_pct:null,backup_s:'unverified',backup_n:'Backup add-on',overage:0,overage_s:'unverified',overage_n:'Unlimited traffic (confirm)'}],
['dreamhost','DreamHost','https://www.dreamhost.com/hosting/vps/',{ipv4:0,ipv4_s:'unverified',ipv4_n:'IPv4 included',backup_pct:null,backup_s:'unverified',backup_n:'Backups not priced on page',overage:0,overage_s:'verified',overage_n:'Unmetered bandwidth, no overage'}],
].map(([id,name,source,fees])=>({id,name,source,checked:C,fees}));
// [provider,plan,vcpu,ram GB,disk GB,transfer TB (null=unmetered/unknown),price/mo,currency,status,tier,notes,renewal]
const R=[
['digitalocean','Basic 1 GB',1,1,25,1,6,'USD','verified','entry','Regular SSD Basic Droplet'],
['digitalocean','Basic 512 MiB',1,0.5,10,0.5,4,'USD','verified','entry',''],
['digitalocean','Basic 4 GB',2,4,80,4,24,'USD','verified','mid',''],
['vultr','vc2-1c-1gb',1,1,25,1,5,'USD','verified','entry','Cloud Compute regular; official public API'],
['vultr','vc2-1c-0.5gb',1,0.5,10,0.5,3.5,'USD','verified','entry',''],
['vultr','vc2-2c-4gb',2,4,80,3,20,'USD','verified','mid',''],
['linode','Nanode 1 GB',1,1,25,1,5,'USD','verified','entry','Backups $2/mo (API)',null,2],
['linode','Linode 2 GB',1,2,50,2,12,'USD','verified','entry','Backups $2.50/mo',null,2.5],
['linode','Linode 4 GB',2,4,80,4,24,'USD','verified','mid','Backups $5/mo',null,5],
['hetzner','CX23',2,4,40,20,5.99,'EUR','verified','entry','Excl. VAT; CURRENTLY UNAVAILABLE on Hetzner cost-optimized page (checked 2026-10-30)'],
['hetzner','CX33',4,8,80,20,8.99,'EUR','verified','mid','Excl. VAT; CURRENTLY UNAVAILABLE on Hetzner cost-optimized page (checked 2026-10-30)'],
['ovhcloud','VPS-1',2,4,40,null,5.35,'USD','verified','entry','No-commitment monthly (US catalog API); 12-mo prepay $4.54/mo. Unlimited traffic, 500 Mbps',4.54],
['ovhcloud','VPS-2',4,8,75,null,10.00,'USD','verified','mid','No-commitment monthly (US catalog API); 12-mo prepay $8.50/mo. 1 Gbps',8.50],
['ovhcloud','VPS-3',6,12,100,null,14.50,'USD','verified','mid','No-commitment monthly (US catalog API); 12-mo prepay $12.32/mo. 2 Gbps',12.32],
['scaleway','DEV1-S',2,2,20,null,6.55,'EUR','unverified','entry','~€/month from hourly €0.00898; specs not legible on page'],
['scaleway','DEV1-M',3,4,40,null,14.74,'EUR','unverified','mid','~€/month from hourly €0.0202; specs not legible on page'],
['upcloud','Developer 1 GB',1,1,10,null,3.5,'USD','verified','entry','Starter plan, max 5 deployments'],
['upcloud','Premium entry',null,null,25,null,6,'USD','unverified','entry','RAM/CPU columns not legible on check date'],
['contabo','Cloud VPS 4',4,8,null,null,5.50,'EUR','unverified','entry','VAT display and spec columns ambiguous on check date'],
['hostinger','KVM 1',1,4,50,4,11.99,'USD','verified','entry','Promo $6.49/mo on 24-month prepay; renews $11.99',6.49],
['hostinger','KVM 2',2,8,100,8,14.99,'USD','verified','mid','Promo $8.79/mo on 24-month prepay; renews $14.99',8.79],
['lightsail','Linux 0.5 GB',2,0.5,20,1,5,'USD','verified','entry','IPv4 bundle'],
['lightsail','Linux 4 GB',2,4,80,4,24,'USD','unverified','mid','Transfer allowance not legible for this bundle'],
['gcp','e2-small',2,2,null,null,null,'USD','unverified','entry','Price table client-rendered; not read'],
['gcp','e2-medium',2,4,null,null,null,'USD','unverified','mid','Price table client-rendered; not read'],
['azure','B1s (Linux, East US)',1,1,null,null,7.59,'USD','verified','entry','$0.0104/h × 730 h, Retail Prices API; disk and IP extra'],
['azure','B2s (Linux, East US)',2,4,null,null,30.37,'USD','verified','mid','$0.0416/h × 730 h; disk and IP extra'],
['kamatera','Basic',1,1,20,5,4,'USD','verified','entry','Type A'],
['kamatera','Standard',2,2,null,null,25,'USD','unverified','mid','Storage/traffic not legible'],
['ionos','VPS S+',1,2,60,null,null,'USD','unverified','entry','Term/promo display ambiguous; regular price not read'],
['ionos','VPS M+',2,4,120,null,5,'USD','unverified','mid','$5/month shown with 1-year term; confirm'],
['dreamhost','Stack 4',2,4,75,null,15.99,'USD','verified','entry','Promo $8.99 first 3 months; renews $15.99',8.99],
['dreamhost','Stack 16',4,16,250,null,34.99,'USD','verified','mid','Promo $22.99 first 3 months; renews $34.99',22.99],
];
const pid=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
const prov=Object.fromEntries(P.map(p=>[p.id,p]));
const plans=R.map(([p,plan,vcpu,ram,disk,tb,price,cur,status,tier,notes,promo,backup])=>({id:pid(p+'-'+plan),provider_id:p,provider:prov[p].name,plan,vcpu,ram_gb:ram,disk_gb:disk,transfer_tb:tb,price_mo:price,currency:cur,promo_mo:promo??null,backup_mo:backup??null,tier,status,source:prov[p].source,checked:C,notes}));
const changes=[
{date:'2026-01-01',observed:C,provider:'DigitalOcean',kind:'billing',summary:'Droplets move to per-second billing (minimum 60 s or $0.01).',source:'https://www.digitalocean.com/pricing/droplets'},
{date:C,observed:C,provider:'Hetzner',kind:'availability',summary:'CX23 (€5.99/mo) shown as “not available” / currently unavailable in listed locations.',source:'https://www.hetzner.com/cloud/cost-optimized'},
{date:C,observed:C,provider:'Hostinger VPS',kind:'promo',summary:'KVM 1 promo $6.49/mo on 24-month term; renews at $11.99/mo.',source:'https://www.hostinger.com/vps-hosting'},
{date:C,observed:C,provider:'DreamHost',kind:'promo',summary:'Stack 4 $8.99/mo for first 3 months, then $15.99/mo.',source:'https://www.dreamhost.com/hosting/vps/'},
{date:C,observed:C,provider:'OVHcloud',kind:'lineup',summary:'“VPS 2027” range listed; marketing From=$4.54 is 12-mo prepay; no-commitment monthly $5.35 (VPS-1).',source:'https://www.ovhcloud.com/en/vps/'},
{date:C,observed:C,provider:'Linode / Akamai',kind:'transfer',summary:'G8 and GPU plans do not include bundled transfer; older plans include 0–20 TB.',source:'https://www.linode.com/pricing/'}];
fs.mkdirSync('data',{recursive:true});for(const [f,v] of [['providers',P],['plans',plans],['changes',changes]])fs.writeFileSync(`data/${f}.json`,JSON.stringify(v,null,1));
console.log(P.length,'providers',plans.length,'plans',plans.filter(p=>p.status==='verified').length,'verified');
