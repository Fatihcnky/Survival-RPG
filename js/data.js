'use strict';
// ===== SABİTLER VE VERİ TABLOLARI =====
let MW=224,MH=224;const TS=32,DAY=110,SL=[16,16,16,18];let YEARD=66;
// ===== ZORLUK =====
const DIFFS={
 kolay:{n:'Kolay',ic:'🌱',sub:'Huzurlu Krallık',sl:[18,16,16,12],res:1.6,prod:1.25,cold:0.6,raid:0.6,rf:1.4,war:0.4,k:0.8,
  lines:['❄ Kışlar kısa (12 gün) ve hafif: yakacak ihtiyacı az','🌾 Kaynaklar bol: başlangıç stoğu ve üretim yüksek','⚔ Haydut baskınları seyrek ve küçük','🕊 Krallıklar nadiren savaş açar']},
 normal:{n:'Normal',ic:'⚔',sub:'Dengeli Yol',sl:[16,16,16,18],res:1,prod:1,cold:1,raid:1,rf:1,war:1,k:1,
  lines:['❄ Kışlar orta uzunlukta (18 gün)','🌾 Kaynaklar dengeli','⚔ Baskınlar düzenli ve orta güçte','🏰 Krallıklar ilişkilere göre savaş açar']},
 zor:{n:'Zor',ic:'🔥',sub:'Sert Hayatta Kalma',sl:[14,14,16,22],res:0.7,prod:0.9,cold:1.4,raid:1.4,rf:0.8,war:1.7,k:1.25,
  lines:['❄ Kışlar uzun (22 gün) ve sert: çok yakacak gerekir','🌾 Kaynaklar kıt: az stok, düşük üretim','⚔ Baskınlar sık ve büyük','🏰 Krallıklar daha sık savaş açar, orduları güçlü']},
 efsane:{n:'Efsane',ic:'💀',sub:'Acımasız Çağ',sl:[12,14,14,26],res:0.5,prod:0.8,cold:1.8,raid:1.8,rf:0.65,war:2.4,k:1.5,
  lines:['❄ Kışlar çok uzun (26 gün) ve ölümcül','🌾 Çok kıt kaynaklar, zor ekonomi','⚔ Sürekli ve ağır baskınlar','🏰 Krallıklar saldırgan, orduları çok güçlü']}
,
 destan:{n:'Destan',ic:'👑',sub:'Yeni Oyun+ (Kara Kale\'yi yıkınca açılır)',sl:[12,12,14,28],res:0.4,prod:0.75,cold:2.2,raid:2.3,rf:0.55,war:3,k:1.9,
  lines:['❄ Kışlar 28 gün, donduran soğuk','🌾 Aşırı kıt kaynak','⚔ Kül Tarikatı ve haydutlar acımasız','🏰 Krallıklar çok güçlü ve saldırgan','🏆 Skor ×2,6']}
};
function dif(){return DIFFS[(typeof S!=='undefined'&&S&&S.diff)||'normal']||DIFFS.normal;}
function applyDiff(){const d=dif();for(let i=0;i<4;i++)SL[i]=d.sl[i];YEARD=SL[0]+SL[1]+SL[2]+SL[3];}
const SEASON_DAYS=12;
const SEASONS=['İlkbahar','Yaz','Sonbahar','Kış'];
const AGES=['Taş Çağı','Bronz Çağı','Demir Çağı','Orta Çağ','Barut Çağı'];
const RANKS=['Köy','Kale','Şehir','Lordluk','Krallık'];
const TITLES=['Köy Muhtarı','Kale Beyi','Şehir Başkanı','Lord','Kral'];
const RES=['food','ekmek','wood','stone','iron','gold','deri','keten','giyim','silah','alet','zirh'];
const NOCAP={silah:1,deri:1,alet:1,zirh:1,giyim:1,keten:1,ekmek:1};
const HIDE0={ekmek:1,silah:1,deri:1,alet:1,zirh:1,giyim:1,keten:1}; // 0 iken HUD'da gizlenir
const RN={food:'Yiyecek',wood:'Odun',stone:'Taş',iron:'Demir',gold:'Altın',silah:'Silah',deri:'Deri',alet:'Alet',zirh:'Zırh',giyim:'Giyim',keten:'Keten',ekmek:'Ekmek'};
const RI={food:'🍖',wood:'🌲',stone:'🧱',iron:'🔩',gold:'💰',silah:'🗡',deri:'<img class="ri" src="img/i_deri.png" alt="">',ekmek:'🥖',alet:'🔨',zirh:'🛡',giyim:'🧥',keten:'🌿'};

