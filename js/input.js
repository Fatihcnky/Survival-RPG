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
cv.addEventListener('pointerdown',e=>{
 cv.setPointerCapture(e.pointerId);
 ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptr.size===1){tapInfo={x:e.clientX,y:e.clientY,t:performance.now(),moved:false};painting=!!UI.road;if(painting)paintRoad(e.clientX,e.clientY);}
 else{tapInfo=null;painting=false;const p=[...ptr.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}
});
cv.addEventListener('pointermove',e=>{
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
 const i=y*MW+x;
 if(ROAD[i]||T[i]===1||OCC[i]||(T[i]>=3&&T[i]<=5))return;
 if(S.res.wood<1){log('⛔ Odun yok.');painting=false;return;}
 S.res.wood-=1;ROAD[i]=1;
}
function unitAt(t,filter){
 let best=null,bd=0.8;
 for(const u of S.units){if(u.dead||!filter(u))continue;const d=Math.hypot(u.x-t.x,u.y-t.y);if(d<bd){bd=d;best=u;}}
 return best;
}
function bldAt(t){const x=Math.floor(t.x),y=Math.floor(t.y);if(!inMap(x,y))return null;const id=OCC[y*MW+x];return id?BM.get(id):null;}
function onTap(px,py){
 const t=toTile(px,py);
 if(UI.road)return;
 if(UI.place){setGhost(t);updHint();return;}
 // seçili askerlere komut
 if(UI.sel&&UI.sel.kind==='u'){
  const us=UI.sel.ids.map(id=>UM.get(id)).filter(Boolean);
  const cmdable=us.filter(u=>!S.founded||UT[u.t].mil);
  if(cmdable.length){
   const en=unitAt(t,u=>u.team!=='p'&&u.team!=='a'&&u.team!=='f')||(()=>{const b=bldAt(t);return b&&b.team==='b'?b:null;})();
   if(en&&S.founded){cmdAttack(cmdable,en);return;}
   const mine=unitAt(t,u=>u.team==='p');
   if(!(mine&&S.founded)){cmdMove(cmdable,t.x,t.y,S.founded);return;}
  }
 }
 const u=unitAt(t,u=>u.team==='p');
 if(u){UI.sel={kind:'u',ids:[u.id]};UI.tab=null;updPanel(true);return;}
 const b=bldAt(t);
 if(b&&b.team!=='n'&&b.team!=='f'){UI.sel={kind:'b',id:b.id};UI.tab=null;updPanel(true);return;}
 UI.sel=null;updPanel(true);
}

// --- döngü ---
let last=performance.now(),paused=false;
document.addEventListener('visibilitychange',()=>{paused=document.hidden;last=performance.now();if(document.hidden&&S&&S.founded)saveGame();});
function frame(now){
 let dt=Math.min(0.1,(now-last)/1000);last=now;
 if(!paused&&S&&!UI.modalOpen){
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
 try{loaded=!!localStorage.getItem('ky_save');}catch(e){}
 const start=(cont)=>{
  if(cont&&loadGame()){}else newGame();
  clampCam();buildBar();updHint();drawMini(true);
  if(!S.founded)showModal('🏰 Krallık Yolu','Sürgündeki kafilen yeni bir yurt arıyor. Haritada gezin (sürükle, iki parmakla yakınlaştır), uygun bir yer bul ve "Köyü Kur" düğmesine bas.\n\nGörev: köyünü büyüt, haydutlara karşı koy, komşu krallarla diplomasi yap ve krallığını ilan et.',[{t:'Başla'}]);
  requestAnimationFrame(frame);
 };
 if(loaded){
  S=null;showModal('💾 Kayıtlı oyun','Kayıtlı bir oyun bulundu.',[{t:'Devam et',fn:()=>start(true)},{t:'Yeni oyun',fn:()=>{try{localStorage.removeItem('ky_save');}catch(e){}start(false);}}]);
 }else start(false);
}
window.__T={get S(){return S;},sim,act,newGame,foundVillage,placeBuilding,canPlace,autoJobs,balanceJobs,enqueue,launchRaid,UI};
boot();
