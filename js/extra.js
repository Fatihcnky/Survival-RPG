'use strict';
// ===== EKSTRA: köylü kişilikleri, hanedan ağacı, isyan kararları, mevsimlik pazar fiyatları =====
const VT={calisk:{n:'Çalışkan',d:'+%12 toplama'},tembel:{n:'Tembel',d:'-%10 toplama'},cevik:{n:'Çevik',d:'+%12 hız'},saglam:{n:'Sağlam',d:'+%25 can'},cimri:{n:'Titiz',d:'+%6 toplama'}};
const VNAMES=['Aldo','Berta','Cuma','Dorya','Emre','Fenna','Gorin','Hilda','İlyas','Jora','Kemal','Leyla','Mirko','Nesrin','Osman','Petra','Ragnar','Selin','Tarik','Ulrika','Vedat','Wenna','Yusuf','Zerrin','Bran','Edda','Hakan','Mara','Orhan','Sibel','Toma','Yara','Alma','Dara','Kuzey','Lale','Rolf','Nora','Ceren','Boran'];
function vtMul(u){return u.pt==='calisk'?1.12:u.pt==='tembel'?0.9:u.pt==='cimri'?1.06:1;}
function vtAssign(u){
 u.nm=pick(VNAMES);const r=Math.random();
 u.pt=r<0.22?'calisk':r<0.34?'tembel':r<0.52?'cevik':r<0.66?'saglam':r<0.78?'cimri':null;
 if(u.pt==='saglam'){u.mhp=Math.round(u.mhp*1.25);u.hp=u.mhp;}
 if(!u.pt)u.pt=null;
}
(function(){const _uu=updUnit;updUnit=function(u,dt){if(u.team==='p'&&u.t==='koylu'&&u.nm===undefined)vtAssign(u);_uu(u,dt);};})();
// ---- hanedan ağacı ----
(function(){
 const _s=succession;succession=function(why){const D=S.dyn,o=D.ruler;D.line=D.line||[];D.line.push({name:o.name,female:o.female,trait:o.trait,from:D.rs||0,to:S.day,why:why});_s(why);D.rs=S.day;};
})();
function treeText(){
 const D=S.dyn,yr=d=>Math.floor(d/YEARD)+1;let h='<b>🏰 Hane '+D.house+'</b>\n';
 (D.line||[]).forEach((x,i)=>{h+='\n'+(i+1)+'. '+(x.female?'Leydi ':'Lord ')+x.name+' <small>('+yr(x.from)+'.–'+yr(x.to)+'. yıl · '+TRAITS[x.trait].n+')</small>';});
 const r=D.ruler;h+='\n\n👑 <b>'+rulerTitle()+' '+r.name+'</b> ('+r.age+') — '+TRAITS[r.trait].n+' · Sv.'+(r.lv||1)+(r.eqW||r.eqA?' · ekipman +'+((r.eqW||0)+(r.eqA||0)):'');
 if(D.spouse)h+='\n   💍 '+D.spouse.name+' ('+KINGS[D.spouse.from].n+')';
 D.heirs.forEach(x=>{h+='\n   '+(x.sib?'👥 kardeş ':'👶 varis ')+x.name+' ('+x.age+', '+TRAITS[x.trait].n+(x.lv>1?' · Sv.'+x.lv:'')+')';});
 if(!(D.line||[]).length)h+='\n\n<small>Henüz tahta geçen olmadı. Hükümdar ölünce soy burada listelenir.</small>';
 return h;
}
(function(){
 const _p=pDyn;pDyn=function(){return _p()+'<div class="row">'+btn('🌳 Hanedan Ağacı','tree')+'<small>Geçmiş hükümdarlar, eş ve varisler.</small></div>';};
})();
// ---- isyan kararı ----
function rebellionEvent(){
 S.rbCool=S.day+14;
 showModal('😠 Halk isyan eşiğinde!','Köylüler sokaklarda toplanıyor. Ne yapacaksın?',[
  {t:'Vergiyi indir + şenlik (60🍖 20💰)',fn:()=>{if(S.res.food>=60&&S.res.gold>=20){S.res.food-=60;S.res.gold-=20;S.taxRate=0;S.fest=Math.max(S.fest,4);S.happy=Math.min(100,S.happy+14);S.unrest=0;log('🕊 Halk sakinleşti.');}else{log('⛔ Kaynak yetmedi, öfke büyüdü.');S.unrest++;}}},
  {t:'Yiyecek dağıt (100🍖)',fn:()=>{if(S.res.food>=100){S.res.food-=100;S.happy=Math.min(100,S.happy+9);S.unrest=0;log('🍞 Halka yiyecek dağıtıldı.');}else{log('⛔ Yeterli yiyecek yok.');S.unrest++;}}},
  {t:'Gücünü göster',fn:()=>{let n=0;for(const u of S.units){if(n>=3)break;if(u.team==='p'&&u.t==='koylu'&&!u.dead){killU(u);n++;}}S.happy=Math.max(0,S.happy-6);S.unrest=0;log('⚔ İsyan bastırıldı: '+n+' köylü öldü, halk korkuyla sustu.');}}]);
}
// ---- mevsimlik pazar ----
const SEASMK={food:[1.1,1.0,0.8,1.35],wood:[1.0,0.95,1.0,1.4],stone:[1,1,1,0.95],iron:[1,1,1,1.1]};
function seasMul(k){return (SEASMK[k]||[1,1,1,1])[seas()];}
function seasTrend(k){const m=seasMul(k);return m>=1.1?'📈':m<=0.9?'📉':'';}
(function(){
 const _sp=sellPrice,_bp=buyPrice;
 sellPrice=function(k){return _sp(k)*seasMul(k);};
 buyPrice=function(k){return _bp(k)*seasMul(k);};
 const _od=onDay;onDay=function(){_od();if(S&&S.founded&&S.happy<28&&S.unrest>=2&&S.day>=(S.rbCool||0)&&!S.test)rebellionEvent();
  if(S&&S.founded&&seasonDay(S.day)===0&&S.day>0)log('🏪 Pazar: '+(['İlkbahar: yiyecek pahalı (hasat öncesi).','Yaz: fiyatlar dengeli.','Sonbahar: hasat bol, yiyecek ucuz — alım için iyi zaman.','Kış: yiyecek ve odun çok pahalı, satmak için iyi zaman.'][seas()]));};
 const _a=act;act=function(a,v,w,el){if(a==='tree'){showModal('🌳 Hanedan Ağacı',treeText(),[{t:'Tamam'}]);return;}return _a(a,v,w,el);};
})();
