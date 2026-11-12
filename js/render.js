'use strict';
// ===== ÇİZİM =====
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const mmc=document.getElementById('mm'),mctx=mmc.getContext('2d');
let DPR=1,CW=0,CH=0;
const SPR=new Map();
function spr(g){
 let c=SPR.get(g);
 if(!c){c=document.createElement('canvas');c.width=c.height=56;const x=c.getContext('2d');x.font='44px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(g,28,31);SPR.set(g,c);}
 return c;
}
const GRASS=[['#6fae45','#69a840','#74b44a'],['#5c9a3a','#579436','#62a03f'],['#b0923c','#aa8c38','#b89a44'],['#dfe8ee','#d6e0e8','#e6eef3']];
const TREEC=['#2f7a2e','#276c26','#c9791f','#8fa6a0'];
function resize(){
 DPR=Math.min(window.devicePixelRatio||1,1.75);
 CW=cv.width=Math.floor(innerWidth*DPR);CH=cv.height=Math.floor(innerHeight*DPR);
}
window.addEventListener('resize',resize);
function sc(){return DPR*S.cam.z*TS;}
function toTile(px,py){const s=sc(),cam=S.cam;return{x:cam.x+(px*DPR-CW/2)/s,y:cam.y+(py*DPR-CH/2)/s};}
function clampCam(){const cam=S.cam;cam.x=clamp(cam.x,0,MW);cam.y=clamp(cam.y,0,MH);cam.z=clamp(cam.z,0.45,2.2);}
function text(str,tx,ty,px,col){
 const s=sc(),cam=S.cam,sx=(tx-cam.x)*s+CW/2,sy=(ty-cam.y)*s+CH/2;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);
 ctx.font='bold '+Math.round(px*DPR)+'px sans-serif';ctx.textAlign='center';ctx.fillStyle='#000a';ctx.fillText(str,sx+1,sy+1);ctx.fillStyle=col||'#fff';ctx.fillText(str,sx,sy);ctx.restore();
}
function hash(x,y){let n=Math.imul(x,374761393)+Math.imul(y,668265263)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)%1000/1000;}
function drawTile(x,y,s){
 const i=y*MW+x,t=T[i],h=hash(x,y);
 if(t===1){ctx.fillStyle=h<0.5?'#3b78b8':'#3f7fc2';ctx.fillRect(x,y,1.03,1.03);return;}
 const g=GRASS[s];ctx.fillStyle=g[(h*3)|0];ctx.fillRect(x,y,1.03,1.03);
 if(ROAD[i]){ctx.fillStyle=s===3?'#b9a98e':'#a8895a';ctx.fillRect(x+0.05,y+0.05,0.95,0.95);}
 if(t===2){
  ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(x+0.5,y+0.85,0.32,0.12,0,0,6.3);ctx.fill();
  ctx.fillStyle=TREEC[s];ctx.beginPath();ctx.moveTo(x+0.5,y+0.05+h*0.08);ctx.lineTo(x+0.88,y+0.85);ctx.lineTo(x+0.12,y+0.85);ctx.fill();
  ctx.fillStyle='#5a3b1e';ctx.fillRect(x+0.45,y+0.82,0.1,0.14);
 }else if(t===3){
  ctx.fillStyle='#8c8f94';ctx.beginPath();ctx.moveTo(x+0.08,y+0.9);ctx.lineTo(x+0.3,y+0.2);ctx.lineTo(x+0.62,y+0.12);ctx.lineTo(x+0.93,y+0.9);ctx.fill();
  ctx.fillStyle='#b7bac0';ctx.beginPath();ctx.moveTo(x+0.3,y+0.2);ctx.lineTo(x+0.62,y+0.12);ctx.lineTo(x+0.5,y+0.5);ctx.fill();
 }else if(t===4){
  ctx.fillStyle='#6f5b52';ctx.beginPath();ctx.moveTo(x+0.08,y+0.9);ctx.lineTo(x+0.3,y+0.2);ctx.lineTo(x+0.62,y+0.12);ctx.lineTo(x+0.93,y+0.9);ctx.fill();
  ctx.fillStyle='#c0563a';ctx.fillRect(x+0.35,y+0.4,0.12,0.12);ctx.fillRect(x+0.6,y+0.55,0.12,0.12);
 }else if(t===5){
  ctx.fillStyle='#7d7568';ctx.beginPath();ctx.moveTo(x+0.08,y+0.9);ctx.lineTo(x+0.3,y+0.2);ctx.lineTo(x+0.62,y+0.12);ctx.lineTo(x+0.93,y+0.9);ctx.fill();
  ctx.fillStyle='#ffd23c';ctx.fillRect(x+0.33,y+0.38,0.14,0.14);ctx.fillRect(x+0.58,y+0.52,0.14,0.14);ctx.fillRect(x+0.45,y+0.68,0.12,0.12);
 }else if(t===6){
  ctx.fillStyle='#2e7d32';ctx.beginPath();ctx.arc(x+0.5,y+0.55,0.32,0,6.3);ctx.fill();
  ctx.fillStyle=s===3?'#aaa':'#d32f2f';[[0.35,0.45],[0.6,0.5],[0.5,0.7]].forEach(p=>{ctx.beginPath();ctx.arc(x+p[0],y+p[1],0.07,0,6.3);ctx.fill();});
 }
}
function drawBuilding(b){
 const d=BT[b.t];
 ctx.fillStyle=d.col;ctx.globalAlpha=b.done?1:0.55;
 ctx.fillRect(b.x+0.06,b.y+0.06,b.w-0.12,b.h-0.12);
 ctx.globalAlpha=1;
 ctx.lineWidth=0.07;ctx.strokeStyle=b.team==='n'?'#0006':(b.team==='p'?TEAMCOL.p:b.team==='b'?TEAMCOL.b:'#000');
 ctx.strokeRect(b.x+0.06,b.y+0.06,b.w-0.12,b.h-0.12);
 const m=Math.min(b.w,b.h)*0.7;
 ctx.drawImage(spr(d.ic||'🏠'),b.x+b.w/2-m/2,b.y+b.h/2-m/2,m,m);
 if(!b.done){ctx.fillStyle='#000a';ctx.fillRect(b.x+0.2,b.y+b.h-0.35,b.w-0.4,0.2);ctx.fillStyle='#ffd23c';ctx.fillRect(b.x+0.2,b.y+b.h-0.35,(b.w-0.4)*b.prog,0.2);}
 else if(b.hp<b.mhp&&!b.decor){ctx.fillStyle='#000a';ctx.fillRect(b.x+0.2,b.y+0.1,b.w-0.4,0.15);ctx.fillStyle=b.hp/b.mhp>0.4?'#4caf50':'#e53935';ctx.fillRect(b.x+0.2,b.y+0.1,(b.w-0.4)*b.hp/b.mhp,0.15);}
 if(b.q&&b.q.length){const it=b.q[0],tt=UT[it.u].time;ctx.fillStyle='#000a';ctx.fillRect(b.x+0.2,b.y+b.h-0.2,b.w-0.4,0.12);ctx.fillStyle='#4fc3f7';ctx.fillRect(b.x+0.2,b.y+b.h-0.2,(b.w-0.4)*(1-it.t/tt),0.12);}
 if(b.fire>0){const f=Math.sin(S.t*12+b.id)*0.1;ctx.drawImage(spr('🔥'),b.x+b.w/2-0.5,b.y+b.h/2-0.7+f,1,1);ctx.drawImage(spr('🔥'),b.x+0.1,b.y+0.3,0.6,0.6);}
}
function drawUnit(u){
 const d=UT[u.t],r=u.t==='top'?0.4:0.3;
 ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(u.x,u.y+0.25,0.28,0.1,0,0,6.3);ctx.fill();
 ctx.fillStyle=u.team==='p'&&u.t==='koylu'?'#e8d3a8':TEAMCOL[u.team];
 ctx.beginPath();ctx.arc(u.x,u.y,r,0,6.3);ctx.fill();
 ctx.lineWidth=0.07;ctx.strokeStyle=TEAMCOL[u.team];ctx.stroke();
 ctx.drawImage(spr(d.g),u.x-0.34,u.y-0.38,0.68,0.68);
 if(u.hp<u.mhp){ctx.fillStyle='#000a';ctx.fillRect(u.x-0.3,u.y-0.5,0.6,0.1);ctx.fillStyle=u.hp/u.mhp>0.4?'#4caf50':'#e53935';ctx.fillRect(u.x-0.3,u.y-0.5,0.6*u.hp/u.mhp,0.1);}
 if(u.team==='p'&&u.t==='koylu'&&S.founded&&u.job){const j=JOBS.find(j=>j.id===u.job);if(j)ctx.drawImage(spr(j.ic),u.x+0.12,u.y-0.62,0.4,0.4);}
 if(u.carry>0.5)ctx.drawImage(spr('📦'),u.x-0.52,u.y-0.1,0.35,0.35);
}
function draw(){
 const s=sc(),cam=S.cam,vw=CW/s,vh=CH/s,x0=cam.x-vw/2,y0=cam.y-vh/2;
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0a0f14';ctx.fillRect(0,0,CW,CH);
 ctx.setTransform(s,0,0,s,-x0*s,-y0*s);
 const sn=seas();
 const xa=Math.max(0,Math.floor(x0)),xb=Math.min(MW-1,Math.ceil(x0+vw)),ya=Math.max(0,Math.floor(y0)),yb=Math.min(MH-1,Math.ceil(y0+vh));
 for(let y=ya;y<=yb;y++)for(let x=xa;x<=xb;x++)drawTile(x,y,sn);
 // krallık sınırları
 ctx.lineWidth=0.1;
 KINGS.forEach(k=>{ctx.strokeStyle=k.col+'88';ctx.beginPath();ctx.arc(k.x,k.y,22,0,6.3);ctx.stroke();});
 const vis=o=>o.x+(o.w||0)>=xa-1&&o.x<=xb+2&&o.y+(o.h||0)>=ya-1&&o.y<=yb+2;
 for(const b of S.blds)if(vis(b))drawBuilding(b);
 // seçili bina halkası
 if(UI.sel&&UI.sel.kind==='b'){const b=BM.get(UI.sel.id);if(b){ctx.lineWidth=0.12;ctx.strokeStyle='#fff';ctx.strokeRect(b.x-0.05,b.y-0.05,b.w+0.1,b.h+0.1);if(BT[b.t].rng&&b.team==='p'){ctx.lineWidth=0.05;ctx.strokeStyle='#fff6';ctx.beginPath();ctx.arc(b.x+b.w/2,b.y+b.h/2,BT[b.t].rng,0,6.3);ctx.stroke();}}}
 const selU=new Set(UI.sel&&UI.sel.kind==='u'?UI.sel.ids:[]);
 for(const u of S.units){if(!vis(u))continue;drawUnit(u);if(selU.has(u.id)){ctx.lineWidth=0.08;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(u.x,u.y,0.45,0,6.3);ctx.stroke();}}
 // efektler
 for(const f of FX){
  const a=f.t/f.T;
  if(f.k==='arrow'){ctx.strokeStyle='#fff';ctx.lineWidth=0.06;ctx.beginPath();const p=1-a;ctx.moveTo(f.x1+(f.x2-f.x1)*Math.max(0,p-0.3),f.y1+(f.y2-f.y1)*Math.max(0,p-0.3));ctx.lineTo(f.x1+(f.x2-f.x1)*p,f.y1+(f.y2-f.y1)*p);ctx.stroke();}
  else if(f.k==='skull'){ctx.globalAlpha=a;ctx.drawImage(spr('💀'),f.x-0.3,f.y-0.3-(1-a)*0.4,0.6,0.6);ctx.globalAlpha=1;}
  else if(f.k==='boom'){ctx.globalAlpha=a;ctx.drawImage(spr('💥'),f.x-0.8,f.y-0.8,1.6,1.6);ctx.globalAlpha=1;}
  else if(f.k==='rubble'){ctx.globalAlpha=a;ctx.fillStyle='#555';ctx.beginPath();ctx.arc(f.x,f.y,1.2*(1-a)+0.4,0,6.3);ctx.fill();ctx.globalAlpha=1;}
  else if(f.k==='poof'){ctx.globalAlpha=a;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(f.x,f.y,(1-a)*1.2,0,6.3);ctx.fill();ctx.globalAlpha=1;}
 }
 // yerleştirme hayaleti
 const P=UI.place;
 if(P&&P.x!=null){
  const d=BT[P.t];
  const ok=P.t==='tc'&&!S.founded?!founderOk(P.x,P.y):canPlace(P.t,P.x,P.y);
  ctx.globalAlpha=0.6;ctx.fillStyle=ok?'#4caf50':'#e53935';ctx.fillRect(P.x,P.y,d.w,d.h);ctx.globalAlpha=1;
  ctx.drawImage(spr(d.ic),P.x+d.w/2-0.5,P.y+d.h/2-0.5,1,1);
  if(d.rng){ctx.lineWidth=0.05;ctx.strokeStyle='#fff8';ctx.beginPath();ctx.arc(P.x+d.w/2,P.y+d.h/2,d.rng,0,6.3);ctx.stroke();}
 }
 // etiketler
 KINGS.forEach((k,i)=>{const kk=S.kings[i];const st=kk.war?'⚔':kk.pact==='ittifak'?'🤝':kk.pact?'📜':'';text(k.n+' '+st,k.x,k.y-3.2,12,'#fff');});
 S.camps.forEach(c=>{if(c.alive&&c.x>=xa-2&&c.x<=xb+2&&c.y>=ya-2&&c.y<=yb+2)text('Haydut Kampı',c.x+1,c.y-0.4,11,'#ff8a80');});
 // gece/gündüz
 ctx.setTransform(1,0,0,1,0,0);
 const tod=(S.t%DAY)/DAY;
 const a=tod<0.06?0.35*(1-tod/0.06):tod>0.78?0.35*Math.min(1,(tod-0.78)/0.1):0;
 if(a>0){ctx.fillStyle='rgba(10,10,50,'+a+')';ctx.fillRect(0,0,CW,CH);}
 if(sn===3){ctx.fillStyle='rgba(200,220,255,0.07)';ctx.fillRect(0,0,CW,CH);}
}
// ---- mini harita ----
const mmBase=document.createElement('canvas');mmBase.width=MW;mmBase.height=MH;
let mmT=-99;
function drawMini(force){
 if(force||S.t-mmT>4){
  mmT=S.t;const x=mmBase.getContext('2d'),im=x.createImageData(MW,MH);
  const C={0:[90,150,60],1:[55,110,185],2:[40,100,40],3:[140,140,145],4:[130,90,80],5:[230,190,40],6:[60,130,60]};
  for(let i=0;i<NN;i++){const c=C[T[i]]||C[0];im.data[i*4]=c[0];im.data[i*4+1]=c[1];im.data[i*4+2]=c[2];im.data[i*4+3]=255;}
  x.putImageData(im,0,0);
 }
 mctx.imageSmoothingEnabled=false;mctx.drawImage(mmBase,0,0,96,96);
 for(const b of S.blds){mctx.fillStyle=b.team==='p'?'#4da3ff':b.team==='b'?'#ff3b3b':'#ddd';mctx.fillRect(b.x,b.y,b.w,b.h);}
 for(const u of S.units){if(u.team==='p')continue;mctx.fillStyle=TEAMCOL[u.team];mctx.fillRect(u.x-1,u.y-1,2,2);}
 const s=sc(),vw=CW/s,vh=CH/s;
 mctx.strokeStyle='#fff';mctx.lineWidth=1;mctx.strokeRect(S.cam.x-vw/2,S.cam.y-vh/2,vw,vh);
}
