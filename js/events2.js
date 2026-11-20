'use strict';
// ===== DERİN OLAYLAR: zar atışlı seçimler, kalıcı etkiler =====
function e2(){S.eg=S.eg||{};const E=S.eg;E.e2=E.e2||{inv:[],fav:[],masters:0,ozan:0,mercDay:0};return E.e2;}
function pct(dc,b){return Math.round(pOdds(dc,b)*100);}
function rollTxt(dc,b){const d=dice(null,dc,b);return d;}
function pickKing(f){const a=S.kings.map((k,i)=>i).filter(i=>!S.kings[i].dead&&!S.kings[i].vassal&&(!f||f(S.kings[i])));return a.length?a[ri(0,a.length-1)]:-1;}
function spawnMerc(n,types,life){const tc=mainTC();if(!tc)return;for(let i=0;i<n;i++){const p=spawnPos(tc);mkUnit(types[i%types.length],'a',p.x,p.y,{life:life,st:'idle'});}}
const EV2=[
 // 1) Paralı asker kaptanı
 {w:2.2,ok:()=>S.age>=1&&S.day>=14&&S.day>=(e2().mercDay||0),fn:()=>{
  const E=e2(),cost=260,env=envBonus();E.mercDay=S.day+25;
  showModal('⚔ Paralı Asker Kaptanı','Kaptan Rolf ve 8 savaşçısı köyünün kapısında: "40 gün boyunca senin için dövüşürüz. Fiyat '+cost+' altın."\n\nPazarlık: d20 + '+env+' → ZB 14 (%'+pct(14,env)+'). Başarırsan yarı fiyata, kritik hatada hakaret sayıp düşman olurlar.',[
   {t:'Kirala ('+cost+'💰)',fn:()=>{if(S.res.gold>=cost){S.res.gold-=cost;spawnMerc(8,['kilic','okcu','mizrakli','atli'],DAY*40);log('⚔ 8 paralı asker 40 gün hizmet edecek.');}else log('⛔ Altın yetersiz.');}},
   {t:'Pazarlık (%'+pct(14,env)+')',fn:()=>{const d=rollTxt(14,env);let t=d.txt+'\n\n';
     if(d.m>=0){const c=Math.round(cost/2);if(S.res.gold>=c){S.res.gold-=c;spawnMerc(8,['kilic','okcu','mizrakli','atli'],DAY*40);t+='Rolf güldü ve kabul etti: '+c+' altına 8 savaşçı 40 gün senin!';}else t+='Anlaştınız ama altının yetmedi.';}
     else if(d.m>-5)t+='Rolf omuz silkip gitti.';
     else{t+='Rolf hakaret sayıp çıkışırken yağma yaptı: -120 altın. Adamları ormanda pusuya yatmış olabilir.';S.res.gold=Math.max(0,S.res.gold-120);S.raidAt=Math.min(S.raidAt,S.day+3);}
     showModal('⚔ Pazarlık',t,[{t:'Tamam'}]);}},
   {t:'Reddet',fn:()=>{if(Math.random()<0.25){S.raidAt=Math.min(S.raidAt,S.day+4);log('⚠ Reddedilen paralı askerler haydutlara katıldı: baskın yaklaşıyor.');}}}]);}},
 // 2) Gizemli yabancı
 {w:2.4,ok:()=>S.day>=10,fn:()=>{
  const roll=Math.random(),kind=roll<0.4?'usta':roll<0.75?'ajan':'hasta',P=spS(),sp=bestSpy('gozet'),b=spBonus(sp,'gozet')+envBonus();
  showModal('🧳 Gizemli Yabancı','Yorgun bir yabancı kapıya geldi: "Barınak ve yiyecek karşılığında çalışırım." Üzerinde tuhaf bir koku ve ağır bir çanta var.\n\nSorgulama: d20 + '+b+' → ZB 12 (%'+pct(12,b)+') '+(sp?'['+sp.nm+' ile]':'[casus yok]'),[
   {t:'Konaklat (30🍖)',fn:()=>{if(S.res.food<30){log('⛔ Yiyecek yok.');return;}S.res.food-=30;stranger(kind,false);}},
   {t:'Sorgula (%'+pct(12,b)+')',fn:()=>{const d=rollTxt(12,b);if(sp)sp.busy=S.day+2;
     if(d.m>=0){const nm={usta:'usta bir zanaatkâr',ajan:'bir yabancı ajan',hasta:'hasta biri (veba şüphesi)'}[kind];showModal('🕵 Sorgu',d.txt+'\n\nYabancı '+nm+' çıktı.',[
       {t:'Konaklat',fn:()=>{if(kind==='hasta'){log('🧳 Hasta yabancı karantinaya alındı, salgın çıkmadı.');}else if(kind==='ajan'){addRes('gold',100);log('🧳 Ajan tutuklandı: +100 altın.');}else stranger('usta',true);}},{t:'Kov'}]);}
     else showModal('🕵 Sorgu',d.txt+'\n\nYabancı konuşmadı, bir şey öğrenemedin. Karar: bırak ya da kov.',[{t:'Konaklat',fn:()=>{if(S.res.food>=30){S.res.food-=30;stranger(kind,false);}}},{t:'Kov'}]);}},
   {t:'Kov',fn:()=>{if(kind==='usta')log('🧳 Yabancı yoluna devam etti.');}}]);}},
 // 3) Kervan yatırımı
 {w:2,ok:()=>S.day>=16&&S.res.gold>=150&&e2().inv.length<2,fn:()=>{
  const env=envBonus();
  showModal('🐪 Kervan Yatırımı','Bir kervan kaptanı seni ortaklığa çağırıyor: "200 altın ver, 12 gün sonra payını getireyim. Yol tehlikeli ama kâr büyük."\n\nOlasılıklar (d20): 1-4 soygun (hepsi gider) · 5-14 +%40 · 15-19 ×2 · 20 ×3',[
   {t:'Yatır (200💰)',fn:()=>{if(S.res.gold>=200){S.res.gold-=200;e2().inv.push({at:S.day+12,amt:200,b:Math.floor(envBonus()/2)});log('🐪 200 altın kervana yatırıldı (12 gün).');}}},
   {t:'Büyük yatırım (500💰)',fn:()=>{if(S.res.gold>=500){S.res.gold-=500;e2().inv.push({at:S.day+12,amt:500,b:Math.floor(envBonus()/2)});log('🐪 500 altın kervana yatırıldı (12 gün).');}}},
   {t:'Geç'}]);}},
 // 4) Haydut elçisi
 {w:2,ok:()=>S.day>=18&&S.camps.some(c=>c.alive),fn:()=>{
  const g=100+Math.floor(S.day*0.8),env=envBonus()+Math.floor(S.units.filter(u=>!u.dead&&u.team==='p'&&UT[u.t].mil).length/8);
  showModal('🥷 Haydut Elçisi','Bir haydut elçisi köy kapısında: "Reisimiz koruma istiyor: '+g+' altın verirsen 20 gün baskın yapmayız."\n\nGözdağı: d20 + '+env+' (çevre + ordu) → ZB 15 (%'+pct(15,env)+')',[
   {t:'Öde ('+g+'💰)',fn:()=>{if(S.res.gold>=g){S.res.gold-=g;S.raidAt+=20;S.camps.forEach(c=>{c.peace=Math.max(c.peace||0,S.day+20);});log('🤝 Haydutlarla 20 günlük anlaşma yapıldı.');}else log('⛔ Altın yetersiz, elçi öfkeyle gitti.');}},
   {t:'Gözdağı ver (%'+pct(15,env)+')',fn:()=>{const d=rollTxt(15,env);let t=d.txt+'\n\n';
     if(d.m>=5){t+='Elçi titreyerek kaçtı. Haydutlar köyünden korkacak: 25 gün baskın yok, yolda elçiden '+Math.round(g/2)+' altın düştü.';S.raidAt+=25;addRes('gold',Math.round(g/2));}
     else if(d.m>=0){t+='Elçi geri çekildi: 12 gün sakin.';S.raidAt+=12;}
     else if(d.m>-5){t+='Elçi tehditler savurup gitti: baskın erkene alındı.';S.raidAt=Math.min(S.raidAt,S.day+3);}
     else{t+='Elçi öfkeyle ayrıldı, haydutlar tüm güçleriyle geliyor!';S.raidAt=Math.min(S.raidAt,S.day+2);S.eg.bigRaid=S.day+2;}
     showModal('🥷 Gözdağı',t,[{t:'Tamam'}]);}},
   {t:'Reddet',fn:()=>{S.raidAt=Math.min(S.raidAt,S.day+5);}}]);}},
 // 5) Müttefik yardım ister
 {w:2,ok:()=>S.kings.some(k=>!k.dead&&!k.vassal&&(k.pact==='ittifak'||k.pact==='ticaret')),fn:()=>{
  const i=pickKing(k=>k.pact==='ittifak'||k.pact==='ticaret');if(i<0)return;const K=KINGS[i],k=S.kings[i],n=100,f=120;
  showModal('📨 '+K.n+' yardım istiyor',K.who+': "Kuraklık ambarlarımızı vurdu. '+f+' yiyecek ve '+n+' altın göndersen unutmayız."\n\nYardım edersen ilişki +20 ve 15 gün sonra karşılığını (≈1,6 katı) geri öder. Reddedersen ilişki -12; üç kez reddedersen ittifak bozulur.',[
   {t:'Yardım et ('+f+'🍖 '+n+'💰)',fn:()=>{if(S.res.food>=f&&S.res.gold>=n){S.res.food-=f;S.res.gold-=n;adjRel(i,20);k.refuse=0;e2().fav.push({at:S.day+15,i,g:Math.round(n*1.6)});log('🎁 '+K.n+' yardımını unutmayacak.');}else log('⛔ Kaynak yetersiz.');}},
   {t:'Yarım yardım (60🍖)',fn:()=>{if(S.res.food>=60){S.res.food-=60;adjRel(i,6);}}},
   {t:'Reddet',fn:()=>{adjRel(i,-12);k.refuse=(k.refuse||0)+1;if(k.refuse>=3&&k.pact==='ittifak'){k.pact='ticaret';k.refuse=0;showModal('💔 İttifak bozuldu',K.n+' üç yardım çağrısına sessiz kalındığı için ittifakı bozdu.',[{t:'Anladım'}]);}}}]);}},
 // 6) Halk dilekçesi
 {w:2.6,ok:()=>S.day>=20&&S.happy<50&&popNow()>=20,fn:()=>{
  const env=envBonus(),mil=Math.floor(S.units.filter(u=>!u.dead&&u.team==='p'&&UT[u.t].mil).length/10);
  showModal('📜 Halk Dilekçesi','Köylülerin temsilcisi dilekçe sundu: "Vergiler ağır, karınlar aç. Ya hakkımızı ver ya da gideriz."\n\nGörüşme: d20 + '+env+' → ZB 13 (%'+pct(13,env)+') · Baskı: d20 + '+(env+mil)+' → ZB 15 (%'+pct(15,env+mil)+')',[
   {t:'Taviz ver (100🍖 50💰)',fn:()=>{if(S.res.food>=100&&S.res.gold>=50){S.res.food-=100;S.res.gold-=50;S.happy=Math.min(100,S.happy+12);egDec().vergi=0;log('🕊 Vergi düşürüldü, halk rahatladı.');}else log('⛔ Kaynak yetersiz.');}},
   {t:'Görüş (%'+pct(13,env)+')',fn:()=>{const d=rollTxt(13,env);let t=d.txt+'\n\n';
     if(d.m>=0){S.happy=Math.min(100,S.happy+8);t+='Temsilciyi ikna ettin: halk yarım taviz kabul etti (+8 mutluluk).';}
     else if(d.m>-5){t+='Görüşme sonuçsuz, halk hâlâ huzursuz.';S.happy=Math.max(0,S.happy-2);}
     else{t+='Görüşme tartışmaya döndü: halkın bir kısmı köyü terk etti.';let n=0;for(const u of S.units){if(n>=3)break;if(u.team==='p'&&u.t==='koylu'&&!u.dead){u.dead=1;UM.delete(u.id);n++;}}S.happy=Math.max(0,S.happy-8);}
     showModal('📜 Görüşme',t,[{t:'Tamam'}]);}},
   {t:'Baskı (%'+pct(15,env+mil)+')',fn:()=>{const d=rollTxt(15,env+mil);let t=d.txt+'\n\n';
     if(d.m>=0){t+='Dilekçeciler dağıldı. Huzur sağlandı ama korku var (-4 mutluluk).';S.happy=Math.max(0,S.happy-4);}
     else{t+='Baskı ters tepti: sokaklarda isyan! 3 köylü öldü, mutluluk -12.';let n=0;for(const u of S.units){if(n>=3)break;if(u.team==='p'&&u.t==='koylu'&&!u.dead){killU(u);n++;}}S.happy=Math.max(0,S.happy-12);}
     showModal('📜 Baskı',t,[{t:'Tamam'}]);}}]);}},
 // 7) Kehanet / bilge
 {w:1.6,ok:()=>S.day>=10,fn:()=>{
  showModal('🔮 Gezgin Kâhin','Yaşlı bir kâhin ağzını açtı: "Geleceği okurum." Karşılığında '+(S.age>=2?80:40)+' yiyecek istiyor.',[
   {t:'Danış',fn:()=>{const c=S.age>=2?80:40;if(S.res.food<c){log('⛔ Yiyecek yetersiz.');return;}S.res.food-=c;const E=S.eg||{};
     const rd=S.raidAt-S.day,dd=E.nextDis?E.nextDis-S.day:null;const bad=Math.random()<0.2;
     showModal('🔮 Kehanet',bad?'Kâhin bulanık sözler söyledi, bir şey anlaşılmadı.':'"Haydutlar '+Math.max(0,rd)+' gün içinde gelecek."'+(dd!=null?'\n"Gökte kötü bir alamet '+Math.max(0,dd)+' gün sonra belirecek."':'')+'\n\nKâhin hep doğru söylemez ama çoğu zaman haklı çıkar.',[{t:'Teşekkürler'}]);}},
   {t:'Geç'}]);}}
];
function stranger(kind,known){
 const E=e2();
 if(kind==='usta'){E.masters=Math.min(5,(E.masters||0)+1);showModal('🛠 Usta Zanaatkâr','Yabancı usta bir zanaatkârmış! Köyünde kalıp çırak yetiştirecek: günlük +4 altın kalıcı (şu an '+E.masters+' usta, en fazla 5).',[{t:'Hoş geldin'}]);}
 else if(kind==='ajan'){const g=Math.min(S.res.gold,150);S.res.gold-=g;const i=pickKing();if(i>=0)adjRel(i,-10);showModal('🥷 Ajan!','Yabancı bir ajanmış: gece hazineden '+g+' altın çalıp kayboldu ve komşularına köyün zayıflıklarını anlattı.',[{t:'Lanet olsun'}]);}
 else{S.epi={left:3,sev:1+Math.random()*0.5};showModal('🤒 Hasta Yabancı','Yabancı veba taşıyormuş! Köyde salgın başladı. Hastane ve şifacılar kayıpları azaltır.',[{t:'Eyvah'}]);}
}
EV2.forEach(e=>{EVENTS.push(e);});
function ev2Day(){
 if(!S.founded)return;const E=e2();
 E.inv=E.inv.filter(v=>{if(S.day<v.at)return true;
  const r=d20()+(v.b||0),m=r<=4?0:r<=14?1.4:r<=19?2:3,g=Math.round(v.amt*m);
  if(g>0)addRes('gold',g);
  showModal('🐪 Kervan Döndü',m===0?'Kervan yolda soyuldu! '+v.amt+' altın kayıp. (zar '+r+')':'Kervan döndü: '+v.amt+' → '+g+' altın! (zar '+r+', ×'+m+')',[{t:'Tamam'}]);return false;});
 E.fav=E.fav.filter(f=>{if(S.day<f.at)return true;if(!S.kings[f.i].dead){addRes('gold',f.g);log('🎁 '+KINGS[f.i].n+' borcunu geri ödedi: +'+f.g+' altın.');}return false;});
 if(E.masters)addRes('gold',E.masters*4);
 if(S.eg.bigRaid&&S.day>=S.eg.bigRaid){S.eg.bigRaid=0;const tc=mainTC();if(tc){const n=clamp(8+Math.floor(S.day/10),10,30);for(let i=0;i<n;i++){const p=egFindWalk(MW/2,MH/2,60);if(!p)break;const u=mkUnit(i%3===0?'haydutatli':i%2?'haydutokcu':'haydut','b',p.x,p.y,{st:'raid',gt:tc.id});u.hp=u.mhp=Math.round(u.mhp*1.6);u.ds=1.5;}log('🥷 Öfkeli haydutlar toplu saldırıya geçti!');}}
}
(function(){const _od=onDay;onDay=function(){_od.apply(null,arguments);try{ev2Day();}catch(e){console.error(e);}};})();
