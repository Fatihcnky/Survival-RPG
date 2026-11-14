'use strict';
// ===== KRALLIKLAR: canlı yapay zekâ (köylü, ev, çiftlik, asker, haydutlarla savaş) =====
const KRANK=['Köy','Kasaba','Şehir','Kale Şehri'];
function kdOf(i){return S.kings[i].kd;}
function kBlds(i,t){return S.blds.filter(b=>b.team==='f'&&b.kid===i&&(!t||b.t===t));}
function kUnits(i,fn){return S.units.filter(u=>!u.dead&&u.team==='f'&&u.kid===i&&(!fn||fn(u)));}
function kCap(i){return 8+kBlds(i,'fev').length*4;}
function kFind(i,w,h){
 const k=KINGS[i];
 for(let n=0;n<40;n++){
  const a=Math.random()*6.283,r=5+Math.random()*(8+kdOf(i).lvl*3);
  const x=Math.round(k.x+Math.cos(a)*r),y=Math.round(k.y+Math.sin(a)*r);
  if(walkRect(x-1,y-1,w+2,h+2))return{x,y};
 }
 return null;
}
function kBuild(i,t){
 const p=kFind(i,BT[t].w,BT[t].h);if(!p)return null;
 const b=mkB(t,'f',p.x,p.y,true,{kid:i});
 FX.push({k:'poof',x:p.x+b.w/2,y:p.y+b.h/2,t:0.5,T:0.5});return b;
}
function kSpawn(i,t){
 const k=KINGS[i],tc=kBlds(i,'ftc')[0];if(!tc)return null;
 const p=spawnPos(tc);
 const u=mkUnit(t,'f',p.x,p.y,{kid:i,st:'idle',hx:k.x,hy:k.y+3,guard:UT[t].mil?1:0});
 return u;
}
function initKingdoms(){
 KINGS.forEach((k,i)=>{
  S.kings[i].kd={food:100,wood:80,stone:30,gold:50,lvl:0,pop:0,camp:0,raidCool:ri(4,10),campCool:ri(3,8),campGoal:0};
  const tc=mkB('ftc','f',k.x-2,k.y-2,true,{kid:i});
  [[-6,-1],[5,-3],[-5,5],[4,5],[-1,-7]].forEach(([dx,dy])=>{const x=k.x+dx,y=k.y+dy;if(walkRect(x,y,2,2))mkB('fev','f',x,y,true,{kid:i});});
  [[8,2],[-9,3]].forEach(([dx,dy])=>{const x=k.x+dx,y=k.y+dy;if(walkRect(x,y,3,3))mkB('fciftlik','f',x,y,true,{kid:i});});
  for(let j=0;j<6;j++)kSpawn(i,'fkoylu');
  for(let j=0;j<4;j++)kSpawn(i,j%2?'okcu':'mizrakli');
 });
}
// ---- köylü davranışı ----
function updFolk(u,dt){
 const k=KINGS[u.kid],kd=kdOf(u.kid);
 if(u.wait>0){u.wait-=dt;return;}
 const home=kBlds(u.kid,'ftc')[0];
 if(u.st!=='flee'){
  u.scan-=dt;
  if(u.scan<=0){u.scan=0.7;const en=nearestEnemy(u,6,true);if(en&&home){u.st='flee';setPath(u,home.x,home.y,home.w,home.h,1,true,true);u.wait=0;}}
 }
 switch(u.st){
  case 'flee':
   if(!u.path||walkTo(u,dt)){u.st='idle';u.wait=4+Math.random()*3;}
   break;
  case 'idle':{
   // iş seç: ağaç, taş, tarla
   const r=Math.random();let tx=-1,ty=-1,kind='food';
   for(let n=0;n<25;n++){
    const x=Math.round(k.x+(Math.random()-0.5)*34),y=Math.round(k.y+(Math.random()-0.5)*34);
    if(!inMap(x,y))continue;const ti=T[y*MW+x];
    if(r<0.45&&ti===2&&RA[y*MW+x]>0){tx=x;ty=y;kind='wood';break;}
    if(r>=0.45&&r<0.6&&ti===3){tx=x;ty=y;kind='stone';break;}
   }
   if(tx<0){
    const fs=kBlds(u.kid,'fciftlik');
    if(fs.length){const f=fs[Math.floor(Math.random()*fs.length)];tx=f.x;ty=f.y;kind='food';}
    else if(home){tx=home.x;ty=home.y;}
    else{u.wait=3;return;}
   }
   const rr=setPath(u,tx,ty,kind==='food'?3:1,kind==='food'?3:1,1,true,true);
   if(rr===-1){u.wait=0.5;return;}
   if(rr===0){u.wait=2;return;}
   u.kind=kind;u.st='go';break;}
  case 'go':if(walkTo(u,dt)){u.st='work';u.tm=5+Math.random()*4;}break;
  case 'work':u.tm-=dt;if(u.tm<=0){
    const kd2=kd;if(u.kind==='wood')kd2.wood+=8;else if(u.kind==='stone')kd2.stone+=6;else kd2.food+=11;
    if(u.kind==='wood'&&Math.random()<0.15)kd2.gold+=2;
    if(home&&setPath(u,home.x,home.y,home.w,home.h,1,true,true)===1)u.st='back';else{u.st='idle';u.wait=1;}
   }break;
  case 'back':if(walkTo(u,dt)){u.st='idle';u.wait=1+Math.random()*2;}break;
  default:u.st='idle';
 }
}
// ---- günlük gelişim ----
function kingdomsDay(){
 KINGS.forEach((K,i)=>{
  const kd=kdOf(i),k=S.kings[i];
  const folk=kUnits(i,u=>u.t==='fkoylu'),sol=kUnits(i,u=>UT[u.t].mil);
  const tc=kBlds(i,'ftc')[0];
  if(!tc){ // merkez yıkıldıysa yeniden kur
   if(kd.wood>=100){const p=kFind(i,4,4);if(p){mkB('ftc','f',p.x,p.y,true,{kid:i});kd.wood-=100;}}
   return;
  }
  kd.pop=folk.length+sol.length;kd.stone+=folk.length*0.4;
  ['food','wood','stone'].forEach(r=>{if(kd[r]>1500)kd[r]=1500;});
  kd.food-=folk.length*0.9+sol.length*0.5;
  if(kd.food<0){kd.food=0;if(folk.length>4&&Math.random()<0.3)killU(folk[0]);}
  // nüfus artışı
  if(kd.food>folk.length*8&&kd.pop<kCap(i)&&Math.random()<0.6){kSpawn(i,'fkoylu');kd.food-=12;}
  // ev, çiftlik
  const nh=kBlds(i,'fev').length,nf=kBlds(i,'fciftlik').length,nk=kBlds(i,'fkisla').length;
  if(kd.pop>=kCap(i)-2&&kd.wood>=60&&kd.stone>=15&&nh<30){if(kBuild(i,'fev')){kd.wood-=60;kd.stone-=15;}}
  else if(nf<Math.ceil(folk.length/4)&&nf<8&&kd.wood>=70){if(kBuild(i,'fciftlik'))kd.wood-=70;}
  else if(kd.lvl>=1&&!nk&&kd.wood>=120&&kd.stone>=60){if(kBuild(i,'fkisla')){kd.wood-=120;kd.stone-=60;}}
  else if(kd.lvl>=2&&!kBlds(i,'fkale').length&&kd.wood>=200&&kd.stone>=150){if(kBuild(i,'fkale')){kd.wood-=200;kd.stone-=150;}}
  kd.lvl=nh>=20?3:nh>=12?2:nh>=7?1:0;
  // asker
  const want=Math.min(22,3+Math.floor(kd.pop/3)+kd.lvl*2);
  if(sol.length<want&&kd.food>40&&kd.wood>15&&Math.random()<0.7){
   kd.food-=25;kd.wood-=12;
   kSpawn(i,Math.random()<0.4?'okcu':(kd.lvl>=2&&Math.random()<0.3?'kilic':'mizrakli'));
  }
  k.str=Math.round(sol.length*3+folk.length*0.5);
  // haydut kampına sefer
  kd.campCool--;
  if(kd.campCool<=0&&sol.length>=10&&!kd.campGoal){
   let best=null,bd=45;
   for(const c of S.camps){if(!c.alive)continue;const d=Math.hypot(c.x-K.x,c.y-K.y);if(d<bd){bd=d;best=c;}}
   if(best){
    kd.campGoal=best.id;kd.campEnd=S.day+7;
    const n=Math.floor(sol.length*0.7);
    sol.slice(0,n).forEach(u=>{u.guard=0;u.camp=best.id;u.st='amove';u.gx=best.x+1;u.gy=best.y+3;u.path=null;u.tg=0;});
    if(k.rel>=30)log('⚔ '+K.n+' bir haydut kampına sefer düzenledi.');
   }
   kd.campCool=ri(12,22);
  }
  if(kd.campGoal){
   const c=S.camps.find(c=>c.id===kd.campGoal);
   if(!c||!c.alive||S.day>=kd.campEnd){
    kd.campGoal=0;
    kUnits(i,u=>u.camp).forEach(u=>{u.camp=0;u.guard=1;u.st='return';u.gx=u.hx;u.gy=u.hy;u.path=null;u.tg=0;});
    if(c&&!c.alive&&k.rel>-50&&Math.random()<0.5)log('🏴 '+K.n+' bir haydut kampını yok etti.');
   }
  }
  // haydut baskını
  kd.raidCool--;
  if(kd.raidCool<=0&&S.day>6){
   kd.raidCool=ri(8,16);
   let best=null,bd=55;
   for(const c of S.camps){if(!c.alive)continue;const d=Math.hypot(c.x-K.x,c.y-K.y);if(d<bd){bd=d;best=c;}}
   if(best){
    const n=2+Math.floor(S.day/15)+kd.lvl;
    for(let j=0;j<n;j++)mkUnit(j%3===2?'haydutokcu':'haydut','b',best.x+0.5+j*0.5,best.y+2.5,{st:'amove',gx:K.x+ri(-3,3),gy:K.y+ri(-3,3),kraid:i});
    if(k.rel>=15)log('🏹 Haydutlar '+K.n+' topraklarına saldırıyor!');
   }
  }
  // haydutlar işini bitirdiyse dağılsın
 });
}
