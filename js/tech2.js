'use strict';
// ===== Yeni sistemler için araştırmalar =====
Object.assign(TECH,{
 istihbarat:{n:'İstihbarat Ağı',age:1,cost:{gold:100,food:80},time:30,d:'Casus Evi kurmayı açar'},
 golge:{n:'Gölge Okulu',age:3,req:['istihbarat','diplomasi'],cost:{gold:250,food:150},time:55,d:'Tüm casus zarlarına +1, yeni casuslar Sv.2 başlar'},
 zehirbilgisi:{n:'Zehir ve Hançer',age:3,req:['golge'],cost:{gold:300,iron:100},time:60,d:'Suikast ve sabotaj zarlarına +2'},
 denizcilik:{n:'Denizcilik',age:2,req:['tekne'],cost:{wood:200,gold:100},time:45,d:'Liman kurmayı açar'},
 gemi:{n:'Büyük Gemiler',age:3,req:['denizcilik'],cost:{wood:300,iron:100,gold:150},time:55,d:'Deniz ticareti geliri +%40'},
 donanma:{n:'Donanma',age:4,req:['gemi'],cost:{wood:400,iron:200,gold:300},time:70,d:'Korsan riski çok azalır, deniz ticareti +%25'},
 simyabil:{n:'Simya Bilgisi',age:3,req:['sifa'],cost:{gold:200,food:150},time:55,d:'Simya Laboratuvarı kurmayı açar'},
 iksir2:{n:'Üstün İksirler',age:4,req:['simyabil'],cost:{gold:350,iron:100},time:70,d:'İksir etkisi +%35 saldırı, günde 2 iksir, stok 20'},
 astronomi:{n:'Astronomi',age:3,req:['kalemim'],cost:{stone:200,gold:200},time:55,d:'Gökbilim Kulesi kurmayı açar'},
 felsefe:{n:'Felsefe ve Kitaplar',age:3,req:['diplomasi'],cost:{gold:250,food:150},time:55,d:'Büyük Kütüphane kurmayı açar'},
 saraymim:{n:'Saray Mimarisi',age:3,req:['kalemim','vergi'],cost:{stone:300,gold:300},time:65,d:'Kral Sarayı kurmayı açar (Krallık rütbesi için gerekli)'},
 yonetim:{n:'İmparatorluk Yönetimi',age:4,req:['saraymim'],cost:{gold:500,food:300},time:80,d:'İmparatorluk ilan etmeyi açar'},
 kusatma:{n:'Kuşatma Mühendisliği',age:2,req:['demirzirh'],cost:{wood:200,iron:100},time:50,d:'Koçbaşı eğitmeyi açar'},
 mancinik:{n:'Mancınık',age:3,req:['kusatma','kalemim'],cost:{wood:250,iron:150,gold:100},time:60,d:'Mancınık eğitmeyi açar'}
});
const TGATE={casusevi:'istihbarat',liman:'denizcilik',simya:'simyabil',kutuphane:'felsefe',gozkule:'astronomi',saray:'saraymim'};
const UGATE={kocbasi:'kusatma',mancinik:'mancinik'};
(function(){
 const _pr=placeReason;placeReason=function(t){
  const g=TGATE[t];if(g&&!S.techs[g]&&!S.test)return'Araştırma gerekli: '+TECH[g].n;
  return _pr(t);};
 const _ct=canTrain;canTrain=function(ut){const g=UGATE[ut];if(g&&!S.techs[g])return'Araştırma gerekli: '+TECH[g].n;return _ct(ut);};
 const _sb=spBonus;spBonus=function(s,k){let b=_sb(s,k);if(S.techs.golge)b+=1;if(S.techs.zehirbilgisi&&(k==='sv'||k==='sk'||k==='sab'))b+=2;return b;};
 const _eo=empireOK;empireOK=function(){const r=_eo();if(!S.techs.yonetim)r.ok=false;return r;};
})();
