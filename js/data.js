'use strict';
// ===== SABİTLER VE VERİ TABLOLARI =====
const TS=32,MW=96,MH=96,DAY=30,SEASON_DAYS=6;
const SEASONS=['İlkbahar','Yaz','Sonbahar','Kış'];
const AGES=['Taş Çağı','Bronz Çağı','Demir Çağı','Orta Çağ','Barut Çağı'];
const RANKS=['Köy','Kale','Şehir','Lordluk','Krallık'];
const TITLES=['Köy Muhtarı','Kale Beyi','Şehir Başkanı','Lord','Kral'];
const RES=['food','wood','stone','iron','gold','silah'];
const RN={food:'Yiyecek',wood:'Odun',stone:'Taş',iron:'Demir',gold:'Altın',silah:'Silah'};
const RI={food:'🍖',wood:'🌲',stone:'🧱',iron:'🔩',gold:'💰',silah:'🗡'};

const JOBS=[
 {id:'build',n:'İnşaatçı',ic:'🔨',d:'Yeni binaları inşa eder.'},
 {id:'wood',n:'Oduncu',ic:'🌲',d:'Ağaç keser, depoya taşır.'},
 {id:'stone',n:'Taş Ocakçısı',ic:'🧱',d:'Taş çıkarır.'},
 {id:'iron',n:'Demirci Madenci',ic:'🔩',d:'Demir cevheri çıkarır.'},
 {id:'gold',n:'Altın Madencisi',ic:'💰',d:'Altın damarı işler.'},
 {id:'forage',n:'Toplayıcı',ic:'🍓',d:'Yabani meyve toplar.'},
 {id:'farm',n:'Çiftçi',ic:'🌾',bt:'ciftlik',d:'Çiftlikte çalışır (çiftlik başına 3).'},
 {id:'herd',n:'Çoban',ic:'🐑',bt:'agil',d:'Ağılda hayvan bakar (ağıl başına 3).'},
 {id:'smith',n:'Silahçı',ic:'⚒',bt:'demirci',d:'Demir+odundan silah yapar.'},
 {id:'fire',n:'İtfaiyeci',ic:'🚒',bt:'itfaiye',d:'Yangınları söndürür.'},
 {id:'doc',n:'Şifacı',ic:'💊',bt:'hastane',d:'Yaralıları iyileştirir, salgını azaltır.'},
 {id:'trade',n:'Tüccar',ic:'💱',bt:'pazar',d:'Pazarda altın kazandırır.'}
];
const JOB_ORDER=['farm','herd','forage','wood','build','stone','iron','gold','smith','fire','doc','trade'];
const SLOTS={ciftlik:3,agil:3,demirci:3,itfaiye:2,hastane:3,pazar:2};