const JOBS=[
 {id:'build',n:'İnşaatçı',ic:'🔨',d:'Yeni binaları inşa eder.'},
 {id:'haul',n:'Taşıyıcı',ic:'📦',d:'Depodan şantiyeye malzeme taşır (inşaat sırasında).'},
 {id:'wood',n:'Serbest Oduncu',ic:'🌲',d:'Ağacı her yerden keser, en yakın depoya taşır.'},
 {id:'lum',n:'Oduncu',ic:'🪓',bt:'oduncu',d:'Oduncu kulübesine bağlı: kulübe çevresinde keser, önce kulübeye, dolunca depoya taşır.'},
 {id:'mine',n:'Madenci',ic:'⛏',bt:'maden',d:'Madenci kulübesine bağlı: kulübede seçilen maden türünü (taş/demir/altın) çıkarır.'},
 {id:'forage',n:'Toplayıcı',ic:'🧺',d:'Yabani meyve toplar.'},
 {id:'farm',n:'Çiftçi',ic:'🌾',bt:'ciftlik',d:'Çiftlikte çalışır (çiftlik başına 3).'},
 {id:'herd',n:'Çoban',ic:'🐑',bt:'agil',d:'Ağılda hayvan bakar (ağıl başına 3). Yiyecek ve deri verir.'},
 {id:'fish',n:'Balıkçı',ic:'🎣',bt:'iskele',d:'İskelede balık tutar (iskele başına 3). Kışın azalır, çok iskele birbirinin balığını azaltır.'},
 {id:'tailor',n:'Terzi',ic:'🧵',bt:'terzi',d:'Deriden veya keten bitkisinden giyim dikiş. Kışlık giyim mutluluğu korur.'},
 {id:'bake',n:'Fırıncı',ic:'🥖',bt:'firin',d:'Yiyecekten ekmek pişirir (3 yiyecek → 3 ekmek, odun yakar). Ekmek yemek çeşitliliğini artırır.'},
 {id:'smith',n:'Silahçı',ic:'⚒',bt:'demirci',d:'Alet (demir+odun), zırh (demir+deri) ve silah (demir+odun) üretir. Aletler toplama hızını, zırh kılıçlı/şövalye eğitimini destekler.'},
 {id:'fire',n:'İtfaiyeci',ic:'🚒',bt:'itfaiye',d:'Yangınları söndürür.'},
 {id:'doc',n:'Şifacı',ic:'💊',bt:'hastane',d:'Yaralıları iyileştirir, salgını azaltır.'},
 {id:'trade',n:'Tüccar',ic:'💱',bt:'pazar',d:'Pazarda altın kazandırır.'},
 {id:'hunt',n:'Avcı',ic:'🦌',bt:'avci',d:'Geyik ve yaban domuzu avlar (kurtlara dikkat).'}
];
const JOB_ORDER=['farm','herd','fish','forage','hunt','bake','tailor','lum','mine','wood','haul','build','smith','fire','doc','trade'];
const SLOTS={iskele:3,terzi:2,firin:2,oduncu:4,maden:4,ciftlik:3,agil:3,demirci:3,itfaiye:2,hastane:3,pazar:2,avci:2};

