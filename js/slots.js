'use strict';
// ===== KAYIT SLOTLARI, OYUN İÇİ MENÜ, NASIL OYNANIR =====
const SAVESL=[{k:'ky_save',n:'⚡ Hızlı Kayıt',q:1},{k:'ky_auto',n:'🔄 Otomatik Kayıt',auto:1},{k:'ky_s1',n:'Slot 1'},{k:'ky_s2',n:'Slot 2'},{k:'ky_s3',n:'Slot 3'},{k:'ky_s4',n:'Slot 4'},{k:'ky_s5',n:'Slot 5'}];
const SLOTUI={mode:'load',ingame:false};
const HOWTO='🗺 <b>Harita:</b> Sürükle, iki parmakla yakınlaştır. Birime dokun, boş yere dokunup yürüt.\n\n'
+'🔨 <b>Yapı:</b> Alt çubuktan bina seç, haritaya dokun. Önce Odun Kulübesi, Ev, Çiftlik ve Depo kur.\n\n'
+'👥 <b>Halk:</b> İşçileri mesleklere ata (oduncu, madenci, çiftçi, balıkçı, fırıncı, terzi…). Köylüyü seçip bir yere götürürsen kısa süre orada kalır, sonra işine döner.\n\n'
+'🍞 <b>Yiyecek:</b> Çeşit çeşit yiyecek halkı mutlu eder. Uzun süre tek tür yersen mutluluk düşer.\n\n'
+'❄ <b>Mevsimler:</b> Kışa odun ve yiyecekle hazırlan. Soğukta köylüler hastalanır.\n\n'
+'🛡 <b>Savunma:</b> Haydutlara karşı sur, kapı, kule ve ordu kur. Surlar kapıdan geçilir.\n\n'
+'🔬 <b>Araştırma:</b> Yeni teknolojiler üretimi ve orduyu güçlendirir.\n\n'
+'🕊 <b>Diplomasi:</b> Komşu krallıklarla ticaret, ittifak ya da savaş. Zayıf görünürsen saldırırlar.\n\n'
+'👑 <b>Hanedan:</b> Hükümdarın ve varislerin vardır. Kahramanlar savaşta seviye atlar.\n\n'
+'💾 <b>Kayıt:</b> Alt çubuktaki ⚡ Hızlı Kayıt tek dokunuşla kaydeder. ☰ Menü\'den slotlara kayıt alabilirsin.';
function slotsHTML(){
 return SAVESL.filter(s=>!(s.auto&&SLOTUI.mode==='save')).map(s=>{
  const i=saveInfo(s.k);
  const dis=(SLOTUI.mode==='load'&&!i)?' disabled':'';
  return '<button class="mb2" data-a="slot" data-v="'+s.k+'"'+dis+'>'+s.n+'<small>'+(i?i.txt+' · '+i.diff:'Boş')+'</small></button>';
 }).join('');
}
function showSlots(mode){
 SLOTUI.mode=mode;
 $('menuBtns').innerHTML='<div style="font-weight:700;color:#ffd88a;margin:6px 0">'+(mode==='save'?'💾 Kaydedilecek slotu seç':'📂 Yüklenecek kaydı seç')+'</div>'+slotsHTML()+'<button class="mb2" data-a="slotback">← Geri</button>';
 $('menu').style.display='flex';
}
function igMenu(){
 UI.menuOpen=true;SLOTUI.ingame=true;
 $('menuBtns').innerHTML='<button class="mb2" data-a="igresume">▶ Oyuna Dön</button>'
  +'<button class="mb2" data-a="igsave">💾 Slota Kaydet</button>'
  +'<button class="mb2" data-a="igload">📂 Kayıt Yükle</button>'
  +'<button class="mb2" data-a="mhow">📖 Nasıl Oynanır?</button>'
  +'<button class="mb2" data-a="msnd">'+(AUD.muted?'🔇 Ses: Kapalı':'🔊 Ses: Açık')+'</button>';
 $('menu').style.display='flex';
}
function igClose(){UI.menuOpen=false;SLOTUI.ingame=false;$('menu').style.display='none';}
(function(){
 const _a=act;
 act=function(a,v,w,el){
  switch(a){
   case 'igmenu':igMenu();return;
   case 'igresume':igClose();return;
   case 'igsave':showSlots('save');return;
   case 'igload':showSlots('load');return;
   case 'mhow':showModal('📖 Nasıl Oynanır?',HOWTO,[{t:'Tamam'}]);return;
   case 'mcont':SLOTUI.ingame=false;showSlots('load');return;
   case 'mnew':showMenu.conf=0;$('menu').style.display='none';MENUCB(false);return;
   case 'mdel':try{SAVESL.forEach(s=>localStorage.removeItem(s.k));}catch(e){}menuOptions();return;
   case 'slotback':if(SLOTUI.ingame)igMenu();else showMenu(true,MENUCB);return;
   case 'slot':{
    if(SLOTUI.mode==='save'){
     const ok=saveGame(v);log(ok?'💾 Kaydedildi: '+SAVESL.find(s=>s.k===v).n:'⛔ Kaydedilemedi');
     showSlots('save');return;}
    if(!saveInfo(v))return;
    if(SLOTUI.ingame){
     if(!loadGame(v)){log('⛔ Kayıt yüklenemedi');return;}
     igClose();UI.sel=null;UI.tab=null;UI.modalOpen=false;clampCam();buildBar();updHint();drawMini(true);updPanel(true);return;}
    $('menu').style.display='none';MENUCB(true,v);return;}
  }
  return _a(a,v,w,el);
 };
})();
// menüdeki "Nasıl oynanır" düğmesinden uzun yazıyı kaldır
(function(){const _o=menuOptions;menuOptions=function(){_o();const b=$('menuBtns').querySelector('[data-a=mhow] small');if(b)b.remove();};})();
