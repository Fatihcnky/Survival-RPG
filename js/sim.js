'use strict';
// ===== SİMÜLASYON: yeni oyun, ekonomi, işler, ilerleme, kayıt =====
function newGame(seed){
 seed=seed||((Math.random()*1e9)|0);
 S={seed,t:0,speed:1,founded:false,age:0,rank:0,
  res:{food:300,wood:400,stone:200,iron:0,gold:60,silah:0,deri:0,alet:0,zirh:0,giyim:0,keten:0,ekmek:0},
  jobs:{build:1,wood:3,forage:2},story:0,nid:1,units:[],blds:[],camps:[],
  techs:{},research:null,ageProg:null,stats:{camps:0,kills:0,raids:0,lost:0},
  kings:KINGS.map(k=>({rel:{bilge:10,savasci:-10,acgozlu:0,dost:25}[k.pers],str:20,pact:null,war:false,cool:0,lastComplaint:-99,lastWar:-99})),
  mkt:{food:1,wood:1,stone:1,iron:1},raidAt:20,nextEvent:5,epi:null,drought:0,starve:0,cold:0,
  start:{x:112,y:124},cam:{x:112,y:124,z:1},day:0,rally:null,done:false,won:false};
 UM=new Map();BM=new Map();
 newDynasty();
 genMap();
 // krallıklar (dekor)
 makeCamps(18);spawnWildlife();initKingdoms();
 // başlangıç kafilesi
 const st=S.start;
 for(let i=0;i<6;i++)mkUnit('koylu','p',st.x+0.5+(i%3)*0.8-0.8,st.y+0.5+(i/3|0)*0.8);
 for(let i=0;i<3;i++)mkUnit('mizrakli','p',st.x+0.5+i*0.8-0.8,st.y+2);
 updFog();revealC(S.start.x,S.start.y,34);
 return S;
}
function spawnWild(t,minD){
 for(let k=0;k<60;k++){
  const x=ri(3,MW-4),y=ri(3,MH-4),i=y*MW+x;
  if(!SEEN[i]||T[i]===1||(T[i]>=3&&T[i]<=5)||OCC[i])continue;
  if(Math.hypot(x-S.start.x,y-S.start.y)<minD)continue;
  if(S.founded&&S.blds.some(b=>b.team==='p'&&Math.hypot(b.x-x,b.y-y)<minD))continue;
  mkUnit(t,'w',x+0.5,y+0.5,{st:'idle'});return true;
 }
 return false;
}
function spawnWildlife(){
 for(let i=0;i<120;i++)spawnWild('geyik',26);
 for(let i=0;i<50;i++)spawnWild('domuz',30);
 for(let i=0;i<24;i++)spawnWild('kurt',45);
}
function wildDay(){
 const c={geyik:0,domuz:0,kurt:0};
 for(const u of S.units)if(u.team==='w'&&!u.dead)c[u.t]++;
 if(c.geyik<100&&Math.random()<0.5)spawnWild('geyik',25);
 if(c.domuz<42&&Math.random()<0.3)spawnWild('domuz',28);
 if(c.kurt<20&&Math.random()<0.12)spawnWild('kurt',40);
}
function walkRect(x,y,w,h){for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++){const X=x+dx,Y=y+dy;if(!inMap(X,Y))return false;const i=Y*MW+X;if(T[i]!==0||OCC[i]!==0)return false;}return true;}
function makeCamps(n){
 let tries=0;
 while(S.camps.filter(c=>c.alive).length<n&&tries++<400){
  const x=ri(5,MW-8),y=ri(5,MH-8);
  if(!SEEN[y*MW+x])continue;
  if(Math.hypot(x-S.start.x,y-S.start.y)<34)continue;
  if(S.founded&&S.blds.some(b=>b.team==='p'&&Math.hypot(b.x-x,b.y-y)<30))continue;
  if(KINGS.some(k=>Math.hypot(k.x-x,k.y-y)<18))continue;
  if(S.camps.some(c=>c.alive&&Math.hypot(c.x-x,c.y-y)<20))continue;
  for(let dy=-3;dy<=4;dy++)for(let dx=-3;dx<=4;dx++){const X=x+dx,Y=y+dy;if(inMap(X,Y)&&OCC[Y*MW+X]===0&&T[Y*MW+X]!==1&&T[Y*MW+X]!==0){T[Y*MW+X]=0;RA[Y*MW+X]=0;}}
  if(!walkRect(x,y,2,2))continue;
  const tent=mkB('tent','b',x,y,true);
  const c={id:S.camps.length+1,x,y,tent:tent.id,alive:true};
  S.camps.push(c);
  const far=Math.hypot(x-S.start.x,y-S.start.y)>60;
  const n2=3+(S.day>30?1:0)+(far?1:0);
  for(let k=0;k<n2;k++){
   const t=k===0&&far?'haydutreis':k===n2-1?'haydutokcu':'haydut';
   mkUnit(t,'b',x+0.5+(k%3)-1+0.3,y+2.5+(k/3|0),{guard:1,hx:x+1,hy:y+3,st:'idle'});
  }
 }
}

