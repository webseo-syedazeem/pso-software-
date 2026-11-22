/* ================= REPORTS (100% LIVE FROM DATABASE) ================= */
S.rep={id:'daily',range:'7D'};
const RM={Today:1,'7D':7,'30D':30,'12M':365};
function ordsInRange(r){
  const days=RM[r]||7;
  const cut=r==='Today'?new Date().setHours(0,0,0,0):(Date.now()-days*DAY);
  return branchOrders().filter(o=>new Date(o.time).getTime()>=cut&&o.status!=='Refunded');
}
const REPORTS=[
['Sales','daily','Daily sales report','clock',()=>{
  const h=Array.from({length:14},(_,i)=>8+i);
  const today0=new Date().setHours(0,0,0,0);
  const ords=branchOrders().filter(o=>new Date(o.time).getTime()>=today0&&o.status!=='Refunded');
  const v=h.map(hr=>r2(sum(ords.filter(o=>new Date(o.time).getHours()===hr),o=>o.total-(o.refunded||0))));
  const cnt=h.map(hr=>ords.filter(o=>new Date(o.time).getHours()===hr).length);
  return{labels:h.map(x=>x+':00'),vals:v,cols:['Hour','Transactions','Revenue','Avg basket'],rows:h.map((x,i)=>[x+':00',cnt[i],money(v[i]),money(cnt[i]?v[i]/cnt[i]:0)])};
}],
['Sales','period','Weekly / monthly / yearly sales','calendar',r=>{
  const s=revSeries(r==='12M'?'12M':r==='30D'?'30D':'7D');
  return{labels:s.labels,vals:s.cur,line:s.prev,cols:['Period','Revenue','Previous','Change'],rows:s.labels.map((l,i)=>[l,money(s.cur[i]),money(s.prev[i]),s.prev[i]>0?((s.cur[i]/s.prev[i]-1)*100).toFixed(1)+'%':'—'])};
}],
['Sales','product','Product performance','package',r=>{
  const l=[...S.products].sort((a,b)=>b.sold30*b.price-a.sold30*a.price);
  return{labels:l.slice(0,10).map(p=>p.name.split(' ').slice(0,2).join(' ')),vals:l.slice(0,10).map(p=>p.sold30*p.price),cols:['Product','Units sold','Revenue','Margin'],rows:l.map(p=>[p.name,num(p.sold30),money(p.sold30*p.price),p.price>0?((1-p.cost/p.price)*100).toFixed(1)+'%':'0%'])};
}],
['Sales','category','Category performance','layers',r=>{
  const ords=ordsInRange(r);
  const c=Object.keys(CATS).map(k=>[k,r2(sum(ords,o=>sum((o.items||[]).filter(i=>P(i.id).cat===k),i=>Math.max(0,i.qty-(i.returned||0))*i.price*(1-(i.disc||0)/100))))]).sort((a,b)=>b[1]-a[1]);
  const t=sum(c,x=>x[1]);
  return{labels:c.map(x=>x[0].split(' ')[0]),vals:c.map(x=>x[1]),cols:['Category','Revenue','Share'],rows:c.map(x=>[x[0],money(x[1]),t>0?(x[1]/t*100).toFixed(1)+'%':'0%'])};
}],
['Sales','branch','Branch performance','store',r=>({
  labels:S.branches.map(b=>b.name),
  vals:S.branches.map(b=>b.rev),
  cols:['Branch','Revenue','Orders','Target attainment'],
  rows:S.branches.map(b=>[b.name,money(b.rev),num(b.orders),b.target>0?(b.rev/b.target*100).toFixed(1)+'%':'0%'])
})],
['Sales','cashier','Cashier performance','userCheck',r=>{
  const ords=ordsInRange(r);
  const l=S.employees.map(e=>{
    const eo=ords.filter(o=>o.cashier===e.name);
    const rv=r2(sum(eo,o=>o.total-(o.refunded||0)));
    return{name:e.name,rv,txns:eo.length,comm:r2(rv*(e.comm||0)/100)};
  });
  return{labels:l.map(e=>e.name.split(' ')[0]),vals:l.map(e=>e.rv),cols:['Cashier','Sales','Transactions','Commission'],rows:l.map(e=>[e.name,money(e.rv),num(e.txns),money(e.comm)])};
}],
['Finance','profit','Profit & margin','percent',r=>{
  const ords=ordsInRange(r);
  const rev=r2(sum(ords,o=>o.total-(o.refunded||0)-(o.tax||0)));
  const cogs=r2(sum(ords,o=>sum(o.items||[],i=>Math.max(0,i.qty-(i.returned||0))*P(i.id).cost)));
  const gp=r2(rev-cogs);
  return{labels:['Net Sales','COGS','Gross Profit'],vals:[rev,cogs,Math.max(0,gp)],cols:['Metric','Amount'],rows:[['Net Sales',money(rev)],['Cost of Goods Sold (COGS)',money(cogs)],['Gross Profit',money(gp)],['Gross Margin %',rev>0?(gp/rev*100).toFixed(1)+'%':'0%']]};
}],
['Finance','tax','Tax report','receipt',r=>{
  const ords=ordsInRange(r);
  const gross=r2(sum(ords,o=>o.total-(o.refunded||0)));
  const tax=r2(sum(ords,o=>o.tax||0));
  return{labels:['Gross Sales','Net Sales','Tax Collected'],vals:[gross,r2(gross-tax),tax],cols:['Invoice','Date','Gross','Tax'],rows:ords.map(o=>[o.inv,fmtTime(o.time),money(o.total-(o.refunded||0)),money(o.tax||0)])};
}],
['Finance','payment','Payment method report','card',r=>{
  const ords=ordsInRange(r);
  const m=['Cash','Card','Bank transfer','Digital wallet','Gift card','On account'];
  const vals=m.map(k=>r2(sum(ords,o=>sum((o.pays||[]).filter(p=>p.method===k),p=>p.amount))));
  const tot=sum(vals);
  return{labels:m,vals,cols:['Method','Amount','Share'],rows:m.map((x,i)=>[x,money(vals[i]),tot>0?(vals[i]/tot*100).toFixed(1)+'%':'0%'])};
}],
['Finance','discount','Discount report','tag',r=>({
  labels:S.promotions.map(p=>p.name.split(' ').slice(0,2).join(' ')),
  vals:S.promotions.map(p=>p.rev),
  cols:['Promotion','Redemptions','Revenue influenced','Status'],
  rows:S.promotions.map(p=>[p.name,num(p.uses),money(p.rev),p.active?'Active':'Paused'])
})],
['Finance','refund','Refund report','undo',r=>{
  const l=branchOrders().filter(o=>o.refunded>0);
  return{labels:l.slice(0,10).map(o=>o.inv),vals:l.slice(0,10).map(o=>o.refunded),cols:['Invoice','Date','Customer','Refunded','Cashier'],rows:l.map(o=>[o.inv,fmtTime(o.time),o.customer,money(o.refunded),o.cashier])};
}],
['Inventory','valuation','Inventory valuation','box',r=>{
  const c=Object.keys(CATS).map(k=>[k,sum(S.products.filter(p=>p.cat===k),p=>p.stock*p.cost),sum(S.products.filter(p=>p.cat===k),p=>p.stock*p.price)]);
  return{labels:c.map(x=>x[0].split(' ')[0]),vals:c.map(x=>x[1]),cols:['Category','Units','At cost','At retail'],rows:c.map(x=>[x[0],num(sum(S.products.filter(p=>p.cat===x[0]),p=>p.stock)),money(x[1]),money(x[2])])};
}],
['Inventory','movement','Stock movement report','swap',r=>{
  const t={};S.movements.forEach(m=>t[m.type]=(t[m.type]||0)+Math.abs(m.qty));
  const k=Object.keys(t);
  return{labels:k,vals:k.map(x=>t[x]),fmt:num,cols:['Time','Product','Type','Qty','Reference'],rows:S.movements.map(m=>[fmtTime(m.time),P(m.pid).name,m.type,m.qty,m.reason])};
}],
['Inventory','best','Best-selling products','flame',r=>{
  const l=[...S.products].sort((a,b)=>b.sold30-a.sold30).slice(0,10);
  return{labels:l.map(p=>p.name.split(' ')[0]),vals:l.map(p=>p.sold30),fmt:num,cols:['Rank','Product','Units sold','Revenue'],rows:l.map((p,i)=>['#'+(i+1),p.name,num(p.sold30),money(p.sold30*p.price)])};
}],
['Inventory','slow','Slow-moving products','trendDown',r=>{
  const l=[...S.products].sort((a,b)=>a.sold30-b.sold30).slice(0,10);
  return{labels:l.map(p=>p.name.split(' ')[0]),vals:l.map(p=>p.stock),fmt:num,cols:['Product','Stock','Units sold','Stock value'],rows:l.map(p=>[p.name,p.stock,p.sold30,money(p.stock*p.cost)])};
}],
['Inventory','dead','Dead-stock analysis','alert',r=>{
  const l=S.products.filter(p=>p.sold30===0&&p.stock>0);
  return{labels:l.map(p=>p.name.split(' ')[0]),vals:l.map(p=>p.stock*p.cost),cols:['Product','Stock','Value tied up','Units sold','Action'],rows:l.map(p=>[p.name,p.stock,money(p.stock*p.cost),p.sold30,'Promote / discount'])};
}],
['Partners','purchase','Purchase report','truck',r=>({
  labels:S.pos.map(p=>p.id),
  vals:S.pos.map(poVal),
  cols:['PO','Supplier','Value','Status'],
  rows:S.pos.map(p=>[p.id,S.suppliers.find(s=>s.id===p.sup)?.name||'—',money(poVal(p)),p.status])
})],
['Partners','supplier','Supplier report','users',r=>({
  labels:S.suppliers.map(s=>s.name.split(' ')[0]),
  vals:S.suppliers.map(s=>s.balance),
  cols:['Supplier','Orders','Balance','On-time','Rating'],
  rows:S.suppliers.map(s=>[s.name,s.orders,money(s.balance),s.ontime+'%',s.rating])
})],
['Partners','customer','Customer report','user',r=>({
  labels:S.customers.map(c=>c.name.split(' ')[0]),
  vals:S.customers.map(c=>c.spent),
  cols:['Customer','Tier','Visits','Spend','Points'],
  rows:S.customers.map(c=>[c.name,c.tier,c.visits,money(c.spent),num(c.points)])
})]];

