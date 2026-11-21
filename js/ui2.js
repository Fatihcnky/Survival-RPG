'use strict';
// ===== ARAYÜZ 2: yenilenmiş HUD, görev kutusu, teknoloji ağacı, halk & ordu paneli, seçim araçları =====
const SEAS_IC=['🌱','☀️','🍂','❄️'],AGE_IC=['🪨','🥉','⚔️','🏰','💥'];

function chip(k){
 const v=Math.floor(S.res[k]||0),cap=storeCap(),pct=NOCAP[k]?0:v/cap;
 return '<span class="chip'+(pct>0.95?' full':'')+'" data-a="tab" data-v="res">'+RI[k]+'<b>'+v+'</b>'+(NOCAP[k]?'':'<i style="width:'+Math.min(100,Math.round(pct*100))+'%"></i>')+'</span>';
}
function daysToWinter(){
 const d=curDay(),s=seas();if(s===3)return 0;
 let n=SL[s]-seasonDay(d);for(let i=s+1;i<3;i++)n+=SL[i];return n;
}
function questBox(){
 const q=$('quest');
 if(!S.founded){q.innerHTML='<b>📜 '+(STORY[0].ch||'Başlangıç')+'</b><br>'+STORY[0].t;q.style.display='block';return;}
 const st=STORY[S.story];
 let h='';
 if(st)h+='<b>📜 '+(st.ch?st.ch+' · ':'')+'Görev '+(S.story+1)+'/'+STORY.length+'</b><br>'+st.t+(st.r?' <small>🎁 '+costText(st.r)+'</small>':'');
 else h+='<b>🏆 Tüm görevler tamam!</b>';
 const s=seas(),w=winterNeed();
 if(s===3){h+='<div class="qw">❄ Kış: '+(SL[3]-seasonDay(curDay()))+' gün kaldı · 🌲'+Math.floor(S.res.wood)+' 🍖'+Math.floor(S.res.food)+'</div>';}
 else{
  const dw=daysToWinter();
  if(dw<=SL[2]+SL[1]/2){
   const okW=S.res.wood>=w.wood,okF=S.res.food>=w.food;
   h+='<div class="qw">❄ Kışa '+dw+' gün · <span style="color:'+(okW?'#9be59b':'#ff9a9a')+'">🌲'+Math.floor(S.res.wood)+'/'+w.wood+'</span> <span style="color:'+(okF?'#9be59b':'#ff9a9a')+'">🍖'+Math.floor(S.res.food)+'/'+w.food+'</span></div>';
  }
 }
 q.innerHTML=h;q.style.display='block';
}
function updHud(){
 let h='<div class="row1">';
 const MAINR=['food','wood','stone','iron','gold'],hx=!!UI.hudX;
 if(S.founded)RES.forEach(k=>{if(!hx&&!MAINR.includes(k))return;if(HIDE0[k]&&S.res[k]<0.5)return;h+=chip(k);});
 else['food','wood','stone','gold'].forEach(k=>{h+=chip(k);});
 if(S.founded)h+='<span class="chip" data-a="hudx" title="Kaynakları aç/kapat">'+(hx?'▲':'▼')+'</span>'+(hx?'<span class="chip" data-a="tab" data-v="res">📊 Detay</span>':'');
 h+='</div>'+(S.founded&&S.fv&&hx?foodRow():'')+'<div class="row2">';
 const td=(S.t%DAY)/DAY,night=td>0.78||td<0.06,hp=Math.round(S.happy);
 h+='<span class="chip">👥<b>'+popNow()+'/'+popCap()+'</b></span>';
 h+='<span class="chip">'+(hp>=65?'😄':hp>=40?'🙂':hp>=20?'😟':'😡')+'<b>'+hp+'</b></span>';
 h+='<span class="chip wide">'+SEAS_IC[seas()]+' <b>'+dayText()+'</b> '+(night?'🌙':'☀')+'<i style="width:'+Math.round(td*100)+'%;background:'+(night?'#8ab4ff':'#ffd54f')+'"></i></span>';
 h+='<span class="chip">'+AGE_IC[S.age]+'<b>'+AGES[S.age]+'</b></span>';
 h+='<span class="chip">'+RANKS[S.rank]+'</span>';
 if(S.epi)h+='<span class="chip warn">🤒 Salgın</span>';
 if(S.drought>0)h+='<span class="chip warn">☀ Kuraklık</span>';
 if(S.starve>0)h+='<span class="chip bad">☠ AÇLIK</span>';
 if(S.cold>0)h+='<span class="chip bad">🥶 DONMA</span>';
 if(S.ageProg)h+='<span class="chip">🌟'+Math.ceil(S.ageProg.left)+'sn</span>';
 if(S.research)h+='<span class="chip">🔬'+Math.ceil(S.research.left)+'sn</span>';
 const wn=S.units.filter(u=>u.wnd).length;if(wn)h+='<span class="chip warn">🩹 '+wn+'</span>';
 h+='</div>';
 const top=$('top');top.innerHTML=h;
 questBox();
 const y=top.offsetHeight+4,qh=$('quest').offsetHeight;
 $('mm').style.top=y+'px';$('quest').style.top=y+'px';$('log').style.top=(y+qh+4)+'px';
 armyBar();
}