// Binalar. age: gereken çağ, rank: gereken ünvan
const BT={
 tc:{n:'Köy Meydanı',ic:'🏛',w:3,h:3,hp:700,age:0,cost:{wood:200,stone:100},time:0,pop:10,drop:1,atk:5,rng:7,col:'#8d6e3f',d:'Köyün kalbi: köylü çağırır, kaynak bırakılır, savunur.'},
 ev:{n:'Ev',ic:'🏠',w:2,h:2,hp:140,age:0,cost:{wood:35},time:10,pop:5,col:'#a0522d',d:'5 kişilik hane. Hane sayısı ünvanını belirler.'},
 depo:{n:'Depo',ic:'📦',w:2,h:2,hp:180,age:0,cost:{wood:60},time:12,store:300,drop:1,col:'#7a5c3a',d:'Kaynak bırakma noktası, stok +300.'},
 ciftlik:{n:'Çiftlik',ic:'🌾',w:3,h:3,hp:120,age:0,cost:{wood:70},time:14,col:'#b9a53f',d:'3 çiftçi. Mevsime göre yiyecek üretir; kışın neredeyse durur.'},
 agil:{n:'Ağıl',ic:'🐑',w:3,h:3,hp:140,age:0,cost:{wood:90,food:30},time:16,col:'#9a8a5a',d:'3 çoban. Kışın bile az da olsa yiyecek verir.'},
 demirci:{n:'Silah Atölyesi',ic:'⚒',w:3,h:3,hp:260,age:1,cost:{wood:100,stone:80,iron:30},time:22,col:'#555',d:'Silahçılar demir+odundan silah üretir.'},
 kisla:{n:'Kışla',ic:'⚔',w:3,h:3,hp:320,age:0,cost:{wood:120,stone:40},time:20,col:'#6b6b6b',train:['mizrakli','kilic'],d:'Mızraklı ve kılıçlı asker eğitir.'},
 okcu:{n:'Okçu Menzili',ic:'🏹',w:3,h:3,hp:280,age:1,cost:{wood:150,stone:50},time:20,col:'#6b7b4b',train:['okcu'],d:'Okçu eğitir.'},
 ahir:{n:'Ahır',ic:'🐎',w:3,h:3,hp:300,age:2,cost:{wood:150,stone:80,gold:40},time:22,col:'#7b5b3b',train:['atli','atliokcu'],d:'Atlı şövalye ve atlı okçu eğitir.'},
 topcu:{n:'Top Dökümhanesi',ic:'💣',w:3,h:3,hp:360,age:4,cost:{wood:200,stone:150,iron:150,gold:100},time:30,col:'#4b4b55',train:['top'],d:'Top üretir (Barut teknolojisi gerekir).'},
 kule:{n:'Gözcü Kulesi',ic:'🗼',w:2,h:2,hp:300,age:1,cost:{wood:60,stone:120},time:18,atk:9,rng:8,col:'#8a8a8a',d:'Düşmanlara ok atar. Kale ünvanı için gerekli.'},
 kale:{n:'Kale',ic:'🏰',w:4,h:4,hp:1200,age:3,cost:{stone:400,iron:150,gold:100},time:50,pop:20,atk:16,rng:10,col:'#9a9a9a',d:'Güçlü savunma, +20 nüfus. Lordluk için gerekli.'},
 pazar:{n:'Pazar',ic:'🏪',w:3,h:3,hp:200,age:1,cost:{wood:150,stone:50,gold:30},time:20,col:'#b0703a',d:'Kaynak alım-satımı ve ticaret geliri.'},
 itfaiye:{n:'İtfaiye',ic:'🚒',w:3,h:3,hp:240,age:1,cost:{wood:80,stone:60},time:18,col:'#b03a3a',d:'İtfaiyeciler çevredeki yangınları söndürür.'},
 hastane:{n:'Hastane',ic:'🏥',w:3,h:3,hp:260,age:2,cost:{wood:120,stone:120,gold:40},time:24,col:'#d8d8d8',d:'Şifacılar yaralıları iyileştirir, salgında can kaybını azaltır.'},
 elcilik:{n:'Elçilik',ic:'🕊',w:3,h:3,hp:260,age:1,cost:{wood:120,stone:100,gold:50},time:24,col:'#5b7fb0',d:'Komşu krallarla diplomasi yapmanı sağlar.'},
 saray:{n:'Saray',ic:'👑',w:4,h:4,hp:1000,age:3,rank:3,cost:{stone:500,gold:300,wood:300},time:60,pop:20,col:'#c9a227',d:'Krallık ünvanı için gerekli.'},
 tent:{n:'Haydut Çadırı',ic:'⛺',w:2,h:2,hp:220,cost:{},time:0,col:'#6a2a2a',enemy:1},
 ktc:{n:'Krallık Merkezi',ic:'🏰',w:4,h:4,hp:1,col:'#777',decor:1},
 khouse:{n:'Ev',ic:'🏠',w:2,h:2,hp:1,col:'#8a6a4a',decor:1}
};
const BCAT=[
 ['Temel',['ev','depo','ciftlik','agil']],
 ['Askerî',['kisla','okcu','ahir','topcu','kule','kale']],
 ['Üretim & Şehir',['demirci','pazar','itfaiye','hastane','elcilik','saray']]
];

