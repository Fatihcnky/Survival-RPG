'use strict';
// ===== YENİ DÜNYA: harita genişlemesi, Büyük Keşif, yeni krallıklar =====
const BASE_W=224,BASE_H=224,BIG_W=360,BIG_H=360;
const NEWK=[
 {n:'Bozkır Konfederasyonu',who:'Kağan Börü',x:300,y:60,pers:'savasci',col:'#c9a227',d:'Göçebe atlı kabileler. Güçlüye saygı duyar, zayıfa baskın yapar.',fam:['Hatun Börte','Tegin Alp'],nw:1,cul:'bozkir',tint:'rgba(190,170,50,0.24)'},
 {n:'Kum Şehirleri Birliği',who:'Emir Zahid',x:60,y:300,pers:'acgozlu',col:'#e09a4a',d:'Zengin vaha şehirleri. Ordusu zayıf, kesesi dolu; ticaretle ikna olur.',fam:['Sultana Leyla','Şehzade Cemil'],nw:1,cul:'kum',tint:'rgba(235,205,120,0.32)'},
 {n:'Dağ Klanları',who:'Reis Thorgar',x:322,y:170,pers:'savasci',col:'#8e9aa8',d:'Dağlara kurulu, surlu klanlar. Gücü gösteren herkesi tanırlar.',fam:['Dişi Gudrun','Oğul Bjorn'],nw:1,cul:'dag',tint:'rgba(120,125,150,0.26)'},
 {n:'Ada Denizcileri',who:'Amiral Kestrel',x:180,y:318,pers:'dost',col:'#3fa7d6',d:'Kıyı limanlarının efendileri. Deniz ticaretiyle ve limanla kazanılır.',fam:['Kaptan Mira','Denizci Tavi'],nw:1,cul:'ada',tint:'rgba(60,165,195,0.22)'},
 {n:'Kadim Aldora Mirasçıları',who:'Sessiz Kraliçe Nehara',x:300,y:300,pers:'bilge',col:'#b18cff',d:'Eski Aldora\'nın gizli kolu. Kültür ve miras onları ikna eder.',fam:['Rahibe Isolde','Bilge Orin'],nw:1,cul:'aldora',tint:'rgba(160,110,210,0.24)'}
];
function resetWorld(){if(MW!==BASE_W||MH!==BASE_H)setWorld(BASE_W,BASE_H,false);if(KINGS.length>6)KINGS.length=6;}
function setWorld(w,h,remap){
 if(w===MW&&h===MH&&!remap)return;
 const oT=T,oRA=RA,oRoad=ROAD,oFog=FOG,ow=MW,oh=MH;
 MW=w;MH=h;NN=w*h;UNRE=new Float32Array(NN);tpS=new Int32Array(NN);GW=Math.ceil(MW/GC);
 gS=new Float32Array(NN);par=new Int32Array(NN);vis=new Int32Array(NN);clo=new Int32Array(NN);stamp=0;tpStamp=0;
 const nT=new Uint8Array(NN).fill(1),nRA=new Float32Array(NN),nR=new Uint8Array(NN),nF=new Uint8Array(NN);
 if(remap&&oT){for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){const a=y*ow+x,b=y*w+x;nT[b]=oT[a];nRA[b]=oRA[a];nR[b]=oRoad[a];nF[b]=oFog[a];}}
 T=nT;RA=nRA;ROAD=nR;FOG=nF;OCC=new Int32Array(NN);GATE=new Uint8Array(NN);
 SEEN=new Uint8Array(NN);for(let i=0;i<NN;i++)SEEN[i]=T[i]!==1?1:0;
 UGR=null;BGR=null;ugT=-9;
 if(typeof mmBase!=='undefined'){mmBase.width=MW;mmBase.height=MH;}
 if(typeof mmT!=='undefined')mmT=-9;
 if(S){S.units.forEach(u=>{u.path=null;u.trail=null;});if(remap)for(const b of S.blds)fillOcc(b,b.id);}
}
function worldRestoreKings(S2){
 if(KINGS.length>6)KINGS.length=6;
 const wk=(S2.world&&S2.world.kx)||[];wk.forEach(k=>KINGS.push(k));
}
// ---- yeni arazi üretimi ----
function worldCarve(x0,y0,x1,y1,wd){
 const put=(x,y)=>{for(let dy=-wd;dy<=wd;dy++)for(let dx=-wd;dx<=wd;dx++){const X=x+dx,Y=y+dy;if(inMap(X,Y)){const i=Y*MW+X;if(OCC[i])continue;T[i]=0;RA[i]=0;}}};
 let x=x0,y=y0;const sx=x1>x0?1:-1;while(x!==x1){put(x,y);x+=sx;}
 const sy=y1>y0?1:-1;while(y!==y1){put(x,y);y+=sy;}put(x,y);
}
function genNewWorld(){
 const nw=noise2(S.seed),nf=noise2(S.seed+77),rn=mulberry(S.seed+999);
 const isNew=(x,y)=>x>=BASE_W||y>=BASE_H;
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  if(!isNew(x,y))continue;const i=y*MW+x;
  const w=nw(x/9,y/9)*0.65+nw(x/4.5,y/4.5)*0.35,f=nf(x/6,y/6)*0.7+nf(x/3,y/3)*0.3;
  if(w<0.30)T[i]=1;else{T[i]=0;RA[i]=0;if(f>0.60&&rn()<0.62){T[i]=2;RA[i]=60;}}
 }
 // kıyı: eski haritanın kenar şeridini aç (yeni toprağa geçit)
 const clear=(cx,cy,r)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++)if(inMap(x,y)&&Math.hypot(x-cx,y-cy)<=r){const i=y*MW+x;if(OCC[i])continue;T[i]=0;RA[i]=0;}};
 NEWK.forEach(k=>clear(k.x,k.y,9));
 // yollar
 worldCarve(205,112,262,112,2);worldCarve(262,112,300,112,2);worldCarve(300,112,300,60,2);
 worldCarve(300,112,300,170,2);worldCarve(300,170,322,170,2);
 worldCarve(322,170,322,300,2);worldCarve(322,300,300,300,2);
 worldCarve(112,205,112,262,2);worldCarve(112,262,60,262,2);worldCarve(60,262,60,300,2);
 worldCarve(112,262,180,262,2);worldCarve(180,262,180,318,2);worldCarve(180,262,300,262,2);worldCarve(300,262,300,300,2);
 // bölgesel doku
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  if(!isNew(x,y))continue;const i=y*MW+x;
  const bz=Math.hypot(x-300,y-60)<50,km=Math.hypot(x-60,y-300)<55,dg=Math.hypot(x-322,y-170)<45;
  if((bz||km)&&T[i]===2&&rn()<0.85){T[i]=0;RA[i]=0;}
 }
 const AM={3:250,4:200,5:160,6:120};
 const cluster=(t,cx,cy,n)=>{for(let k=0;k<n;k++){const x=cx+Math.floor(rn()*5)-2,y=cy+Math.floor(rn()*5)-2;if(inMap(x,y)&&isNew(x,y)&&T[y*MW+x]!==1&&!OCC[y*MW+x]){T[y*MW+x]=t;RA[y*MW+x]=AM[t];}}};
 [[3,26],[4,20],[5,14],[6,34]].forEach(([t,n])=>{for(let k=0;k<n;k++){const x=ri(BASE_W-10,MW-5),y=ri(4,MH-5);cluster(t,x,y,t===6?5:6);}for(let k=0;k<n/2;k++){const x=ri(4,BASE_W),y=ri(BASE_H,MH-5);cluster(t,x,y,t===6?5:6);}});
 for(let k=0;k<14;k++)cluster(k%2?4:3,322+ri(-18,18),170+ri(-18,18),7);
 // erişilemeyen yeni kara => su
 const st=S.start,seen=new Uint8Array(NN),q=[st.y*MW+st.x];seen[q[0]]=1;
 for(let h=0;h<q.length;h++){const c=q[h],x=c%MW,y=(c/MW)|0;for(let d=0;d<4;d++){const nx=x+DX[d],ny=y+DY[d];if(!inMap(nx,ny))continue;const ni=ny*MW+nx;if(seen[ni]||T[ni]===1||(T[ni]>=3&&T[ni]<=5))continue;seen[ni]=1;q.push(ni);}}
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(!isNew(x,y))continue;const i=y*MW+x;if(!seen[i]&&T[i]!==1&&!(T[i]>=3&&T[i]<=5)){T[i]=1;RA[i]=0;}}
 SEEN=new Uint8Array(NN);for(let i=0;i<NN;i++)SEEN[i]=T[i]!==1?1:0;
}
// ---- genişleme ----
function expandWorld(){
 if(S.world)return;
 setWorld(BIG_W,BIG_H,true);
 S.world={t0:S.day,w:BIG_W,h:BIG_H,kx:[],reg:[]};
 genNewWorld();
 NEWK.forEach(k=>{
  const K=Object.assign({},k);KINGS.push(K);S.world.kx.push(K);S.world.reg.push({x:K.x,y:K.y,r:48,c:K.tint});
  const i=KINGS.length-1;
  S.kings.push({rel:{bilge:10,savasci:-15,acgozlu:0,dost:15}[K.pers]||0,str:20,pact:null,war:false,cool:0,lastComplaint:-99,lastWar:-99,nw:1,cul:K.cul});
  kInit(i);
  if(K.cul==='dag'){kWall(i);for(let j=0;j<4;j++)kBuild(i,'fkule');}
  if(K.cul==='bozkir')for(let j=0;j<5;j++)kSpawn(i,'atli');
  if(K.cul==='kum'){kdOf(i).gold=700;kdOf(i).food=300;}
  if(K.cul==='aldora')for(let j=0;j<3;j++)kBuild(i,'fkule');
 });
 S.pr=S.pr||{};
 revealC(236,112,14);revealC(112,236,14);
 for(let i=0;i<NN;i++)if(FOG[i]===2)FOG[i]=1;
 clampCam();
 showModal('🌍 YENİ DÜNYA','Büyük Keşif seferi döndü! Haritanın ötesinde engin topraklar var: doğuda bozkırlar, güneyde vahalar, kıyılarda limanlar, uzakta gizemli bir miras.\n\nBeş yeni halk var: Bozkır Konfederasyonu, Kum Şehirleri Birliği, Dağ Klanları, Ada Denizcileri ve Kadim Aldora Mirasçıları. Onlar seni imparator olarak tanımıyor. Kabul ettirmek için diplomasi menüsündeki "Kabul Ettirme" yollarını kullan.',[{t:'Keşfe çık'}]);
 log('🌍 Harita büyüdü: yeni krallıklar keşfedilebilir.');
}
// bölge tonu
function regionTint(xa,xb,ya,yb){
 const W=S.world;if(!W||!W.reg)return;
 for(const r of W.reg){
  if(r.x+r.r<xa||r.x-r.r>xb||r.y+r.r<ya||r.y-r.r>yb)continue;
  ctx.fillStyle=r.c;const r2=r.r*r.r;
  for(let y=Math.max(ya,r.y-r.r);y<=Math.min(yb,r.y+r.r);y++)for(let x=Math.max(xa,r.x-r.r);x<=Math.min(xb,r.x+r.r);x++){
   const dx=x-r.x,dy=y-r.y;if(dx*dx+dy*dy>r2)continue;const i=y*MW+x;if(T[i]===1||FOG[i]===0)continue;ctx.fillRect(x,y,1.02,1.02);}
 }
}
(function(){
 const _ng=newGame;newGame=function(seed){resetWorld();return _ng(seed);};
})();
