'use strict';
// ===== İMPARATORLUK 2: Büyük Keşif, Kabul Ettirme, Prestij, Eyaletler, İkmal, krizler =====
TECH.lojistik={n:'Lojistik',age:3,req:['demirzirh'],cost:{wood:250,gold:150},time:50,d:'İkmal Kampı kurmayı açar (uzak seferlerde askerler yıpranmaz)'};
BT.ikmal={n:'İkmal Kampı',ic:'⛺',w:2,h:2,hp:300,age:3,cost:{wood:150,stone:50,gold:60},time:30,col:'#5a7a9a',d:'Uzak seferler için ikmal üssü: çevresindeki 75 karelik alanda ordun yıpranmaz. Yeni dünyada gerekli.'};
BCAT[2][1].push('ikmal');TGATE.ikmal='lojistik';
function pr(){S.pr=S.pr||{};const P=S.pr;P.m=P.m||{};P.cd=P.cd||{};P.prov=P.prov||{kadim:{gov:'adil',corr:0},step:{gov:'adil',corr:0},guney:{gov:'adil',corr:0}};P.g=P.g==null?30:P.g;return P;}
function milCount(){return S.units.filter(u=>!u.dead&&u.team==='p'&&UT[u.t].mil).length;}
// ---- Büyük Keşif ----
function expedOK(){return {liman:countB('liman',true)>0,tech:!!S.techs.gemi,emp:!!(S.eg&&S.eg.empire),res:S.res.gold>=1500&&S.res.wood>=400&&S.res.food>=300};}
function expedStart(){const o=expedOK();if(!(o.liman&&o.tech&&o.emp&&o.res)||S.expd||S.world)return;S.res.gold-=1500;S.res.wood-=400;S.res.food-=300;S.expd={end:S.day+25};log('⚓ Büyük Keşif seferi yola çıktı (25 gün).');updPanel(true);}
// ---- prestij ----
function prestigeCalc(){
 const P=pr();let g=10;
 S.kings.forEach(k=>{if(k.dead)return;if(k.vassal)g+=6;else if(k.pact==='ittifak')g+=4;});
 g+=3*['kutuphane','gozkule','saray','katedral'].filter(t=>countB(t,true)>0).length;
 if(S.eg&&S.eg.empire)g+=10;if(S.eg&&S.eg.heritage)g+=3;g+=S.rank*2;
 if(P.pen)g-=P.pen;
 P.g=clamp(g,0,100);P.pen=Math.max(0,(P.pen||0)-0.15);
}
function prBonus(){const g=pr().g;return g>=70?2:g>=50?1:g<25?-1:0;}
(function(){const _e=envBonus;envBonus=function(){return _e()+prBonus();};})();
// ---- kabul ettirme ----
const KAB=[
 {id:'tic',n:'🐪 Ticaret heyeti',cost:{gold:200},cd:8,dc:12,gain:9,fav:['kum','ada']},
 {id:'kul',n:'🎓 Kültür heyeti',cost:{gold:150,food:100},cd:10,dc:13,gain:9,fav:['aldora'],req:()=>countB('katedral',true)||countB('kutuphane',true),rt:'Katedral/Kütüphane'},
 {id:'guc',n:'⚔ Güç gösterisi',cost:{food:150},cd:12,dc:14,gain:10,fav:['dag','bozkir'],req:()=>milCount()>=20,rt:'20+ asker',failRel:-15},
 {id:'ent',n:'🕵 Entrika',cost:{gold:250},cd:12,dc:15,gain:11,fav:[],req:()=>!!bestSpy('gozet'),rt:'boş casus'},
 {id:'hed',n:'🎁 Hediye',cost:{gold:300},cd:6,dc:0,gain:6,fav:[]},
 {id:'evl',n:'💍 Evlilik',cost:{gold:400},cd:9999,dc:0,gain:30,fav:[],req:()=>S.dyn.heirs.length>=2,rt:'2+ varis',once:1}
];
const CAP={aldora:()=>S.eg&&S.eg.heritage,ada:()=>countB('liman',true)>0,dag:()=>milCount()>=40,bozkir:()=>true,kum:()=>true};
const CAPT={aldora:'Aldora Mirası (5 kalıntı) gerekir',ada:'bir Liman gerekir',dag:'40+ asker gerekir',bozkir:'',kum:''};
function kabulDo(i,id){
 const P=pr(),a=KAB.find(x=>x.id===id),k=S.kings[i],K=KINGS[i];if(!a||k.dead||k.vassal||k.war)return;
 const key=i+':'+id;if((P.cd[key]||0)>S.day)return;
 if(a.req&&!a.req())return;
 for(const r in a.cost)if(S.res[r]<a.cost[r])return;
 for(const r in a.cost)S.res[r]-=a.cost[r];
 P.cd[key]=S.day+a.cd;
 const fav=a.fav.includes(k.cul),gain=a.gain*(fav?2:1);
 let txt='',ok=true;
 if(a.dc){const sp=id==='ent'?bestSpy('gozet'):null;if(sp)sp.busy=S.day+4;
  const b=envBonus()+(sp?spBonus(sp,'gozet'):0),d=dice(null,a.dc-(fav?2:0),b);ok=d.m>=0;txt=d.txt+'\n\n';
  if(ok){P.m[i]=Math.min(100,(P.m[i]||0)+gain);txt+=a.n+' başarılı: kabul +'+gain+(fav?' (bu halk için ideal yol!)':'')+'.';if(sp)xpUp(sp,1);}
  else{txt+=a.n+' başarısız oldu.';if(a.failRel){adjRel(i,a.failRel);txt+=' İlişki '+a.failRel+'.';}if(id==='ent'&&d.m<=-5&&sp){spS().list=spS().list.filter(x=>x!==sp);txt+=' Casus yakalandı!';adjRel(i,-15);}}
 }else{P.m[i]=Math.min(100,(P.m[i]||0)+gain);txt=a.n+': kabul +'+gain+'.';if(a.once){const h=S.dyn.heirs.sort((x,y)=>y.age-x.age).find(h=>h.age>=14)||S.dyn.heirs[S.dyn.heirs.length-1];S.dyn.heirs=S.dyn.heirs.filter(x=>x!==h);txt+='\n'+h.name+' '+K.who+'\'in hanedanına gelin/damat olarak gönderildi.';}}
 if(!CAP[k.cul]()&&P.m[i]>90)P.m[i]=90;
 showModal(K.n+' — '+a.n,txt,[{t:'Tamam'}]);
 if(P.m[i]>=100)kabulAccept(i);
 updPanel(true);
}
function kabulAccept(i){
 const k=S.kings[i],K=KINGS[i];
 showModal('👑 '+K.n+' seni tanıyor!',K.who+': "Taçını ve gücünü tanıyoruz. Nasıl bir bağ istersin?"\n\n<b>Vasal:</b> haraç öder, sen yönetirsin.\n<b>Müttefik:</b> yardımlaşır, bağımsız kalır.',[
  {t:'👑 Vasal yap',fn:()=>{makeVassal(i);pr().m[i]=100;S.stats.acc=(S.stats.acc||0)+1;}},
  {t:'🤝 Müttefik',fn:()=>{k.war=false;k.pact='ittifak';k.rel=70;pr().m[i]=100;S.stats.acc=(S.stats.acc||0)+1;log('🤝 '+K.n+' müttefik oldu.');}}]);
}
function kabulBlock(){
 if(!S.world)return '';
 const P=pr();let h='<h4>🌍 Kabul Ettirme (Yeni Dünya)</h4><small>İmparatorluğunu tanıtmak için yollar dene. Her halk bir yolu ve kendine özgü bir engeli sever. Zar: d20 + çevre + prestij.</small>';
 for(let i=6;i<KINGS.length;i++){
  const K=KINGS[i],k=S.kings[i];if(k.dead||k.vassal){h+='<div style="margin:6px 0;opacity:.7"><b>'+K.n+'</b> '+(k.vassal?'— vasalın':'— yok')+'</div>';continue;}
  const m=P.m[i]||0,capw=!CAP[k.cul]()&&m>=90;
  h+='<div style="margin:6px 0;padding:6px;border:1px solid '+K.col+';border-radius:8px"><b>'+K.n+'</b> — '+K.who+' <small>'+(k.pact==='ittifak'?'🤝 müttefik':k.war?'⚔ savaşta':'')+'</small><br><small>'+K.d+'</small><br>Kabul: '+Math.round(m)+'/100 '+bar(m/100)+(capw?'<br><small style="color:#ffd180">Son aşama: '+CAPT[k.cul]+'</small>':'')+'<br>';
  KAB.forEach(a=>{const need=a.req&&!a.req(),cdl=(P.cd[i+':'+a.id]||0)>S.day;let aff=true;for(const r in a.cost)if(S.res[r]<a.cost[r])aff=false;
   const fav=a.fav.includes(k.cul),od=a.dc?pct(a.dc-(fav?2:0),envBonus()):100;
   h+=btn(a.n+(a.dc?' %'+od:'')+(fav?' ★':''),'kab',i,k.war||need||cdl||!aff,a.id);});
  h+='</div>';
 }
 return h;
}
// ---- eyaletler ----
const PROV={kadim:{n:'Kadim Topraklar',f:i=>i<6},step:{n:'Doğu Eyaleti (Bozkır, Dağ)',f:i=>i>=6&&['bozkir','dag'].includes(KINGS[i].cul)},guney:{n:'Güney Eyaleti (Vaha, Ada, Aldora)',f:i=>i>=6&&['kum','ada','aldora'].includes(KINGS[i].cul)}};
const GOV={adil:{n:'Adil Vali',d:'Yolsuzluk azalır, sadakat +'},acgozlu:{n:'Açgözlü Vali',d:'Gelir +8💰/vasal, yolsuzluk artar, sadakat −'},savasci:{n:'Savaşçı Vali',d:'20 günde 4 asker, yolsuzluk hafif artar'}};
function provDay(){
 const P=pr();
 for(const pk in PROV){
  const pv=P.prov[pk],vs=S.kings.map((k,i)=>i).filter(i=>S.kings[i].vassal&&!S.kings[i].dead&&PROV[pk].f(i));
  if(!vs.length){pv.corr=Math.max(0,pv.corr-0.1);continue;}
  if(pv.gov==='adil'){pv.corr=Math.max(0,pv.corr-0.25);vs.forEach(i=>S.kings[i].loy=Math.min(100,(S.kings[i].loy||55)+0.07));}
  else if(pv.gov==='acgozlu'){pv.corr=Math.min(100,pv.corr+0.6);addRes('gold',8*vs.length);vs.forEach(i=>S.kings[i].loy=Math.max(0,(S.kings[i].loy||55)-0.1));}
  else{pv.corr=Math.min(100,pv.corr+0.25);if(S.day%20===0){const tc=mainTC();if(tc)for(let j=0;j<4;j++){const p=spawnPos(tc);mkUnit('mizrakli','a',p.x,p.y,{life:DAY*40,st:'idle'});}log('⚔ '+PROV[pk].n+' valisi 4 asker gönderdi.');}}
  if(pv.corr>=70&&S.day>=(pv.nx||0)&&!UI.modalOpen){pv.nx=S.day+20;provScandal(pk,vs);}
 }
}
function provScandal(pk,vs){
 const pv=pr().prov[pk],sp=bestSpy('plot'),b=envBonus()+spBonus(sp,'plot');
 showModal('📜 Vali Yolsuzluğu — '+PROV[pk].n,'Valinin haraç parasını cebine indirdiği söyleniyor. Halk ve vasallar homurdanıyor.\n\nTeftiş: d20 + '+b+' → ZB 13 (%'+pct(13,b)+')',[
  {t:'Teftiş (200💰)',fn:()=>{if(S.res.gold<200){log('⛔ Altın yetersiz.');return;}S.res.gold-=200;if(sp)sp.busy=S.day+3;const d=dice(null,13,b);if(d.m>=0){pv.corr=10;showModal('📜 Teftiş',d.txt+'\n\nYolsuzluk ortaya çıkarıldı, vali uyarıldı.',[{t:'Tamam'}]);}else{vs.forEach(i=>S.kings[i].loy=Math.max(0,(S.kings[i].loy||55)-8));pr().pen=(pr().pen||0)+4;showModal('📜 Teftiş',d.txt+'\n\nSonuç alınamadı, vasallar öfkeli.',[{t:'Tamam'}]);}}},
  {t:'Görmezden gel',fn:()=>{vs.forEach(i=>S.kings[i].loy=Math.max(0,(S.kings[i].loy||55)-12));pv.corr=55;}},
  {t:'Valiyi değiştir (Adil)',fn:()=>{pv.gov='adil';pv.corr=20;}}]);
}
function provBlock(){
 if(!(S.eg&&S.eg.empire))return '';
 const P=pr();let h='<div style="margin:6px 0;padding:6px;border:1px solid #ffffff30;border-radius:8px"><b>🏛 Eyaletler</b><br><small>Vali etkisi her eyaletteki vasallara uygulanır.</small>';
 for(const pk in PROV){if(!S.world&&pk!=='kadim')continue;const pv=P.prov[pk],n=S.kings.filter((k,i)=>k.vassal&&!k.dead&&PROV[pk].f(i)).length;
  h+='<div class="row"><b>'+PROV[pk].n+'</b> ('+n+' vasal)<br><small>'+GOV[pv.gov].n+' — '+GOV[pv.gov].d+' · yolsuzluk '+Math.round(pv.corr)+'</small><br>'+btn('👤 Vali: '+GOV[pv.gov].n,'gov',pk)+btn('🔍 Teftiş (200💰)','insp',pk,S.res.gold<200||n===0)+'</div>';}
 return h+'</div>';
}
// ---- ikmal ----
function logiDay(){
 if(!S.world)return;
 const bases=S.blds.filter(b=>b.team==='p'&&(b.t==='tc'||b.t==='ikmal')&&b.done!==false);
 const friends=KINGS.map((K,i)=>({K,i})).filter(o=>S.kings[o.i]&&!S.kings[o.i].dead&&(S.kings[o.i].vassal||S.kings[o.i].pact==='ittifak'));
 let n=0;
 S.units.forEach(u=>{if(u.dead||u.team!=='p'||!UT[u.t].mil||u.t==='kahraman')return;
  const ok=bases.some(b=>Math.hypot(u.x-b.x,u.y-b.y)<(b.t==='tc'?85:75))||friends.some(o=>Math.hypot(u.x-o.K.x,u.y-o.K.y)<70)||S.blds.some(b=>b.team==='p'&&!b.decor&&Math.hypot(u.x-b.x,u.y-b.y)<28);
  if(!ok){u.hp-=u.mhp*0.04;n++;if(u.hp<=1)u.hp=1;}});
 if(n)log('⚠ '+n+' asker ikmalsiz yıpranıyor! İkmal Kampı kur ya da geri dön.');
}
// ---- kriz senaryoları ----
function worldDay(){
 if(!S.world)return;const W=S.world,P=pr(),t=S.day-W.t0;W.ev=W.ev||{};
 // göçebe baskınları
 const bz=KINGS.findIndex(k=>k.cul==='bozkir');
 if(bz>=0){const k=S.kings[bz];
  if(!k.dead&&!k.vassal&&k.pact!=='ittifak'&&(P.m[bz]||0)<60&&S.day>=(W.nomad||W.t0+30)&&!UI.modalOpen){
   W.nomad=S.day+ri(26,36);const g=250+Math.floor(S.day*0.8),n=8+Math.floor(S.day/30);
   if(Math.random()<0.7)showModal('🏇 Göçebe Elçisi','Bozkır Konfederasyonu\'ndan bir elçi: "Kağan Börü der ki: '+g+' altın ver, 25 gün atlılarımız sınırında kalsın. Vermezsen ata biner."',[
    {t:'Haraç öde ('+g+'💰)',fn:()=>{if(S.res.gold>=g){S.res.gold-=g;W.nomad=S.day+25;adjRel(bz,6);}else{nomadRaid(n);}}},
    {t:'Reddet, savaşa hazırlan',fn:()=>nomadRaid(n)}]);
   else nomadRaid(n);}
 }
 // 40. gün: Büyük Sürü
 if(t>=40&&!W.ev.sur){W.ev.sur=1;if(bz>=0&&!S.kings[bz].dead&&!S.kings[bz].vassal&&(P.m[bz]||0)<60&&S.kings[bz].pact!=='ittifak'){nomadRaid(30+Math.floor(S.day/25),true);showModal('🐎 BÜYÜK SÜRÜ','Bozkırdan toz bulutu yükseliyor: Kağan Börü bütün atlılarını gönderdi! Köyünü ve ordunu hazırla.',[{t:'Hazırım'}]);}}
 // 80. gün: Karşı Taç
 if(t>=80&&!W.ev.taç&&!UI.modalOpen){W.ev.taç=1;
  const p=egFindWalk(MW*0.5,MH*0.45,50,30);
  if(p){for(let dy=-5;dy<=7;dy++)for(let dx=-6;dx<=8;dx++){const X=p.x+dx,Y=p.y+dy;if(inMap(X,Y)&&OCC[Y*MW+X]===0&&T[Y*MW+X]!==0){T[Y*MW+X]=0;RA[Y*MW+X]=0;}}
   const tents=[[0,0],[-5,-3],[5,-3],[-5,4],[5,4]].map(o=>walkRect(p.x+o[0],p.y+o[1],2,2)?mkB('tent','b',p.x+o[0],p.y+o[1],true):null).filter(Boolean);
   tents.forEach(t=>{t.hp=t.mhp=Math.round((t.mhp||200)*3);});
   if(tents[0])S.camps.push({id:S.camps.length+1,x:p.x,y:p.y,tent:tents[0].id,alive:true,claim:1});
   const b=mkUnit('haydutreis','b',p.x+0.5,p.y+2.5,{guard:1,hx:p.x,hy:p.y,st:'idle'});b.hp=b.mhp=Math.round(b.mhp*14);b.ds=3.2;b.nm='Karşı Taç (Sahte İmparator)';b.boss=1;
   for(let k=0;k<30;k++){const u=mkUnit(k%3===0?'haydutokcu':k%3===1?'haydutatli':'haydut','b',p.x+1+k%6*0.8,p.y+3+(k/6|0)*0.8,{guard:1,hx:p.x,hy:p.y,st:'idle'});u.hp=u.mhp=Math.round(u.mhp*2.6);u.ds=2.3;}
   S.eg=S.eg||{};S.eg.bosses=S.eg.bosses||[];S.eg.bosses.push({id:b.id,x:p.x,y:p.y,n:'Karşı Taç',done:0,pres:15});revealC(p.x,p.y,6);
   showModal('👑 Aldora\'nın Sırrı','Kadim kalıntılardaki kehanet bir sahtekârın eline geçmiş: "Aldora\'nın gerçek varisi benim" diyen bir adam, bir ordu toplayıp yeni dünyada kendi tacını ilan etti. İmparatorluğunu tanımayacak.\n\nOnu bul ve yenip tacı elinden al. Haritada işaretlendi.',[{t:'Kehaneti bozacağım'}]);}}
 // 120. gün: Büyük Kıtlık
 if(t>=120&&!W.ev.kit&&!UI.modalOpen){W.ev.kit=1;
  showModal('🌾 BÜYÜK KITLIK','Uzak eyaletlerde mahsul kurudu. Vasalların yardım çağrısı yağıyor. İmparator olarak sorumluluk senin.\n\nYardım kervanı (500🍖) yollamak itibarını artırır.',[
   {t:'Kervan yolla (500🍖)',fn:()=>{if(S.res.food>=500){S.res.food-=500;P.pen=0;P.g=Math.min(100,P.g+10);S.kings.forEach(k=>{if(k.vassal&&!k.dead)k.loy=Math.min(100,(k.loy||55)+14);});log('🌾 Yardım kervanları yola çıktı: vasalların sadakati arttı.');}else{S.kings.forEach(k=>{if(k.vassal&&!k.dead)k.loy=Math.max(0,(k.loy||55)-12);});P.pen=(P.pen||0)+10;}}},
   {t:'Yoksay',fn:()=>{S.kings.forEach(k=>{if(k.vassal&&!k.dead)k.loy=Math.max(0,(k.loy||55)-18);});P.pen=(P.pen||0)+15;log('⚠ Yardım gelmedi: vasallar öfkeli, prestij düştü.');}}]);}
}
function nomadRaid(n,big){
 const tc=mainTC();if(!tc)return;
 for(let i=0;i<n;i++){const p=egFindWalk(BASE_W+4,112,22)||egFindWalk(MW/2,MH/3,50);if(!p)break;
  const u=mkUnit(i%3===0?'haydutokcu':'haydutatli','b',p.x,p.y,{st:'raid',gt:tc.id});u.hp=u.mhp=Math.round(u.mhp*(big?1.7:1.4));u.ds=big?2:1.6;}
 log('🏇 Göçebe atlıları '+n+' kişilik bir akınla köyüne yöneldi!');
}
(function(){
 const _s=succession;succession=function(why){const r=_s(why);
  try{if(S.eg&&S.eg.empire){const P=pr();let rev=0;S.kings.forEach((k,i)=>{if(!k.vassal||k.dead)return;k.loy=Math.max(0,(k.loy||55)-15);if(P.g<40&&k.loy<35&&Math.random()<0.5){k.vassal=false;k.war=true;k.pw=1;k.rel=-40;k.lastWar=S.day;rev++;log('⚔ '+KINGS[i].n+' taht değişikliğinden yararlanıp isyan etti!');}});
   showModal('⚰ Taht Krizi','Hükümdarın değişmesiyle imparatorluk sarsıldı: tüm vasalların sadakati düştü'+(rev?' ve '+rev+' vasal isyan etti':'')+'.\nPrestij ne kadar yüksekse o kadar az isyan çıkar.',[{t:'Anladım'}]);}}catch(e){}
  return r;};
 const _e=egBossCheck;egBossCheck=function(){const E=S.eg||{},before=(E.bosses||[]).map(b=>b.done);_e();(E.bosses||[]).forEach((b,i)=>{if(b.done&&!before[i]&&b.pres){pr().g=Math.min(100,pr().g+b.pres);addRes('gold',1500);log('👑 '+b.n+' yenildi: prestij +'+b.pres+', +1500 altın.');}});};
 const _p=pDip;pDip=function(){return _p()+(S.world?kabulBlock():'');};
 const _sb=stateBlock;stateBlock=function(){let h=_sb();
  const g=pr().g,o=expedOK();
  h=h.replace(/<\/div>$/,'')+'<div style="margin-top:4px">🌟 <b>İmparatorluk Prestiji: '+Math.round(g)+'</b> '+bar(g/100)+' <small>('+(g>=70?'+2 zar, vasallar sadık':g>=50?'+1 zar':g<25?'−1 zar, isyan riski':'nötr')+')</small></div>';
  if(S.eg&&S.eg.empire&&!S.world){
   h+='<div style="margin-top:4px">'+(S.expd?'⚓ Büyük Keşif seferi sürüyor: '+Math.max(0,S.expd.end-S.day)+' gün kaldı.':btn('🌍 Büyük Keşif seferi (1500💰 400🪵 300🍖)','exped',null,!(o.liman&&o.tech&&o.res))+'<br><small>Koşul: Liman '+(o.liman?'✔':'✘')+' · Büyük Gemiler '+(o.tech?'✔':'✘')+' · kaynak '+(o.res?'✔':'✘')+'. Haritanın ötesini açar, yeni krallıklar çıkar.</small>')+'</div>';}
  return h+'</div>'+provBlock();};
 const _a=act;act=function(a,v,w,el){
  if(a==='exped'){expedStart();return;}
  if(a==='kab'){kabulDo(+v,w);return;}
  if(a==='gov'){const pv=pr().prov[v],ks=Object.keys(GOV);pv.gov=ks[(ks.indexOf(pv.gov)+1)%ks.length];updPanel(true);return;}
  if(a==='insp'){const pv=pr().prov[v];if(S.res.gold>=200){S.res.gold-=200;const d=dice(null,13,envBonus()+spBonus(bestSpy('plot'),'plot'));if(d.m>=0){pv.corr=Math.max(0,pv.corr-35);log('🔍 Teftiş: yolsuzluk azaldı.');}else log('🔍 Teftiş sonuçsuz kaldı.');}updPanel(true);return;}
  return _a(a,v,w,el);};
 const _od=onDay;onDay=function(){_od.apply(null,arguments);
  try{prestigeCalc();provDay();logiDay();worldDay();
   if(S.expd&&S.day>=S.expd.end){S.expd=null;expandWorld();}
  }catch(e){console.error(e);}};
})();
if(typeof ACH!=='undefined')ACH.push({id:'newworld',n:'Kâşif',d:'Büyük Keşif seferini tamamla',ok:()=>!!S.world},{id:'acc1',n:'Tanınan İmparator',d:'Yeni dünyadan bir halkı kabul ettir',ok:()=>(S.stats.acc||0)>=1},{id:'acc5',n:'Dünya İmparatoru',d:'Beş yeni halkı da kabul ettir',ok:()=>(S.stats.acc||0)>=5});