// ---------- alt çubuk ----------
function tb(ic,label,a,v){return '<button class="tb'+(UI.tab===v&&a==='tab'?' on':'')+'" data-a="'+a+'"'+(v!=null?' data-v="'+v+'"':'')+'><span>'+ic+'</span>'+label+'</button>';}
function buildBar(){
 let h='';
 if(!S.founded){h+=tb('🏛','Köyü Kur','found')+tb('👥','Hepsini Seç','selall');}
 else{
  h+=tb('🔨','Yapı','tab','build')+tb('👥','Halk','tab','people')+tb('⚔','Ordu','tab','army')+tb('🔬','Araştır','tab','tech')+tb('📈','İlerleme','tab','prog')+tb('👑','Hanedan','tab','dyn')+tb('🕊','Diplomasi','tab','dip')+tb('💱','Pazar','tab','mkt')+tb('📜','Görev','tab','quest')+tb('🛣','Yol','road');
 }
 h+=tb('⏩','x'+S.speed,'speed')+tb(AUD&&AUD.muted?'🔇':'🔊','Ses','mute')+tb('💾','Hızlı Kayıt','save')+tb('☰','Menü','igmenu');
 $('bar').innerHTML=h;
}

// ---------- teknoloji ağacı ----------
function techState(id){
 const t=TECH[id];
 if(S.techs[id])return'done';
 if(S.research&&S.research.id===id)return'busy';
 if(t.age>S.age)return'lock';
 if(t.req&&!t.req.every(r=>S.techs[r]))return'lock';
 return'avail';
}
function pTech(){
 let h='';
 if(S.research){const t=TECH[S.research.id];h+='<div class="card cur">🔬 <b>'+t.n+'</b> '+bar(1-S.research.left/t.time)+' <span>'+Math.ceil(S.research.left)+'sn</span></div>';}
 else h+='<div class="card cur"><small>Araştırma kuyruğu boş — aşağıdan bir teknoloji seç.</small></div>';
 const done=Object.keys(S.techs).length,all=Object.keys(TECH).length;
 h+='<small>İlerleme: '+done+'/'+all+' teknoloji '+bar(done/all)+'</small>';
 for(let a=0;a<AGES.length;a++){
  const ids=Object.keys(TECH).filter(id=>TECH[id].age===a);if(!ids.length)continue;
  h+='<h4 class="agehd'+(a>S.age?' lk':'')+'">'+AGE_IC[a]+' '+AGES[a]+(a>S.age?' 🔒':'')+'</h4><div class="grid">';
  ids.forEach(id=>{
   const t=TECH[id],st=techState(id);
   const need=t.req?t.req.filter(r=>!S.techs[r]).map(r=>TECH[r].n):[];
   h+='<div class="tcard '+st+'">'
    +'<div class="th"><b>'+t.n+'</b><span>'+(st==='done'?'✔':st==='busy'?'🔬':st==='lock'?'🔒':'')+'</span></div>'
    +'<small>'+t.d+'</small>'
    +(t.req?'<div class="rq">'+(need.length?'⛓ Gerekli: '+need.join(', '):'⛓ '+t.req.map(r=>TECH[r].n).join(', ')+' ✔')+'</div>':'')
    +(st==='avail'?'<div class="cs">'+cstr(t.cost)+' · '+t.time+'sn</div>'+btn('Araştır','tech',id,!!S.research||!afford(t.cost)):'')
    +(st==='lock'&&t.age>S.age?'<div class="rq">🕰 '+AGES[t.age]+' gerekli</div>':'')
    +(st==='busy'?'<div class="cs">'+bar(1-S.research.left/t.time)+'</div>':'')
    +'</div>';
  });
  h+='</div>';
 }
 return h;
}

