'use strict';
// ===== YEMEK ÇEŞİTLİLİĞİ =====
// Türler: tahıl, sebze, et (ağıl), av, meyve, balık, ekmek. Son 1.5 günde üretilen/yenen tür sayısı.
function fvMark(c){if(!S)return;if(!S.fv)S.fv={};S.fv[c]=S.t;}
function foodVar(){if(!S||!S.fv)return 0;let n=0;for(const k in S.fv)if(S.t-S.fv[k]<DAY*1.5)n++;return n;}
{const _od=onDay;onDay=function(){_od();if(!S.founded)return;if(foodVar()<=2)S.varLow=(S.varLow||0)+1;else S.varLow=Math.max(0,(S.varLow||0)-2);};}

// ===== Yiyecek çeşitleri: günlük üretim dökümü =====
const FTYPES=[['ekmek','🍞','Ekmek'],['tahil','🌾','Buğday'],['sebze','🥕','Sebze'],['balik','🐟','Balık'],['et','🥩','Et (ağıl)'],['av','🦌','Av'],['meyve','🍎','Meyve']];
{const _od2=onDay;onDay=function(){_od2();if(S&&S.founded){S.fp=S.fd||{};S.fd={};}};}
function ftRate(k){if(k==='ekmek'){return S.fb||0;}const a=(S.fp&&S.fp[k])||0,b=(S.fd&&S.fd[k])||0;return Math.max(a,b);}
function foodRow(){
 let h='';
 for(const [k,ic,n] of FTYPES){
  if(k==='ekmek')continue;
  const r=ftRate(k);if(!r&&!(S.fv&&S.t-(S.fv[k]||-1e9)<DAY*1.5))continue;
  h+='<span class="chip sub" data-a="tab" data-v="res">'+ic+'<b>+'+Math.round(r)+'</b></span>';
 }
 return h?'<div class="row1 fsub">'+h+'<small style="color:#cdbb8a;align-self:center">/gün</small></div>':'';
}
function foodPanel(){
 let h='<h4>🍽 Yiyecek çeşitleri <small>(son günün üretimi)</small></h4><div class="flow">';
 for(const [k,ic,n] of FTYPES){
  if(k==='ekmek')continue;
  h+='<div class="fr"><span>'+ic+' '+n+'</span><span>+'+Math.round(ftRate(k)*10)/10+' /gün</span></div>';
 }
 return h+'</div><small>Toplam yiyecek ortak depoda tutulur. Çeşit arttıkça halk daha mutlu olur.</small>';
}