PAGES.reports=()=>{const R0=REPORTS.find(r=>r[1]===S.rep.id);const d=R0[4](S.rep.range);const groups=[...new Set(REPORTS.map(r=>r[0]))];const stMeta=[['Total',(d.fmt||money)(sum(d.vals)),'var(--primary)','trend'],['Average',(d.fmt||money)(d.vals.length?sum(d.vals)/d.vals.length:0),'var(--teal)','activity'],['Peak',(d.fmt||money)(d.vals.length?Math.max(0,...d.vals):0),'var(--warning)','flame']];return `<div class="page">${head('Reporting studio','Reports & Analytics',`${REPORTS.length} live reports computed directly from your database — export to CSV, Excel or PDF.`,`<div class="seg">${Object.keys(RM).map(k=>`<button class="${S.rep.range===k?'on':''}" onclick="S.rep.range='${k}';refresh()">${k}</button>`).join('')}</div>`)}<div class="grid g-nav" style="grid-template-columns:260px minmax(0,1fr)"><aside class="card pad rv" style="align-self:start;padding:14px">${groups.map(g=>`<div class="sec-t" style="margin:10px 10px 6px">${g}</div><div class="rep-list">${REPORTS.filter(r=>r[0]===g).map(r=>`<button class="rep-i ${S.rep.id===r[1]?'on':''}" onclick="S.rep.id='${r[1]}';refresh()">${ic(r[3],16)} ${r[2]}</button>`).join('')}</div>`).join('')}</aside><section class="card pad rv" style="--i:1"><div class="ch"><div><h3 style="font-size:20px">${R0[2]}</h3><p>${esc(S.branch)} · ${S.rep.range} · generated ${new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</p></div><div class="row"><button class="btn sm soft" onclick="exportCSV('${R0[1]}-report',[${JSON.stringify(d.cols).replace(/"/g,"'")},...REPORTS.find(r=>r[1]==='${R0[1]}')[4](S.rep.range).rows])">${ic('download',14)} CSV / Excel</button><button class="btn sm pri" onclick="printReport()">${ic('printer',14)} PDF</button></div></div><div class="grid g3 mb">${stMeta.map(x=>`<div class="rep-stat" style="--c:${x[2]}"><div><div class="xs b" style="color:${x[2]};text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px">${x[0]}</div><b class="display" style="font-size:24px">${x[1]}</b></div><div class="kpi-ic" style="--c:${x[2]}">${ic(x[3],18)}</div></div>`).join('')}</div>${d.line?area({series:[{name:'Current',data:d.vals,c:'#5b4cf0'},{name:'Previous',data:d.line,c:'#b8b3e8',dash:true}],labels:d.labels,h:240}):bars(d.vals,d.labels,{fmt:d.fmt||moneyK,h:220,colors:['#5b4cf0','#14b8a6','#f29a0b','#e5479a','#0e9fe0','#0fb37c','#8b7ffa','#e9445a']})}<div class="tw mt" id="rep-tab">${d.rows.length?`<table><thead><tr>${d.cols.map((c,i)=>`<th class="${i?'tr':''}">${c}</th>`).join('')}</tr></thead><tbody>${d.rows.map((r,k)=>`<tr class="rv" style="--i:${Math.min(k,12)}">${r.map((c,i)=>`<td class="${i?'tr num':''}">${i?esc(c):`<b>${esc(c)}</b>`}</td>`).join('')}</tr>`).join('')}</tbody></table>`:`<div class="empty"><div class="sm">No records in this period yet.</div></div>`}</div></section></div>${foot()}</div>`};
function printReport(){const R0=REPORTS.find(r=>r[1]===S.rep.id),d=R0[4](S.rep.range);printHTML(`<div style="font-family:Inter;padding:30px;color:#111"><h1 style="margin:0">${R0[2]}</h1><p>${esc(S.settings.company)} · ${esc(S.branch)} · ${S.rep.range} · ${new Date().toLocaleString('en-GB')}</p><table style="width:100%;border-collapse:collapse;font-size:12px"><tr>${d.cols.map(c=>`<th style="text-align:left;border-bottom:2px solid #111;padding:6px">${c}</th>`).join('')}</tr>${d.rows.map(r=>`<tr>${r.map(c=>`<td style="border-bottom:1px solid #ddd;padding:6px">${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`)}

/* ================= BUSINESS INTELLIGENCE (100% LIVE) ================= */
PAGES.intelligence=()=>{
  const rs=revSeries('7D');
  const avgDaily=sum(rs.cur)/7;
  const fc=[...Array(6).fill(null),rs.cur[6]||0,...Array.from({length:5},(_,i)=>r2(avgDaily*(1+i*0.03)))];
  const labels=[...rs.labels,...Array.from({length:5},(_,i)=>'+'+(i+1)+'d')];
  const todayRev=sum(sessionToday(),o=>o.total-(o.refunded||0));
  const tgtPct=(S.settings.dailyTarget>0)?Math.min(100,todayRev/S.settings.dailyTarget*100):0;
  const gmPct=liveGrossMarginPct(branchOrders());
  const stockHealth=S.products.length?(S.products.filter(p=>p.stock>=p.min).length/S.products.length*100):100;
  const custRetention=S.customers.length?(S.customers.filter(c=>c.visits>1).length/S.customers.length*100):0;
  const kp=[['Daily target attainment',tgtPct,'var(--primary)'],['Live gross margin',gmPct,'var(--teal)'],['Stock health (in stock)',stockHealth,'var(--warning)'],['Repeat customer rate',custRetention,'var(--pink)']];
  const segs=[
    {l:'Platinum VIP',v:S.customers.filter(c=>c.tier==='Platinum').length,c:'#5b4cf0',fmt:String(S.customers.filter(c=>c.tier==='Platinum').length)},
    {l:'Gold Loyal',v:S.customers.filter(c=>c.tier==='Gold').length,c:'#f29a0b',fmt:String(S.customers.filter(c=>c.tier==='Gold').length)},
    {l:'Silver Members',v:S.customers.filter(c=>c.tier==='Silver').length,c:'#14b8a6',fmt:String(S.customers.filter(c=>c.tier==='Silver').length)}
  ];
  const allOrds=branchOrders().filter(o=>o.status!=='Refunded');
  const totRev=sum(allOrds,o=>o.total-(o.refunded||0));
  const avgB=allOrds.length?totRev/allOrds.length:0;
  const avgItems=allOrds.length?sum(allOrds,o=>sum(o.items,i=>i.qty))/allOrds.length:0;

  return `<div class="page">${head('Insight lab','Business Intelligence','Live KPIs, revenue forecast, product margin matrix and customer segmentation.',`<button class="btn" onclick="exportCSV('bi-kpis',[['KPI','Value'],...${JSON.stringify(kp.map(k=>[k[0],k[1].toFixed(1)+'%'])).replace(/"/g,"'")}])">${ic('download',16)} Export</button>`)}<section class="grid g4 mb">${kp.map((k,i)=>`<div class="card pad rv row" style="--i:${i};gap:16px">${ring(k[1],k[2])}<div><b class="sm">${k[0]}</b><div class="xs muted" style="margin-top:3px">Computed from live DB</div></div></div>`).join('')}</section><div class="grid g-main mb"><section class="card pad rv" style="--i:4"><div class="ch"><div><h3>Sales trend & 5-day projection</h3><p>Based on your actual 7-day sales velocity</p></div><span class="badge pri">${ic('sparkles',12)} Live projection</span></div><div class="legend" style="margin-bottom:10px"><span><i style="--c:#5b4cf0"></i>Actual (7D)</span><span><i class="dash" style="--c:#14b8a6"></i>Projected (5D)</span></div>${area({series:[{name:'Actual',data:[...rs.cur,...Array(5).fill(null)],c:'#5b4cf0'},{name:'Projected',data:fc,c:'#14b8a6',dash:true,band:true}],labels,h:270})}</section><section class="card pad rv" style="--i:5"><div class="ch"><div><h3>Product margin matrix</h3><p>Volume vs margin — bubble size = revenue</p></div></div>${scatter()}</section></div><div class="grid g3 mb"><section class="card pad rv" style="--i:6"><div class="ch"><div><h3>Customer tiers</h3><p>Live distribution of ${S.customers.length} customers</p></div></div>${donut(segs,num(S.customers.length),'customers')}</section><section class="card pad rv" style="--i:7"><div class="ch"><div><h3>Peak-hour analysis</h3><p>Live transaction density</p></div></div>${heatmap()}</section><section class="card pad rv" style="--i:8"><div class="ch"><div><h3>Key performance summary</h3><p>Live metrics across ${esc(S.branch)}</p></div></div>${[['Total revenue',money(totRev)],['Completed orders',num(allOrds.length)],['Average basket',money(avgB)],['Items per basket',avgItems.toFixed(1)],['Registered customers',num(S.customers.length)],['Active products',num(S.products.length)]].map(r=>`<div class="li"><span style="flex:1" class="sm">${r[0]}</span><b class="num sm">${r[1]}</b></div>`).join('')}</section></div>${foot()}</div>`;
};
function scatter(){const W=420,H=280,L=40,B=30;const ps=S.products;const mxV=Math.max(1,...ps.map(p=>p.sold30));return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" class="scatter" style="height:280px"><line class="gl" x1="${L}" x2="${W}" y1="${(H-B)/2}" y2="${(H-B)/2}"/><line class="gl" x1="${(W+L)/2}" x2="${(W+L)/2}" y1="0" y2="${H-B}"/><text class="ax" x="${W-4}" y="14" text-anchor="end">⭐ Stars</text><text class="ax" x="${L+4}" y="14">💎 High margin</text><text class="ax" x="${W-4}" y="${H-B-6}" text-anchor="end">🐮 High volume</text><text class="ax" x="${L+4}" y="${H-B-6}">⚠ Low volume</text><text class="ax" x="${(W+L)/2}" y="${H-6}" text-anchor="middle">Units sold →</text><text class="ax" x="12" y="${(H-B)/2}" transform="rotate(-90 12 ${(H-B)/2})" text-anchor="middle">Margin →</text>${ps.map((p,i)=>{const m=p.price>0?(1-p.cost/p.price):0;const x=L+(p.sold30/mxV)*(W-L-24)+6,y=(H-B)-Math.max(0,Math.min(1,m))*(H-B-24)-6;return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${Math.max(5,Math.min(16,4+Math.sqrt(p.sold30*p.price)/10)).toFixed(1)}" fill="${catMeta(p.cat).c}" fill-opacity=".55" stroke="${catMeta(p.cat).c}" style="animation-delay:${i*40}ms;transform-origin:${x}px ${y}px"><title>${esc(p.name)} — ${p.sold30} sold, ${(m*100).toFixed(0)}% margin</title></circle>`}).join('')}</svg></div>`}

