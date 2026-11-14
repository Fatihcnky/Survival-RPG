'use strict';
// ===== OLAYLAR, HAYDUTLAR, KRALLAR, PAZAR =====
const MBASE={food:0.5,wood:0.5,stone:0.8,iron:1.4};
function sellPrice(k){return MBASE[k]*S.mkt[k]*(1+0.15*pactCount());}
function buyPrice(k){return MBASE[k]*S.mkt[k]*1.5;}
function sellRes(k,n){if(!countB('pazar',true)||S.res[k]<n)return false;S.res[k]-=n;addRes('gold',Math.floor(sellPrice(k)*n));return true;}
function buyRes(k,n){const c=Math.ceil(buyPrice(k)*n);if(!countB('pazar',true)||S.res.gold<c)return false;S.res.gold-=c;addRes(k,n);return true;}

function mainTC(){return S.blds.find(b=>b.t==='tc'&&b.team==='p')||S.blds.find(b=>b.team==='p'&&!b.decor);}

// ---------- haydut baskını ----------
function launchRaid(){
 const camps=S.camps.filter(c=>c.alive);
 const tc=mainTC();
 if(!camps.length||!tc)return;
 camps.sort((a,b)=>Math.hypot(a.x-tc.x,a.y-tc.y)-Math.hypot(b.x-tc.x,b.y-tc.y));
 const c=camps[Math.floor(Math.random()*Math.min(3,camps.length))];
 const size=clamp(2+Math.floor(S.day/8)+Math.floor(popNow()/14)+S.rank,3,30);
 for(let i=0;i<size;i++){
  let t='haydut';
  const r=Math.random();
  if(S.day>8&&r<0.3)t='haydutokcu';else if(S.day>20&&r<0.5)t='haydutatli';
  if(i===0&&size>12)t='haydutreis';
  mkUnit(t,'b',c.x+0.5+(i%5)*0.6,c.y+2.5+(i/5|0)*0.6,{st:'raid',gt:tc.id});
 }
 S.stats.raids++;
 log('⚠ HAYDUT BASKINI! '+size+' haydut kampından yola çıktı.',c.x,c.y);
 S.kings.forEach((k,i)=>{
  if(k.pact==='ittifak'&&k.rel>=40){
   const n=3+Math.floor(k.str/20),p=spawnPos(tc);
   for(let j=0;j<n;j++)mkUnit(Math.random()<0.5?'mizrakli':'okcu','a',p.x+j*0.5,p.y,{life:120,st:'idle'});
   log('🤝 '+KINGS[i].n+' yardım birliği gönderdi ('+n+' asker).',p.x,p.y);
  }
 });
 const ev=S.day<40?10:S.day<80?8:6;
 S.raidAt=S.day+ri(ev,ev+3);
}
function tributeDemand(){
 const amt=30+S.day*3+popNow()*2;
 showModal('🏴 Haydut elçisi','Haydut reisi haraç istiyor: '+amt+' altın. Ödemezsen saldırıya geçerler.',[
  {t:'Öde ('+amt+' 💰)',fn:()=>{if(S.res.gold>=amt){S.res.gold-=amt;S.raidAt+=4;log('Haraç ödendi. Bir süre sakin.');}else{log('⛔ Yeterli altının yok! Haydutlar öfkelendi.');S.raidAt=S.day+1;}}},
  {t:'Reddet',fn:()=>{S.raidAt=Math.min(S.raidAt,S.day+2);log('Haydutlar baskın hazırlığında!');}}
 ]);
}