// ---------- görev dağılımı ----------
function jobCap(id){const bt=JOBBT[id];return bt?(SLOTS[bt]||3)*countB(bt,true):1e9;}
function balanceJobs(){
 const vs=S.units.filter(u=>u.team==='p'&&u.t==='koylu'&&!u.dead);
 const cnt={};vs.forEach(u=>{if(u.job)cnt[u.job]=(cnt[u.job]||0)+1;});
 const sites=S.blds.some(b=>b.team==='p'&&!b.done);
 S.haulN=vs.filter(u=>u.job==='haul').length;
 const want=id=>{let w=Math.min(S.jobs[id]||0,jobCap(id));if(id==='build'&&sites&&w<1)w=1;if(id==='haul'&&!sites)w=0;return w;};
 JOBS.forEach(j=>{
  let extra=(cnt[j.id]||0)-want(j.id);
  if(extra>0){
   const mine=vs.filter(u=>u.job===j.id).sort((a,b)=>(a.carry>0)-(b.carry>0));
   for(let k=0;k<extra&&k<mine.length;k++)releaseV(mine[k]);
   cnt[j.id]=(cnt[j.id]||0)-extra;
  }
 });
 const idle=vs.filter(u=>!u.job);
 for(const id of JOB_ORDER){
  while((cnt[id]||0)<want(id)&&idle.length){
   const u=idle.pop();u.job=id;u.st='idle';u.path=null;u.ti=-1;u.wb=0;u.carry=0;u.wait=Math.random()*0.5;
   cnt[id]=(cnt[id]||0)+1;
  }
 }
 if(want('build')>(cnt.build||0)&&!idle.length){}
}
function releaseV(u){u.job=null;u.st='idle';u.path=null;u.carry=0;u.wb=0;u.sb=0;u.ti=-1;}
function idleCount(){return S.units.filter(u=>u.team==='p'&&u.t==='koylu'&&!u.dead&&!u.job).length;}
function jobCount(id){return S.units.filter(u=>u.team==='p'&&u.t==='koylu'&&!u.dead&&u.job===id).length;}
function villagerCount(){return S.units.filter(u=>u.team==='p'&&u.t==='koylu'&&!u.dead).length;}
function autoJobs(){
 const n=villagerCount();
 const j={build:Math.max(1,Math.round(n*0.15)),haul:n>=7?2:1,farm:0,herd:0,forage:Math.round(n*0.12),wood:0,lum:0,mine:0,smith:0,fire:0,doc:0,trade:0,hunt:0};
 j.lum=Math.min(jobCap('lum'),Math.round(n*0.25));
 j.wood=Math.max(0,Math.round(n*0.25)-j.lum);
 j.mine=Math.min(jobCap('mine'),Math.round(n*0.12));
 j.farm=Math.min(jobCap('farm'),Math.max(0,Math.round(n*0.3)));
 j.herd=Math.min(jobCap('herd'),Math.round(n*0.1));
 j.smith=Math.min(jobCap('smith'),1);
 j.fire=Math.min(jobCap('fire'),1);
 j.doc=Math.min(jobCap('doc'),1);
 j.trade=Math.min(jobCap('trade'),1);
 S.jobs=j;
}

