'use strict';
// ===== Kuşatma makineleri: koçbaşı ve mancınık (çizim + animasyon) =====
function siegeCrew(u,list,fire,moved){
 const sh=mfSheet(list.n,u.team==='b'?'#c62828':null,0.4);if(!sh)return;
 const fd=u.fdir||1,sz=1.5,cn=MFCNT[list.n]||[4,6,3];
 list.p.forEach(([ox,oy,ph])=>{
  const row=fire?2:(moved?1:0),n=row===2?(cn[2]||3):(row===1?cn[1]:cn[0]),fr=Math.floor((S.t+u.id*0.37+ph)*(fire?7:moved?10:3))%n;
  const cx=u.x+ox*fd,cy=u.y+oy+0.3-sz*(30/32);
  ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(cx,u.y+oy+0.3,0.22,0.08,0,0,6.3);ctx.fill();
  ctx.save();ctx.translate(cx,cy);if(fd<0)ctx.scale(-1,1);ctx.imageSmoothingEnabled=false;ctx.drawImage(sh,fr*32,row*32,32,32,-sz/2,0,sz,sz);ctx.restore();});
}
function hpBar(u,top){if(u.hp<u.mhp){ctx.fillStyle='#000a';ctx.fillRect(u.x-0.3,top,0.6,0.1);ctx.fillStyle=u.hp/u.mhp>0.4?'#4caf50':'#e53935';ctx.fillRect(u.x-0.3,top,0.6*u.hp/u.mhp,0.1);}}
function drawRam(u){
 const dx=u.x-(u.lx==null?u.x:u.lx);if(Math.abs(dx)>0.002)u.fdir=dx<0?-1:1;
 const moved=Math.hypot(dx,u.y-(u.ly==null?u.y:u.ly))>0.002;u.lx=u.x;u.ly=u.y;
 const rof=UT.kocbasi.rof||2.2,hit=u.cd>0&&u.cd>rof-0.5;
 const col=u.team==='b'?'#c62828':(u.team==='p'?'#3a6fd8':'#888');
 ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(u.x,u.y+0.3,0.55,0.12,0,0,6.3);ctx.fill();
 // iki asker arkada iter
 siegeCrew(u,{n:'SwordMan',p:[[-0.78,-0.02,0],[-0.55,0.24,1.3]]},hit,moved);
 ctx.save();ctx.translate(u.x,u.y+0.3);if((u.fdir||1)<0)ctx.scale(-1,1);ctx.scale(1/32,1/32);
 const R=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 // çatı çatkısı (A-şekli) ve kalkan
 R('#4b2f16',-12,-6,28,2);                 // taban
 R('#6b4423',-11,-18,3,13);R('#6b4423',12,-18,3,13);  // ayaklar
 R('#7a5230',-13,-22,30,5);R('#5a3a1c',-13,-18,30,2); // çatı
 for(let k=0;k<6;k++)R(k%2?'#8a5e36':'#6b4423',-12+k*5,-22,4,5);
 R(col,-13,-23,30,1.5);
 // sallanan kütük
 const sw=hit?Math.sin((1-(u.cd-(rof-0.5))/0.5)*3.14)*7:0;
 ctx.save();ctx.translate(sw,0);
 R('#5a3a1c',-17,-15,38,5);R('#7a5230',-17,-15,38,2);R('#3a2410',-17,-11,38,1.5);
 R('#9aa3ad',19,-16,6,7);R('#cfd6dd',19,-16,6,2);R('#5b636c',24,-14,2,3);
 ctx.restore();
 R('#3a2410',-4,-22,1.5,7);R('#3a2410',7,-22,1.5,7);   // askı zincirleri
 // tekerlekler
 const rot=moved?S.t*7:0;
 [-6,10].forEach(wx=>{ctx.fillStyle='#4b2f16';ctx.beginPath();ctx.arc(wx,-4,4.8,0,6.3);ctx.fill();ctx.fillStyle='#7a5230';ctx.beginPath();ctx.arc(wx,-4,3.4,0,6.3);ctx.fill();
  ctx.strokeStyle='#4b2f16';ctx.lineWidth=1;for(let k=0;k<3;k++){const a=rot+k*1.047;ctx.beginPath();ctx.moveTo(wx-Math.cos(a)*3.4,-4-Math.sin(a)*3.4);ctx.lineTo(wx+Math.cos(a)*3.4,-4+Math.sin(a)*3.4);ctx.stroke();}});
 if(hit){ctx.fillStyle='#ffe9a0aa';ctx.beginPath();ctx.arc(27,-13,3.5,0,6.3);ctx.fill();}
 ctx.restore();
 hpBar(u,u.y-0.55);
}
function drawCatapult(u){
 const dx=u.x-(u.lx==null?u.x:u.lx);if(Math.abs(dx)>0.002)u.fdir=dx<0?-1:1;
 const moved=Math.hypot(dx,u.y-(u.ly==null?u.y:u.ly))>0.002;u.lx=u.x;u.ly=u.y;
 const rof=UT.mancinik.rof||3.6,fire=u.cd>0&&u.cd>rof-0.45,load=u.cd>0&&!fire&&u.cd>rof*0.45?1:0;
 const col=u.team==='b'?'#c62828':(u.team==='p'?'#3a6fd8':'#888');
 ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(u.x,u.y+0.3,0.5,0.12,0,0,6.3);ctx.fill();
 siegeCrew(u,{n:'SpearMan',p:[[-0.7,0.02,0],[-0.45,0.26,1.6]]},fire||load,moved);
 ctx.save();ctx.translate(u.x,u.y+0.3);if((u.fdir||1)<0)ctx.scale(-1,1);ctx.scale(1/32,1/32);
 const R=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 // gövde
 R('#4b2f16',-12,-9,28,3);R('#6b4423',-12,-12,28,3);R(col,-12,-12,4,6);
 R('#6b4423',-6,-22,3,12);R('#6b4423',9,-22,3,12);R('#4b2f16',-8,-23,20,2);   // direkler
 // kol: bekleme açısı -> atışta ileri savrulur
 const t=fire?Math.min(1,(u.cd-(rof-0.45))/0.45):load?0:0;
 const ang=fire?(-1.0+ (1-t)*2.1):(load?-1.05:-0.95);
 ctx.save();ctx.translate(2,-21);ctx.rotate(ang);
 R('#7a5230',-3,-3,2,0);R('#8a5e36',-17,-2,34,3.5);R('#4b2f16',-17,1,34,1.2);
 ctx.fillStyle='#5a3a1c';ctx.fillRect(14,-6,8,6);ctx.fillStyle='#3a2410';ctx.fillRect(14,-6,8,1.5);   // kepçe
 if(!fire&&load){ctx.fillStyle='#7d7d86';ctx.beginPath();ctx.arc(18,-8,3.2,0,6.3);ctx.fill();}
 ctx.restore();
 R('#3a2410',-16,-22,2,2);R('#c9b38a',-17,-9,6,3);// karşı ağırlık çuvalı
 // tekerlekler
 const rot=moved?S.t*7:0;
 [-6,11].forEach(wx=>{ctx.fillStyle='#4b2f16';ctx.beginPath();ctx.arc(wx,-4,5,0,6.3);ctx.fill();ctx.fillStyle='#7a5230';ctx.beginPath();ctx.arc(wx,-4,3.6,0,6.3);ctx.fill();
  ctx.strokeStyle='#4b2f16';ctx.lineWidth=1;for(let k=0;k<3;k++){const a=rot+k*1.047;ctx.beginPath();ctx.moveTo(wx-Math.cos(a)*3.6,-4-Math.sin(a)*3.6);ctx.lineTo(wx+Math.cos(a)*3.6,-4+Math.sin(a)*3.6);ctx.stroke();}});
 if(fire){ctx.fillStyle='#ffd23c88';ctx.beginPath();ctx.arc(22,-26,3.5,0,6.3);ctx.fill();}
 ctx.restore();
 hpBar(u,u.y-0.7);
}
(function(){const _du=drawUnit;drawUnit=function(u){if(u.t==='kocbasi')return drawRam(u);if(u.t==='mancinik')return drawCatapult(u);return _du(u);};})();
