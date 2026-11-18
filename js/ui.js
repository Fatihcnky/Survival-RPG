'use strict';
// ===== ARAYÜZ: HUD, paneller, modal, eylemler =====
const $=id=>document.getElementById(id);
const UI={tab:null,sel:null,place:null,road:false,modalQ:[],modalOpen:false,hudT:0,lastPanel:''};
const SPEEDS=[1,2,4];

function uiLog(t,x,y){
 const el=document.createElement('div');el.textContent=t;
 if(x!=null){el.dataset.a='jump';el.dataset.x=x;el.dataset.y=y;el.style.cursor='pointer';}
 const l=$('log');l.appendChild(el);
 while(l.children.length>5)l.removeChild(l.firstChild);
 setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el);},10000);
}
function showModal(title,body,btns){UI.modalQ.push({title,body,btns:btns&&btns.length?btns:[{t:'Tamam'}]});if(!UI.modalOpen)nextModal();}
function nextModal(){
 const m=UI.modalQ.shift();
 if(!m){UI.modalOpen=false;$('modal').style.display='none';return;}
 UI.modalOpen=true;UI.curModal=m;
 $('mt').textContent=m.title;$('mb').innerHTML=String(m.body).replace(/\n/g,'<br>');
 $('mbtn').innerHTML=m.btns.map((b,i)=>'<button data-a="modal" data-v="'+i+'">'+b.t+'</button>').join('');
 $('modal').style.display='flex';
}
function uiReset(){UI.tab=null;UI.sel=null;UI.place=null;UI.road=false;UI.wall=null;UI.modalQ=[];UI.modalOpen=false;$('modal').style.display='none';$('log').innerHTML='';buildBar();updPanel(true);updHint();}

// ---------- yardımcılar ----------
function cstr(c){return Object.keys(c).map(k=>'<span style="color:'+((S.res[k]||0)>=c[k]?'#fff':'#ff8a80')+'">'+RI[k]+c[k]+'</span>').join(' ');}
function btn(label,a,v,dis,extra){return '<button data-a="'+a+'"'+(v!=null?' data-v="'+v+'"':'')+(extra?' data-w="'+extra+'"':'')+(dis?' class="dis"':'')+'>'+label+'</button>';}
function bar(p){return '<span class="bar"><i style="width:'+Math.round(clamp(p,0,1)*100)+'%"></i></span>';}
function dayText(){const d=curDay(),s=seasonOf(d);return 'Yıl '+(Math.floor(d/YEARD)+1)+' · '+SEASONS[s]+' '+(seasonDay(d)+1)+'/'+SL[s];}

// ---------- alt çubuk ----------
function buildBar(){
 let h='';
 if(!S.founded){h+=btn('🏛 Köyü Kur','found')+btn('👥 Hepsini Seç','selall');}
 else{
  h+=btn('🔨 Yapı','tab','build')+btn('👥 Halk','tab','people')+btn('⚔ Ordu','tab','army')+btn('🔬 Araştır','tab','tech')+btn('📈 İlerleme','tab','prog')+btn('👑 Hanedan','tab','dyn')+btn('🕊 Diplomasi','tab','dip')+btn('💱 Pazar','tab','mkt')+btn('📜 Görev','tab','quest')+btn('🛣 Yol','road');
 }
 h+=btn('⏩ x'+S.speed,'speed')+btn('💾','save');
 $('bar').innerHTML=h;
}
function updHint(){
 const hn=$('hint');
 if(UI.place){
  const d=BT[UI.place.t];
  hn.style.display='block';
  $('hinttxt').textContent=(UI.place.mv?d.n+' taşı: yeni yeri seç':UI.place.t==='tc'&&!S.founded?'Köyün kurulacağı yeri seç':d.n+': yeri seç')+(UI.place.x==null?' (haritaya dokun)':'');
  $('hintbtn').innerHTML=btn('✔ Onayla','confirm')+btn('✖ İptal','cancel');
 }else if(UI.road){
  hn.style.display='block';
  if(UI.wall){const n=(UI.wsel||[]).length,c=BT.duvar.cost;$('hinttxt').textContent='Sur: parmağınla hattı çiz ('+n+' kare'+(n?' · '+Object.keys(c).map(k=>RI[k]+c[k]*n).join(' '):'')+'). Onaylayınca inşa edilir. Kapı için Yapılar\'dan Sur Kapısı seç.';$('hintbtn').innerHTML=btn('✔ İnşa et','wconfirm',null,!n)+btn('↩ Geri al','wundo',null,!n)+btn('✖ Çık','wexit');}
  else{$('hinttxt').textContent='Yol: haritada parmağını sürükle (kare başı 1 odun)';$('hintbtn').innerHTML=btn('✖ Bitti','cancel');}
 }else hn.style.display='none';
}
function selInfo(){
 const el=$('selinfo');
 if(!UI.sel){el.style.display='none';return;}
 let t='';
 if(UI.sel.kind==='u'){
  const us=UI.sel.ids.map(id=>UM.get(id)).filter(Boolean);
  if(!us.length){UI.sel=null;el.style.display='none';return;}
  if(us.length===1){const u=us[0],d=UT[u.t];const j=u.job?JOBS.find(j=>j.id===u.job):null;t=d.g+' '+d.n+(j?' ('+j.n+')':'')+' — '+Math.ceil(u.hp)+'/'+u.mhp+' HP';}
  else t=us.length+' birim seçili';
 }
 el.textContent=t;el.style.display=t?'block':'none';
}

