'use strict';
// ===== BİRİMLER: köylü işleri, savaş, bina güncellemesi =====
const JOBRES={wood:[2,'wood'],stone:[3,'stone'],iron:[4,'iron'],gold:[5,'gold'],forage:[6,'food']};
const JOBBT={};JOBS.forEach(j=>{if(j.bt)JOBBT[j.id]=j.bt;});
const FARMS=[1.0,1.4,1.2,0.25],HERDS=[0.8,1,1,0.6],FORAGES=[1,1.2,1.6,0.15];

function storeCap(){let up=0;for(const b of S.blds)if(b.team==='p'&&b.t==='depo'&&b.done&&b.lvl)up+=300;return 400+400*countB('depo',true)+up+fxa('store');}
function addRes(k,n){const c=storeCap();S.res[k]=Math.min(c,(S.res[k]||0)+n);}
function afford(c){for(const k in c)if((S.res[k]||0)<c[k])return false;return true;}
function pay(c){for(const k in c)S.res[k]-=c[k];}
function popNow(){let n=0;for(const u of S.units)if(!u.dead&&u.team==='p')n++;return n;}
function popQueued(){let n=0;for(const b of S.blds)if(b.team==='p')n+=b.q.length;return n;}
function popCap(){let n=0;for(const b of S.blds)if(b.team==='p'&&b.done)n+=(BT[b.t].pop||0)+(b.t==='ev'&&b.lvl?4:0);return n;}

