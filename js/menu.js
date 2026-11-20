'use strict';
// ===== ANA MENÜ, ZORLUK SEÇİMİ =====
let MENUCB=null;
function saveInfo(key){
 try{
  const raw=localStorage.getItem(key||'ky_save');if(!raw)return null;
  const d=JSON.parse(raw),o=JSON.parse(d.s);if(!o.dyn)return null;
  const df=DIFFS[o.diff||'normal'];
  const yd=df.sl[0]+df.sl[1]+df.sl[2]+df.sl[3];
  const day=Math.floor((o.t||0)/DAY);
  return {txt:o.dyn.ruler.name+' · '+AGES[o.age||0]+' · '+RANKS[o.rank||0]+' · Yıl '+(Math.floor(day/yd)+1)+' · Gün '+(day%yd+1),diff:df.n};
 }catch(e){return null;}
}
function showMenu(loaded,start){
 MENUCB=start;
 const si=loaded?saveInfo():null;
 const m=$('menu'),b=$('menuBtns');
 b.innerHTML='<button class="mb2" data-a="mnew">▶ Yeni Oyun</button>'
  +'<button class="mb2" data-a="mcont"'+(si?'':' disabled')+'>💾 Kayıtlı Oyun'+(si?'<small>'+si.txt+' · '+si.diff+'</small>':'<small>Kayıt bulunamadı</small>')+'</button>'
  +'<button class="mb2" data-a="mopt">⚙ Ayarlar</button>';
 $('menuFoot').textContent='Karakterler: Minifolks · Binalar: KayKit (CC0)';
 m.style.display='flex';
}
function menuOptions(){
 const b=$('menuBtns');
 b.innerHTML='<button class="mb2" data-a="msnd">'+(AUD.muted?'🔇 Ses: Kapalı':'🔊 Ses: Açık')+'</button>'
  +'<button class="mb2" data-a="mdel">🗑 Kayıtlı Oyunu Sil</button>'
  +'<button class="mb2" data-a="mhow">📖 Nasıl Oynanır?<small>Haritada sürükle, iki parmakla yakınlaştır. Yapılar menüsünden bina kur, Halk menüsünden işçi ata. Kışa hazırlan, haydutlara karşı kule ve ordu kur.</small></button>'
  +'<button class="mb2" data-a="mback">← Geri</button>';
}
function showDiff(cb,back){
 const L=$('diffList');
 L.innerHTML=['kolay','normal','zor','efsane'].concat((typeof META!=='undefined'&&META.ach&&META.ach.fort)?['destan']:[]).map(k=>{const d=DIFFS[k];return '<button class="dc '+k[0]+'" data-a="dpick" data-v="'+k+'"><b>'+d.ic+' '+d.n+'</b><small>'+d.sub+'</small><div>'+d.lines.join('<br>')+'</div></button>';}).join('');
 $('diffscr').style.display='flex';
 showDiff.cb=cb;showDiff.back=back;
}
(function(){
 const _ngs=newGameSetup;
 newGameSetup=function(after){
  UI.modalOpen=true;
  showDiff(k=>{
   _ngs(after);
   S.diff=k;applyDiff();
   const m=dif().res;['food','wood','stone','gold'].forEach(r=>{S.res[r]=Math.round(S.res[r]*m);});
  },null);
 };
 const _a=act;
 act=function(a,v,w,el){
  switch(a){
   case 'mnew':{const si=$('menuBtns').querySelector('[data-a=mcont]:not([disabled])');
    if(si&&!showMenu.conf){showMenu.conf=1;$('menuBtns').querySelector('[data-a=mnew]').innerHTML='⚠ Kayıtlı oyun silinecek. Onayla<small>Vazgeçmek için Kayıtlı Oyun\'a bas</small>';return;}
    showMenu.conf=0;$('menu').style.display='none';
    try{localStorage.removeItem('ky_save');}catch(e){}
    MENUCB(false);return;}
   case 'mcont':showMenu.conf=0;$('menu').style.display='none';MENUCB(true);return;
   case 'mopt':menuOptions();return;
   case 'mback':showMenu.conf=0;showMenu(!!saveInfo(),MENUCB);return;
   case 'msnd':audToggle();menuOptions();return;
   case 'mdel':try{localStorage.removeItem('ky_save');}catch(e){}menuOptions();log&&0;return;
   case 'mhow':return;
   case 'dpick':{$('diffscr').style.display='none';const cb=showDiff.cb;if(cb)cb(v);return;}
   case 'diffback':$('diffscr').style.display='none';UI.modalOpen=false;if(S&&!S.founded&&!MENUCB){}showMenu(!!saveInfo(),MENUCB);$('menu').style.display='flex';return;
  }
  return _a(a,v,w,el);
 };
})();