// ---------- ilerleme ----------
function pactCount(){let n=0;S.kings.forEach(k=>{if(k.pact)n++;});return n;}
function startResearch(id){
 const t=TECH[id];
 if(!t||S.techs[id]||S.research||t.age>S.age||!afford(t.cost)||(t.req&&!t.req.every(r=>S.techs[r])))return false;
 pay(t.cost);S.research={id,left:Math.round(t.time*1.5)};return true;
}
function ageInfo(){
 const n=S.age+1;if(n>=AGES.length)return null;
 const a=AGEUP[n],h=countB('ev',true),p=popNow();
 const checks=[
  {t:'Hane: '+h+'/'+a.houses,ok:h>=a.houses},
  {t:'Nüfus: '+p+'/'+a.pop,ok:p>=a.pop}
 ];
 if(a.rank)checks.push({t:'Ünvan: '+RANKS[a.rank],ok:S.rank>=a.rank});
 return{n,a,checks,ok:checks.every(c=>c.ok)&&afford(a.cost)&&!S.ageProg};
}
function startAgeUp(){const i=ageInfo();if(!i||!i.ok)return false;pay(i.a.cost);S.ageProg={left:i.a.time,to:i.n};return true;}
function rankInfo(){
 const n=S.rank+1;if(n>=RANKS.length)return null;
 const r=RANKREQ[n],h=countB('ev',true),p=popNow();
 const checks=[
  {t:'Hane: '+h+'/'+r.houses,ok:h>=r.houses},
  {t:'Nüfus: '+p+'/'+r.pop,ok:p>=r.pop},
  {t:'Çağ: '+AGES[r.age],ok:S.age>=r.age}
 ];
 r.b.forEach(t=>checks.push({t:BT[t].n,ok:countB(t,true)>=1}));
 return{n,r,checks,ok:checks.every(c=>c.ok)};
}
function doRankUp(){
 const i=rankInfo();if(!i||!i.ok)return false;
 S.rank=i.n;
 for(const k in i.r.reward)addRes(k,i.r.reward[k]);
 showModal('👑 '+RANKS[S.rank],'Artık bir '+TITLES[S.rank]+'sın. Ödül: '+costText(i.r.reward),[{t:'Tamam'}]);
 return true;
}
function costText(c){return Object.keys(c).map(k=>RI[k]+c[k]).join(' ');}

// ---------- ekonomi ----------
function econ(dt){
 if(!S.founded)return;
 const pop=popNow();
 const need=pop*0.025*dt,eb=Math.min(S.res.ekmek||0,need*0.5);
 if(eb>0){S.res.ekmek-=eb;fvMark('ekmek');}
 S.res.food-=Math.max(0,need-eb*1.1);
 if(S.res.food<=0){
  S.res.food=0;S.starve+=dt;
  if(S.starve>=15){
   S.starve=0;
   const n=Math.max(1,Math.floor(pop/12));
   for(let k=0;k<n;k++){const v=S.units.find(u=>u.team==='p'&&!u.dead&&u.t==='koylu')||S.units.find(u=>u.team==='p'&&!u.dead);if(v)killU(v);}
   log('☠ Kıtlık! '+n+' kişi açlıktan öldü. Yiyecek bul!');
  }
 }else S.starve=Math.max(0,S.starve-dt);
 if(seas()===3){
  S.res.wood-=pop*0.016*fxm('heat')*dif().cold*(S.hardWinter?1.5:1)*dt;
  if(S.res.wood<=0){
   S.res.wood=0;S.cold+=dt;
   if(S.cold>=20){
    S.cold=0;const n=Math.max(1,Math.floor(pop/20));
    for(let k=0;k<n;k++){const v=S.units.find(u=>u.team==='p'&&!u.dead&&u.t==='koylu');if(v)killU(v);}
    log('🥶 Odun yok! '+n+' kişi donarak öldü.');
   }
  }else S.cold=Math.max(0,S.cold-dt);
 }
 if(S.research){S.research.left-=dt*fxm('research');if(S.research.left<=0){const t=TECH[S.research.id];S.techs[S.research.id]=1;S.research=null;log('🔬 Araştırma tamam: '+t.n);}}
 if(S.ageProg){S.ageProg.left-=dt;if(S.ageProg.left<=0){S.age=S.ageProg.to;S.ageProg=null;showModal('🌟 '+AGES[S.age],'Yeni çağa ulaştın! Yeni binalar, birlikler ve teknolojiler açıldı.',[{t:'Harika'}]);}}
}
let accJ=0,accS=0,accF=0;
function sim(dt){
 S.t+=dt;
 const d=curDay();
 if(d!==S.day){S.day=d;if(S.founded)onDay();else kingdomsDay();}
 pathBudget=10;
 for(const u of S.units)updUnit(u,dt);
 if(S.units.some(u=>u.dead))S.units=S.units.filter(u=>!u.dead);
 for(const b of S.blds.slice())updBuilding(b,dt);
 econ(dt);
 for(let i=FX.length-1;i>=0;i--){FX[i].t-=dt;if(FX[i].t<=0)FX.splice(i,1);}
 accF+=dt;if(accF>=0.4){accF=0;updFog();}
 accJ+=dt;
 if(accJ>=1){accJ=0;if(typeof flowTick==='function')flowTick();if(S.founded&&((S.t|0)%3===0))freeTrapped();if(S.founded){balanceJobs();checkStory();checkEnd();}}
}
function checkStory(){
 if(S.story>=STORY.length)return;
 const s=STORY[S.story];
 if(s.ok()){
  if(s.r)for(const k in s.r)addRes(k,s.r[k]);
  S.story++;
  const last=S.story>=STORY.length;
  showModal(last?'🏆 Zafer!':'📜 Görev tamamlandı',s.m+(s.r?'\nÖdül: '+costText(s.r):'')+(last?'\nOyunu istediğin kadar sürdürebilirsin.':'\n\n'+(STORY[S.story].ch?'📖 '+STORY[S.story].ch+'\n':'')+'Sıradaki: '+STORY[S.story].t),[{t:'Devam'}]);
  if(last)S.won=true;
 }
}
function checkEnd(){
 if(S.done)return;
 if(!S.units.some(u=>u.team==='p')&&!S.blds.some(b=>b.team==='p')){
  S.done=true;showModal('☠ Yenilgi','Köyün yok oldu. Yeniden başlayabilirsin.',[{t:'Yeni oyun',fn:()=>{try{localStorage.removeItem('ky_save');}catch(e){}newGameSetup(uiReset);}}]);
 }
}

