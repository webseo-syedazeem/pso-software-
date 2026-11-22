/* ================= OVERVIEW (100% LIVE FROM DATABASE) ================= */
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function lastDays(n){return Array.from({length:n},(_,i)=>{const d=new Date(Date.now()-(n-1-i)*DAY);return n<=7?d.toLocaleDateString('en-GB',{weekday:'short'}):d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})})}

function branchOrders(){
  const bc=bcode();
  return S.orders.filter(o=>!bc||o.branch===bc);
}

function revSeries(range){
  const ords=branchOrders().filter(o=>o.status!=='Refunded');
  if(range==='7D'||range==='30D'){
    const n=range==='7D'?7:30;
    const cur=Array.from({length:n},(_,i)=>{
      const d0=new Date();d0.setHours(0,0,0,0);d0.setDate(d0.getDate()-(n-1-i));
      const d1=new Date(d0.getTime()+DAY);
      return r2(sum(ords.filter(o=>{const t=new Date(o.time);return t>=d0&&t<d1}),o=>o.total-(o.refunded||0)));
    });
    const prev=Array.from({length:n},(_,i)=>{
      const d0=new Date();d0.setHours(0,0,0,0);d0.setDate(d0.getDate()-(2*n-1-i));
      const d1=new Date(d0.getTime()+DAY);
      return r2(sum(ords.filter(o=>{const t=new Date(o.time);return t>=d0&&t<d1}),o=>o.total-(o.refunded||0)));
    });
    return{labels:lastDays(n),cur,prev};
  }
  const yr=new Date().getFullYear();
  const cur=Array.from({length:12},(_,m)=>r2(sum(ords.filter(o=>{const d=new Date(o.time);return d.getFullYear()===yr&&d.getMonth()===m}),o=>o.total-(o.refunded||0))));
  const prev=Array.from({length:12},(_,m)=>r2(sum(ords.filter(o=>{const d=new Date(o.time);return d.getFullYear()===yr-1&&d.getMonth()===m}),o=>o.total-(o.refunded||0))));
  return{labels:MONTHS,cur,prev};
}

S.ovRange='7D';
function sessionToday(){
  const today=new Date().setHours(0,0,0,0);
  return branchOrders().filter(o=>new Date(o.time)>=today&&o.status!=='Refunded');
}

function liveGrossMarginPct(ords){
  let revNet=0,cogs=0;
  ords.forEach(o=>{
    if(o.status==='Refunded')return;
    revNet+=Math.max(0,(o.total-(o.refunded||0))-(o.tax||0));
    (o.items||[]).forEach(it=>{
      const p=P(it.id);
      const netQty=Math.max(0,(it.qty||0)-(it.returned||0));
      cogs+=netQty*(p.cost||0);
    });
  });
  if(revNet<=0)return 0;
  return Math.max(0,((revNet-cogs)/revNet)*100);
}