// Birimler
const UT={
 koylu:{n:'Köylü',g:'🧑',hp:30,atk:3,rng:1.2,rof:1.2,spd:2.0,arm:0,cost:{food:40},time:8,age:0},
 mizrakli:{n:'Mızraklı',g:'🔱',hp:60,atk:7,rng:1.4,rof:1.0,spd:2.2,arm:1,cost:{food:50,wood:25},time:12,age:0,mil:1,antiCav:2.5},
 kilic:{n:'Kılıçlı',g:'🗡',hp:80,atk:10,rng:1.3,rof:1.1,spd:2.2,arm:2,cost:{food:60,iron:25,silah:1},time:14,age:2,mil:1},
 okcu:{n:'Okçu',g:'🏹',hp:38,atk:7,rng:6,rof:1.4,spd:2.2,arm:0,cost:{food:40,wood:40},time:12,age:1,mil:1,ranged:1},
 atliokcu:{n:'Atlı Okçu',g:'🏇',hp:55,atk:7,rng:5.5,rof:1.3,spd:3.8,arm:0,cost:{food:60,gold:40},time:16,age:2,mil:1,ranged:1,cav:1},
 atli:{n:'Atlı Şövalye',g:'🐎',hp:110,atk:12,rng:1.4,rof:1.1,spd:3.6,arm:2,cost:{food:80,iron:40,gold:20,silah:1},time:18,age:2,mil:1,cav:1},
 top:{n:'Top',g:'💣',hp:90,atk:50,rng:8,rof:4,spd:1.2,arm:0,cost:{wood:150,iron:100,gold:60,silah:3},time:30,age:4,mil:1,ranged:1,siege:1},
 haydut:{n:'Haydut',g:'🗡',hp:55,atk:8,rng:1.3,rof:1.1,spd:2.2,arm:1},
 haydutokcu:{n:'Haydut Okçu',g:'🏹',hp:35,atk:6,rng:5.5,rof:1.5,spd:2.2,arm:0,ranged:1},
 haydutatli:{n:'Atlı Haydut',g:'🐎',hp:80,atk:10,rng:1.4,rof:1.1,spd:3.4,arm:1,cav:1},
 haydutreis:{n:'Haydut Reisi',g:'🪓',hp:170,atk:15,rng:1.4,rof:1.1,spd:2.2,arm:3}
};
const TEAMCOL={p:'#3b82f6',a:'#22c55e',b:'#dc2626',k:'#f59e0b'};