// ---------- yerleştirme ----------
function canPlace(t,x,y){
 const d=BT[t];
 if(!inMap(x,y)||!inMap(x+d.w-1,y+d.h-1))return false;
 for(let dy=0;dy<d.h;dy++)for(let dx=0;dx<d.w;dx++){
  const i=(y+dy)*MW+x+dx;
  if(T[i]!==0||FOG[i]===0)return false;
  if(OCC[i]!==0&&!(t==='kapi'&&BM.get(OCC[i])&&BM.get(OCC[i]).t==='duvar'&&BM.get(OCC[i]).team==='p'))return false;
 }
 if(d.shore){let wet=false;for(let yy=y-1;yy<=y+d.h&&!wet;yy++)for(let xx=x-1;xx<=x+d.w;xx++)if(inMap(xx,yy)&&T[yy*MW+xx]===1){wet=true;break;}if(!wet)return false;}
 // köylüleri/yolu kapalı bir boşluğa hapsetmesin
 if(S.founded&&!d.decor&&t!=='duvar'&&t!=='kapi'){
  const inF=(px,py)=>px>=x&&px<x+d.w&&py>=y&&py<y+d.h;
  for(let yy=y-1;yy<=y+d.h;yy++)for(let xx=x-1;xx<=x+d.w;xx++){
   if(inF(xx,yy)||!inMap(xx,yy)||!walk(xx,yy))continue;
   if(trappedAt(xx,yy,inF)&&!trappedAt(xx,yy))return false;
   if(trappedAt(xx,yy,inF)&&S.units.some(u=>!u.dead&&u.team==='p'&&Math.floor(u.x)===xx&&Math.floor(u.y)===yy))return false;
  }
 }
 return true;
}
// sıkışan birimleri köyün açık alanına taşı
function freeTrapped(){
 const tc=mainTC();if(!tc)return;
 for(const u of S.units){
  if(u.dead||u.team!=='p'||u.st==='raid')continue;
  if(!trappedAt(u.x,u.y)&&walk(Math.floor(u.x),Math.floor(u.y)))continue;
  if(Math.hypot(u.x-tc.x,u.y-tc.y)>40)continue;
  const p=spawnPos(tc);u.x=p.x;u.y=p.y;u.path=null;u.st='idle';u.wait=0.3;
 }
}
function placeReason(t){
 const d=BT[t];
 if(d.age>S.age)return'Çağ: '+AGES[d.age];
 if(d.rank&&S.rank<d.rank)return'Ünvan: '+RANKS[d.rank];
 if(t==='tc'&&countB('tc',false)>0)return'Zaten var';
 return'';
}
function placeBuilding(t,x,y){
 const d=BT[t];
 if(placeReason(t)||!canPlace(t,x,y))return false;
 if(!afford(d.cost)){log('⛔ Kaynak yetersiz.');return false;}
 pay(d.cost);
 if(t==='kapi'){const w=BM.get(OCC[y*MW+x]);if(w&&w.t==='duvar'){for(const k in BT.duvar.cost)addRes(k,BT.duvar.cost[k]);const q=S.blds.indexOf(w);if(q>=0)S.blds.splice(q,1);BM.delete(w.id);fillOcc(w,0);}}
 const b=mkB(t,'p',x,y,t==='tc',t==='ev'?{fam:pick(MNAMES.concat(FNAMES))}:{});
 if(!b.done){b.need=(d.cost.wood||0)+(d.cost.stone||0)+(d.cost.iron||0);b.mat=0;}
 if(t==='maden')b.ore='stone';
 FX.push({k:'poof',x:x+d.w/2,y:y+d.h/2,t:0.5,T:0.5});
 return b;
}
function founderOk(x,y){
 if(!canPlace('tc',x,y))return'Buraya kurulamaz (arazi uygun değil).';
 for(const c of S.camps)if(c.alive&&Math.hypot(c.x-x,c.y-y)<13)return'Haydut kampına çok yakın!';
 return'';
}
function foundVillage(x,y){
 const r=founderOk(x,y);if(r){log('⛔ '+r);return false;}
 const d=BT.tc;
 if(!afford(d.cost)){log('⛔ Kaynak yetersiz.');return false;}
 pay(d.cost);
 const tc=mkB('tc','p',x,y,true);
 S.founded=true;
 const cx=x+1.5,cy=y+4.5;
 let k=0;
 for(const u of S.units){
  if(u.team!=='p')continue;
  const p=spawnPos(tc);
  u.x=p.x+(k%4)*0.4;u.y=p.y+(k/4|0)*0.4;u.path=null;u.st='idle';k++;
 }
 S.rally={x:cx,y:cy};
 S.cam.x=cx;S.cam.y=cy;
 log('🏛 Köyünü kurdun! Önce ev ve depo inşa et, sonra halkı görevlendir.');
 balanceJobs();
 return true;
}
function cancelBuild(b){
 if(!b||b.team!=='p'||b.done)return;
 const f=b.prog<0.02?1:0.5,d=BT[b.t];
 for(const k in d.cost)addRes(k,Math.floor(d.cost[k]*f));
 const q=S.blds.indexOf(b);if(q>=0)S.blds.splice(q,1);
 BM.delete(b.id);fillOcc(b,0);
 for(const u of S.units)if(u.sb===b.id&&u.team==='p'){u.st='idle';u.path=null;u.sb=0;}
 FX.push({k:'poof',x:b.x+b.w/2,y:b.y+b.h/2,t:0.5,T:0.5});
 log('✖ '+d.n+' inşaatı iptal edildi'+(f<1?' (iade %50)':' (tam iade)')+'.');
}
function demolish(b){
 if(b.team!=='p'||b.t==='tc')return;
 const d=BT[b.t];
 for(const k in d.cost)addRes(k,Math.floor(d.cost[k]*0.5));
 destroyB(b);
}