// ---------- paneller ----------
function pBuild(){
 let h='';
 if(!countB('tc',false))h+='<h4>Köy Meydanı</h4>'+row('tc');
 BCAT.forEach(([n,list])=>{h+='<h4>'+n+'</h4>';list.forEach(t=>{h+=row(t);});});
 h+='<h4>Yol</h4><div class="row">'+btn('🛣 Yol çiz','road')+'<small>Yollar yürüyüşü %50 hızlandırır. Kare başı 1 odun.</small></div>';
 return h;
}
function row(t){
 const d=BT[t],why=placeReason(t),dis=!!why;
 return '<div class="row">'+btn(d.ic+' '+d.n,'place',t,dis)+'<small>'+(why?'🔒 '+why:cstr(d.cost)+' · '+d.time+'sn')+'<br>'+d.d+'</small></div>';
}
function pPeople(){
 const n=villagerCount(),cap=popCap(),tc=S.blds.find(b=>b.t==='tc'&&b.team==='p'&&b.done);
 let h='<h4>Halk: '+n+' köylü · '+popNow()+'/'+cap+' nüfus · boşta: '+idleCount()+'</h4>';
 if(tc){h+='<div class="row">'+btn('🧑 Köylü çağır','train','koylu',false,tc.id)+btn('×5','train5','koylu',false,tc.id)+'<small>'+cstr(UT.koylu.cost)+' · kuyruk: '+tc.q.length+'</small></div>';}
 h+='<div class="row">'+btn('⚖ Otomatik dağıt','autojobs')+'<small>İş sırası: çiftçi → çoban → toplayıcı → oduncu → inşaatçı...</small></div>';
 {const hs=S.blds.filter(b=>b.team==='p'&&b.t==='ev'&&b.done),hh=households();if(hs.length){h+='<h4>🏘 Haneler ('+hs.length+')</h4><small>'+hs.slice(0,12).map(b=>famName(b)+' '+(b.lvl?'⭐':'')+hh.get(b.id)).join(' · ')+(hs.length>12?' …':'')+'<br>Ev seçip ⬆ ile taş eve yükselt (+4 kişi).</small>';}}
 JOBS.forEach(j=>{
  const cap=jobCap(j.id),want=S.jobs[j.id]||0,have=jobCount(j.id);
  h+='<div class="row">'+j.ic+' <b style="width:110px;display:inline-block">'+j.n+'</b>'+btn('−','jm',j.id)+'<span style="min-width:44px;text-align:center">'+have+'/'+want+'</span>'+btn('+','jp',j.id)+'<small>'+(j.bt&&cap===0?'🔒 '+BT[j.bt].n+' gerekli':j.d+(j.bt?' · yuva: '+cap+' ('+countB(j.bt,true)+' bina)':''))+'</small></div>';
 });
 return h;
}
function pArmy(){
 const sd=soldiers();const cnt={};sd.forEach(u=>cnt[u.t]=(cnt[u.t]||0)+1);
 let h='<h4>Ordu: '+sd.length+' asker'+(sd.length?' ('+Object.keys(cnt).map(k=>UT[k].g+cnt[k]).join(' ')+')':'')+'</h4>';
 h+='<div class="row">'+btn('Tüm orduyu seç','selarmy')+btn('🏠 Geri çekil','retreat')+'<small>Seçince haritaya dokun: yürü/saldır. Düşmana dokun: hedef al.</small></div>';
 ['mizrakli','kilic','okcu','atliokcu','atli','top'].forEach(t=>{
  const d=UT[t],b=bestTrainer(t),why=canTrain(t)||(b?'':BT[Object.keys(BT).find(k=>BT[k].train&&BT[k].train.includes(t))].n+' gerekli');
  h+='<div class="row">'+btn(d.g+' '+d.n,'train',t,!!why,b?b.id:0)+btn('×5','train5',t,!!why,b?b.id:0)+'<small>'+(why?'🔒 '+why:cstr(d.cost)+' · '+d.time+'sn')+'<br>❤'+d.hp+' ⚔'+d.atk+' 🛡'+d.arm+'</small></div>';
 });
 h+=milPanel();
 return h;
}
function pTech(){
 let h='<h4>Araştırma'+(S.research?': '+TECH[S.research.id].n+' '+Math.ceil(S.research.left)+'sn':'')+'</h4>';
 let any=false;
 for(const id in TECH){
  const t=TECH[id];if(S.techs[id]||t.age>S.age)continue;any=true;
  h+='<div class="row">'+btn(t.n,'tech',id,!!S.research||!afford(t.cost))+'<small>'+cstr(t.cost)+' · '+t.time+'sn<br>'+t.d+'</small></div>';
 }
 if(!any)h+='<small>Şu an araştırılacak teknoloji yok. Çağ atla!</small>';
 const done=Object.keys(S.techs).map(id=>TECH[id].n).join(', ');
 if(done)h+='<h4>Tamamlananlar</h4><small>'+done+'</small>';
 return h;
}
function checks(l){return l.map(c=>'<div>'+(c.ok?'✅':'❌')+' '+c.t+'</div>').join('');}
function pProg(){
 let h='<h4>'+AGES[S.age]+' · '+RANKS[S.rank]+' ('+TITLES[S.rank]+')</h4>';
 const a=ageInfo();
 if(S.ageProg)h+='<div class="row">🌟 Çağ atlanıyor: '+Math.ceil(S.ageProg.left)+'sn '+bar(1-S.ageProg.left/AGEUP[S.ageProg.to].time)+'</div>';
 else if(a)h+='<h4>Sonraki çağ: '+AGES[a.n]+'</h4>'+checks(a.checks)+'<div class="row">'+btn('🌟 Çağ atla','ageup',null,!a.ok)+'<small>'+cstr(a.a.cost)+' · '+a.a.time+'sn</small></div>';
 else h+='<small>Son çağdasın.</small>';
 const r=rankInfo();
 if(r)h+='<h4>Sonraki ünvan: '+RANKS[r.n]+'</h4>'+checks(r.checks)+'<div class="row">'+btn('👑 Ünvan al','rankup',null,!r.ok)+'<small>Ödül: '+costText(r.r.reward)+'</small></div>';
 else h+='<h4>Krallık ünvanına ulaştın!</h4>';
 h+='<h4>İstatistik</h4><small>Yıkılan haydut kampı: '+S.stats.camps+' · Öldürülen düşman: '+S.stats.kills+' · Kayıp: '+S.stats.lost+' · Baskın: '+S.stats.raids+'</small>';
 return h;
}
function pDip(){
 if(!elcilikOk())return '<h4>Diplomasi</h4><small>Önce bir 🕊 Elçilik inşa etmelisin (Üretim & Şehir).</small>';
 let h='<h4>Komşu krallıklar</h4>';
 KINGS.forEach((k,i)=>{
  const s=S.kings[i];
  if(s.dead){h+='<div style="margin:6px 0;padding:6px;border:1px dashed #666;border-radius:8px;opacity:.7">⚰ <b>'+k.n+'</b> — yok oldu'+(s.fall==='b'?' <small>(haydutlar yıktı; komşular azalırsa yeniden doğabilir)</small>':'')+'</div>';return;}
  h+='<div style="margin:6px 0;padding:6px;border:1px solid '+k.col+';border-radius:8px"><b>'+k.n+'</b> — '+k.who+'<br><small>'+k.d+'</small><br>İlişki: '+Math.round(s.rel)+' '+bar((s.rel+100)/200)+' · Durum: '+(s.war?'⚔ SAVAŞ':s.pact==='ittifak'?'🤝 İttifak':s.pact?'📜 Ticaret':'—')+'<div class="row">';
  h+=btn('🎁 Hediye (50💰)','gift',i,S.res.gold<50);
  if(!S.dyn.spouse&&!s.war)h+=btn('💍 Evlilik (150💰)','marry',i,s.rel<30||S.res.gold<150);
  if(!s.war)h+=btn('⚔ Savaş ilan et','dwar',i);
  if(s.war)h+=btn('🕊 Barış ('+peaceCost(i)+'💰)','peace',i,S.res.gold<peaceCost(i));
  else if(!s.pact)h+=btn('📜 Ticaret (100💰)','treaty',i,s.rel<15||S.res.gold<100);
  else if(s.pact==='ticaret')h+=btn('🤝 İttifak (200💰 150🍖)','ally',i,s.rel<45||S.res.gold<200||S.res.food<150);
  h+='</div>'+(!s.pact&&!s.war?'<small>Ticaret için ilişki ≥15, ittifak için ≥45 gerekir.</small>':'')+'</div>';
 });
 return h;
}
function pMkt(){
 if(!countB('pazar',true))return '<h4>Pazar</h4><small>Önce bir 🏪 Pazar inşa etmelisin.</small>';
 let h='<h4>Pazar (altın: '+Math.floor(S.res.gold)+')</h4>';
 ['food','wood','stone','iron'].forEach(k=>{
  h+='<div class="row"><b style="width:90px;display:inline-block">'+RI[k]+' '+RN[k]+'</b>'+btn('Sat 50','sell',k,S.res[k]<50)+btn('Al 50','buy',k,S.res.gold<Math.ceil(buyPrice(k)*50))+'<small>Sat: '+sellPrice(k).toFixed(2)+'💰 · Al: '+buyPrice(k).toFixed(2)+'💰 (birim)</small></div>';
 });
 return h;
}
function pDyn(){
 const D=S.dyn,r=D.ruler;
 let h='<h4>👑 Hane '+D.house+'</h4>';
 h+='<div><b>'+rulerTitle()+' '+r.name+'</b> ('+r.age+') — '+TRAITS[r.trait].n+'<br><small>'+TRAITS[r.trait].d+'</small></div>';
 h+='<div class="row">'+(heroOf('ruler')?btn('🏠 Saraya çağır','unhero','ruler'):btn('⚔ Orduya çağır','hero','ruler',!mainTC()))+'<small>Hükümdar komutan olur: yakındaki askerlere +%15 saldırı, öldürdükçe seviye atlar. Savaşta düşerse tahtı kaybedersin!</small></div>';
 h+=heroBox('ruler',r);
 h+=D.spouse?'<div style="margin-top:4px">💍 Eş: <b>'+D.spouse.name+'</b> ('+D.spouse.age+') — '+KINGS[D.spouse.from].n+'</div>':'<div style="margin-top:4px"><small>💍 Evli değilsin. Komşu hanedanlarla ilişkiyi artır, evlilik teklifi gelebilir ya da Diplomasi\'den teklif et.</small></div>';
 h+='<div style="margin-top:4px">👶 Varisler (evli değilsen tahta kardeşin geçer): '+(D.heirs.length?D.heirs.map(x=>(x.sib?'Kardeşin ':'')+x.name+' ('+x.age+', '+TRAITS[x.trait].n+')').join(' · '):'<small>yok</small>')+'</div>';
 D.heirs.filter(x=>x.age>=HEROAGE).forEach(x=>{h+='<div class="row">'+(heroOf('heir:'+x.name)?btn('🏠 '+x.name+' saraya','unhero','heir:'+x.name):btn('⚔ '+x.name+' orduya','hero','heir:'+x.name,!mainTC()))+'<small>Varis komutan olarak savaşabilir.</small></div>'+heroBox('heir:'+x.name,x);});
 {const kid=D.heirs.filter(x=>x.age<HEROAGE+2).sort((a,b)=>b.age-a.age)[0];if(kid)h+='<div class="row">'+btn('🎓 Eğitim: '+kid.name+' (120💰, +2 yaş)','edu',null,(D.eduCool||0)>0||S.res.gold<120)+'<small>'+((D.eduCool||0)>0?'Bekleme: '+D.eduCool+' hanedan yılı':'Usta öğretmenler varisi hızla yetiştirir.')+'</small></div>';}
 h+='<div><small>⏳ Hanedan hızı: 1 hanedan yılı = '+DYT+' gün (varisler ve hükümdar bu hızla yaşlanır). '+HEROAGE+' yaşında komutan olabilirler.</small></div>';
 if(D.crisis>0)h+='<div style="color:#ff8a80">⚠ Hanedan krizi sürüyor.</div>';
 const hp=Math.round(S.happy);
 h+='<h4>🙂 Halk mutluluğu: '+hp+' '+bar(hp/100)+'</h4><small>'+(hp>=65?'Göçmenler gelir, verim yüksek.':hp<20?'Halk isyana yakın!':'Verim: x'+happyMul().toFixed(2))+'</small>';
 h+='<div style="font-size:12px;margin:3px 0">'+happyFactors().map(x=>'<span style="color:'+(x[1]>=0?'#9be59b':'#ff9a9a')+';margin-right:8px;display:inline-block">'+x[0]+' '+(x[1]>0?'+':'')+x[1]+'</span>').join('')+'</div>';
 h+='<div class="row">'+btn('💰 Vergi: '+TAXN[S.taxRate],'tax')+'<small>Düşük: mutluluk +8, gelir x0.5 · Yüksek: mutluluk -12, gelir x1.8</small></div>';
 h+='<div class="row">'+btn('🎉 Şenlik (80🍖 30💰)','fest',null,D.festCool>0||S.res.food<80||S.res.gold<30)+'<small>'+(D.festCool>0?'Bekleme: '+D.festCool+' gün':'6 gün mutluluk +15')+'</small></div>';
 return h;
}
function pQuest(){
 const s=STORY[S.story];
 let h='<h4>📜 Görev '+Math.min(S.story+1,STORY.length)+'/'+STORY.length+'</h4>';
 h+=s?'<div>'+(s.ch?'<b>'+s.ch+'</b><br>':'')+s.t+(s.r?'<br><small>Ödül: '+costText(s.r)+'</small>':'')+'</div>':'<div>Tüm görevleri tamamladın! 🏆</div>';
 return h;
}
function households(){
 const hs=S.blds.filter(b=>b.team==='p'&&b.t==='ev'&&b.done);
 const cap=hs.reduce((a,b)=>a+5+(b.lvl?4:0),0),pop=popNow();
 let left=Math.min(pop,cap);const out=new Map();
 hs.forEach(b=>{const c=5+(b.lvl?4:0),n=Math.min(c,Math.round(Math.min(pop,cap)*c/Math.max(1,cap)));out.set(b.id,n);left-=n;});
 for(const b of hs){if(left<=0)break;const c=5+(b.lvl?4:0);if(out.get(b.id)<c){out.set(b.id,out.get(b.id)+1);left--;}}
 return out;
}
function famName(b){if(!b.fam)b.fam=pick(MNAMES.concat(FNAMES));return b.fam;}
const MOVEIC='<svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align:-3px"><path d="M12 1l4 4h-3v6h6V8l4 4-4 4v-3h-6v6h3l-4 4-4-4h3v-6H5v3l-4-4 4-4v3h6V5H8z" fill="#fff"/></svg>';
function pSel(){
 const b=BM.get(UI.sel.id);if(!b)return '';
 const d=BT[b.t];
 let h='<h4>'+d.ic+' '+d.n+(b.done?'':' (inşaat %'+Math.round(b.prog*100)+')')+'</h4><small>'+d.d+'<br>❤ '+Math.ceil(b.hp)+'/'+b.mhp+(b.fire>0?' · 🔥 yanıyor':'')+'</small>';
 if(b.team==='p'&&!b.done){h+='<div class="row">'+btn(b.pri?'⭐ Öncelik: AÇIK':'☆ Öncelikli inşa et','pri',b.id)+btn('✖ İptal ('+(b.prog<0.02?'tam iade':'%50 iade')+')','cancelb',b.id)+'</div><small>Öncelikli binayı işçiler ve taşıyıcılar diğerlerinden önce yapar.</small>';}
 if(b.team==='p'&&b.done&&(b.t==='oduncu'||b.t==='maden')){
  const jid=b.t==='oduncu'?'lum':'mine',have=jobCount(jid),mine=S.units.filter(u=>u.wb===b.id&&u.job===jid&&!u.dead).length;
  if(b.t==='oduncu')h+='<div>🪓 Kulübe bonusu: tüm odun toplama <b>+%'+Math.round((hutBonus()-1)*100)+'</b> (her kulübe +%10, en çok +%30)</div>';
  if(b.t==='maden'&&(b.ore==='auto'))h+='<div>⚖ Şu an çıkarılan: <b>'+RN[autoOre(b)]+'</b></div>';
  h+='<div>👷 Çalışan: <b>'+mine+'/'+SLOTS[b.t]+'</b> · 📦 Kulübe stoğu: '+Math.round(b.buf||0)+'/'+HUTCAP+' <small>(dolunca işçiler depoya taşır)</small></div>';
  if(b.t==='maden'){h+='<div class="row"><b>Çıkarılacak maden:</b>'+['auto','stone','iron','gold'].map(o=>'<button data-a="ore" data-v="'+b.id+'" data-w="'+o+'"'+((b.ore||'stone')===o?' style="background:#6a4e22;border-color:#ffd070"':'')+'>'+(o==='auto'?'⚖ Dengeli':RI[o]+' '+RN[o])+'</button>').join('')+'</div><small>Bu kulübedeki işçiler seçtiğin madeni çıkarır. ⚖ Dengeli: stoğu en az olan madeni (taş/demir/altın) otomatik seçer.</small>';}
  h+='<div class="row">'+btn('➕ İşçi ekle','jp',jid)+btn('➖ İşçi çıkar','jm',jid)+'<small>Toplam '+jid+' işçi: '+have+'/'+(S.jobs[jid]||0)+' (Halk menüsünden de ayarlanır)</small></div>';
 }
 if(b.team==='p'&&b.done&&b.t==='ciftlik'){const cr=b.crop||'bugday';
  h+='<div class="row"><b>Ekin:</b>'+[['bugday','🌾 Buğday'],['sebze','🥕 Sebze'],['keten','🌿 Keten']].map(o=>'<button data-a="crop" data-v="'+b.id+'" data-w="'+o[0]+'"'+(cr===o[0]?' style="background:#6a4e22;border-color:#ffd070"':'')+'>'+o[1]+'</button>').join('')+'</div><small>🌾 Buğday: en çok yiyecek (yaz/sonbahar), kışın durur. 🥕 Sebze: daha az ama kışın da verir. 🌿 Keten: yiyecek yerine terzi için kumaşlık lif.</small>';}
 if(b.team==='p'&&b.done&&b.t==='terzi')h+='<div>🧥 Giyim: <b>'+Math.floor(S.res.giyim||0)+'</b> · '+RI.deri+' Deri: '+Math.floor(S.res.deri||0)+' · 🌿 Keten: '+Math.floor(S.res.keten||0)+'</div>';
 if(b.team==='p'&&b.done&&SLOTS[b.t]&&b.t!=='oduncu'&&b.t!=='maden'){const jo=JOBS.find(j=>j.bt===b.t);if(jo){const n=S.units.filter(u=>u.wb===b.id&&u.job===jo.id&&!u.dead).length;h+='<div>👷 Çalışan: <b>'+n+'/'+SLOTS[b.t]+'</b> ('+jo.n+')</div>';}}
 if(b.team==='p'&&b.done&&b.t==='demirci'){
  const mk=b.mk||'auto',opts=[['auto','⚙ Otomatik'],['alet','🔨 Alet'],['silah','🗡 Silah'],['zirh','🛡 Zırh'],['off','⏸ Durdur']];
  h+='<div class="row"><b>Üretim:</b>'+opts.map(o=>'<button data-a="mk" data-v="'+b.id+'" data-w="'+o[0]+'"'+(mk===o[0]?' style="background:#6a4e22;border-color:#ffd070"':'')+'>'+o[1]+'</button>').join('')+'</div><small>Alet: 1 demir+1 odun → 2 alet · Silah: 2 demir+2 odun · Zırh: 2 demir+2 deri. Otomatik, dengeli üretir ve stok sınırı koyar; seçili modda sınırsız üretir.</small>';
 }
 if(b.team==='p'&&b.done&&b.t==='ev'){const n=households().get(b.id)||0,kids=Math.round(n*0.35);h+='<div>👪 <b>'+famName(b)+' Hanesi</b>: '+n+' kişi ('+(n-kids)+' yetişkin, '+kids+' çocuk)'+(b.lvl?' · ⭐ Taş ev':'')+'</div>';}
 if(b.team==='p'&&b.done&&UPG[b.t]){const u=UPG[b.t];if(b.lvl)h+='<div>⭐ '+u.n+' (yükseltildi)</div>';else{const why=u.age>S.age?'Çağ: '+AGES[u.age]:'';h+='<div class="row">'+btn('⬆ '+u.n,'upg',b.id,!!why||!afford(u.cost))+'<small>'+(why?'🔒 '+why:u.d+' '+cstr(u.cost))+'</small></div>';}}
 if(b.team==='p'&&b.done){
  trainList(b).forEach(t=>{const u=UT[t],why=canTrain(t);h+='<div class="row">'+btn(u.g+' '+u.n,'train',t,!!why,b.id)+btn('×5','train5',t,!!why,b.id)+'<small>'+(why?'🔒 '+why:cstr(u.cost))+'</small></div>';});
  if(b.q.length)h+='<small>Kuyruk: '+b.q.map(q=>UT[q.u].g).join(' ')+'</small>';
  if(b.t!=='tc')h+='<div class="row">'+btn(MOVEIC+' Taşı','move',b.id)+btn('🗑 Yık (iade %50)','demolish',b.id)+'</div>';
 }
 if(b.team==='b')h+='<small>Düşman kampı! Askerlerinle saldır.</small>';
 return h;
}
function updPanel(force){
 const p=$('panel');
 let h='';
 if(UI.sel&&UI.sel.kind==='b')h=pSel();
 else if(UI.tab)h={build:pBuild,people:pPeople,army:pArmy,tech:pTech,prog:pProg,dip:pDip,mkt:pMkt,quest:pQuest,dyn:pDyn,res:pRes}[UI.tab]();
 if(!h){p.style.display='none';UI.lastPanel='';return;}
 h='<div style="text-align:right">'+btn('✖ Kapat','closep')+'</div>'+h;
 if(h!==UI.lastPanel||force){p.innerHTML=h;UI.lastPanel=h;}
 p.style.display='block';
}
function updHud(){
 const cap=storeCap();
 let h='';
 if(S.founded)RES.forEach(k=>{if(HIDE0[k]&&S.res[k]<0.5)return;h+='<span>'+RI[k]+Math.floor(S.res[k])+(NOCAP[k]?'':'/'+cap)+'</span>';});
 else h+='<span>🍖'+Math.floor(S.res.food)+'</span><span>🌲'+Math.floor(S.res.wood)+'</span><span>🧱'+Math.floor(S.res.stone)+'</span><span>💰'+Math.floor(S.res.gold)+'</span>';
 h+='<br><span>👥 '+popNow()+'/'+popCap()+'</span><span>🙂'+Math.round(S.happy)+'</span><span>📅 '+dayText()+'</span><span>'+AGES[S.age]+' · '+RANKS[S.rank]+'</span>';
 if(S.epi)h+='<span>🤒</span>';
 if(S.drought>0)h+='<span>☀</span>';
 if(S.starve>0)h+='<span style="color:#ff8a80">☠ AÇLIK</span>';
 if(S.cold>0)h+='<span style="color:#9fd">🥶 DONMA</span>';
 if(S.ageProg)h+='<span>🌟'+Math.ceil(S.ageProg.left)+'sn</span>';
 if(S.research)h+='<span>🔬'+Math.ceil(S.research.left)+'sn</span>';
 const st=STORY[S.story];
 if(S.founded&&st)h+='<br><span style="white-space:normal;color:#ffe082">📜 '+st.t+'</span>';
 else if(!S.founded)h+='<br><span style="white-space:normal;color:#ffe082">📜 '+STORY[0].t+'</span>';
 const top=$('top');top.innerHTML=h;
 const y=top.offsetHeight+4;$('mm').style.top=y+'px';$('log').style.top=y+'px';
}