// Binalar. age: gereken çağ, rank: gereken ünvan
const BT={
 tc:{n:'Köy Meydanı',ic:'🏛',w:3,h:3,hp:700,age:0,cost:{wood:200,stone:100},time:0,pop:10,drop:1,atk:5,rng:7,col:'#8d6e3f',d:'Köyün kalbi: köylü çağırır, kaynak bırakılır, savunur.'},
 ev:{n:'Ev',ic:'🏠',w:2,h:2,hp:140,age:0,cost:{wood:35},time:10,pop:5,col:'#a0522d',d:'5 kişilik hane. Hane sayısı ünvanını belirler.'},
 depo:{n:'Depo',ic:'📦',w:2,h:2,hp:180,age:0,cost:{wood:60},time:12,store:400,drop:1,col:'#7a5c3a',d:'Kaynak bırakma noktası, stok +400.'},
 ciftlik:{n:'Çiftlik',ic:'🌾',w:3,h:3,hp:120,age:0,cost:{wood:70},time:14,col:'#b9a53f',d:'3 çiftçi. Mevsime göre yiyecek üretir; kışın neredeyse durur.'},
 agil:{n:'Ağıl',ic:'🐑',w:3,h:3,hp:140,age:0,cost:{wood:90,food:30},time:16,col:'#9a8a5a',d:'3 çoban. Kışın bile az da olsa yiyecek verir.'},
 demirci:{n:'Demirhane',ic:'⚒',w:3,h:3,hp:260,age:1,cost:{wood:100,stone:80,iron:30},time:22,col:'#555',d:'Demir ocağı: alet, silah ve zırh üretir. Ne üretileceğini binaya dokunarak seç.'},
 kisla:{n:'Kışla',ic:'⚔',w:3,h:3,hp:320,age:0,cost:{wood:120,stone:40},time:20,col:'#6b6b6b',train:['mizrakli','kilic'],d:'Mızraklı ve kılıçlı asker eğitir.'},
 okcu:{n:'Okçu Menzili',ic:'🏹',w:3,h:3,hp:280,age:0,cost:{wood:110,stone:20},time:20,col:'#6b7b4b',train:['okcu'],d:'Okçu eğitir.'},
 ahir:{n:'Süvari Ocağı',ic:'🐎',w:3,h:3,hp:300,age:2,cost:{wood:150,stone:80,gold:40},time:22,col:'#7b5b3b',train:['atli','atliokcu'],d:'Atlı şövalye ve atlı okçu eğitir.'},
 topcu:{n:'Top Dökümhanesi',ic:'💣',w:3,h:3,hp:360,age:4,cost:{wood:200,stone:150,iron:150,gold:100},time:30,col:'#4b4b55',train:['top'],d:'Top üretir (Barut teknolojisi gerekir).'},
 kule:{n:'Gözcü Kulesi',ic:'🗼',w:2,h:2,hp:260,age:0,cost:{wood:90,stone:20},time:14,atk:7,rng:7.5,col:'#8a6a4a',d:'Ucuz savunma: yakındaki düşmanlara ok atar. Kale ünvanı için gerekli.'},
 tkule:{n:'Taş Kule',ic:'🏯',w:2,h:2,hp:520,age:1,cost:{wood:50,stone:160},time:22,atk:13,rng:9,col:'#8a8a8a',d:'Sağlam taş kule: güçlü ok atışı, uzun menzil.'},
 kapi:{n:'Sur Kapısı',ic:'🚪',w:1,h:1,hp:220,age:0,cost:{wood:10,stone:2},time:4,arm:2,gate:1,col:'#8a5a2a',d:'Sura kapı: halk ve askerlerimiz geçer, haydutlar ve düşmanlar geçemez, yıkmak zorunda kalır.'},
 duvar:{n:'Sur',ic:'🧱',w:1,h:1,hp:160,age:0,cost:{wood:4,stone:1},time:3,arm:2,col:'#7a6a55',d:'Taş sur: düşmanları yönlendirir ve durdurur. Seçip parmağını sürükleyerek hat çiz.'},
 oduncu:{n:'Oduncu Kulübesi',ic:'🪓',w:2,h:2,hp:160,age:0,cost:{wood:50},time:10,col:'#6a4a2a',drop:['wood'],d:'Ormanın yanına kur: oduncular odunu buraya bırakır. Her kulübe tüm odun toplamayı %10 hızlandırır (en çok %30).'},
 maden:{n:'Madenci Kulübesi',ic:'⛏',w:2,h:2,hp:180,age:0,cost:{wood:70,stone:30},time:14,col:'#666',drop:['stone','iron','gold'],d:'Taş ocağı veya maden yanına kur: taş, demir ve altın buraya bırakılır.'},
 iskele:{n:'Balıkçı İskelesi',ic:'🎣',w:2,h:2,hp:140,age:0,cost:{wood:80},time:14,shore:1,col:'#3a6a8a',d:'SADECE su kenarına kurulur. 3 balıkçı. Kışın verim düşer; aynı gölde çok iskele kurarsan balık azalır.'},
 terzi:{n:'Terzi Dükkânı',ic:'🧵',w:2,h:2,hp:160,age:1,cost:{wood:90,stone:20,gold:20},time:16,col:'#8a5a7a',d:'2 terzi: 2 deriden veya 3 ketenden 1 giyim diker. Çiftlikte keten ekebilir, ağılda deri elde edersin.'},
 firin:{n:'Fırın',ic:'🥖',w:2,h:2,hp:200,age:1,cost:{wood:80,stone:50},time:18,col:'#a0522d',d:'2 fırıncı: yiyeceği ekmeğe çevirir (3 yiyecek → 3 ekmek, odun yakar). Ekmek halk yiyeceğinin bir kısmını karşılar ve yemek çeşitliliğini artırır.'},
 avci:{n:'Avcı Kulübesi',ic:'🦌',w:2,h:2,hp:160,age:0,cost:{wood:60},time:12,col:'#7a5a3a',drop:1,d:'2 avcı: geyik ve yaban domuzu avlar (ava dikkat: kurtlar).'},
 sapel:{n:'Şapel',ic:'⛪',w:3,h:3,hp:300,age:1,cost:{wood:120,stone:120},time:26,col:'#ddd',d:'Halkın mutluluğunu artırır (+8, en çok 2 adet).'},
 han:{n:'Han / Meyhane',ic:'🍺',w:3,h:3,hp:240,age:1,cost:{wood:140,stone:40,gold:20},time:22,col:'#8a5a2a',d:'Mutluluk +6 (en çok 2). Ozan ve gezginler uğrar.'},
 kale:{n:'Kale',ic:'🏰',w:4,h:4,hp:1200,age:3,cost:{stone:400,iron:150,gold:100},time:50,pop:20,atk:16,rng:10,col:'#9a9a9a',d:'Güçlü savunma, +20 nüfus. Lordluk için gerekli.'},
 pazar:{n:'Pazar',ic:'🏪',w:3,h:3,hp:200,age:1,cost:{wood:150,stone:50,gold:30},time:20,col:'#b0703a',d:'Kaynak alım-satımı ve ticaret geliri.'},
 itfaiye:{n:'İtfaiye',ic:'🚒',w:3,h:3,hp:240,age:1,cost:{wood:80,stone:60},time:18,col:'#b03a3a',d:'İtfaiyeciler çevredeki yangınları söndürür.'},
 hastane:{n:'Hastane',ic:'🏥',w:3,h:3,hp:260,age:2,cost:{wood:120,stone:120,gold:40},time:24,col:'#d8d8d8',d:'Şifacılar yaralıları iyileştirir, salgında can kaybını azaltır.'},
 elcilik:{n:'Elçilik',ic:'🕊',w:3,h:3,hp:260,age:1,cost:{wood:120,stone:100,gold:50},time:24,col:'#5b7fb0',d:'Komşu krallarla diplomasi yapmanı sağlar.'},
 saray:{n:'Saray',ic:'👑',w:4,h:4,hp:1000,age:3,rank:3,cost:{stone:500,gold:300,wood:300},time:60,pop:20,col:'#c9a227',d:'Krallık ünvanı için gerekli.'},
 karakale:{n:'Kara Kale',ic:'🏯',w:4,h:4,hp:6000,arm:1,cost:{},time:0,col:'#3a1a1a',enemy:1,d:'Lord Maldric\'in son kalesi. Yıkılırsa tahtın gerçek sahibi sen olursun.'},
 tent:{n:'Haydut Çadırı',ic:'⛺',w:2,h:2,hp:220,cost:{},time:0,col:'#6a2a2a',enemy:1},
 ktc:{n:'Krallık Merkezi',ic:'🏰',w:4,h:4,hp:1,col:'#777',decor:1},
 bkule:{n:'Kara Gözcü Kulesi',ic:'🏯',w:2,h:2,hp:1100,atk:20,rng:10,cost:{},time:0,col:'#3a1a1a',enemy:1,d:'Maldric\'in ok kulesi.'},
 bduvar:{n:'Kara Sur',ic:'🧱',w:1,h:1,hp:650,cost:{},time:0,col:'#4a3a3a',enemy:1,wall:1},
 fkule:{n:'Gözcü Kulesi',ic:'🏯',w:2,h:2,hp:700,atk:14,rng:9,col:'#888',foreign:1},
 fkapi:{n:'Sur Kapısı',ic:'🚪',w:1,h:1,hp:420,col:'#8a6a4a',foreign:1,wall:1,gate:1},
 fduvar:{n:'Sur',ic:'🧱',w:1,h:1,hp:420,col:'#8a8a90',foreign:1,wall:1},
 ftc:{n:'Krallık Merkezi',ic:'🏰',w:4,h:4,hp:1800,col:'#777',foreign:1},
 fev:{n:'Köylü Evi',ic:'🏠',w:2,h:2,hp:160,col:'#8a6a4a',foreign:1},
 fciftlik:{n:'Çiftlik',ic:'🌾',w:3,h:3,hp:160,col:'#b59a3a',foreign:1},
 fkisla:{n:'Kışla',ic:'⚔',w:3,h:3,hp:320,col:'#6b6b6b',foreign:1},
 fkale:{n:'Kale',ic:'🏯',w:3,h:3,hp:900,col:'#888',foreign:1},
 khouse:{n:'Ev',ic:'🏠',w:2,h:2,hp:1,col:'#8a6a4a',decor:1}
};
const UPG={
 ev:{n:'Taş Ev',cost:{wood:80,stone:60},age:1,d:'+4 nüfus kapasitesi, daha sağlam.'},
 ciftlik:{n:'Gelişmiş Çiftlik',cost:{wood:80,stone:40},age:1,d:'Verim +%30.'},
 agil:{n:'Büyük Ağıl',cost:{wood:80,stone:40},age:1,d:'Verim +%30.'},
 depo:{n:'Büyük Depo',cost:{wood:120,stone:80},age:1,d:'Depolama +300.'}
};
const BCAT=[
 ['Temel',['ev','depo','ciftlik','agil','iskele','avci','oduncu','maden']],
 ['Askerî',['kisla','okcu','ahir','topcu','kule','tkule','duvar','kapi','kale']],
 ['Üretim & Şehir',['demirci','pazar','firin','terzi','itfaiye','hastane','sapel','han','elcilik','saray']]
];

