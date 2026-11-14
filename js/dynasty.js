'use strict';
// ===== HANEDAN, MUTLULUK, VERGİ =====
const TRAITS={
 savasci:{n:'Savaşçı',d:'Askerler %10 daha güçlü.'},
 bilge:{n:'Bilge',d:'Araştırmalar %20 daha hızlı.'},
 tuccar:{n:'Tüccar',d:'Vergi ve ticaret geliri %20 fazla.'},
 adil:{n:'Adil',d:'Halk mutluluğu +6.'},
 cesur:{n:'Cesur',d:'Kule ve kale hasarı %10 fazla.'},
 hirsli:{n:'Hırslı',d:'Diplomasi etkisi %20 fazla.'}
};
const TRAITFX={savasci:{atk:1.1},bilge:{research:1.2},tuccar:{tax:1.2,trade:1.2},cesur:{tower:1.1},hirsli:{dip:1.2}};
const MNAMES=['Aldwin','Godric','Leofric','Wulfstan','Berengar','Osric','Theobald','Hakon','Ivar','Baldric','Cenric','Alaric'];
const FNAMES=['Aelith','Eadgyth','Matilda','Ingrid','Sibyl','Rowena','Isolde','Gunhild','Elinor','Maud','Edith','Brenna'];
const HOUSES=['Ravenmoor','Oakheart','Stormvale','Blackwood','Ironhall','Silverfen'];
const TAXN=['Düşük','Normal','Yüksek'];
const TAXG=[0.5,1,1.8],TAXH=[8,0,-12];
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function nm(f){return pick(f?FNAMES:MNAMES);}
function traitKey(){return pick(Object.keys(TRAITS));}
function rulerTitle(){const r=S.dyn.ruler;return r.female?'Leydi':'Lord';}
function newDynasty(){
 const fem=Math.random()<0.5;
 S.dyn={house:pick(HOUSES),ruler:{name:nm(fem),age:26+ri(0,8),trait:traitKey(),female:fem},spouse:null,heirs:[],crisis:0,festCool:0,births:0};
 S.happy=55;S.taxRate=1;S.fest=0;S.unrest=0;S.recentLoss=0;S.hardWinter=false;
}
function fxTrait(k){const t=S.dyn&&S.dyn.ruler&&TRAITFX[S.dyn.ruler.trait];return t&&t[k]?t[k]:1;}

// ---- mutluluk ----
function happyFactors(){
 const pop=popNow(),f=[];
 f.push(['Barınma',pop<=popCap()?5:-10]);
 const fd=S.res.food/Math.max(1,pop);
 f.push(['Yiyecek',fd>=8?10:fd>=3?4:fd>0.5?-4:-25]);
 if(seas()===3){f.push(['Isınma',S.res.wood>pop*2?3:-15]);f.push(['Kışlık giyim',S.res.deri>=pop*0.3?3:-6]);}
 const ch=Math.min(2,countB('sapel',true)),tv=Math.min(2,countB('han',true));
 if(ch)f.push(['Şapel',8*ch]);
 if(tv)f.push(['Han',6*tv]);
 f.push(['Vergi ('+TAXN[S.taxRate]+')',TAXH[S.taxRate]]);
 const tw=Math.min(6,countB('kule',true)*2+countB('tkule',true)*3);
 if(tw)f.push(['Güvenlik',tw]);
 if(S.recentLoss>0.5)f.push(['Kayıplar',-Math.min(20,Math.round(S.recentLoss*3))]);
 if(S.dyn.ruler.trait==='adil')f.push(['Adil hükümdar',6]);
 if(S.fest>0)f.push(['Şenlik',15]);
 if(S.dyn.crisis>0)f.push(['Hanedan krizi',-12]);
 return f;
}
function happyTarget(){let h=50;happyFactors().forEach(x=>h+=x[1]);return clamp(h,0,100);}
function happyMul(){return 0.8+clamp(S.happy,0,100)/100*0.4;}
function happyDay(){
 S.happy+=(happyTarget()-S.happy)*0.25;
 S.recentLoss*=0.7;
 if(seas()===3)S.res.deri=Math.max(0,S.res.deri-popNow()*0.08);
 if(S.fest>0)S.fest--;
 if(S.dyn.festCool>0)S.dyn.festCool--;
 if(S.dyn.crisis>0&&Math.random()<0.2)S.dyn.crisis--;
 const pop=popNow(),tc=mainTC();
 if(S.happy>=65&&pop<popCap()&&S.res.food>pop*4&&Math.random()<0.35&&tc){
  const n=ri(1,2);
  for(let i=0;i<n&&popNow()<popCap();i++){const p=spawnPos(tc);mkUnit('koylu','p',p.x,p.y);}
  log('🧳 '+n+' göçmen köyünüzün huzurunu duyup yerleşti.');
 }
 if(S.happy<20){
  S.unrest++;
  if(S.unrest>=3){
   const v=S.units.find(u=>u.team==='p'&&u.t==='koylu'&&!u.dead);
   if(v){killU(v);S.recentLoss=Math.max(0,S.recentLoss-1);log('😠 Mutsuz bir aile köyü terk etti.');}
  }
  if(S.unrest>=6&&Math.random()<0.3){
   const g=Math.min(S.res.gold,ri(40,120));S.res.gold-=g;
   const b=pickRandomBuilding();if(b)startFire(b);
   log('🔥 İsyan! Öfkeli kalabalık hazineyi yağmaladı (-'+g+' altın) ve ev yaktı.');
  }
 }else S.unrest=Math.max(0,S.unrest-1);
}
function setTax(){S.taxRate=(S.taxRate+1)%3;}
function holdFestival(){
 if(S.dyn.festCool>0||S.res.food<80||S.res.gold<30)return false;
 S.res.food-=80;S.res.gold-=30;S.fest=6;S.dyn.festCool=20;S.happy=Math.min(100,S.happy+10);
 log('🎉 Şenlik düzenlendi! Halk eğleniyor.');return true;
}

