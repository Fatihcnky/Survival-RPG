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
 E.nextCult=S.day+10;E.nextDis=Math.min(E.nextDis||999,S.day+20);
 let n=0;
 for(let i=0;i<5;i++){const p=egFindWalk(MW/2+(Math.random()*2-1)*MW*0.38,MH/2+(Math.random()*2-1)*MH*0.38,24,28);if(!p)continue;E.ruins.push({x:p.x,y:p.y,got:0,i});revealC(p.x,p.y,4);n++;}
 showModal('🌑 Küllerin Ötesi','Kara Kale düştü ama Maldric\'in sandığında kül renkli bir mühür buldun. Bertram solgun yüzle fısıldıyor:\n"Maldric kendi başına değildi. Eski Aldora\'nın kalıntılarını arayan bir Kül Tarikatı ona para ve asker verdi. Şimdi lideri öldü, onlar sana yöneliyor."\n\nHarita üzerinde '+n+' Aldora kalıntısı belirdi (🏺). Her birine bir birlik gönder; hepsini toplarsan Aldora\'nın Mirası açılacak. Kül Tarikatı\'nın baskınlarına hazırlıklı ol!',[{t:'Hazırım'}]);
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
// ---- Kül Tarikatı baskını ----
function egCultRaid(){
 const E=egS(),tc=mainTC();if(!tc)return;
 const n=clamp(8+Math.floor(S.day/14)+S.rank*2,10,40);
 const side=Math.floor(Math.random()*4);
 const bx=[6,MW-8,MW/2,MW/2][side],by=[MH/2,MH/2,6,MH-8][side];
 const p=egFindWalk(bx,by,16)||egFindWalk(MW/2,MH/2,40);if(!p)return;
 for(let i=0;i<n;i++){const t=i%5===0?'haydutatli':i%2?'haydutokcu':'haydutreis';
  const u=mkUnit(t,'b',p.x+(i%6)*0.7,p.y+(i/6|0)*0.7,{st:'raid',gt:tc.id});u.hp=u.mhp=Math.round(u.mhp*2.0);u.ds=1.8;}
 log('🔥 KÜL TARİKATI baskını! '+n+' fanatik köyüne yürüyor.',p.x,p.y);
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
 if(E.act2&&S.day>=E.nextCult){E.nextCult=S.day+Math.max(8,18-Math.floor(S.rank*2));egCultRaid();}
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
 for(const r of E.ruins)if(!r.got&&fogAt(r.x,r.y)>=1)text('🏺 Aldora Kalıntısı',r.x+1,r.y-0.3,12,'#ffd54f');
 for(const b of E.bosses)if(!b.done&&fogAt(b.x,b.y)>=1)text('🗡 '+b.n,b.x+1,b.y-0.5,12,'#ff8a65');
}