// Birimler
const UT={
 koylu:{n:'Köylü',g:'🧑',hp:30,atk:3,rng:1.2,rof:1.2,spd:2.0,arm:0,cost:{food:40},time:8,age:0},
 mizrakli:{n:'Mızraklı',g:'🔱',hp:60,atk:7,rng:1.4,rof:1.0,spd:2.2,arm:1,cost:{food:50,wood:25},time:12,age:0,mil:1,antiCav:2.5},
 kilic:{n:'Kılıçlı',g:'🗡',hp:80,atk:10,rng:1.3,rof:1.1,spd:2.2,arm:2,cost:{food:60,iron:25,silah:1,zirh:1},time:14,age:2,mil:1},
 okcu:{n:'Okçu',g:'🏹',hp:38,atk:7,rng:6,rof:1.4,spd:2.2,arm:0,cost:{food:40,wood:40},time:12,age:0,mil:1,ranged:1},
 atliokcu:{n:'Atlı Okçu',g:'🏇',hp:55,atk:7,rng:5.5,rof:1.3,spd:3.8,arm:0,cost:{food:60,gold:40},time:16,age:2,mil:1,ranged:1,cav:1},
 atli:{n:'Atlı Şövalye',g:'🐎',hp:110,atk:12,rng:1.4,rof:1.1,spd:3.6,arm:2,cost:{food:80,iron:40,gold:20,silah:1,zirh:1},time:18,age:2,mil:1,cav:1},
 milis:{n:'Milis',g:'🛡',hp:30,atk:3,rng:1.2,rof:1.2,spd:2.1,arm:0,cost:{},time:0,age:0,mil:1,nopick:1},
 top:{n:'Top',g:'💣',hp:90,atk:50,rng:8,rof:4,spd:1.2,arm:0,cost:{wood:150,iron:100,gold:60,silah:3},time:30,age:4,mil:1,ranged:1,siege:1},
 fkoylu:{n:'Köylü',g:'👨‍🌾',hp:30,atk:2,rng:1,rof:1.5,spd:2.3,arm:0},
 kahraman:{n:'Hükümdar',g:'👑',hp:220,atk:16,rng:1.5,rof:0.9,spd:2.5,arm:4,cost:{},time:0,age:0,mil:1,hero:1},
 haydut:{n:'Haydut',g:'🗡',hp:55,atk:8,rng:1.3,rof:1.1,spd:2.2,arm:1},
 haydutokcu:{n:'Haydut Okçu',g:'🏹',hp:35,atk:6,rng:5.5,rof:1.5,spd:2.2,arm:0,ranged:1},
 haydutatli:{n:'Atlı Haydut',g:'🐎',hp:80,atk:10,rng:1.4,rof:1.1,spd:3.4,arm:1,cav:1},
 geyik:{n:'Geyik',g:'🦌',hp:25,atk:0,rng:1,rof:9,spd:3.2,arm:0,wild:1,food:35},
 domuz:{n:'Yaban Domuzu',g:'🐗',hp:50,atk:9,rng:1.2,rof:1.2,spd:2.6,arm:0,wild:1,food:60},
 kurt:{n:'Kurt',g:'🐺',hp:42,atk:8,rng:1.2,rof:1.0,spd:3.2,arm:0,wild:1,aggr:1},
 haydutreis:{n:'Haydut Reisi',g:'🪓',hp:170,atk:15,rng:1.4,rof:1.1,spd:2.2,arm:3}
};
const TEAMCOL={p:'#3b82f6',a:'#22c55e',b:'#dc2626',k:'#f59e0b',f:'#a3e635',w:'#8a6a3a'};

