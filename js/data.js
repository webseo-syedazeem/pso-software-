/* ================= ICONS ================= */
const ICONS={
grid:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8v8M10.5 8v8M14 8v8M17 8v8"/>',
receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
package:'<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
store:'<path d="M3 9l1.6-5h14.8L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9h18"/><path d="M9.5 20v-6h5v6"/>',
truck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
tag:'<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/>',
userCheck:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
barChart:'<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
trend:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
trendDown:'<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
printer:'<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
globe:'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
phone:'<rect width="14" height="20" x="5" y="2" rx="2.5"/><path d="M12 18h.01"/>',
sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
db:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
sparkles:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
search:'<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
plus:'<path d="M5 12h14M12 5v14"/>',minus:'<path d="M5 12h14"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',check:'<path d="M20 6 9 17l-5-5"/>',
download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',panel:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
chevR:'<path d="m9 18 6-6-6-6"/>',chevD:'<path d="m6 9 6 6 6-6"/>',arrowUR:'<path d="M7 7h10v10M7 17 17 7"/>',arrowR:'<path d="M5 12h14M12 5l7 7-7 7"/>',
trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
pause:'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
undo:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
percent:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
card:'<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20M6 15h4"/>',
cash:'<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
bank:'<path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10l10-7 10 7z"/>',
clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
refresh:'<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
swap:'<path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
user:'<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
userPlus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
star:'<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
calendar:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
filter:'<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
scale:'<path d="M12 3v18M7 21h10M3 7h18M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
monitor:'<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/>',msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
cpu:'<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
wifi:'<path d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.86a10 10 0 0 1 14 0M8.5 16.43a5 5 0 0 1 7 0"/>',
layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
crown:'<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zM5 20h14"/>',
flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3 0 1.5 1 3 2.5 2.5z"/>',
target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
box:'<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>',
weight:'<circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.9 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.93-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/>',
touch:'<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
play:'<path d="m6 3 14 9-14 9z"/>',pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
coffee:'<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
api:'<path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/>',hard:'<path d="M22 12H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01"/>',
brain:'<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M12 5v13"/>'
};
const ic=(n,s=18,sw=1.8)=>`<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]||''}</svg>`;

/* ================= UTILS ================= */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CUR={PKR:'Rs ',USD:'$',GBP:'£',EUR:'€',AED:'AED '};
const FX={PKR:1,USD:1,GBP:1,EUR:1,AED:1};
const fx=n=>+n||0;
function money(n,dp=2){n=fx(+n||0);const neg=n<0;return (neg?'-':'')+CUR[S.settings.currency]+Math.abs(n).toLocaleString('en-GB',{minimumFractionDigits:dp,maximumFractionDigits:dp})}
function moneyK(n){n=fx(+n||0);const c=CUR[S.settings.currency];if(Math.abs(n)>=1e6)return c+(n/1e6).toFixed(2)+'M';if(Math.abs(n)>=1e4)return c+(n/1e3).toFixed(1)+'K';return c+Math.round(n).toLocaleString('en-GB')}
const num=n=>Math.round(+n||0).toLocaleString('en-GB');
const r2=n=>Math.round(((+n||0)+Number.EPSILON)*100)/100;
const sum=(a,f=x=>x)=>(a||[]).reduce((s,x)=>s+(+f(x)||0),0);
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=mulberry(20261122);const ri=(a,b)=>Math.floor(R()*(b-a+1))+a;const pick=a=>a[Math.floor(R()*a.length)];
const NOW=new Date();const DAY=864e5;
function fmtTime(d){if(!d)return '—';d=new Date(d);const t=d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});const dd=Math.floor((new Date().setHours(0,0,0,0)-new Date(d).setHours(0,0,0,0))/DAY);if(dd<=0)return 'Today, '+t;if(dd===1)return 'Yesterday, '+t;return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+', '+t}
function ago(d){if(!d)return '—';const s=(Date.now()-new Date(d))/1000;if(s<45)return 'just now';if(s<3600)return Math.round(s/60)+'m ago';if(s<86400)return Math.round(s/3600)+'h ago';return Math.round(s/86400)+'d ago'}
const fmtDate=d=>d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
const initials=n=>String(n||'U').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
const AVC=['linear-gradient(135deg,#8b7ffa,#5b4cf0)','linear-gradient(135deg,#14b8a6,#0e9fe0)','linear-gradient(135deg,#f59e0b,#e5479a)','linear-gradient(135deg,#0fb37c,#14b8a6)','linear-gradient(135deg,#e9445a,#f59e0b)','linear-gradient(135deg,#0e9fe0,#5b4cf0)'];
const avc=n=>AVC[[...String(n||'U')].reduce((a,c)=>a+c.charCodeAt(0),0)%AVC.length];
const avatar=(n,s=36)=>`<div class="av" style="width:${s}px;height:${s}px;background:${avc(n)};font-size:${s*.33}px">${initials(n)}</div>`;