// ---------- komutlar ----------
function cmdMove(units,x,y,attack){
 let k=0;
 for(const u of units){
  const ox=(k%4)-1.5,oy=((k/4)|0)-1;k++;
  let gx=Math.floor(x+ox*0.9),gy=Math.floor(y+oy*0.9);
  if(!walk(gx,gy)){gx=Math.floor(x);gy=Math.floor(y);}
  u.cmdRes=0;
  if(S.founded&&u.t==='koylu'&&u.job&&JOBRES[u.job]&&units.length<=4){ // ağaç/maden üstüne bırakılırsa oradan topla, sonra işine dön
   const rt=JOBRES[u.job][0],cx=Math.floor(x),cy=Math.floor(y);let found=-1;
   for(let dy=-1;dy<=1&&found<0;dy++)for(let dx=-1;dx<=1;dx++){const i=(cy+dy)*MW+cx+dx;if(inMap(cx+dx,cy+dy)&&T[i]===rt&&RA[i]>0&&UNRE[i]<=S.t){found=i;break;}}
   if(found>=0){const fx=found%MW,fy=(found/MW)|0;let ok=false;
    for(const[ax,ay]of[[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]])if(walk(fx+ax,fy+ay)){gx=fx+ax;gy=fy+ay;ok=true;break;}
    if(ok)u.cmdRes=found;}
  }
  u.st=(S.founded&&u.t==='koylu')?'cmd':(attack?'amove':'move');u.gx=gx;u.gy=gy;u.path=null;u.tg=0;u.forced=0;u.wait=0;
 }
}
function cmdAttack(units,e){for(const u of units){u.tg=e.id;u.forced=1;u.st='amove';u.gx=Math.floor(e.x);u.gy=Math.floor(e.y);u.path=null;}}
function soldiers(){return S.units.filter(u=>u.team==='p'&&!u.dead&&UT[u.t].mil);}

