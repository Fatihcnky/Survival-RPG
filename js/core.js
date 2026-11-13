'use strict';
// ===== ÇEKİRDEK: durum, harita, yol bulma =====
let S=null;
let UM=new Map(),BM=new Map();
let T,RA,ROAD,OCC;
const NN=MW*MH;
const UNRE=new Float32Array(NN);
const FX=[];
let pathBudget=10,SEEN=null;
const rand=Math.random;
const ri=(a,b)=>a+Math.floor(rand()*(b-a+1));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function log(t,x,y){ if(typeof uiLog==='function')uiLog(t,x,y); }

// --- tohumlu gürültü (harita üretimi) ---
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function noise2(seed){
 function h(ix,iy){let n=Math.imul(ix,374761393)+Math.imul(iy,668265263)+Math.imul(seed|0,1442695041)|0;n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;return(n>>>0)/4294967296;}
 return function(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=h(ix,iy),b=h(ix+1,iy),c=h(ix,iy+1),d=h(ix+1,iy+1);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;};
}

// --- yardımcılar ---
function inMap(x,y){return x>=0&&y>=0&&x<MW&&y<MH;}
function walk(x,y){
 if(x<0||y<0||x>=MW||y>=MH)return false;
 const i=y*MW+x,t=T[i];
 return t!==1&&!(t>=3&&t<=5)&&OCC[i]===0;
}
function getEnt(id){return UM.get(id)||BM.get(id);}
function dEnt(u,e){
 if(e.w){const dx=Math.max(e.x-u.x,0,u.x-(e.x+e.w)),dy=Math.max(e.y-u.y,0,u.y-(e.y+e.h));return Math.hypot(dx,dy);}
 return Math.hypot(e.x-u.x,e.y-u.y);
}
function seas(){return Math.floor(S.t/DAY/SEASON_DAYS)%4;}
function curDay(){return Math.floor(S.t/DAY);}
function fxm(k){let m=1;for(const id in S.techs){const f=TECH[id].fx;if(f&&f[k])m*=f[k];}if(typeof fxTrait==='function'&&S.dyn)m*=fxTrait(k);return m;}
function fxa(k){let m=0;for(const id in S.techs){const f=TECH[id].add;if(f&&f[k])m+=f[k];}return m;}
function countB(t,done){let n=0;for(const b of S.blds)if(b.team==='p'&&b.t===t&&(!done||b.done))n++;return n;}
function nearestB(u,fn){let best=null,bd=1e9;for(const b of S.blds){if(b.hp<=0||!fn(b))continue;const d=dEnt(u,b);if(d<bd){bd=d;best=b;}}return best;}
function hostile(a,b){
 const x=a.team,y=b.team;
 if(x==='w'||y==='w'){const w=x==='w'?a:b,o=x==='w'?b:a;return !!(UT[w.t]&&UT[w.t].aggr)&&!o.w&&(o.team==='p'||o.team==='a');}
 if(x===y||x==='n'||y==='n')return false;
 const f=t=>t==='p'||t==='a';
 if(f(x)&&f(y))return false;
 if((x==='k'&&y==='b')||(x==='b'&&y==='k'))return false;
 return true;
}
function nearestEnemy(u,r,unitsOnly){
 let best=null,bd=r*r;
 for(const o of S.units){
  if(o.dead||o===u||!hostile(u,o))continue;
  const dx=o.x-u.x,dy=o.y-u.y,dd=dx*dx+dy*dy;
  if(dd<bd){bd=dd;best=o;}
 }
 if(!unitsOnly)for(const b of S.blds){
  if(b.decor||b.hp<=0||!hostile(u,b))continue;
  const d=dEnt(u,b);
  if(d*d<bd){bd=d*d;best=b;}
 }
 return best;
}

// --- varlıklar ---
function mkUnit(t,team,x,y,extra){
 const d=UT[t];
 const u=Object.assign({id:S.nid++,t,team,x,y,hp:d.hp,mhp:d.hp,job:null,st:'idle',path:null,pi:0,tg:0,cd:0,carry:0,rp:0,scan:Math.random()*0.5,flee:0,wait:Math.random()*0.5,ti:-1,wb:0,sb:0,tm:0,fs:0},extra||{});
 S.units.push(u);UM.set(u.id,u);return u;
}
function fillOcc(b,v){for(let dy=0;dy<b.h;dy++)for(let dx=0;dx<b.w;dx++){const x=b.x+dx,y=b.y+dy;if(inMap(x,y))OCC[y*MW+x]=v;}}
function mkB(t,team,x,y,done,extra){
 const d=BT[t];
 const b=Object.assign({id:S.nid++,t,team,x,y,w:d.w,h:d.h,hp:done?d.hp:Math.max(1,d.hp*0.1),mhp:d.hp,prog:done?1:0,done:!!done,q:[],wk:[],fire:0,cd:0,decor:d.decor?1:0},extra||{});
 S.blds.push(b);BM.set(b.id,b);fillOcc(b,b.id);return b;
}