/* ================= CATEGORIES & LIVE STATE (ZERO DUMMY DATA) ================= */
const CATS={
  'Fresh Produce':{tone:'#e6f5dc',c:'#0fb37c',px:'FRS'},
  'Dairy & Chilled':{tone:'#e5eefb',c:'#0e9fe0',px:'DCH'},
  'Bakery':{tone:'#f8ead8',c:'#f29a0b',px:'BAK'},
  'Beverages':{tone:'#e0f3f6',c:'#14b8a6',px:'BEV'},
  'Grocery':{tone:'#f1efdb',c:'#8b7ffa',px:'GRC'},
  'Snacks':{tone:'#f3e6df',c:'#e5479a',px:'SNK'},
  'Household':{tone:'#ece9fb',c:'#5b4cf0',px:'HSE'},
  'Personal Care':{tone:'#fbe6ee',c:'#e9445a',px:'PRC'}
};
const catMeta=c=>CATS[c]||{tone:'#ece9fb',c:'#5b4cf0',px:'GEN'};

const S={
 settings:{
   company:'Monarch Retail & Mart',
   address:'Main Commercial Avenue',
   phone:'+92 300 0000000',
   vat:'NTN-4829104-7',
   email:'admin@monarchpos.com',
   currency:'PKR',
   taxRate:5,
   taxInclusive:true,
   invPrefix:'INV-',
   nextInv:1015,
   receiptHeader:'Thank you for shopping with us!',
   receiptFooter:'Items can be exchanged within 7 days with original receipt.',
   showLogo:true,
   showBarcode:true,
   showVat:true,
   pointsPer:1,
   pointValue:1,
   discountAlert:20,
   refundPinLimit:500,
   managerPin:'1234',
   autoBackup:true,
   twoFA:true,
   sessionTimeout:30,
   dailyTarget:50000
 },
 branch:'All branches',
 page:'overview',
 user:null,
 products:[],
 customers:[],
 orders:[],
 suppliers:[],
 pos:[],
 branches:[],
 transfers:[],
 employees:[],
 registers:[],
 zreports:[],
 promotions:[],
 giftcards:[],
 coupons:[],
 audit:[],
 movements:[],
 online:[],
 devices:[],
 backups:[],
 suspicious:[],
 waste:[],
 approvals:[],
 logins:[],
 notifs:[],
 cart:{items:[],customer:null,inv:{type:'pct',value:0,code:'',label:''}},
 held:[],
 posCat:'All',
 roles:['Owner','Manager','Cashier','Stock Clerk'],
 perms:[['sale','Process sales'],['disc10','Discounts up to 10%'],['discMax','Discounts above 10%'],['refund','Process refunds'],['void','Void transactions'],['price','Edit prices'],['stock','Adjust stock'],['po','Create purchase orders'],['reports','View reports'],['users','Manage users'],['settings','System settings']],
 matrix:{Owner:'sale disc10 discMax refund void price stock po reports users settings',Manager:'sale disc10 discMax refund void price stock po reports',Cashier:'sale disc10','Stock Clerk':'stock po'},
 notifPrefs:{sales:true,stock:true,refund:true,large:true,daily:true,expiry:true},
 cloudStatus:'Connecting to MongoDB Atlas…'
};