// ---------- kayıt ----------
function saveGame(key){
 try{
  const o=JSON.stringify(S,(k,v)=>k==='path'?undefined:v);
  localStorage.setItem(key||'ky_save',JSON.stringify({v:2,w:MW,h:MH,s:o,T:rleEnc(T),RA:rleEnc(RA,true),R:rleEnc(ROAD),F:rleEnc(FOG)}));
  return true;
 }catch(e){return false;}
}
function rleEnc(a,round){const o=[];let p=round?Math.round(a[0]):a[0],n=1;for(let i=1;i<a.length;i++){const v=round?Math.round(a[i]):a[i];if(v===p)n++;else{o.push(p+'x'+n);p=v;n=1;}}o.push(p+'x'+n);return o.join(',');}
function rleDec(s,C){let len=0;const parts=s.split(',');for(const t of parts)len+=+t.slice(t.indexOf('x')+1);const a=new C(len);let i=0;for(const t of parts){const k=t.indexOf('x'),v=+t.slice(0,k),n=+t.slice(k+1);if(v)a.fill(v,i,i+n);i+=n;}return a;}
function loadGame(key){
 try{
  const raw=localStorage.getItem(key||'ky_save');if(!raw)return false;
  const d=JSON.parse(raw);
  const S2=JSON.parse(d.s);
  if(!S2.dyn)return false;
  const lw=d.w||224,lh=d.h||224;
  if(typeof setWorld==='function'){setWorld(lw,lh,false);worldRestoreKings(S2);}
  if(d.v===2){
   if(lw*lh!==NN)return false;
   S=S2;applyDiff();RES.forEach(k=>{if(S.res[k]==null)S.res[k]=0;});
   T=rleDec(d.T,Uint8Array);RA=rleDec(d.RA,Float32Array);ROAD=rleDec(d.R,Uint8Array);FOG=rleDec(d.F,Uint8Array);
  }else{
   if(d.T.length!==NN)return false;
   S=S2;applyDiff();RES.forEach(k=>{if(S.res[k]==null)S.res[k]=0;});
   T=Uint8Array.from(d.T.split('').map(Number));
   RA=Float32Array.from(d.RA.split(',').map(Number));
   ROAD=Uint8Array.from(d.R.split('').map(Number));
   FOG=d.F?Uint8Array.from(d.F.split('').map(Number)):new Uint8Array(NN).fill(1);
  }
  OCC=new Int32Array(NN);GATE=new Uint8Array(NN);
  UM=new Map();BM=new Map();
  for(const b of S.blds){BM.set(b.id,b);fillOcc(b,b.id);}
  for(const u of S.units){u.path=null;u.st=u.team==='p'&&u.t==='koylu'?'idle':(u.st==='raid'?'raid':'idle');u.wait=Math.random()*0.5;UM.set(u.id,u);}
  // erişilebilirlik haritası
  SEEN=new Uint8Array(NN);for(let i=0;i<NN;i++)SEEN[i]=T[i]!==1?1:0;
  return true;
 }catch(e){return false;}
}