// ---------- krallar ----------
function nearestPlayerDist(i){
 let m=1e9;const k=KINGS[i];
 for(const b of S.blds)if(b.team==='p')m=Math.min(m,Math.hypot(b.x-k.x,b.y-k.y));
 return m;
}
function giftK(i){const c=50;if(!elcilikOk()||S.res.gold<c)return false;S.res.gold-=c;adjRel(i,12*fxm('dip'));log('🎁 '+KINGS[i].who+' hediyeni beğendi.');return true;}
function adjRel(i,v){const k=S.kings[i];k.rel=clamp(k.rel+v,-100,100);}
function elcilikOk(){return countB('elcilik',true)>0;}
function treatyK(i){const k=S.kings[i];if(!elcilikOk()||k.pact||k.war||k.rel<15||S.res.gold<100)return false;S.res.gold-=100;k.pact='ticaret';log('📜 '+KINGS[i].n+' ile ticaret anlaşması yapıldı.');return true;}
function allyK(i){const k=S.kings[i];if(!elcilikOk()||k.pact!=='ticaret'||k.rel<45||S.res.gold<200||S.res.food<150)return false;S.res.gold-=200;S.res.food-=150;k.pact='ittifak';log('🤝 '+KINGS[i].n+' ile ittifak kuruldu!');return true;}
function peaceK(i){
 const k=S.kings[i],c=100+Math.floor(k.str*2);
 if(!k.war||S.res.gold<c)return false;
 S.res.gold-=c;k.war=false;k.rel=-10;
 S.units.forEach(u=>{if(u.team==='k'&&u.kid===i)killU(u);});
 log('🕊 '+KINGS[i].n+' ile barış yapıldı.');return true;
}
function peaceCost(i){return 100+Math.floor(S.kings[i].str*2);}
function declareWar(i){
 const k=S.kings[i],kg=KINGS[i],tc=mainTC();if(!tc)return;
 k.war=true;k.lastWar=S.day;
 const n=clamp(Math.floor(k.str/9),3,16);
 for(let j=0;j<n;j++){
  const t=S.day>40&&Math.random()<0.3?'atli':Math.random()<0.35?'okcu':'mizrakli';
  mkUnit(t,'k',kg.x+(j%4)*0.8-1,kg.y+4+(j/4|0)*0.8,{st:'raid',gt:tc.id,kid:i});
 }
 log('⚔ '+kg.n+' sana savaş ilan etti! '+n+' askerlik ordu yola çıktı.',kg.x,kg.y);
 showModal('⚔ Savaş!',kg.who+' sınır anlaşmazlığı yüzünden savaş ilan etti ve ordusunu gönderdi. Savun ya da Elçilik üzerinden barış satın al ('+peaceCost(i)+' altın).',[{t:'Anladım'}]);
}
function kingsDay(){
 S.kings.forEach((k,i)=>{
  const kg=KINGS[i];
  k.str=20+S.day*(kg.pers==='savasci'?2.2:1.3);
  if(k.pact)k.rel=Math.min(100,k.rel+0.3);else k.rel+=(0-k.rel)*0.01;
  if(k.war&&!S.units.some(u=>u.team==='k'&&u.kid===i)){k.war=false;k.rel=-30;log('🏳 '+kg.n+' ordusu bozguna uğradı, savaş sona erdi.');}
  const dist=nearestPlayerDist(i);
  // sınır şikâyeti
  if(dist<24&&k.pact!=='ittifak'&&S.day-k.lastComplaint>=5&&Math.random()<0.4){
   k.lastComplaint=S.day;adjRel(i,-6);
   showModal('📨 Sınır bildirimi',kg.who+' ('+kg.n+'): "Köyün sınırlarımıza çok yaklaştı, halkım rahatsız. Bunu nasıl çözeceğiz?"',[
    {t:'Özür + hediye (40 💰)',fn:()=>{if(S.res.gold>=40){S.res.gold-=40;adjRel(i,12);}else adjRel(i,-4);}},
    {t:'Yoksay',fn:()=>adjRel(i,-8)}
   ]);
   return;
  }
  // haraç
  if(k.rel<-10&&!k.pact&&!k.war&&(kg.pers==='savasci'||kg.pers==='acgozlu')&&Math.random()<0.1&&S.day>10){
   const amt=60+S.day*2;
   showModal('👑 Haraç talebi',kg.who+' senden '+amt+' altın istiyor, yoksa ilişkiler bozulacak.',[
    {t:'Öde ('+amt+' 💰)',fn:()=>{if(S.res.gold>=amt){S.res.gold-=amt;adjRel(i,10);}else adjRel(i,-10);}},
    {t:'Reddet',fn:()=>adjRel(i,-15)}
   ]);
   return;
  }
  // savaş
  if(k.rel<-55&&k.pact!=='ittifak'&&!k.war&&S.day>14&&S.day-k.lastWar>10&&Math.random()<0.3&&dist<60){declareWar(i);return;}
  // hediye
  if(k.rel>35&&Math.random()<0.04){
   const g=ri(40,100);addRes('gold',g);log('🎁 '+kg.n+' '+g+' altın hediye gönderdi.');
  }
  // yardım isteği
  if(k.rel>20&&Math.random()<0.08){
   showModal('🆘 Yardım isteği',kg.who+' kıtlık yaşıyor. 80 yiyecek gönderirsen minnettar kalır.',[
    {t:'Gönder (80 🍖)',fn:()=>{if(S.res.food>=80){S.res.food-=80;adjRel(i,15*fxm('dip'));}}},
    {t:'Reddet',fn:()=>adjRel(i,-3)}
   ]);
   return;
  }
 });
}