const TECH={
 elarabasi:{n:'El Arabaları',age:0,cost:{wood:70,food:30},time:25,fx:{haul:1.5},d:'Taşıyıcılar tek seferde %50 daha fazla malzeme taşır'},
 yukarabasi:{n:'Demir Çemberli Yük Arabası',age:2,req:['elarabasi'],cost:{wood:120,iron:60},time:45,fx:{haul:1.5},d:'Taşıyıcı yükü bir %50 daha artar (toplam x2.25)'},
 milis:{n:'Milis Kuvvetleri',age:1,cost:{food:100,wood:80,gold:30},time:35,fx:{milis:1.3},d:'Milis cephanesi: milis canı ve saldırısı +%30, milis üst sınırı nüfusun %40\'ına çıkar'},
 tasbalta:{n:'Taş Balta',age:0,cost:{food:60,wood:60},time:25,fx:{gather:1.15},d:'Odun, taş, demir, altın toplama +%15'},
 toplayici:{n:'Toplayıcı Sepetleri',age:0,cost:{food:50,wood:40},time:20,fx:{forage:1.2},d:'Meyve toplama +%20'},
 ates:{n:'Ateş Kontrolü',age:0,cost:{wood:80,food:40},time:25,fx:{heat:0.7},d:'Kışın ısınma odunu -%30'},
 ekim:{n:'Ekim Bilgisi',age:0,cost:{food:80,wood:60},time:30,fx:{farm:1.12},d:'Çiftlik verimi +%12'},
 bronzsilah:{n:'Bronz Silahlar',age:1,cost:{food:120,wood:80,gold:40},time:40,fx:{atk:1.15},d:'Asker saldırısı +%15'},
 saban:{n:'Bronz Saban',age:1,req:['ekim'],cost:{food:150,wood:100},time:40,fx:{farm:1.15},d:'Çiftlik verimi +%15'},
 depolama:{n:'Çömlek Depolama',age:1,cost:{wood:120,stone:60},time:35,add:{store:400},d:'Stok kapasitesi +400'},
 kuyu:{n:'Su Kuyuları',age:1,req:['depolama'],cost:{wood:100,stone:80},time:35,fx:{fire:1.6},d:'İtfaiye verimi +%60'},
 kervan:{n:'Kervan Yolları',age:1,req:['depolama'],cost:{wood:100,gold:60},time:40,fx:{trade:1.5},d:'Ticaret geliri +%50'},
 demirzirh:{n:'Demir Zırh',age:2,req:['bronzsilah'],cost:{food:200,iron:120,gold:60},time:50,add:{arm:2},d:'Asker zırhı +2'},
 demiralet:{n:'Demir Aletler',age:2,req:['tasbalta'],cost:{wood:150,iron:100},time:50,fx:{gather:1.2},d:'Toplama +%20'},
 sifa:{n:'Şifacılık',age:2,req:['kuyu'],cost:{food:150,gold:80},time:45,fx:{heal:1.5},d:'Hastane etkisi +%50, salgın kayıpları azalır'},
 rotasyon:{n:'Ürün Rotasyonu',age:2,req:['saban'],cost:{food:250,wood:150},time:50,fx:{farm:1.18},d:'Çiftlik verimi +%18'},
 kalemim:{n:'Kale Mimarisi',age:3,req:['demirzirh'],cost:{stone:250,iron:100},time:60,fx:{tower:1.4},d:'Kule ve kale hasarı +%40'},
 diplomasi:{n:'Diplomasi Sanatı',age:3,req:['kervan'],cost:{gold:200,food:200},time:60,fx:{dip:1.5},d:'İlişki kazanımı +%50'},
 vergi:{n:'Feodal Vergi',age:3,req:['kervan'],cost:{gold:150,food:250},time:60,fx:{tax:2},d:'Günlük vergi geliri x2'},
 barut:{n:'Barut',age:4,req:['kalemim'],cost:{iron:300,gold:200},time:80,d:'Top üretimini açar'},
 olta:{n:'Ağ ve Olta',age:0,cost:{food:50,wood:50},time:22,fx:{fish:1.2},d:'Balıkçılar %20 daha fazla balık yakalar'},
 tekne:{n:'Balıkçı Tekneleri',age:1,req:['olta'],cost:{wood:130,food:80},time:38,fx:{fish:1.25},d:'Balık avı +%25'},
 buyukag:{n:'Büyük Ağlar',age:2,req:['tekne'],cost:{wood:160,gold:60},time:48,fx:{fish:1.3},d:'Balık avı +%30'},
 tasfirin:{n:'Taş Fırın',age:0,cost:{wood:60,stone:40},time:24,fx:{bake:1.25},d:'Fırıncılar %25 hızlı ve bol ekmek pişirir'},
 maya:{n:'Ekşi Maya',age:1,req:['tasfirin'],cost:{food:100,wood:80},time:36,fx:{bake:1.3},d:'Ekmek üretimi +%30'},
 dokuma:{n:'Dokuma Tezgâhı',age:0,cost:{wood:70,food:40},time:24,fx:{tailor:1.25},d:'Terziler %25 daha hızlı giyim diker'},
 boya:{n:'Boyacılık',age:1,req:['dokuma'],cost:{wood:90,gold:30},time:36,fx:{tailor:1.3},d:'Giyim üretimi +%30'},
 ustaterzi:{n:'Usta Terzilik',age:2,req:['boya'],cost:{gold:80,wood:100},time:46,fx:{tailor:1.4},d:'Giyim üretimi +%40'},
 matbaa:{n:'Matbaa',age:4,req:['vergi'],cost:{gold:300,wood:200},time:80,fx:{gather:1.2,farm:1.15},d:'Tüm üretim +%20'}
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
// ilerleme yavaşlatma (oyun uzasın)
AGEUP.forEach(a=>{if(!a)return;a.time=Math.round(a.time*1.5);a.pop=Math.round(a.pop*1.25);a.houses=Math.round(a.houses*1.2);for(const k in a.cost)a.cost[k]=Math.round(a.cost[k]*1.35);});
RANKREQ.forEach(r=>{if(!r)return;r.pop=Math.round(r.pop*1.25);r.houses=Math.round(r.houses*1.2);});
const KINGS=[
 {n:'Kuzey Lordluğu',who:'Lord Aldric',x:112,y:24,pers:'bilge',col:'#4a7fd0',d:'Bilge ve temkinli bir lord.',fam:['Leydi Mirel','Lord Cedric']},
 {n:'Doğu Krallığı',who:'Kral Maran',x:200,y:112,pers:'savasci',col:'#d04a4a',d:'Savaşçı, kolay öfkelenir.',fam:['Prenses Valeria','Prens Borin']},
 {n:'Güney Hanlığı',who:'Han Tolga',x:112,y:200,pers:'acgozlu',col:'#d0a43a',d:'Altına düşkün bir tüccar han.',fam:['Hanım Aysel','Prens Kağan']},
 {n:'Batı Beyliği',who:'Bey Sevran',x:24,y:112,pers:'dost',col:'#5bb36a',d:'Dost canlısı, barışsever.',fam:['Leydi Rowena','Şövalye Edmund']},
 {n:'Kuzeydoğu Dükalığı',who:'Dük Roderik',x:186,y:38,pers:'acgozlu',col:'#b070d0',d:'Hırslı bir dük, sınırları genişletmek ister.',fam:['Düşes Alina','Dük Tarik']},
 {n:'Güneybatı Hanedanı',who:'Leydi Elara',x:38,y:186,pers:'dost',col:'#40b8b0',d:'Bilgece yöneten, tüccarlara dost bir hanedan.',fam:['Prenses Iris','Prens Lucan']}
];
const STORY=[
 {ch:'Bölüm 1 — Sürgün',t:'Köyünü kur: haritada gez, uygun bir yer bul ve "Köyü Kur" düğmesine bas.',ok:()=>S.founded,m:'Sürgün kafilesi nihayet yurt tuttu. Ateş yakıldı, ilk çadırlar kuruldu. Yaşlılar bu toprakların bereketli olduğunu söylüyor.'},
 {t:'4 ev (hane) inşa et.',ok:()=>countB('ev',true)>=4,r:{wood:100},m:'Aileler çatı altına girdi. Çocukların kahkahası köyü doldurdu.'},
 {t:'Depo ve Oduncu Kulübesi kur (odunu ormana yakın kulübeye taşıtmak işi hızlandırır).',ok:()=>countB('depo',true)>=1&&countB('oduncu',true)>=1,r:{wood:60},m:'Kütükler artık kısa yoldan ambara akıyor. Oduncular kulübe bonusunu seviyor.'},
 {t:'Bir Çiftlik ve bir Ağıl kur: yiyecek kaynağını çeşitlendir.',ok:()=>countB('ciftlik',true)>=1&&countB('agil',true)>=1,r:{food:60},m:'Tarlalar yeşerdi, ağılda koyunlar meleşiyor.'},
 {t:'Bir Avcı Kulübesi kur ve 3 av getir (avcılar ormanlara dikkat etmeli, kurtlar var).',ok:()=>countB('avci',true)>=1&&(S.stats.hunted||0)>=3,r:{food:80},m:'Av etinin kokusu sofraları şenlendirdi. Avcılar "ormanda kurtlar dolaşıyor" diye uyarıyor.'},
 {ch:'Bölüm 2 — İlk Kış',t:'Kışa hazırlan: 250 odun ve 300 yiyecek biriktir.',ok:()=>S.res.wood>=250&&S.res.food>=300,r:{food:80},m:'Ambarlar doldu. Yaşlılar "bu kış uzun olacak" diyor.'},
 {t:'Köyün büyüsün: 20 nüfusa ulaş.',ok:()=>popNow()>=20,r:{wood:100,food:60},m:'Köy meydanı artık daha kalabalık. Yeni evler ve yeni işler lazım.'},
 {t:'Savunmaya geç: 1 gözcü kulesi kur ve 5 okçu eğit.',ok:()=>(countB('kule',true)+countB('tkule',true))>=1&&S.units.filter(u=>u.team==='p'&&u.t==='okcu'&&!u.dead).length>=5,r:{wood:150,stone:60},m:'Kulelerin tepesindeki nöbetçiler ufku gözetliyor. Haydutlar artık kolay lokma bulamayacak.'},
 {t:'Madenci Kulübesi kur ve 100 taş biriktir.',ok:()=>countB('maden',true)>=1&&S.res.stone>=100,r:{gold:50,wood:60},m:'Taş ocağından ilk bloklar geldi. Surlar ve kuleler için artık malzeme var.'},
 {ch:'Bölüm 3 — Bronz ve Kan',t:"Bronz Çağı'na geç.",ok:()=>S.age>=1,r:{gold:60},m:'Demirciler bronzu dövmeyi öğrendi. Yeni bir çağ başladı.'},
 {t:'İlk haydut kampını yok et.',ok:()=>S.stats.camps>=1,r:{gold:100,iron:40},m:'Haydutların yuvası yıkıldı. Yollar biraz daha güvenli.'},
 {t:'Elçilik kur ve bir komşuyla ticaret anlaşması yap.',ok:()=>S.kings.some(k=>k.pact),r:{gold:100},m:'Komşular artık seni tanıyor. Kervanlar yola çıktı.'},
 {t:'İlk kışı atlat: bir yıl hayatta kal ve en az 12 nüfusa ulaş.',ok:()=>S.day>=YEARD&&popNow()>=12,r:{gold:80},m:'Karlar eridi, köy ayakta kaldı! İlk yılını tamamladın.'},
 {ch:'Bölüm 4 — Hanedan',t:'Hanedanını güçlendir: bir komşu hanedanla evlen.',ok:()=>!!S.dyn.spouse,r:{gold:150},m:'Çanlar çaldı, düğün şenliği günlerce sürdü. İki hanedan artık akraba.'},
 {t:'Şapel kur ve halk mutluluğunu 70\'e çıkar.',ok:()=>countB('sapel',true)>=1&&S.happy>=70,r:{food:120,gold:80},m:'Halk, hükümdarına minnet duyuyor. Sokaklarda şarkılar söyleniyor.'},
 {t:'"Kale" ünvanına yüksel.',ok:()=>S.rank>=1,r:{stone:150},m:'Surların gölgesinde yeni bir hayat başladı.'},
 {t:'Bir varis sahibi ol (hanedanın devamı için).',ok:()=>S.dyn.heirs.length>=1,r:{gold:120},m:'Beşikte uyuyan çocuk, hanedanın geleceği. Halk yeni umutla doluyor.'},
 {ch:'Bölüm 5 — Demir Çağı',t:"Demir Çağı'na geç ve bir Hastane kur.",ok:()=>S.age>=2&&countB('hastane',true)>=1,r:{gold:150},m:'Demir, hem kılıcı hem pulluğu güçlendirdi.'},
 {t:'3 haydut kampını yok et.',ok:()=>S.stats.camps>=3,r:{gold:250,iron:120},m:'Haydut reisleri senin adını duyunca titriyor. Yollar kervanlara açık.'},
 {t:'"Şehir" ol.',ok:()=>S.rank>=2,r:{gold:200,food:200},m:'Pazar yerleri şenlendi, şehir kuruldu!'},
 {ch:'Bölüm 6 — Orta Çağ',t:"Orta Çağ'a geç ve bir komşuyla ittifak kur.",ok:()=>S.age>=3&&S.kings.some(k=>k.pact==='ittifak'),r:{gold:250},m:'Dostların çoğaldı, düşmanların saygı duymaya başladı.'},
 {t:'"Lordluk" ünvanını kazan.',ok:()=>S.rank>=3,r:{gold:400},m:'Artık topraklarının efendisisin.'},
 {t:'Nüfusunu 100\'e çıkar.',ok:()=>popNow()>=100,r:{gold:300,food:300},m:'Yüz kişi... Bir zamanlar küçücük bir kafile olan halkın artık bir şehir kadar kalabalık.'},
 {ch:'Final — Taç',t:'Krallığını ilan et: "Krallık" ünvanına yüksel.',ok:()=>S.rank>=4,m:'Taç giydin ama Maldric hâlâ ayakta...'},
 {ch:'Son — Kara Kale',t:'Haritanın uzak köşesindeki Maldric\'in Kara Kale\'sini yık. Güçlü bir ordu ve toplar getir!',ok:()=>S.sf&&S.sf.maldricDead,m:'Maldric düştü, taç sonunda gerçek sahibinde. Aldora yeniden doğdu!'}
];