// ---- hanedan ----
function marry(i){
 const D=S.dyn,k=S.kings[i],K=KINGS[i];
 const fem=!D.ruler.female;
 D.spouse={name:K.fam[fem?0:1],age:ri(20,30),trait:traitKey(),female:fem,from:i};
 k.rel=clamp(k.rel+30,-100,100);
 if(!k.pact)k.pact='ticaret';else if(k.pact==='ticaret'&&k.rel>=45)k.pact='ittifak';
 S.happy=Math.min(100,S.happy+5);
 showModal('💍 Hanedan evliliği',rulerTitle()+' '+D.ruler.name+' ile '+D.spouse.name+' ('+K.n+') evlendi! '+K.n+' ile bağlar güçlendi'+(k.pact==='ittifak'?' ve ittifak kuruldu.':'.'),[{t:'Şerefe!'}]);
}
function proposeMarriage(i){
 const D=S.dyn,k=S.kings[i];
 if(D.spouse||!elcilikOk()||k.war||k.rel<30||S.res.gold<150)return false;
 S.res.gold-=150;marry(i);return true;
}
function succession(why){
 const D=S.dyn,old=D.ruler;
 const adults=D.heirs.filter(h=>h.age>=16).sort((a,b)=>b.age-a.age);
 D.spouse=null;
 if(adults.length){
  const n=adults[0];D.heirs=D.heirs.filter(h=>h!==n);D.ruler=n;S.happy=Math.max(0,S.happy-5);
  showModal('⚰ Hükümdar öldü',(old.female?'Leydi ':'Lord ')+old.name+' '+why+'. Tahta '+n.name+' ('+n.age+', '+TRAITS[n.trait].n+') geçti. '+TRAITS[n.trait].d,[{t:'Yaşasın yeni hükümdar'}]);
 }else if(D.heirs.length){
  const n=D.heirs.sort((a,b)=>b.age-a.age)[0];D.heirs=D.heirs.filter(h=>h!==n);D.ruler=n;D.crisis=3;
  showModal('⚰ Naiplik dönemi',(old.female?'Leydi ':'Lord ')+old.name+' '+why+'. Varis '+n.name+' henüz çok genç ('+n.age+'). Naipler yönetiyor, halk huzursuz.',[{t:'Anladım'}]);
 }else{
  D.ruler={name:nm(Math.random()<0.5),age:ri(28,40),trait:traitKey(),female:Math.random()<0.5};D.crisis=4;
  S.res.gold=Math.floor(S.res.gold*0.7);S.res.food=Math.floor(S.res.food*0.8);S.happy=Math.max(0,S.happy-20);
  KINGS.forEach((k,i)=>adjRel(i,-8));
  showModal('⚰ Veliahtsız ölüm!',(old.female?'Leydi ':'Lord ')+old.name+' '+why+' ve varis bırakmadı. Uzak bir akraba, '+D.ruler.name+' ('+TRAITS[D.ruler.trait].n+') tahta çıktı. Hazine ve ambarlar yağmalandı, komşular güvensiz.',[{t:'Yazık...'}]);
 }
}
function dynYear(){
 const D=S.dyn,r=D.ruler;
 r.age++;if(D.spouse)D.spouse.age++;D.heirs.forEach(h=>h.age++);
 if(D.crisis>0&&D.heirs.length===0&&r.age>=16)D.crisis=Math.max(0,D.crisis-1);
 // varis ergenliğe girdi
 D.heirs.forEach(h=>{if(h.age===16)log('🎓 Varis '+h.name+' 16 yaşına girdi, artık tahta geçebilir.');});
 // ölüm
 const p=r.age>=50?(r.age-49)*0.07:0.006;
 if(Math.random()<p){succession(r.age>=50?'yaşlılıktan hayatını kaybetti':'ani bir hastalıktan öldü');return;}
 // doğum
 if(D.spouse&&D.spouse.age<44&&D.heirs.length<4&&Math.random()<0.55){
  const f=Math.random()<0.5,h={name:nm(f),age:0,trait:traitKey(),female:f};
  D.heirs.push(h);D.births++;
  showModal('👶 Hanedana yeni üye','Hane '+D.house+'\'de bir '+(f?'kız':'erkek')+' çocuk doğdu: '+h.name+' ('+TRAITS[h.trait].n+'). Halk şenleniyor.',[{t:'Sevinç!',fn:()=>{S.happy=Math.min(100,S.happy+6);}}]);
 }
 // evlilik teklifi
 if(!D.spouse&&r.age>=18&&Math.random()<0.6){
  const c=S.kings.map((k,i)=>({k,i})).filter(o=>o.k.rel>=15&&!o.k.war);
  if(c.length){
   const o=pick(c),K=KINGS[o.i];
   showModal('💍 Evlilik teklifi',K.who+' ('+K.n+'), hanedanın ile akrabalık kurmak için '+K.fam[r.female?1:0]+' ile evlenmeni öneriyor. Anlaşma bağlarınızı güçlendirir.',[
    {t:'Kabul et',fn:()=>marry(o.i)},
    {t:'Nazikçe reddet',fn:()=>adjRel(o.i,-10)}
   ]);
  }
 }
}