// --- yol bulma (A*) ---
const gS=new Float32Array(NN),par=new Int32Array(NN),vis=new Int32Array(NN),clo=new Int32Array(NN);
let stamp=0;
const DX=[1,-1,0,0,1,1,-1,-1],DY=[0,0,1,-1,1,-1,1,-1];
function findPath(sx,sy,gx,gy,gw,gh,ex,partial){
 sx=clamp(Math.floor(sx),0,MW-1);sy=clamp(Math.floor(sy),0,MH-1);
 const inGoal=(x,y)=>x>=gx-ex&&x<gx+gw+ex&&y>=gy-ex&&y<gy+gh+ex;
 if(inGoal(sx,sy))return[];
 stamp++;
 const hI=[],hF=[];
 const push=(i,f)=>{let k=hI.length;hI.push(i);hF.push(f);while(k>0){const p=(k-1)>>1;if(hF[p]<=f)break;hI[k]=hI[p];hF[k]=hF[p];k=p;}hI[k]=i;hF[k]=f;};
 const pop=()=>{const r=hI[0],li=hI.pop(),lf=hF.pop(),n=hI.length;if(n>0){let k=0;for(;;){let c=2*k+1;if(c>=n)break;if(c+1<n&&hF[c+1]<hF[c])c++;if(hF[c]>=lf)break;hI[k]=hI[c];hF[k]=hF[c];k=c;}hI[k]=li;hF[k]=lf;}return r;};
 const cx=gx+gw/2,cy=gy+gh/2;
 const h=(x,y)=>{const dx=Math.abs(x-cx),dy=Math.abs(y-cy);return(dx+dy-0.586*Math.min(dx,dy))*0.9;};
 const start=sy*MW+sx;
 vis[start]=stamp;gS[start]=0;par[start]=-1;push(start,h(sx,sy));
 let found=-1,best=-1,bh=1e9,iter=0;
 while(hI.length){
  const cur=pop();
  if(clo[cur]===stamp)continue;
  clo[cur]=stamp;
  const px=cur%MW,py=(cur/MW)|0;
  if(inGoal(px,py)){found=cur;break;}
  const hh=h(px,py);if(hh<bh){bh=hh;best=cur;}
  if(++iter>14000)break;
  for(let d=0;d<8;d++){
   const dx=DX[d],dy=DY[d],nx=px+dx,ny=py+dy;
   if(!walk(nx,ny))continue;
   if(dx&&dy&&(!walk(px+dx,py)||!walk(px,py+dy)))continue;
   const ni=ny*MW+nx;
   if(clo[ni]===stamp)continue;
   const c=(ROAD[ni]?0.65:T[ni]===2?1.8:1)*(dx&&dy?1.414:1);
   const ng=gS[cur]+c;
   if(vis[ni]!==stamp||ng<gS[ni]){vis[ni]=stamp;gS[ni]=ng;par[ni]=cur;push(ni,ng+h(nx,ny));}
  }
 }
 if(found<0){if(partial&&best>=0&&best!==start)found=best;else return null;}
 const out=[];
 for(let c=found;c!==start&&c>=0;c=par[c]){out.push((c/MW|0)+0.5);out.push(c%MW+0.5);}
 // out: [y,x,y,x...] ters sırada -> düzelt
 const path=[];
 for(let k=out.length-2;k>=0;k-=2){path.push(out[k+1]);path.push(out[k]);}
 return path;
}
// 1: ok, 0: yol yok, -1: bütçe bitti (yalnızca soft)
function setPath(u,gx,gy,gw,gh,ex,partial,soft){
 if(soft){if(pathBudget<=0)return -1;pathBudget--;}
 const p=findPath(u.x,u.y,gx,gy,gw,gh,ex,partial);
 if(!p){u.path=null;return 0;}
 u.path=p;u.pi=0;return 1;
}
function moveStep(u,dt){
 const p=u.path;
 if(!p)return false;
 if(u.pi>=p.length){u.path=null;return false;}
 let sp=UT[u.t].spd*dt;
 const ti=Math.floor(u.y)*MW+Math.floor(u.x);
 if(ROAD[ti])sp*=1.5;else if(T[ti]===2)sp*=0.6;
 while(sp>0&&u.pi<p.length){
  const tx=p[u.pi],ty=p[u.pi+1],dx=tx-u.x,dy=ty-u.y,dd=Math.hypot(dx,dy);
  if(dd<=sp){u.x=tx;u.y=ty;u.pi+=2;sp-=dd;}else{u.x+=dx/dd*sp;u.y+=dy/dd*sp;sp=0;}
 }
 if(u.pi>=p.length){u.path=null;return false;}
 return true;
}
function walkTo(u,dt){ if(!u.path)return true; return !moveStep(u,dt); }