// ---------- köylü ----------
function gatherRate(j){
 const tool=S.res.alet>=0.2?1.25:1;
 if(j==='forage')return 0.9*fxm('forage')*FORAGES[seas()]*happyMul();
 return 0.9*fxm('gather')*tool*(seas()===3?0.8:1)*happyMul();
}
function findRes(j,x,y){
 const ty=JOBRES[j][0];let best=-1,bd=1e9;
 for(let i=0;i<NN;i++){
  if(T[i]!==ty||RA[i]<=0||UNRE[i]>S.t)continue;
  const dx=i%MW+0.5-x,dy=((i/MW)|0)+0.5-y,d=dx*dx+dy*dy;
  if(d<bd){bd=d;best=i;}
 }
 return best;
}
function toDrop(u){
 const d=nearestB(u,b=>b.team==='p'&&b.done&&BT[b.t].drop);
 if(!d){u.st='idle';u.wait=2;return;}
 if(setPath(u,d.x,d.y,d.w,d.h,1,true)===0){u.st='idle';u.wait=1;return;}
 u.st='toDrop';
}
function freeSlotBuilding(u,bt){
 let best=null,bd=1e9;
 for(const b of S.blds){
  if(b.team!=='p'||b.t!==bt||!b.done)continue;
  b.wk=b.wk.filter(id=>{const w=UM.get(id);return w&&!w.dead&&w.job===u.job&&w.wb===b.id;});
  if(b.wk.length>=(SLOTS[bt]||3)&&!b.wk.includes(u.id))continue;
  const d=dEnt(u,b);if(d<bd){bd=d;best=b;}
 }
 return best;
}
function startJob(u){
 const j=u.job;if(!j)return;
 if(JOBRES[j]){
  let i=u.ti;
  if(!(i>=0&&T[i]===JOBRES[j][0]&&RA[i]>0&&UNRE[i]<=S.t))i=findRes(j,u.x,u.y);
  if(i<0||!nearestB(u,b=>b.team==='p'&&b.done&&BT[b.t].drop)){u.wait=3;return;}
  u.ti=i;
  const r=setPath(u,i%MW,(i/MW)|0,1,1,1,false);
  if(r===0){UNRE[i]=S.t+40;u.ti=-1;u.wait=0.2;return;}
  u.st='toRes';
 }else if(j==='build'){
  let s=nearestB(u,b=>b.team==='p'&&!b.done);
  if(!s)s=nearestB(u,b=>b.team==='p'&&b.done&&b.hp<b.mhp*0.9&&!b.decor);
  if(!s){u.wait=1.5;return;}
  u.sb=s.id;
  if(setPath(u,s.x,s.y,s.w,s.h,1,false)===0){u.wait=1.5;return;}
  u.st='toSite';
 }else{
  const bt=JOBBT[j];
  let b=u.wb&&BM.get(u.wb);
  if(!b||b.hp<=0||!b.done)b=freeSlotBuilding(u,bt);
  if(!b){u.wb=0;u.wait=2;return;}
  u.wb=b.id;if(!b.wk.includes(u.id))b.wk.push(u.id);
  if(setPath(u,b.x,b.y,b.w,b.h,1,false)===0){u.wait=1.5;return;}
  u.st='toWork';
 }
}
function findPrey(b,u){
 let best=null,bd=2025;
 const cx=b.x+b.w/2,cy=b.y+b.h/2;
 for(const q of S.units){if(q.dead||q.team!=='w'||!UT[q.t].food)continue;if(u&&u.skip&&u.skip[q.id]>S.t)continue;const d=(q.x-cx)**2+(q.y-cy)**2;if(d<bd){bd=d;best=q;}}
 return best;
}
function findFire(st){
 let best=null,bd=900;
 for(const b of S.blds){if(b.team!=='p'||b.fire<=0)continue;const d=dEnt(st,b)**2;if(d<bd){bd=d;best=b;}}
 return best;
}
function workTick(u,dt){
 const b=BM.get(u.wb);
 if(!b||!b.done||b.hp<=0){u.st='idle';u.wb=0;return;}
 const j=u.job,s=seas();
 const hm=happyMul();
 if(j==='farm')addRes('food',0.10*dt*FARMS[s]*fxm('farm')*(S.drought>0?0.5:1)*hm*(b.lvl?1.5:1));
 else if(j==='herd'){addRes('food',0.065*dt*HERDS[s]*hm*(b.lvl?1.5:1));addRes('deri',0.012*dt*hm);}
 else if(j==='trade')addRes('gold',0.07*dt*fxm('trade')*(1+0.25*pactCount())*hm);
 else if(j==='smith'){u.tm+=dt;if(u.tm>=12){
  const R=S.res;
  const rec=[()=>R.alet<6&&R.iron>=1&&R.wood>=1&&(R.iron-=1,R.wood-=1,addRes('alet',2),1),
   ()=>R.zirh<4&&R.iron>=2&&R.deri>=2&&(R.iron-=2,R.deri-=2,addRes('zirh',1),1),
   ()=>R.iron>=2&&R.wood>=2&&(R.iron-=2,R.wood-=2,addRes('silah',1),1)];
  let ok=false;
  for(let k=0;k<3&&!ok;k++){const i=((u.rc||0)+k)%3;if(rec[i]()){ok=true;u.rc=i+1;}}
  u.tm=ok?0:11;}}
 else if(j==='hunt'){u.fs-=dt;if(u.fs<=0){u.fs=2;const pr=findPrey(b,u);if(pr){u.pr=pr.id;u.st='hunt';u.path=null;u.cd=0;u.rp=0;}}}
 else if(j==='fire'){
  u.fs-=dt;
  if(u.fs<=0){u.fs=1;const f=findFire(b);if(f&&setPath(u,f.x,f.y,f.w,f.h,1,false)===1){u.ft=f.id;u.st='toFire';}}
 }
}
function updVillager(u,dt){
 if(!S.founded){if(u.path)walkTo(u,dt);return;}
 if(u.wait>0){u.wait-=dt;return;}
 u.scan-=dt;
 if(u.scan<=0){u.scan=0.6;if(nearestEnemy(u,4.5,true)){u.flee=5;u.path=null;u.st='flee';}}
 if(u.flee>0){
  u.flee-=dt;
  if(u.flee<=0){u.st='idle';u.path=null;return;}
  if(!u.path){
   const tc=nearestB(u,b=>b.t==='tc'&&b.done&&b.team==='p');
   if(tc&&dEnt(u,tc)>2){if(setPath(u,tc.x,tc.y,tc.w,tc.h,1,true)===0)u.wait=0.3;}else return;
  }
  walkTo(u,dt);return;
 }
 switch(u.st){
  case 'idle':startJob(u);break;
  case 'toRes':if(walkTo(u,dt))u.st='gather';break;
  case 'gather':{
   const i=u.ti,j=u.job;
   if(!j||!JOBRES[j]||i<0||T[i]!==JOBRES[j][0]||RA[i]<=0){u.ti=-1;if(u.carry>0.5)toDrop(u);else u.st='idle';break;}
   const a=Math.min(gatherRate(j)*dt,RA[i],10-u.carry);
   u.carry+=a;RA[i]-=a;
   if(RA[i]<=0.01){RA[i]=0;T[i]=0;}
   if(u.carry>=9.99||RA[i]<=0){if(u.carry>0.5)toDrop(u);else u.st='idle';}
   break;}
  case 'toDrop':
   if(walkTo(u,dt)){const rk=u.job==='hunt'?'food':(JOBRES[u.job]&&JOBRES[u.job][1]);if(u.carry>0&&rk){addRes(rk,u.carry);if(S.res.alet>0)S.res.alet=Math.max(0,S.res.alet-0.12);}if(u.job==='hunt'&&u.carry>0)addRes('deri',1);if(u.job==='hunt')S.stats.hunted=(S.stats.hunted||0)+1;u.carry=0;u.st='idle';}
   break;
  case 'toWork':if(walkTo(u,dt))u.st='work';break;
  case 'work':workTick(u,dt);break;
  case 'toSite':if(walkTo(u,dt))u.st='build';break;
  case 'build':{
   const b=BM.get(u.sb);
   if(!b||b.team!=='p'||b.hp<=0){u.st='idle';u.sb=0;break;}
   if(!b.done){
    b.prog=Math.min(1,b.prog+dt/BT[b.t].time);
    b.hp=Math.min(b.mhp,b.mhp*(0.1+0.9*b.prog));
    if(b.prog>=1)finishB(b);
   }else if(b.hp<b.mhp)b.hp=Math.min(b.mhp,b.hp+8*dt);
   else{u.st='idle';u.sb=0;}
   break;}
  case 'hunt':{
   const pr=UM.get(u.pr);
   if(!pr||pr.dead){u.st='idle';u.pr=0;break;}
   const dist=Math.hypot(pr.x-u.x,pr.y-u.y);
   if(dist<=6.5){
    u.path=null;u.cd-=dt;
    if(u.cd<=0){
     u.cd=1.3;
     FX.push({k:'arrow',x1:u.x,y1:u.y,x2:pr.x,y2:pr.y,t:0.25,T:0.25});
     damage(pr,12,u);
     if(pr.dead){u.carry=UT[pr.t].food;u.pr=0;toDrop(u);}
    }
   }else{
    u.rp-=dt;
    if(!u.path||u.rp<=0){u.rp=1.2;const r=setPath(u,Math.floor(pr.x),Math.floor(pr.y),1,1,4,true);if(r===0||(r===1&&u.path&&u.path.length===0&&dist>6.5)){u.skip=u.skip||{};u.skip[pr.id]=S.t+90;u.pr=0;u.st='idle';u.wait=1;break;}}
    if(u.path)walkTo(u,dt);
   }
   break;}
  case 'toFire':if(walkTo(u,dt))u.st='fire';break;
  case 'fire':{
   const f=BM.get(u.ft);
   if(!f||f.fire<=0){u.st='idle';break;}
   f.fire-=14*dt*fxm('fire');
   if(f.fire<=0){f.fire=0;u.st='idle';}
   break;}
  default:u.st='idle';
 }
}
function finishB(b){
 b.done=true;b.prog=1;b.hp=b.mhp;
 log('✔ '+BT[b.t].n+' tamamlandı.',b.x,b.y);
}

