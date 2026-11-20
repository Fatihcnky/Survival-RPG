'use strict';
// ===== FAZ 3: kuşatma makineleri, casusluk, simya, liman =====
UT.kocbasi={n:'Koçbaşı',g:'🪵',hp:240,atk:42,rng:1.5,rof:2.2,spd:1.6,arm:3,cost:{wood:160,iron:40,gold:30},time:28,age:2,mil:1,siege:1,ram:1};
UT.mancinik={n:'Mancınık',g:'☄',hp:80,atk:36,rng:8,rof:3.6,spd:1.3,arm:0,cost:{wood:200,iron:60,gold:50},time:30,age:3,mil:1,ranged:1,siege:1};
BT.kisla.train=['mizrakli','kilic','kocbasi','mancinik'];
BT.liman={n:'Liman',ic:'⚓',w:3,h:3,hp:420,age:2,cost:{wood:260,stone:120,gold:120},time:40,shore:1,col:'#3a6a8a',d:'SADECE su kenarına. Gemiler her 6 günde bir deniz ticaretinden altın ve kaynak getirir; korsanlar ara sıra yağmalar. Her liman +1 gemi.'};
BT.simya={n:'Simya Laboratuvarı',ic:'⚗',w:3,h:3,hp:360,age:3,cost:{wood:200,stone:200,gold:250,iron:60},time:50,col:'#7a5aa0',d:'Her gün bir iksir üretir (10 altın + 6 yiyecek). İksir: ordunu iyileştirir ve bir gün +%20 saldırı verir. Salgın kaybını azaltır.'};
BCAT[1][1].push('liman');BCAT[2][1].push('simya');
(function(){
 const _fx=fxm;fxm=function(k){let m=_fx(k);if(k==='atk'&&S&&S.alc&&S.alc>S.t)m*=1.2;return m;};
 const _du=drawUnit;drawUnit=function(u){
  if(u.t==='kocbasi'||u.t==='mancinik'){
   const col=u.team==='b'?'#c62828':(u.team==='p'?'#3a6fd8':'#888');
   ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(u.x,u.y+0.3,0.4,0.1,0,0,6.3);ctx.fill();
   ctx.strokeStyle=col;ctx.lineWidth=0.06;ctx.beginPath();ctx.ellipse(u.x,u.y+0.28,0.42,0.14,0,0,6.3);ctx.stroke();
   ctx.drawImage(spr(UT[u.t].g),u.x-0.55,u.y-0.7,1.1,1.1);
   if(u.hp<u.mhp){ctx.fillStyle='#000a';ctx.fillRect(u.x-0.4,u.y-0.8,0.8,0.09);ctx.fillStyle=u.hp/u.mhp>0.5?'#5c5':'#e55';ctx.fillRect(u.x-0.4,u.y-0.8,0.8*u.hp/u.mhp,0.09);}
   return;}
  return _du(u);};
 const _pr=placeReason;placeReason=function(t){if(t==='simya'&&countB('simya',false)>0)return'Zaten var';return _pr(t);};
})();
// ---- casusluk ----
function spyBlock(){
 if(!elcilikOk())return'';
 let h='<h4>🕵 Casusluk</h4><small>Casus: 100💰, krallığın içini açar ve ordusunu bildirir. Sabotaj: 250💰, ambarlarını yakar ama yakalanma riski var.</small>';
 KINGS.forEach((K,i)=>{const s=S.kings[i];if(s.dead||s.vassal)return;
  h+='<div class="row"><b style="color:'+K.col+'">'+K.n.split(' ')[0]+'</b> '+btn('🔎 Casus','spy',i,S.res.gold<100||(s.spyCool||0)>S.day)+btn('🔥 Sabotaj','sab',i,S.res.gold<250||(s.spyCool||0)>S.day)+'</div>';});
 return h;
}
function spyAct(a,i){
 const s=S.kings[i],K=KINGS[i];if(!s||s.dead)return;
 const cost=a==='spy'?100:250;if(S.res.gold<cost||(s.spyCool||0)>S.day)return;
 S.res.gold-=cost;s.spyCool=S.day+6;
 const caught=Math.random()<(a==='spy'?0.12:0.38)*(s.pers==='bilge'?1.4:1);
 if(caught){adjRel(i,a==='spy'?-12:-35);log('🕵 Casusun '+K.n+' tarafından yakalandı! İlişkiler bozuldu.');if(a==='sab'&&Math.random()<0.35&&!s.war){s.war=true;s.pw=1;s.lastWar=S.day;log('⚔ '+K.n+' savaş ilan etti!');}}
 else if(a==='spy'){
  revealC(K.x,K.y,12);const sol=kUnits(i,u=>UT[u.t].mil).length,kd=kdOf(i)||{};
  showModal('🔎 Casus Raporu',K.n+' ('+K.who+'):\nAsker: '+sol+'\nNüfus: '+(kd.pop||'?')+'\nYiyecek: '+Math.round(kd.food||0)+'\nSavaş durumu: '+(s.war?'savaşta':'barış')+'\nİlişki: '+Math.round(s.rel),[{t:'Anladım'}]);}
 else{const kd=kdOf(i);if(kd){kd.food=Math.round((kd.food||0)*0.4);kd.wood=Math.round((kd.wood||0)*0.6);}
  const sol=kUnits(i,u=>UT[u.t].mil);sol.slice(0,3).forEach(u=>u.hp=Math.max(1,u.hp*0.5));
  adjRel(i,-8);log('🔥 Sabotaj başarılı: '+K.n+' ambarları yandı.',K.x,K.y);}
 updPanel(true);
}
// ---- simya ----
function simyaDay(){
 if(!countB('simya',true))return;
 S.pot=S.pot||0;
 if(S.pot<10&&S.res.gold>=10&&S.res.food>=6){S.res.gold-=10;S.res.food-=6;S.pot++;}
}
function potionUse(){
 if(!(S.pot>0))return;S.pot--;S.alc=S.t+DAY;
 let n=0;S.units.forEach(u=>{if(!u.dead&&(u.team==='p'||u.team==='a')&&UT[u.t]&&UT[u.t].mil){u.hp=u.mhp;n++;}});
 log('🧪 İksir içildi: '+n+' askerin yarası iyileşti, bir gün boyunca +%20 saldırı.');updPanel(true);
}
// ---- liman / deniz ticareti ----
function seaDay(){
 const L=countB('liman',true);if(!L)return;
 S.sea=S.sea||{next:S.day+6};
 if(S.day<S.sea.next)return;S.sea.next=S.day+6;
 const ships=Math.min(L,4),roll=Math.random();
 const mil=S.units.filter(u=>!u.dead&&u.team==='p'&&UT[u.t].mil).length;
 if(roll<Math.max(0.05,0.22-0.004*mil)){log('🏴‍☠ Korsanlar '+ships+' gemini yağmaladı! Ordu büyütmek korsan riskini azaltır.');return;}
 const g=Math.round((110+Math.min(S.day,300)*0.6)*ships),r=pick(['wood','stone','iron','food']),n=Math.round(60*ships*(1+S.rank*0.3));
 addRes('gold',g);addRes(r,n);
 log('⚓ Gemiler döndü: +'+g+' altın, +'+n+' '+({wood:'odun',stone:'taş',iron:'demir',food:'yiyecek'})[r]+'.');
 S.stats.sea=(S.stats.sea||0)+1;
}
(function(){
 const _p=pDip;pDip=function(){return _p()+spyBlock();};
 const _a=act;act=function(a,v,w,el){
  if(a==='spy'||a==='sab'){spyAct(a,+v);return;}
  if(a==='potion'){potionUse();return;}
  return _a(a,v,w,el);};
 const _od=onDay;onDay=function(){_od.apply(null,arguments);try{simyaDay();seaDay();}catch(e){console.error(e);}};
 const _sb=stateBlock;stateBlock=function(){let h=_sb();if(countB('simya',true))h=h.replace(/<\/div>$/,'<div style="margin-top:4px">'+btn('🧪 İksir ('+(S.pot||0)+')','potion',null,!(S.pot>0))+'<small>Orduyu iyileştirir, 1 gün +%20 saldırı.</small></div></div>');return h;};
})();
if(typeof ACH!=='undefined')ACH.push({id:'sea5',n:'Deniz Kurdu',d:'5 deniz seferi',ok:()=>(S.stats.sea||0)>=5},{id:'spy',n:'Gölge Ajan',d:'Simya Laboratuvarı kur',ok:()=>countB('simya',true)>0});