// --- harita üretimi ---
function genMap(){
 T=new Uint8Array(NN);RA=new Float32Array(NN);ROAD=new Uint8Array(NN);OCC=new Int32Array(NN);
 const rn=mulberry(S.seed),nw=noise2(S.seed),nf=noise2(S.seed+77);
 const st=S.start;
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  const i=y*MW+x;
  const w=nw(x/9,y/9)*0.65+nw(x/4.5,y/4.5)*0.35;
  const f=nf(x/6,y/6)*0.7+nf(x/3,y/3)*0.3;
  if(w<0.30)T[i]=1;
  else if(f>0.60&&rn()<0.62){T[i]=2;RA[i]=60;}
 }
 const clear=(cx,cy,r)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++){if(inMap(x,y)&&Math.hypot(x-cx,y-cy)<=r){const i=y*MW+x;T[i]=0;RA[i]=0;}}};
 clear(st.x,st.y,11);KINGS.forEach(k=>clear(k.x,k.y,8));
 // krallara koridor
 KINGS.forEach(k=>{const n=Math.ceil(Math.hypot(k.x-st.x,k.y-st.y));for(let s=0;s<=n;s++){const x=Math.round(st.x+(k.x-st.x)*s/n),y=Math.round(st.y+(k.y-st.y)*s/n);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inMap(x+dx,y+dy)){const i=(y+dy)*MW+x+dx;if(T[i]!==0){T[i]=0;RA[i]=0;}}}});
 const cluster=(t,cx,cy,n,amt)=>{for(let k=0;k<n;k++){const x=cx+Math.floor(rn()*5)-2,y=cy+Math.floor(rn()*5)-2;if(inMap(x,y)&&T[y*MW+x]!==1){T[y*MW+x]=t;RA[y*MW+x]=amt;}}};
 const AM={3:250,4:200,5:160,6:120};
 // başlangıca yakın garantili kümeler
 [[3,0.4],[4,2.2],[5,3.6],[6,5.2],[6,1.2]].forEach(([t,a],k)=>{const d=9+k*1.3;cluster(t,Math.round(st.x+Math.cos(a)*d),Math.round(st.y+Math.sin(a)*d),t===6?5:7,AM[t]);});
 // rastgele kümeler
 [[3,22],[4,16],[5,12],[6,26]].forEach(([t,n])=>{for(let k=0;k<n;k++){const x=ri(4,MW-5),y=ri(4,MH-5);if(Math.hypot(x-st.x,y-st.y)<9)continue;cluster(t,x,y,t===6?5:6,AM[t]);}});
 // ulaşılabilirlik: başlangıçtan erişilemeyen kara su olsun
 const seen=new Uint8Array(NN),q=[st.y*MW+st.x];seen[q[0]]=1;
 for(let h=0;h<q.length;h++){const c=q[h],x=c%MW,y=(c/MW)|0;for(let d=0;d<4;d++){const nx=x+DX[d],ny=y+DY[d];if(!inMap(nx,ny))continue;const ni=ny*MW+nx;if(seen[ni]||T[ni]===1||(T[ni]>=3&&T[ni]<=5))continue;seen[ni]=1;q.push(ni);}}
 for(let i=0;i<NN;i++)if(!seen[i]&&T[i]!==1&&!(T[i]>=3&&T[i]<=5)){T[i]=1;RA[i]=0;}
 SEEN=seen;
}
