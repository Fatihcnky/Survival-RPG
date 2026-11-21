'use strict';
// ===== DERİNLEŞTİRME 2: kahraman yetenekleri, kervan riskleri, vasal müdahaleleri, sosyal sınıflar =====
// ---- yeni kahraman yetenekleri ----
HSK.diplo={n:'Diplomat',d:'Olay/pazarlık zarlarına +1 (her seviye)'};
HSK.gizli={n:'Gölge Ağı',d:'Tüm casus zarlarına +1 (her seviye)'};
HSK.sevilen={n:'Sevilen Lider',d:'Mutluluk +2 (her seviye)'};
function rulerSk(k){const p=S.dyn&&personOf('ruler');return (p&&p.sk&&p.sk[k])||0;}
(function(){
 const _eb=envBonus;envBonus=function(){return _eb()+rulerSk('diplo');};
 const _sb=spBonus;spBonus=function(s,k){return _sb(s,k)+rulerSk('gizli');};
 const _hf=happyFactors;happyFactors=function(){const f=_hf();if(!S.founded)return f;
  if(rulerSk('sevilen'))f.push(['Sevilen lider',2*rulerSk('sevilen')]);
  if(S.eg&&S.eg.ozan&&S.day<S.eg.ozan)f.push(['Ozan',3]);
  const C=clsS();if(C.soy<30)f.push(['Soylular huzursuz',-2]);if(C.tuc>=70)f.push(['Refah (tüccarlar)',2]);
  return f;};
})();
// ---- kervan riskleri ----
(function(){
 const _sc=spawnCaravan;spawnCaravan=function(i){
  const before=new Set(S.units.map(u=>u.id));_sc(i);
  const cv=S.units.find(u=>u.t==='kervan'&&!before.has(u.id));if(!cv)return;
  cv.esc=0;
  const mil=awayAvail(),nb=4+Math.floor(S.day/40),base=Math.max(0.05,0.42-Math.min(0.15,mil*0.004));
  const btns=[4,8,14,22].filter(n=>n<=mil||(n===4&&mil>=2)).map(n0=>{const n=Math.min(n0,mil);return {t:'🛡 '+n+' asker gönder (%'+Math.round(100*(1-base+base*escWin(n,nb)))+' ulaşır)',fn:()=>{if(cv.dead||cv.escN)return;const sn=awayTake(n);if(!sn.length){log('⛔ Asker yok.');return;}cv.escN=sn.length;cv.escS=sn;cv.esc=1;log('🛡 '+sn.length+' asker kervana eşlik ediyor (ordudan ayrıldı).');}};});
  btns.push({t:'Sigortala (50💰)',fn:()=>{if(S.res.gold>=50&&!cv.dead){S.res.gold-=50;cv.ins=1;log('📜 Kervan sigortalandı: kaybolursa 150 altın geri ödenir.');}else log('⛔ Altın yetersiz.');}});
  btns.push({t:'Kendi haline bırak ('+'%'+Math.round(100*(1-base))+' ulaşır)'});
  showModal('🐫 Kervan Yola Çıktı',KINGS[i].n+' kervanı sana geliyor. Yolda pusu olabilir (yaklaşık %'+Math.round(base*100)+'). Ne kadar çok asker eşlik ederse ulaşma şansı o kadar artar; ama askerler ordundan ayrılır, dönerken kimi yaralı olur, kimi ölebilir.',btns);
 };
 const _uc=updCaravan;updCaravan=function(u,dt){
  _uc(u,dt);
  if(!u.dead&&u.esc){u.escT=(u.escT||0)-dt;if(u.escT<=0){u.escT=1.5;const es=S.units.filter(x=>x.follow===u.id&&!x.dead&&Math.hypot(x.x-u.x,x.y-u.y)>2.5);if(es.length)cmdMove(es,u.x,u.y,false);}}
  if(u.dead||u.amb)return;const tc=mainTC();if(!tc)return;
  const d=Math.hypot(u.x-tc.x,u.y-tc.y);
  if(d<32&&d>12){u.amb=1;
   const chance=0.42-Math.min(0.15,awayAvail()*0.004),nb=4+Math.floor(S.day/40);
   if(Math.random()<chance){
    if(u.escN){const win=Math.random()<escWin(u.escN,nb);
     if(win){u.escLoss=1;log('🛡 Pusu püskürtüldü! Eskort '+nb+' haydudu dağıttı.',u.x,u.y);}
     else{u.escLoss=2;log('💥 Eskort ezildi, kervan yağmalandı!',u.x,u.y);killU(u);}}
    else{for(let j=0;j<nb;j++){const p=egFindWalk(u.x,u.y,6);if(!p)break;const h=mkUnit(j%2?'haydutokcu':'haydut','b',p.x,p.y,{st:'idle'});h.ds=1.3;h.hp=h.mhp=Math.round(h.mhp*1.3);}
     log('🥷 Kervana pusu kuruldu! '+nb+' haydut yolu kesti.',u.x,u.y);}}
  }
  if(u.dead&&u.escS&&!u.escDone)escReturn(u);
 };
 const _ku=killU;killU=function(u,a){if(u&&u.t==='kervan'&&u.escS&&!u.escDone){setTimeout(()=>escReturn(u),0);}if(u&&u.t==='kervan'&&u.ins&&!u.dead&&u.team==='a'&&u.life>0){addRes('gold',150);log('📜 Sigorta: 150 altın ödendi.');}return _ku(u,a);};
})();
// ---- vasal müdahaleleri ----
function vdev(i){return (S.kings[i].dev||0);}
(function(){
 const _vb=vassalBlock;vassalBlock=function(i){
  const k=S.kings[i];let h=_vb(i);
  h=h.replace(/<br><small>Sadakat zamanla/,'<br>'+btn('🏗 Kalkınma yardımı '+vdev(i)+'/3 (300💰)','vdev',i,S.res.gold<300||vdev(i)>=3)+btn('📜 Fermanı yenile (ücretsiz, -8 sadakat)','vdec',i)+'<br><small>Kalkınma: vasalın haracı +%30 artar, sadakat +10. Ferman: bir hamlede 120 altın alırsın.</small><br><small>Sadakat zamanla');
  return h;};
 const _vd=vassalDay;vassalDay=function(i){
  _vd(i);const k=S.kings[i];if(!k.vassal||k.dead)return;
  const d=vdev(i);if(d)addRes('gold',Math.round(d*0.3*(4+((kdOf(i)||{}).pop||0)*0.35)));
  if(S.day>=(k.vreq||0)&&Math.random()<0.1&&!UI.modalOpen){k.vreq=S.day+18;vasalReq(i);}
 };
 const _a=act;act=function(a,v,w,el){
  if(a==='vdev'){const i=+v,k=S.kings[i];if(k.vassal&&S.res.gold>=300&&vdev(i)<3){S.res.gold-=300;k.dev=vdev(i)+1;k.loy=Math.min(100,(k.loy||55)+10);log('🏗 '+KINGS[i].n+' kalkındı (seviye '+k.dev+').');}updPanel(true);return;}
  if(a==='vdec'){const i=+v,k=S.kings[i];if(k.vassal){addRes('gold',120);k.loy=Math.max(0,(k.loy||55)-8);log('📜 '+KINGS[i].n+'\'den 120 altın alındı.');}updPanel(true);return;}
  return _a(a,v,w,el);};
})();
function vasalReq(i){
 const k=S.kings[i],K=KINGS[i],kind=pick(['kitlik','komsu','vezir']),env=envBonus();
 if(kind==='kitlik')showModal('📨 '+K.n+' (vasal)',K.who+': "Kıtlık yaşıyoruz, efendim. Halkım aç."',[
  {t:'100 yiyecek gönder',fn:()=>{if(S.res.food>=100){S.res.food-=100;k.loy=Math.min(100,(k.loy||55)+18);const kd=kdOf(i);if(kd)kd.food+=100;}else k.loy-=6;}},
  {t:'Haracı iste (+80💰)',fn:()=>{addRes('gold',80);k.loy=Math.max(0,(k.loy||55)-12);}},
  {t:'Yoksay',fn:()=>{k.loy=Math.max(0,(k.loy||55)-8);}}]);
 else if(kind==='komsu')showModal('📨 '+K.n+' (vasal)',K.who+': "Bir haydut sürüsü sınırımızda. Asker gönderirsen ya da kendimiz hallederiz?"',[
  ...[5,10,20].filter(n=>n<=awayAvail()||n===5&&awayAvail()>=2).map(n0=>{const n=Math.min(n0,awayAvail());return {t:'Asker gönder ('+n+' asker, 3 gün, %'+Math.round(escWin(n,6+Math.floor(S.day/20))*100)+' başarı)',fn:()=>{const sn=awayTake(n);if(!sn.length)return;S.away=S.away||[];S.away.push({at:S.day+3,sn,i,thr:6+Math.floor(S.day/20)});log('⚔ '+n+' asker '+K.n+' topraklarına gönderildi (ordudan ayrıldı).');}};}),
  {t:'Kendin halledin',fn:()=>{const d=dice(null,12,0);if(d.m>=0)log('🛡 '+K.n+' tehdidi kendi başına savuşturdu.');else{k.loy=Math.max(0,(k.loy||55)-10);const kd=kdOf(i);if(kd)kd.food=Math.round(kd.food*0.6);log('💥 '+K.n+' yağmalandı, sadakat düştü.');}}}]);
 else showModal('📨 '+K.n+' (vasal)',K.who+'\'in veziri gizlice geldi: "Kralımız son zamanlarda çevresine senden şikâyet ediyor." Ne yapacaksın?',[
  {t:'Vezire rüşvet (100💰)',fn:()=>{if(S.res.gold>=100){S.res.gold-=100;k.loy=Math.min(100,(k.loy||55)+8);k.warn=0;}}},
  {t:'Casus gönder (d20 %'+Math.round(pOdds(12,envBonus())*100)+')',fn:()=>{const d=dice(null,12,envBonus());if(d.m>=0){k.loy=Math.min(100,(k.loy||55)+14);showModal('🕵 Casus',d.txt+'\n\nKomplo bozuldu, vasal sana daha yakın.',[{t:'Tamam'}]);}else{k.loy=Math.max(0,(k.loy||55)-10);showModal('🕵 Casus',d.txt+'\n\nCasus yakalandı, vasal öfkeli.',[{t:'Tamam'}]);}}},
  {t:'Umursama'}]);
}
// ---- sosyal sınıflar ----
function clsS(){S.cls=S.cls||{soy:50,tuc:50};return S.cls;}
function clsDay(){
 if(!S.founded)return;const C=clsS(),d=egDec?egDec():{vergi:1};
 let ds=0,dt=0;
 if(countB('saray',true))ds+=0.2;if(countB('katedral',true)||countB('sapel',true))ds+=0.05;if(S.rank>=2)ds+=0.05;
 if(d.vergi===2){ds-=0.35;dt-=0.35;}else if(d.vergi===0){ds+=0.15;dt+=0.15;}
 if(countB('pazar',true))dt+=0.15;if(countB('han',true))dt+=0.05;if(countB('liman',true))dt+=0.15;
 if(S.units.some(u=>u.t==='kervan'&&!u.dead))dt+=0.1;
 if(S.happy<35)ds-=0.25;
 C.soy=clamp(C.soy+ds-(C.soy-50)*0.004,0,100);C.tuc=clamp(C.tuc+dt-(C.tuc-50)*0.004,0,100);
 if(C.soy>=70)addRes('gold',6);if(C.tuc>=70)addRes('gold',10);
 if(C.tuc<30&&S.res.gold>10)S.res.gold-=8;
 if(C.soy<30&&S.eg&&S.eg.nextPlot&&S.eg.nextPlot-S.day>6)S.eg.nextPlot=S.day+5;
}
function clsBlock(){
 const C=clsS(),b=v=>bar(v/100);
 return '<div style="margin:6px 0;padding:6px;border:1px solid #ffffff30;border-radius:8px"><b>🏛 Sosyal Sınıflar</b><br>🎩 Soylular: '+Math.round(C.soy)+' '+b(C.soy)+' <small>('+(C.soy>=70?'+6💰/gün':C.soy<30?'komplo sıklaşır, -2 mutluluk':'nötr')+')</small><br>🏪 Tüccarlar: '+Math.round(C.tuc)+' '+b(C.tuc)+' <small>('+(C.tuc>=70?'+10💰/gün, +2 mutluluk':C.tuc<30?'-8💰/gün':'nötr')+')</small>'
  +'<div>'+btn('🎩 Ziyafet (80🍖 50💰)','clsa','soy',S.res.food<80||S.res.gold<50)+btn('🏪 Vergi muafiyeti (120💰)','clsa','tuc',S.res.gold<120)+'</div>'
  +'<small>Soylular: Saray, Katedral/Şapel ve rütbe sever, yüksek vergiyi ve mutsuz halkı sevmez. Tüccarlar: Pazar, Han, Liman, kervan sever; yüksek vergiden nefret eder.</small></div>';
}
(function(){
 const _sb=stateBlock;stateBlock=function(){return _sb()+clsBlock();};
 const _a=act;act=function(a,v,w,el){
  if(a==='clsa'){const C=clsS();if(v==='soy'&&S.res.food>=80&&S.res.gold>=50){S.res.food-=80;S.res.gold-=50;C.soy=Math.min(100,C.soy+15);}else if(v==='tuc'&&S.res.gold>=120){S.res.gold-=120;C.tuc=Math.min(100,C.tuc+15);}updPanel(true);return;}
  return _a(a,v,w,el);};
 const _od=onDay;onDay=function(){_od.apply(null,arguments);try{clsDay();}catch(e){console.error(e);}};
})();