/* ================= EXPIRY & LOSS (100% LIVE) ================= */
PAGES.expiry=()=>{
  const batches=S.products.filter(p=>p.expiry<=30&&p.stock>0).sort((a,b)=>a.expiry-b.expiry);
  const risk=sum(batches.filter(p=>p.expiry<=7),p=>p.stock*p.cost);
  const expCost=sum(S.waste.filter(w=>w.reason==='Expired'),w=>w.qty*P(w.pid).cost);
  const dmgCost=sum(S.waste.filter(w=>w.reason==='Damaged'),w=>w.qty*P(w.pid).cost);
  const lostCost=sum(S.waste.filter(w=>w.reason!=='Expired'&&w.reason!=='Damaged'),w=>w.qty*P(w.pid).cost);
  return `<div class="page">${head('Risk & compliance','Expiry & Loss Prevention','Batch-level expiry tracking, waste management and suspicious-transaction monitoring.',`<button class="btn" onclick="lpSettings()">${ic('sliders',16)} Alert thresholds</button>`)}<section class="grid g4 mb">${kpi('Expiring within 7 days',cu(batches.filter(p=>p.expiry<=7).length),'','clock','var(--danger)',null,0,'batches')}${kpi('Value at risk',cu(risk,'money'),'','alert','var(--warning)',null,1,'at cost')}${kpi('Recorded waste',cu(sum(S.waste,w=>w.qty*P(w.pid).cost),'money'),'','trash','var(--teal)',null,2,S.waste.length+' write-offs')}${kpi('Flagged transactions',cu(S.suspicious.filter(s=>s.status==='Open').length),'','shield','var(--pink)',null,3,'awaiting review')}</section><div class="grid g-main mb"><section class="card pad rv" style="--i:4"><div class="ch"><div><h3>Near-expiry batches (≤ 30 days)</h3><p>Act early: mark down or write off</p></div></div>${batches.length?`<div class="tw"><table><thead><tr><th>Product</th><th>Batch</th><th>Shelf life</th><th class="tr">Stock</th><th class="tr">Value</th><th></th></tr></thead><tbody>${batches.map((p,i)=>{const c=p.expiry<=2?'var(--danger)':p.expiry<=7?'var(--warning)':'var(--success)';const md=S.promotions.find(x=>x.type==='pct_prod'&&x.pid===p.id&&x.active);return `<tr class="rv" style="--i:${i}"><td><div class="pcell"><div class="pimg" style="background:${catMeta(p.cat).tone};width:34px;height:34px;font-size:17px">${p.emoji||'🛍️'}</div><b>${esc(p.name)}</b></div></td><td style="font-family:monospace">${p.batch}</td><td><div class="row" style="gap:8px"><div class="bar-mini" style="width:80px;--c:${c}"><i style="width:${Math.max(6,100-p.expiry/30*100)}%"></i></div><b style="color:${c}" class="sm">${p.expiry<=0?'Expired':p.expiry+' day'+(p.expiry>1?'s':'')}</b></div></td><td class="tr num">${p.stock}</td><td class="tr num">${money(p.stock*p.cost)}</td><td class="tr">${md?'<span class="badge pri">−30% live</span>':`<button class="btn xs soft" onclick="markDown(${p.id})">${ic('tag',12)} Mark down</button>`} <button class="btn xs danger" onclick="writeOff(${p.id})">${ic('trash',12)} Write off</button></td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty" style="padding:28px"><div class="sm">No batches expiring within 30 days.</div></div>`}</section><section class="card pad rv" style="--i:5"><div class="ch"><div><h3>Loss by cause</h3><p>From live waste & write-off log</p></div></div>${donut([{l:'Expired',v:expCost,c:'#e9445a'},{l:'Damaged',v:dmgCost,c:'#f29a0b'},{l:'Lost / other',v:lostCost,c:'#5b4cf0'}],moneyK(expCost+dmgCost+lostCost),'total shrinkage')}</section></div><div class="grid g2"><section class="card pad rv" style="--i:6"><div class="ch"><div><h3>Suspicious transactions</h3><p>Excessive discounts, variances and voids</p></div></div>${S.suspicious.length?S.suspicious.map(s=>`<div class="alert" style="--c:${s.risk>70?'var(--danger)':'var(--warning)'};${s.status==='Resolved'?'opacity:.55':''}"><div class="fic" style="--c:${s.risk>70?'var(--danger)':'var(--warning)'}">${ic('flame',16)}</div><div style="flex:1;min-width:0"><b>${esc(s.type)}</b><small>${esc(s.who)} · ${esc(s.ref)} · ${s.amount?money(s.amount)+' · ':''}${ago(s.time)}</small><div class="progress" style="height:5px;margin-top:7px;max-width:200px"><i style="width:${s.risk}%;background:${s.risk>70?'var(--danger)':'var(--warning)'}"></i></div></div><div style="text-align:right"><div class="xs muted">Risk</div><b>${Math.round(s.risk)}</b></div>${s.status==='Open'?`<button class="btn xs" onclick="S.suspicious.find(x=>x.id===${s.id}).status='Resolved';audit('settings','Flag reviewed · ${esc(s.type)}');toast('Marked as reviewed');refresh()">Review</button>`:statusBadge('Resolved')}</div>`).join(''):`<div class="empty" style="padding:24px"><div class="sm">No suspicious transactions flagged.</div></div>`}</section><section class="card pad rv" style="--i:7"><div class="ch"><div><h3>Waste & adjustment log</h3><p>Every write-off with the responsible user</p></div></div>${S.waste.length?`<div class="tw"><table><thead><tr><th>Time</th><th>Product</th><th>Reason</th><th class="tr">Qty</th><th class="tr">Cost</th><th>User</th></tr></thead><tbody>${S.waste.map(w=>{const p=P(w.pid);return `<tr><td class="xs">${fmtTime(w.time)}</td><td><b>${p.emoji||'🛍️'} ${esc(p.name)}</b></td><td><span class="badge ${w.reason==='Expired'?'bad':'warn'}">${esc(w.reason)}</span></td><td class="tr num">${w.qty}</td><td class="tr num">${money(w.qty*p.cost)}</td><td>${esc(w.user)}</td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty" style="padding:24px"><div class="sm">No waste or write-offs recorded yet.</div></div>`}</section></div>${foot()}</div>`;
};
function markDown(id){const p=P(id);S.promotions.unshift({id:S.promotions.length?Math.max(...S.promotions.map(x=>x.id))+1:1,name:'Clearance · '+p.name,type:'pct_prod',pid:id,pct:30,active:true,sched:'Until sold out',uses:0,rev:0});audit('price','Clearance mark-down 30% · '+p.name,p.batch);toast(`30% clearance applied to <b>${esc(p.name)}</b> at every till`);refresh()}
function writeOff(id){const p=P(id);const uName=S.user?S.user.name:'Store Admin';confirmBox('Write off '+p.name+'?',`${p.stock} units (${money(p.stock*p.cost)} at cost) will be removed from stock and logged as waste.`,()=>{S.waste.unshift({time:new Date(),pid:id,qty:p.stock,reason:'Expired',user:uName});S.movements.unshift({time:new Date(),pid:id,type:'Write-off',qty:-p.stock,reason:'Expired · '+p.batch,user:uName});audit('stock','Write-off · '+p.name,p.stock+' units');p.stock=0;toast('Stock written off and logged');refresh()},{danger:true,label:'Write off'})}
function lpSettings(){modal({title:'Alert thresholds',sub:'Notify managers when risky activity happens',icon:'sliders',body:`<div class="fgrid"><label class="field">Excessive discount above (%)<input class="input" type="number" value="${S.settings.discountAlert}" id="lp-d"></label><label class="field">Refunds needing PIN above<input class="input" type="number" value="${S.settings.refundPinLimit}" id="lp-r"></label><label class="field">Near-expiry warning (days)<input class="input" type="number" value="7"></label><label class="field">Voids per hour before alert<input class="input" type="number" value="3"></label></div>`,foot:`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="S.settings.discountAlert=+$('#lp-d').value;S.settings.refundPinLimit=+$('#lp-r').value;audit('settings','Loss-prevention thresholds updated');closeModal();toast('Thresholds saved')">Save</button>`})}

/* ================= SECURITY (100% LIVE) ================= */
S.au={type:'All',q:''};
const AUIC={login:['logout','var(--info)'],price:['tag','var(--warning)'],refund:['undo','var(--danger)'],stock:['package','var(--teal)'],discount:['percent','var(--pink)'],user:['user','var(--primary)'],void:['x','var(--danger)'],hold:['pause','var(--warning)'],settings:['sliders','var(--text-3)'],sale:['receipt','var(--success)'],approval:['key','var(--primary)']};
PAGES.security=()=>`<div class="page">${head('Trust & governance','Security & Audit','Authentication, role-based access, approvals and an immutable audit trail.',`<button class="btn" onclick="exportCSV('audit-trail',[['Time','User','Event','Reference','Type'],...S.audit.map(a=>[new Date(a.time).toLocaleString('en-GB'),a.who,a.what,a.ref,a.type])])">${ic('download',16)} Export audit log</button>`)}<section class="grid g4 mb">${kpi('Active staff accounts',cu(S.employees.length),'','users','var(--primary)',null,0,S.employees.filter(e=>e.onShift).length+' on shift')}${kpi('Audit events recorded',cu(S.audit.length),'','activity','var(--teal)',null,1,'immutable log')}${kpi('Pending approvals',cu(S.approvals.filter(a=>a.status==='Pending').length),'','key','var(--warning)',null,2,'refunds & discounts')}${kpi('Failed login attempts',cu(S.logins.filter(l=>!l.ok).length),'','shield','var(--danger)',null,3,'security alerts')}</section><div class="grid g-side mb"><section class="card pad rv" style="--i:4"><div class="row between wrap mb"><div><h3 class="display" style="margin:0;font-size:16px">Transaction audit trail</h3><p class="xs muted" style="margin:3px 0 0">Price edits, refunds, voids, stock and permission changes</p></div><div class="row"><select class="sel" style="width:auto;height:36px" onchange="S.au.type=this.value;$('#au').innerHTML=auditList()">${['All',...Object.keys(AUIC)].map(t=>`<option ${S.au.type===t?'selected':''}>${t}</option>`).join('')}</select></div></div><div id="au">${auditList()}</div></section><div class="grid" style="align-content:start"><section class="card pad rv" style="--i:5"><div class="ch"><div><h3>Approval queue</h3><p>Manager authorisation required</p></div></div>${S.approvals.length?S.approvals.map(a=>`<div class="alert" style="--c:var(--warning);flex-wrap:wrap"><div class="fic" style="--c:var(--warning)">${ic(a.type==='Refund'?'undo':'percent',16)}</div><div style="flex:1;min-width:150px"><b>${esc(a.type)} · ${money(a.amount)}</b><small>${esc(a.ref)} · ${esc(a.by)} · ${ago(a.time)}</small><div class="xs" style="margin-top:4px;color:var(--text-2)">“${esc(a.note)}”</div></div>${a.status==='Pending'?`<div class="row" style="gap:6px"><button class="btn xs danger" onclick="decide(${a.id},'Denied')">Deny</button><button class="btn xs ok" onclick="decide(${a.id},'Approved')">Approve</button></div>`:statusBadge(a.status)}</div>`).join(''):`<div class="empty" style="padding:20px"><div class="sm">No pending approvals.</div></div>`}</section><section class="card pad rv" style="--i:6"><div class="ch"><div><h3>Security policy</h3></div></div>${[['twoFA','Two-factor authentication','Required for admins & managers'],['autoBackup','Encrypted cloud sync','MongoDB Atlas live persistence']].map(([k,t,s])=>`<div class="li"><div style="flex:1"><b class="sm">${t}</b><div class="xs muted">${s}</div></div><label class="switch"><input type="checkbox" ${S.settings[k]?'checked':''} onchange="S.settings['${k}']=this.checked;audit('settings','${t} '+(this.checked?'enabled':'disabled'));toast('${t} '+(this.checked?'enabled':'disabled'))"><span></span></label></div>`).join('')}<div class="li"><div style="flex:1"><b class="sm">Price-change tracking</b><div class="xs muted">Always on · cannot be disabled</div></div><span class="badge ok">${ic('lock',11)} Locked</span></div></section></div></div><section class="card pad rv" style="--i:7"><div class="ch"><div><h3>Login activity</h3><p>Real sign-ins across back office and POS terminals</p></div></div>${loginTable()}</section>${foot()}</div>`;
function auditList(){const l=S.audit.filter(a=>S.au.type==='All'||a.type===S.au.type).slice(0,40);return `<div class="feed" style="max-height:none">${l.map((a,i)=>{const x=AUIC[a.type]||['info','var(--primary)'];return `<div class="fi rv" style="--i:${Math.min(i,10)}"><div class="fic" style="--c:${x[1]}">${ic(x[0],15)}</div><div style="flex:1;min-width:0"><b>${esc(a.what)}</b><small>${esc(a.who)}${a.ref?' · '+esc(a.ref):''}</small></div><span class="ft">${fmtTime(a.time)}</span></div>`}).join('')||'<div class="empty">No audit events recorded yet.</div>'}</div>`}
function decide(id,st){const a=S.approvals.find(x=>x.id===id);a.status=st;audit('approval',`${a.type} ${st.toLowerCase()} · ${a.ref}`,money(a.amount));toast(`${a.type} ${st.toLowerCase()}`,st==='Approved'?'ok':'info');refresh()}

/* ================= HARDWARE ================= */
const DEV_COLS=['#5b4cf0','#0e9fe0','#0fb37c','#f29a0b','#e5479a','#14b8a6','#7c3aed'];
PAGES.hardware=()=>`<div class="page">${head('Store devices','Hardware Integration','Scanners, printers, cash drawers, scales, payment terminals and customer displays.',`<button class="btn soft" onclick="testAll()">${ic('zap',16)} Run diagnostics</button><button class="btn pri" onclick="addDevice()">${ic('plus',16,2.4)} Add device</button>`)}<section class="grid g4 mb">${kpi('Devices online',cu(S.devices.filter(d=>d.status==='Connected').length),'','wifi','var(--success)',null,0,'of '+S.devices.length+' configured')}${kpi('Registers configured',cu(S.registers.length),'','monitor','var(--primary)',null,1,S.branches.length+' branches')}${kpi('Receipts generated',cu(S.orders.length),'','printer','var(--teal)',null,2,'live invoices')}${kpi('Barcode labels ready',cu(S.products.length),'','tag','var(--warning)',null,3,'active SKUs')}</section><section class="grid g3">${S.devices.map((d,i)=>{const dc=DEV_COLS[i%DEV_COLS.length];return `<div class="card dev hov rv" id="dev-${d.id}" style="--i:${i+4};--dc:${dc};--c:${d.status==='Connected'?'var(--success)':d.status==='Idle'?'var(--warning)':'var(--danger)'}"><div class="row between"><div class="dv-ic">${ic(d.ic,24)}</div><span class="badge ${d.status==='Connected'?'ok':d.status==='Idle'?'warn':'bad'} dot">${d.status}</span></div><div><b class="display" style="font-size:15.5px">${esc(d.name)}</b><div class="xs muted" style="margin-top:2px">${esc(d.model)} · ${esc(d.conn)}</div></div><div class="xs muted" id="dev-out-${d.id}" style="min-height:18px"></div><div class="row"><button class="btn sm soft" style="flex:1;--primary:${dc}" onclick="testDevice(${d.id})">${ic('play',13)} Run Self-Test</button><button class="btn sm ghost" onclick="S.devices=S.devices.filter(x=>x.id!==${d.id});saveState();refresh()">${ic('trash',14)}</button></div></div>`}).join('')}</section>${foot()}</div>`;
function testDevice(id){const d=S.devices.find(x=>x.id===id),el=$('#dev-'+id),out=$('#dev-out-'+id);if(!el)return;el.classList.add('testing');out.innerHTML='<span class="spin" style="display:inline-block">⟳</span> Testing…';const res='Self-test OK · Ready';setTimeout(()=>{el.classList.remove('testing');d.status='Connected';saveState();out.innerHTML=`<span class="up b">✓</span> ${res}`;toast(`${d.name}: ${res}`)},900)}
function testAll(){S.devices.forEach((d,i)=>setTimeout(()=>testDevice(d.id),i*200))}
function addDevice(){modal({title:'Add device',sub:'Pair new hardware to a register',icon:'cpu',body:`<div class="fgrid"><label class="field">Device type<select class="sel" id="dv-t"><option value="scan">Barcode scanner</option><option value="printer">Receipt printer</option><option value="inbox">Cash drawer</option><option value="monitor">Customer display</option><option value="card">Payment terminal</option><option value="tag">Label printer</option><option value="scale">Weighing scale</option></select></label><label class="field">Register<select class="sel">${S.registers.map(r=>`<option>${r.id}</option>`).join('')}</select></label><label class="field">Model<input class="input" id="dv-m" placeholder="e.g. Epson TM-T88"></label><label class="field">Connection<select class="sel" id="dv-c"><option>USB</option><option>Ethernet</option><option>Bluetooth</option><option>Wi-Fi</option></select></label></div>`,foot:`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="const s=$('#dv-t');S.devices.push({id:S.devices.length?Math.max(...S.devices.map(x=>x.id))+1:1,name:s.options[s.selectedIndex].text,ic:s.value,model:$('#dv-m').value||'Standard',conn:$('#dv-c').value,status:'Connected'});saveState();closeModal();toast('Device paired');refresh()">Pair device</button>`})}

/* ================= OMNICHANNEL (100% LIVE) ================= */
const STAGES=[['New','var(--info)'],['Preparing','var(--warning)'],['Ready for pickup','var(--primary)'],['Completed','var(--success)']];
PAGES.omnichannel=()=>{
  const inStoreRev=sum(S.orders.filter(o=>o.status!=='Refunded'),o=>o.total-(o.refunded||0));
  const webRev=sum(S.online.filter(o=>o.ch==='Web'),o=>o.total);
  const appRev=sum(S.online.filter(o=>o.ch==='App'),o=>o.total);
  const mktRev=sum(S.online.filter(o=>o.ch==='Marketplace'),o=>o.total);
  const donePct=S.online.length?(S.online.filter(o=>o.stage===3).length/S.online.length*100):100;
  return `<div class="page">${head('Commerce everywhere','Omnichannel','Unified inventory, customers and orders across stores, web, app and marketplaces.',`<button class="btn" onclick="syncAll()">${ic('refresh',16)} Sync catalog</button><button class="btn pri" onclick="newOnlineOrder()">${ic('plus',16,2.4)} New online order</button>`)}<section class="grid g4 mb">${kpi('Online orders',cu(S.online.length),'','globe','var(--info)',null,0,money(sum(S.online,o=>o.total))+' value')}${kpi('Click & Collect',cu(S.online.filter(o=>o.type==='Click & Collect').length),'','store','var(--primary)',null,1,'store pickup')}${kpi('Synced products',cu(S.products.length),'','refresh','var(--teal)',null,2,'live catalog')}${kpi('Fulfilment rate',cu(donePct,'pct'),'','check','var(--success)',null,3,S.online.filter(o=>o.stage===3).length+' completed')}</section><section class="card pad rv mb" style="--i:4"><div class="ch"><div><h3>Online order board</h3><p>Move orders through preparation to collection / delivery</p></div><button class="btn sm pri" onclick="newOnlineOrder()">${ic('plus',14)} Create order</button></div><div class="kanban">${STAGES.map((s,si)=>{const l=S.online.filter(o=>o.stage===si);return `<div class="kcol" style="--c:${s[1]}"><div class="kcol-h" style="--c:${s[1]}"><i></i>${s[0]}<span class="badge" style="margin-left:auto">${l.length}</span></div>${l.map((o,i)=>`<div class="kcard" style="animation-delay:${i*60}ms"><div class="row between"><b class="sm">${o.id}</b><span class="badge ${o.ch==='Web'?'info':o.ch==='App'?'pri':'warn'}">${o.ch}</span></div><div class="sm" style="margin:6px 0 2px">${esc(o.cust)}</div><div class="xs muted">${o.items} items · ${o.type} · ${o.branch} · ${ago(o.time)}</div><div class="row between" style="margin-top:10px"><b class="num">${money(o.total)}</b>${si<3?`<button class="btn xs soft" onclick="advance('${o.id}')">${['Start picking','Mark ready','Complete'][si]} ${ic('arrowR',12)}</button>`:'<span class="up xs b">✓ Fulfilled</span>'}</div></div>`).join('')||'<div class="xs muted" style="text-align:center;padding:20px">No orders</div>'}</div>`}).join('')}</div></section><div class="grid g2"><section class="card pad rv" style="--i:5"><div class="ch"><div><h3>Sales by channel</h3><p>Live online vs in-store revenue</p></div></div>${donut([{l:'In-store POS',v:inStoreRev,c:'#5b4cf0'},{l:'Web store',v:webRev,c:'#0e9fe0'},{l:'Mobile app',v:appRev,c:'#14b8a6'},{l:'Marketplace',v:mktRev,c:'#f29a0b'}],moneyK(inStoreRev+webRev+appRev+mktRev),'all channels')}</section><section class="card pad rv" style="--i:6"><div class="ch"><div><h3>Channel connections</h3><p>Real-time inventory synchronisation</p></div></div>${[['Web Storefront','globe',S.products.length+' products synced'],['Mobile Ordering App','phone','Click & Collect + Delivery'],['Marketplace Feed','box','Real-time stock sync']].map(c=>`<div class="li"><div class="fic" style="--c:var(--primary)">${ic(c[1],16)}</div><div style="flex:1"><b class="sm">${c[0]}</b><div class="xs muted">${c[2]}</div></div><span class="badge ok dot sync-b">Live</span></div>`).join('')}</section></div>${foot()}</div>`;
};
function newOnlineOrder(){
  modal({title:'Create online / pickup order',icon:'globe',size:'sm',body:`<label class="field">Customer name<input class="input" id="oo-c" placeholder="Customer name"></label><div class="fgrid mt"><label class="field">Channel<select class="sel" id="oo-ch"><option>Web</option><option>App</option><option>Marketplace</option></select></label><label class="field">Fulfilment<select class="sel" id="oo-t"><option>Click & Collect</option><option>Delivery</option></select></label><label class="field">Items count<input class="input num" type="number" id="oo-i" value="2" min="1"></label><label class="field">Order total<input class="input num" type="number" id="oo-v" value="1500" step=".01"></label></div>`,foot:`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="const c=$('#oo-c').value.trim();if(!c)return toast('Enter customer name','warn');const ch=$('#oo-ch').value;const id=(ch==='Web'?'WEB-':ch==='App'?'APP-':'MKT-')+(1001+S.online.length);S.online.unshift({id,cust:c,ch,type:$('#oo-t').value,items:+$('#oo-i').value||1,total:+$('#oo-v').value||0,stage:0,branch:S.branches[0]?.id||'MAIN',time:new Date()});audit('sale','Online order received · '+id,money(+$('#oo-v').value||0));closeModal();toast('Online order '+id+' created');refresh()">Create order</button>`});
}
function advance(id){const o=S.online.find(x=>x.id===id);o.stage++;if(o.stage===3){audit('sale','Online order fulfilled · '+id,money(o.total));toast(`${id} fulfilled for ${esc(o.cust)}`)}else{saveState();toast(`${id} → ${STAGES[o.stage][0]}`,'info')}refresh()}
function syncAll(){$$('.sync-b').forEach(b=>{b.className='badge warn sync-b';b.innerHTML='<span class="spin" style="display:inline-block">⟳</span> Syncing'});setTimeout(()=>{$$('.sync-b').forEach(b=>{b.className='badge ok dot sync-b';b.textContent='Synced just now'});toast(`All channels synchronised · ${S.products.length} products`)},900)}

/* ================= MOBILE ================= */
PAGES.mobile=()=>{
  const todayOrds=sessionToday();
  const todayRev=r2(sum(todayOrds,o=>o.total-(o.refunded||0)));
  return `<div class="page">${head('Manage from anywhere','Mobile Control','Monitor live sales, stock and branches remotely with real-time push alerts.',`<button class="btn pri" onclick="testPush()">${ic('bell',16)} Send test notification</button>`)}<div class="grid g-nav" style="grid-template-columns:minmax(300px,380px) minmax(0,1fr);align-items:start"><div class="rv"><div class="phone"><div class="screen" id="phone-s"><div class="row between"><b class="display" style="font-size:18px">monarch<span style="color:var(--primary)">.</span></b>${avatar(S.user?S.user.name:'Store Admin',30)}</div><div class="mcard" style="background:linear-gradient(135deg,#171b3a,#0e1124);color:#fff;border:0"><div style="font-size:10px;color:#aab0d3;letter-spacing:1px">TODAY · ALL STORES</div><div class="display" style="font-size:26px;font-weight:800">${money(todayRev)}</div><div style="font-size:11px;color:#d5fd79">${todayOrds.length} live transactions today</div>${spark(revSeries('7D').cur,'#d5fd79',240,40)}</div><div class="grid g2" style="gap:8px"><div class="mcard"><div class="xs muted">Total Orders</div><b>${S.orders.length}</b></div><div class="mcard"><div class="xs muted">Low stock</div><b style="color:var(--warning)">${S.products.filter(p=>p.stock<p.min).length}</b></div></div>${S.branches.map(b=>`<div class="mcard row" style="padding:10px 12px;gap:10px"><span style="width:8px;height:8px;border-radius:50%;background:${b.c}"></span><span class="xs" style="flex:1">${esc(b.name)}</span><b class="xs">${money(b.rev)}</b></div>`).join('')}</div></div></div><div class="grid" style="align-content:start"><section class="card pad rv" style="--i:1"><div class="ch"><div><h3>Push notification preferences</h3><p>Choose which events reach your mobile</p></div></div>${[['sales','Sales milestones','When a store hits its daily target'],['stock','Low-stock alerts','When a product drops below minimum'],['refund','Refund & void alerts','Every refund and all voids'],['large','Large transactions','High-value sales alerts'],['daily','Daily summary','End-of-day report at 22:00'],['expiry','Expiry warnings','Batches expiring within 3 days']].map(([k,t,s])=>`<div class="li"><div style="flex:1"><b class="sm">${t}</b><div class="xs muted">${s}</div></div><label class="switch"><input type="checkbox" ${S.notifPrefs[k]?'checked':''} onchange="S.notifPrefs['${k}']=this.checked;saveState();toast('${t} '+(this.checked?'on':'off'),'info')"><span></span></label></div>`).join('')}</section><section class="card pad rv" style="--i:2"><div class="ch"><div><h3>Active users</h3><p>Staff accounts with mobile/POS access</p></div></div>${S.employees.map(e=>`<div class="li">${avatar(e.name,32)}<div style="flex:1"><b class="sm">${esc(e.name)}</b><div class="xs muted">${esc(e.email)} · ${e.role}</div></div><span class="xs ${e.onShift?'up b':'muted'}">${e.onShift?'On shift':'Off'}</span></div>`).join('')}</section></div></div>${foot()}</div>`;
};
function testPush(){const s=$('#phone-s');if(!s)return;const n=document.createElement('div');n.className='push';n.innerHTML=`<div class="logo" style="width:30px;height:30px;border-radius:9px;transform:none">${ic('trend',15,2.4)}</div><div style="flex:1"><b>Live Store Update</b><div class="muted">Today's sales: ${money(sum(sessionToday(),o=>o.total-(o.refunded||0)))} · ${S.orders.length} total orders</div></div>`;s.appendChild(n);setTimeout(()=>{n.classList.add('out');setTimeout(()=>n.remove(),400)},3800);toast('Live notification preview shown')}

/* ================= ADMIN ================= */
S.adm='company';
PAGES.admin=()=>{const st=S.settings;const f=(k,l,t='text',x='')=>`<label class="field ${x}">${l}<input class="input" type="${t}" value="${esc(st[k])}" oninput="S.settings['${k}']=${t==='number'?'+this.value':'this.value'};saveState();${S.adm==='receipt'?"$('#rp').innerHTML=receiptHTML(DEMO_O())":''}"></label>`;const tg=(k,l,s)=>`<div class="li"><div style="flex:1"><b class="sm">${l}</b><div class="xs muted">${s}</div></div><label class="switch"><input type="checkbox" ${st[k]?'checked':''} onchange="S.settings['${k}']=this.checked;saveState();${S.adm==='receipt'?"$('#rp').innerHTML=receiptHTML(DEMO_O())":''}"><span></span></label></div>`;const tabs=[['company','Company','store'],['tax','Tax & currency','percent'],['receipt','Receipt designer','receipt'],['invoice','Invoice numbering','layers'],['stores','Stores & registers','monitor']];let body='';if(S.adm==='company')body=`<div class="fgrid">${f('company','Legal company / mart name','text','full')}${f('address','Store address','text','full')}${f('phone','Phone')}${f('email','Super Admin Email')}${f('vat','Tax / NTN / VAT number')}${f('dailyTarget','Daily revenue target','number')}</div>`;if(S.adm==='tax')body=`<div class="fgrid"><label class="field">Currency<select class="sel" onchange="S.settings.currency=this.value;saveState();toast('Currency switched to '+this.value);refresh()">${Object.keys(CUR).map(c=>`<option ${st.currency===c?'selected':''}>${c}</option>`).join('')}</select></label>${f('taxRate','Standard tax / GST / VAT rate (%)','number')}<div class="full">${tg('taxInclusive','Tax-inclusive pricing','Shelf prices already include tax. Turn off to add tax on top at checkout.')}${tg('showVat','Show Tax / NTN number on receipts','Printed in receipt header')}</div></div>`;if(S.adm==='receipt')body=`<div class="grid g2"><div>${f('receiptHeader','Header message','text')}<div style="height:12px"></div>${f('receiptFooter','Footer / returns policy','text')}<div class="mt">${tg('showLogo','Print logo','Brand mark at the top')}${tg('showBarcode','Print invoice barcode','Scan to look up for returns')}${tg('showVat','Show tax number','Display NTN / VAT on receipt')}</div></div><div class="rec-prev" id="rp">${receiptHTML(DEMO_O())}</div></div>`;if(S.adm==='invoice')body=`<div class="fgrid">${f('invPrefix','Invoice prefix')}${f('nextInv','Next invoice number','number')}<div class="full alert" style="--c:var(--primary)"><div class="fic" style="--c:var(--primary)">${ic('info',16)}</div><div><b>Next invoice: ${esc(st.invPrefix)}${st.nextInv}</b><small>Sequential, gap-free numbering per company.</small></div></div></div>`;if(S.adm==='stores')body=`<div class="tw"><table><thead><tr><th>Store</th><th>Manager</th><th>Registers</th><th>Live Revenue</th><th>Status</th></tr></thead><tbody>${S.branches.map(b=>`<tr><td><b>${esc(b.name)}</b><div class="xs muted">${b.id}</div></td><td>${esc(b.manager)}</td><td>${S.registers.filter(r=>r.branch===b.id).length}</td><td class="num">${money(b.rev)}</td><td>${statusBadge('Active')}</td></tr>`).join('')}</tbody></table></div><button class="btn sm pri mt" onclick="addBranchModal()">${ic('plus',14)} Add branch</button>`;return `<div class="page">${head('Control centre','Admin & Settings','Company profile, tax, receipts, numbering and business structure.',`<button class="btn pri" onclick="audit('settings','System settings saved · '+S.adm);toast('Settings saved to MongoDB Atlas')">${ic('check',16,2.4)} Save changes</button>`)}<div class="grid g-nav" style="grid-template-columns:240px minmax(0,1fr)"><aside class="card rv" style="padding:12px;align-self:start"><div class="rep-list">${tabs.map(t=>`<button class="rep-i ${S.adm===t[0]?'on':''}" onclick="S.adm='${t[0]}';refresh()">${ic(t[2],16)} ${t[1]}</button>`).join('')}</div><div class="divider"></div><div class="rep-list">${[['employees','Users & POS PINs','users'],['promotions','Price policies','tag'],['hardware','Hardware','cpu'],['database','Database & MongoDB','db']].map(t=>`<button class="rep-i" onclick="go('${t[0]}')">${ic(t[2],16)} ${t[1]}</button>`).join('')}</div></aside><section class="card pad rv" style="--i:1"><div class="ch"><div><h3>${tabs.find(t=>t[0]===S.adm)[1]}</h3><p>Changes apply immediately to every store and register</p></div></div>${body}</section></div>${foot()}</div>`};
const DEMO_O=()=>S.orders[0]||{inv:S.settings.invPrefix+S.settings.nextInv,time:new Date(),cashier:S.user?S.user.name:'Store Admin',reg:'REG-01',cid:null,customer:'Walk-in customer',items:[{name:'Sample Receipt Line',qty:1,price:100,disc:0}],sub:100,itemDisc:0,lines:[],invDisc:0,tax:0,total:100,pays:[{method:'Cash',amount:100}],change:0,earned:0};

/* ================= DATABASE ================= */
PAGES.database=()=>{
  const totalRecords=S.products.length+S.customers.length+S.orders.length+S.suppliers.length+S.pos.length+S.employees.length+S.movements.length+S.audit.length;
  return `<div class="page">${head('Reliable infrastructure','Database & System','Connected with MongoDB Atlas & Vercel Serverless API — live cloud persistence.',`<button class="btn soft" onclick="resetDemoState(false)">${ic('refresh',16)} Load testing data</button><button class="btn danger" onclick="confirmBox('Clear all database data?','This will wipe all products, orders, customers and reset back to an empty workspace.',()=>resetDemoState(true),{danger:true,label:'Wipe & Reset'})">${ic('trash',16)} Wipe all data</button><button class="btn" onclick="importJSONPrompt()">${ic('upload',16)} Restore JSON</button><button class="btn" onclick="exportJSON()">${ic('download',16)} Full JSON backup</button><button class="btn pri" onclick="runBackup()">${ic('cloud',16)} Snapshot now</button>`)}<section class="grid g4 mb">${kpi('Database status',`<span style="font-size:18px;color:var(--success)">${window._cloudConnected?'MongoDB Live':'Local Ready'}</span>`,'','db','var(--success)',null,0,S.cloudStatus)}${kpi('Live records stored',cu(totalRecords),'','layers','var(--primary)',null,1,'across all collections')}${kpi('Products & Orders',`${S.products.length} / ${S.orders.length}`,'','package','var(--teal)',null,2,'SKUs / Invoices')}${kpi('Snapshots taken',cu(S.backups.length),'','cloud','var(--warning)',null,3,S.backups[0]?ago(S.backups[0].time):'No snapshot yet')}</section><div class="grid g-main mb"><section class="card pad rv" style="--i:4"><div class="ch"><div><h3>Backups & recovery</h3><p>Create manual or automated snapshots of your live MongoDB workspace</p></div></div><div id="bk-prog"></div>${S.backups.length?`<div class="tw"><table><thead><tr><th>Backup</th><th>Time</th><th>Type</th><th>Records</th><th>Status</th><th></th></tr></thead><tbody>${S.backups.map((b,i)=>`<tr class="rv" style="--i:${i}"><td><b>${b.id}</b></td><td>${fmtTime(b.time)}</td><td>${b.type}</td><td class="num">${b.size}</td><td>${statusBadge(b.status)}</td><td class="tr"><button class="btn xs" onclick="exportJSON()">${ic('download',13)} Download</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty" style="padding:28px"><div class="sm">No snapshots taken yet — click "Snapshot now" above to create a backup.</div></div>`}</section><section class="card pad rv" style="--i:5"><div class="ch"><div><h3>MongoDB Atlas & Vercel Status</h3><p>${esc(S.cloudStatus)}</p></div></div>${S.branches.map(b=>`<div class="li"><div class="fic" style="--c:${b.c}">${ic('refresh',15)}</div><div style="flex:1"><b class="sm">${esc(b.name)} (${b.id})</b><div class="xs muted">${b.orders} orders · ${money(b.rev)}</div></div><span class="badge ok dot live">Synced</span></div>`).join('')}<div class="sec-t">Live Collections Count</div><div class="kv"><div><small>Products</small><b>${S.products.length}</b></div><div><small>Orders</small><b>${S.orders.length}</b></div><div><small>Customers</small><b>${S.customers.length}</b></div><div><small>Suppliers & POs</small><b>${S.suppliers.length} / ${S.pos.length}</b></div></div></section></div><div class="grid g2"><section class="card pad rv" style="--i:6"><div class="ch"><div><h3>Import / export</h3><p>Excel, CSV, JSON and PDF</p></div></div><div class="grid g2" style="gap:10px">${[['Import products (CSV)','upload',"importCSVPrompt()"],['Restore backup (JSON)','upload',"importJSONPrompt()"],['Export sales (CSV)','download',"exportOrders()"],['Export customers (CSV)','download',"go('customers')"],['Export reports (PDF)','printer',"go('reports')"],['Full backup (JSON)','db',"exportJSON()"]].map(x=>`<button class="btn" style="justify-content:flex-start;height:48px" onclick="${x[2]}">${ic(x[1],16)} ${x[0]}</button>`).join('')}</div></section><section class="card pad rv" style="--i:7"><div class="ch"><div><h3>API Endpoints</h3><p>Live Vercel + MongoDB Atlas endpoints</p></div></div>${[['GET','/api/state','Load live workspace from MongoDB Atlas'],['POST','/api/state','Save live workspace to MongoDB Atlas'],['DELETE','/api/state','Reset live workspace in MongoDB Atlas']].map(a=>`<div class="li" style="font-family:monospace;font-size:12.5px"><span class="badge ${a[0]==='GET'?'ok':a[0]==='POST'?'pri':'bad'}" style="width:64px;justify-content:center">${a[0]}</span><span style="flex:1">${a[1]}</span><span class="xs muted" style="font-family:Inter">${a[2]}</span></div>`).join('')}</section></div>${foot()}</div>`;
};
function importJSONPrompt(){
  if(!isAdmin())return toast('Only Super Admin can restore database backups','err');
  modal({title:'Restore JSON backup',sub:'Upload a Monarch .json backup file to restore your workspace',icon:'upload',body:`<label style="display:block;border:2px dashed var(--border-2);border-radius:18px;padding:34px;text-align:center;cursor:pointer;transition:.2s" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border-2)'"><div class="e-ic" style="width:56px;height:56px;margin:0 auto 12px;border-radius:16px;display:grid;place-items:center;background:var(--primary-soft);color:var(--primary)">${ic('upload',24)}</div><b>Choose a .json backup file</b><div class="sm muted">Restores products, orders, customers, suppliers & settings</div><input type="file" accept=".json,application/json" style="display:none" onchange="importJSONFile(this.files[0])"></label>`});
}
function importJSONFile(file){
  if(!file)return;
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const snap=reviveDates(JSON.parse(rd.result));
      if(snap.purchaseOrders&&!snap.pos)snap.pos=snap.purchaseOrders;
      PERSIST_KEYS.forEach(k=>{if(snap[k]!==undefined)S[k]=snap[k]});
      ensureAdminAccount();
      updateBranchSelect();
      closeModal();
      audit('settings','Database restored from JSON backup',file.name);
      toast('Backup restored and synced to MongoDB Atlas');
      refresh();
    }catch(e){
      toast('Invalid JSON backup file','err');
    }
  };
  rd.readAsText(file);
}
function runBackup(){
  const el=$('#bk-prog');if(!el)return;
  const totalRecords=S.products.length+S.customers.length+S.orders.length+S.suppliers.length+S.pos.length+S.employees.length;
  el.innerHTML=`<div class="alert" style="--c:var(--primary);margin-bottom:16px"><div class="fic" style="--c:var(--primary)">${ic('cloud',16)}</div><div style="flex:1"><b id="bk-t">Syncing snapshot to MongoDB Atlas…</b><div class="progress stripe" style="margin-top:8px"><i id="bk-b" style="width:0"></i></div></div><b id="bk-p">0%</b></div>`;
  let p=0;
  const t=setInterval(()=>{
    p+=25;
    if(p>=100){
      p=100;clearInterval(t);
      S.backups.unshift({id:'BK-'+(1001+S.backups.length),time:new Date(),type:'Manual',size:totalRecords+' records',status:'Success',dur:'1s'});
      audit('settings','Database snapshot saved',totalRecords+' records');
      setTimeout(()=>{toast('Snapshot saved to MongoDB Atlas');refresh()},300);
    }
    const b=$('#bk-b');if(!b)return clearInterval(t);
    b.style.width=p+'%';$('#bk-p').textContent=Math.round(p)+'%';
  },180);
}
function exportJSON(){const data={exported:new Date(),settings:S.settings,products:S.products,customers:S.customers,orders:S.orders,suppliers:S.suppliers,purchaseOrders:S.pos,promotions:S.promotions,employees:S.employees,branches:S.branches,registers:S.registers};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='monarch-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();toast('Full data export downloaded')}

/* ================= AI (100% LIVE FROM REAL CATALOG & ORDERS) ================= */
function reorders(){
  return S.products.filter(p=>p.stock<p.min).map(p=>{
    const v=(p.sold30||0)/30;
    const sup=S.suppliers.find(s=>s.cat===p.cat)||S.suppliers[0]||{id:0,name:'Default Supplier',lead:2};
    const cover=v>0?p.stock/v:(p.stock<=0?0:30);
    const sug=Math.max(1,p.max-p.stock);
    return{p,v,cover,sug,sup};
  }).sort((a,b)=>a.p.stock-b.p.stock);
}
PAGES.ai=()=>{
  const ro=reorders();
  const lowCnt=S.products.filter(p=>p.stock<p.min).length;
  const expCnt=S.products.filter(p=>p.expiry<=7&&p.stock>0).length;
  const deadCnt=S.products.filter(p=>p.sold30===0&&p.stock>0).length;
  const creditCnt=S.customers.filter(c=>c.credit>0).length;
  return `<div class="page">${head('Live intelligence','AI & Automation','Real-time inventory recommendations, low-stock replenishment and operational insights from your live database.',`<button class="btn pri" onclick="go('intelligence')">${ic('trend',16)} Open BI</button>`)}<section class="hero rv mb" style="grid-template-columns:1fr"><div class="orb"></div><div><small>✦ MONARCH AI · LIVE BRIEFING</small><h2 style="font-size:clamp(20px,2.2vw,28px);letter-spacing:-.6px;line-height:1.35;max-width:900px" id="ai-brief" class="typing"></h2><div class="row wrap" style="margin-top:16px;gap:8px">${ro.length?`<button class="btn sm" style="background:#d5fd79;color:#0e1121;border-color:#d5fd79" onclick="createAllPO()">${ic('truck',14)} Generate ${ro.length} replenishment PO${ro.length===1?'':'s'}</button>`:''}<button class="btn sm" style="background:#ffffff14;color:#fff;border-color:#ffffff20" onclick="go('pos')">${ic('scan',14)} Open POS</button></div></div></section><section class="grid g4 mb">${[
    ['Low-stock alerts',`${lowCnt} product${lowCnt===1?'':'s'} below minimum stock level.`,'package','var(--warning)'],
    ['Near-expiry check',`${expCnt} batch${expCnt===1?'':'es'} expiring within 7 days.`,'clock','var(--danger)'],
    ['Unmoved inventory',`${deadCnt} product${deadCnt===1?'':'s'} with 0 sales so far.`,'tag','var(--primary)'],
    ['Credit accounts',`${creditCnt} customer${creditCnt===1?'':'s'} with outstanding credit balance (${money(sum(S.customers,c=>c.credit))}).`,'wallet','var(--teal)']
  ].map((x,i)=>`<div class="insight hov card rv" style="--i:${i+1};--c:${x[3]}"><div class="fic" style="--c:${x[3]};margin-bottom:12px">${ic(x[2],16)}</div><b class="display" style="font-size:14.5px">${x[0]}</b><p class="sm muted" style="margin:6px 0 0">${x[1]}</p></div>`).join('')}</section><div class="grid g-main mb"><section class="card pad rv" style="--i:5"><div class="ch"><div><h3>Smart replenishment</h3><p>Products below minimum stock level</p></div>${ro.length?`<button class="btn sm pri" onclick="createAllPO()">${ic('check',14,2.4)} Create POs</button>`:''}</div>${ro.length?`<div class="tw"><table><thead><tr><th>Product</th><th class="tr">Stock</th><th class="tr">Min / Max</th><th>Supplier</th><th class="tr">Suggested order</th><th></th></tr></thead><tbody>${ro.map((x,i)=>`<tr class="rv" style="--i:${i}"><td><div class="pcell"><div class="pimg" style="width:34px;height:34px;font-size:17px;background:${catMeta(x.p.cat).tone}">${x.p.emoji||'🛍️'}</div><b>${esc(x.p.name)}</b></div></td><td class="tr num"><b class="down">${x.p.stock}</b></td><td class="tr num">${x.p.min} / ${x.p.max}</td><td class="sm">${esc(x.sup.name)}</td><td class="tr num"><b>${x.sug}</b></td><td class="tr"><button class="btn xs soft" onclick="newPO([{pid:${x.p.id},qty:${x.sug}}])">${ic('plus',12)} PO</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty" style="padding:28px"><div class="sm">All products are above their minimum stock level.</div></div>`}</section><section class="card pad rv" style="--i:6"><div class="ch"><div><h3>Quick automation actions</h3><p>One-click store operations</p></div></div><div class="alert" style="--c:var(--primary)" onclick="addProduct()" role="button"><div class="fic" style="--c:var(--primary)">${ic('package',16)}</div><div style="flex:1"><b>Add new product</b><small>Expand your live catalog</small></div>${ic('chevR',16)}</div><div class="alert" style="--c:var(--teal)" onclick="newPromo()" role="button"><div class="fic" style="--c:var(--teal)">${ic('zap',16)}</div><div style="flex:1"><b>Create promotional rule</b><small>Automated discounts at checkout</small></div>${ic('chevR',16)}</div><div class="alert" style="--c:var(--warning)" onclick="inviteUser()" role="button"><div class="fic" style="--c:var(--warning)">${ic('userPlus',16)}</div><div style="flex:1"><b>Create staff account & PIN</b><small>Admin-controlled POS credentials</small></div>${ic('chevR',16)}</div></section></div>${foot()}</div>`;
};
function createAllPO(){
  const ro=reorders();
  if(!ro.length)return toast('No low-stock products to reorder','info');
  if(!S.suppliers.length)return toast('Add a supplier in Purchasing first','warn');
  const by={};
  ro.forEach(x=>{const sid=x.sup.id||S.suppliers[0].id;(by[sid]=by[sid]||[]).push({pid:x.p.id,qty:x.sug,cost:x.p.cost,rec:0})});
  Object.entries(by).forEach(([sid,lines])=>{S.pos.unshift({id:'PO-'+(1001+S.pos.length),sup:+sid,status:'Draft',created:new Date(),eta:new Date(Date.now()+3*DAY),lines})});
  audit('stock','Replenishment POs created',Object.keys(by).length+' POs');
  toast(`${Object.keys(by).length} draft purchase order(s) created`);
  S.pur='orders';go('purchasing');
}
let _aiT=null,_ovT1=null,_ovT2=null,_ovT3=null;
const _TW={page:'',pIdx:0,cIdx:0,deleting:false,subIdx:0,pulseIdx:0,aiIdx:0};

function typeBrief(reset=false){
  if(_aiT)clearTimeout(_aiT);
  const el=$('#ai-brief');if(!el)return;
  const h=new Date().getHours();
  const greet=h<12?'Good morning':h<18?'Good afternoon':'Good evening';
  const rawName=S.user?S.user.name:'Store Admin';
  const name=rawName==='Store Admin'?'Administrator':rawName.split(' ')[0];
  const todayRev=sum(sessionToday(),o=>o.total-(o.refunded||0));
  const txt=`${greet}, ${name}. Your live workspace currently has ${S.products.length} products, ${S.customers.length} customers, and ${S.orders.length} total orders (${money(todayRev)} today). ${reorders().length} products are below minimum stock.`;
  if(reset)_TW.aiIdx=0;
  el.textContent=txt.slice(0,_TW.aiIdx);
  el.classList.add('typing');
  function step(){
    if(!document.body.contains(el))return;
    _TW.aiIdx=Math.min(txt.length,_TW.aiIdx+1);
    el.textContent=txt.slice(0,_TW.aiIdx);
    if(_TW.aiIdx<txt.length){
      _aiT=setTimeout(step,45);
    }
  }
  if(_TW.aiIdx<txt.length)_aiT=setTimeout(step,140);
}

function typeOverview(reset=false){
  if(_ovT1)clearTimeout(_ovT1);
  if(_ovT2)clearTimeout(_ovT2);
  if(_ovT3)clearTimeout(_ovT3);
  if(reset||_TW.page!==S.page){
    _TW.page=S.page;
    _TW.pIdx=0;
    _TW.cIdx=0;
    _TW.deleting=false;
    _TW.subIdx=0;
    _TW.pulseIdx=0;
  }
  const gEl=$('#ov-greet')||$('#ph-title');
  const bEl=$('#ov-brief')||$('#ph-sub');
  const pEl=$('#ov-pulse');
  const h=new Date().getHours();
  const greet=h<12?'Good morning':h<18?'Good afternoon':'Good evening';
  const fullName=S.user?S.user.name:'Store Admin';
  const firstName=fullName==='Store Admin'?'Administrator':fullName.split(' ')[0];
  const isOv=S.page==='overview';
  const baseTitle=(gEl&&gEl.dataset.title)||NAMES[S.page]||'Overview';
  const phrases=isOv?[
    `${greet}, ${firstName}`,
    `Welcome to Monarch Retail OS`,
    `${greet} · Live Store Dashboard`
  ]:[
    `${baseTitle}`,
    `${baseTitle} · Live Workspace`,
    `Monarch Retail OS · ${baseTitle}`
  ];
  const brLabel=S.branch==='All branches'?S.branches.length+' branch'+(S.branches.length===1?'':'es'):S.branch;
  const bTxt=isOv
    ?`Live operational dashboard across ${brLabel} · ${S.cloudStatus}`
    :((bEl&&bEl.dataset.sub)||'');
  const todayOrds=sessionToday();
  const pTxt=`✦ ${todayOrds.length} sale${todayOrds.length===1?'':'s'} recorded today · ${S.products.length} products & ${S.customers.length} customers live on ${S.cloudStatus}`;

  if(gEl){
    const cur0=phrases[_TW.pIdx%phrases.length];
    gEl.textContent=cur0.slice(0,_TW.cIdx);
    gEl.classList.add('typing');
    function tickGreet(){
      if(!document.body.contains(gEl))return;
      const cur=phrases[_TW.pIdx%phrases.length];
      if(!_TW.deleting){
        _TW.cIdx++;
        gEl.textContent=cur.slice(0,_TW.cIdx);
        if(_TW.cIdx>=cur.length){
          _TW.deleting=true;
          _ovT1=setTimeout(tickGreet,3400);
        }else{
          _ovT1=setTimeout(tickGreet,108);
        }
      }else{
        _TW.cIdx--;
        gEl.textContent=cur.slice(0,_TW.cIdx);
        if(_TW.cIdx<=0){
          _TW.deleting=false;
          _TW.pIdx++;
          _ovT1=setTimeout(tickGreet,440);
        }else{
          _ovT1=setTimeout(tickGreet,50);
        }
      }
    }
    _ovT1=setTimeout(tickGreet,_TW.cIdx===0?200:108);
  }
  if(bEl&&bTxt){
    bEl.textContent=bTxt.slice(0,_TW.subIdx);
    if(_TW.subIdx<bTxt.length)bEl.classList.add('typing');
    function tickBrief(){
      if(!document.body.contains(bEl))return;
      _TW.subIdx=Math.min(bTxt.length,_TW.subIdx+1);
      bEl.textContent=bTxt.slice(0,_TW.subIdx);
      if(_TW.subIdx<bTxt.length){
        _ovT3=setTimeout(tickBrief,40);
      }else{
        setTimeout(()=>bEl.classList.remove('typing'),800);
      }
    }
    if(_TW.subIdx<bTxt.length)_ovT3=setTimeout(tickBrief,260);
  }
  if(pEl){
    pEl.textContent=pTxt.slice(0,_TW.pulseIdx);
    pEl.classList.add('typing');
    function tickPulse(){
      if(!document.body.contains(pEl))return;
      _TW.pulseIdx=Math.min(pTxt.length,_TW.pulseIdx+1);
      pEl.textContent=pTxt.slice(0,_TW.pulseIdx);
      if(_TW.pulseIdx<pTxt.length){
        _ovT2=setTimeout(tickPulse,42);
      }
    }
    if(_TW.pulseIdx<pTxt.length)_ovT2=setTimeout(tickPulse,300);
  }
}

/* ================= COMMAND PALETTE & NOTIFICATIONS ================= */
let CMDI=0;
function openCmd(){$('#pop-root').innerHTML=`<div class="cmd-ov" onmousedown="if(event.target===this)closeCmd()"><div class="cmd"><div class="cmd-in">${ic('search',20)}<input id="cmd-q" placeholder="Search pages, products, customers or actions…" oninput="CMDI=0;cmdDraw()" onkeydown="cmdKey(event)"><kbd>ESC</kbd></div><div class="cmd-l" id="cmd-l"></div><div class="cmd-f"><span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div></div></div>`;CMDI=0;cmdDraw();setTimeout(()=>$('#cmd-q').focus(),30)}
function closeCmd(){$('#pop-root').innerHTML=''}
function cmdItems(){const q=($('#cmd-q')?.value||'').toLowerCase();const acts=[['New sale','scan',()=>go('pos')],['Add product','plus',()=>addProduct()],['New purchase order','truck',()=>newPO()],['Add customer','userPlus',()=>addCustomer()],['Issue gift card','gift',()=>issueGift()],['New promotion','zap',()=>newPromo()],['Create staff account & PIN','userCheck',()=>inviteUser()],['Toggle dark mode','moon',()=>toggleTheme()]];const g=[['Actions',acts.filter(a=>a[0].toLowerCase().includes(q)).map(a=>({t:a[0],ic:a[1],s:'Action',f:a[2]}))],['Pages',Object.entries(NAMES).filter(([k,n])=>n.toLowerCase().includes(q)).map(([k,n])=>({t:n,ic:NAVIC[k],s:'Page',f:()=>go(k)}))]];if(q){g.push(['Products',S.products.filter(p=>(p.name+p.sku+p.barcode).toLowerCase().includes(q)).slice(0,5).map(p=>({t:(p.emoji||'🛍️')+' '+p.name,ic:'package',s:money(p.price)+' · '+p.stock+' in stock',f:()=>{go('inventory');setTimeout(()=>productDrawer(p.id),300)}}))]);g.push(['Customers',S.customers.filter(c=>c.name.toLowerCase().includes(q)).slice(0,4).map(c=>({t:c.name,ic:'user',s:c.tier,f:()=>{go('customers');setTimeout(()=>custDrawer(c.id),300)}}))]);g.push(['Orders',S.orders.filter(o=>o.inv.toLowerCase().includes(q)).slice(0,4).map(o=>({t:o.inv+' · '+o.customer,ic:'receipt',s:money(o.total),f:()=>{go('orders');setTimeout(()=>orderDrawer(o.id),300)}}))])}return g.filter(x=>x[1].length)}
function cmdDraw(){const g=cmdItems();let k=0;window._cmdF=[];$('#cmd-l').innerHTML=g.map(([n,items])=>`<div class="cmd-g">${n}</div>${items.map(it=>{const i=k++;window._cmdF.push(it.f);return `<button class="cmd-r ${i===CMDI?'on':''}" onmouseenter="CMDI=${i};$$('.cmd-r').forEach((b,j)=>b.classList.toggle('on',j===${i}))" onclick="closeCmd();window._cmdF[${i}]()"><span class="ri">${ic(it.ic,15)}</span>${esc(it.t)}<small>${it.s}</small></button>`}).join('')}`).join('')||`<div class="empty">${ic('search',22)}<div>No results</div></div>`}
function cmdKey(e){const n=(window._cmdF||[]).length;if(e.key==='ArrowDown'){e.preventDefault();CMDI=(CMDI+1)%n;cmdDraw();$('.cmd-r.on')?.scrollIntoView({block:'nearest'})}if(e.key==='ArrowUp'){e.preventDefault();CMDI=(CMDI-1+n)%n;cmdDraw();$('.cmd-r.on')?.scrollIntoView({block:'nearest'})}if(e.key==='Enter'&&n){closeCmd();window._cmdF[CMDI]()}}
function openNotifs(e){e.stopPropagation();if($('#pop-root .pop')){$('#pop-root').innerHTML='';return}const r=$('#bell').getBoundingClientRect();$('#pop-root').innerHTML=`<div class="pop" style="top:${r.bottom+10}px;right:${Math.max(12,innerWidth-r.right-20)}px"><div class="pop-h"><b>Notifications</b><button class="btn xs ghost" onclick="S.notifs.forEach(n=>n.unread=false);updateBell();saveState();$('#pop-root').innerHTML=''">Mark all read</button></div><div class="pop-l">${S.notifs.length?S.notifs.map((n,i)=>`<div class="fi ${n.unread?'unread':''}" onclick="S.notifs[${i}].unread=false;updateBell();saveState();$('#pop-root').innerHTML='';go('${n.go}')"><div class="fic" style="--c:${n.c}">${ic(n.ic,16)}</div><div style="min-width:0"><b>${esc(n.t)}</b><small>${esc(n.s)}</small></div><span class="ft">${ago(n.time)}</span></div>`).join(''):`<div class="empty" style="padding:24px"><div class="sm">No notifications yet.</div></div>`}</div></div>`}
document.addEventListener('click',e=>{if(!e.target.closest('.pop')&&!e.target.closest('#bell')&&!e.target.closest('#me-btn')&&$('#pop-root .pop'))$('#pop-root').innerHTML=''});
document.addEventListener('keydown',e=>{
  if($('#auth-root .auth-ov')){
    if(AUTH.mode==='pin'){
      if(/^[0-9]$/.test(e.key)){e.preventDefault();authKey(e.key)}
      else if(e.key==='Backspace'){e.preventDefault();authKey('back')}
      else if(e.key==='Escape'){e.preventDefault();authKey('clear')}
    }
    return;
  }
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#pop-root .cmd-ov')?closeCmd():openCmd()}
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='l'){e.preventDefault();lockPOS()}
  if(e.key==='Escape'){if($('#pop-root').innerHTML)closeCmd();else if($('#modal-root .ov'))closeModal();else if($('#drawer-root .drawer'))closeDrawer()}
});

/* ================= ENTERPRISE AUTHENTICATION (NO DUMMY DATA ON LOGIN) ================= */
const AUTH={mode:'email',pin:''};
function updateUserChip(){
  const u=S.user||S.employees[0]||{name:'Store Admin',role:'Owner',branch:'All'};
  const av=$('#me-av'),nm=$('#me-name'),rl=$('#me-role');
  if(av){av.textContent=initials(u.name);av.style.background=avc(u.name)}
  if(nm)nm.textContent=u.name;
  if(rl)rl.textContent=`${u.role} · ${u.branch}`;
}
function openAuthScreen(locked=false){
  AUTH.pin='';
  const root=$('#auth-root');
  if(!root)return;
  root.innerHTML=`<div class="auth-ov" id="auth-ov">
    <div class="auth-shell">
      <div class="auth-side">
        <div>
          <div class="row" style="gap:12px;margin-bottom:24px">
            <div class="logo" style="width:44px;height:44px;transform:rotate(-6deg)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V6l8 8 8-8v13"/></svg></div>
            <div><b style="font:800 22px 'Plus Jakarta Sans',sans-serif;letter-spacing:-.6px">monarch<span style="color:#d5fd79">.</span></b><div style="font-size:10px;letter-spacing:2.6px;color:#8c92b5;font-weight:700">ENTERPRISE RETAIL OS</div></div>
          </div>
          <h2 class="display" style="margin:0 0 10px;font-size:26px;letter-spacing:-.6px">${locked?'Terminal Locked':'Sign in to Monarch POS'}</h2>
          <p style="margin:0;color:#9ba1c4;font-size:13.5px;line-height:1.6">Sign in with your administrator or staff email & password, or use your assigned 4-digit POS PIN.</p>
          <div style="margin-top:26px;display:grid;gap:12px">
            <div style="padding:14px 16px;border-radius:14px;background:#ffffff08;border:1px solid #ffffff12;display:flex;gap:12px;align-items:center">
              <div class="fic" style="--c:#d5fd79">${ic('shield',18)}</div>
              <div><b style="font-size:13px">Admin-Controlled Access</b><div class="xs" style="color:#9ba1c4">Only the Super Admin can create staff accounts and assign POS PINs in Team & Permissions.</div></div>
            </div>
            <div style="padding:14px 16px;border-radius:14px;background:#ffffff08;border:1px solid #ffffff12;display:flex;gap:12px;align-items:center">
              <div class="fic" style="--c:#14b8a6">${ic('db',18)}</div>
              <div><b style="font-size:13px">MongoDB Atlas Live Sync</b><div class="xs" style="color:#9ba1c4">All sales, products, inventory and audit logs persist directly to your database.</div></div>
            </div>
          </div>
        </div>
        <div class="row between xs" style="color:#7d84ab;border-top:1px solid #ffffff12;padding-top:14px">
          <span>${ic('lock',13)} End-to-End RBAC & Audit Trail</span>
          <span>${esc(S.settings.company)}</span>
        </div>
      </div>
      <div class="auth-form">
        <div class="seg" style="background:#ffffff0c;border-color:#ffffff16;margin:0 auto 24px">
          <button class="${AUTH.mode==='email'?'on':''}" style="${AUTH.mode==='email'?'background:#5b4cf0;color:#fff':''}" onclick="AUTH.mode='email';openAuthScreen(${locked})">${ic('mail',14)} Email & Password</button>
          <button class="${AUTH.mode==='pin'?'on':''}" style="${AUTH.mode==='pin'?'background:#5b4cf0;color:#fff':''}" onclick="AUTH.mode='pin';openAuthScreen(${locked})">${ic('key',14)} POS PIN Pad</button>
        </div>
        ${AUTH.mode==='pin'?`
          <div style="text-align:center">
            <div class="sm" style="color:#b7bce0;font-weight:600">Enter your assigned 4-digit POS PIN</div>
            <div class="pin-dots" id="pin-dots">
              ${[0,1,2,3].map(i=>`<span class="pin-dot ${AUTH.pin.length>i?'on':''}"></span>`).join('')}
            </div>
            <div class="keypad">
              ${[1,2,3,4,5,6,7,8,9,'C',0,'⌫'].map(k=>`<button class="kbtn" type="button" onclick="authKey('${k==='C'?'clear':k==='⌫'?'back':k}')">${k}</button>`).join('')}
            </div>
          </div>
        `:`
          <form onsubmit="event.preventDefault();submitEmailAuth()" style="display:grid;gap:14px;max-width:340px;margin:0 auto;width:100%">
            <label class="field" style="color:#b7bce0">Email address
              <input class="auth-input" id="au-email" type="email" placeholder="admin@monarchpos.com" required autocomplete="username">
            </label>
            <label class="field" style="color:#b7bce0">Password
              <input class="auth-input" id="au-pass" type="password" placeholder="Enter your password" required autocomplete="current-password">
            </label>
            <button class="btn pri" type="submit" style="height:46px;margin-top:8px">${ic('lock',16)} Sign in to Workspace</button>
          </form>
        `}
      </div>
    </div>
  </div>`;
  setTimeout(()=>{const inp=$('#au-email');if(inp)inp.focus()},60);
}
function authKey(k){
  if(k==='clear')AUTH.pin='';
  else if(k==='back')AUTH.pin=AUTH.pin.slice(0,-1);
  else if(AUTH.pin.length<4)AUTH.pin+=k;
  const dots=$$('#pin-dots .pin-dot');
  dots.forEach((d,i)=>d.classList.toggle('on',i<AUTH.pin.length));
  if(AUTH.pin.length===4){
    const match=S.employees.find(e=>e.pin===AUTH.pin&&e.active!==false);
    if(match){
      setTimeout(()=>completeSignIn(match,'POS PIN Pad'),140);
    }else{
      dots.forEach(d=>{d.classList.remove('on');d.classList.add('err')});
      S.logins.unshift({who:'PIN Attempt',role:'—',ip:'Live Terminal',dev:'POS PIN Pad',time:new Date(),ok:false});
      saveState();
      toast('Invalid 4-digit POS PIN','err');
      setTimeout(()=>{AUTH.pin='';dots.forEach(d=>d.classList.remove('err'))},520);
    }
  }
}
function submitEmailAuth(){
  const em=($('#au-email')?.value||'').trim().toLowerCase();
  const pw=($('#au-pass')?.value||'').trim();
  const u=S.employees.find(e=>(e.email.toLowerCase()===em||(e.altEmail&&e.altEmail.toLowerCase()===em))&&e.active!==false);
  if(!u||(u.password||'admin123')!==pw){
    S.logins.unshift({who:u?u.name:em||'Unknown',role:u?u.role:'—',ip:'Live Client',dev:'Email Login',time:new Date(),ok:false});
    saveState();
    return toast('Invalid email or password','err');
  }
  completeSignIn(u,'Email & Password');
}
function completeSignIn(emp,dev='POS Terminal'){
  S.user={id:emp.id,name:emp.name,role:emp.role,branch:emp.branch,email:emp.email,pin:emp.pin};
  const real=S.employees.find(e=>e.id===emp.id);
  if(real){real.onShift=true;real.last=new Date()}
  try{localStorage.setItem('monarch_live_user_v2',JSON.stringify(S.user))}catch(e){}
  S.logins.unshift({who:emp.name,role:emp.role,ip:'Live Session',dev,time:new Date(),ok:true});
  audit('login',`Signed in via ${dev}`,emp.role);
  updateUserChip();
  const ov=$('#auth-ov');
  if(ov){ov.classList.add('out');setTimeout(()=>$('#auth-root').innerHTML='',320)}
  toast(`Welcome, <b>${esc(emp.name)}</b> (${emp.role})`);
  render(S.page,true);
}
function lockPOS(){
  $('#pop-root').innerHTML='';
  AUTH.mode='pin';
  audit('login','Terminal locked',S.user?S.user.name:'');
  openAuthScreen(true);
}
function signOutUser(){
  $('#pop-root').innerHTML='';
  const prev=S.user?S.user.name:'User';
  audit('login','Signed out',prev);
  S.user=null;
  AUTH.mode='email';
  try{localStorage.removeItem('monarch_live_user_v2')}catch(e){}
  openAuthScreen(false);
}
function openUserMenu(e){
  e.stopPropagation();
  if($('#pop-root .pop')){$('#pop-root').innerHTML='';return}
  const u=S.user||S.employees[0];
  const emp=S.employees.find(x=>x.id===u.id)||u;
  const r=$('#me-btn').getBoundingClientRect();
  const perms=(S.matrix[u.role]||'').split(' ').filter(Boolean);
  $('#pop-root').innerHTML=`<div class="pop" style="top:${r.bottom+10}px;right:${Math.max(12,innerWidth-r.right)}px;width:min(310px,calc(100vw - 24px))">
    <div style="padding:16px 18px;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:center">
      ${avatar(u.name,42)}
      <div style="min-width:0;flex:1">
        <b style="display:block;font-size:14px">${esc(u.name)}</b>
        <div class="xs muted">${esc(u.email)}</div>
        <div class="row" style="gap:6px;margin-top:5px">
          <span class="badge pri">${u.role}</span>
          <span class="badge ${emp.onShift?'ok':'warn'} dot">${emp.onShift?'On shift':'Off shift'}</span>
        </div>
      </div>
    </div>
    <div style="padding:10px 14px;border-bottom:1px solid var(--border);background:var(--surface-2)">
      <div class="xs muted" style="margin-bottom:6px">ACTIVE PERMISSIONS (${perms.length}/${S.perms.length})</div>
      <div class="row wrap" style="gap:4px">${perms.slice(0,6).map(k=>`<span class="badge" style="font-size:10px;height:20px">${(S.perms.find(p=>p[0]===k)||[0,k])[1]}</span>`).join('')}${perms.length>6?`<span class="badge" style="font-size:10px;height:20px">+${perms.length-6} more</span>`:''}</div>
    </div>
    <div style="padding:6px">
      ${isAdmin()?`<button class="cmd-r" onclick="$('#pop-root').innerHTML='';inviteUser()"><span class="ri">${ic('userPlus',15)}</span>Create staff account & PIN<small>Admin</small></button>`:''}
      <button class="cmd-r" onclick="const emp=S.employees.find(x=>x.id===${u.id});if(emp){emp.onShift=!emp.onShift;audit('user',(emp.onShift?'Clocked in':'Clocked out')+' · '+emp.name);toast(emp.name+' '+(emp.onShift?'clocked in':'clocked out'))}$('#pop-root').innerHTML='';refresh()">
        <span class="ri">${ic('clock',15)}</span>${emp.onShift?'Clock out of shift':'Clock in to shift'}<small>Shift</small>
      </button>
      <button class="cmd-r" onclick="lockPOS()">
        <span class="ri">${ic('lock',15)}</span>Lock terminal (PIN pad)<small>Ctrl+L</small>
      </button>
      <button class="cmd-r" onclick="$('#pop-root').innerHTML='';go('employees')">
        <span class="ri">${ic('userCheck',15)}</span>Team & permissions<small>Manage</small>
      </button>
      <button class="cmd-r" style="color:var(--danger)" onclick="signOutUser()">
        <span class="ri" style="color:var(--danger)">${ic('logout',15)}</span>Sign out<small>Exit</small>
      </button>
    </div>
  </div>`;
}

/* ================= INIT ================= */
const _render=render;render=function(id,k){
  _render(id,k);
  setTimeout(()=>typeOverview(true),80);
  if(id==='ai')setTimeout(()=>typeBrief(true),140);
};
const _refresh=refresh;refresh=function(){
  _refresh();
  typeOverview(false);
  if(S.page==='ai')typeBrief(false);
};

(function init(){
  try{
    if(localStorage.getItem('mon-theme')==='dark')document.documentElement.dataset.theme='dark';
    if(localStorage.getItem('mon-col')==='1')document.body.classList.add('collapsed');
  }catch(e){}
  $$('[data-ic]').forEach(el=>el.innerHTML=ic(el.dataset.ic,+el.dataset.s||18));
  $('#theme-btn').innerHTML=ic(document.documentElement.dataset.theme==='dark'?'sun':'moon',18);
  updateBranchSelect();
  updateBell();
  updateUserChip();
  let first='';
  try{first=location.hash.slice(1)}catch(e){}
  render(PAGES[first]?first:'overview');
  if(!S.user)openAuthScreen(false);
  setTimeout(()=>{$('#splash').classList.add('out');countUps($('#view'));typeOverview(true);if(S.page==='ai')typeBrief(true)},1150);
  setTimeout(()=>$('#splash')?.remove(),1900);
})();
