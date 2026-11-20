'use strict';
// ===== CASUS EVİ, ENTRİKA, SUİKAST (d20 şans sistemi) =====
BT.casusevi={n:'Casus Evi',ic:'🕵',w:3,h:3,hp:380,age:1,cost:{wood:180,stone:100,gold:200},time:40,col:'#46395a',d:'Casus yetiştirir (bina başına 3). Casuslar komşulara görev gider, saray entrikalarını çözer. Şans: d20 zar + casus seviyesi.'};
BCAT[1][1].push('casusevi');
const SPN=['Gölge','Kurt','Sessiz','Tilki','Karga','Yılan','Fısıltı','Pala','Zehra','Mert','Kerem','Nora','Sinan','Lale'];
const STR={sessiz:{n:'Sessiz',d:'Kaçış/yakalanma +2'},zeki:{n:'Zeki',d:'Gözetleme ve entrika +2'},zehirli:{n:'Zehirci',d:'Suikast +2'}};
const MIS={
 gozet:{n:'Gözetle',ic:'🔎',days:3,dc:8,cost:80,age:1},
 sab:{n:'Sabotaj',ic:'🔥',days:5,dc:13,cost:200,age:1},
 sv:{n:'Veliaht Suikastı',ic:'🗡',days:12,dc:15,cost:600,age:3,lv:2},
 sk:{n:'Kral Suikastı',ic:'☠',days:16,dc:18,cost:1000,age:3,lv:2}
};
function spS(){S.spy=S.spy||{list:[],q:[],nid:1,mis:[],seen:{}};return S.spy;}
function spCap(){return Math.min(9,countB('casusevi',true)*3);}
function d20(){return 1+Math.floor(Math.random()*20);}
function pOdds(dc,b){return clamp((21-(dc-b))/20,0.05,0.95);}
function spyFree(){const P=spS();return P.list.filter(s=>(s.busy||0)<=S.day&&!s.mission);}
function spBonus(s,kind){if(!s)return -3;let b=s.lv*2;if(s.tr==='zeki'&&(kind==='gozet'||kind==='plot'))b+=2;if(s.tr==='zehirli'&&(kind==='sv'||kind==='sk'))b+=2;return b;}
function envBonus(){const D=S.dyn&&S.dyn.ruler;let b=0;if(D&&D.age>=18)b+=2;if(S.happy>=70)b+=2;else if(S.happy<40)b-=2;if(D&&D.trait==='bilge')b+=2;return b;}
function bestSpy(kind){const f=spyFree();let best=null;f.forEach(s=>{if(!best||spBonus(s,kind)>spBonus(best,kind))best=s;});return best;}
// ---- eğitim ----
function spyTrain(){
 const P=spS();if(P.list.length+P.q.length>=spCap()||S.res.gold<120||S.res.food<40)return;
 S.res.gold-=120;S.res.food-=40;P.q.push({at:S.day+6});log('🕵 Yeni bir casus yetiştiriliyor (6 gün).');updPanel(true);
}
// ---- görevler ----
function misBonus(m,s,i){
 let b=spBonus(s,m);if(s.tr==='sessiz')b+=1;
 const P=spS();if(m!=='gozet'&&(P.seen[i]||0)>S.day)b+=2;
 if(S.kings[i]&&S.kings[i].pers==='bilge')b-=1;
 return b;
}
function misStart(m,i){
 const M=MIS[m],K=KINGS[i],k=S.kings[i],P=spS();
 if(!k||k.dead||k.vassal||S.age<M.age||S.res.gold<M.cost)return;
 const s=bestSpy(m);if(!s||(M.lv&&s.lv<M.lv))return;
 S.res.gold-=M.cost;s.mission={m,i,end:S.day+M.days};P.mis.push({sid:s.id,m,i,end:S.day+M.days});
 log('🕵 '+s.nm+' → '+K.n+': '+M.n+' ('+M.days+' gün).');updPanel(true);
}
function dice(s,dc,b,lab){
 const r=d20(),t=r+b;return {r,t,dc,m:r===20?Math.max(t-dc,5):r===1?Math.min(t-dc,-5):t-dc,txt:'🎲 d20 ('+r+') '+(b>=0?'+':'')+b+' = '+t+' / ZB '+dc+(r===20?' · KRİTİK BAŞARI':r===1?' · KRİTİK HATA':'')};
}
function xpUp(s,n){s.xp=(s.xp||0)+n;if(s.lv<5&&s.xp>=s.lv*3){s.lv++;s.xp=0;log('⭐ '+s.nm+' seviye atladı: '+s.lv+'.');}}
function warChance(i,p,why){
 const k=S.kings[i];if(k.dead||k.war||k.vassal)return false;
 if(Math.random()<p){declareWar(i,false);log('⚔ '+KINGS[i].n+' arkasında sen olduğunu anladı! ('+why+')');return true;}
 return false;
}
function misResolve(mi){
 const P=spS(),s=P.list.find(x=>x.id===mi.sid);if(!s)return;
 const K=KINGS[mi.i],k=S.kings[mi.i],M=MIS[mi.m];s.mission=null;
 if(k.dead){s.busy=S.day+2;return;}
 const dr=dice(s,M.dc,misBonus(mi.m,s,mi.i)),m=dr.m;let t='',ttl=M.ic+' '+M.n+': '+K.n,lost=false;
 const kd=kdOf(mi.i)||{};
 if(mi.m==='gozet'){
  if(m>=0){revealC(K.x,K.y,12);P.seen[mi.i]=S.day+25;const sol=kUnits(mi.i,u=>UT[u.t].mil).length;
   t='Başarılı! '+K.who+' ('+(K.n)+')\nAsker: '+sol+'\nNüfus: '+(kd.pop||'?')+'\nYiyecek: '+Math.round(kd.food||0)+'\nSavaş: '+(k.war?'evet':'hayır')+' · İlişki: '+Math.round(k.rel)+(m>=5?'\n✔ Derin keşif: bu krallığa sonraki görevlerde +2 şans (25 gün).':'');xpUp(s,1);}
  else if(m>-5){t='Casus yeterince bilgi toplayamadı.';}
  else{t='Casus yakalandı ve idam edildi!';lost=true;adjRel(mi.i,-10);}
 }else if(mi.m==='sab'){
  if(m>=0){kd.food=Math.round((kd.food||0)*0.35);kd.wood=Math.round((kd.wood||0)*0.5);kUnits(mi.i,u=>UT[u.t].mil).slice(0,5).forEach(u=>u.hp=Math.max(1,u.hp*0.5));xpUp(s,2);
   t='Ambarlar yandı, 5 asker yaralandı.';if(m<5){t+='\nAma casus yakalandı!';lost=true;adjRel(mi.i,-15);}}
  else if(m>-5){t='Sabotaj yarıda kaldı, casus kaçtı. İlişki -10.';adjRel(mi.i,-10);}
  else{t='Casus yakalandı, '+K.who+' öfkeli!';lost=true;adjRel(mi.i,-30);warChance(mi.i,0.3,'yakalanan casus');}
 }else{
  const king=mi.m==='sk';
  if(m>=0){
   const sol=kUnits(mi.i,u=>UT[u.t].mil);
   if(king){sol.slice(0,Math.ceil(sol.length*0.3)).forEach(u=>killU(u));k.chaos=S.day+24;k.war=false;k.pw=0;S.units.forEach(u=>{if(u.team==='k'&&u.kid===mi.i)killU(u);});k.pers=pick(['bilge','savasci','acgozlu','dost']);k.rel=Math.min(k.rel,0);
    t='☠ '+K.who+' öldü! Krallıkta taht kavgası başladı: ordusunun %30\'u dağıldı, 24 gün saldıramaz. Yeni hükümdar farklı bir yapıda.';}
   else{kd.food=Math.round((kd.food||0)*0.8);k.chaos=S.day+10;t='🗡 Veliaht öldü. Krallık yasta, 10 gün sakin kalacak.';}
   xpUp(s,king?5:3);S.stats.assn=(S.stats.assn||0)+1;
   if(m<5){t+='\nCasus yakalandı!';lost=true;adjRel(mi.i,-40);warChance(mi.i,0.45,'yakalanan suikastçı');}else warChance(mi.i,0.1,'şüphe');
  }else if(m>-5){t='Suikast başarısız oldu, casus kaçtı. İlişki -20.';adjRel(mi.i,-20);warChance(mi.i,0.4,'başarısız suikast');}
  else{t='Suikast başarısız, casus yakalandı! '+K.who+' intikam peşinde.';lost=true;adjRel(mi.i,-50);warChance(mi.i,0.75,'başarısız suikast');}
 }
 if(lost)P.list=P.list.filter(x=>x!==s);else s.busy=S.day+(m<0?5:2);
 showModal(ttl,s.nm+' (Sv.'+s.lv+')\n'+dr.txt+'\n\n'+t,[{t:'Tamam'}]);
}
// ---- saray entrikaları ----
const PLOT={
 zehir:{n:'Zehirleme Girişimi',ic:'🧪',age:1,dc:14,x:'Mutfakta şüpheli bir toz bulundu: biri hükümdarın yemeğini zehirlemek istiyor.',
  ok:()=>{addRes('gold',150);return 'Zehirci yakalandı, mallarına el konuldu: +150 altın.';},
  bad:(f)=>{hurtHero(f>1?0.15:0.4);S.eg.sick=S.day+8;return 'Hükümdar zehirlendi, 8 gün hasta yatacak.';}},
 hazine:{n:'Hazine Yolsuzluğu',ic:'💰',age:0,dc:12,x:'Hazinedar defterlerde tutarsızlık olduğunu fark etti: biri altın çalıyor.',
  ok:()=>{addRes('gold',200);return 'Hırsız bulundu, 200 altın geri alındı.';},
  bad:(f)=>{const l=Math.min(Math.round(S.res.gold*0.3*f),900);S.res.gold-=l;return l+' altın çalındı.';}},
 soylu:{n:'Soylular Komplosu',ic:'👥',age:2,dc:15,x:'Birkaç soylu gizlice toplanıp seni devirmeyi konuşuyor.',
  ok:()=>{addRes('gold',250);return 'Komplocular tutuklandı: +250 altın.';},
  bad:(f)=>{const mil=S.units.filter(u=>!u.dead&&u.team==='p'&&UT[u.t].mil&&u.t!=='kahraman');const n=Math.round(mil.length*0.2*f);mil.slice(0,n).forEach(u=>killU(u));S.happy=Math.max(0,S.happy-8);return n+' asker komplocularla birlikte ayrıldı, halk huzursuz.';}},
 ajan:{n:'Yabancı Ajan',ic:'🕶',age:1,dc:13,x:'Köyde bir yabancı ajan, komşu krallıklar arasında senin hakkında dedikodu yayıyor.',
  ok:()=>{const a=S.kings.map((k,i)=>i).filter(i=>!S.kings[i].dead&&!S.kings[i].vassal);if(a.length)adjRel(pick(a),10);return 'Ajan ele geçirildi, itibarın arttı (bir krallıkla ilişki +10).';},
  bad:(f)=>{const a=S.kings.map((k,i)=>i).filter(i=>!S.kings[i].dead&&!S.kings[i].vassal);if(a.length)adjRel(pick(a),-25*f);return 'Dedikodular işe yaradı: bir krallıkla ilişkin bozuldu.';}},
 suikast:{n:'Suikast Girişimi',ic:'🗡',age:2,dc:17,x:'Gece bir suikastçı hükümdarın odasına sızmaya çalışıyor!',
  ok:()=>{addRes('gold',300);return 'Suikastçı yakalandı, efendisi ifşa oldu: +300 altın.';},
  bad:(f,m)=>{const D=S.dyn;if(m<=-5&&f<=1&&D.heirs&&D.heirs.length>0){setTimeout(()=>succession('suikasta kurban gitti'),50);return 'Suikastçı hedefine ulaştı!';}hurtHero(0.7);S.eg.sick=S.day+10;return 'Hükümdar yaralandı, 10 gün iyileşecek.';}}
};
function hurtHero(p){const h=S.units.find(u=>u.t==='kahraman'&&!u.dead);if(h)h.hp=Math.max(1,Math.round(h.hp*(1-p)));}
function plotStart(){
 const E=S.eg=S.eg||{};const pool=Object.keys(PLOT).filter(k=>S.age>=PLOT[k].age&&(k!=='suikast'||S.kings.some(x=>x.war)||E.act2));
 const key=pick(pool),P=PLOT[key],s=bestSpy('plot'),env=envBonus();
 const bs=spBonus(s,'plot')+env,bh=env+4;
 const o1=Math.round(pOdds(P.dc,bs)*100),o2=Math.round(pOdds(P.dc,bh)*100);
 showModal(P.ic+' Saray Entrikası: '+P.n,P.x+'\n\nZorluk: '+P.dc+' · Çevre bonusu: '+(env>=0?'+':'')+env+(S.dyn.ruler.age>=18?' (olgun hükümdar)':'')+'\n\n🕵 Casus: '+(s?s.nm+' Sv.'+s.lv:'casus yok → muhafızlar, -3')+' → %'+o1+' şans\n🙈 Sakla: '+o2+'% şans ama dedikodu çıkar, başarısızlıkta kayıp ağırlaşır\n🤷 Yoksay: kesin zarar',[
  {t:'🕵 Çöz (%'+o1+')',fn:()=>plotRes(key,'spy')},
  {t:'🙈 Sakla (%'+o2+')',fn:()=>plotRes(key,'hide')},
  {t:'🤷 Yoksay',fn:()=>plotRes(key,'ign')}]);
}
function plotRes(key,how){
 const E=S.eg=S.eg||{},P=PLOT[key];let txt='',dr=null,f=1;
 if(how==='ign'){txt=P.bad(1.0,0);}
 else{
  let s=null,b=envBonus();
  if(how==='spy'){s=bestSpy('plot');b+=spBonus(s,'plot');if(s)s.busy=S.day+3;}
  else{b+=4;if(S.res.gold>=80)S.res.gold-=80;else b-=2;}
  dr=dice(s,P.dc,b);
  if(dr.m>=0){txt=P.ok();if(s)xpUp(s,1);if(how==='hide'){E.gos={until:S.day+12,val:5};txt+='\n🙈 Ama olay duyuldu: dedikodu halkı 12 gün huzursuz edecek.';}}
  else{f=how==='hide'?1.5:1;txt=P.bad(f,dr.m);if(how==='hide'){E.gos={until:S.day+12,val:8};}}
 }
 showModal(P.ic+' '+P.n+' — sonuç',(dr?dr.txt+'\n\n':'')+txt,[{t:'Tamam'}]);
}
(function(){
 const _hf=happyFactors;happyFactors=function(){const f=_hf();if(S.founded&&S.eg){if(S.eg.gos&&S.day<S.eg.gos.until)f.push(['Dedikodu',-S.eg.gos.val]);if(S.eg.sick&&S.day<S.eg.sick)f.push(['Hükümdar hasta',-6]);}return f;};
 const _dw=declareWar;declareWar=function(i,byP){if(!byP&&S.kings[i]&&(S.kings[i].chaos||0)>S.day)return;return _dw(i,byP);};
 const _lw=launchWave;launchWave=function(i){if((S.kings[i].chaos||0)>S.day)return 0;return _lw(i);};
})();
function intrigueDay(){
 if(!S.founded)return;const P=spS();
 P.q=P.q.filter(q=>{if(S.day>=q.at){if(P.list.length<spCap()){const tr=pick(['sessiz','zeki','zehirli',null,null]);P.list.push({id:P.nid++,nm:pick(SPN),lv:1,xp:0,tr,busy:0});log('🕵 Yeni casus hazır: '+P.list[P.list.length-1].nm+(tr?' ('+STR[tr].n+')':'')+'.');}return false;}return true;});
 P.mis.slice().forEach(mi=>{if(S.day>=mi.end){P.mis.splice(P.mis.indexOf(mi),1);misResolve(mi);}});
 const E=S.eg=S.eg||{};
 if(!E.nextPlot&&S.age>=1)E.nextPlot=S.day+ri(10,18);
 if(E.nextPlot&&S.day>=E.nextPlot){E.nextPlot=S.day+ri(14,26);if(!UI.modalOpen)plotStart();else E.nextPlot=S.day+1;}
}
// ---- arayüz ----
function spyBlock(){
 const P=spS();
 if(!countB('casusevi',true))return '<h4>🕵 Casusluk</h4><small>Casus Evi kur (Üretim & Şehir): casus yetiştir, komşulara gizli görevler gönder, saray entrikalarını çözdür. Casus evi yoksa entrikalarla muhafızlar uğraşır (-3).</small>';
 let h='<h4>🕵 Casus Evi</h4><small>Zar: d20 + casus Sv×2 + çevre ('+(envBonus()>=0?'+':'')+envBonus()+': olgun hükümdar, halk mutluluğu, bilge)</small>';
 h+='<div class="row">'+btn('➕ Casus yetiştir (120💰 40🍖)','spytrain',null,P.list.length+P.q.length>=spCap()||S.res.gold<120||S.res.food<40)+'<small>'+P.list.length+'/'+spCap()+(P.q.length?' · '+P.q.length+' eğitimde':'')+'</small></div>';
 P.list.forEach(s=>{h+='<div style="font-size:12px;margin:2px 0">🕵 <b>'+s.nm+'</b> Sv.'+s.lv+' <small>('+(s.xp||0)+'/'+s.lv*3+' xp'+(s.tr?' · '+STR[s.tr].n:'')+')</small> — '+(s.mission?'görevde: '+KINGS[s.mission.i].n.split(' ')[0]+' ('+Math.max(0,s.mission.end-S.day)+' gün)':(s.busy>S.day?'dinleniyor ('+(s.busy-S.day)+' gün)':'<span style="color:#9be59b">boşta</span>'))+'</div>';});
 KINGS.forEach((K,i)=>{const k=S.kings[i];if(k.dead||k.vassal)return;
  let r='<div class="row"><b style="color:'+K.col+'">'+K.n.split(' ')[0]+'</b> ';
  Object.keys(MIS).forEach(m=>{const M=MIS[m];if(S.age<M.age)return;const s=bestSpy(m),ok=s&&(!M.lv||s.lv>=M.lv)&&S.res.gold>=M.cost;
   const od=s?Math.round(pOdds(M.dc,misBonus(m,s,i))*100):0;
   r+=btn(M.ic+' '+M.n+' '+(s?'%'+od:'')+' ('+M.cost+'💰)','ms',i,!ok,m);});
  h+=r+'</div>';});
 h+='<small>Kral/Veliaht suikastı: Orta Çağ, Sv.2+ casus, 12-16 gün sürer. Temiz başarı +5 fark ister; yakalanırsan ya da başarısız olursan savaş ihtimali yüksek. Önce 🔎 Gözetle yaparsan sonraki görevler +2 şans.</small>';
 return h;
}
(function(){
 const _a=act;act=function(a,v,w,el){
  if(a==='spytrain'){spyTrain();return;}
  if(a==='ms'){misStart(w,+v);return;}
  return _a(a,v,w,el);};
 const _od=onDay;onDay=function(){_od.apply(null,arguments);try{intrigueDay();}catch(e){console.error(e);}};
})();
if(typeof ACH!=='undefined')ACH.push({id:'spy3',n:'Casus Ustası',d:'Bir casusu 3. seviyeye çıkar',ok:()=>S.spy&&S.spy.list.some(s=>s.lv>=3)},{id:'assn',n:'Gölgelerin Efendisi',d:'Başarılı bir suikast yap',ok:()=>(S.stats.assn||0)>=1});