PAGES.overview=()=>{
  const h=new Date().getHours();
  const greet=h<12?'Good morning':h<18?'Good afternoon':'Good evening';
  const allOrds=branchOrders().filter(o=>o.status!=='Refunded');
  const todayOrds=sessionToday();
  const todayRev=r2(sum(todayOrds,o=>o.total-(o.refunded||0)));
  const target=S.settings.dailyTarget||50000;
  const pct=target>0?Math.min(100,todayRev/target*100):0;
  const todayItems=sum(todayOrds,o=>sum(o.items,i=>Math.max(0,i.qty-(i.returned||0))));
  const avgBasket=todayOrds.length?r2(todayRev/todayOrds.length):(allOrds.length?r2(sum(allOrds,o=>o.total-(o.refunded||0))/allOrds.length):0);
  const d30=Date.now()-30*DAY;
  const ords30=allOrds.filter(o=>new Date(o.time).getTime()>=d30);
  const rev30=r2(sum(ords30,o=>o.total-(o.refunded||0)));
  const marginPct=liveGrossMarginPct(ords30);
  const rs=revSeries(S.ovRange);
  const catSegs=Object.keys(CATS).map(c=>({
    l:c,
    v:r2(sum(ords30,o=>sum((o.items||[]).filter(i=>P(i.id).cat===c),i=>Math.max(0,i.qty-(i.returned||0))*i.price*(1-(i.disc||0)/100)))),
    c:catMeta(c).c
  })).sort((a,b)=>b.v-a.v);
  const top=[...S.products].filter(p=>p.sold30>0).sort((a,b)=>b.sold30*b.price-a.sold30*a.price).slice(0,5);
  const topMax=top.length?Math.max(1,top[0].sold30*top[0].price):1;
  const ords=branchOrders().slice(0,6);
  const low=S.products.filter(p=>p.stock<p.min).length;
  const exp=S.products.filter(p=>p.expiry<=3&&p.stock>0).length;
  const appr=S.approvals.filter(a=>a.status==='Pending').length;

  return `<div class="page">${head(new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}),`${greet}, ${(S.user?S.user.name:'Faizan Rizwan').split(' ')[0]}`,`Live operational dashboard across <b>${S.branch==='All branches'?S.branches.length+' branch'+(S.branches.length===1?'':'es'):esc(S.branch)}</b>.`,`<button class="btn" onclick="exportCSV('dashboard',[['Metric','Value'],['Today revenue',${todayRev.toFixed(2)}],['Today orders',${todayOrds.length}],['30d revenue',${rev30.toFixed(2)}],['Average basket',${avgBasket.toFixed(2)}],['Gross margin','${marginPct.toFixed(1)}%']])">${ic('download',16)} Export</button><button class="btn" onclick="addProduct()">${ic('package',16)} Add product</button><button class="btn pri" onclick="go('pos')">${ic('plus',16,2.4)} New sale</button>`)}
<section class="hero rv mb"><div class="orb"></div><div><small>✦ TODAY’S REVENUE · LIVE DATABASE</small><h2 id="hero-rev">${cu(todayRev,'money',`data-d="900"`)}</h2><p>${ic('trend',14)} <span style="color:#d5fd79;font-weight:700">${todayOrds.length} sale${todayOrds.length===1?'':'s'} recorded today</span> · synced with ${esc(S.cloudStatus)}</p><div class="tgt"><div class="row between sm" style="color:#aab0d3"><span>Daily target ${moneyK(target)}</span><b style="color:#fff">${pct.toFixed(0)}%</b></div><div class="tgt-bar"><i style="width:${pct}%"></i></div></div></div><div class="hero-stats"><div class="hs"><small>Today transactions</small><b>${cu(todayOrds.length)}</b></div><div class="hs"><small>Average basket</small><b>${cu(avgBasket,'money')}</b></div><div class="hs"><small>Items sold today</small><b>${cu(todayItems)}</b></div><div class="hs"><small>Online orders</small><b>${cu(S.online.length)}</b></div></div></section>
<section class="grid g4 mb">${kpi('Revenue (30 days)',cu(rev30,'money'),'', 'trend','var(--primary)',rs.cur.slice(-10),0,ords30.length+' orders in 30d')}${kpi('Orders completed',cu(allOrds.length),'','receipt','var(--teal)',rs.cur.slice(-10),1,'all time completed')}${kpi('Gross margin',cu(marginPct,'pct'),'','percent','var(--warning)',null,2,'real net margin')}${kpi('Customers & SKUs',cu(S.customers.length),'','users','var(--pink)',null,3,S.products.length+' active products')}</section>
<div class="grid g-main mb"><section class="card pad rv" style="--i:2"><div class="ch"><div><h3>Revenue performance</h3><p>Live sales from database — current vs previous period</p></div><div class="seg">${['7D','30D','12M'].map(r=>`<button class="${S.ovRange===r?'on':''}" onclick="S.ovRange='${r}';refreshAnimated()">${r}</button>`).join('')}</div></div><div class="legend" style="margin-bottom:10px"><span><i style="--c:var(--primary)"></i>Current period · <b>${money(sum(rs.cur))}</b></span><span><i class="dash" style="--c:#b8b3e8"></i>Previous period · ${money(sum(rs.prev))}</span></div>${area({series:[{name:'Current',data:rs.cur,c:'#5b4cf0'},{name:'Previous',data:rs.prev,c:'#b8b3e8',dash:true}],labels:rs.labels,h:280})}</section>
<section class="card pad rv" style="--i:3"><div class="ch"><div><h3>Sales by category</h3><p>Live category breakdown</p></div><button class="btn sm" onclick="go('reports')">Details ${ic('arrowUR',14)}</button></div>${donut(catSegs.slice(0,6),moneyK(sum(catSegs,s=>s.v)),'Category sales')}</section></div>
<div class="grid g-main mb"><section class="card pad rv" style="--i:4"><div class="ch"><div><h3>Latest transactions</h3><p>Live receipts recorded on registers</p></div><button class="btn sm" onclick="go('orders')">View all ${ic('arrowR',14)}</button></div>${ordersTable(ords,true)}</section>
<section class="card pad rv" style="--i:5"><div class="ch"><div><h3>Live activity</h3><p>Real system events & audit log</p></div><span class="badge ok dot live">Live</span></div><div class="feed" id="feed">${S.audit.length?S.audit.slice(0,6).map(a=>`<div class="fi"><div class="fic" style="--c:var(--primary)">${ic('activity',16)}</div><div style="min-width:0"><b>${esc(a.what)}</b><small>${esc(a.who)}${a.ref?' · '+esc(a.ref):''}</small></div><span class="ft">${ago(a.time)}</span></div>`).join(''):`<div class="empty" style="padding:30px 10px"><div class="sm">No activity yet — add products or complete a sale to see real-time audit events.</div></div>`}</div></section></div>
<div class="grid g3 mb"><section class="card pad rv" style="--i:6"><div class="ch"><div><h3>Top products</h3><p>By real units sold</p></div></div>${top.length?top.map((p,i)=>`<div class="li"><span class="rank r${i+1}">${i+1}</span><div class="pimg" style="background:${catMeta(p.cat).tone};width:36px;height:36px;font-size:18px">${p.emoji}</div><div style="flex:1;min-width:0"><b style="font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}</b><div class="bar-mini" style="margin-top:6px;--c:${catMeta(p.cat).c}"><i style="width:${(p.sold30*p.price/topMax*100).toFixed(0)}%"></i></div></div><b class="num sm">${money(p.sold30*p.price)}</b></div>`).join(''):`<div class="empty" style="padding:26px 10px"><div class="sm">No products sold yet.</div><button class="btn sm pri mt" onclick="addProduct()">${ic('plus',14)} Add Product</button></div>`}</section>
<section class="card pad rv" style="--i:7"><div class="ch"><div><h3>Peak trading hours</h3><p>Real transactions by day and hour</p></div><span class="badge pri">${S.orders.length} total txns</span></div>${heatmap()}</section>
<section class="card pad rv" style="--i:8"><div class="ch"><div><h3>Needs attention</h3><p>${low+exp+appr} items across your business</p></div></div><div class="alert" style="--c:var(--warning)" onclick="go('inventory')" role="button"><div class="fic" style="--c:var(--warning)">${ic('package',17)}</div><div><b>${low} products below minimum stock</b><small>Suggested reorder value ${money(sum(S.products.filter(p=>p.stock<p.min),p=>Math.max(0,p.max-p.stock)*p.cost))}</small></div>${ic('chevR',16)}</div><div class="alert" style="--c:var(--danger)" onclick="go('expiry')" role="button"><div class="fic" style="--c:var(--danger)">${ic('clock',17)}</div><div><b>${exp} batches expire within 3 days</b><small>Mark down or write off to reduce waste</small></div>${ic('chevR',16)}</div><div class="alert" style="--c:var(--primary)" onclick="go('security')" role="button"><div class="fic" style="--c:var(--primary)">${ic('key',17)}</div><div><b>${appr} approvals waiting</b><small>Refund and discount authorisations</small></div>${ic('chevR',16)}</div><div class="alert" style="--c:var(--success)" onclick="go('employees')" role="button"><div class="fic" style="--c:var(--success)">${ic('userCheck',17)}</div><div><b>${S.employees.length} team member${S.employees.length===1?'':'s'} configured</b><small>Manage staff accounts & POS PINs</small></div>${ic('chevR',16)}</div></section></div>
<section class="card pad rv" style="--i:9"><div class="ch"><div><h3>Store network</h3><p>Live branch revenue against target</p></div><button class="btn sm" onclick="go('branches')">Manage branches ${ic('arrowR',14)}</button></div><div class="grid g4">${S.branches.map(b=>{const p=b.target>0?b.rev/b.target*100:0;return `<div class="row" style="gap:14px">${ring(p,b.c)}<div><b class="display" style="font-size:15px">${esc(b.name)}</b><div class="sm muted">${moneyK(b.rev)} of ${moneyK(b.target)}</div><div class="xs ${p>=100?'up':'muted'}" style="font-weight:600;margin-top:3px">${p>=100?'✓ Target achieved':moneyK(Math.max(0,b.target-b.rev))+' to go'}</div></div></div>`}).join('')}</div></section>${foot()}</div>`;
};

/* ================= ORDERS TABLE ================= */
function payChips(o){return (o.pays||[]).map(p=>`<span class="badge" title="${p.method}: ${money(p.amount)}">${ic(payIc[p.method]||'card',12)} ${p.method}</span>`).join(' ')}
function ordersTable(list,compact){if(!list.length)return `<div class="empty"><div class="e-ic">${ic('receipt',26)}</div><b>No sales recorded yet</b><div class="sm">Complete a sale in Point of Sale to see real transactions here.</div></div>`;return `<div class="tw"><table><thead><tr><th>Invoice</th><th>Customer</th>${compact?'':'<th>Items</th><th>Cashier</th>'}<th>Payment</th><th class="tr">Total</th><th>Status</th></tr></thead><tbody>${list.map((o,i)=>`<tr class="click rv" style="--i:${i}" onclick="orderDrawer('${o.id}')"><td><b>${o.inv}</b><div class="xs muted">${fmtTime(o.time)}</div></td><td><div class="row" style="gap:9px">${avatar(o.customer,28)}<span>${esc(o.customer)}</span></div></td>${compact?'':`<td>${sum(o.items,x=>x.qty)} items</td><td>${esc(o.cashier)}<div class="xs muted">${o.reg} · ${o.branch}</div></td>`}<td>${payChips(o)}</td><td class="tr"><b class="num">${money(o.total)}</b></td><td>${statusBadge(o.status)}</td></tr>`).join('')}</tbody></table></div>`}

/* ================= POS ================= */
function promoFor(p){const pr=S.promotions.filter(x=>x.active);const b=pr.find(x=>x.type==='bxgy'&&x.pid===p.id);if(b)return b.x===1&&b.y===1?'BOGO':`${b.x+b.y} FOR ${b.x}`;const c=pr.find(x=>x.type==='pct_cat'&&x.cat===p.cat);if(c)return `-${c.pct}%`;const pp=pr.find(x=>x.type==='pct_prod'&&x.pid===p.id);if(pp)return `-${pp.pct}%`;const bd=pr.find(x=>x.type==='bundle'&&(x.pids||[]).includes(p.id));if(bd)return 'BUNDLE';return ''}
function calc(){
  const cart=S.cart;
  const items=cart.items.filter(it=>S.products.some(p=>p.id===it.id)).map(it=>{const p=P(it.id);const gross=r2(p.price*it.qty);const idisc=r2(gross*(it.disc||0)/100);return{...it,p,gross,idisc,net:gross-idisc}});
  const sub=r2(sum(items,i=>i.gross)),itemDisc=r2(sum(items,i=>i.idisc));
  const cust=cart.customer?C(cart.customer):null;
  const lines=[];const base=sub-itemDisc;
  S.promotions.filter(x=>x.active).forEach(pr=>{
    let a=0;
    if(pr.type==='bxgy'){const it=items.find(i=>i.id===pr.pid);if(it){const free=Math.floor(it.qty/(pr.x+pr.y))*pr.y;a=free*it.p.price}}
    else if(pr.type==='pct_cat'){a=sum(items.filter(i=>i.p.cat===pr.cat),i=>i.net)*pr.pct/100}
    else if(pr.type==='pct_prod'){a=sum(items.filter(i=>i.id===pr.pid),i=>i.net)*pr.pct/100}
    else if(pr.type==='bundle'){const n=Math.min(...(pr.pids||[]).map(id=>(items.find(i=>i.id===id)||{qty:0}).qty));a=n*pr.off}
    else if(pr.type==='tiered'){if(base>=pr.min)a=base*pr.pct/100}
    else if(pr.type==='group'){if(cust&&(pr.tiers||[]).includes(cust.tier))a=base*pr.pct/100}
    a=r2(a);if(a>0)lines.push({id:pr.id,name:pr.name,amt:a});
  });
  const promo=r2(sum(lines,l=>l.amt));
  const after=Math.max(0,sub-itemDisc-promo);
  const inv=cart.inv;
  const invAmt=r2(inv.type==='pct'?after*inv.value/100:Math.min(inv.value,after));
  const taxable=r2(after-invAmt);
  const rt=(S.settings.taxRate||0)/100;
  let tax,total;
  if(S.settings.taxInclusive){total=taxable;tax=rt>0?r2(taxable-taxable/(1+rt)):0}
  else{tax=r2(taxable*rt);total=r2(taxable+tax)}
  return{items,sub,itemDisc,lines,promo,invAmt,tax,total,count:sum(items,i=>i.qty),cust};
}

PAGES.pos=()=>{
  const reg=S.registers[0]||{id:'REG-01',branch:'MAIN'};
  return `<div class="page">${head(`Fast checkout · ${reg.id} · ${S.branches.find(b=>b.id===reg.branch)?.name||reg.branch}`,'Point of Sale','Scan barcode, search SKU or tap products — promotions and member pricing apply automatically.',`<span class="badge ok dot live" style="height:32px;padding:0 12px">Register open · ${S.user?esc(S.user.name):'Faizan Rizwan'}</span><button class="btn" onclick="addProduct()">${ic('plus',16)} Add product</button><button class="btn" onclick="openCustDisplay()">${ic('monitor',16)} Customer display</button><button class="btn" onclick="go('registers')">${ic('wallet',16)} Cash in / out</button>`)}<div class="pos"><div><div class="pos-bar"><label class="search" style="position:relative;overflow:hidden" id="pos-search">${ic('search',18)}<input id="pos-q" placeholder="Search name, SKU or scan barcode…" oninput="posFilter()" onkeydown="if(event.key==='Enter')posEnter()" autocomplete="off"></label><button class="btn" style="height:48px;border-radius:14px" onclick="simScan()">${ic('scan',18)} Scan</button><button class="btn" style="height:48px;border-radius:14px" onclick="weighItem()" title="Weighing scale">${ic('scale',18)}</button></div><div class="cats" id="pos-cats">${posCats()}</div><div class="pgrid" id="pos-grid">${posTiles()}</div><div class="kbd-hints"><span><kbd>/</kbd> Search</span><span><kbd>Enter</kbd> Add exact SKU / barcode</span><span><kbd>F8</kbd> Hold sale</span><span><kbd>F9</kbd> Take payment</span><span><kbd>Ctrl+L</kbd> Lock POS</span></div></div><aside class="card cart" id="cart">${cartHTML()}</aside></div>${foot()}</div>`;
};
function posCats(){const cats=['All',...Object.keys(CATS)];return cats.map(c=>`<button class="chip ${S.posCat===c?'on':''}" onclick="S.posCat='${c}';$('#pos-cats').innerHTML=posCats();posFilter()">${c==='All'?ic('grid',14):''}${c==='All'?'All products':c}<span class="c">${c==='All'?S.products.length:S.products.filter(p=>p.cat===c).length}</span></button>`).join('')}
function posList(){const q=($('#pos-q')?.value||'').toLowerCase().trim();return S.products.filter(p=>(S.posCat==='All'||p.cat===S.posCat)&&(!q||(p.name+' '+p.sku+' '+p.barcode+' '+(p.extraBarcodes||[]).join(' ')).toLowerCase().includes(q)))}
function posTiles(){
  if(!S.products.length){
    return `<div class="empty" style="grid-column:1/-1;padding:54px 20px"><div class="e-ic">${ic('package',28)}</div><b style="color:var(--text);font-size:16px">Your product catalog is empty</b><div class="sm" style="margin:6px 0 16px">Add your first product or import a CSV catalog to start billing.</div><div class="row" style="justify-content:center;gap:10px"><button class="btn pri" onclick="addProduct()">${ic('plus',16,2.4)} Add First Product</button><button class="btn" onclick="importCSVPrompt()">${ic('upload',16)} Import CSV</button></div></div>`;
  }
  const l=posList();
  if(!l.length)return `<div class="empty" style="grid-column:1/-1"><div class="e-ic">${ic('search',26)}</div><b>No products match</b><div class="sm">Try another name, SKU or barcode.</div></div>`;
  return l.map((p,i)=>{const pr=promoFor(p);return `<button class="tile ${p.stock<=0?'oos':''}" style="--i:${i};--tone:${catMeta(p.cat).tone}" onclick="addCart(${p.id},this)"><div class="tv"><span>${p.emoji||'🛍️'}</span>${p.stock>0&&p.stock<p.min?`<span class="badge warn stk" style="height:20px;font-size:10px">${p.stock} left</span>`:''}${pr?`<span class="promo-tag">${pr}</span>`:''}</div><div class="tb"><div class="tn">${esc(p.name)}</div><div class="ts">${p.sku} · ${p.stock} in stock</div><div class="tp"><b>${money(p.price)}</b><span class="add">${ic('plus',16,2.6)}</span></div></div></button>`}).join('');
}
function posFilter(){const g=$('#pos-grid');if(g)g.innerHTML=posTiles()}
function posEnter(){const q=$('#pos-q').value.trim().toLowerCase();if(!q)return;const p=S.products.find(p=>p.sku.toLowerCase()===q||p.barcode===q||(p.extraBarcodes||[]).includes(q))||(posList().length===1?posList()[0]:null);if(p){addCart(p.id);$('#pos-q').value='';posFilter()}else toast('No exact match for “'+esc(q)+'”','warn')}
function simScan(){
  const avail=S.products.filter(p=>p.stock>0);
  if(!avail.length)return toast('Add a product with stock first to scan','warn');
  const box=$('#pos-search');const b=document.createElement('div');b.className='scan-beam';box.appendChild(b);
  const p=avail[Math.floor(Math.random()*avail.length)];
  setTimeout(()=>{b.remove();$('#pos-q').value=p.barcode;setTimeout(()=>{posEnter()},250)},900);
}
function weighItem(){
  const avail=S.products.filter(p=>p.stock>0);
  if(!avail.length)return toast('Add a product first to use the weighing scale','warn');
  modal({title:'Weighing scale',sub:'Enter or read live weight from digital scale',size:'sm',icon:'scale',body:`<label class="field">Select item<select class="sel" id="wt-p">${avail.map(p=>`<option value="${p.id}">${p.emoji||'🛍️'} ${esc(p.name)} (${money(p.price)}/unit)</option>`).join('')}</select></label><label class="field mt">Quantity / Weight (units)<input class="input num" id="wt-q" type="number" min="1" value="1"></label>`,foot:`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="const pid=+$('#wt-p').value,q=Math.max(1,Math.round(+$('#wt-q').value||1));closeModal();for(let i=0;i<q;i++)addCart(pid)">Add to cart</button>`});
}
function flyTo(btn,emoji){if(!btn)return;const a=btn.getBoundingClientRect(),c=$('#cart').getBoundingClientRect();const f=document.createElement('div');f.className='fly';f.textContent=emoji||'🛍️';f.style.left=(a.left+a.width/2-17)+'px';f.style.top=(a.top+40)+'px';document.body.appendChild(f);requestAnimationFrame(()=>{f.style.transform=`translate(${c.left+60-a.left-a.width/2}px,${c.top+120-a.top-40}px) scale(.4)`;f.style.opacity='.2'});setTimeout(()=>f.remove(),720)}
function addCart(id,btn){const p=P(id);if(!p.id)return;const it=S.cart.items.find(x=>x.id===id);if((it?.qty||0)>=p.stock)return toast(`Only ${p.stock} × ${esc(p.name)} in stock`,'warn');if(it)it.qty++;else S.cart.items.push({id,qty:1,disc:0});flyTo(btn,p.emoji);setTimeout(drawCart,btn?380:0)}
function qty(id,n){const it=S.cart.items.find(x=>x.id===id),p=P(id);if(!it)return;if(it.qty+n>p.stock)return toast('Not enough stock','warn');it.qty+=n;if(it.qty<=0)S.cart.items=S.cart.items.filter(x=>x.id!==id);drawCart()}
function rmItem(id){S.cart.items=S.cart.items.filter(x=>x.id!==id);drawCart()}
function drawCart(){const el=$('#cart');if(!el)return;el.innerHTML=cartHTML();const t=$('#c-total');t&&t.classList.add('bump')}
function cartHTML(){const t=calc(),cu=t.cust;return `<div class="cart-h"><div class="row between"><div><div class="eyebrow" style="margin:0">Current sale</div><h3 class="display" style="margin:3px 0 0;font-size:18px;letter-spacing:-.4px">${S.settings.invPrefix}${S.settings.nextInv} <span class="muted" style="font-size:13px;font-weight:500">· ${t.count} item${t.count===1?'':'s'}</span></h3></div><button class="btn ghost sm" onclick="voidSale()">${ic('trash',15)} Void</button></div><button class="cust-pick ${cu?'set':''}" onclick="pickCustomer()">${cu?avatar(cu.name,34):`<div class="kpi-ic" style="width:34px;height:34px;border-radius:10px">${ic('userPlus',16)}</div>`}<div style="flex:1;min-width:0">${cu?`<b style="font-size:13px">${esc(cu.name)}</b> <span class="tier ${cu.tier}">${ic('crown',11)} ${cu.tier}</span><div class="xs muted">${num(cu.points)} pts · worth ${money(cu.points*S.settings.pointValue)}</div>`:`<b style="font-size:13px">Add customer</b><div class="xs muted">Earn loyalty points & member pricing</div>`}</div>${ic('chevR',16)}</button></div><div class="cart-b">${t.items.length?t.items.map(i=>`<div class="ci"><div class="pimg" style="background:${catMeta(i.p.cat).tone}">${i.p.emoji||'🛍️'}</div><div class="cn"><b title="${esc(i.p.name)}">${esc(i.p.name)}</b><small>${money(i.p.price)} ea${i.disc?` · <span class="idisc">−${i.disc}%</span>`:''}</small> <button class="xs" style="color:var(--primary);font-weight:600" onclick="itemDisc(${i.id})">${i.disc?'Edit':'+ Discount'}</button></div><div class="qty"><button onclick="qty(${i.id},-1)" aria-label="Decrease">${ic('minus',13,2.4)}</button><span>${i.qty}</span><button onclick="qty(${i.id},1)" aria-label="Increase">${ic('plus',13,2.4)}</button></div><div class="lt">${money(i.net)}</div><button class="rm" onclick="rmItem(${i.id})" aria-label="Remove">${ic('x',15)}</button></div>`).join(''):`<div class="empty" style="padding:38px 10px"><div class="e-ic">${ic('scan',28)}</div><b style="color:var(--text)">Ready for customer</b><div class="sm">Scan a barcode or tap a product to begin.</div></div>`}</div><div class="cart-f"><div class="ml"><span>Subtotal</span><b>${money(t.sub)}</b></div>${t.itemDisc?`<div class="ml promo"><span>Item discounts</span><b>−${money(t.itemDisc)}</b></div>`:''}${t.lines.map(l=>`<div class="ml promo"><span>${ic('tag',12)} ${esc(l.name)}</span><b>−${money(l.amt)}</b></div>`).join('')}${t.invAmt?`<div class="ml promo"><span>${S.cart.inv.label||(S.cart.inv.code?'Coupon '+S.cart.inv.code:'Order discount'+(S.cart.inv.type==='pct'?' ('+S.cart.inv.value+'%)':''))} <button onclick="S.cart.inv={type:'pct',value:0,code:'',label:''};drawCart()" style="color:var(--text-3)">✕</button></span><b>−${money(t.invAmt)}</b></div>`:''}<div class="ml"><span>Tax ${S.settings.taxRate}% ${S.settings.taxInclusive?'(included)':'(added)'}</span><b>${money(t.tax)}</b></div><div class="ml tot"><span>Total due</span><b id="c-total">${money(t.total)}</b></div><button class="pay-btn" ${t.count?'':'disabled'} onclick="openPay()"><span class="row" style="gap:9px">${ic('card',19)} Take payment</span><span class="row" style="gap:6px">${money(t.total)} ${ic('arrowR',17)}</span></button><div class="tools"><button onclick="holdSale()">${ic('pause',17)}Hold</button><button onclick="resumeList()">${ic('undo',17)}Resume${S.held.length?`<span class="cnt">${S.held.length}</span>`:''}</button><button onclick="orderDisc()">${ic('percent',17)}Discount</button><button onclick="go('orders')">${ic('swap',17)}Return</button></div></div>`}
function voidSale(){if(!S.cart.items.length)return toast('Cart is already empty','info');confirmBox('Void this sale?','All items will be removed. This action is recorded in the audit trail.',()=>{audit('void','Sale voided before payment',money(calc().total));S.cart={items:[],customer:null,inv:{type:'pct',value:0,code:'',label:''}};drawCart();toast('Sale voided','info')},{danger:true,label:'Void sale'})}
function holdSale(){if(!S.cart.items.length)return toast('Add products before holding a sale','warn');const t=calc();S.held.push({cart:structuredClone(S.cart),time:new Date(),total:t.total,count:t.count,label:t.cust?t.cust.name:'Walk-in customer'});S.cart={items:[],customer:null,inv:{type:'pct',value:0,code:'',label:''}};saveState();drawCart();toast('Sale parked — resume it any time','info')}
function resumeList(){if(!S.held.length)return toast('No held sales to resume','info');modal({title:'Held sales',sub:'Parked carts on this register',icon:'pause',body:S.held.map((h,i)=>`<div class="alert" style="--c:var(--primary)"><div class="fic" style="--c:var(--primary)">${ic('receipt',16)}</div><div style="flex:1"><b>${esc(h.label)} · ${h.count} items</b><small>Held ${ago(h.time)}</small></div><b class="num">${money(h.total)}</b><button class="btn sm pri" onclick="resumeHeld(${i})">Resume</button></div>`).join('')})}
function resumeHeld(i){if(S.cart.items.length){S.held.push({cart:structuredClone(S.cart),time:new Date(),total:calc().total,count:calc().count,label:'Swapped cart'})}const h=S.held.splice(i,1)[0];S.cart=h.cart;saveState();closeModal();drawCart();toast('Held sale resumed')}
function pinPrompt(reason,cb){window._pincb=cb;modal({title:'Manager approval',sub:reason,size:'sm',icon:'lock',iconC:'var(--warning)',body:`<div class="row" style="justify-content:center;gap:10px" id="pins">${[0,1,2,3].map(i=>`<input class="input" maxlength="1" type="password" inputmode="numeric" style="width:54px;height:60px;text-align:center;font:800 24px 'Plus Jakarta Sans',system-ui,sans-serif" oninput="pinIn(this,${i})" onkeydown="if(event.key==='Backspace'&&!this.value&&this.previousElementSibling)this.previousElementSibling.focus()">`).join('')}</div><p class="xs muted" style="text-align:center;margin-top:14px">${ic('lock',12)} Enter Admin or Manager 4-digit PIN</p>`})}
function pinIn(el,i){
  el.value=el.value.replace(/\D/g,'');
  if(el.value&&el.nextElementSibling)el.nextElementSibling.focus();
  const v=$$('#pins input').map(x=>x.value).join('');
  if(v.length===4){
    const mgr=S.employees.find(e=>(e.role==='Owner'||e.role==='Manager')&&e.pin===v);
    if(mgr||v===S.settings.managerPin){
      $$('#pins input').forEach(x=>x.style.borderColor='var(--success)');
      setTimeout(()=>{closeModal();setTimeout(()=>window._pincb(),220)},300);
      audit('approval','Manager PIN approval granted',mgr?mgr.name:'Admin');
    }else{
      const p=$('#pins');p.style.animation='shake .35s 2';
      $$('#pins input').forEach(x=>{x.value='';x.style.borderColor='var(--danger)'});
      setTimeout(()=>{p.style.animation='';$('#pins input').focus()},700);
      toast('Incorrect Manager/Admin PIN','err');
    }
  }
}
function itemDisc(id){const it=S.cart.items.find(x=>x.id===id),p=P(id);modal({title:'Item discount',sub:`${esc(p.name)} · ${money(p.price)} × ${it.qty}`,size:'sm',icon:'percent',body:`<div class="quick" style="margin:0 0 12px">${[0,5,10,15,20,25,50].map(v=>`<button class="chip" onclick="$('#idv').value=${v}">${v?v+'%':'None'}</button>`).join('')}</div><label class="field">Discount percentage<input class="input" id="idv" type="number" min="0" max="100" value="${it.disc||0}"></label><p class="xs muted" style="margin-top:10px">Discounts above ${S.settings.discountAlert}% require manager authorisation.</p>`,foot:`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="applyItemDisc(${id})">Apply</button>`})}
function applyItemDisc(id){const v=+$('#idv').value;if(!(v>=0&&v<=100))return toast('Enter 0–100%','warn');const go2=()=>{S.cart.items.find(x=>x.id===id).disc=v;drawCart();toast(v?`${v}% item discount applied`:'Discount removed')};closeModal();if(v>S.settings.discountAlert&&!isAdmin())setTimeout(()=>pinPrompt(`Authorise a ${v}% item discount`,go2),220);else go2()}
const DLAB=()=>['Discount %','Amount ('+CUR[S.settings.currency].trim()+')','Coupon code'];
function orderDisc(){if(!S.cart.items.length)return toast('Add products first','warn');window._dt='pct';modal({title:'Order discount',sub:'Apply a percentage, a fixed amount, or a coupon code.',icon:'percent',body:`<div class="seg" id="dseg" style="margin-bottom:16px">${[['pct','Percentage'],['fixed','Fixed amount'],['coupon','Coupon code']].map(([k,l],i)=>`<button class="${i?'':'on'}" onclick="window._dt='${k}';$$('#dseg button').forEach(b=>b.classList.remove('on'));this.classList.add('on');$('#dlab').textContent=DLAB()[${i}];$('#dv').type='${k==='coupon'?'text':'number'}';$('#dv').value='';$('#dv').focus()">${l}</button>`).join('')}</div><label class="field"><span id="dlab">Discount %</span><input class="input" id="dv" type="number" min="0" placeholder="e.g. 10"></label><p class="xs muted" style="margin-top:10px">Discounts above ${S.settings.discountAlert}% require manager approval.</p>`,foot:`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn pri" onclick="applyOrderDisc()">Apply discount</button>`})}
function applyOrderDisc(){const t=window._dt,raw=$('#dv').value.trim();let inv;if(t==='coupon'){const c=S.coupons.find(c=>c.code===raw.toUpperCase());if(!c||!c.active)return toast('Coupon not valid or expired','err');inv={type:'pct',value:c.pct,code:c.code,label:''}}else{const v=+raw;if(!(v>0))return toast('Enter a valid amount','warn');if(t==='pct'&&v>100)return toast('Maximum is 100%','warn');inv={type:t,value:v,code:'',label:''}}const pctEq=inv.type==='pct'?inv.value:inv.value/Math.max(1,calc().total)*100;const apply=()=>{S.cart.inv=inv;drawCart();toast('Discount applied')};closeModal();if(pctEq>S.settings.discountAlert&&!inv.code&&!isAdmin())setTimeout(()=>pinPrompt(`Authorise an order discount of ${pctEq.toFixed(0)}%`,apply),220);else apply()}
function pickCustomer(){modal({title:'Select customer',sub:'Search by name, phone or email',icon:'users',body:`<label class="search" style="margin-bottom:12px">${ic('search',16)}<input id="cq" placeholder="Search customers…" oninput="$('#clist').innerHTML=custRows(this.value)"></label><div id="clist" style="max-height:340px;overflow:auto">${custRows('')}</div>`,foot:`<button class="btn" onclick="S.cart.customer=null;closeModal();drawCart()">Walk-in customer</button><button class="btn pri" onclick="closeModal();setTimeout(()=>addCustomer(true),220)">${ic('userPlus',16)} New customer</button>`})}
function custRows(q){q=q.toLowerCase();return S.customers.filter(c=>(c.name+c.phone+c.email).toLowerCase().includes(q)).map(c=>`<button class="cmd-r" onclick="selCust(${c.id})">${avatar(c.name,34)}<div><b style="color:var(--text)">${esc(c.name)}</b> <span class="tier ${c.tier}">${c.tier}</span><div class="xs muted">${c.phone} · ${num(c.points)} pts${c.credit?` · owes ${money(c.credit)}`:''}</div></div><small>${c.group}</small></button>`).join('')||'<div class="empty">No customers yet — click "New customer" below to create one.</div>'}
function selCust(id){const c=C(id);S.cart.customer=id;closeModal();drawCart();toast(`<b>${esc(c.name)}</b> attached · ${c.tier} member`)}
function openCustDisplay(){const t=calc();modal({title:'Customer-facing display',sub:'Live mirror of what the shopper sees',size:'lg',icon:'monitor',body:`<div style="border-radius:20px;background:linear-gradient(135deg,#121633,#0c0f22);color:#fff;padding:26px;min-height:280px;display:grid;grid-template-columns:1.2fr 1fr;gap:24px"><div><div style="font:800 20px 'Plus Jakarta Sans',system-ui,sans-serif">monarch<span style="color:#d5fd79">.</span></div><div style="margin-top:18px;display:grid;gap:9px;font-size:13px">${t.items.slice(-6).map(i=>`<div class="row between" style="animation:ciIn .4s both"><span>${i.p.emoji||'🛍️'} ${esc(i.p.name)} × ${i.qty}</span><b>${money(i.net)}</b></div>`).join('')||'<div style="color:#aab0d3">Welcome! Your items will appear here.</div>'}</div></div><div style="background:#ffffff0d;border-radius:16px;padding:20px;display:flex;flex-direction:column;justify-content:center"><small style="color:#aab0d3;letter-spacing:1.5px">TOTAL</small><div style="font:800 42px 'Plus Jakarta Sans',system-ui,sans-serif;letter-spacing:-1.5px">${money(t.total)}</div>${t.promo+t.invAmt+t.itemDisc>0?`<div style="color:#d5fd79;font-weight:700;margin-top:6px">You saved ${money(t.promo+t.invAmt+t.itemDisc)} today 🎉</div>`:''}${t.cust?`<div style="color:#aab0d3;margin-top:10px;font-size:12px">Hi ${esc(t.cust.name.split(' ')[0])}! You’ll earn ${num(Math.floor(t.total*S.settings.pointsPer))} points.</div>`:''}</div></div>`})}

/* ---------- PAYMENT ---------- */
let PAY=null;
const METHODS=[['Card','card'],['Cash','cash'],['Bank transfer','bank'],['Digital wallet','phone'],['Gift card','gift'],['On account','user']];
function openPay(){const t=calc();if(!t.count)return toast('Add products to the cart first','warn');PAY={total:t.total,method:'Cash',pays:[],redeem:0};modal({title:'Take payment',sub:'Split across tenders, take partial payments or charge to a customer account.',size:'lg',icon:'card',body:'<div id="pay-b"></div>',foot:`<button class="btn" onclick="closeModal()">Back to cart</button><button class="btn pri" id="pay-done" onclick="finishSale()">${ic('check',16,2.4)} Complete sale</button>`});drawPay()}
const payRem=()=>r2(PAY.total-PAY.redeem-sum(PAY.pays,p=>p.amount));
function drawPay(){const rem=payRem(),cu=S.cart.customer?C(S.cart.customer):null,change=rem<0?-rem:0;const def=Math.max(0,rem);const ptsVal=cu?r2(cu.points*S.settings.pointValue):0;$('#pay-b').innerHTML=`<div class="due"><div><small>AMOUNT DUE</small><b>${money(PAY.total)}</b></div><div style="text-align:right"><small>${change?'CHANGE DUE':'REMAINING'}</small><b style="color:${change?'#d5fd79':rem<=0?'#7ef0c4':'#fff'}">${money(change||Math.max(0,rem))}</b></div></div><div class="pm-grid">${METHODS.map(([m,i])=>`<button class="pm ${PAY.method===m?'on':''}" onclick="PAY.method='${m}';drawPay()">${ic(i,20)}${m}</button>`).join('')}</div><div class="fgrid" style="margin-top:16px">${PAY.method==='Gift card'?`<label class="field">Gift card code<input class="input" id="gc-code" placeholder="GC-XXXX-XXXX"></label>`:''}<label class="field ${PAY.method==='Gift card'?'':'full'}">Amount (${PAY.method})<div class="row"><input class="input num" id="pay-amt" type="number" step=".01" value="${def.toFixed(2)}" onkeydown="if(event.key==='Enter')addPay()"><button class="btn pri" onclick="addPay()" style="height:42px">${ic('plus',16,2.4)} Add</button></div></label></div>${PAY.method==='Cash'?`<div class="quick">${[def,Math.ceil(def/100)*100,Math.ceil(def/500)*500,Math.ceil(def/1000)*1000,5000].filter((v,i,a)=>v>0&&a.indexOf(v)===i).map(v=>`<button class="chip" onclick="$('#pay-amt').value=${v.toFixed(2)};addPay()">${money(v)}</button>`).join('')}</div>`:''}${PAY.method==='On account'?`<p class="xs muted" style="margin-top:10px">${cu?`Available credit: <b>${money(cu.limit-cu.credit)}</b> of ${money(cu.limit)} limit`:'⚠ Attach a customer to charge to their account.'}</p>`:''}${cu&&cu.points>=10?`<div class="alert" style="--c:var(--pink);margin-top:14px"><div class="fic" style="--c:var(--pink)">${ic('star',16)}</div><div style="flex:1"><b>Redeem loyalty points</b><small>${num(cu.points)} pts available · worth ${money(ptsVal)}</small></div><label class="switch"><input type="checkbox" ${PAY.redeem?'checked':''} onchange="PAY.redeem=this.checked?Math.min(${ptsVal},r2(PAY.total-sum(PAY.pays,p=>p.amount))):0;drawPay()"><span></span></label></div>`:''}${PAY.pays.length?`<div class="sec-t">Payments taken</div>${PAY.pays.map((p,i)=>`<div class="paid-line">${ic(payIc[p.method],16)} ${p.method}${p.ref?` <span class="xs muted">${p.ref}</span>`:''}<b class="num">${money(p.amount)}</b><button onclick="PAY.pays.splice(${i},1);drawPay()" class="muted">${ic('x',14)}</button></div>`).join('')}`:''}${PAY.redeem?`<div class="paid-line" style="color:var(--pink)">${ic('star',16)} Points redeemed <b>${money(PAY.redeem)}</b></div>`:''}`;$('#pay-done').disabled=rem>.005;$('#pay-done').innerHTML=rem>.005?`Remaining ${money(rem)}`:`${ic('check',16,2.4)} Complete sale${change?' · change '+money(change):''}`;const a=$('#pay-amt');a&&setTimeout(()=>a.select(),30)}
function addPay(){const amt=r2(+$('#pay-amt').value),m=PAY.method,rem=payRem(),cu=S.cart.customer?C(S.cart.customer):null;if(!(amt>0))return toast('Enter an amount','warn');if(rem<=0)return toast('Already fully paid','info');let ref='';if(m!=='Cash'&&amt>rem+.001)return toast(`${m} cannot exceed the remaining ${money(rem)}`,'warn');if(m==='Gift card'){const g=S.giftcards.find(g=>g.code===$('#gc-code').value.trim().toUpperCase());if(!g)return toast('Gift card not found','err');if(g.bal<amt)return toast(`Gift card balance is only ${money(g.bal)}`,'err');ref=g.code}if(m==='On account'){if(!cu)return toast('Attach a customer first','warn');if(cu.credit+amt>cu.limit)return toast('Exceeds the customer’s credit limit','err')}PAY.pays.push({method:m,amount:amt,ref});drawPay()}
function finishSale(){
  const t=calc(),cu=t.cust,rem=payRem();if(rem>.005)return;
  const cName=S.user?S.user.name:'Faizan Rizwan';
  const activeBranch=(S.user&&S.user.branch&&S.user.branch!=='All')?S.user.branch:(S.branches[0]?.id||'MAIN');
  const reg=S.registers.find(r=>r.branch===activeBranch&&r.open)||S.registers[0]||{id:'REG-01',cash:0,card:0,digital:0};
  const change=r2(Math.max(0,-rem));
  const pays=PAY.pays.map(p=>({...p}));
  if(change>0){const cp=[...pays].reverse().find(p=>p.method==='Cash');if(cp){cp.tendered=cp.amount;cp.amount=r2(cp.amount-change)}}
  if(PAY.redeem>0)pays.push({method:'Points',amount:PAY.redeem});
  const onAcc=sum(pays.filter(p=>p.method==='On account'),p=>p.amount);
  const earned=cu?Math.floor((t.total-PAY.redeem)*S.settings.pointsPer):0;
  const o={id:'ORD-'+(1001+S.orders.length),inv:S.settings.invPrefix+(S.settings.nextInv++),time:new Date(),customer:cu?cu.name:'Walk-in customer',cid:cu?cu.id:null,items:t.items.map(i=>({id:i.id,name:i.p.name,emoji:i.p.emoji||'🛍️',qty:i.qty,price:i.p.price,disc:i.disc||0})),sub:t.sub,itemDisc:t.itemDisc,promo:t.promo,lines:t.lines,invDisc:t.invAmt,invLabel:S.cart.inv.code?'Coupon '+S.cart.inv.code:S.cart.inv.label||'Order discount',tax:t.tax,total:t.total,pays,change,status:onAcc>0?'On account':'Completed',cashier:cName,branch:activeBranch,reg:reg.id,refunded:0,channel:'In-store',earned,session:true};
  t.items.forEach(i=>{
    i.p.stock=Math.max(0,i.p.stock-i.qty);
    i.p.sold30=(i.p.sold30||0)+i.qty;
    S.movements.unshift({time:new Date(),pid:i.id,type:'Sale',qty:-i.qty,reason:o.inv,user:cName});
    if(i.p.stock<i.p.min&&i.p.stock+i.qty>=i.p.min)pushNotif({ic:'alert',c:'var(--warning)',t:'Low stock: '+i.p.name,s:i.p.stock+' units left after '+o.inv,go:'inventory'});
  });
  pays.forEach(p=>{
    if(p.method==='Cash')reg.cash=r2((reg.cash||0)+p.amount);
    else if(p.method==='Card')reg.card=r2((reg.card||0)+p.amount);
    else if(p.method==='Digital wallet'||p.method==='Bank transfer')reg.digital=r2((reg.digital||0)+p.amount);
    if(p.method==='Gift card'){const g=S.giftcards.find(g=>g.code===p.ref);if(g)g.bal=r2(g.bal-p.amount)}
  });
  if(cu){
    cu.points=Math.max(0,cu.points+earned-Math.round(PAY.redeem/Math.max(.001,S.settings.pointValue)));
    cu.spent=r2(cu.spent+t.total);
    cu.visits++;
    cu.credit=r2(cu.credit+onAcc);
    if(cu.points>=4000)cu.tier='Platinum';else if(cu.points>=1500)cu.tier='Gold';
  }
  t.lines.forEach(l=>{const pr=S.promotions.find(p=>p.id===l.id);if(pr){pr.uses++;pr.rev=r2(pr.rev+t.total)}});
  if(S.cart.inv.code){const cp=S.coupons.find(c=>c.code===S.cart.inv.code);if(cp)cp.uses++}
  S.orders.unshift(o);
  S.cart={items:[],customer:null,inv:{type:'pct',value:0,code:'',label:''}};
  audit('sale',`Sale completed · ${o.inv}`,money(o.total));
  closeModal();
  setTimeout(()=>{drawCart();posFilter();renderNav();confetti();showSuccess(o)},230);
}
function receiptText(o){
  const st=S.settings;
  const lines=[
    `${st.company}`,
    `${st.address} | ${st.phone}`,
    `Invoice: ${o.inv} | Date: ${new Date(o.time).toLocaleString('en-GB')}`,
    `Cashier: ${o.cashier} (${o.reg})`,
    `Customer: ${o.customer}`,
    `--------------------------------`,
    ...o.items.map(i=>`${i.name} (${i.qty} x ${money(i.price)}) = ${money(i.qty*i.price*(1-(i.disc||0)/100))}`),
    `--------------------------------`,
    `Subtotal: ${money(o.sub)}`,
    ...(o.itemDisc?[`Item Discounts: -${money(o.itemDisc)}`]:[]),
    ...(o.invDisc?[`Order Discount: -${money(o.invDisc)}`]:[]),
    `Tax (${st.taxRate}%): ${money(o.tax)}`,
    `TOTAL: ${money(o.total)}`,
    `Paid via: ${o.pays.map(p=>p.method+' '+money(p.amount)).join(', ')}`,
    ...(o.change?[`Change: ${money(o.change)}`]:[]),
    `${st.receiptFooter}`
  ];
  return lines.join('\n');
}
function emailReceipt(id){
  const o=S.orders.find(x=>x.id===id);if(!o)return;
  const cu=o.cid?C(o.cid):null;
  const defEmail=(cu&&cu.email&&cu.email!=='—')?cu.email:'';
  const subj=encodeURIComponent(`Receipt ${o.inv} from ${S.settings.company}`);
  const body=encodeURIComponent(receiptText(o));
  window.open(`mailto:${defEmail}?subject=${subj}&body=${body}`,'_blank');
  audit('sale','Digital receipt emailed · '+o.inv,defEmail||'Customer');
  toast('Email client opened with formatted receipt');
}
function smsReceipt(id){
  const o=S.orders.find(x=>x.id===id);if(!o)return;
  const cu=o.cid?C(o.cid):null;
  const rawPhone=(cu&&cu.phone&&cu.phone!=='—')?cu.phone.replace(/[^\d+]/g,''):'';
  const body=encodeURIComponent(receiptText(o));
  const waPhone=rawPhone.replace(/^\+/,'');
  window.open(`https://wa.me/${waPhone}?text=${body}`,'_blank');
  audit('sale','Digital receipt sent via WhatsApp/SMS · '+o.inv,rawPhone||'Customer');
  toast('WhatsApp / SMS receipt ready to send');
}
function showSuccess(o){modal({size:'lg',body:`<div class="grid g2" style="align-items:center"><div style="text-align:center;padding:10px"><div class="success-ic"><svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div><h2 class="display" style="margin:0;font-size:24px;letter-spacing:-.6px">Payment complete</h2><p class="muted sm" style="margin:6px 0 18px">${o.inv} · ${o.items.length} line${o.items.length>1?'s':''} · ${esc(o.customer)}</p><div class="display" style="font-size:38px;font-weight:800;letter-spacing:-1.4px">${money(o.total)}</div>${o.change?`<div class="badge ok" style="margin-top:10px;height:30px;font-size:13px;padding:0 14px">Change due ${money(o.change)}</div>`:''}${o.earned?`<div class="sm" style="margin-top:12px;color:var(--pink);font-weight:600">${ic('star',13)} ${o.earned} loyalty points earned</div>`:''}<div class="grid g2" style="margin-top:22px;gap:9px"><button class="btn" onclick="printHTML(receiptHTML(S.orders.find(x=>x.id==='${o.id}')))">${ic('printer',16)} Print</button><button class="btn" onclick="emailReceipt('${o.id}')">${ic('mail',16)} Email</button><button class="btn" onclick="smsReceipt('${o.id}')">${ic('msg',16)} WhatsApp / SMS</button><button class="btn" onclick="toast('Cash drawer kick pulse sent (RJ11)','info')">${ic('inbox',16)} Drawer</button></div><button class="btn pri lg" style="width:100%;margin-top:10px" onclick="closeModal();setTimeout(()=>$('#pos-q')&&$('#pos-q').focus(),250)">Start new sale ${ic('arrowR',17)}</button></div><div class="receipt-wrap">${receiptHTML(o)}</div></div>`})}
function receiptHTML(o){const st=S.settings;return `<div class="receipt">${st.showLogo?'<div class="rc" style="font:800 18px Inter;letter-spacing:-.5px">monarch.</div>':''}<div class="rc">${esc(st.company)}<br>${esc(st.address)}<br>${esc(st.phone)}${st.showVat?'<br>Tax ID: '+esc(st.vat):''}</div><hr><div class="rc rb">${esc(st.receiptHeader)}</div><hr><div class="rl"><span>${o.inv}</span><span>${new Date(o.time).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span></div><div class="rl"><span>Cashier: ${esc(o.cashier)}</span><span>${o.reg}</span></div>${o.cid?`<div>Member: ${esc(o.customer)}</div>`:''}<hr>${o.items.map(i=>`<div>${esc(i.name)}</div><div class="rl"><span>&nbsp; ${i.qty} × ${money(i.price)}${i.disc?` (−${i.disc}%)`:''}</span><span>${money(i.qty*i.price*(1-i.disc/100))}</span></div>`).join('')}<hr><div class="rl"><span>Subtotal</span><span>${money(o.sub)}</span></div>${o.itemDisc?`<div class="rl"><span>Item discounts</span><span>−${money(o.itemDisc)}</span></div>`:''}${(o.lines||[]).map(l=>`<div class="rl"><span>${esc(l.name.length>24?l.name.slice(0,23)+'…':l.name)}</span><span>−${money(l.amt)}</span></div>`).join('')}${o.invDisc?`<div class="rl"><span>${esc(o.invLabel||'Discount')}</span><span>−${money(o.invDisc)}</span></div>`:''}<div class="rl"><span>Tax ${st.taxRate}% ${st.taxInclusive?'incl.':''}</span><span>${money(o.tax)}</span></div><div class="rl rb" style="font-size:15px;margin-top:4px"><span>TOTAL</span><span>${money(o.total)}</span></div><hr>${o.pays.map(p=>`<div class="rl"><span>${p.method}${p.ref?' '+p.ref:''}</span><span>${money(p.tendered||p.amount)}</span></div>`).join('')}${o.change?`<div class="rl rb"><span>CHANGE</span><span>${money(o.change)}</span></div>`:''}${o.earned?`<div class="rl"><span>Points earned</span><span>+${o.earned}</span></div>`:''}<hr><div class="rc">${esc(st.receiptFooter)}</div>${st.showBarcode?barcodeSVG(o.inv,220,50):''}</div>`}
document.addEventListener('keydown',e=>{if(S.page!=='pos'||$('#modal-root .ov')||$('#auth-root .auth-ov'))return;if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();$('#pos-q').focus()}if(e.key==='F9'){e.preventDefault();openPay()}if(e.key==='F8'){e.preventDefault();holdSale()}});

