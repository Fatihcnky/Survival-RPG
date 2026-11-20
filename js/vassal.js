'use strict';
// ===== VASAL DEVLETLER =====
const VTAX=['Düşük','Normal','Yüksek'];
function offerVassal(i){
 const k=S.kings[i],K=KINGS[i];k.vOffered=1;
 showModal('🏳 '+K.n+' teslim oluyor','Başkenti düştü. '+K.who+' dizlerinin üstüne çöktü:\n\n<b>Vasal yap:</b> Krallık yaşamaya devam eder, sana haraç öder ve savaşta asker yollar. Ama mutsuz olursa bir gün isyan edebilir. Müdahale etmen (destek, vali, haraç oranı) gerekir.\n\n<b>Yok et:</b> Krallık sonsuza dek tarihe karışır.',[
  {t:'👑 Vasal yap',fn:()=>makeVassal(i)},
  {t:'💀 Yok et',fn:()=>{k.vOffered=2;killKingdom(i);}}]);
}
function makeVassal(i){
 const k=S.kings[i],K=KINGS[i];
 k.vOffered=2;k.vassal=true;k.war=false;k.pact=null;k.loy=55;k.vt=1;k.lowDays=0;k.rel=20;
 S.units.forEach(u=>{if(u.team==='k'&&u.kid===i)killU(u);});
 if(!kBlds(i,'ftc').length){const p=kFind(i,4,4);if(p)mkB('ftc','f',p.x,p.y,true,{kid:i});}
 const kd=kdOf(i);kd.food=Math.max(kd.food,120);kd.wood=Math.max(kd.wood,100);
 log('👑 '+K.n+' artık senin vasalın. Diplomasi menüsünden yönetebilirsin.',K.x,K.y);
}
function vassalDay(i){
 const k=S.kings[i],K=KINGS[i],kd=kdOf(i);if(!kd)return;
 const tax=k.vt==null?1:k.vt,pop=kd.pop||0;
 const g=Math.round((4+pop*0.35)*[0.5,1,1.8][tax]);addRes('gold',g);k.tribute=(k.tribute||0)+g;
 const gov=k.gov&&S.day<k.gov;
 k.loy=clamp((k.loy==null?55:k.loy)-0.35*(gov?0.35:1)+[0.25,0,-0.6][tax]-(kd.food<pop*2?0.5:0),0,100);
 if(k.loy<30&&!k.warn){k.warn=1;log('⚠ '+K.n+' halkı huzursuz (sadakat '+Math.round(k.loy)+'). Destek ver ya da haracı düşür.',K.x,K.y);}
 if(k.loy>=40)k.warn=0;
 if(k.loy<=10){k.lowDays=(k.lowDays||0)+1;
  if(k.lowDays>=3){k.vassal=false;k.war=true;k.rel=-80;k.pw=1;k.lastWar=S.day;k.lowDays=0;
   const n=launchWave(i);
   showModal('🔥 Vasal isyanı!',K.n+' halkı sana başkaldırdı! Bağımsızlığını ilan etti ve '+n+' askerlik ordu gönderdi. Yeniden fethedip vasal yapabilirsin.',[{t:'Anladım'}]);}
 }else k.lowDays=0;
}
function vassalBlock(i){
 const k=S.kings[i],K=KINGS[i],kd=kdOf(i)||{pop:0},loy=Math.round(k.loy==null?55:k.loy),gov=k.gov&&S.day<k.gov;
 let h='<div style="margin:6px 0;padding:6px;border:1px solid '+K.col+';border-radius:8px;background:#ffffff0d"><b>👑 '+K.n+'</b> — vasal <small>('+K.who+')</small><br>'
  +'Sadakat: '+loy+' '+bar(loy/100)+' · Nüfus: '+kd.pop+' · Haraç: '+VTAX[k.vt==null?1:k.vt]+' · Toplam gelir: '+Math.round(k.tribute||0)+'💰'+(gov?' · 🏛 vali '+(k.gov-S.day)+' gün':'')+'<br>';
 h+=btn('🎁 Destekle (50💰, +15)','vsup',i,S.res.gold<50);
 h+=btn('💰 Haraç: '+VTAX[k.vt==null?1:k.vt],'vtax',i);
 h+=btn('🏛 Vali ata (200💰)','vgov',i,S.res.gold<200||gov);
 h+=btn('⚔ Asker iste','vtroops',i,(k.vcool||0)>S.day);
 h+=btn('🕊 Özgür bırak','vfree',i);
 h+='<br><small>Sadakat zamanla düşer. 10\'un altında 3 gün kalırsa isyan çıkar. Yüksek haraç gelir artırır ama sadakati düşürür.</small></div>';
 return h;
}
function vassalAct(a,i){
 const k=S.kings[i],K=KINGS[i];if(!k||!k.vassal)return;
 if(a==='vsup'&&S.res.gold>=50){S.res.gold-=50;k.loy=Math.min(100,(k.loy||55)+15);log('🎁 '+K.n+' desteğinden memnun.');}
 else if(a==='vtax'){k.vt=((k.vt==null?1:k.vt)+1)%3;}
 else if(a==='vgov'&&S.res.gold>=200){S.res.gold-=200;k.gov=S.day+25;log('🏛 '+K.n+'\'e vali atandı: sadakat daha yavaş düşecek.');}
 else if(a==='vtroops'&&(k.vcool||0)<=S.day){
  const tc=mainTC(),kd=kdOf(i),sol=kUnits(i,u=>UT[u.t].mil);if(!tc||!sol.length)return;
  const n=Math.min(10,Math.ceil(sol.length*0.6));const p=spawnPos(tc);
  for(let j=0;j<n;j++)mkUnit(j%2?'okcu':'mizrakli','a',p.x+j*0.4,p.y,{life:DAY*1.5,st:'idle'});
  k.vcool=S.day+8;k.loy=Math.max(0,(k.loy||55)-4);log('⚔ '+K.n+' '+n+' asker yolladı (sadakat -4).');}
 else if(a==='vfree'){k.vassal=false;k.pact='ittifak';k.rel=60;log('🕊 '+K.n+' özgür bırakıldı ve müttefikin oldu.');}
 updPanel(true);
}
(function(){const _a=act;act=function(a,v,w,el){if(a==='vsup'||a==='vtax'||a==='vgov'||a==='vtroops'||a==='vfree'){vassalAct(a,+v);return;}return _a(a,v,w,el);};})();