const TECH={
 tasbalta:{n:'Taş Balta',age:0,cost:{food:60,wood:60},time:25,fx:{gather:1.25},d:'Odun, taş, demir, altın toplama +%25'},
 toplayici:{n:'Toplayıcı Sepetleri',age:0,cost:{food:50,wood:40},time:20,fx:{forage:1.3},d:'Meyve toplama +%30'},
 ates:{n:'Ateş Kontrolü',age:0,cost:{wood:80,food:40},time:25,fx:{heat:0.7},d:'Kışın ısınma odunu -%30'},
 ekim:{n:'Ekim Bilgisi',age:0,cost:{food:80,wood:60},time:30,fx:{farm:1.2},d:'Çiftlik verimi +%20'},
 bronzsilah:{n:'Bronz Silahlar',age:1,cost:{food:120,wood:80,gold:40},time:40,fx:{atk:1.15},d:'Asker saldırısı +%15'},
 saban:{n:'Bronz Saban',age:1,cost:{food:150,wood:100},time:40,fx:{farm:1.25},d:'Çiftlik verimi +%25'},
 depolama:{n:'Çömlek Depolama',age:1,cost:{wood:120,stone:60},time:35,add:{store:300},d:'Stok kapasitesi +300'},
 kuyu:{n:'Su Kuyuları',age:1,cost:{wood:100,stone:80},time:35,fx:{fire:1.6},d:'İtfaiye verimi +%60'},
 kervan:{n:'Kervan Yolları',age:1,cost:{wood:100,gold:60},time:40,fx:{trade:1.5},d:'Ticaret geliri +%50'},
 demirzirh:{n:'Demir Zırh',age:2,cost:{food:200,iron:120,gold:60},time:50,add:{arm:2},d:'Asker zırhı +2'},
 demiralet:{n:'Demir Aletler',age:2,cost:{wood:150,iron:100},time:50,fx:{gather:1.3},d:'Toplama +%30'},
 sifa:{n:'Şifacılık',age:2,cost:{food:150,gold:80},time:45,fx:{heal:1.5},d:'Hastane etkisi +%50, salgın kayıpları azalır'},
 rotasyon:{n:'Ürün Rotasyonu',age:2,cost:{food:250,wood:150},time:50,fx:{farm:1.3},d:'Çiftlik verimi +%30'},
 kalemim:{n:'Kale Mimarisi',age:3,cost:{stone:250,iron:100},time:60,fx:{tower:1.4},d:'Kule ve kale hasarı +%40'},
 diplomasi:{n:'Diplomasi Sanatı',age:3,cost:{gold:200,food:200},time:60,fx:{dip:1.5},d:'İlişki kazanımı +%50'},
 vergi:{n:'Feodal Vergi',age:3,cost:{gold:150,food:250},time:60,fx:{tax:2},d:'Günlük vergi geliri x2'},
 barut:{n:'Barut',age:4,cost:{iron:300,gold:200},time:80,d:'Top üretimini açar'},
 matbaa:{n:'Matbaa',age:4,cost:{gold:300,wood:200},time:80,fx:{gather:1.2,farm:1.15},d:'Tüm üretim +%20'}
};
const AGEUP=[null,
 {cost:{food:250,wood:150,stone:80},time:40,houses:3,pop:12},
 {cost:{food:500,wood:300,stone:200,iron:100,gold:100},time:60,houses:8,pop:25},
 {cost:{food:900,wood:500,stone:500,iron:300,gold:300},time:90,houses:16,pop:55,rank:1},
 {cost:{food:1400,wood:800,stone:800,iron:600,gold:600},time:120,houses:28,pop:90,rank:2}
];
const RANKREQ=[null,
 {houses:6,pop:18,age:1,b:['kule'],reward:{gold:100,wood:100}},
 {houses:16,pop:45,age:2,b:['pazar','itfaiye'],reward:{gold:250,food:200}},
 {houses:28,pop:80,age:3,b:['kale','elcilik'],reward:{gold:500,stone:300}},
 {houses:42,pop:120,age:3,b:['saray'],reward:{gold:1000}}
];
const KINGS=[
 {n:'Kuzey Lordluğu',who:'Lord Aldric',x:48,y:11,pers:'bilge',col:'#4a7fd0',d:'Bilge ve temkinli bir lord.'},
 {n:'Doğu Krallığı',who:'Kral Maran',x:85,y:48,pers:'savasci',col:'#d04a4a',d:'Savaşçı, kolay öfkelenir.'},
 {n:'Güney Hanlığı',who:'Han Tolga',x:48,y:85,pers:'acgozlu',col:'#d0a43a',d:'Altına düşkün bir tüccar han.'},
 {n:'Batı Beyliği',who:'Bey Sevran',x:11,y:48,pers:'dost',col:'#5bb36a',d:'Dost canlısı, barışsever.'}
];
const STORY=[
 {t:'Köyünü kur: haritada gez, uygun bir yer bul ve "Köyü Kur" düğmesine bas.',ok:()=>S.founded,m:'Sürgün kafilesi nihayet yurt tuttu. Ateş yakıldı, ilk çadırlar kuruldu.'},
 {t:'4 ev (hane) inşa et.',ok:()=>countB('ev',true)>=4,r:{wood:100},m:'Aileler çatı altına girdi. Köy artık bir köy gibi görünüyor.'},
 {t:'Kışa hazırlan: 150 odun ve 220 yiyecek biriktir.',ok:()=>S.res.wood>=150&&S.res.food>=220,r:{food:60},m:'Ambarlar doldu. Yaşlılar "bu yıl kış sert olacak" diyor.'},
 {t:"Bronz Çağı'na geç.",ok:()=>S.age>=1,r:{gold:60},m:'Demirciler bronzu dövmeyi öğrendi. Yeni bir çağ başladı.'},
 {t:'İlk haydut kampını yok et.',ok:()=>S.stats.camps>=1,r:{gold:100,iron:40},m:'Haydutların yuvası yıkıldı. Yollar biraz daha güvenli.'},
 {t:'Elçilik kur ve bir komşuyla ticaret anlaşması yap.',ok:()=>S.kings.some(k=>k.pact),r:{gold:100},m:'Komşular artık seni tanıyor. Kervanlar yola çıktı.'},
 {t:'"Kale" ünvanına yüksel.',ok:()=>S.rank>=1,r:{stone:150},m:'Surların gölgesinde yeni bir hayat başladı.'},
 {t:"Demir Çağı'na geç ve bir Hastane kur.",ok:()=>S.age>=2&&countB('hastane',true)>=1,r:{gold:150},m:'Demir, hem kılıcı hem pulluğu güçlendirdi.'},
 {t:'"Şehir" ol.',ok:()=>S.rank>=2,r:{gold:200,food:200},m:'Pazar yerleri şenlendi, şehir kuruldu!'},
 {t:"Orta Çağ'a geç ve bir komşuyla ittifak kur.",ok:()=>S.age>=3&&S.kings.some(k=>k.pact==='ittifak'),r:{gold:250},m:'Dostların çoğaldı, düşmanların saygı duymaya başladı.'},
 {t:'"Lordluk" ünvanını kazan.',ok:()=>S.rank>=3,r:{gold:400},m:'Artık topraklarının efendisisin, lord.'},
 {t:'Krallığını ilan et: "Krallık" ünvanına yüksel.',ok:()=>S.rank>=4,m:'Taç giydin. Sürgünden krallığa uzanan yol tamamlandı!'}
];