// ---------- halk ----------
function pPeople(){
 const n=villagerCount(),cap=popCap(),tc=S.blds.find(b=>b.t==='tc'&&b.team==='p'&&b.done);
 const wn=S.units.filter(u=>u.wnd&&u.team==='p').length,sl=S.units.filter(u=>u.st==='sleep'&&u.team==='p').length;
 let h='<div class="stats">'
  +'<div class="stat">🧑<b>'+n+'</b><small>köylü</small></div>'
  +'<div class="stat">🏠<b>'+popNow()+'/'+cap+'</b><small>nüfus</small>'+bar(popNow()/Math.max(1,cap))+'</div>'
  +'<div class="stat">💤<b>'+idleCount()+'</b><small>boşta</small></div>'
  +'<div class="stat">🙂<b>'+Math.round(S.happy)+'</b><small>mutluluk</small></div>'
  +(wn?'<div class="stat">🩹<b>'+wn+'</b><small>yaralı</small></div>':'')
  +(sl?'<div class="stat">🌙<b>'+sl+'</b><small>uyuyor</small></div>':'')
  +'</div>';
 h+='<div class="row">'+(tc?btn('🧑 Köylü çağır','train','koylu',false,tc.id)+btn('×5','train5','koylu',false,tc.id):'')+btn('⚖ Otomatik dağıt','autojobs')+'</div>';
 if(tc)h+='<small>Köylü: '+cstr(UT.koylu.cost)+' · kuyruk: '+tc.q.length+' · Geceleri halk uyur, gündüz çalışır; yaralılar hastanede (yoksa evde) iyileşir.</small>';
 const hs=S.blds.filter(b=>b.team==='p'&&b.t==='ev'&&b.done);
 if(hs.length){const hh=households();h+='<h4>🏘 Haneler ('+hs.length+')</h4><div class="hh">'+hs.slice(0,16).map(b=>'<span class="hc" data-a="jump" data-x="'+b.x+'" data-y="'+b.y+'">'+(b.lvl?'⭐':'🏠')+' '+famName(b)+' <b>'+hh.get(b.id)+'</b></span>').join('')+(hs.length>16?'<span class="hc">+'+(hs.length-16)+'</span>':'')+'</div>';}
 h+='<h4>⚒ İş dağılımı</h4><div class="grid">';
 JOBS.forEach(j=>{
  const cap2=jobCap(j.id),want=S.jobs[j.id]||0,have=jobCount(j.id),lock=j.bt&&cap2===0;
  h+='<div class="jcard'+(lock?' lk':'')+'"><div class="th"><b>'+j.ic+' '+j.n+'</b><span>'+have+'/'+want+'</span></div>'
   +bar(want?have/want:0)
   +'<small>'+(lock?'🔒 '+BT[j.bt].n+' gerekli':j.d+(j.bt?' · yuva '+cap2:''))+'</small>'
   +'<div class="pm">'+btn('−','jm',j.id)+btn('+','jp',j.id)+'</div></div>';
 });
 return h+'</div>';
}

