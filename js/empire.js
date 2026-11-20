'use strict';
// ===== İMPARATORLUK, MEGA YAPILAR, KARARNAMELER, UYARI PANELİ =====
BT.kutuphane={n:'Büyük Kütüphane',ic:'📚',w:4,h:4,hp:1200,age:3,cost:{stone:700,gold:600,wood:500},time:110,col:'#c9b48a',d:'Mega yapı: günlük +12 altın, mutluluk +4. Aldora\'nın Mirası gerekir. Bir tane.'};
BT.gozkule={n:'Gökbilim Kulesi',ic:'🔭',w:3,h:3,hp:900,age:3,cost:{stone:800,gold:700,iron:200},time:110,col:'#9fb4d6',d:'Mega yapı: felaketlerin zararını yarıya indirir, yaklaşan felaketi önceden bildirir. Bir tane.'};
BT.saray={n:'Kral Sarayı',ic:'🏯',w:5,h:5,hp:2000,age:3,cost:{stone:1200,gold:1000,wood:600,iron:250},time:150,col:'#d6c27a',d:'Mega yapı: mutluluk +6, günlük +20 altın, vasal sadakati daha yavaş düşer. İmparatorluk için gerekir. Bir tane.'};
['kutuphane','gozkule','saray'].forEach(t=>BCAT[2][1].push(t));
(function(){
 const _pr=placeReason;placeReason=function(t){
  if(t==='kutuphane'||t==='gozkule'||t==='saray'){
   if(!(S.eg&&S.eg.heritage))return'Aldora Mirası gerekir (5 kalıntı)';
   if(countB(t,false)>0)return'Zaten var';
  }
  return _pr(t);};
 const _hf=happyFactors;happyFactors=function(){const f=_hf();if(!S.founded)return f;
  if(countB('kutuphane',true))f.push(['Kütüphane',4]);if(countB('saray',true))f.push(['Saray',6]);
  const d=egDec();if(d.vergi===0)f.push(['Düşük vergi',4]);else if(d.vergi===2)f.push(['Yüksek vergi',-8]);
  if(S.eg&&S.eg.empire)f.push(['İmparatorluk gururu',3]);
  return f;};
 const _rt=rulerTitle;rulerTitle=function(){const r=S.dyn.ruler;return S.eg&&S.eg.empire?(r.female?'İmparatoriçe':'İmparator'):_rt();};
})();
function egDec(){egS();S.eg.dec=S.eg.dec||{vergi:1,tarim:0,orman:0};return S.eg.dec;}
const DECN={vergi:['Vergi','Düşük (+4 mutluluk, gelir yok)','Normal','Yüksek (+altın, -8 mutluluk)'],tarim:['Tarım teşviki','20💰/gün, çiftlik başı +3 yiyecek'],orman:['Orman teşviki','10💰/gün, oduncu başı +6 odun']};
function empireOK(){
 const E=egS();const v=S.kings.filter(k=>k.vassal&&!k.dead).length;
 return {v,ok:S.rank>=4&&E.heritage&&countB('saray',true)>0&&v>=3&&!E.empire};
}
function empireDay(){
 if(!S.founded)return;const E=egS(),d=egDec();
 const pop=popNow();
 if(d.vergi===2)addRes('gold',Math.round(pop*0.35));
 if(d.tarim){if(S.res.gold>=20){S.res.gold-=20;FSRC=null;addRes('food',countB('ciftlik',true)*3);}else{d.tarim=0;log('⚠ Altın yetmedi: Tarım teşviki kapandı.');}}
 if(d.orman){if(S.res.gold>=10){S.res.gold-=10;addRes('wood',countB('oduncu',true)*6);}else{d.orman=0;log('⚠ Altın yetmedi: Orman teşviki kapandı.');}}
 if(countB('kutuphane',true))addRes('gold',12);
 if(countB('saray',true)){addRes('gold',20);S.kings.forEach(k=>{if(k.vassal&&!k.dead)k.loy=Math.min(100,(k.loy==null?55:k.loy)+0.12);});}
 if(E.empire){S.kings.forEach((k,i)=>{if(k.vassal&&!k.dead){const kd=kdOf(i);addRes('gold',Math.round((4+(kd?kd.pop:0)*0.35)*0.5));k.loy=Math.max(0,(k.loy==null?55:k.loy)-0.1);}});}
 // uyarılar
 egAlerts().forEach(a=>{if(a.crit&&S.day%4===0)log('⚠ '+a.t);});
}
function egAlerts(){
 const L=[],w=winterNeed(),sn=seas();
 if(!S.founded)return L;
 if(sn>=1&&S.res.food<w.food*0.6)L.push({t:'Kışlık yiyecek yetersiz ('+Math.floor(S.res.food)+'/'+w.food+')',crit:1});
 if(sn>=1&&S.res.wood<w.wood*0.6)L.push({t:'Kışlık odun yetersiz ('+Math.floor(S.res.wood)+'/'+w.wood+')',crit:1});
 if(S.happy<40)L.push({t:'Halk mutsuz ('+Math.round(S.happy)+')',crit:1});
 S.kings.forEach((k,i)=>{if(k.vassal&&!k.dead&&(k.loy==null?55:k.loy)<30)L.push({t:KINGS[i].n+' vasalı isyana yakın (sadakat '+Math.round(k.loy)+')',crit:1});});
 if(S.raidAt&&S.raidAt-S.day<=2&&S.raidAt>=S.day)L.push({t:'Haydut baskını yaklaşıyor',crit:0});
 const E=S.eg;if(E&&E.nextDis&&E.nextDis-S.day<=3&&E.nextDis>=S.day&&countB('gozkule',true))L.push({t:'Gökbilimciler bir felaket öngörüyor ('+(E.nextDis-S.day)+' gün)',crit:0});
 if(E&&E.act2&&E.nextCult-S.day<=2&&E.nextCult>=S.day)L.push({t:'Kül Tarikatı hareketleniyor',crit:0});
 return L;
}
function stateBlock(){
 const d=egDec(),E=egS(),al=egAlerts();
 let h='<div style="margin:8px 0;padding:6px;border:1px solid #ffffff30;border-radius:8px"><b>📜 Devlet</b><br>';
 h+=al.length?al.map(a=>'<div style="color:'+(a.crit?'#ff9a9a':'#ffd180')+';font-size:12px">'+(a.crit?'⚠ ':'• ')+a.t+'</div>').join(''):'<small>Uyarı yok.</small>';
 h+='<div style="margin-top:4px">'+btn('💰 Vergi: '+['Düşük','Normal','Yüksek'][d.vergi],'dvergi')+btn((d.tarim?'✅':'⬜')+' Tarım teşviki','dtarim')+btn((d.orman?'✅':'⬜')+' Orman teşviki','dorman')+'</div>';
 h+='<small>Vergi Yüksek: gün başına nüfus×0,35 altın ama mutluluk −8. Teşvikler günlük altın harcar.</small>';
 if(E.heritage){const em=empireOK();
  h+='<div style="margin-top:4px">'+(E.empire?'👑 <b>İmparatorluk</b> ilan edildi. Vasallardan +%50 ek haraç.':btn('👑 İmparatorluk ilan et (2500💰)','empire',null,!em.ok||S.res.gold<2500)+'<br><small>Koşul: Krallık rütbesi, Kral Sarayı, 3 vasal (şimdi '+em.v+').</small>')+'</div>';}
 return h+'</div>';
}
(function(){
 const _p=pDyn;pDyn=function(){return _p()+stateBlock();};
 const _a=act;act=function(a,v,w,el){
  if(a==='dvergi'){const d=egDec();d.vergi=(d.vergi+1)%3;updPanel(true);return;}
  if(a==='dtarim'){const d=egDec();d.tarim=d.tarim?0:1;updPanel(true);return;}
  if(a==='dorman'){const d=egDec();d.orman=d.orman?0:1;updPanel(true);return;}
  if(a==='empire'){const em=empireOK();if(em.ok&&S.res.gold>=2500){S.res.gold-=2500;S.eg.empire=1;
   showModal('👑 İMPARATORLUK','Vasal krallar sarayında diz çöktü. Taç artık imparatorluk tacı. '+rulerTitle()+' '+S.dyn.ruler.name+' İmparator ilan edildi!\n\nVasallardan ek haraç gelecek, ama sadakatleri biraz daha çabuk düşecek. İdareni sürdür.',[{t:'Yaşasın!'}]);}
   updPanel(true);return;}
  return _a(a,v,w,el);};
 const _od=onDay;onDay=function(){_od.apply(null,arguments);try{empireDay();}catch(e){console.error(e);}};
})();
if(typeof ACH!=='undefined')ACH.push({id:'empire',n:'İmparator',d:'İmparatorluk ilan et',ok:()=>S.eg&&S.eg.empire},{id:'saray',n:'Saray Sahibi',d:'Kral Sarayı kur',ok:()=>countB('saray',true)>0});
