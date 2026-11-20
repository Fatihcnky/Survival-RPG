'use strict';
// ===== META: başarımlar, miras puanı, skor tablosu, kervanlar, mevsim şenlikleri, sözleşmeler, anıt, kahraman ekipmanı =====
let META={pts:0,ach:{},scores:[]};
function loadMeta(){try{const m=JSON.parse(localStorage.getItem('ky_meta'));if(m)META=Object.assign(META,m);}catch(e){}}
function saveMeta(){try{localStorage.setItem('ky_meta',JSON.stringify(META));}catch(e){}}
loadMeta();
const st_=k=>(S.stats&&S.stats[k])||0;
const ACH=[
 {id:'pop20',n:'Küçük Köy',d:'20 nüfusa ulaş',ok:()=>popNow()>=20},
 {id:'pop50',n:'Kasaba',d:'50 nüfusa ulaş',ok:()=>popNow()>=50},
 {id:'pop100',n:'Şehir',d:'100 nüfusa ulaş',ok:()=>popNow()>=100},
 {id:'year2',n:'Hayatta Kalan',d:'İlk yılı tamamla',ok:()=>S.day>=YEARD},
 {id:'year5',n:'Kalıcı Hanedan',d:'5 yıl hayatta kal',ok:()=>S.day>=YEARD*5},
 {id:'age2',n:'Demir Çağı',d:'3. çağa geç',ok:()=>S.age>=2},
 {id:'age4',n:'Barut Çağı',d:'Son çağa ulaş',ok:()=>S.age>=4},
 {id:'gourmet',n:'Gurme Sofrası',d:'Aynı anda 6 yiyecek çeşidi',ok:()=>typeof foodVar==='function'&&foodVar()>=6},
 {id:'happy',n:'Mutlu Halk',d:'Mutluluk 85+',ok:()=>S.happy>=85},
 {id:'rich',n:'Altın Hazine',d:'1000 altın biriktir',ok:()=>S.res.gold>=1000},
 {id:'camp1',n:'Haydut Avcısı',d:'1 haydut kampı yık',ok:()=>st_('camps')>=1},
 {id:'camp5',n:'Eşkıya Kâbusu',d:'5 haydut kampı yık',ok:()=>st_('camps')>=5},
 {id:'walls',n:'Sur Ustası',d:'30 sur parçası',ok:()=>countB('duvar',true)>=30},
 {id:'tech10',n:'Bilge Köy',d:'10 teknoloji araştır',ok:()=>Object.keys(S.techs).length>=10},
 {id:'hero5',n:'Efsane Komutan',d:'Bir kahramanı 5. seviyeye çıkar',ok:()=>S.dyn&&[S.dyn.ruler].concat(S.dyn.heirs).some(p=>(p.lv||1)>=5)},
 {id:'wonder',n:'Anıt Yapıcı',d:'Katedrali tamamla',ok:()=>countB('katedral',true)>0},
 {id:'caravan3',n:'İpek Yolu',d:'3 kervanı güvenle ulaştır',ok:()=>(S.cv||0)>=3},
 {id:'contract3',n:'Güvenilir Tüccar',d:'3 sözleşmeyi tamamla',ok:()=>(S.ctDone||0)>=3},
 {id:'fort',n:'Kara Kale Yıkıldı',d:'Lord Maldric\'i yen',ok:()=>S.sf&&S.sf.maldricDead},
 {id:'win',n:'Aldora\'nın Varisi',d:'Tüm görevleri tamamla',ok:()=>S.won}
];
function achCheck(){
 if(S.test)return;
 for(const a of ACH){if(META.ach[a.id])continue;let ok=false;try{ok=a.ok();}catch(e){}
  if(ok){META.ach[a.id]=S.day;META.pts++;saveMeta();log('🏆 Başarım: '+a.n+' (+1 miras puanı)');if(typeof sfx==='function')sfx('fan');}}
}
function achText(){
 const n=Object.keys(META.ach).length;
 return '<b>'+n+'/'+ACH.length+' başarım · 🏺 Miras puanı: '+META.pts+'</b>\n<small>Miras puanı her yeni oyunda başlangıç kaynağı olarak geri döner.</small>\n\n'+ACH.map(a=>(META.ach[a.id]?'✅ ':'⬜ ')+'<b>'+a.n+'</b> — '+a.d).join('\n');
}
// ---- skor ----
function scoreNow(){
 const dm={kolay:0.7,normal:1,zor:1.4,efsane:2,destan:2.6}[S.diff||'normal']||1;
 let sc=S.day*3+popNow()*8+(S.age||0)*150+(S.rank||0)*120+st_('camps')*60+st_('kills')*2+Object.keys(S.techs).length*25+Math.floor((S.res.gold||0)/20)+Math.floor(S.story)*40+(S.won?1000:0);
 return Math.round(sc*dm);
}
function recScore(){
 if(S&&S.test)return;
 if(!S||!S.founded)return;if(!S.gid)S.gid=Math.random().toString(36).slice(2);
 const e={id:S.gid,sc:scoreNow(),d:S.day,df:S.diff||'normal',nm:(S.dyn&&S.dyn.house)||'?',won:!!S.won};
 const i=META.scores.findIndex(x=>x.id===e.id);if(i>=0)META.scores[i]=e;else META.scores.push(e);
 META.scores.sort((a,b)=>b.sc-a.sc);META.scores.length=Math.min(META.scores.length,10);saveMeta();
}
function scoreText(){
 if(!META.scores.length)return 'Henüz skor yok. Oynadıkça en iyi 10 oyunun burada listelenir.\n\nPuan: gün, nüfus, çağ, ünvan, araştırma, haydut kampı, görev ve altından hesaplanır. Zorluk çarpanı: kolay x0.7 · normal x1 · zor x1.4 · efsane x2.';
 return META.scores.map((s,i)=>(i+1)+'. <b>'+s.sc+'</b> — Hane '+s.nm+' · '+s.d+'. gün · '+s.df+(s.won?' 🏆':'')).join('\n');
}
// ---- miras bonusu (yeni oyun başlangıcı) ----
(function(){
 const _f=foundVillage;
 foundVillage=function(x,y){const r=_f(x,y);
  if(r&&META.pts>0&&!S.legacyDone){S.legacyDone=1;const b=Math.min(META.pts,40);
   S.res.food+=b*10;S.res.wood+=b*10;S.res.stone+=b*4;S.res.gold+=b*6;
   log('🏺 Miras: '+b+' puanın başlangıç kaynağına dönüştü (+'+b*10+' yiyecek/odun, +'+b*4+' taş, +'+b*6+' altın).');}
  return r;};
})();
// ---- kahraman ekipmanı ----
(function(){
 const _ha=heroApply;heroApply=function(u){_ha(u);const p=heroPer(u);if(!p)return;
  const w=p.eqW||0,a=p.eqA||0;if(w)u.atkB=(u.atkB||0)+w*3;if(a){const r=u.mhp?u.hp/u.mhp:1;u.mhp+=a*25;u.hp=Math.min(u.mhp,u.mhp*r+a*25);}};
 const _hb=heroBox;heroBox=function(who,p){let h=_hb(who,p);if(!p)return h;
  const w=p.eqW||0,a=p.eqA||0,cw=w+1,ca=a+1;
  h+='<div class="row">'+btn('🗡 Silah +'+w+'/3'+(w<3?' ('+cw+' silah)':''),'heq',who,w>=3||(S.res.silah||0)<cw,'w')+btn('🛡 Zırh +'+a+'/3'+(a<3?' ('+ca+' zırh)':''),'heq',who,a>=3||(S.res.zirh||0)<ca,'a')+'<small>Demirciden çıkan silah/zırhı kahramana ver: silah +3 saldırı, zırh +25 can (her seviye).</small></div>';
  return h;};
})();
// ---- anıt: Katedral ----
BT.katedral={n:'Katedral',ic:'⛪',w:5,h:5,hp:1500,age:3,cost:{stone:900,gold:500,wood:400,iron:100},time:120,col:'#d9d4c0',d:'Büyük anıt: mutluluk +10, günlük +15 altın. Bir tane yapılabilir.'};
BCAT[2][1].push('katedral');
(function(){
 const _pr=placeReason;placeReason=function(t){if(t==='katedral'&&countB('katedral',false)>0)return'Zaten var';return _pr(t);};
 const _hf=happyFactors;happyFactors=function(){const f=_hf();if(S.founded&&countB('katedral',true))f.push(['Katedral',10]);return f;};
 // görsel: kale görselini kullan
})();
// ---- kervanlar ----
UT.kervan={n:'Ticaret Kervanı',g:'🐫',hp:220,atk:0,rng:1,rof:2,spd:2.4,arm:2,caravan:1};
function spawnCaravan(i){
 const K=KINGS[i],tc=mainTC();if(!tc)return;
 let sx=K.x,sy=K.y+3;outer:for(let r=0;r<12;r++)for(let a=0;a<24;a++){const x=Math.floor(K.x+Math.cos(a/24*6.283)*r),y=Math.floor(K.y+Math.sin(a/24*6.283)*r);if(walk(x,y)){sx=x;sy=y;break outer;}}
 const u=mkUnit('kervan','a',sx+0.5,sy+0.5,{kid:i,st:'idle'});u.life=DAY*4;
 log('🐫 '+K.n+' kervanı sana doğru yola çıktı. Haydutlar basmadan ulaşmasını sağla!',K.x,K.y);
}
function tradeRoad(u){
 if(!u.trail)return;S.trc=S.trc||{};let n=0;
 const year=S.day>=YEARD;
 for(const i of u.trail){S.trc[i]=(S.trc[i]||0)+1;
  if(year&&S.trc[i]>=2&&T[i]===0&&!OCC[i]&&!ROAD[i]){ROAD[i]=2;n++;}}
 if(n>5)log('🛤 Ticaret yolu belirginleşti ('+n+' kare yol açıldı). Yollar yürüyüşü hızlandırır.');
}
function updCaravan(u,dt){
 if(u.hp<u.mhp*0.5&&!u.warned){u.warned=1;log('🐫 Kervan saldırı altında! Askerlerini gönder.',u.x,u.y);}
 if(u.life!=null){u.life-=dt;if(u.life<=0){killU(u);return;}}
 {const ti=Math.floor(u.y)*MW+Math.floor(u.x);u.trail=u.trail||[];if(u.trail[u.trail.length-1]!==ti)u.trail.push(ti);}
 const tc=mainTC();if(!tc){killU(u);return;}
 if(!u.path){
  if(u.tries>6){log('🐫 Kervan yolunu bulamadı ve geri döndü.');u.dead=1;UM.delete(u.id);return;}
  if(setPath(u,tc.x,tc.y,tc.w,tc.h,1,true)!==1){u.tries=(u.tries||0)+1;return;}
 }else if(walkTo(u,dt)){
  u.path=null;
  if(Math.hypot(u.x-(tc.x+tc.w/2),u.y-(tc.y+tc.h/2))<tc.w/2+3){
   const g=Math.round((50+S.day*2)*fxm('trade')*(S.kings&&S.kings[u.kid]&&S.kings[u.kid].pact==='ittifak'?1.3:1));
   addRes('gold',g);const pk=pick(['iron','stone','keten','deri','wood']);const a=Math.round(30*fxm('trade'));addRes(pk,a);
   tradeRoad(u);S.cv=(S.cv||0)+1;if(S.kings[u.kid])adjRel(u.kid,4);
   log('🐫 Kervan ulaştı: +'+g+' altın, +'+a+' '+(RN[pk]||pk)+'.',u.x,u.y);
   u.dead=1;UM.delete(u.id);
  }
 }
}
(function(){const _uu=updUnit;updUnit=function(u,dt){if(u.t==='kervan'){if(!u.dead)updCaravan(u,dt);return;}_uu(u,dt);};})();
// ---- sözleşmeler ----
const CRES=[['food','yiyecek',1],['wood','odun',1],['stone','taş',1.4],['iron','demir',2.2],['ekmek','ekmek',1.6],['giyim','giyim',3]];
function offerContract(){
 if(S.contract||S.day<10||!mainTC())return;
 const c=pick(CRES),n=Math.round((40+S.day*1.2)/10)*10,rew=Math.round(n*c[2]*2.2),due=S.day+10,who=pick(['Tüccar Brom','Tüccar Yelda','Kervancı Osman','Lonca Ustası Hendrik']);
 showModal('📦 Sözleşme teklifi',who+': "'+n+' '+c[1]+' getirirsen '+rew+' altın ve biraz itibar kazanırsın. Süre: 10 gün."',[
  {t:'Kabul et',fn:()=>{S.contract={res:c[0],n,rew,due,who};log('📦 Sözleşme: '+n+' '+c[1]+' → '+rew+' altın ('+10+' gün).');}},{t:'Reddet'}]);
}
function contractDay(){
 const c=S.contract;if(!c)return;
 if((S.res[c.res]||0)>=c.n+(c.res==='food'?20:0)){S.res[c.res]-=c.n;addRes('gold',c.rew);S.ctDone=(S.ctDone||0)+1;S.happy=Math.min(100,S.happy+2);log('📦 Sözleşme tamamlandı: +'+c.rew+' altın.');S.contract=null;S.nextCt=S.day+ri(6,10);}
 else if(S.day>c.due){log('⛔ Sözleşme süresi doldu ('+c.who+').');S.happy=Math.max(0,S.happy-2);S.contract=null;S.nextCt=S.day+ri(8,12);}
}
(function(){
 const _q=questBox;questBox=function(){_q();if(S.founded&&S.contract){const c=S.contract,r=CRES.find(x=>x[0]===c.res);$('quest').innerHTML+='<div class="qw">📦 Sözleşme: '+c.n+' '+r[1]+' ('+Math.floor(S.res[c.res]||0)+'/'+c.n+') · '+Math.max(0,c.due-S.day)+' gün · 🎁'+c.rew+'💰</div>';}};
})();
// ---- mevsim şenlikleri + günlük kancalar ----
function seasonFest(s){
 const o=[
  ['🌸 Bahar Panayırı','Köylüler panayır kurmak istiyor. 40 yiyecek harcanır, pazardan altın kazanırsın ve halk neşelenir.',()=>S.res.food>=40,()=>{S.res.food-=40;const g=30+popNow()*3;addRes('gold',g);S.happy=Math.min(100,S.happy+6);log('🌸 Bahar Panayırı: +'+g+' altın, mutluluk arttı.');}],
  null,
  ['🌾 Hasat Şenliği','Hasat bitti! 60 yiyecek ve 20 altınla şenlik düzenlersen halk 6 gün mutlu olur.',()=>S.res.food>=60&&S.res.gold>=20,()=>{S.res.food-=60;S.res.gold-=20;S.fest=Math.max(S.fest,6);S.happy=Math.min(100,S.happy+10);log('🌾 Hasat Şenliği başladı!');}],
  ['🔥 Kış Şöleni','Soğuk bastırdı. Büyük bir şölen (80 yiyecek, 20 odun) moral verir.',()=>S.res.food>=80&&S.res.wood>=20,()=>{S.res.food-=80;S.res.wood-=20;S.happy=Math.min(100,S.happy+12);log('🔥 Kış Şöleni: halk moral buldu.');}]
 ][s];
 if(!o||S.day<8)return;
 showModal(o[0],o[1],[{t:'Düzenle',fn:()=>{if(o[2]())o[3]();else log('⛔ Şenlik için kaynak yetersiz.');}},{t:'Geç'}]);
}
(function(){
 const _od=onDay;onDay=function(){_od();
  if(!S||!S.founded)return;
  const s=seas(),sd=seasonDay(S.day);
  if(sd===0&&S.day>0)seasonFest(s);
  if(S.day%2===0)achCheck();
  if(S.day%3===0)recScore();
  if(countB('katedral',true))addRes('gold',15);
  contractDay();if(!S.contract&&S.day>=(S.nextCt||0)&&Math.random()<0.5)offerContract();
  // kervan
  const nc=S.units.filter(u=>u.t==='kervan'&&!u.dead).length;
  if(nc<2&&S.day>=14&&S.day%8===3&&S.kings){const ok=S.kings.map((k,i)=>(!k.dead&&!k.war&&(k.pact||k.rel>=20))?i:-1).filter(i=>i>=0);if(ok.length)spawnCaravan(pick(ok));}
  if(S.won&&!S.wonRec){S.wonRec=1;META.pts+=5;saveMeta();recScore();log('🏺 Zafer: +5 miras puanı!');}
 };})();
