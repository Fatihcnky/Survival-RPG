'use strict';
// ===== OYUN SONU: Kül Tarikatı, Aldora kalıntıları, kaçak liderler, felaketler, 3 son =====
function egS(){S.eg=S.eg||{ruins:[],bosses:[],ends:{},nextDis:0,nextCult:0,dis:0};return S.eg;}
function egFindWalk(cx,cy,r,minFromStart){
 for(let k=0;k<400;k++){
  const x=Math.floor(cx+(Math.random()*2-1)*r),y=Math.floor(cy+(Math.random()*2-1)*r);
  if(!inMap(x,y)||!walkRect(x,y,2,2))continue;
  if(minFromStart&&S.start&&Math.hypot(x-S.start.x,y-S.start.y)<minFromStart)continue;
  return {x,y};
 }
 return null;
}
const RUINLORE=[
 'Yıkık bir kemerin altında Aldora\'nın ilk kralının mühür yüzüğü yatıyor.',
 'Bir sütun dibinde, eski Aldora haritası: yedi kapılı bir şehrin planı.',
 'Toprağın altından bir kehanet tableti çıktı: "Küller yükselince, taç soyuna dönecek."',
 'Paslı bir miğferin içinde Aldora muhafızlarının yemin parşömeni saklıydı.',
 'Taş bir sunakta, Kül Tarikatı\'nın bu kalıntıları neden aradığını anlatan kazınmış yazılar.'
];
function egStartAct2(){
 const E=egS();if(E.act2)return;E.act2=1;
 E.act2Day=S.day;E.nextCult=S.day+30;E.nextDis=Math.min(E.nextDis||999,S.day+20);
 let n=0;
 for(let i=0;i<5;i++){const p=egFindWalk(MW/2+(Math.random()*2-1)*MW*0.38,MH/2+(Math.random()*2-1)*MH*0.38,24,28);if(!p)continue;E.ruins.push({x:p.x,y:p.y,got:0,i});revealC(p.x,p.y,4);n++;}
 showModal('🌑 Küllerin Ötesi','Kara Kale düştü ama Maldric\'in sandığında kül renkli bir mühür buldun. Bertram solgun yüzle fısıldıyor:\n"Maldric kendi başına değildi. Eski Aldora\'nın kalıntılarını arayan bir Kül Tarikatı ona para ve asker verdi. Şimdi lideri öldü, onlar sana yöneliyor."\n\nHarita üzerinde '+n+' Aldora kalıntısı belirdi (🏺). Her birine bir birlik gönder; hepsini toplarsan Aldora\'nın Mirası açılacak. Kül Tarikatı bir yerlerde kamp kuruyor; ama onları kimin beslediğini henüz bilmiyorsun...',[{t:'Hazırım'}]);
}
function egRuinCheck(){
 const E=egS();
 for(const r of E.ruins){
  if(r.got)continue;
  const u=S.units.find(u=>!u.dead&&(u.team==='p')&&Math.hypot(u.x-r.x-1,u.y-r.y-1)<3);
  if(!u)continue;
  r.got=1;addRes('gold',300);addRes('stone',150);
  const left=E.ruins.filter(x=>!x.got).length;
  showModal('🏺 Aldora Kalıntısı',RUINLORE[r.i%RUINLORE.length]+'\n\nÖdül: 300 altın, 150 taş. Kalan kalıntı: '+left,[{t:'Devam'}]);
  if(!left){
   E.heritage=1;addRes('gold',1500);addRes('iron',300);
   showModal('👑 Aldora\'nın Mirası','Tüm parçalar bir araya geldi. Tabletler birleşince gizli bir kapı açıldı: Aldora\'nın eski hazine odası. İçinden altın, demir ve bir kehanet çıktı:\n"Taç yalnız kılıçla değil, refahla da korunur."\n\nÖdül: 1500 altın, 300 demir. Mega yapılar ve imparatorluk yolu açıldı.',[{t:'Muhteşem'}]);
  }
  break;
 }
}
// ---- Kül Tarikatı: nadir kamplar, casus raporu, destekçi krallık ----
function egCultCamp(){
 const E=egS();let tries=0;
 while(tries++<500){
  const x=ri(6,MW-9),y=ri(6,MH-9);
  if(Math.hypot(x-S.start.x,y-S.start.y)<40)continue;
  if(S.blds.some(b=>b.team==='p'&&Math.hypot(b.x-x,b.y-y)<30))continue;
  if(KINGS.some(k=>Math.hypot(k.x-x,k.y-y)<18))continue;
  if(S.camps.some(c=>c.alive&&Math.hypot(c.x-x,c.y-y)<20))continue;
  for(let dy=-3;dy<=4;dy++)for(let dx=-3;dx<=4;dx++){const X=x+dx,Y=y+dy;if(inMap(X,Y)&&OCC[Y*MW+X]===0&&T[Y*MW+X]!==1&&T[Y*MW+X]!==0){T[Y*MW+X]=0;RA[Y*MW+X]=0;}}
  if(!walkRect(x,y,2,2))continue;
  const tent=mkB('tent','b',x,y,true);tent.hp=tent.mhp=Math.round((tent.mhp||200)*2.5);
  const c={id:S.camps.length+1,x,y,tent:tent.id,alive:true,cult:1};S.camps.push(c);
  const n=6+Math.min(4,Math.floor(S.day/40));
  for(let k=0;k<n;k++){const t=k===0?'haydutreis':k%3===0?'haydutokcu':'haydut';
   const u=mkUnit(t,'b',x+0.5+(k%3)-1+0.3,y+2.5+(k/3|0),{guard:1,hx:x+1,hy:y+3,st:'idle'});u.hp=u.mhp=Math.round(u.mhp*(k===0?3.5:1.9));u.ds=1.9;u.cult=1;if(k===0)u.nm='Kül Rahibi';}
  revealC(x,y,4);E.cultMade=(E.cultMade||0)+1;
  log('🔥 Kül Tarikatı bir kamp kurdu!',x,y);return c;
 }
 return null;
}
function egCultRaid(){
 const E=egS(),tc=mainTC();if(!tc)return;
 const cs=S.camps.filter(c=>c.alive&&c.cult);if(!cs.length)return;
 const c=pick(cs),n=clamp(6+Math.floor(S.day/16)+S.rank,8,22);
 for(let i=0;i<n;i++){const t=i%5===0?'haydutatli':i%2?'haydutokcu':'haydutreis';
  const u=mkUnit(t,'b',c.x+(i%6)*0.7,c.y+2+(i/6|0)*0.7,{st:'raid',gt:tc.id});u.hp=u.mhp=Math.round(u.mhp*1.9);u.ds=1.8;u.cult=1;}
 log('🔥 Kül Tarikatı kampından '+n+' fanatik köyüne yürüyor!',c.x,c.y);
}
function egSponsor(){
 const E=egS();if(E.sponsor!=null)return;
 let a=S.kings.map((k,i)=>i).filter(i=>!S.kings[i].dead&&!S.kings[i].vassal);
 if(!a.length){E.sponsor=-1;return;}
 let i=a.find(i=>/Doğu/i.test(KINGS[i].n));if(i==null)i=a[0];
 E.sponsor=i;const K=KINGS[i],k=S.kings[i];
 const spies=typeof spS==='function'&&spS().list.length>0;
 revealC(K.x,K.y,10);
 k.war=true;k.pw=1;k.lastWar=S.day;k.pact=null;k.rel=Math.min(k.rel,-60);
 showModal('🕵 Gizli Rapor',(spies?'Casusların aylardır izlediği bir iz sonunda doğruladı:':'Yakalanan bir tarikat habercisi sorgulandı:')+'\n\n"Kül Tarikatı'+"'"+'nı '+K.n+' ('+K.who+') besliyor. Altın, silah ve sığınak onlardan geliyor. Maldric de aslında bu krallığın piyonuydu."\n\n'+K.n+' artık seninle savaşta. Onu yok et ya da vasal yap: tarikat sonsuza dek susacak.',[{t:'Kararlıyım'}]);
 log('📜 Kül Tarikatı\'nın arkasında '+K.n+' var. Onu yok et!',K.x,K.y);
}
function egCultEnd(by){
 const E=egS();if(E.cultEnded)return;E.cultEnded=1;
 S.units.forEach(u=>{if(u.cult&&!u.dead)killU(u);});
 S.camps.forEach(c=>{if(c.cult&&c.alive){c.alive=false;const b=BM.get(c.tent);if(b)destroyB(b,null);}});
 addRes('gold',2500);addRes('iron',500);
 if(typeof META!=='undefined'&&!S.test){META.pts+=3;saveMeta();}
 S.won=true;
 showModal('🏆 ZAFER: Kül Tarikatı Sona Erdi','Destekçisi '+(by==='vassal'?'boyun eğince':'yıkılınca')+' Kül Tarikatı\'nın tüm bağları koptu. Kamplar söndü, fanatikler dağıldı. Aldora\'nın Mirası artık güvende.\n\nÖdül: 2500 altın, 500 demir, +3 miras puanı.\n\nOyunu burada bitirip skorunu kaydedebilir ya da krallığını yönetmeye devam edebilirsin.',[
  {t:'Devam et (serbest oyun)'},
  {t:'Bitir ve skoru kaydet',fn:()=>{S.done=true;if(typeof recScore==='function')recScore();showModal('📜 Efsane Tamamlandı','Skorun kaydedildi. Ana menüden yeni bir oyuna başlayabilirsin.',[{t:'Yeni oyun',fn:()=>{try{localStorage.removeItem('ky_save');}catch(e){}newGameSetup(uiReset);}}]);}}]);
}
// ---- kaçak lider (mini patron) ----
function egBoss(i){
 const E=egS(),K=KINGS[i];
 const p=egFindWalk(K.x,K.y,18,0)||egFindWalk(MW/2,MH/2,60);if(!p)return;
 const b=mkUnit('haydutreis','b',p.x,p.y,{guard:1,hx:p.x,hy:p.y,st:'idle'});
 b.hp=b.mhp=Math.round(b.mhp*7);b.ds=2.6;b.nm=K.who+' (Kaçak)';b.boss=1;
 for(let k=0;k<8;k++){const u=mkUnit(k%2?'haydutokcu':'haydutreis','b',p.x+1+k%4*0.8,p.y+1+(k/4|0)*0.8,{guard:1,hx:p.x,hy:p.y,st:'idle'});u.hp=u.mhp=Math.round(u.mhp*2);u.ds=1.8;}
 E.bosses.push({id:b.id,x:p.x,y:p.y,n:b.nm,done:0});revealC(p.x,p.y,5);
 showModal('🗡 Kaçak Lider','Yıkılan '+K.n+'\'in hükümdarı '+K.who+' hayatta kalan sadıklarıyla bir sığınağa çekilmiş. Haritada işaretlendi. Kafası için ödül var!',[{t:'Avlayacağım'}]);
}
function egBossCheck(){
 const E=egS();
 for(const b of E.bosses){
  if(b.done)continue;
  const u=UM.get(b.id);
  if(u&&!u.dead)continue;
  b.done=1;addRes('gold',700);addRes('iron',150);
  if(typeof META!=='undefined'&&!S.test){META.pts++;if(typeof saveMeta==='function')saveMeta();}
  showModal('🏆 Kaçak Lider Yakalandı',b.n+' düştü. Ödül: 700 altın, 150 demir ve +1 miras puanı.',[{t:'Devam'}]);
 }
}
(function(){const _k=killKingdom;killKingdom=function(i){const was=S.kings[i].dead;_k(i);if(!was&&S.founded){egS();S.eg.pendB=(S.eg.pendB||[]).concat([{i,at:S.day+4}]);}};})();
// ---- felaketler ----
function egDisaster(){
 const E=egS(),tp=Math.floor(Math.random()*4),gk=countB('gozkule',true)?0.5:1;
 const vil=S.units.filter(u=>!u.dead&&u.team==='p'&&u.t==='koylu');
 if(tp===0){
  const h=countB('hastane',true),sp=countB('sapel',true)+countB('katedral',true)*2;
  const pct=Math.max(0.03,0.14-0.035*h-0.01*sp)*gk;
  let n=Math.round(vil.length*pct);
  for(let k=0;k<n;k++){const u=pick(vil);if(u&&!u.dead)killU(u);}
  showModal('☠ Veba',n+' köylü salgında öldü. '+(h?'Hastaneler kaybı azalttı.':'Hastane kurmak kaybı azaltırdı.'),[{t:'Yazık'}]);
 }else if(tp===1){
  const dp=countB('depo',true);const l=Math.max(0.15,0.4-0.03*dp)*gk;
  const lost=Math.round(S.res.food*l);S.res.food-=lost;
  showModal('🌾 Kıtlık','Böcek ve kuraklık ambarları vurdu. '+lost+' yiyecek bozuldu.',[{t:'Ah!'}]);
 }else if(tp===2){
  const lw=Math.round(S.res.wood*0.3*gk),ls=Math.round(S.res.stone*0.15*gk);S.res.wood-=lw;S.res.stone-=ls;
  showModal('🌊 Büyük Sel','Nehir taştı. '+lw+' odun ve '+ls+' taş sular altında kaldı.',[{t:'Toparlan'}]);
 }else{
  addRes('iron',400);addRes('gold',250);
  showModal('☄ Kuyruklu Yıldız','Gökten ateş topu düştü. Halk korktu, sonra düştüğü yerde parlayan göktaşları buldu. +400 demir, +250 altın.',[{t:'Şans!'}]);
 }
 S.stats.dis=(S.stats.dis||0)+1;
}
// ---- 3 son ----
function egEnds(){
 const E=egS();if(!(S.sf&&S.sf.maldricDead))return;
 const kd=S.kings.map(k=>k);
 const allDead=kd.every(k=>k.dead);
 const allBound=kd.every(k=>k.dead?false:(k.vassal||k.pact==='ittifak'));
 if(!E.ends.fetih&&allDead){E.ends.fetih=1;showModal('⚔ SON: FETİH','Hiçbir krallık ayakta kalmadı. Aldora\'nın bayrağı bütün topraklarda dalgalanıyor. Korkuyla örülmüş bir barış...\n\nOyun devam ediyor; istersen yeni hedefler seç.',[{t:'Devam'}]);}
 if(!E.ends.birlik&&allBound){E.ends.birlik=1;showModal('🕊 SON: BİRLİK','Tüm krallıklar ya vasalın ya da müttefikin. Kılıç yerine söz ve ticaret hüküm sürüyor. Tarihe "Barışçı Taç" olarak geçeceksin.',[{t:'Devam'}]);}
 if(!E.ends.altin&&E.heritage&&S.happy>=85&&popNow()>=150&&S.res.gold>=3000){E.ends.altin=1;showModal('🌟 SON: ALTIN ÇAĞ','Halk mutlu, ambarlar dolu, hazine taşıyor. Aldora\'nın Mirası gerçek oldu: refah çağı başladı.',[{t:'Devam'}]);}
}
if(typeof ACH!=='undefined'){
 ACH.push({id:'endF',n:'Fatih',d:'Fetih sonu: tüm krallıkları yok et',ok:()=>S.eg&&S.eg.ends&&S.eg.ends.fetih});
 ACH.push({id:'endB',n:'Barışçı Taç',d:'Birlik sonu: hepsi vasal ya da müttefik',ok:()=>S.eg&&S.eg.ends&&S.eg.ends.birlik});
 ACH.push({id:'endA',n:'Altın Çağ',d:'Refah sonu',ok:()=>S.eg&&S.eg.ends&&S.eg.ends.altin});
 ACH.push({id:'heritage',n:'Aldora\'nın Mirası',d:'5 kalıntıyı topla',ok:()=>S.eg&&S.eg.heritage});
 ACH.push({id:'boss1',n:'Kaçak Avcısı',d:'Bir kaçak lideri yakala',ok:()=>S.eg&&S.eg.bosses.some(b=>b.done)});
}
// ---- döngüler ----
function egDay(){
 if(!S.founded)return;
 const E=egS();
 if(S.sf&&S.sf.maldricDead&&!E.act2)egStartAct2();
 if(E.act2&&!E.cultEnded){
  const alive=S.camps.filter(c=>c.alive&&c.cult).length;
  if(!E.cultMade&&S.day>=E.act2Day+4)egCultCamp();
  else if(E.cultMade&&alive<2&&(E.cultMade||0)<5&&S.day>=(E.nextCamp||E.act2Day+45)){E.nextCamp=S.day+ri(45,70);if(Math.random()<0.8)egCultCamp();}
  if(alive&&S.day>=E.nextCult){E.nextCult=S.day+ri(26,40);egCultRaid();}
  if(E.sponsor==null&&S.day>=E.act2Day+40&&!UI.modalOpen)egSponsor();
  if(E.sponsor!=null&&E.sponsor>=0){const k=S.kings[E.sponsor];if(k.dead||k.vassal)egCultEnd(k.vassal&&!k.dead?'vassal':'dead');}
  else if(E.sponsor===-1)egCultEnd('dead');
 }
 (E.pendB||[]).slice().forEach(p=>{if(S.day>=p.at){E.pendB.splice(E.pendB.indexOf(p),1);if(E.bosses.length<8)egBoss(p.i);}});
 if(S.day>=45){
  if(!E.nextDis)E.nextDis=S.day+ri(20,30);
  if(S.day>=E.nextDis){E.nextDis=S.day+ri(22,40);egDisaster();}
 }
}
(function(){
 const _od=onDay;onDay=function(){_od.apply(null,arguments);try{egDay();}catch(e){console.error(e);}};
 const _ce=checkEnd;checkEnd=function(){_ce();if(S.founded&&!S.done){try{const E=egS();if(E.act2)egRuinCheck();egBossCheck();if((S.t|0)%5===0)egEnds();}catch(e){}}};
})();
// ---- etiketler ----
function egLabels(xa,xb,ya,yb){
 const E=S.eg;if(!E)return;
 for(const r of (E.ruins||[]))if(!r.got&&fogAt(r.x,r.y)>=1)text('🏺 Aldora Kalıntısı',r.x+1,r.y-0.3,12,'#ffd54f');
 for(const b of (E.bosses||[]))if(!b.done&&fogAt(b.x,b.y)>=1)text('🗡 '+b.n,b.x+1,b.y-0.5,12,'#ff8a65');
}
