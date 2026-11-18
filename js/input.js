'use strict';
// ===== GİRDİ, DÖNGÜ, BAŞLATMA =====
// --- arayüz dokunuşları: yeniden çizime dayanıklı "tap" ---
function keyOf(el){const e=el&&el.closest&&el.closest('[data-a]');return e?e:null;}
let dn=null;
document.addEventListener('pointerdown',e=>{const k=keyOf(e.target);dn=k?{a:k.dataset.a,v:k.dataset.v,w:k.dataset.w,x:e.clientX,y:e.clientY,el:k}:null;},true);
document.addEventListener('pointerup',e=>{
 if(!dn)return;
 const k=keyOf(e.target),d=dn;dn=null;
 if(!k||k.dataset.a!==d.a||k.dataset.v!==d.v)return;
 if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)return;
 act(d.a,d.v,d.w,k);
},true);

// --- harita girdisi ---
const ptr=new Map();let tapInfo=null,pinch=0,painting=false;
function overUI(t){return t!==cv;}
let boxS=null;
cv.addEventListener('pointerdown',e=>{
 cv.setPointerCapture(e.pointerId);
 if(UI.box&&e.isPrimary&&!UI.place&&!UI.road){boxS={x:e.clientX,y:e.clientY};const r=$('selrect');r.style.display='block';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';r.style.width='0';r.style.height='0';return;}
 ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptr.size===1){tapInfo={x:e.clientX,y:e.clientY,t:performance.now(),moved:false};painting=!!UI.road;if(painting){if(UI.wall){UI.wlx=null;UI.wbatch=[];(UI.wstack=UI.wstack||[]).push(UI.wbatch);}paintRoad(e.clientX,e.clientY);}}
 else{tapInfo=null;painting=false;const p=[...ptr.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}
});
cv.addEventListener('pointermove',e=>{
 if(boxS){const r=$('selrect');r.style.left=Math.min(boxS.x,e.clientX)+'px';r.style.top=Math.min(boxS.y,e.clientY)+'px';r.style.width=Math.abs(e.clientX-boxS.x)+'px';r.style.height=Math.abs(e.clientY-boxS.y)+'px';return;}
 const p=ptr.get(e.pointerId);if(!p)return;
 const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
 if(ptr.size===2){
  const q=[...ptr.values()],d=Math.hypot(q[0].x-q[1].x,q[0].y-q[1].y);
  if(pinch>0){S.cam.z*=d/pinch;clampCam();}
  pinch=d;return;
 }
 if(tapInfo&&Math.hypot(e.clientX-tapInfo.x,e.clientY-tapInfo.y)>8)tapInfo.moved=true;
 if(painting){paintRoad(e.clientX,e.clientY);return;}
 if(tapInfo&&tapInfo.moved){const s=sc()/DPR;S.cam.x-=dx/s;S.cam.y-=dy/s;clampCam();}
 else if(e.pointerType==='mouse'&&UI.place){const t=toTile(e.clientX,e.clientY);setGhost(t);}
});
function endPtr(e){
 if(boxS){const b=boxS;boxS=null;$('selrect').style.display='none';UI.box=false;selectInRect(b.x,b.y,e.clientX,e.clientY);return;}
 const had=ptr.has(e.pointerId);ptr.delete(e.pointerId);
 if(ptr.size<2)pinch=0;
 if(had&&tapInfo&&!tapInfo.moved&&performance.now()-tapInfo.t<500&&ptr.size===0)onTap(e.clientX,e.clientY);
 if(ptr.size===0){tapInfo=null;painting=false;}
}
cv.addEventListener('pointerup',endPtr);
cv.addEventListener('pointercancel',e=>{ptr.delete(e.pointerId);tapInfo=null;painting=false;});
cv.addEventListener('wheel',e=>{e.preventDefault();S.cam.z*=e.deltaY<0?1.1:0.9;clampCam();},{passive:false});
$('mm').addEventListener('pointerdown',e=>{const r=$('mm').getBoundingClientRect();S.cam.x=(e.clientX-r.left)/r.width*MW;S.cam.y=(e.clientY-r.top)/r.height*MH;clampCam();});

function setGhost(t){
 const d=BT[UI.place.t];
 UI.place.x=Math.floor(t.x-d.w/2+0.5);UI.place.y=Math.floor(t.y-d.h/2+0.5);
}
function paintRoad(px,py){
 const t=toTile(px,py),x=Math.floor(t.x),y=Math.floor(t.y);
 if(!inMap(x,y))return;
 if(UI.wall){
  if(!S.founded)return;
  UI.wsel=UI.wsel||[];
  let pts=[[x,y]];
  if(UI.wlx!=null&&(Math.abs(x-UI.wlx)>1||Math.abs(y-UI.wly)>1)){
   pts=[];const n=Math.max(Math.abs(x-UI.wlx),Math.abs(y-UI.wly));
   for(let i=1;i<=n;i++)pts.push([Math.round(UI.wlx+(x-UI.wlx)*i/n),Math.round(UI.wly+(y-UI.wly)*i/n)]);
  }
  for(const [px,py] of pts){const k=py*MW+px;if(!inMap(px,py)||OCC[k]||UI.wsel.includes(k)||!canPlace('duvar',px,py))continue;UI.wsel.push(k);if(UI.wbatch)UI.wbatch.push(k);}
  UI.wlx=x;UI.wly=y;updHint();return;
 }
 const i=y*MW+x;
 if(ROAD[i]||T[i]===1||OCC[i]||(T[i]>=3&&T[i]<=5))return;
 if(S.res.wood<1){log('⛔ Odun yok.');painting=false;return;}
 S.res.wood-=1;ROAD[i]=1;
}
function unitAt(t,filter){
 let best=null,bd=0.8;
 for(const u of S.units){if(u.dead||!filter(u))continue;if(u.team!=='p'&&u.team!=='a'&&fogAt(u.x,u.y)===0)continue;const d=Math.hypot(u.x-t.x,u.y-t.y);if(d<bd){bd=d;best=u;}}
 return best;
}
function bldAt(t){const x=Math.floor(t.x),y=Math.floor(t.y);if(!inMap(x,y)||FOG[y*MW+x]===0)return null;const id=OCC[y*MW+x];return id?BM.get(id):null;}
let lastTap={id:0,t:0};
function onTap(px,py){
 const t=toTile(px,py);
 if(UI.road)return;
 if(UI.place){setGhost(t);updHint();return;}
 // seçili askerlere komut
 if(UI.sel&&UI.sel.kind==='u'){
  const us=UI.sel.ids.map(id=>UM.get(id)).filter(Boolean);
  const cmdable=us;
  if(cmdable.length){
   const en=unitAt(t,u=>u.team!=='p'&&u.team!=='a'&&u.team!=='f')||(()=>{const b=bldAt(t);return b&&b.team==='b'?b:null;})();
   const mil=cmdable.filter(u=>UT[u.t].mil);
   if(en&&S.founded&&mil.length){cmdAttack(mil,en);return;}
   const mine=unitAt(t,u=>u.team==='p');
   if(!(mine&&S.founded)){cmdMove(cmdable,t.x,t.y,S.founded);return;}
  }
 }
 const u=unitAt(t,u=>u.team==='p');
 if(u){
  const now=performance.now();
  if(lastTap.id===u.id&&now-lastTap.t<450){selectSameType(u);lastTap={id:0,t:0};return;}
  lastTap={id:u.id,t:now};
  UI.sel={kind:'u',ids:[u.id]};UI.tab=null;updPanel(true);return;}
 const b=bldAt(t);
 if(b&&b.team!=='n'&&b.team!=='f'){UI.sel={kind:'b',id:b.id};UI.tab=null;updPanel(true);return;}
 UI.sel=null;updPanel(true);
}

// --- döngü ---
let last=performance.now(),paused=false;
document.addEventListener('visibilitychange',()=>{paused=document.hidden;last=performance.now();if(document.hidden&&S&&S.founded)saveGame('ky_auto');});
function frame(now){
 let dt=Math.min(0.1,(now-last)/1000);last=now;
 if(!paused&&S&&!UI.modalOpen&&!UI.menuOpen){
  let acc=dt*S.speed;
  while(acc>1e-6){const s=Math.min(acc,0.1);sim(s);acc-=s;}
 }
 if(S){
  draw();
  UI.hudT-=dt;
  if(UI.hudT<=0){UI.hudT=0.3;updHud();selInfo();drawMini();if(UI.tab||UI.sel)updPanel(false);}
 }
 requestAnimationFrame(frame);
}
function boot(){
 resize();
 let loaded=false;
 loaded=true;
 const start=(cont,key)=>{
  const go=()=>{
   clampCam();buildBar();updHint();drawMini(true);
   if(!S.founded)showModal('🏰 Aldora\'nın Mirası','Sürgündeki kafilen yeni bir yurt arıyor. Haritada gezin (sürükle, iki parmakla yakınlaştır), uygun bir yer bul ve "Köyü Kur" düğmesine bas.\n\nGörev: köyünü büyüt, haydutlara karşı koy, komşu krallarla diplomasi yap ve krallığını ilan et.',[{t:'Başla'}]);
  };
  requestAnimationFrame(frame);
  if(cont&&loadGame(key))go();else newGameSetup(go);
 };
 S=null;showMenu(loaded,start);
}
window.__T={AUD,get S(){return S;},sim,act,newGame,foundVillage,placeBuilding,canPlace,autoJobs,balanceJobs,enqueue,launchRaid,UI};
boot();