// ---------- rastgele olaylar ----------
function pickRandomBuilding(){const a=S.blds.filter(b=>b.team==='p'&&b.done&&!b.decor&&b.t!=='tc');return a[Math.floor(Math.random()*a.length)];}
const EVENTS=[
 {w:3,ok:()=>S.day>3,fn:()=>{
  const n=ri(2,4);
  showModal('🧳 Mülteciler','Bir grup mülteci ('+n+' kişi) köyüne sığınmak istiyor. Yerleşirlerse '+(n*30)+' yiyecek harcanacak.',[
   {t:'Kabul et',fn:()=>{if(popNow()+n>popCap()||S.res.food<n*30){log('⛔ Barınak veya yiyecek yetersiz, mülteciler yoluna devam etti.');return;}S.res.food-=n*30;const tc=mainTC();for(let i=0;i<n;i++){const p=spawnPos(tc);mkUnit('koylu','p',p.x,p.y);}log('✔ '+n+' yeni köylü katıldı.');}},
   {t:'Reddet'}]);}},
 {w:3,ok:()=>countB('pazar',true)>0||S.day>6,fn:()=>{
  const ks=['stone','iron','wood'],k=ks[ri(0,2)],n=100,price=Math.ceil(MBASE[k]*n*0.7*S.mkt[k]);
  showModal('🛒 Gezgin tüccar',n+' '+RN[k]+' teklif ediyor: '+price+' altın.',[
   {t:'Satın al ('+price+' 💰)',fn:()=>{if(S.res.gold>=price){S.res.gold-=price;addRes(k,n);}else log('⛔ Altın yetersiz.');}},
   {t:'Geç'}]);}},
 {w:2,ok:()=>seas()===1||seas()===2,fn:()=>{const f=ri(60,150);addRes('food',f);log('🌾 Bereketli hasat! +'+f+' yiyecek.');}},
 {w:1,ok:()=>true,fn:()=>{const g=ri(40,120);addRes('gold',g);log('💎 Çocuklar eski bir define buldu: +'+g+' altın.');}},
 {w:2,ok:()=>true,fn:()=>{const f=ri(50,110);addRes('food',f);log('🦌 Avcılar bol av getirdi: +'+f+' yiyecek.');}},
 {w:2,ok:()=>S.day>=12&&S.res.wood>60,fn:()=>{const l=Math.floor(S.res.wood*0.15);S.res.wood-=l;log('⛈ Fırtına odun deposunu vurdu: -'+l+' odun.');}},
 {w:2,ok:()=>S.day>=12&&S.res.food>80,fn:()=>{const l=Math.floor(S.res.food*0.12);S.res.food-=l;log('🐀 Fareler ambara girdi: -'+l+' yiyecek.');}},
 {w:1.5,ok:()=>S.day>=14&&S.res.gold>80,fn:()=>{const l=Math.min(S.res.gold,ri(50,130));S.res.gold-=l;log('🥷 Hırsızlar hazineden '+l+' altın çaldı!');}},
 {w:1.5,ok:()=>S.day>=14&&seas()===1&&countB('ciftlik',true)>0,fn:()=>{S.drought=3;log('☀ Kuraklık! 3 gün boyunca çiftlik verimi yarıya düşer.');}},
 {w:2,ok:()=>S.day>=16&&!S.epi&&popNow()>12,fn:()=>{S.epi={left:3,sev:1+Math.random()*0.5};showModal('🤒 Salgın!','Köyde hastalık yayılıyor. Hastane ve şifacılar kayıpları azaltır.',[{t:'Anladım'}]);}},
 {w:2,ok:()=>S.age>=1&&S.blds.filter(b=>b.team==='p'&&b.done).length>3,fn:()=>{const b=pickRandomBuilding();if(b)startFire(b);}},
 {w:1.5,ok:()=>true,fn:()=>{
  showModal('🧙 Gezgin bilge','Bir bilge köyünüzde konakladı. Karşılığında yiyecek isteyip bilgi paylaşıyor.',[
   {t:'Ağırla (40 🍖)',fn:()=>{if(S.res.food>=40){S.res.food-=40;if(S.research)S.research.left=Math.max(1,S.research.left-25);else addRes('gold',50);log('🧙 Bilge size yardım etti.');}}},
   {t:'Geç'}]);}} ,
 {w:2,ok:()=>S.day>=14,fn:()=>{
  const b=pickRandomBuilding();if(!b)return;
  for(let i=0;i<4;i++){const x=clamp(b.x+ri(-14,14),2,MW-3),y=clamp(b.y+ri(-14,14),2,MH-3);if(walk(x,y))mkUnit('kurt','w',x+0.5,y+0.5,{st:'idle'});}
  log('🐺 Kurt sürüsü köye yaklaşıyor! Avcılar ve köylüler dikkatli olsun.',b.x,b.y);}},
 {w:2,ok:()=>S.day>=8,fn:()=>{
  showModal('🎻 Gezgin ozan','Bir ozan köy meydanında şarkı söylemek istiyor. Ziyafet için 30 yiyecek ister.',[
   {t:'Konaklat (30 🍖)',fn:()=>{if(S.res.food>=30){S.res.food-=30;S.happy=Math.min(100,S.happy+8);log('🎻 Ozan hanedanını öven bir şarkı yazdı. Halk neşelendi.');}}},
   {t:'Geç'}]);}},
 {w:1.5,ok:()=>S.age>=1,fn:()=>{
  showModal('🙏 Hacılar','Uzak diyarlardan gelen hacılar köyünüzde duaya katılmak ve bağış toplamak istiyor.',[
   {t:'Bağış ver (40 💰)',fn:()=>{if(S.res.gold>=40){S.res.gold-=40;S.happy=Math.min(100,S.happy+10);}}},
   {t:'Geri çevir',fn:()=>{S.happy=Math.max(0,S.happy-3);}}]);}},
 {w:1.5,ok:()=>seas()===1&&S.day>=14,fn:()=>{
  const l=Math.floor(S.res.food*0.08);S.res.food-=l;S.drought=Math.max(S.drought,3);log('🦗 Çekirge istilası! Ekinler zarar gördü: -'+l+' yiyecek, 3 gün verim düştü.');}},
 {w:1.5,ok:()=>S.day>=12&&S.res.food>=60,fn:()=>{
  const k=ri(0,S.kings.length-1),K=KINGS[k];
  showModal('🎩 Soylu misafir',K.who+'\'in akrabası köyünüze uğradı. Ziyafet verirsen komşuna iyi haber götürecek.',[
   {t:'Ziyafet ver (60 🍖 20 💰)',fn:()=>{if(S.res.food>=60&&S.res.gold>=20){S.res.food-=60;S.res.gold-=20;adjRel(k,10*fxm('dip'));S.happy=Math.min(100,S.happy+4);}}},
   {t:'Geç'}]);}},
 {w:1.5,ok:()=>S.age>=1&&S.res.gold>=60&&S.res.iron>=20,fn:()=>{
  showModal('⚒ Gezgin demirci','Bir demirci 3 hazır silah satıyor: 60 altın.',[
   {t:'Satın al (60 💰)',fn:()=>{if(S.res.gold>=60){S.res.gold-=60;addRes('silah',3);}}},{t:'Geç'}]);}},
 {w:1.5,ok:()=>S.day>=10,fn:()=>{
  const n=2;
  showModal('🧒 Yetimler','Savaştan kaçan '+n+' yetim köy kapısında bekliyor. Bakmak için 60 yiyecek gerekir.',[
   {t:'Barındır',fn:()=>{if(popNow()+n<=popCap()&&S.res.food>=60){S.res.food-=60;const tc=mainTC();for(let i=0;i<n;i++){const p=spawnPos(tc);mkUnit('koylu','p',p.x,p.y);}S.happy=Math.min(100,S.happy+4);log('🧒 Yetimler köyde yeni bir yuva buldu.');}else log('⛔ Barınak veya yiyecek yetersiz.');}},
   {t:'Reddet',fn:()=>{S.happy=Math.max(0,S.happy-4);}}]);}},
 {w:1,ok:()=>S.day>=6,fn:()=>{
  showModal('☄ Kuyruklu yıldız','Gökyüzünde parlak bir kuyruklu yıldız belirdi. Halk bunu bir alamet sayıyor.',[
   {t:'Kutlama yap (40 🍖)',fn:()=>{if(S.res.food>=40){S.res.food-=40;S.happy=Math.min(100,S.happy+8);}}},
   {t:'Önemseme',fn:()=>{S.happy=Math.max(0,S.happy-2);}}]);}},
 {w:1.5,ok:()=>S.day>=18&&S.camps.some(c=>c.alive),fn:()=>{
  showModal('👁 Haydut gözcüleri','Avcılar yakınlarda haydut gözcüleri gördü. Baskın hazırlığında olabilirler.',[
   {t:'Tuzak kur (30 🌲)',fn:()=>{if(S.res.wood>=30){S.res.wood-=30;S.raidAt+=3;log('🪤 Tuzaklar kuruldu, baskın gecikebilir.');}}},
   {t:'Yoksay'}]);}},
 {w:1.5,ok:()=>S.day>=8,fn:()=>{
  const t=['stone','iron'][ri(0,1)],n=ri(60,140);addRes(t,n);log('⛏ Madenciler zengin bir damar buldu: +'+n+' '+RN[t]+'.');}},
 {w:1.5,ok:()=>countB('han',true)>0,fn:()=>{S.happy=Math.max(0,S.happy-5);log('🍺 Handa kavga çıktı, halk huzursuz.');}},
 {w:2,ok:()=>S.dyn.heirs.length>0&&S.dyn.heirs.some(h=>h.age<16),fn:()=>{
  const h=S.dyn.heirs.filter(x=>x.age<16)[0];
  showModal('🤒 Varis hastalandı',h.name+' ağır bir ateşle yatıyor. Şifacı çağırmak 50 altına mal olur.',[
   {t:'Şifacı çağır (50 💰)',fn:()=>{if(S.res.gold>=50){S.res.gold-=50;log('💊 '+h.name+' iyileşti.');}else if(Math.random()<0.5){S.dyn.heirs=S.dyn.heirs.filter(x=>x!==h);S.happy=Math.max(0,S.happy-10);log('⚰ '+h.name+' hayatını kaybetti.');}}},
   {t:'Dua et',fn:()=>{if(Math.random()<0.4){S.dyn.heirs=S.dyn.heirs.filter(x=>x!==h);S.happy=Math.max(0,S.happy-10);log('⚰ '+h.name+' hayatını kaybetti. Hanedan yasta.');}else log('🙏 Dualar kabul oldu, '+h.name+' iyileşti.');}}]);}},
 {w:1.5,ok:()=>S.dyn.spouse&&S.day>=20,fn:()=>{
  showModal('🗡 Saray entrikası','Soylular arasında hanedana karşı fısıltılar dolaşıyor. Sorgulamak için 60 altın gerekir.',[
   {t:'Soruştur (60 💰)',fn:()=>{if(S.res.gold>=60){S.res.gold-=60;S.happy=Math.min(100,S.happy+4);log('🔍 Komplo ortaya çıktı ve önlendi.');}}},
   {t:'Görmezden gel',fn:()=>{S.happy=Math.max(0,S.happy-6);}}]);}}

];
function rollEvent(){
 const list=EVENTS.filter(e=>e.ok());
 const tot=list.reduce((a,e)=>a+e.w,0);let r=Math.random()*tot;
 for(const e of list){r-=e.w;if(r<=0){e.fn();return;}}
}

