'use strict';
// ===== HİKAYE: Aldora'nın Son Varisi =====
// Görevlere ek olarak, ilerlemeye bağlı anlatı sahneleri ve seçimler.
const BEATS=[
 {id:'p0',ok:()=>S.founded,t:'📜 Aldora Küller İçinde',x:'Üç ay önce, Aldora Krallığı\'nın başkenti bir gecede düştü. Tahtı gasp eden Lord Maldric, kralın bütün soyunu avlattı. Ateşin arasından senin küçük kafilen sağ çıkabildi: birkaç aile, bir ihtiyar danışman ve babanın mühürlü yüzüğü.\nİhtiyar Bertram eğilip fısıldıyor: "Ayakta kalan son varis sensin. Bu toprakta bir köy kur, güçlen... ve bir gün tacını geri al."'},
 {id:'p1',ok:()=>S.founded&&S.day>=4,t:'🧓 Bertram\'ın Öğüdü',x:'Danışman Bertram ocağın başında konuşuyor:\n"Krallıklar kılıçla değil, ambarla ayakta kalır. Önce kışı atlat. Sonra surlar, sonra ittifaklar. Maldric\'in casusları her yerde; acele edersen gözüne batarsın."',b:[{t:'Dinledim'}]},
 {id:'w1',ok:()=>S.day>=YEARD,t:'❄ İlk Kışın Ardından',x:'Karlar eridi. Köylüler seni artık yalnızca bir sürgün değil, bir lider olarak görüyor. Bir kervan ihtiyarı Bertram\'a bir mektup bırakıp gitti:\n"Maldric, kayıp varisi arıyor. Sürgündeki bir köyün adını duydu."',b:[{t:'Sessiz kal (halk huzurlu)',fn:()=>{S.happy=Math.min(100,S.happy+3);}},{t:'Gözcü tut (40 💰)',fn:()=>{if(S.res.gold>=40){S.res.gold-=40;log('👁 Yeni gözcüler sınırı izliyor.');}else S.happy=Math.max(0,S.happy-2);}}]},
 {id:'c1',ok:()=>(S.stats.camps||0)>=1,t:'🗡 Mühürlü Mektup',x:'Yıkılan haydut kampının reisinin üzerinden kanlı bir mühür ve mektup çıktı: "Köyü aç bırak, ekinleri yak. — M." Bu haydutlar sıradan eşkıyalar değil; Maldric\'in gizli paralı askerleri.\nHalk ilk kez bu savaşın sadece hayatta kalmak olmadığını anlıyor.',b:[{t:'Intikam yemini et',fn:()=>{addRes('gold',60);S.happy=Math.min(100,S.happy+4);}}]},
 {id:'a1',ok:()=>S.age>=1,t:'⚔ Sadık Şövalye',x:'Bronz çağının ilk günlerinde, kapıya yaralı bir atlı dayanıyor: Sör Aldric, babanın eski muhafızı. "Efendim... yaşıyorsunuz!" diye diz çöküyor. Yanında üç sadık asker getirmiş.',b:[{t:'Hoş geldin Sör Aldric',fn:()=>{const tc=mainTC();if(tc)for(let i=0;i<3;i++){const p=spawnPos(tc);mkUnit('kilic','p',p.x,p.y,{});}log('⚔ Sör Aldric ve üç asker saflarına katıldı.');}}]},
 {id:'k1',ok:()=>S.kings.some(k=>k.pact),t:'🕊 Komşuların Gözü',x:'Elçilik sayesinde komşu krallıklarla yazışıyorsun. Bertram uyarıyor: "Maldric onlara da elçi gönderdi. Kimi korkutacak, kimi satın alacak. Dostlarını hediyelerle ve sözünle yanında tut."\n(⚠ Maldric\'in elçilerinin etkisiyle birkaç krallıkla ilişkilerin düşüyor: −12.)',b:[{t:'Anladım',fn:()=>{const idx=S.kings.map((k,i)=>i).sort(()=>Math.random()-0.5).slice(0,Math.max(1,Math.min(3,S.kings.length-1)));const nm=[];idx.forEach(i=>{adjRel(i,-12);nm.push(KINGS[i].n);});if(nm.length)log('📉 Maldric\'in entrikası: '+nm.join(', ')+' ile ilişkilerin düştü (−12).');}}]},
 {id:'r2',ok:()=>S.rank>=2,t:'🦅 Maldric\'in Elçisi',x:'Şehir ilan edince Maldric\'in elçisi kapıda: "Lord Maldric büyük gönüllüdür. Tacı bırakıp sessiz bir ömür sürmeni ister. Karşılığında 400 altın ve dokunulmazlık."',b:[{t:'Reddet — "Aldora\'nın varisi pazarlık yapmaz"',fn:()=>{S.sf.refused=1;S.happy=Math.min(100,S.happy+8);log('🔥 Elçi öfkeyle ayrıldı. Maldric\'in gazabı yaklaşıyor.');S.raidAt=Math.min(S.raidAt,S.day+3);}},{t:'Kabul et (+400 💰, halk küsüyor)',fn:()=>{addRes('gold',400);S.happy=Math.max(0,S.happy-18);S.sf.bribed=1;log('💰 Altın aldın ama halkın gözünde değerin düştü.');}}]},
 {id:'a3',ok:()=>S.age>=3,t:'🌑 Karanlık Bir Haber',x:'Orta Çağ\'a girdin ve gece nöbetçileri dağlardan gelen meşaleleri sayıyor. Casuslar fısıldıyor: "Maldric büyük bir ordu topluyor. Hedefi Aldora\'yı geri alan değil, onu doğuran köy."\nSurlarını sağlamlaştır, kapıları kapat; kapılar yalnızca halkın için açılır.',b:[{t:'Hazırlan'}]},
 {id:'l3',ok:()=>S.rank>=3,t:'🏰 Aldora\'nın Halkı',x:'Lordluk ilan edilince haber Aldora\'ya ulaştı. Maldric\'in zulmünden kaçan yüzlerce kişi yollara düştü. Dağın ardından uzun bir kafile geliyor: "Tacın sahibi yaşıyor!"',b:[{t:'Kapıları aç',fn:()=>{const tc=mainTC();if(tc){for(let i=0;i<6;i++){const p=spawnPos(tc);mkUnit('koylu','p',p.x,p.y,{});}}S.happy=Math.min(100,S.happy+6);log('👨‍👩‍👧 Aldora\'dan 6 kişi köye sığındı.');spawnFortress();if(S.sf.fort)log('🏯 Gözcüler haritanın uzak köşesinde Maldric\'in Kara Kale\'sini buldu!',S.sf.fort.x,S.sf.fort.y);}}]},
 {id:'b4',ok:()=>S.age>=4,t:'💥 Barut Çağı',x:'Ateş tozu savaşın yüzünü değiştiriyor. Bertram yaşlı gözleriyle toplara bakıyor: "Babanın surları kılıçlara karşı yapılmıştı. Maldric\'in kaleleri şimdi senin toplarının önünde duracak."',b:[{t:'Toplar hazır'}]},
 {id:'f5',ok:()=>S.rank>=4,t:'👑 Krallık İlanı',x:'Halk meydanda toplandı. Bertram, gözyaşları içinde babanın yüzüğünü uzatıyor: "Aldora ölmedi... Aldora sensin."\nAma Maldric hâlâ Kara Kale\'de oturuyor ve uzak köşedeki surlarının ardında yeni bir ordu topluyor. Taç ancak o kale düşünce tamamen senin olur.',b:[{t:'Kara Kale\'ye yürüyeceğiz',fn:()=>{addRes('gold',500);S.happy=Math.min(100,S.happy+10);if(S.sf.fort)focusTile&&focusTile(S.sf.fort.x,S.sf.fort.y);}}]}
];
function spawnFortress(){
 S.sf=S.sf||{};if(S.sf.fort)return;
 const st=S.start;
 const cands=[[22,22],[MW-27,22],[22,MH-27],[MW-27,MH-27]].map(([x,y])=>({x,y,d:Math.hypot(x-st.x,y-st.y)})).sort((a,b)=>b.d-a.d);
 for(const c of cands){
  for(let dy=-6;dy<=12;dy++)for(let dx=-6;dx<=9;dx++){const X=c.x+dx,Y=c.y+dy;if(inMap(X,Y)&&OCC[Y*MW+X]===0&&T[Y*MW+X]!==0){T[Y*MW+X]=0;RA[Y*MW+X]=0;}}
  if(!walkRect(c.x,c.y,4,4))continue;
  const b=mkB('karakale','b',c.x,c.y,true);
  S.sf.fort={x:c.x,y:c.y,id:b.id};
  const mk=(t,n,r)=>{for(let k=0;k<n;k++){const u=mkUnit(t,'b',c.x+0.5+(k%5)*0.9-1.5,c.y+5.2+r+(k/5|0)*0.9,{guard:1,hx:c.x+2,hy:c.y+6,st:'idle'});u.hp=u.mhp=Math.round(u.mhp*2.6);u.ds=2.2;}};
  fortRing(c);S.sf.nextAtk=S.day+10;
  mk('haydutreis',10,0);mk('haydutokcu',8,1.5);mk('haydutatli',5,3);
  revealC(c.x+2,c.y+2,10);
  return true;
 }
 return false;
}
function fortRing(c){
 const x0=c.x-4,x1=c.x+7,y0=c.y-4,y1=c.y+10,mx=c.x+1;
 const tw=[[x0,y0],[x1-1,y0],[x0,y1-1],[x1-1,y1-1],[mx-3,y1-1],[mx+3,y1-1]];
 for(const [tx,ty] of tw)if(walkRect(tx,ty,2,2)){const t=mkB('bkule','b',tx,ty,true);t.ds=1.25;}
 for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){
  if(x!==x0&&x!==x1&&y!==y0&&y!==y1)continue;
  if((x===mx||x===mx+1)&&(y===y0||y===y1))continue;
  if((y===c.y+3||y===c.y+4)&&(x===x0||x===x1))continue;
  if(walkRect(x,y,1,1))mkB('bduvar','b',x,y,true);
 }
}
function fortAttack(f){
 const tc=mainTC();if(!tc)return;
 const n=clamp(6+Math.floor(S.day/12)+S.rank*2,8,36);
 for(let i=0;i<n;i++){const t=i%5===0?'haydutatli':i%2?'haydutokcu':'haydutreis';
  const u=mkUnit(t,'b',f.x+1+(i%6)*0.7,f.y+11.5+(i/6|0)*0.7,{st:'raid',gt:tc.id});u.hp=u.mhp=Math.round(u.mhp*2.2);u.ds=1.9;}
 log('⚔ MALDRİC SEFERE ÇIKTI! Kara Kale\'den '+n+' elit savaşçı köyüne yürüyor.',f.x,f.y);
}
function fortDay(){
 const f=S.sf&&S.sf.fort;if(!f||S.sf.maldricDead)return;
 const b=BM.get(f.id);if(!b)return;
 const g=S.units.filter(u=>u.team==='b'&&!u.dead&&Math.hypot(u.x-f.x,u.y-f.y)<14).length;
 if(g<20&&S.day%3===0)for(let k=0;k<2;k++){const u=mkUnit(k?'haydutokcu':'haydutreis','b',f.x+1+k,f.y+5,{guard:1,hx:f.x+2,hy:f.y+6,st:'idle'});u.hp=u.mhp=Math.round(u.mhp*2.6);u.ds=2.2;}
 if(S.day>=(S.sf.nextAtk||0)&&S.rank>=3){S.sf.nextAtk=S.day+Math.max(7,13-Math.floor(S.rank*1.5));fortAttack(f);}
}
function storyCheck(){
 if(S&&S.founded&&S.rank>=3&&!(S.sf&&S.sf.fort))spawnFortress();
 fortDay();
 if(!S||!S.founded)return;
 S.sf=S.sf||{};
 for(const b of BEATS){
  if(S.sf[b.id]||!b.ok())continue;
  S.sf[b.id]=1;
  showModal(b.t,b.x,b.b);
  break;
 }
}
(function(){
 const _od=onDay;onDay=function(){_od.apply(null,arguments);try{storyCheck();}catch(e){}};
 const _fv=foundVillage;foundVillage=function(x,y){const r=_fv(x,y);if(r)try{storyCheck();}catch(e){}return r;};
})();