function seedInitialData(emptyOnly=false){
  S.employees=[
    {id:1,name:'Store Admin',role:'Owner',branch:'All',onShift:true,pin:'1234',password:'admin123',sales:0,txns:0,comm:0,last:new Date(),email:'admin@monarchpos.com',active:true},
    ...(emptyOnly?[]:[
      {id:2,name:'Sarah Khan',role:'Manager',branch:'MAIN',onShift:true,pin:'2222',password:'manager123',sales:0,txns:0,comm:1.5,last:new Date(Date.now()-1800e3),email:'sarah@monarchpos.com',active:true},
      {id:3,name:'Bilal Ahmed',role:'Cashier',branch:'MAIN',onShift:true,pin:'3333',password:'cashier123',sales:0,txns:0,comm:1.0,last:new Date(Date.now()-3600e3),email:'bilal@monarchpos.com',active:true},
      {id:4,name:'Usman Ali',role:'Cashier',branch:'CITY',onShift:false,pin:'4444',password:'cashier123',sales:0,txns:0,comm:1.0,last:new Date(Date.now()-14400e3),email:'usman@monarchpos.com',active:true}
    ])
  ];
  S.branches=emptyOnly?[
    {id:'MAIN',name:'Main Flagship Mart',city:'Head Office',manager:'Store Admin',staff:1,rev:0,target:500000,orders:0,c:'#5b4cf0',share:1,status:'Open',trend:[0,0,0,0,0,0,0,0,0,0,0,0]}
  ]:[
    {id:'MAIN',name:'Main Flagship Mart',city:'Commercial Area',manager:'Store Admin',staff:3,rev:0,target:250000,orders:0,c:'#5b4cf0',share:1,status:'Open',trend:[0,0,0,0,0,0,0,0,0,0,0,0]},
    {id:'CITY',name:'City Center Branch',city:'Central Avenue',manager:'Sarah Khan',staff:2,rev:0,target:180000,orders:0,c:'#14b8a6',share:1,status:'Open',trend:[0,0,0,0,0,0,0,0,0,0,0,0]},
    {id:'EXP',name:'Express Mart Branch',city:'Phase 5',manager:'Store Admin',staff:2,rev:0,target:120000,orders:0,c:'#f29a0b',share:1,status:'Open',trend:[0,0,0,0,0,0,0,0,0,0,0,0]}
  ];
  S.registers=emptyOnly?[
    {id:'REG-01',branch:'MAIN',name:'Main Counter 1',open:true,cashier:'Store Admin',float:0,cash:0,cin:0,cout:0,card:0,digital:0,opened:new Date()}
  ]:[
    {id:'REG-01',branch:'MAIN',name:'Main Counter 1',open:true,cashier:'Store Admin',float:15000,cash:18450,cin:2000,cout:500,card:24600,digital:9800,opened:new Date(Date.now()-5*3600e3)},
    {id:'REG-02',branch:'MAIN',name:'Fast Lane Counter 2',open:true,cashier:'Bilal Ahmed',float:10000,cash:11200,cin:0,cout:0,card:14300,digital:6400,opened:new Date(Date.now()-4*3600e3)},
    {id:'REG-03',branch:'CITY',name:'City Counter 1',open:true,cashier:'Usman Ali',float:12000,cash:9500,cin:0,cout:0,card:12800,digital:4100,opened:new Date(Date.now()-6*3600e3)}
  ];
  S.devices=[
    ['Barcode scanner','scan','USB / Wireless Scanner','USB HID','Connected'],
    ['Receipt printer','printer','Thermal 80mm Printer','USB / LAN','Connected'],
    ['Cash drawer','inbox','RJ11 Cash Drawer','Printer-driven','Connected'],
    ['Customer display','monitor','Customer Pole / Screen','HDMI / USB','Connected'],
    ['Payment terminal','card','Card POS Terminal','Wi-Fi / LAN','Connected'],
    ['Label printer','tag','Barcode Label Printer','USB','Connected'],
    ['Weighing scale','scale','Digital Scale','RS-232 / USB','Connected']
  ].map((d,i)=>({id:i+1,name:d[0],ic:d[1],model:d[2],conn:d[3],status:d[4]}));

  if(emptyOnly){
    S.products=[];S.customers=[];S.orders=[];S.suppliers=[];S.pos=[];S.transfers=[];S.zreports=[];
    S.promotions=[];S.giftcards=[];S.coupons=[];S.audit=[];S.movements=[];S.online=[];S.backups=[];
    S.suspicious=[];S.waste=[];S.approvals=[];S.logins=[];S.notifs=[];S.held=[];
    return;
  }

  S.products=[
    {id:1,sku:'GRC-101',barcode:'8964001100101',name:'Super Kernel Basmati Rice 5kg',cat:'Grocery',cost:1450,price:1850,wholesale:1720,stock:48,min:15,max:120,emoji:'🌾',expiry:240,sold30:34,batch:'B1001',variants:['1kg','5kg','10kg'],extraBarcodes:[]},
    {id:2,sku:'DCH-102',barcode:'8964001100102',name:'Organic Full Cream Milk 1L',cat:'Dairy & Chilled',cost:240,price:310,wholesale:290,stock:85,min:25,max:150,emoji:'🥛',expiry:5,sold30:92,batch:'B1002',variants:['500ml','1L'],extraBarcodes:[]},
    {id:3,sku:'BAK-103',barcode:'8964001100103',name:'Artisan Multigrain Bread',cat:'Bakery',cost:160,price:240,wholesale:215,stock:8,min:15,max:60,emoji:'🍞',expiry:2,sold30:64,batch:'B1003',variants:['Regular','Large'],extraBarcodes:[]},
    {id:4,sku:'FRS-104',barcode:'8964001100104',name:'Imported Red Gala Apples 1kg',cat:'Fresh Produce',cost:320,price:460,wholesale:410,stock:42,min:15,max:90,emoji:'🍎',expiry:9,sold30:51,batch:'B1004',variants:['1kg'],extraBarcodes:[]},
    {id:5,sku:'BEV-105',barcode:'8964001100105',name:'Arabica Roast Ground Coffee 250g',cat:'Beverages',cost:950,price:1350,wholesale:1220,stock:29,min:10,max:80,emoji:'☕',expiry:320,sold30:27,batch:'B1005',variants:['250g','500g'],extraBarcodes:[]},
    {id:6,sku:'SNK-106',barcode:'8964001100106',name:'Belgian Dark Chocolate Bar 100g',cat:'Snacks',cost:340,price:490,wholesale:440,stock:64,min:20,max:120,emoji:'🍫',expiry:180,sold30:78,batch:'B1006',variants:['70% Cocoa','Sea Salt'],extraBarcodes:[]},
    {id:7,sku:'GRC-107',barcode:'8964001100107',name:'Extra Virgin Olive Oil 750ml',cat:'Grocery',cost:1650,price:2250,wholesale:2050,stock:7,min:12,max:60,emoji:'🫒',expiry:365,sold30:22,batch:'B1007',variants:['500ml','750ml'],extraBarcodes:[]},
    {id:8,sku:'DCH-108',barcode:'8964001100108',name:'Cheddar Cheese Block 400g',cat:'Dairy & Chilled',cost:620,price:860,wholesale:790,stock:31,min:10,max:75,emoji:'🧀',expiry:45,sold30:41,batch:'B1008',variants:['200g','400g'],extraBarcodes:[]},
    {id:9,sku:'BEV-109',barcode:'8964001100109',name:'Fresh Squeezed Orange Juice 1L',cat:'Beverages',cost:310,price:450,wholesale:410,stock:52,min:15,max:100,emoji:'🧃',expiry:6,sold30:58,batch:'B1009',variants:['1L'],extraBarcodes:[]},
    {id:10,sku:'HSE-110',barcode:'8964001100110',name:'Ultra Liquid Laundry Detergent 2L',cat:'Household',cost:820,price:1150,wholesale:1040,stock:38,min:12,max:90,emoji:'🧴',expiry:540,sold30:31,batch:'B1010',variants:['1L','2L'],extraBarcodes:[]},
    {id:11,sku:'PRC-111',barcode:'8964001100111',name:'Argan Repair Hair Shampoo 400ml',cat:'Personal Care',cost:580,price:850,wholesale:770,stock:44,min:12,max:90,emoji:'🫧',expiry:480,sold30:29,batch:'B1011',variants:['400ml'],extraBarcodes:[]},
    {id:12,sku:'SNK-112',barcode:'8964001100112',name:'Roasted California Almonds 500g',cat:'Snacks',cost:1150,price:1580,wholesale:1450,stock:6,min:10,max:60,emoji:'🥜',expiry:210,sold30:36,batch:'B1012',variants:['250g','500g'],extraBarcodes:[]},
    {id:13,sku:'FRS-113',barcode:'8964001100113',name:'Fresh Farm Strawberries 500g',cat:'Fresh Produce',cost:260,price:380,wholesale:340,stock:19,min:10,max:60,emoji:'🍓',expiry:3,sold30:47,batch:'B1013',variants:['500g'],extraBarcodes:[]},
    {id:14,sku:'BAK-114',barcode:'8964001100114',name:'Butter Croissants Pack of 4',cat:'Bakery',cost:320,price:480,wholesale:430,stock:24,min:10,max:60,emoji:'🥐',expiry:4,sold30:39,batch:'B1014',variants:['4 Pack'],extraBarcodes:[]},
    {id:15,sku:'GRC-115',barcode:'8964001100115',name:'Wildflower Raw Honey 500g',cat:'Grocery',cost:780,price:1120,wholesale:1010,stock:33,min:10,max:80,emoji:'🍯',expiry:720,sold30:25,batch:'B1015',variants:['500g'],extraBarcodes:[]},
    {id:16,sku:'HSE-116',barcode:'8964001100116',name:'Antibacterial Surface Spray 500ml',cat:'Household',cost:290,price:420,wholesale:380,stock:55,min:15,max:110,emoji:'🧽',expiry:400,sold30:33,batch:'B1016',variants:['500ml'],extraBarcodes:[]}
  ];

  S.customers=[
    {id:1,name:'Zainab Tariq',phone:'+92 300 4128901',email:'zainab.t@example.com',tier:'Platinum',group:'VIP',points:4650,spent:68400,visits:19,credit:0,limit:50000,birthday:'1994-11-28'},
    {id:2,name:'Kamran Siddiqui',phone:'+92 321 9841200',email:'kamran.s@example.com',tier:'Gold',group:'Retail',points:2180,spent:34900,visits:11,credit:2400,limit:25000,birthday:'1989-12-05'},
    {id:3,name:'Ayesha Malik',phone:'+92 333 5512098',email:'ayesha.m@example.com',tier:'Platinum',group:'VIP',points:5120,spent:82500,visits:24,credit:0,limit:50000,birthday:'1996-11-25'},
    {id:4,name:'Hassan Raza',phone:'+92 345 7712304',email:'hassan.r@example.com',tier:'Gold',group:'Trade',points:1840,spent:29600,visits:9,credit:4500,limit:40000,birthday:'1991-04-14'},
    {id:5,name:'Nadia Farooq',phone:'+92 312 6639011',email:'nadia.f@example.com',tier:'Silver',group:'Retail',points:790,spent:12800,visits:5,credit:0,limit:15000,birthday:'1998-08-19'},
    {id:6,name:'Omar Sheikh',phone:'+92 301 8845120',email:'omar.s@example.com',tier:'Silver',group:'Wholesale',points:1120,spent:21400,visits:7,credit:0,limit:60000,birthday:'1987-02-10'}
  ];

  S.suppliers=[
    {id:1,name:'Prime Foods & Grains Distribution',contact:'Tariq Mehmood',cat:'Grocery',balance:42000,lead:2,ontime:97,rating:5,email:'orders@primefoods.pk',orders:8},
    {id:2,name:'Fresh Valley Dairy & Farms',contact:'Salman Qureshi',cat:'Dairy & Chilled',balance:18500,lead:1,ontime:99,rating:5,email:'supply@freshvalley.pk',orders:14},
    {id:3,name:'Continental Beverages & Snacks',contact:'Adnan Javed',cat:'Beverages',balance:0,lead:3,ontime:94,rating:4.8,email:'b2b@continentalbev.pk',orders:6},
    {id:4,name:'Unicare Household & FMCG',contact:'Faisal Karim',cat:'Household',balance:27400,lead:2,ontime:95,rating:4.9,email:'sales@unicarefmcg.pk',orders:5}
  ];

  S.pos=[
    {id:'PO-1001',sup:1,status:'Received',created:new Date(Date.now()-5*DAY),eta:new Date(Date.now()-3*DAY),lines:[{pid:1,qty:40,cost:1450,rec:40},{pid:7,qty:20,cost:1650,rec:20}]},
    {id:'PO-1002',sup:2,status:'Partially received',created:new Date(Date.now()-2*DAY),eta:new Date(Date.now()+1*DAY),lines:[{pid:2,qty:60,cost:240,rec:40},{pid:8,qty:25,cost:620,rec:25}]},
    {id:'PO-1003',sup:3,status:'Ordered',created:new Date(Date.now()-1*DAY),eta:new Date(Date.now()+2*DAY),lines:[{pid:5,qty:30,cost:950,rec:0},{pid:12,qty:25,cost:1150,rec:0}]}
  ];

  S.promotions=[
    {id:1,name:'Bakery Fresh 15% Off',type:'pct_cat',cat:'Bakery',pct:15,active:true,sched:'Daily Evening',uses:18,rev:14200},
    {id:2,name:'Buy 2 Get 1 Belgian Chocolate',type:'bxgy',pid:6,x:2,y:1,active:true,sched:'Always on',uses:14,rev:19600},
    {id:3,name:'VIP Platinum & Gold 5% Off',type:'group',tiers:['Platinum','Gold'],pct:5,active:true,sched:'Members Always',uses:26,rev:54800},
    {id:4,name:'Spend Rs 5,000 Save 10%',type:'tiered',min:5000,pct:10,active:true,sched:'Weekend Special',uses:9,rev:48500}
  ];

  S.giftcards=[
    {code:'GC-8841-2090',to:'Zainab Tariq',initial:10000,bal:6500,active:true,issued:new Date(Date.now()-10*DAY)},
    {code:'GC-5520-9914',to:'Ayesha Malik',initial:5000,bal:5000,active:true,issued:new Date(Date.now()-3*DAY)}
  ];

  S.coupons=[
    {code:'WELCOME10',pct:10,uses:24,max:200,active:true},
    {code:'MART20',pct:20,uses:9,max:50,active:true}
  ];

  S.online=[
    {id:'WEB-1001',cust:'Zainab Tariq',ch:'Web',type:'Click & Collect',items:4,total:4260,stage:0,branch:'MAIN',time:new Date(Date.now()-25*60e3)},
    {id:'APP-1002',cust:'Kamran Siddiqui',ch:'App',type:'Delivery',items:3,total:3190,stage:1,branch:'MAIN',time:new Date(Date.now()-55*60e3)},
    {id:'WEB-1003',cust:'Ayesha Malik',ch:'Web',type:'Click & Collect',items:5,total:5840,stage:2,branch:'CITY',time:new Date(Date.now()-110*60e3)},
    {id:'MKT-1004',cust:'Hassan Raza',ch:'Marketplace',type:'Delivery',items:2,total:2700,stage:3,branch:'MAIN',time:new Date(Date.now()-240*60e3)}
  ];

  const mkOrder=(idx,daysAgo,hr,br,cashier,custObj,itemPairs,payMethod)=>{
    const d=new Date(Date.now()-daysAgo*DAY);
    d.setHours(hr,15+(idx*7)%40,0,0);
    const items=itemPairs.map(([pid,qty])=>{
      const p=S.products.find(x=>x.id===pid)||S.products[0];
      return{id:p.id,name:p.name,emoji:p.emoji,qty,price:p.price,disc:0};
    });
    const sub=r2(sum(items,i=>i.qty*i.price));
    const tax=r2(sub-sub/1.05);
    return{
      id:'ORD-'+(1001+idx),
      inv:'INV-'+(1001+idx),
      time:d,
      customer:custObj?custObj.name:'Walk-in customer',
      cid:custObj?custObj.id:null,
      items,
      sub,
      itemDisc:0,
      promo:0,
      lines:[],
      invDisc:0,
      invLabel:'',
      tax,
      total:sub,
      pays:[{method:payMethod,amount:sub}],
      change:0,
      status:'Completed',
      cashier,
      branch:br,
      reg:br==='CITY'?'REG-03':'REG-01',
      refunded:0,
      channel:'In-store',
      earned:custObj?Math.floor(sub):0,
      session:daysAgo===0
    };
  };

  S.orders=[
    mkOrder(13,0,14,'MAIN','Store Admin',S.customers[0],[[1,2],[5,1],[6,2]],'Card'),
    mkOrder(12,0,12,'MAIN','Bilal Ahmed',S.customers[2],[[2,4],[4,2],[8,1],[9,2]],'Cash'),
    mkOrder(11,0,11,'CITY','Usman Ali',S.customers[1],[[7,1],[12,1],[15,1]],'Digital wallet'),
    mkOrder(10,0,10,'MAIN','Store Admin',null,[[3,2],[13,2],[14,1]],'Cash'),
    mkOrder(9,1,18,'MAIN','Bilal Ahmed',S.customers[3],[[1,1],[10,2],[11,1]],'Card'),
    mkOrder(8,1,15,'CITY','Usman Ali',S.customers[4],[[5,2],[6,3]],'Cash'),
    mkOrder(7,2,17,'MAIN','Store Admin',S.customers[0],[[7,2],[8,2],[12,1]],'Card'),
    mkOrder(6,2,13,'EXP','Store Admin',S.customers[5],[[1,3],[2,6]],'Bank transfer'),
    mkOrder(5,3,16,'MAIN','Bilal Ahmed',S.customers[2],[[10,2],[15,2],[16,3]],'Card'),
    mkOrder(4,4,19,'CITY','Usman Ali',S.customers[1],[[4,3],[9,4],[14,2]],'Cash'),
    mkOrder(3,5,15,'MAIN','Store Admin',S.customers[3],[[1,2],[5,2],[7,1]],'Card'),
    mkOrder(2,6,14,'EXP','Store Admin',S.customers[4],[[2,5],[6,4],[8,2]],'Digital wallet'),
    mkOrder(1,6,11,'MAIN','Bilal Ahmed',null,[[11,2],[13,3]],'Cash'),
    mkOrder(0,7,17,'MAIN','Store Admin',S.customers[0],[[1,2],[12,2]],'Card')
  ];

  S.movements=[
    {time:new Date(Date.now()-3600e3),pid:1,type:'Sale',qty:-2,reason:'INV-1014',user:'Store Admin'},
    {time:new Date(Date.now()-7200e3),pid:2,type:'Sale',qty:-4,reason:'INV-1013',user:'Bilal Ahmed'},
    {time:new Date(Date.now()-2*DAY),pid:2,type:'Received',qty:40,reason:'PO-1002',user:'Sarah Khan'},
    {time:new Date(Date.now()-5*DAY),pid:1,type:'Received',qty:40,reason:'PO-1001',user:'Store Admin'}
  ];

  S.audit=[
    {type:'sale',who:'Store Admin',what:'Sale completed · INV-1014',ref:'Rs 6,030.00',time:new Date(Date.now()-35*60e3)},
    {type:'sale',who:'Bilal Ahmed',what:'Sale completed · INV-1013',ref:'Rs 3,920.00',time:new Date(Date.now()-95*60e3)},
    {type:'stock',who:'Sarah Khan',what:'Goods received · PO-1002 (65 units)',ref:'Fresh Valley Dairy & Farms',time:new Date(Date.now()-4*3600e3)},
    {type:'login',who:'Store Admin',what:'Signed in via POS Terminal',ref:'Owner',time:new Date(Date.now()-5*3600e3)}
  ];

  S.logins=[
    {who:'Store Admin',role:'Owner',ip:'Live Session',dev:'POS Terminal',time:new Date(Date.now()-5*3600e3),ok:true},
    {who:'Sarah Khan',role:'Manager',ip:'Branch Terminal',dev:'Back Office',time:new Date(Date.now()-4*3600e3),ok:true},
    {who:'Bilal Ahmed',role:'Cashier',ip:'REG-02',dev:'POS PIN Pad',time:new Date(Date.now()-4*3600e3),ok:true}
  ];

  S.notifs=[
    {ic:'alert',c:'var(--warning)',t:'Low stock: Extra Virgin Olive Oil 750ml',s:'7 units remaining (minimum 12)',go:'inventory',time:new Date(Date.now()-45*60e3),unread:true},
    {ic:'clock',c:'var(--danger)',t:'Near expiry: Artisan Multigrain Bread',s:'Batch B1003 expires in 2 days',go:'expiry',time:new Date(Date.now()-120*60e3),unread:true},
    {ic:'globe',c:'var(--info)',t:'New Click & Collect Order WEB-1001',s:'Zainab Tariq · 4 items',go:'omnichannel',time:new Date(Date.now()-25*60e3),unread:true}
  ];

  S.transfers=[
    {id:'TR-0101',from:'MAIN',to:'CITY',pid:1,qty:10,status:'In transit',date:new Date(Date.now()-4*3600e3)},
    {id:'TR-0100',from:'MAIN',to:'EXP',pid:5,qty:8,status:'Completed',date:new Date(Date.now()-2*DAY)}
  ];
  S.zreports=[];
  S.backups=[
    {id:'BK-1001',time:new Date(Date.now()-6*3600e3),type:'Automated',size:'48 records',status:'Success',dur:'1s'}
  ];
  S.suspicious=[];
  S.waste=[];
  S.approvals=[];
  S.held=[];
}