// ---------- günlük işlemler ----------
function onDay(){
 const d=S.day,s=seas(),sd=d%SEASON_DAYS;
 if(sd===0)log('🌤 Mevsim: '+SEASONS[s]+'.');
 if(s===2&&sd===SEASON_DAYS-1)log('❄ Kış yaklaşıyor! Odun ve yiyecek biriktir.');
 // mutluluk, hanedan, kış
 happyDay();
 if(d>0&&d%(SEASON_DAYS*4)===0)dynYear();
 if(s===0&&sd===0)S.hardWinter=false;
 if(s===2&&sd===SEASON_DAYS-1&&Math.random()<0.25){S.hardWinter=true;log('🌨 Yaşlılar sert bir kış geleceğini söylüyor: odun tüketimi artacak!');}
 // vergi & ticaret
 const pop=popNow();
 const tax=Math.floor(pop*0.1*(1+0.6*S.rank)*fxm('tax')*TAXG[S.taxRate]);
 if(tax>0)addRes('gold',tax);
 S.kings.forEach((k,i)=>{
  if(k.pact==='ticaret'){addRes('gold',Math.round(6*(1+k.rel/100)*fxm('trade')));if(d%3===0)addRes(['wood','stone','iron'][d%3?0:ri(0,2)],ri(10,25));}
  if(k.pact==='ittifak'){addRes('gold',Math.round(12*fxm('trade')));}
 });
 // pazar fiyatları
 for(const k in S.mkt)S.mkt[k]=clamp(S.mkt[k]*(0.93+Math.random()*0.14),0.6,1.6);
 // hastalık
 if(S.epi){
  let docs=0;S.units.forEach(u=>{if(u.job==='doc'&&u.st==='work')docs++;});
  const heal=Math.min(0.85,docs*0.22*fxm('heal'));
  const vs=S.units.filter(u=>u.team==='p'&&u.t==='koylu'&&!u.dead);
  const n=Math.floor(vs.length*0.07*S.epi.sev*(1-heal));
  for(let k=0;k<n&&vs.length;k++)killU(vs.splice(Math.floor(Math.random()*vs.length),1)[0]);
  if(n>0)log('🤒 Salgında '+n+' kişi öldü.');
  if(--S.epi.left<=0){S.epi=null;log('Salgın sona erdi.');}
 }
 if(S.drought>0)S.drought--;
 // yangın riski
 const houses=countB('ev',true);
 if(S.age>=1&&houses>=4&&Math.random()<0.07*(s===1?2:1)){const b=pickRandomBuilding();if(b&&Math.random()>Math.min(0.6,jobCount('fire')*0.2))startFire(b);}
 // uyarılar
 if(S.res.food<pop*3)log('⚠ Yiyecek azalıyor!');
 // haydut döngüsü
 if(d>=S.raidAt-1&&d<S.raidAt&&S.camps.some(c=>c.alive)&&Math.random()<0.5&&d>=7)tributeDemand();
 if(d>=S.raidAt)launchRaid();
 kingdomsDay();
 if(d%10===0&&S.camps.filter(c=>c.alive).length<12){makeCamps(S.camps.filter(c=>c.alive).length+3);}
 wildDay();
 // krallar & olaylar
 kingsDay();
 if(d>=S.nextEvent){rollEvent();S.nextEvent=d+ri(3,5);}
 if(d%3===0)saveGame();
}