/* ================= ORDERS ================= */
S.ord={q:'',status:'All'};
PAGES.orders=()=>{const list=branchOrders();const done=list.filter(o=>o.status!=='Refunded');const rev=sum(done,o=>o.total-(o.refunded||0));return `<div class="page">${head('Sales operations','Sales & Orders','Every sale, payment, return and exchange — live from your database.',`<button class="btn" onclick="exportOrders()">${ic('download',16)} Export sales</button><button class="btn pri" onclick="go('pos')">${ic('plus',16,2.4)} New sale</button>`)}<section class="grid g4 mb">${kpi('Sales revenue',cu(rev,'money'),'','trend','var(--primary)',null,0,'net completed sales')}${kpi('Transactions',cu(list.length),'','receipt','var(--teal)',null,1,'total invoices')}${kpi('Average ticket',cu(done.length?rev/done.length:0,'money'),'','wallet','var(--warning)',null,2,'per completed order')}${kpi('Returns & refunds',cu(sum(list,o=>o.refunded||0),'money'),'','undo','var(--danger)',null,3,'total refunded')}</section><section class="card pad rv" style="--i:4"><div class="row between wrap mb"><div class="seg">${['All','Completed','On account','Partially refunded','Refunded'].map(s=>`<button class="${S.ord.status===s?'on':''}" onclick="S.ord.status='${s}';refresh()">${s} <span class="muted xs">${s==='All'?list.length:list.filter(o=>o.status===s).length}</span></button>`).join('')}</div><label class="search">${ic('search',16)}<input placeholder="Search invoice, customer, cashier…" value="${esc(S.ord.q)}" oninput="S.ord.q=this.value;$('#otab').innerHTML=ordersTable(filtOrders())"></label></div><div id="otab">${ordersTable(filtOrders())}</div></section>${foot()}</div>`};
function filtOrders(){const q=S.ord.q.toLowerCase();return branchOrders().filter(o=>(S.ord.status==='All'||o.status===S.ord.status)&&(o.inv+o.customer+o.cashier+o.pays.map(p=>p.method).join()).toLowerCase().includes(q))}
function exportOrders(){exportCSV('sales',[['Invoice','Date','Customer','Items','Subtotal','Discounts','Tax','Total','Payments','Status','Cashier','Branch'],...filtOrders().map(o=>[o.inv,new Date(o.time).toLocaleString('en-GB'),o.customer,sum(o.items,i=>i.qty),o.sub,r2((o.itemDisc||0)+(o.promo||0)+(o.invDisc||0)),o.tax,o.total,o.pays.map(p=>p.method+' '+p.amount).join(' + '),o.status,o.cashier,o.branch])])}
function orderDrawer(id){const o=S.orders.find(x=>x.id===id);if(!o)return;drawer(`<div class="dh"><div class="kpi-ic" style="width:46px;height:46px">${ic('receipt',20)}</div><div style="flex:1"><div class="row" style="gap:8px"><h2 class="display" style="margin:0;font-size:20px">${o.inv}</h2>${statusBadge(o.status)}</div><div class="sm muted">${fmtTime(o.time)} · ${o.reg} · ${o.branch} · ${o.channel}</div></div><button class="btn ghost sm icon" onclick="closeDrawer()">${ic('x',16)}</button></div><div class="db"><div class="kv"><div><small>Total</small><b>${money(o.total)}</b></div><div><small>Refunded</small><b style="color:${o.refunded?'var(--danger)':'inherit'}">${money(o.refunded)}</b></div><div><small>Customer</small><b style="font-size:14px">${esc(o.customer)}</b></div><div><small>Cashier</small><b style="font-size:14px">${esc(o.cashier)}</b></div></div><div class="sec-t">Items</div>${o.items.map(i=>`<div class="li"><div class="pimg" style="width:36px;height:36px;font-size:18px;background:${catMeta(P(i.id).cat).tone}">${i.emoji||'🛍️'}</div><div style="flex:1"><b style="font-size:13px">${esc(i.name)}</b><div class="xs muted">${i.qty} × ${money(i.price)}${i.disc?' · −'+i.disc+'%':''}${i.returned?` · <span style="color:var(--danger)">${i.returned} returned</span>`:''}</div></div><b class="num">${money(i.qty*i.price*(1-i.disc/100))}</b></div>`).join('')}<div class="sec-t">Payment</div><div class="ml"><span>Subtotal</span><b>${money(o.sub)}</b></div>${(o.itemDisc||0)+(o.promo||0)+(o.invDisc||0)?`<div class="ml promo"><span>Discounts & promotions</span><b>−${money((o.itemDisc||0)+(o.promo||0)+(o.invDisc||0))}</b></div>`:''}<div class="ml"><span>Tax</span><b>${money(o.tax)}</b></div>${o.pays.map(p=>`<div class="ml"><span>${ic(payIc[p.method]||'card',13)} ${p.method} ${p.ref||''}</span><b>${money(p.amount)}</b></div>`).join('')}<div class="sec-t">Timeline</div><div class="tl"><div style="--c:var(--primary)"><b>Sale created</b><small>${fmtTime(o.time)} · ${esc(o.cashier)}</small></div><div style="--c:var(--success)"><b>Payment captured · ${money(o.total)}</b><small>${o.pays.map(p=>p.method).join(' + ')}</small></div>${o.refunds?o.refunds.map(r=>`<div style="--c:var(--danger)"><b>${r.exchange?'Exchange':'Refund'} · ${money(r.amt)}</b><small>${fmtTime(r.time)} · ${r.reason} · to ${r.to}</small></div>`).join(''):''}${o.status==='Refunded'&&!o.refunds?`<div style="--c:var(--danger)"><b>Refunded in full</b><small>Approved</small></div>`:''}</div></div><div class="df"><button class="btn" onclick="printHTML(receiptHTML(S.orders.find(x=>x.id==='${o.id}')))">${ic('printer',15)} Print</button><button class="btn" onclick="emailReceipt('${o.id}')">${ic('mail',15)} Email</button><button class="btn" onclick="smsReceipt('${o.id}')">${ic('msg',15)} WhatsApp</button>${o.status!=='Refunded'?`<button class="btn" onclick="returnModal('${o.id}',true)">${ic('swap',15)} Exchange</button><button class="btn danger" onclick="returnModal('${o.id}')">${ic('undo',15)} Refund</button>`:''}</div>`)}
function returnModal(id,exchange){const o=S.orders.find(x=>x.id===id);closeDrawer();setTimeout(()=>modal({title:exchange?'Exchange items':'Return & refund',sub:`${o.inv} · ${esc(o.customer)}`,icon:exchange?'swap':'undo',iconC:'var(--danger)',size:'lg',body:`<div class="tw"><table><thead><tr><th></th><th>Item</th><th>Sold</th><th>Return qty</th><th class="tr">Value</th></tr></thead><tbody>${o.items.map((i,k)=>{const left=i.qty-(i.returned||0);return `<tr><td><input type="checkbox" class="rt-c" data-k="${k}" ${left?'checked':'disabled'} onchange="rtCalc('${id}')"></td><td><b>${i.emoji||'🛍️'} ${esc(i.name)}</b></td><td>${i.qty}</td><td><select class="sel rt-q" data-k="${k}" style="width:80px;height:34px" onchange="rtCalc('${id}')" ${left?'':'disabled'}>${Array.from({length:left},(_,n)=>`<option ${n===left-1?'selected':''}>${n+1}</option>`).join('')||'<option>0</option>'}</select></td><td class="tr num">${money(i.price*(1-i.disc/100))} ea</td></tr>`}).join('')}</tbody></table></div><div class="fgrid mt"><label class="field">Reason<select class="sel" id="rt-r"><option>Changed mind</option><option>Damaged / faulty</option><option>Wrong item</option><option>Expired product</option><option>Other</option></select></label>${exchange?'<div></div>':`<label class="field">Refund to<select class="sel" id="rt-to"><option>Original tender</option><option>Store credit</option><option>Cash</option></select></label>`}<label class="row sm full" style="gap:10px"><label class="switch"><input type="checkbox" id="rt-s" checked><span></span></label> Return items to sellable stock</label></div><div class="due" style="margin:18px 0 0"><div><small>${exchange?'EXCHANGE CREDIT':'REFUND AMOUNT'}</small><b id="rt-v">${money(0)}</b></div><div class="xs" style="color:#aab0d3;max-width:200px;text-align:right">Refunds over ${money(S.settings.refundPinLimit)} need manager approval</div></div>`,foot:`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn ${exchange?'pri':'danger'}" onclick="doReturn('${id}',${!!exchange})">${exchange?'Continue to new sale':'Process refund'}</button>`}),230);setTimeout(()=>rtCalc(id),300)}
function rtSel(id){const o=S.orders.find(x=>x.id===id);return $$('.rt-c').filter(c=>c.checked).map(c=>{const k=+c.dataset.k;const q=+$(`.rt-q[data-k="${k}"]`).value;const i=o.items[k];return{k,q,amt:r2(q*i.price*(1-i.disc/100)*(o.total/Math.max(.01,o.sub-(o.itemDisc||0))||1))}})}
function rtCalc(id){const v=$('#rt-v');if(v)v.textContent=money(Math.min(sum(rtSel(id),x=>x.amt),S.orders.find(x=>x.id===id).total))}
function doReturn(id,exchange){const o=S.orders.find(x=>x.id===id);const sel=rtSel(id);if(!sel.length)return toast('Select at least one item','warn');const amt=r2(Math.min(sum(sel,x=>x.amt),o.total-o.refunded));const reason=$('#rt-r').value,to=exchange?'Exchange credit':$('#rt-to').value,restock=$('#rt-s').checked;const uName=S.user?S.user.name:'Faizan Rizwan';const run=()=>{sel.forEach(s=>{const i=o.items[s.k];i.returned=(i.returned||0)+s.q;if(restock&&S.products.some(p=>p.id===i.id)){P(i.id).stock+=s.q;S.movements.unshift({time:new Date(),pid:i.id,type:'Return',qty:s.q,reason:o.inv,user:uName})}});o.refunded=r2(o.refunded+amt);o.refunds=o.refunds||[];o.refunds.push({amt,reason,to,time:new Date(),exchange});o.status=o.items.every(i=>(i.returned||0)>=i.qty)?'Refunded':'Partially refunded';audit('refund',`${exchange?'Exchange':'Refund'} processed · ${o.inv}`,money(amt));if(exchange){S.cart.inv={type:'fixed',value:amt,code:'',label:'Exchange credit · '+o.inv};toast(`${money(amt)} exchange credit applied to new sale`);go('pos')}else{toast(`Refund of <b>${money(amt)}</b> processed to ${to.toLowerCase()}`);refresh()}};closeModal();if(amt>S.settings.refundPinLimit&&!isAdmin())setTimeout(()=>pinPrompt(`Authorise a ${money(amt)} ${exchange?'exchange':'refund'} on ${o.inv}`,run),220);else setTimeout(run,220)}