// ---------- eylemler ----------
function openTab(t){UI.sel=UI.sel&&UI.sel.kind==='b'?null:UI.sel;UI.tab=UI.tab===t?null:t;updPanel(true);}
function act(a,v,w,el){
 switch(a){
  case 'tab':openTab(v);break;
  case 'closep':UI.tab=null;if(UI.sel&&UI.sel.kind==='b')UI.sel=null;updPanel(true);break;
  case 'modal':{const m=UI.curModal;const b=m&&m.btns[+v];nextModalAfter(b);break;}
  case 'jump':S.cam.x=+el.dataset.x;S.cam.y=+el.dataset.y;break;
  case 'speed':S.speed=SPEEDS[(SPEEDS.indexOf(S.speed)+1)%SPEEDS.length];buildBar();break;
  case 'save':log(saveGame('ky_save')?'💾 Hızlı kayıt alındı.':'⛔ Kaydedilemedi.');break;
  case 'found':UI.place={t:'tc',x:null,y:null};{const u=S.units.find(u=>u.team==='p');if(u){UI.place.x=Math.floor(u.x)-1;UI.place.y=Math.floor(u.y)+2;}}UI.tab=null;updPanel(true);updHint();break;
  case 'selall':UI.sel={kind:'u',ids:S.units.filter(u=>u.team==='p').map(u=>u.id)};break;
  case 'place':if(v==='duvar'){UI.wall=v;UI.road=true;UI.place=null;UI.tab=null;UI.wsel=[];UI.wstack=[];UI.wlx=null;updPanel(true);updHint();break;}UI.wall=null;UI.place={t:v,x:null,y:null};UI.road=false;UI.tab=null;updPanel(true);updHint();break;
  case 'confirm':doConfirm();break;
  case 'move':{const b=BM.get(+v);if(b&&b.done&&b.team==='p'&&b.t!=='tc'){UI.place={t:b.t,mv:b.id,x:b.x,y:b.y};UI.sel=null;UI.tab=null;updPanel(true);updHint();}break;}
  case 'wconfirm':{let n=0,fail=0;for(const k of (UI.wsel||[])){const x=k%MW,y=(k/MW)|0;if(!canPlace('duvar',x,y)){fail++;continue;}if(!afford(BT.duvar.cost)){log('⛔ Kaynak yetersiz, '+(UI.wsel.length-n-fail)+' kare kaldı.');break;}if(placeBuilding('duvar',x,y))n++;}UI.wsel=[];UI.wstack=[];UI.road=false;UI.wall=null;log('🧱 '+n+' sur karesi inşaata başladı.');updHint();updPanel(true);break;}
  case 'wundo':{const b=(UI.wstack||[]).pop();if(b)UI.wsel=UI.wsel.filter(k=>!b.includes(k));else UI.wsel=[];updHint();break;}
  case 'wexit':UI.wsel=[];UI.wstack=[];UI.road=false;UI.wall=null;updHint();updPanel(true);break;
  case 'cancel':UI.place=null;UI.road=false;UI.wall=null;UI.wsel=[];updHint();break;
  case 'road':UI.wall=null;UI.road=true;UI.place=null;UI.tab=null;updPanel(true);updHint();break;
  case 'train':{const b=BM.get(+w)||bestTrainer(v);if(b)enqueue(b,v,1);break;}
  case 'train5':{const b=BM.get(+w)||bestTrainer(v);if(b)enqueue(b,v,5);break;}
  case 'autojobs':autoJobs();balanceJobs();break;
  case 'jm':S.jobs[v]=Math.max(0,(S.jobs[v]||0)-1);balanceJobs();break;
  case 'jp':{const cap=jobCap(v);if((S.jobs[v]||0)<cap){S.jobs[v]=(S.jobs[v]||0)+1;balanceJobs();}else log('⛔ Bu iş için yuva yok'+(JOBBT[v]?': '+BT[JOBBT[v]].n+' inşa et.':'.'));break;}
  case 'tech':startResearch(v);break;
  case 'ageup':startAgeUp();break;
  case 'rankup':doRankUp();break;
  case 'dwar':{const i=+v;showModal('⚔ Savaş ilanı',KINGS[i].n+' krallığına savaş ilan etmek istediğine emin misin? Ordusu sana saldıracak, ittifak/anlaşma bozulur. Barışı altınla satın alabilirsin. Savaştayken onların köylerine de saldırabilirsin.',[{t:'Savaş ilan et',fn:()=>{declareWar(i,true);updPanel(true);}},{t:'Vazgeç'}]);break;}
  case 'gift':giftK(+v);break;
  case 'treaty':treatyK(+v);break;
  case 'ally':allyK(+v);break;
  case 'peace':peaceK(+v);break;
  case 'sell':sellRes(v,50);break;
  case 'buy':buyRes(v,50);break;
  case 'tax':setTax();break;
  case 'hskill':heroSkill(v,w);updPanel(true);break;
  case 'hero':summonHero(v);break;
  case 'unhero':dismissHero(v);break;
  case 'fest':holdFestival();break;
  case 'callmil':callMilitia();updPanel(true);break;
  case 'relmil':releaseMilitia();updPanel(true);break;
  case 'edu':eduHeir();break;
  case 'marry':proposeMarriage(+v);break;
  case 'selarmy':UI.sel={kind:'u',ids:soldiers().map(u=>u.id)};UI.tab=null;updPanel(true);break;
  case 'retreat':{const tc=mainTC();if(tc)cmdMove(soldiers(),tc.x+tc.w/2,tc.y+tc.h+1,false);break;}
  case 'mk':{const b=BM.get(+v);if(b&&b.t==='demirci'){b.mk=w;log('⚒ Demirhane üretimi: '+({auto:'otomatik',alet:'alet',silah:'silah',zirh:'zırh',off:'durduruldu'})[w]+'.');}updPanel(true);break;}
  case 'crop':{const b=BM.get(+v);if(b&&b.t==='ciftlik'){b.crop=w;log('🌾 Çiftlik ekimi: '+({bugday:'Buğday',sebze:'Sebze',keten:'Keten'}[w])+'.');}updPanel(true);break;}
  case 'ore':{const b=BM.get(+v);if(b&&b.t==='maden'){b.ore=w;for(const u of S.units)if(u.wb===b.id&&u.job==='mine'){u.ti=-1;u.carry=0;u.st='idle';u.path=null;}log('⛏ Madenci kulübesi artık '+RN[w]+' çıkaracak.');}updPanel(true);break;}
  case 'upg':{const b=BM.get(+v);if(b&&UPG[b.t]&&!b.lvl&&UPG[b.t].age<=S.age&&afford(UPG[b.t].cost)){pay(UPG[b.t].cost);b.lvl=1;b.hp=Math.max(b.hp,b.mhp);log('⬆ '+UPG[b.t].n+' tamamlandı.',b.x,b.y);}updPanel(true);break;}
  case 'pri':{const b=BM.get(+v);if(b){b.pri=!b.pri;}updPanel(true);break;}
  case 'cancelb':{const b=BM.get(+v);if(b){cancelBuild(b);UI.sel=null;}updPanel(true);break;}
  case 'demolish':{const b=BM.get(+v);if(b){demolish(b);UI.sel=null;}updPanel(true);break;}
 }
 buildBar();updPanel(true);
}
function nextModalAfter(b){
 $('modal').style.display='none';UI.modalOpen=false;
 try{if(b&&b.fn)b.fn();}catch(e){console.error(e);}
 nextModal();
}
function placeOk(P){
 if(P.t==='tc'&&!S.founded)return !founderOk(P.x,P.y);
 if(!P.mv)return canPlace(P.t,P.x,P.y);
 const b=BM.get(P.mv);if(!b)return false;
 fillOcc(b,0);const ok=canPlace(P.t,P.x,P.y);fillOcc(b,b.id);return ok;
}
function doConfirm(){
 const P=UI.place;if(!P||P.x==null)return;
 if(P.mv){const b=BM.get(P.mv);if(!b){UI.place=null;updHint();return;}
  if(!placeOk(P)){log('⛔ Buraya taşınamaz.');return;}
  fillOcc(b,0);b.x=P.x;b.y=P.y;fillOcc(b,b.id);b.wk=[];FX.push({k:'poof',x:b.x+b.w/2,y:b.y+b.h/2,t:0.5,T:0.5});
  log('🚚 '+BT[b.t].n+' taşındı.',b.x,b.y);UI.place=null;UI.sel=null;updPanel(true);updHint();return;}
 if(P.t==='tc'&&!S.founded){if(foundVillage(P.x,P.y)){UI.place=null;UI.sel=null;buildBar();updHint();}return;}
 if(!canPlace(P.t,P.x,P.y)){log('⛔ Buraya yapılamaz.');return;}
 placeBuilding(P.t,P.x,P.y);
 if(P.t==='tc'||!afford(BT[P.t].cost)){UI.place=null;}
 updHint();
}