// ---------- savaş ----------
function dmgOf(a,e){
 const d=UT[a.t];let atk=d.atk;
 if(a.team==='p'||a.team==='a')atk*=fxm('atk');
 if(e.w){
  if(!d.siege)atk*=0.45;
  return Math.max(1,atk-(BT[e.t].arm||0));
 }
 const ed=UT[e.t];
 if(d.antiCav&&ed.cav)atk*=d.antiCav;
 const arm=ed.arm+(e.team==='p'?fxa('arm'):0);
 return Math.max(1,atk-arm*0.8);
}
let lastLogLoss=0;
function killU(u,a){
 if(u.dead)return;
 u.hp=0;u.dead=1;UM.delete(u.id);
 FX.push({k:'skull',x:u.x,y:u.y,t:1,T:1});
 if(u.team==='b'||u.team==='k')S.stats.kills++;
 if(u.team==='p'){S.stats.lost++;S.recentLoss=(S.recentLoss||0)+1;if(S.t-lastLogLoss>3){lastLogLoss=S.t;log('💀 '+UT[u.t].n+' öldü.',u.x,u.y);}}
}
function destroyB(b,a){
 if(b.hp>0&&b.hp!==0)b.hp=0;
 const k=S.blds.indexOf(b);if(k>=0)S.blds.splice(k,1);
 BM.delete(b.id);fillOcc(b,0);
 FX.push({k:'rubble',x:b.x+b.w/2,y:b.y+b.h/2,t:2,T:2});
 if(b.t==='tent'){
  const c=S.camps.find(c=>c.tent===b.id);
  if(c){
   c.alive=false;
   if(a&&(a.team==='p'||a.team==='a')){S.stats.camps++;
   const g=ri(60,150),f=ri(30,80);addRes('gold',g);addRes('food',f);
   log('🏴 Haydut kampı yıkıldı! Ganimet: +'+g+' altın, +'+f+' yiyecek.',b.x,b.y);}
  }
 }else if(b.team==='p'){
  log('💥 '+BT[b.t].n+' yıkıldı!',b.x,b.y);
  if(b.t==='ev'&&Math.random()<0.3){const v=S.units.find(u=>u.team==='p'&&u.t==='koylu'&&!u.dead);if(v)killU(v);}
  if(b.t==='tc'&&!countB('tc',false))log('🏛 Köy Meydanı yıkıldı! Yapı menüsünden yeniden kurabilirsin.');
 }
}
function alertDefenders(a,e){
 if(e.alertT&&S.t-e.alertT<2)return;
 e.alertT=S.t;
 for(const u of S.units){
  if(u.dead||u.tg||u.st==='move'||!UT[u.t].mil||(u.team!=='p'&&u.team!=='a'))continue;
  if(Math.abs(u.x-e.x)>30||Math.abs(u.y-e.y)>30)continue;
  u.tg=a.id;u.forced=0;
 }
}
function damage(e,dmg,a){
 if(e.hp<=0)return;
 e.hp-=dmg;e.fl=S.t;
 if(a&&e.team==='p'&&(a.team==='b'||a.team==='k')&&(e.w||e.t==='koylu'))alertDefenders(a,e);
 if(e.hp<=0){if(e.w)destroyB(e,a);else killU(e,a);}
 else if(!e.w&&a&&!e.tg&&e.t!=='koylu'&&e.st!=='move')e.tg=a.id;
}
function startFire(b){
 if(b.fire>0||b.decor||b.team!=='p')return;
 b.fire=15;log('🔥 '+BT[b.t].n+' yanıyor!',b.x,b.y);
}
function hit(a,e){
 const d=UT[a.t];
 const ex=e.w?e.x+e.w/2:e.x,ey=e.w?e.y+e.h/2:e.y;
 if(d.ranged)FX.push({k:'arrow',x1:a.x,y1:a.y,x2:ex,y2:ey,t:0.25,T:0.25});
 const dm=dmgOf(a,e);
 if(d.siege){
  for(const o of S.units)if(!o.dead&&hostile(a,o)&&Math.hypot(o.x-ex,o.y-ey)<1.6&&o!==e)damage(o,dm*0.6,a);
  FX.push({k:'boom',x:ex,y:ey,t:0.4,T:0.4});
 }
 damage(e,dm,a);
 if(a.team==='b'&&e.w&&e.team==='p'&&Math.random()<0.008)startFire(e);
}
function sightOf(u){const d=UT[u.t];if(d.aggr){const td=(S.t%DAY)/DAY;return(td>0.78||td<0.06||seas()===3)?11:7;}return u.guard?8:Math.max(6.5,d.rng+2);}
function updFighter(u,dt){
 const d=UT[u.t];
 if(u.wait>0)u.wait-=dt;
 if(u.team==='a'&&u.life!=null){u.life-=dt;if(u.life<=0){killU(u);return;}}
 u.scan-=dt;
 let e=u.tg?getEnt(u.tg):null;
 if(e&&(e.hp<=0||e.dead))e=null;
 if(!e)u.tg=0;
 if(u.scan<=0){
  u.scan=0.3+Math.random()*0.15;
  if(u.st!=='move'){
   if(!e||(!u.forced&&dEnt(u,e)>3)){
    const en=nearestEnemy(u,sightOf(u));
    if(en&&(!e||en!==e)){e=en;u.tg=en.id;u.forced=0;}
   }
   if(u.guard&&e&&Math.hypot(u.x-u.hx,u.y-u.hy)>14){u.tg=0;e=null;u.st='return';u.gx=u.hx;u.gy=u.hy;u.path=null;}
  }
 }
 if(u.st==='move'&&u.tg&&!u.forced){e=null;}
 if(e){
  const reach=d.rng+(d.rng<2?0.6:0.25),dist=dEnt(u,e);
  if(dist<=reach){
   u.path=null;
   if(u.cd<=0){u.cd=d.rof;hit(u,e);}
   u.cd-=dt;return;
  }
  u.cd-=dt;
  u.rp-=dt;
  if(!u.path||u.rp<=0){
   u.rp=1+Math.random()*0.5;
   const ex=d.rng<2?1:Math.max(1,Math.floor(d.rng/1.5));
   const r=setPath(u,e.w?e.x:Math.floor(e.x),e.w?e.y:Math.floor(e.y),e.w||1,e.h||1,ex,true,true);
   if(r===0){u.tg=0;u.wait=0.5;return;}
  }
  if(u.path)walkTo(u,dt);
  return;
 }
 u.cd-=dt;
 if(u.wait>0)return;
 if(!u.path){
  if(u.st==='raid'){
   let g=u.gt?getEnt(u.gt):null;
   if(!g||g.hp<=0||g.team!=='p'){
    g=nearestB(u,b=>b.team==='p'&&!b.decor);
    if(!g){u.st='idle';return;}
    u.gt=g.id;
   }
   const r=setPath(u,g.x,g.y,g.w,g.h,1,true,true);
   if(r===0){u.wait=1;return;}
   if(r===1&&u.path&&u.path.length===0){u.tg=g.id;u.forced=1;u.path=null;}
  }else if(u.st==='move'||u.st==='amove'||u.st==='return'){
   const r=setPath(u,u.gx,u.gy,1,1,0,true,true);
   if(r===0){u.st='idle';return;}
   if(r===1&&u.path&&u.path.length===0){u.st='idle';u.path=null;}
  }else if(u.guard&&Math.hypot(u.x-u.hx,u.y-u.hy)>3){u.st='return';u.gx=u.hx;u.gy=u.hy;}
 }
 if(u.path&&walkTo(u,dt)){
  if(u.st==='move'||u.st==='amove'||u.st==='return')u.st='idle';
 }
}
function wander(u,dt){
 if(u.path)return;
 u.wait-=dt;
 if(u.wait>0)return;
 u.wait=3+Math.random()*7;
 const gx=clamp(Math.floor(u.x+(Math.random()*12-6)),1,MW-2),gy=clamp(Math.floor(u.y+(Math.random()*12-6)),1,MH-2);
 if(walk(gx,gy))setPath(u,gx,gy,1,1,0,true);
}
function updAnimal(u,dt){
 if(u.t==='geyik'){
  u.scan-=dt;
  if(u.scan<=0){
   u.scan=0.5;
   let o=null,bd=u.hp<UT.geyik.hp?64:20;
   for(const q of S.units){if(q.dead||q.team==='w'||q.team==='k')continue;const dd=(q.x-u.x)**2+(q.y-u.y)**2;if(dd<bd){bd=dd;o=q;}}
   if(o){const dx=u.x-o.x,dy=u.y-o.y,l=Math.hypot(dx,dy)||1;setPath(u,clamp(Math.floor(u.x+dx/l*8),1,MW-2),clamp(Math.floor(u.y+dy/l*8),1,MH-2),1,1,0,true);}
  }
  if(u.path)walkTo(u,dt);else wander(u,dt);
  return;
 }
 updFighter(u,dt);
 if(!u.tg&&!u.path&&u.st==='idle')wander(u,dt);
}
function updUnit(u,dt){
 if(u.dead)return;
 if(u.team==='w'){updAnimal(u,dt);return;}
 if(u.team==='p'&&u.t==='koylu'){updVillager(u,dt);return;}
 if(u.team==='f'&&u.t==='fkoylu'){updFolk(u,dt);return;}
 updFighter(u,dt);
}

