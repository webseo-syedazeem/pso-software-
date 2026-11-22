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
const CUR={GBP:'£',USD:'$',EUR:'€',PKR:'Rs ',AED:'AED '};
const FX={GBP:1,USD:1.27,EUR:1.17,PKR:354,AED:4.66};
const fx=n=>n*(FX[S.settings.currency]||1);
function money(n,dp=2){n=fx(+n||0);const neg=n<0;return (neg?'-':'')+CUR[S.settings.currency]+Math.abs(n).toLocaleString('en-GB',{minimumFractionDigits:dp,maximumFractionDigits:dp})}
function moneyK(n){n=fx(+n||0);const c=CUR[S.settings.currency];if(Math.abs(n)>=1e6)return c+(n/1e6).toFixed(2)+'M';if(Math.abs(n)>=1e4)return c+(n/1e3).toFixed(1)+'K';return c+Math.round(n).toLocaleString('en-GB')}
const num=n=>Math.round(+n).toLocaleString('en-GB');
const r2=n=>Math.round((n+Number.EPSILON)*100)/100;
const sum=(a,f=x=>x)=>a.reduce((s,x)=>s+f(x),0);
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=mulberry(20261122);const ri=(a,b)=>Math.floor(R()*(b-a+1))+a;const pick=a=>a[Math.floor(R()*a.length)];
const NOW=new Date();const DAY=864e5;
function fmtTime(d){d=new Date(d);const t=d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});const dd=Math.floor((new Date(NOW).setHours(0,0,0,0)-new Date(d).setHours(0,0,0,0))/DAY);if(dd<=0)return 'Today, '+t;if(dd===1)return 'Yesterday, '+t;return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+', '+t}
function ago(d){const s=(Date.now()-new Date(d))/1000;if(s<45)return 'just now';if(s<3600)return Math.round(s/60)+'m ago';if(s<86400)return Math.round(s/3600)+'h ago';return Math.round(s/86400)+'d ago'}
const fmtDate=d=>new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const initials=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
const AVC=['linear-gradient(135deg,#8b7ffa,#5b4cf0)','linear-gradient(135deg,#14b8a6,#0e9fe0)','linear-gradient(135deg,#f59e0b,#e5479a)','linear-gradient(135deg,#0fb37c,#14b8a6)','linear-gradient(135deg,#e9445a,#f59e0b)','linear-gradient(135deg,#0e9fe0,#5b4cf0)'];
const avc=n=>AVC[[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%AVC.length];
const avatar=(n,s=36)=>`<div class="av" style="width:${s}px;height:${s}px;background:${avc(n)};font-size:${s*.33}px">${initials(n)}</div>`;

/* ================= DATA ================= */
const CATS={'Fresh Produce':{tone:'#e6f5dc',c:'#0fb37c',px:'FRS'},'Dairy & Chilled':{tone:'#e5eefb',c:'#0e9fe0',px:'DCH'},'Bakery':{tone:'#f8ead8',c:'#f29a0b',px:'BAK'},'Beverages':{tone:'#e0f3f6',c:'#14b8a6',px:'BEV'},'Grocery':{tone:'#f1efdb',c:'#8b7ffa',px:'GRC'},'Snacks':{tone:'#f3e6df',c:'#e5479a',px:'SNK'},'Household':{tone:'#ece9fb',c:'#5b4cf0',px:'HSE'},'Personal Care':{tone:'#fbe6ee',c:'#e9445a',px:'PRC'}};
const RAW=[
['Organic Almond Milk 1L','Dairy & Chilled',2.85,1.55,128,30,200,'🥛',12,186],['Hass Avocados (2 pack)','Fresh Produce',2.50,1.20,94,40,180,'🥑',5,240],['Artisan Sourdough Loaf','Bakery',3.90,1.60,23,25,80,'🍞',2,198],['Blueberries 250g','Fresh Produce',3.40,1.90,67,30,150,'🫐',6,174],
['70% Dark Chocolate','Snacks',2.75,1.10,212,50,300,'🍫',240,156],['Sparkling Water 6×500ml','Beverages',3.95,1.65,340,80,500,'💧',365,412],['Extra Virgin Olive Oil','Grocery',8.90,5.10,12,20,90,'🫒',420,64],['Single-Origin Coffee 1kg','Beverages',18.50,9.40,45,20,120,'☕',180,88],
['Free-Range Eggs (12)','Dairy & Chilled',3.60,1.95,87,40,160,'🥚',14,265],['Strawberries 400g','Fresh Produce',3.25,1.70,55,30,140,'🍓',3,210],['Wildflower Honey 340g','Grocery',6.95,3.80,18,15,70,'🍯',600,41],['Greek Yogurt 500g','Dairy & Chilled',2.40,1.05,110,40,180,'🥣',9,190],
['Butter Croissants (4)','Bakery',2.95,1.10,36,20,90,'🥐',1,230],['Cold-Pressed Orange Juice','Beverages',3.80,1.90,72,30,140,'🍊',6,160],['Basmati Rice 2kg','Grocery',5.50,2.95,96,30,200,'🍚',500,98],['Sea Salt Crisps','Snacks',1.65,.62,180,60,320,'🥔',150,320],
['Mature Cheddar 400g','Dairy & Chilled',4.75,2.60,0,20,90,'🧀',45,140],['Bananas (bunch)','Fresh Produce',1.15,.48,150,60,260,'🍌',4,380],['Eco Laundry Liquid','Household',7.50,3.90,42,15,80,'🧴',720,38],['Bamboo Kitchen Roll','Household',4.25,2.10,64,20,120,'🧻',900,22],
['Natural Shampoo 400ml','Personal Care',5.95,2.40,33,15,80,'🧼',700,14],['Mint Toothpaste','Personal Care',2.20,.85,7,25,120,'🪥',800,74],['Penne Pasta 500g','Grocery',1.35,.52,260,60,400,'🍝',600,290],['Sparkling Lemonade 1.5L','Beverages',1.95,.80,118,40,220,'🍋',300,205]];

const S={
 settings:{company:'Monarch Retail Group Ltd',address:'48 King Street, London EC2V 8EH',phone:'+44 20 7946 0321',vat:'GB 284 1923 77',email:'hello@monarch-retail.co.uk',currency:'GBP',taxRate:20,taxInclusive:true,invPrefix:'INV-',nextInv:10482,receiptHeader:'Thank you for shopping with us!',receiptFooter:'Returns accepted within 30 days with receipt.',showLogo:true,showBarcode:true,showVat:true,pointsPer:1,pointValue:.01,discountAlert:20,refundPinLimit:50,managerPin:'1234',autoBackup:true,twoFA:true,sessionTimeout:30},
 branch:'All branches',page:'overview',user:null,
 products:[],customers:[],orders:[],suppliers:[],pos:[],branches:[],transfers:[],employees:[],registers:[],promotions:[],giftcards:[],coupons:[],audit:[],movements:[],online:[],devices:[],backups:[],suspicious:[],waste:[],approvals:[],logins:[],notifs:[],
 cart:{items:[],customer:null,inv:{type:'pct',value:0,code:'',label:''}},held:[],posCat:'All',
 roles:['Owner','Manager','Cashier','Stock Clerk'],
 perms:[['sale','Process sales'],['disc10','Discounts up to 10%'],['discMax','Discounts above 10%'],['refund','Process refunds'],['void','Void transactions'],['price','Edit prices'],['stock','Adjust stock'],['po','Create purchase orders'],['reports','View reports'],['users','Manage users'],['settings','System settings']],
 matrix:{Owner:'sale disc10 discMax refund void price stock po reports users settings',Manager:'sale disc10 discMax refund void price stock po reports',Cashier:'sale disc10','Stock Clerk':'stock po'},
 notifPrefs:{sales:true,stock:true,refund:true,large:true,daily:true,expiry:false},
 cloudStatus:'Local persisted (MongoDB ready)'
};

function seedInitialData(){
R=mulberry(20261122);
S.products=RAW.map((r,i)=>{const [name,cat,price,cost,stock,min,max,emoji,exp,sold]=r;const id=i+1;return{id,name,cat,price,cost,wholesale:r2(price*.86),stock,min,max,emoji,expiry:exp,sold30:sold,sku:CATS[cat].px+'-'+String(100+id*7).padStart(3,'0'),barcode:'50'+String(1e10+id*73915371).slice(-11),batch:'B'+(2611+i)+'-'+String.fromCharCode(65+i%6),variants:id===8?['Whole bean','Espresso grind','Filter grind']:id===6?['Still','Sparkling']:id===21?['Normal hair','Dry hair']:[],extraBarcodes:id%5===0?['50'+String(2e10+id*1111).slice(-11)]:[]}});
const CUSTS=[['Olivia James','Platinum',4820,0,500,'VIP'],['James Wilson','Gold',2310,45.2,300,'Retail'],['Sophia Brown','Gold',1980,0,300,'Retail'],['Noah Davis','Silver',640,0,150,'Retail'],['Emma Lee','Silver',520,120,400,'Trade'],['Liam Patel','Platinum',5210,0,800,'VIP'],['Ava Thompson','Silver',310,0,150,'Retail'],['Mason Clarke','Gold',1720,380,1000,'Wholesale'],['Isabella Khan','Silver',220,0,150,'Retail'],['Ethan Wright','Gold',1450,0,300,'Staff']];
S.customers=CUSTS.map((c,i)=>({id:i+1,name:c[0],tier:c[1],points:c[2],credit:c[3],limit:c[4],group:c[5],email:c[0].toLowerCase().replace(' ','.')+'@mail.co.uk',phone:'+44 7'+String(700+i*37).slice(0,3)+' '+String(100000+i*48271).slice(0,6),spent:c[2]*.8+ri(100,900),visits:ri(8,110),birthday:new Date(1985+i,(i*5)%12,(i*7)%27+1),since:new Date(2021+(i%4),i%12,3)}));
S.branches=[{id:'LON',name:'Central London',city:'London',manager:'Sarah Collins',staff:42,rev:58420,target:60000,orders:1520,c:'#5b4cf0',share:.41,status:'Open'},{id:'MAN',name:'Manchester',city:'Manchester',manager:'Marcus Lee',staff:36,rev:38210,target:36000,orders:1104,c:'#14b8a6',share:.27,status:'Open'},{id:'BIR',name:'Birmingham',city:'Birmingham',manager:'Chloe Evans',staff:28,rev:27950,target:31000,orders:842,c:'#f29a0b',share:.2,status:'Open'},{id:'LEE',name:'Leeds',city:'Leeds',manager:'Hannah Scott',staff:20,rev:18240,target:17500,orders:596,c:'#e5479a',share:.12,status:'Open'}];
S.branches.forEach(b=>b.trend=Array.from({length:12},(_,i)=>b.rev/30*(0.7+R()*.5+i*.02)));
const PINS=['0000','1234','2222','3333','4444','5555','6666','7777','8888'];
S.employees=[['Alex Morgan','Owner','All',true],['Sarah Collins','Manager','LON',true],['Daniel Reed','Cashier','LON',true],['Priya Shah','Cashier','MAN',true],['Tom Baker','Stock Clerk','LON',false],['Chloe Evans','Manager','BIR',true],['Marcus Lee','Manager','MAN',false],['Hannah Scott','Cashier','LEE',true],['Ryan Ahmed','Cashier','BIR',false]].map((e,i)=>({id:i+1,name:e[0],role:e[1],branch:e[2],onShift:e[3],pin:PINS[i],password:'admin123',sales:e[1]==='Cashier'?ri(1400,3200):e[1]==='Manager'?ri(300,900):0,txns:ri(30,120),comm:e[1]==='Cashier'?1.5:e[1]==='Manager'?1:0,last:new Date(Date.now()-ri(5,600)*6e4),email:e[0].toLowerCase().replace(' ','.')+'@monarch-retail.co.uk',active:true}));
S.registers=[{id:'REG-01',branch:'LON',name:'Front counter 1',open:true,cashier:'Daniel Reed',float:200,cash:842.5,cin:0,cout:40,card:2140.2,digital:610.8,opened:new Date(Date.now()-5.2*36e5)},{id:'REG-02',branch:'LON',name:'Front counter 2',open:true,cashier:'Sarah Collins',float:200,cash:615.3,cin:50,cout:0,card:1720.4,digital:402.1,opened:new Date(Date.now()-4.8*36e5)},{id:'REG-03',branch:'MAN',name:'Main till',open:true,cashier:'Priya Shah',float:150,cash:528.9,cin:0,cout:25,card:1388.6,digital:290.4,opened:new Date(Date.now()-6*36e5)},{id:'REG-04',branch:'BIR',name:'Express lane',open:false,cashier:'—',float:0,cash:0,cin:0,cout:0,card:0,digital:0,opened:null}];
S.suppliers=[['FreshFields Produce Ltd','Mark Hughes','Fresh Produce',4820,2,96,4.8],['Northern Dairy Co.','Lucy Grant','Dairy & Chilled',3210,3,91,4.5],['Bakehouse Collective','Jon Price','Bakery',980,1,98,4.9],['Bean & Leaf Traders','Amira Said','Beverages',5640,5,88,4.3],['Pantry Wholesale UK','Kevin Doyle','Grocery',2950,4,93,4.6],['CleanHome Supplies','Nina Ford','Household',850,6,84,4.1]].map((s,i)=>({id:i+1,name:s[0],contact:s[1],cat:s[2],balance:s[3],lead:s[4],ontime:s[5],rating:s[6],email:s[1].toLowerCase().replace(' ','.')+'@'+s[0].split(' ')[0].toLowerCase()+'.co.uk',orders:ri(18,90)}));
S.pos=[{id:'PO-2042',sup:4,status:'Draft',created:new Date(Date.now()-.3*DAY),eta:new Date(Date.now()+5*DAY),lines:[{pid:8,qty:40,cost:9.4,rec:0},{pid:14,qty:60,cost:1.9,rec:0}]},{id:'PO-2041',sup:1,status:'Ordered',created:new Date(Date.now()-1*DAY),eta:new Date(Date.now()+1*DAY),lines:[{pid:2,qty:80,cost:1.2,rec:0},{pid:10,qty:60,cost:1.7,rec:0},{pid:4,qty:50,cost:1.9,rec:0}]},{id:'PO-2040',sup:2,status:'Partially received',created:new Date(Date.now()-3*DAY),eta:new Date(Date.now()-.5*DAY),lines:[{pid:17,qty:60,cost:2.6,rec:0},{pid:9,qty:80,cost:1.95,rec:80}]},{id:'PO-2039',sup:5,status:'Received',created:new Date(Date.now()-6*DAY),eta:new Date(Date.now()-3*DAY),lines:[{pid:15,qty:100,cost:2.95,rec:100},{pid:23,qty:200,cost:.52,rec:200}]},{id:'PO-2038',sup:3,status:'Received',created:new Date(Date.now()-8*DAY),eta:new Date(Date.now()-7*DAY),lines:[{pid:3,qty:60,cost:1.6,rec:60},{pid:13,qty:80,cost:1.1,rec:80}]}];
S.transfers=[{id:'TR-0318',from:'LON',to:'LEE',pid:7,qty:12,status:'In transit',date:new Date(Date.now()-.4*DAY)},{id:'TR-0317',from:'MAN',to:'BIR',pid:6,qty:48,status:'Completed',date:new Date(Date.now()-2*DAY)},{id:'TR-0316',from:'LON',to:'MAN',pid:8,qty:10,status:'Completed',date:new Date(Date.now()-3*DAY)}];
S.promotions=[{id:1,name:'Sparkling Water — 3 for 2',type:'bxgy',pid:6,x:2,y:1,active:true,sched:'Always on',uses:284,rev:3420},{id:2,name:'Bakery happy hour — 25% off',type:'pct_cat',cat:'Bakery',pct:25,active:false,sched:'Daily · 18:00–20:00',uses:96,rev:880},{id:3,name:'Weekend fresh — 10% off produce',type:'pct_cat',cat:'Fresh Produce',pct:10,active:true,sched:'Sat – Sun',uses:412,rev:5210},{id:4,name:'Spend £50, save 5%',type:'tiered',min:50,pct:5,active:true,sched:'Always on',uses:138,rev:9870},{id:5,name:'Breakfast bundle — croissants + OJ',type:'bundle',pids:[13,14],off:1,active:true,sched:'Mon – Sun · until 11:00',uses:221,rev:1460},{id:6,name:'Dark chocolate BOGO',type:'bxgy',pid:5,x:1,y:1,active:false,sched:'Valentine’s week',uses:0,rev:0},{id:7,name:'Gold & Platinum members — 5% off',type:'group',tiers:['Gold','Platinum'],pct:5,active:true,sched:'Always on',uses:640,rev:14200}];
S.giftcards=[{code:'GC-8F2K-19QA',bal:50,init:50,to:'Olivia James',exp:new Date(2027,10,1),c1:'#6a5cf6',c2:'#3a2bc4'},{code:'GC-4MZT-77LP',bal:12.4,init:25,to:'Noah Davis',exp:new Date(2027,5,12),c1:'#14b8a6',c2:'#0e7490'},{code:'GC-Q9WE-30RT',bal:100,init:100,to:'Corporate · Acme Ltd',exp:new Date(2027,11,31),c1:'#f29a0b',c2:'#e5479a'}];
S.coupons=[{code:'WELCOME10',pct:10,uses:312,limit:1000,active:true,exp:new Date(2026,11,31)},{code:'FRESH15',pct:15,uses:88,limit:200,active:true,exp:new Date(2026,10,30)},{code:'VIP20',pct:20,uses:41,limit:100,active:false,exp:new Date(2026,11,24)}];
S.online=[['WEB-5528','Grace Miller','Web','Click & Collect',4,38.2,0],['APP-1194','Leo Turner','App','Delivery',7,64.9,0],['WEB-5527','Mia Roberts','Web','Click & Collect',2,12.5,1],['MKT-0882','Oscar Hill','Marketplace','Delivery',3,27.8,1],['APP-1193','Ruby Green','App','Click & Collect',5,44.1,2],['WEB-5526','Jack Wood','Web','Click & Collect',1,18.5,2],['APP-1192','Freya Hall','App','Delivery',9,92.3,3],['WEB-5525','Harry King','Web','Click & Collect',3,22.6,3]].map((o,i)=>({id:o[0],cust:o[1],ch:o[2],type:o[3],items:o[4],total:o[5],stage:o[6],branch:['LON','MAN','LON','BIR'][i%4],time:new Date(Date.now()-ri(5,300)*6e4)}));
S.devices=[['Barcode scanner','scan','Zebra DS2208','USB HID','Connected'],['Receipt printer','printer','Epson TM-T88VII','Ethernet','Connected'],['Cash drawer','inbox','APG Vasario','Printer-driven','Connected'],['Customer display','monitor','Sunmi D2s 10.1″','HDMI','Connected'],['Payment terminal','card','Verifone P400','Wi-Fi','Connected'],['Label printer','tag','Zebra ZD421','USB','Idle'],['Barcode printer','barChart','Brother QL-820','Bluetooth','Idle'],['Weighing scale','scale','CAS PD-II','RS-232','Connected'],['Touch-screen terminal','touch','Elo I-Series 15.6″','Integrated','Connected']].map((d,i)=>({id:i+1,name:d[0],ic:d[1],model:d[2],conn:d[3],status:d[4]}));
S.backups=Array.from({length:6},(_,i)=>({id:'BK-'+(5520-i),time:new Date(Date.now()-(i*24+2)*36e5),type:i===2?'Manual':'Automatic',size:(1.84-i*.03).toFixed(2)+' GB',status:'Success',dur:ri(38,74)+'s'}));
S.suspicious=[{id:1,type:'Excessive discount (35%)',who:'Ryan Ahmed',ref:'INV-10471',amount:62.4,risk:86,time:new Date(Date.now()-2*36e5),status:'Open'},{id:2,type:'Refund without receipt',who:'Hannah Scott',ref:'INV-10458',amount:48.9,risk:72,time:new Date(Date.now()-9*36e5),status:'Open'},{id:3,type:'Multiple voids in 10 min',who:'Ryan Ahmed',ref:'REG-04',amount:118.3,risk:64,time:new Date(Date.now()-27*36e5),status:'Open'},{id:4,type:'No-sale drawer opens (×4)',who:'Daniel Reed',ref:'REG-01',amount:0,risk:41,time:new Date(Date.now()-50*36e5),status:'Resolved'}];
S.waste=[{time:new Date(Date.now()-3*36e5),pid:3,qty:4,reason:'Expired',user:'Tom Baker'},{time:new Date(Date.now()-20*36e5),pid:10,qty:6,reason:'Damaged',user:'Tom Baker'},{time:new Date(Date.now()-46*36e5),pid:9,qty:2,reason:'Damaged',user:'Sarah Collins'},{time:new Date(Date.now()-70*36e5),pid:13,qty:8,reason:'Expired',user:'Chloe Evans'}];
S.approvals=[{id:1,type:'Refund',ref:'INV-10476',amount:84.6,by:'Daniel Reed',note:'Customer returned damaged coffee grinder accessory',time:new Date(Date.now()-25*6e4),status:'Pending'},{id:2,type:'Discount 30%',ref:'Cart · REG-03',amount:36.2,by:'Priya Shah',note:'Damaged packaging — olive oil',time:new Date(Date.now()-8*6e4),status:'Pending'}];
S.logins=S.employees.slice(0,8).map((e,i)=>({who:e.name,role:e.role,ip:'81.2.'+(60+i*3)+'.'+(10+i*17),dev:['Chrome · macOS','POS Terminal · REG-0'+(1+i%3),'Safari · iPhone','Edge · Windows'][i%4],time:new Date(Date.now()-ri(3,900)*6e4),ok:i!==5}));
S.movements=[{time:new Date(Date.now()-40*6e4),pid:9,type:'Received',qty:80,reason:'PO-2040',user:'Tom Baker'},{time:new Date(Date.now()-3*36e5),pid:3,type:'Write-off',qty:-4,reason:'Expired',user:'Tom Baker'},{time:new Date(Date.now()-5*36e5),pid:6,type:'Transfer out',qty:-48,reason:'TR-0317',user:'Marcus Lee'},{time:new Date(Date.now()-20*36e5),pid:10,type:'Write-off',qty:-6,reason:'Damaged',user:'Tom Baker'},{time:new Date(Date.now()-30*36e5),pid:22,type:'Count correction',qty:-3,reason:'Cycle count',user:'Sarah Collins'}];
S.audit=[['login','Alex Morgan','Signed in','Chrome · macOS',12],['price','Sarah Collins','Price changed · Olive Oil £8.50 → £8.90','GRC-056',55],['refund','Daniel Reed','Refund requested · INV-10476','£84.60',25],['stock','Tom Baker','Stock received · PO-2040 (80 units)','DCH-070',40],['discount','Priya Shah','Discount override 30% requested','REG-03',8],['user','Alex Morgan','Role updated · Hannah Scott → Cashier','Team',190],['void','Ryan Ahmed','Transaction voided · REG-04','£18.40',1620],['settings','Alex Morgan','Receipt footer updated','Admin',2880]].map(a=>({type:a[0],who:a[1],what:a[2],ref:a[3],time:new Date(Date.now()-a[4]*6e4)}));
S.notifs=[{ic:'alert',c:'var(--warning)',t:'Low stock: 5 products',s:'Olive Oil, Toothpaste, Sourdough and more',time:new Date(Date.now()-6e5),go:'inventory',unread:true},{ic:'key',c:'var(--primary)',t:'2 approvals waiting',s:'Refund INV-10476 · Discount on REG-03',time:new Date(Date.now()-15e5),go:'security',unread:true},{ic:'clock',c:'var(--danger)',t:'4 batches expire within 3 days',s:'Croissants, Sourdough, Strawberries',time:new Date(Date.now()-36e5),go:'expiry',unread:true},{ic:'trend',c:'var(--success)',t:'Manchester beat its target',s:'106% of weekly revenue goal',time:new Date(Date.now()-3*36e5),go:'branches',unread:false},{ic:'globe',c:'var(--info)',t:'2 new online orders',s:'Click & Collect · Central London',time:new Date(Date.now()-5*36e5),go:'omnichannel',unread:false}];
const methods=['Card','Card','Card','Cash','Digital wallet','Card'];let inv=10441;const list=[];for(let k=0;k<41;k++){const t=new Date(Date.now()-(41-k)*ri(160,260)*6e4);const n=ri(1,5);const items=[];for(let j=0;j<n;j++){const p=pick(S.products);if(items.find(x=>x.id===p.id))continue;items.push({id:p.id,name:p.name,emoji:p.emoji,qty:ri(1,3),price:p.price,disc:0})}const total=r2(sum(items,x=>x.qty*x.price));const tax=r2(total-total/1.2);const cu=R()<.6?pick(S.customers):null;const m=pick(methods);const split=R()<.12;const status=R()<.08?'Refunded':R()<.05?'On account':'Completed';const pays=status==='On account'?[{method:'Card',amount:r2(total*.4)},{method:'On account',amount:r2(total-r2(total*.4))}]:split?[{method:'Cash',amount:r2(total/2)},{method:'Card',amount:r2(total-r2(total/2))}]:[{method:m,amount:total}];list.push({id:'ORD-'+(20800+k),inv:'INV-'+(inv++),time:t,customer:cu?cu.name:'Walk-in customer',cid:cu?cu.id:null,items,sub:total,itemDisc:0,promo:0,invDisc:0,tax,total,pays,status,cashier:pick(['Daniel Reed','Priya Shah','Hannah Scott','Ryan Ahmed','Sarah Collins']),branch:pick(['LON','LON','MAN','BIR','LEE']),reg:pick(['REG-01','REG-02','REG-03']),refunded:status==='Refunded'?total:0,channel:'In-store'})}S.orders=list.reverse();
R=mulberry(77);
}

const P=id=>S.products.find(p=>p.id===+id);
const C=id=>S.customers.find(c=>c.id===+id);
const CASHIERS=['Daniel Reed','Priya Shah','Hannah Scott','Ryan Ahmed','Sarah Collins'];

/* ================= PERSISTENCE (LocalStorage + Optional MongoDB API) ================= */
const PERSIST_KEYS=['settings','products','customers','orders','suppliers','pos','branches','transfers','employees','registers','promotions','giftcards','coupons','audit','movements','online','devices','backups','suspicious','waste','approvals','logins','notifs','held','roles','matrix','notifPrefs'];
function reviveDates(obj){
  if(!obj||typeof obj!=='object')return obj;
  for(const k of Object.keys(obj)){
    const v=obj[k];
    if(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v))obj[k]=new Date(v);
    else if(typeof v==='object')reviveDates(v);
  }
  return obj;
}
function saveState(){
  try{
    const snap={};
    PERSIST_KEYS.forEach(k=>snap[k]=S[k]);
    localStorage.setItem('monarch_pos_state_v1',JSON.stringify(snap));
    if(window._cloudConnected){
      fetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(snap)}).catch(()=>{});
    }
  }catch(e){}
}
function loadState(){
  seedInitialData();
  const PINS=['0000','1234','2222','3333','4444','5555','6666','7777','8888'];
  try{
    const raw=localStorage.getItem('monarch_pos_state_v1');
    if(raw){
      const snap=reviveDates(JSON.parse(raw));
      PERSIST_KEYS.forEach(k=>{if(snap[k]!==undefined)S[k]=snap[k]});
    }
    const u=localStorage.getItem('monarch_pos_user_v1');
    if(u)S.user=JSON.parse(u);
  }catch(e){}
  S.employees.forEach((e,i)=>{if(!e.pin)e.pin=PINS[i]||String(1000+e.id*111).slice(0,4);if(!e.password)e.password='admin123'});
  // Probe optional /api/state (Vercel / MongoDB serverless API)
  fetch('/api/state').then(r=>r.ok?r.json():null).then(d=>{
    if(d&&d.ok){
      window._cloudConnected=true;
      S.cloudStatus=d.mongo?'MongoDB Connected · Live':'API Connected · Memory/Local';
      const pill=$('#sync-pill');if(pill)pill.textContent=S.cloudStatus;
      if(d.state&&d.state.products){
        const snap=reviveDates(d.state);
        PERSIST_KEYS.forEach(k=>{if(snap[k]!==undefined)S[k]=snap[k]});
        if(window.refresh)refresh();
      }else{
        saveState();
      }
    }
  }).catch(()=>{});
}
function resetDemoState(){
  localStorage.removeItem('monarch_pos_state_v1');
  seedInitialData();
  saveState();
  if(window.toast)toast('Demo dataset restored to factory defaults','info');
  if(window.refresh)refresh();
}
loadState();