const P=id=>S.products.find(p=>p.id===+id)||{id:0,name:'Deleted item',cat:'Grocery',price:0,cost:0,wholesale:0,stock:0,min:0,max:100,emoji:'📦',expiry:0,sold30:0,sku:'—',barcode:'—',batch:'—',variants:[],extraBarcodes:[]};
const C=id=>S.customers.find(c=>c.id===+id);
const isAdmin=()=>!S.user||S.user.role==='Owner';

function syncLiveStats(){
  const validOrders=S.orders.filter(o=>o.status!=='Refunded');
  S.branches.forEach(b=>{
    const bo=validOrders.filter(o=>o.branch===b.id||S.branches.length===1);
    b.rev=r2(sum(bo,o=>o.total-(o.refunded||0)));
    b.orders=bo.length;
    b.staff=S.employees.filter(e=>e.branch===b.id||e.branch==='All').length;
    b.trend=Array.from({length:12},(_,i)=>{
      const d0=new Date();d0.setHours(0,0,0,0);d0.setDate(d0.getDate()-(11-i));
      const d1=new Date(d0.getTime()+DAY);
      return r2(sum(bo.filter(o=>{const t=new Date(o.time);return t>=d0&&t<d1}),o=>o.total-(o.refunded||0)));
    });
  });
  const today0=new Date();today0.setHours(0,0,0,0);
  S.employees.forEach(e=>{
    const eo=validOrders.filter(o=>o.cashier===e.name&&new Date(o.time)>=today0);
    e.sales=r2(sum(eo,o=>o.total-(o.refunded||0)));
    e.txns=eo.length;
  });
}

