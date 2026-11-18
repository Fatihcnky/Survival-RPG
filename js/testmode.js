'use strict';
// ===== TEST MODU (geçici): her şey açık, sınırsız kaynak =====
function applyTest(){
 S.test=1;S.age=4;S.rank=4;
 Object.keys(TECH).forEach(id=>{S.techs[id]=1;});
 RES.forEach(k=>{S.res[k]=99999;});
 const tc=mainTC();
 if(tc)for(let i=0;i<24;i++){const p=spawnPos(tc);mkUnit('koylu','p',p.x,p.y,{});}
 for(let i=0;i<NN;i++)if(FOG[i]<1)FOG[i]=1;
 log('🧪 TEST MODU: tüm çağlar/teknolojiler açık, kaynaklar sınırsız.');
}
{const _fv=foundVillage;foundVillage=function(x,y){const r=_fv(x,y);if(r&&window.TESTMODE)applyTest();return r;};}
{const _sc=storeCap;storeCap=function(){return S&&S.test?1e9:_sc();};}
{const _pc=popCap;popCap=function(){return _pc()+(S&&S.test?500:0);};}
{const _ec=econ;econ=function(dt){_ec(dt);if(S&&S.test)RES.forEach(k=>{if(S.res[k]<50000)S.res[k]=99999;});};}
{const _sm=showMenu;showMenu=function(l,st){_sm(l,st);const b=$('menuBtns');if(b&&!b.querySelector('[data-a=mtest]'))b.insertAdjacentHTML('beforeend','<button class="mb2" data-a="mtest">🧪 Test Modu<small>Her şey açık, sınırsız kaynak (geçici)</small></button>');};}
{const _a=act;act=function(a,v,w,el){
 if(a==='mtest'){window.TESTMODE=1;$('menu').style.display='none';MENUCB(false);
  setTimeout(()=>{if($('diffscr').style.display!=='none'){$('diffscr').style.display='none';if(showDiff.cb)showDiff.cb('kolay');}},60);return;}
 if(a==='mnew'||a==='mcont')window.TESTMODE=0;
 return _a(a,v,w,el);};}