(function(){const _ce=checkEnd;checkEnd=function(){const d=S.done;_ce();if(!d&&S.done)recScore();};})();
// ---- act ----
(function(){
 const _a=act;
 act=function(a,v,w,el){
  switch(a){
   case 'heq':{const p=personOf(v);if(!p)return;const k=w==='w'?'eqW':'eqA',rk=w==='w'?'silah':'zirh',lv=p[k]||0;
    if(lv>=3||(S.res[rk]||0)<lv+1)return;S.res[rk]-=lv+1;p[k]=lv+1;const h=heroOf(v);if(h)heroApply(h);log('🛡 '+p.name+' yeni ekipman aldı.');updPanel(true);return;}
   case 'mach':showModal('🏆 Başarımlar',achText(),[{t:'Tamam'}]);return;
   case 'mscore':if(S&&S.founded)recScore();showModal('🏅 Skor Tablosu',scoreText(),[{t:'Tamam'}]);return;
  }
  return _a(a,v,w,el);
 };
 const _mo=menuOptions;menuOptions=function(){_mo();$('menuBtns').insertAdjacentHTML('afterbegin','<button class="mb2" data-a="mach">🏆 Başarımlar</button><button class="mb2" data-a="mscore">🏅 Skor Tablosu</button>');};
 const _im=igMenu;igMenu=function(){_im();$('menuBtns').insertAdjacentHTML('beforeend','<button class="mb2" data-a="mach">🏆 Başarımlar</button><button class="mb2" data-a="mscore">🏅 Skor Tablosu</button>');};
})();