/* ================= PERSISTENCE (LocalStorage + MongoDB Atlas API) ================= */
const PERSIST_KEYS=['settings','products','customers','orders','suppliers','pos','branches','transfers','employees','registers','zreports','promotions','giftcards','coupons','audit','movements','online','devices','backups','suspicious','waste','approvals','logins','notifs','held','roles','matrix','notifPrefs'];
function reviveDates(obj){
  if(!obj||typeof obj!=='object')return obj;
  for(const k of Object.keys(obj)){
    const v=obj[k];
    if(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v))obj[k]=new Date(v);
    else if(typeof v==='object')reviveDates(v);
  }
  return obj;
}
function scrubPersonalName(str){
  if(typeof str!=='string')return str;
  return str.replace(/faizan\s*rizwan/gi,'Store Admin').replace(/faizan/gi,'Store Admin');
}
function ensureAdminAccount(){
  // If database has 0 products (from previous blank state), auto-populate testing store data
  if(!Array.isArray(S.products)||S.products.length===0){
    seedInitialData(false);
  }
  if(!Array.isArray(S.employees))S.employees=[];
  // Scrub any personal name occurrences across all collections
  if(S.settings&&S.settings.email&&S.settings.email.toLowerCase().includes('faizan'))S.settings.email='admin@monarchpos.com';
  S.employees.forEach(e=>{
    if(e.name&&/faizan/i.test(e.name))e.name='Store Admin';
    if(e.email&&/faizan/i.test(e.email))e.email='admin@monarchpos.com';
    delete e.altEmail;
  });
  if(S.user){
    if(S.user.name&&/faizan/i.test(S.user.name))S.user.name='Store Admin';
    if(S.user.email&&/faizan/i.test(S.user.email))S.user.email='admin@monarchpos.com';
    try{localStorage.setItem('monarch_live_user_v2',JSON.stringify(S.user))}catch(e){}
  }
  (S.branches||[]).forEach(b=>{if(b.manager&&/faizan/i.test(b.manager))b.manager='Store Admin'});
  (S.registers||[]).forEach(r=>{if(r.cashier&&/faizan/i.test(r.cashier))r.cashier='Store Admin'});
  (S.orders||[]).forEach(o=>{if(o.cashier&&/faizan/i.test(o.cashier))o.cashier='Store Admin'});
  (S.audit||[]).forEach(a=>{if(a.who&&/faizan/i.test(a.who))a.who='Store Admin';if(a.what)a.what=scrubPersonalName(a.what)});
  (S.movements||[]).forEach(m=>{if(m.user&&/faizan/i.test(m.user))m.user='Store Admin'});
  (S.logins||[]).forEach(l=>{if(l.who&&/faizan/i.test(l.who))l.who='Store Admin'});
  (S.waste||[]).forEach(w=>{if(w.user&&/faizan/i.test(w.user))w.user='Store Admin'});

  let adm=S.employees.find(e=>e.role==='Owner'||(e.email&&e.email.toLowerCase()==='admin@monarchpos.com'));
  if(!adm){
    adm={
      id:1,
      name:'Store Admin',
      role:'Owner',
      branch:'All',
      onShift:true,
      pin:S.settings?.managerPin||'1234',
      password:'admin123',
      sales:0,
      txns:0,
      comm:0,
      last:new Date(),
      email:'admin@monarchpos.com',
      active:true
    };
    S.employees.unshift(adm);
  }else{
    adm.name=scrubPersonalName(adm.name)||'Store Admin';
    adm.role='Owner';
    if(!adm.pin)adm.pin='1234';
    if(!adm.password)adm.password='admin123';
  }
  if(!S.branches||!S.branches.length){
    S.branches=[{id:'MAIN',name:'Main Flagship Mart',city:'Head Office',manager:'Store Admin',staff:1,rev:0,target:250000,orders:0,c:'#5b4cf0',share:1,status:'Open',trend:[0,0,0,0,0,0,0,0,0,0,0,0]}];
  }
  if(!S.registers||!S.registers.length){
    S.registers=[{id:'REG-01',branch:S.branches[0].id,name:'Main Counter 1',open:true,cashier:'Store Admin',float:15000,cash:0,cin:0,cout:0,card:0,digital:0,opened:new Date()}];
  }
}
function saveState(){
  try{
    syncLiveStats();
    const snap={};
    PERSIST_KEYS.forEach(k=>snap[k]=S[k]);
    localStorage.setItem('monarch_live_state_v2',JSON.stringify(snap));
    fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(snap)}).then(r=>r.ok?r.json():null).then(d=>{
      if(d&&d.ok){
        window._cloudConnected=true;
        S.cloudStatus=d.mongo?'MongoDB Atlas · Live Synced':'Local Server · Synced';
        const pill=$('#sync-pill');if(pill)pill.textContent=S.cloudStatus;
      }
    }).catch(()=>{});
  }catch(e){}
}
function loadState(){
  try{localStorage.removeItem('monarch_pos_state_v1');localStorage.removeItem('monarch_pos_user_v1')}catch(e){}
  seedInitialData(false);
  try{
    const raw=localStorage.getItem('monarch_live_state_v2');
    if(raw){
      const snap=reviveDates(JSON.parse(raw));
      PERSIST_KEYS.forEach(k=>{if(snap[k]!==undefined)S[k]=snap[k]});
    }
    const u=localStorage.getItem('monarch_live_user_v2');
    if(u)S.user=JSON.parse(u);
  }catch(e){}
  ensureAdminAccount();
  // Auto-sign in Store Admin for smooth client testing if no user session yet
  if(!S.user&&S.employees[0]){
    const emp=S.employees[0];
    S.user={id:emp.id,name:emp.name,role:emp.role,branch:emp.branch,email:emp.email,pin:emp.pin};
  }
  syncLiveStats();

  fetch('/api/state').then(r=>r.ok?r.json():null).then(d=>{
    if(d&&d.ok){
      window._cloudConnected=true;
      S.cloudStatus=d.mongo?'MongoDB Atlas · Connected':'Server API · Connected';
      const pill=$('#sync-pill');if(pill)pill.textContent=S.cloudStatus;
      if(d.state&&Array.isArray(d.state.products)&&d.state.products.length>0){
        const snap=reviveDates(d.state);
        PERSIST_KEYS.forEach(k=>{if(snap[k]!==undefined)S[k]=snap[k]});
        ensureAdminAccount();
        syncLiveStats();
        if(window.updateUserChip)updateUserChip();
        if(window.updateBranchSelect)updateBranchSelect();
        if(window.updateBell)updateBell();
        if(window.refresh)refresh();
      }else{
        saveState();
        if(window.updateUserChip)updateUserChip();
        if(window.updateBranchSelect)updateBranchSelect();
        if(window.updateBell)updateBell();
        if(window.refresh)refresh();
      }
    }
  }).catch(()=>{
    S.cloudStatus='Offline Mode · Local Persisted';
    const pill=$('#sync-pill');if(pill)pill.textContent=S.cloudStatus;
  });
}
function resetDemoState(emptyOnly=false){
  localStorage.removeItem('monarch_live_state_v2');
  seedInitialData(emptyOnly);
  syncLiveStats();
  saveState();
  if(window.updateUserChip)updateUserChip();
  if(window.updateBranchSelect)updateBranchSelect();
  if(window.updateBell)updateBell();
  if(window.toast)toast(emptyOnly?'All data wiped — clean empty workspace ready':'Sample store testing data loaded & synced','info');
  if(window.refresh)refresh();
}
loadState();
