'use strict';
// ===== KAYNAK AKIŞI: günlük üretim / tüketim / harcama takibi =====
const FL={},FLR={};let FLSPEND=false;
function flowReset(){RES.forEach(k=>{FL[k]={i:0,o:0,s:0};FLR[k]=[];});}
const resHandler={set(t,k,v){const d=v-(t[k]||0);const f=FL[k];if(f&&d){if(d>0)f.i+=d;else if(FLSPEND)f.s-=d;else f.o-=d;}t[k]=v;return true;}};
function trackRes(){flowReset();if(!S.res.__p)S.res=new Proxy(S.res,Object.assign({get(t,k){return k==='__p'?1:t[k];}},resHandler));}
function flowTick(){RES.forEach(k=>{const f=FL[k],r=FLR[k];if(!f)return;r.push([f.i,f.o,f.s]);if(r.length>DAY)r.shift();f.i=f.o=f.s=0;});}
function flowOf(k){const r=FLR[k]||[];let i=0,o=0,s=0;r.forEach(x=>{i+=x[0];o+=x[1];s+=x[2];});const sc=r.length>=5?DAY/r.length:0;return{i:i*sc,o:o*sc,s:s*sc,net:(i-o)*sc};}
(function(){
 const _pay=pay;pay=function(c){FLSPEND=true;try{_pay(c);}finally{FLSPEND=false;}};
 const _sell=sellRes;sellRes=function(k,n){FLSPEND=true;try{return _sell(k,n);}finally{FLSPEND=false;}};
 const _ng=newGame;newGame=function(a,b,c){const r=_ng(a,b,c);trackRes();return r;};
 const _lg=loadGame;loadGame=function(k){const r=_lg(k);if(r)trackRes();return r;};
})();
function fnum(v){const r=Math.round(v*10)/10;return (r>0?'+':'')+r;}
function pRes(){
 const cap=storeCap();
 let h='<h4>📦 Kaynaklar <small>(günlük değişim)</small></h4><div class="flow">';
 h+='<div class="fr fh"><span>Kaynak</span><span>Stok</span><span>Günlük</span></div>';
 RES.forEach(k=>{
  const f=flowOf(k),st=Math.floor(S.res[k]||0),net=f.net;
  let state,cls;
  if(f.i===0&&f.o===0&&f.s===0){state='—';cls='';}
  else if(net>=0.5){state='▲ '+fnum(net);cls='ok';}
  else if(net>-0.5){state='● '+fnum(net);cls='';}
  else{const days=st/-net;state='▼ '+fnum(net)+(days<99?' <small>('+Math.ceil(days)+' gün)</small>':'');cls=days<SL[3]?'bad':'warn';}
  h+='<div class="fr"><span>'+RI[k]+' '+RN[k]+'</span><span>'+st+(NOCAP[k]?'':'<small>/'+cap+'</small>')+'</span><span class="'+cls+'">'+state+'</span></div>';
 });
 h+='</div>'+(typeof foodPanel==='function'?foodPanel():'');
 const w=winterNeed();
 h+='<h4>❄ Kış hazırlığı</h4><small>'+SL[3]+' günlük kış için ≈ 🌲'+w.wood+' odun, 🍖'+w.food+' yiyecek gerekir. Şu an: 🌲'+Math.floor(S.res.wood)+' / 🍖'+Math.floor(S.res.food)+'.</small>';
 return h;
}