// ---------- bina ----------
function spawnPos(b){
 const cx=b.x+b.w/2,cy=b.y+b.h/2;
 for(let r=1;r<=6;r++){
  for(let a=0;a<16;a++){
   const an=Math.PI/2+a*Math.PI/8,x=Math.floor(cx+Math.cos(an)*(b.w/2+r)),y=Math.floor(cy+Math.sin(an)*(b.h/2+r));
   if(walk(x,y))return{x:x+0.5,y:y+0.5};
  }
 }
 return{x:b.x+b.w/2,y:b.y+b.h+1};
}
function trainList(b){return b.t==='tc'?['koylu']:(BT[b.t].train||[]);}
function canTrain(ut){
 const d=UT[ut];
 if(d.age>S.age)return'Çağ gerekli';
 if(ut==='top'&&!S.techs.barut)return'Barut gerekli';
 return'';
}
function enqueue(b,ut,n){
 let ok=0;
 for(let i=0;i<n;i++){
  const d=UT[ut];
  if(canTrain(ut)){log('⛔ '+canTrain(ut));break;}
  if(popNow()+popQueued()>=popCap()){log('⛔ Barınak yetersiz: ev inşa et.');break;}
  if(!afford(d.cost)){log('⛔ Kaynak yetersiz.');break;}
  pay(d.cost);b.q.push({u:ut,t:d.time});ok++;
 }
 return ok;
}
function bestTrainer(ut){
 let best=null;
 for(const b of S.blds){
  if(b.team!=='p'||!b.done||!trainList(b).includes(ut))continue;
  if(!best||b.q.length<best.q.length)best=b;
 }
 return best;
}
function updBuilding(b,dt){
 if(b.fire>0){
  const s=seas();
  b.fire=Math.min(70,b.fire+1.0*dt);
  b.fire-=(0.4+(s===0?0.4:0)+(s===3?1.5:0))*dt;
  b.hp-=b.fire*0.04*dt;
  if(Math.random()<dt*0.012*b.fire/70){
   for(const o of S.blds){if(o!==b&&o.team==='p'&&o.fire<=0&&!o.decor&&Math.abs(o.x-b.x)<4&&Math.abs(o.y-b.y)<4&&Math.random()<0.5){startFire(o);break;}}
  }
  if(b.fire<=0){b.fire=0;}
  if(b.hp<=0){destroyB(b);return;}
 }
 if(!b.done||b.team!=='p')return;
 const d=BT[b.t];
 if(d.atk){
  b.cd-=dt;
  if(b.cd<=0){
   const e=nearestEnemy({x:b.x+b.w/2,y:b.y+b.h/2,team:'p'},d.rng,true);
   if(e){
    b.cd=1.5;
    const dm=Math.max(1,d.atk*fxm('tower')-UT[e.t].arm*0.8);
    FX.push({k:'arrow',x1:b.x+b.w/2,y1:b.y+b.h/2,x2:e.x,y2:e.y,t:0.25,T:0.25});
    damage(e,dm,b);
   }else b.cd=0.4;
  }
 }
 if(b.q.length){
  const it=b.q[0];it.t-=dt;
  if(it.t<=0){
   b.q.shift();
   const p=spawnPos(b);
   const u=mkUnit(it.u,'p',p.x,p.y);
   if(S.rally&&UT[it.u].mil){u.st='amove';u.gx=Math.floor(S.rally.x);u.gy=Math.floor(S.rally.y);}
   log('✔ '+UT[it.u].n+' hazır.',p.x,p.y);
  }
 }
 if(b.t==='hastane'){
  let docs=0;
  for(const id of b.wk){const w=UM.get(id);if(w&&w.st==='work')docs++;}
  if(docs>0){
   let pool=docs*5*fxm('heal')*dt;
   for(const u of S.units){
    if(pool<=0)break;
    if(u.team!=='p'||u.dead||u.hp>=u.mhp)continue;
    if(Math.abs(u.x-b.x)>14||Math.abs(u.y-b.y)>14)continue;
    const h=Math.min(pool,u.mhp-u.hp);u.hp+=h;pool-=h;
   }
  }
 }
}
