'use strict';
// ===== İMPARATORLUK 3: eskort/asker gönderme, ileri diplomasi, evlilikler, kalıntı bekçileri, düzeltmeler =====
UT.kocbasi.g='🐏';
// ---- asker gönderme (ordudan ayrılır, yaralı/ölü döner) ----
function awayList(){return S.units.filter(u=>!u.dead&&u.team==='p'&&UT[u.t].mil&&!UT[u.t].siege&&u.t!=='kahraman');}
function awayAvail(){return awayList().length;}
function awayTake(n){
 const l=awayList().sort((a,b)=>b.hp/b.mhp-a.hp/a.mhp).slice(0,n);
 return l.map(u=>{const s={t:u.t,r:u.hp/u.mhp};u.dead=1;UM.delete(u.id);return s;});
}
function escWin(n,nb){const r=n/(nb*1.4);return r/(r+0.5);}
function backTroops(sn,dieP,woundP,label){
 const tc=mainTC();let d=0,w=0,ok=0;
 sn.forEach(s=>{
  if(Math.random()<dieP){d++;S.stats.lost=(S.stats.lost||0)+1;return;}
  if(!tc)return;const p=spawnPos(tc),u=mkUnit(s.t,'p',p.x,p.y,{st:'idle'});
  if(Math.random()<woundP){u.hp=Math.max(1,Math.round(u.mhp*0.25));w++;}else{u.hp=Math.max(1,Math.round(u.mhp*Math.max(0.7,s.r)));ok++;}
 });
 log('🛡 '+label+': '+(ok+w)+' asker döndü ('+w+' yaralı), '+d+' asker öldü.');
}
function escReturn(u){
 if(u.escDone||!u.escS)return;u.escDone=1;const l=u.escLoss||0;
 backTroops(u.escS,l===2?0.45:l===1?0.14:0.02,l===2?0.3:l===1?0.35:0.08,'Kervan eskortu');
}
function awayDay(){
 if(!S.away||!S.away.length)return;
 S.away=S.away.filter(a=>{
  if(S.day<a.at)return true;
  const k=S.kings[a.i],K=KINGS[a.i],win=Math.random()<escWin(a.sn.length,a.thr);
  if(win){backTroops(a.sn,0.07,0.3,K.n+' seferi');if(k&&k.vassal){k.loy=Math.min(100,(k.loy||55)+12);if(Math.random()<0.3)k.dev=Math.min(3,(k.dev||0)+1);}log('⚔ '+K.n+'\'in sorunu çözüldü.');}
  else{backTroops(a.sn,0.3,0.4,K.n+' seferi');if(k&&k.vassal)k.loy=Math.max(0,(k.loy||55)-6);log('💥 '+K.n+' seferi başarısız oldu, vasalın memnun değil.');}
  return false;});
}
// ---- hostile: yola çıkmış baskıncı haydutlar kralıklarla uğraşmaz ----
(function(){
 const _h=hostile;hostile=function(a,b){
  if((a.team==='f'&&b.team==='b'&&b.st==='raid')||(b.team==='f'&&a.team==='b'&&a.st==='raid'))return false;
  return _h(a,b);};
 // suya doğan haydut/ordu düzeltmesi
 const _mk=mkUnit;mkUnit=function(t,team,x,y,extra){
  if((team==='b'||team==='k')&&inMap(Math.floor(x),Math.floor(y))&&!walk(Math.floor(x),Math.floor(y))){
   let best=null;for(let r=1;r<=14&&!best;r++)for(let a=0;a<16;a++){const X=Math.floor(x+Math.cos(a/16*6.283)*r),Y=Math.floor(y+Math.sin(a/16*6.283)*r);if(inMap(X,Y)&&walk(X,Y)){best={x:X+0.5,y:Y+0.5};break;}}
   if(best){x=best.x;y=best.y;if(extra&&extra.hx!=null&&!walk(Math.floor(extra.hx),Math.floor(extra.hy))){extra.hx=best.x;extra.hy=best.y;}}}
  return _mk(t,team,x,y,extra);};
})();
// ---- kalıntı bekçileri ----
function ruinGuards(){
 const E=S.eg;if(!E||!E.ruins)return;const got=E.ruins.filter(r=>r.got).length;
 for(const r of E.ruins){if(r.got||r.gd)continue;r.gd=1;
  const n=4+Math.min(6,Math.floor(S.day/30))+got*2;
  for(let j=0;j<n;j++){const p=egFindWalk(r.x+1,r.y+1,4)||{x:r.x,y:r.y+2};const t=j===0?'haydutreis':j%3===0?'haydutokcu':j%4===1?'haydutatli':'haydut';
   const u=mkUnit(t,'b',p.x,p.y,{guard:1,hx:r.x+1,hy:r.y+3,st:'idle'});u.hp=u.mhp=Math.round(u.mhp*(j===0?2.8:1.7));u.ds=1.8;if(j===0)u.nm='Kalıntı Nöbetçisi';u.ruin=1;}
 }
}
// ---- ileri diplomasi ----
const DXO=[
 {id:'food',n:'🍖 Yiyecek yardımı (200🍖)',ok:(i,k)=>!k.war&&!k.vassal&&S.res.food>=200},
 {id:'env',n:'🏛 Elçi heyeti (150💰)',ok:(i,k)=>!k.war&&!k.vassal&&S.res.gold>=150},
 {id:'np',n:'📜 Saldırmazlık paktı (250💰, 30 gün)',ok:(i,k)=>!k.war&&!k.vassal&&k.rel>=15&&S.res.gold>=250&&!((k.np||0)>S.day)},
 {id:'trib',n:'💰 Haraç iste (20+ asker)',ok:(i,k)=>!k.war&&!k.vassal&&awayAvail()>=20&&(k.tcd||0)<=S.day},
 {id:'help',n:'🛡 Müttefikten asker iste',ok:(i,k)=>k.pact==='ittifak'&&!k.war&&!k.vassal&&(k.hcd||0)<=S.day},
 {id:'kid',n:'👶 Çocuğu evlendir',ok:(i,k)=>!k.war&&(k.vassal||k.rel>=20)&&marriable().length>0&&S.dyn.heirs.length>=2},
 {id:'rm',n:'💍 Hükümdar evliliği (150💰)',ok:(i,k)=>k.vassal&&!S.dyn.spouse&&S.res.gold>=150}
];
function marriable(){return S.dyn.heirs.filter(h=>h.age>=14);}
function dxBlock(){
 if(typeof elcilikOk==='function'&&!elcilikOk())return '';
 let h='<h4>🧭 İleri Diplomasi</h4><small>Zar: d20 + çevre + prestij. Evlilikle çocuğun hanedandan ayrılır; karşılığında bağ ve çeyiz gelir. En az bir varis hanede kalmalı.</small>';
 KINGS.forEach((K,i)=>{const k=S.kings[i];if(!k||k.dead)return;
  const opts=DXO.filter(o=>(o.id!=='rm'||k.vassal)&&(!k.vassal||['kid','rm'].includes(o.id)));if(!opts.length)return;
  h+='<div style="margin:5px 0;padding:5px;border:1px solid '+K.col+'55;border-radius:8px"><b style="color:'+K.col+'">'+K.n+'</b>'+(k.vassal?' 👑':'')+((k.np||0)>S.day?' <small>📜 pakt '+(k.np-S.day)+'g</small>':'')+'<div class="row">';
  opts.forEach(o=>{h+=btn(o.n,'dx',i,!o.ok(i,k),o.id);});
  h+='</div></div>';});
 return h;
}
function dxDo(i,id){
 const k=S.kings[i],K=KINGS[i];if(!k||k.dead)return;const o=DXO.find(x=>x.id===id);if(!o||!o.ok(i,k))return;
 const P=pr();
 if(id==='food'){S.res.food-=200;adjRel(i,14);const kd=kdOf(i);if(kd)kd.food+=100;log('🍖 '+K.n+'\'e yiyecek yardımı gönderildi (ilişki +14).');}
 else if(id==='env'){S.res.gold-=150;const d=dice(null,k.rel>40?9:12,envBonus());
  if(d.m>=0){adjRel(i,d.r===20?30:16);showModal('🏛 Elçi heyeti',d.txt+'\n\n'+K.who+' elçileri sıcak karşıladı (ilişki artti).',[{t:'Tamam'}]);}
  else{adjRel(i,-6);showModal('🏛 Elçi heyeti',d.txt+'\n\nElçiler eli boş döndü (ilişki -6).',[{t:'Tamam'}]);}}
 else if(id==='np'){S.res.gold-=250;k.np=S.day+30;log('📜 '+K.n+' ile 30 günlük saldırmazlık paktı imzalandı.');}
 else if(id==='trib'){k.tcd=S.day+20;const b=envBonus()+Math.min(4,Math.floor(awayAvail()/10)),d=dice(null,14,b);
  if(d.m>=0){const g=150+S.day*3;addRes('gold',g);adjRel(i,-15);showModal('💰 Haraç',d.txt+'\n\n'+K.who+' ordunun gölgesinde '+g+' altın ödedi (ilişki -15).',[{t:'Tamam'}]);}
  else{adjRel(i,-25);const w=typeof warChance==='function'&&warChance(i,0.3,'haraç tehdidi');showModal('💰 Haraç',d.txt+'\n\n'+K.who+' reddetti ve ilişkiler bozuldu (-25).'+(w?'\nSavaş çıktı!':''),[{t:'Tamam'}]);}}
 else if(id==='help'){k.hcd=S.day+15;const tc=mainTC();if(tc)for(let j=0;j<10;j++){const p=spawnPos(tc);mkUnit(j%2?'okcu':'mizrakli','a',p.x,p.y,{life:DAY*8,st:'idle'});}adjRel(i,-3);log('🛡 '+K.n+' 10 askerini yardıma gönderdi (8 gün kalacaklar).');}
 else if(id==='rm'){S.res.gold-=150;const D=S.dyn,fem=!D.ruler.female;D.spouse={name:K.fam[fem?0:1],age:ri(20,30),trait:traitKey(),female:fem,from:i};k.loy=Math.min(100,(k.loy||55)+25);S.happy=Math.min(100,S.happy+5);showModal('💍 Hanedan evliliği',rulerTitle()+' '+D.ruler.name+' ile '+D.spouse.name+' ('+K.n+') evlendi. Vasalın sana bağlılığı güçlendi (+25).',[{t:'Şerefe!'}]);}
 else if(id==='kid'){
  showModal('👶 Çocuğu evlendir — '+K.n,'Hangi varisi '+K.who+'\'in hanedanıyla evlendireceksin? Varis hanedandan ayrılır.',marriable().map(h=>({t:h.name+' ('+h.age+')',fn:()=>heirMarry(i,h.name)})).concat([{t:'Vazgeç'}]));}
 updPanel(true);
}
function heirMarry(i,name){
 const D=S.dyn,k=S.kings[i],K=KINGS[i],h=D.heirs.find(x=>x.name===name);
 if(!h||D.heirs.length<2||!k||k.dead)return;
 D.heirs=D.heirs.filter(x=>x!==h);if(typeof dismissHero==='function')dismissHero('heir:'+name);
 let t=h.name+' '+K.n+' hanedanına gelin/damat olarak gitti.\n';
 if(k.vassal){k.loy=Math.min(100,(k.loy||55)+30);k.dev=Math.min(3,(k.dev||0)+1);t+='Vasalın sadakati +30 ve kalkınma arttı.';}
 else{adjRel(i,30);if(!k.pact)k.pact='ticaret';else if(k.pact==='ticaret'&&k.rel>=45)k.pact='ittifak';t+='İlişki +30'+(k.pact==='ittifak'?' ve ittifak kuruldu':'')+'.';}
 const g=100+ri(0,250);addRes('gold',g);t+='\nÇeyiz: '+g+' altın.';S.happy=Math.min(100,S.happy+3);pr().g=Math.min(100,pr().g+3);
 showModal('💍 Veliaht evliliği',t,[{t:'Şerefe!'}]);updPanel(true);
}
(function(){
 const _wd=declareWar;declareWar=function(i,byPlayer){if(!byPlayer&&S.kings[i]&&(S.kings[i].np||0)>S.day){return;}return _wd(i,byPlayer);};
 const _p=pDip;pDip=function(){return _p()+dxBlock();};
 const _vd=vassalDay;vassalDay=function(i){_vd(i);const k=S.kings[i];if(!k||!k.vassal||k.dead)return;
  if(k.agent>S.day){addRes('gold',12);k.loy=Math.min(100,(k.loy||55)+0.15);}
  if(k.noRev>S.day){k.lowDays=0;if(k.loy<11)k.loy=11;}};
 const _a=act;act=function(a,v,w,el){
  if(a==='hudx'){UI.hudX=!UI.hudX;updHud();return;}
  if(a==='dx'){dxDo(+v,w);return;}
  return _a(a,v,w,el);};
 const _od=onDay;onDay=function(){_od.apply(null,arguments);try{awayDay();ruinGuards();}catch(e){console.error(e);}};
 // yeni krallıklar daha güçlü gelsin
 const _ex=expandWorld;expandWorld=function(){const had=!!S.world;_ex();if(had)return;
  for(let i=6;i<KINGS.length;i++){try{worldBoost(i);}catch(e){console.error(e);}}};
})();
function worldBoost(i){
 const kd=kdOf(i),K=KINGS[i];kd.food=700;kd.wood=500;kd.stone=350;kd.gold=500;
 for(let j=0;j<7;j++)kBuild(i,'fev');
 for(let j=0;j<2;j++)kBuild(i,'fciftlik');
 kBuild(i,'fkisla');kBuild(i,'fkale');
 for(let j=0;j<4;j++)kBuild(i,'fkule');
 if(!kd.walled){kd.walled=1;kd.gated=1;kWall(i);}
 for(let j=0;j<8;j++)kSpawn(i,'fkoylu');
 const n=18+Math.floor(S.day/12)+(K.pers==='savasci'?8:0);
 for(let j=0;j<n;j++)kSpawn(i,j%4===0?'okcu':j%5===0?'atli':j%3===0?'kilic':'mizrakli');
 kd.lvl=Math.max(kd.lvl||0,2);
}