// ---------- ordu ----------
function armyBar(){
 const el=$('selbar');if(!el)return;
 const panelOpen=UI.tab||(UI.sel&&UI.sel.kind==='b')||UI.place||UI.road;
 const sd=S.founded&&!panelOpen?soldiers():[];
 let h='';
 const us=UI.sel&&UI.sel.kind==='u'?UI.sel.ids.map(id=>UM.get(id)).filter(Boolean):[];
 if(us.length&&!panelOpen){
  const mil=us.filter(u=>UT[u.t].mil);
  h+='<span class="sbn">'+(us.length===1?UT[us[0].t].g+' '+UT[us[0].t].n+(us[0].nm?' '+us[0].nm:'')+(us[0].pt&&VT[us[0].pt]?' ['+VT[us[0].pt].n+']':'')+(us[0].job?' ('+JOBNAME(us[0].job)+')':'')+' ❤'+Math.ceil(us[0].hp):'✅ '+us.length+' birim seçili')+'</span>';
  if(mil.length){h+=btn('🛑 Dur','hold')+btn('🏠 Geri çek','retreat')+btn('≡ Aynı tip','seltype',us[0].t);}
  h+=btn('⚔ Tüm ordu','selarmy')+btn('✖','desel');
 }else if(sd.length){
  h+=btn('⚔ Ordu ('+sd.length+')','selarmy')+btn(UI.box?'▭ Kutu: AÇIK':'▭ Kutu seç','box');
 }
 if(!(us.length&&!panelOpen)&&S.founded&&typeof militia==='function'){
  if(S.dyn&&heroOf('ruler'))h+=btn('📯 Milis çağır ('+militia().length+'/'+milCap()+')','callmil');
  else if(militia().length)h+=btn('🏠 Milisi dağıt','relmil');
 }
 if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h;}
 el.style.display=h?'flex':'none';
}
function pArmy(){
 const sd=soldiers();const cnt={};sd.forEach(u=>cnt[u.t]=(cnt[u.t]||0)+1);
 let h='<div class="stats"><div class="stat">⚔<b>'+sd.length+'</b><small>asker</small></div>';
 Object.keys(cnt).forEach(k=>{h+='<div class="stat" data-a="seltype" data-v="'+k+'" style="cursor:pointer">'+UT[k].g+'<b>'+cnt[k]+'</b><small>'+UT[k].n+'</small></div>';});
 h+='</div>';
 h+='<div class="row">'+btn('⚔ Tüm orduyu seç','selarmy')+btn('▭ Kutu seç','box')+btn('🏠 Geri çek','retreat')+btn('🛑 Dur','hold')+'</div>';
 h+='<small>Seç → haritaya dokun: yürü · düşmana dokun: saldır. Askere çift dokun: aynı türdekilerin hepsini seçer. Kutu seçimde parmağını sürükle.</small>';
 h+='<h4>Eğitim</h4><div class="grid">';
 ['mizrakli','kilic','okcu','atliokcu','atli','kocbasi','mancinik','top'].forEach(t=>{
  const d=UT[t],b=bestTrainer(t),why=canTrain(t)||(b?'':BT[Object.keys(BT).find(k=>BT[k].train&&BT[k].train.includes(t))].n+' gerekli');
  h+='<div class="jcard'+(why?' lk':'')+'"><div class="th"><b>'+d.g+' '+d.n+'</b></div><small>❤'+d.hp+' ⚔'+d.atk+' 🛡'+d.arm+'</small><small>'+(why?'🔒 '+why:cstr(d.cost)+' · '+d.time+'sn')+'</small><div class="pm">'+btn('+1','train',t,!!why,b?b.id:0)+btn('×5','train5',t,!!why,b?b.id:0)+'</div></div>';
 });
 return h+'</div>';
}
function selectInRect(x1,y1,x2,y2){
 const a=toTile(Math.min(x1,x2),Math.min(y1,y2)),b=toTile(Math.max(x1,x2),Math.max(y1,y2));
 let us=S.units.filter(u=>u.team==='p'&&!u.dead&&u.x>=a.x&&u.x<=b.x&&u.y>=a.y&&u.y<=b.y);
 const mil=us.filter(u=>UT[u.t].mil);if(mil.length)us=mil;
 UI.sel=us.length?{kind:'u',ids:us.map(u=>u.id)}:null;UI.tab=null;updPanel(true);
}
function selectSameType(u){
 const a=toTile(0,0),b=toTile(innerWidth,innerHeight);
 const us=S.units.filter(o=>o.team==='p'&&!o.dead&&o.t===u.t&&o.x>=a.x-2&&o.x<=b.x+2&&o.y>=a.y-2&&o.y<=b.y+2);
 UI.sel={kind:'u',ids:us.map(o=>o.id)};UI.tab=null;updPanel(true);
}

// ---------- ek eylemler ----------
function focusTile(x,y){
 const pn=$('panel'),open=pn.style.display!=='none'&&pn.offsetHeight>0;
 const top=$('top').offsetHeight,bot=open?innerHeight-pn.getBoundingClientRect().top:60;
 const yv=(top+(innerHeight-bot))/2,s=sc();
 S.cam.x=x;S.cam.y=y-(yv*DPR-CH/2)/s;clampCam();
}
const _act=act;
act=function(a,v,w,el){
 switch(a){
  case 'box':UI.box=!UI.box;log(UI.box?'▭ Kutu seçim: parmağını sürükleyerek askerleri seç.':'Kutu seçim kapandı.');UI.tab=null;updPanel(true);return;
  case 'hold':{const us=UI.sel&&UI.sel.kind==='u'?UI.sel.ids.map(id=>UM.get(id)).filter(Boolean):soldiers();us.forEach(u=>{if(UT[u.t].mil){u.st='idle';u.tg=0;u.path=null;u.forced=0;}});return;}
  case 'seltype':{const sd=soldiers().filter(u=>u.t===v);UI.sel={kind:'u',ids:sd.map(u=>u.id)};UI.tab=null;updPanel(true);return;}
  case 'desel':UI.sel=null;updPanel(true);return;
  case 'mute':if(typeof audToggle==='function')audToggle();buildBar();return;
  case 'jump':focusTile(+el.dataset.x+0.5,+el.dataset.y+0.5);return;
  case 'tutskip':tutSkip();return;
  case 'tutok':tutNext(true);return;
 }
 return _act(a,v,w,el);
};
