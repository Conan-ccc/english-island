// Characters: 10 kinds x 8 stages, ported from docs/reference/character-sketches-v3.html (pure, returns SVG strings)
const DATA=[
{n:'냥냥이',k:'고양이',ear:'cat',c:'#FFC2D9',d:'#F58FB4',a:'#FFE27A',w:'butterfly',t:'tiara',tail:'cat',e:'나비 날개를 단 고양이 공주'},
{n:'몽글멍',k:'강아지',ear:'dog',c:'#F6DDBF',d:'#C9976A',a:'#8EC5FF',w:'star',t:'star',tail:'dog',e:'별 망토를 두른 별빛 강아지'},
{n:'토실이',k:'토끼',ear:'bunny',c:'#FFFFFF',d:'#FFC2D9',a:'#B8E986',w:'petal',t:'flower',tail:'puff',e:'꽃잎 날개와 꽃관을 쓴 봄 토끼'},
{n:'뭉게',k:'구름 양',ear:'sheep',c:'#F3F0FF',d:'#C9B8FF',a:'#FFD3E8',w:'angel',t:'halo',tail:'none',e:'무지개 위에 사는 구름 요정'},
{n:'하트링',k:'하트 요정',ear:'heart',c:'#FF9EC4',d:'#FF6FA5',a:'#FFE3F0',w:'heart',t:'wand',tail:'none',e:'하트 날개와 요술봉을 가진 사랑 요정'},
{n:'반짝별',k:'별 요정',ear:'star',c:'#FFEB99',d:'#F5C542',a:'#C9B8FF',w:'star',t:'moon',tail:'none',e:'달님 왕관을 쓴 밤하늘 별 요정'},
{n:'퐁퐁',k:'물방울',ear:'drop',c:'#A8E3FF',d:'#5EC4F2',a:'#FFFFFF',w:'none',t:'pearl',tail:'fish',e:'진주 왕관을 쓴 바다 인어 공주'},
{n:'꿀콩',k:'꿀벌',ear:'bee',c:'#FFE07A',d:'#5A4632',a:'#FFB347',w:'bee',t:'honey',tail:'none',e:'꿀 왕관을 쓴 꽃밭의 여왕벌'},
{n:'달랑',k:'여우',ear:'fox',c:'#FFB27A',d:'#E8844A',a:'#FFF3B0',w:'none',t:'moon',tail:'fox3',e:'달빛 꼬리 셋을 가진 신비한 여우'},
{n:'솜사탕',k:'포니',ear:'pony',c:'#FFF0F7',d:'#C9B8FF',a:'#FFB8D9',w:'angel',t:'horn',tail:'mane',e:'무지개 갈기와 뿔이 자라는 유니콘'}
];
const star=(x,y,r,ri,f,extra='')=>{let p=[];for(let i=0;i<10;i++){const R=i%2?ri:r,a=-Math.PI/2+i*Math.PI/5;p.push((x+R*Math.cos(a)).toFixed(1)+','+(y+R*Math.sin(a)).toFixed(1))}return '<polygon points="'+p.join(' ')+'" fill="'+f+'" '+extra+'/>'};
const heart=(x,y,s,f)=>'<path transform="translate('+x+' '+y+') scale('+s+')" d="M0 4 C-6 -2 -12 2 -8 8 L0 15 L8 8 C12 2 6 -2 0 4Z" fill="'+f+'"/>';
const mir=s=>s+'<g transform="translate(120 0) scale(-1 1)">'+s+'</g>';
const spark=(x,y,s,f)=>'<path transform="translate('+x+' '+y+') scale('+s+')" d="M0 -6 Q1 -1 6 0 Q1 1 0 6 Q-1 1 -6 0 Q-1 -1 0 -6Z" fill="'+f+'"/>';
function ears(h){const c=h.c,d=h.d;switch(h.ear){
case'cat':return mir('<path d="M34 46 L38 16 L56 34Z" fill="'+c+'"/><path d="M38 40 L40 24 L50 34Z" fill="'+d+'"/>');
case'dog':return mir('<ellipse cx="31" cy="58" rx="10" ry="20" transform="rotate(18 31 58)" fill="'+d+'"/>');
case'bunny':return mir('<ellipse cx="48" cy="20" rx="8" ry="22" fill="'+c+'" stroke="#eee" stroke-width="1"/><ellipse cx="48" cy="22" rx="4" ry="15" fill="'+d+'"/>');
case'sheep':return [[36,40],[46,31],[60,28],[74,31],[84,40],[30,54],[90,54]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="10" fill="#fff"/>').join('')+mir('<ellipse cx="28" cy="62" rx="8" ry="5" fill="'+d+'"/>');
case'heart':return '<path d="M60 30 Q58 18 62 12" stroke="'+d+'" stroke-width="2" fill="none"/>'+heart(62,4,.7,d);
case'star':return '<path d="M60 30 Q57 20 60 14" stroke="'+d+'" stroke-width="2" fill="none"/>'+star(60,10,7,3,d);
case'drop':return '<path d="M60 4 Q76 26 74 38 L46 38 Q44 26 60 4Z" fill="'+c+'"/>';
case'bee':return mir('<path d="M52 32 Q46 18 40 14" stroke="'+d+'" stroke-width="2" fill="none"/><circle cx="40" cy="14" r="4" fill="'+d+'"/>');
case'fox':return mir('<path d="M30 50 L32 12 L58 32Z" fill="'+c+'"/><path d="M34 42 L35 20 L50 33Z" fill="#fff"/>');
case'pony':return mir('<path d="M38 40 L40 24 L52 34Z" fill="'+c+'" stroke="'+h.d+'" stroke-width="1"/>');}return''}
function wings(h){const f=h.a,o='opacity=".85"';switch(h.w){
case'butterfly':return mir('<path d="M56 84 C30 46 4 60 20 84 C8 104 34 114 56 92Z" fill="'+f+'" '+o+'/><circle cx="26" cy="74" r="5" fill="'+h.d+'" opacity=".6"/>');
case'star':return mir(star(22,78,18,8,f,o));
case'petal':return mir('<ellipse cx="28" cy="76" rx="20" ry="9" transform="rotate(-30 28 76)" fill="'+f+'" '+o+'/><ellipse cx="30" cy="92" rx="16" ry="7" transform="rotate(20 30 92)" fill="'+f+'" '+o+'/>');
case'angel':return mir('<path d="M54 86 C40 60 14 58 10 70 C20 72 12 80 20 84 C28 84 20 92 30 96 C40 96 48 94 54 92Z" fill="#fff" stroke="'+h.d+'" stroke-width="1" '+o+'/>');
case'heart':return mir(heart(26,66,2,f));
case'bee':return mir('<ellipse cx="32" cy="74" rx="20" ry="11" transform="rotate(-25 32 74)" fill="#DDF4FF" stroke="#9ED8F5" '+o+'/>');}return''}
function crown(h){const a=h.a;switch(h.t){
case'tiara':return '<path d="M44 34 L47 20 L54 28 L60 15 L66 28 L73 20 L76 34Z" fill="#FFD84D"/><circle cx="60" cy="27" r="3" fill="'+h.d+'"/>';
case'star':return star(60,22,11,5,'#FFD84D')+'<circle cx="60" cy="22" r="2" fill="#fff"/>';
case'flower':return [[40,36],[48,29],[60,26],[72,29],[80,36]].map((p,i)=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="'+(i%2?'#FFC2D9':'#FFE27A')+'"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="2" fill="#fff"/>').join('');
case'halo':return ['#FF9EC4','#FFD84D','#9EE6A8','#8EC5FF'].map((c,i)=>'<path d="M'+(26+i*4)+' 30 A'+(34-i*4)+' 22 0 0 1 '+(94-i*4)+' 30" stroke="'+c+'" stroke-width="3" fill="none"/>').join('');
case'wand':return '<path d="M98 108 L106 70" stroke="#FFD84D" stroke-width="3"/>'+heart(106,60,1,'#FFD84D')+'<path d="M48 30 L60 20 L72 30" stroke="#FFD84D" stroke-width="3" fill="none"/>';
case'moon':return '<path d="M66 12 A12 12 0 1 0 66 34 A9 9 0 1 1 66 12Z" fill="#FFD84D"/>';
case'pearl':return [36,44,52,60,68,76,84].map((x,i)=>'<circle cx="'+x+'" cy="'+(40-Math.sin(i/6*Math.PI)*8)+'" r="'+(i==3?5:3.5)+'" fill="#fff" stroke="#BDE7FF"/>').join('');
case'honey':return '<path d="M46 34 L46 22 L53 28 L60 18 L67 28 L74 22 L74 34Z" fill="#FFB347"/><path d="M50 34 q2 6 4 0 M64 34 q2 7 4 0" fill="#FFB347"/>';
case'horn':return '<path d="M55 32 L60 4 L65 32Z" fill="#FFE27A"/><path d="M56 26 L64 24 M57 18 L63 16" stroke="#F5C542" stroke-width="1.5"/>';}return''}
function tail(h,s){switch(h.tail){
case'cat':return '<path d="M82 100 Q104 96 98 76" stroke="'+h.c+'" stroke-width="7" fill="none" stroke-linecap="round"/>';
case'dog':return '<path d="M82 98 Q98 90 94 80" stroke="'+h.d+'" stroke-width="7" fill="none" stroke-linecap="round"/>';
case'puff':return '<circle cx="84" cy="102" r="7" fill="#fff" stroke="#eee"/>';
case'fish':return s==2?'<path d="M60 104 Q64 116 76 116 Q70 108 72 100Z M60 104 Q56 116 44 116 Q50 108 48 100Z" fill="'+h.d+'"/>':'';
case'fox3':return (s==2?[[-20],[0],[20]]:[[0]]).map(r=>'<path transform="rotate('+r[0]+' 80 102)" d="M78 104 Q106 100 108 74 Q96 84 84 92Z" fill="'+h.c+'"/><path transform="rotate('+r[0]+' 80 102)" d="M108 74 Q104 82 98 84 Q104 80 108 74Z" fill="#fff" stroke="#fff" stroke-width="4"/>').join('');
case'mane':return s>=1?'<path d="M40 40 Q30 60 38 80" stroke="'+(s==2?'#FF9EC4':h.d)+'" stroke-width="6" fill="none" stroke-linecap="round"/>'+(s==2?'<path d="M44 34 Q34 56 42 76" stroke="#8EC5FF" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M80 40 Q92 60 86 82" stroke="#FFD84D" stroke-width="5" fill="none" stroke-linecap="round"/>':''):'';}return''}
function draw(h,s,deco){
const sc=[.62,.68,.74,.8,.86,.92,.97,1.02][s];const F=s==7;let g='';const O='stroke="'+h.d+'" stroke-opacity=".55" stroke-width="1.1"';
const wrap=(k,str,cy=88)=>'<g transform="translate(60 '+cy+') scale('+k+') translate(-60 -'+cy+')">'+str+'</g>';
if(F){g+='<circle cx="60" cy="72" r="60" fill="'+h.a+'" opacity=".16"/><circle cx="60" cy="72" r="48" fill="'+h.c+'" opacity=".2"/><circle cx="60" cy="72" r="54" fill="none" stroke="'+h.a+'" stroke-width="1.2" stroke-dasharray="1 5" stroke-linecap="round"/>';}
g+='<ellipse cx="60" cy="117" rx="'+(F?30:24)+'" ry="4" fill="#000" opacity=".12"/>';
if(s>=4){const k=[0,0,0,0,.55,.75,.95,1.3][s];if(F)g+=wrap(1.55,'<g opacity=".4">'+wings(h)+'</g>');g+=wrap(k,wings(h));if(s>=5&&h.w!=='none')g+=wrap(k*.68,'<g opacity=".5">'+wings({...h,a:'#ffffff',d:'#ffffff'})+'</g>');}
if(h.tail==='fox3'){if(s>=2)g+=tail(h,s>=7?2:0);if(s>=7)g+='<g transform="rotate(-45 80 102)">'+tail(h,0)+'</g>';if(s>=5&&s<7)g+='<g transform="rotate(-22 80 102)">'+tail(h,0)+'</g>';}
else if(s>=2&&h.tail!=='mane'&&h.tail!=='fish')g+=tail(h,s);
if(h.tail==='fish'&&s>=5)g+=wrap(s==7?1.35:1,tail(h,2)+'<path d="M50 108 q4 4 8 0 M62 108 q4 4 8 0" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/>',104);
const foot='<ellipse cx="49" cy="111" rx="8" ry="5.5" fill="'+h.c+'" '+O+'/><circle cx="46" cy="112.5" r="1.2" fill="'+h.d+'" opacity=".55"/><circle cx="49" cy="113.3" r="1.2" fill="'+h.d+'" opacity=".55"/><circle cx="52" cy="112.5" r="1.2" fill="'+h.d+'" opacity=".55"/>';
g+=mir(foot);
g+='<ellipse cx="60" cy="96" rx="22" ry="17" fill="'+h.c+'" '+O+'/><ellipse cx="60" cy="99" rx="13" ry="10" fill="#fff" opacity=".55"/>';
if(h.ear==='bee')g+='<path d="M41 92 h38 M43 102 h34" stroke="'+h.d+'" stroke-width="4"/><path d="M60 113 l-2 4 l4 0Z" fill="'+h.d+'"/>';
if(h.ear==='heart')g+=heart(60,94,.75,h.d);
if(h.ear==='star')g+=star(60,99,5,2.2,h.d);
if(h.ear==='sheep')g+=[[50,92],[62,90],[70,97],[54,101]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.5" fill="none" stroke="#DCD3FF" stroke-width="1"/>').join('');
if(s>=6){g+='<path d="M36 101 Q60 93 84 101 L90 114 Q84 119 78 114 Q72 120 66 114 Q60 120 54 114 Q48 120 42 114 Q36 119 30 114Z" fill="#fff" opacity=".85"/>';
g+='<path d="M38 100 Q60 92 82 100 L88 112 Q83 117 78 112 Q73 118 68 112 Q63 118 58 112 Q53 118 48 112 Q43 118 38 112 Q35 116 32 112Z" fill="'+h.a+'" stroke="'+h.d+'" stroke-width=".8"/>';
g+='<path d="M40 104 Q60 98 80 104" stroke="#fff" stroke-width="1" fill="none" stroke-dasharray="2 2" opacity=".8"/>';
if(F)g+=[42,51,60,69,78].map((x,i)=>'<circle cx="'+x+'" cy="'+(i%2?108:106)+'" r="1.8" fill="#fff"/>').join('')+mir('<path d="M36 100 l-6 -3 l0 7Z M36 100 l6 -3 l0 7Z" fill="#FF8FB1"/><circle cx="36" cy="100" r="1.8" fill="#FF6FA5"/>');}
const wave=s>=5;const arm=(cx,cy,r)=>'<g transform="rotate('+r+' '+cx+' '+cy+')"><ellipse cx="'+cx+'" cy="'+cy+'" rx="5.5" ry="9" fill="'+h.c+'" '+O+'/><path d="M'+(cx-2)+' '+(cy+7)+' v-2 M'+(cx+2)+' '+(cy+7)+' v-2" stroke="'+h.d+'" stroke-width=".8" opacity=".6"/></g>';
g+=arm(38,92,35)+(wave?arm(83,84,-150):arm(82,92,-35));
if(h.tail==='mane'&&s>=3)g+=tail(h,s>=6?2:1);
g+=ears(h);
if(h.ear==='cat'||h.ear==='fox'||h.ear==='pony')g+=mir('<path d="M'+(h.ear==='fox'?34:38)+' 44 L'+(h.ear==='fox'?38:41)+' 30" stroke="#fff" stroke-width="1" opacity=".7"/>');
g+='<circle cx="60" cy="60" r="30" fill="'+h.c+'" '+O+'/>';
g+='<ellipse cx="48" cy="42" rx="9" ry="4" transform="rotate(-25 48 42)" fill="#fff" opacity=".45"/>';
if(h.ear==='sheep')g+=[[44,34],[60,31],[76,34]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="9" fill="#fff" stroke="#E6E0FF" stroke-width="1"/>').join('');
if(h.ear==='cat')g+='<path d="M56 33 v5 M60 32 v6 M64 33 v5" stroke="'+h.d+'" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>';
if(h.ear==='dog')g+='<ellipse cx="72" cy="56" rx="9" ry="8" fill="'+h.d+'" opacity=".35"/>';
if(h.ear==='fox')g+='<ellipse cx="60" cy="72" rx="14" ry="9" fill="#fff"/>';
if(h.ear==='pony')g+='<ellipse cx="60" cy="73" rx="15" ry="9" fill="#FFD6EA"/><circle cx="55" cy="74" r="1.2" fill="#C98AA8"/><circle cx="65" cy="74" r="1.2" fill="#C98AA8"/><path d="M52 30 Q60 40 68 30 Q62 34 60 30 Q58 34 52 30Z" fill="'+(s>=6?'#FF9EC4':h.d)+'"/>';
if(h.ear==='drop')g+='<path d="M80 50 Q84 58 82 66" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="82" cy="71" r="1.4" fill="#fff" opacity=".8"/>'+(s>=3?'<circle cx="16" cy="60" r="3" fill="none" stroke="#A8E3FF"/><circle cx="104" cy="44" r="2" fill="none" stroke="#A8E3FF"/>':'');
if(h.ear==='bee')g+='<path d="M42 84 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0" fill="#fff" stroke="#fff" stroke-width="2"/>';
if(h.ear==='star'||h.ear==='heart')g+=mir('<circle cx="40" cy="64" r=".9" fill="'+h.d+'"/><circle cx="37" cy="67" r=".9" fill="'+h.d+'"/>');
const er=[3.6,4,4.5,5,5.4,5.8,6.2,6.8][s];const iris=h.ear==='drop'||h.ear==='dog'?'#4A7FD6':(h.ear==='bee'||h.ear==='fox'?'#B5651D':'#C2407A');
g+=mir('<circle cx="48" cy="62" r="'+er+'" fill="#3B2A35"/><ellipse cx="48" cy="'+(62+er*.35)+'" rx="'+(er*.72)+'" ry="'+(er*.45)+'" fill="'+iris+'" opacity=".75"/><circle cx="49.6" cy="60.2" r="'+(er*.38)+'" fill="#fff"/>'+(s>=2?'<circle cx="46.4" cy="'+(62+er*.4)+'" r="'+(er*.16)+'" fill="#fff"/>':'')+(s>=4?'<path d="M'+(48-er)+' '+(62-er*.6)+' l-2.6 -2.2 M'+(48-er*.6)+' '+(62-er*.95)+' l-1.4 -2.8" stroke="#3B2A35" stroke-width="1.2" stroke-linecap="round"/>':'')+(F?'<path d="M'+(48-er-.5)+' '+(62)+' l-3.2 -.6" stroke="#3B2A35" stroke-width="1.1" stroke-linecap="round"/>':''));
if(F)g+=mir(spark(47.6,63.6,.32,'#fff'));
if(!['star','heart','drop','sheep','bee'].includes(h.ear))g+='<path d="M58.4 67.5 h3.2 l-1.6 1.8Z" fill="'+h.d+'"/>';
if(h.ear==='cat')g+=mir('<path d="M36 68 h-9 M36 71 l-8 2" stroke="'+h.d+'" stroke-width=".9" stroke-linecap="round" opacity=".7"/>');
g+=s==0?'<circle cx="60" cy="72" r="1.6" fill="#3B2A35"/>':'<path d="M55 72 Q57.5 75 60 72 Q62.5 75 65 72" stroke="#3B2A35" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
if(h.ear==='bunny'&&s>=1)g+='<rect x="58.6" y="73.4" width="2.8" height="2.6" rx=".6" fill="#fff" stroke="#ddd" stroke-width=".5"/>';
if(h.ear==='dog'&&s>=2)g+='<path d="M58.5 74 q1.5 3.5 3 0Z" fill="#FF7FA0"/>';
if(s>=1)g+=mir('<ellipse cx="40" cy="70" rx="5" ry="3" fill="#FF8FB1" opacity="'+(s>=4?.7:.45)+'"/>'+(s>=3?'<path d="M38 69.5 l1 1.6 M40.5 69 l1 1.6" stroke="#fff" stroke-width=".7" opacity=".8"/>':''));
if(s>=3)g+='<g transform="translate(82 35)"><path d="M-8 -1 L0 0 L-8 5Z M8 -1 L0 0 L8 5Z" fill="'+h.a+'" stroke="'+h.d+'" stroke-width=".8"/><circle r="2.5" fill="'+h.d+'"/>'+(s>=6?'<path d="M-1 1 l-3 7 M1 1 l3 7" stroke="'+h.d+'" stroke-width="1.2"/>':'')+'</g>';
if(s>=5){g+=[[47,86],[50.5,88.3],[54.2,89.7],[58,90.3],[62,90.3],[65.8,89.7],[69.5,88.3],[73,86]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.4" fill="#fff" stroke="#E8D7A0" stroke-width=".5"/>').join('');
g+=F?'<path d="M60 89 l4.5 4.5 l-4.5 5.5 l-4.5 -5.5Z" fill="#FF6FA5" stroke="#fff" stroke-width=".9"/><path d="M58.5 92 l1.5 -1.5 l1.5 1.5" stroke="#fff" stroke-width=".7" fill="none"/>':'<circle cx="60" cy="92" r="2.6" fill="#FF6FA5" stroke="#fff" stroke-width=".6"/>';}
if(s>=6){if(F)g+=[-50,-30,-10,10,30,50].map(a=>'<path transform="rotate('+a+' 60 26)" d="M60 4 v-6" stroke="#FFD84D" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>').join('');
g+=wrap(F?1.18:.85,crown(h),26);
if(F&&['tiara','honey'].includes(h.t))g+=[[48,30,'#8EC5FF'],[72,30,'#B8E986'],[60,22,'#FF6FA5']].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.2" fill="'+p[2]+'" stroke="#fff" stroke-width=".7"/>').join('');
else if(F&&!['horn','halo','pearl','moon'].includes(h.t))g+='<circle cx="60" cy="'+(h.t==='moon'?23:24)+'" r="2.6" fill="#8EC5FF" stroke="#fff" stroke-width=".8"/>';}
if(s>=4)g+='<g class="tw">'+spark(12,34,.7,'#FFD84D')+'</g>';
if(s>=6)g+='<g class="tw2">'+spark(106,28,.7,'#FFD84D')+'</g>';
if(F){const deco=h.ear==='heart'||h.ear==='cat'?'h':(h.ear==='star'||h.ear==='dog'?'s':'m');
g+='<g class="tw">'+spark(-6,70,1.1,'#FFD84D')+spark(118,110,.9,'#FF9EC4')+spark(104,-2,.8,'#8EC5FF')+spark(30,-6,.6,'#B8E986')+'</g><g class="tw2">'+spark(126,62,1,'#FFD84D')+spark(4,4,.9,'#FF9EC4')+spark(-2,116,.8,'#8EC5FF')+spark(88,128,.6,'#FFD84D')+'</g>';
g+=deco==='h'?heart(-2,40,.8,'#FF9EC4')+heart(116,82,.7,'#FF9EC4')+heart(20,124,.5,'#FFB8D9'):deco==='s'?star(-2,44,6,2.5,'#FFD84D')+star(118,84,5,2,'#FFD84D')+star(22,126,3.5,1.5,'#FFE27A'):'<circle cx="-2" cy="44" r="3.5" fill="#fff" stroke="'+h.d+'"/><circle cx="118" cy="84" r="3" fill="#fff" stroke="'+h.d+'"/><circle cx="22" cy="126" r="2.2" fill="#fff" stroke="'+h.d+'"/>';}
if(deco)g+=decoration(deco,h);
return '<svg viewBox="-14 -14 148 152"><g transform="translate(60 76) scale('+sc+') translate(-60 -76)">'+g+'</g></svg>';}

function decoration(id,h){switch(id){
case'pin-heart':return heart(40,30,.75,'#FF6FA5');
case'flower':return [0,72,144,216,288].map(a=>'<ellipse cx="40" cy="30" rx="3.2" ry="5.5" transform="rotate('+a+' 40 34) translate(0 -4)" fill="#FFB8D9"/>').join('')+'<circle cx="40" cy="34" r="2.6" fill="#FFE27A"/>';
case'star-clip':return star(40,34,6.5,2.8,'#FFD84D','stroke="#F5C542" stroke-width=".6"');
case'ribbon-blue':return '<path d="M32 30 L40 34 L32 39Z M48 30 L40 34 L48 39Z" fill="#8EC5FF" stroke="#5E9BDB" stroke-width=".7"/><circle cx="40" cy="34" r="2.2" fill="#5E9BDB"/>';
case'glasses':return '<g fill="none" stroke="#FF6FA5" stroke-width="1.6"><circle cx="48" cy="62" r="8"/><circle cx="72" cy="62" r="8"/><path d="M56 61 Q60 58 64 61"/></g>';
case'shell-necklace':return '<path d="M46 85 Q60 93 74 85" stroke="#F5C9A8" stroke-width="1.4" fill="none"/><path d="M60 89 l-5 6 q5 3 10 0Z" fill="#FFD3E8" stroke="#F58FB4" stroke-width=".6"/>';
case'bell':return '<path d="M46 85 Q60 93 74 85" stroke="#FF6FA5" stroke-width="2" fill="none"/><circle cx="60" cy="92" r="4" fill="#FFD84D" stroke="#F5C542" stroke-width=".8"/><path d="M57 92 h6" stroke="#B8860B" stroke-width=".8"/>';
case'leaf':return '<path d="M36 36 Q38 24 48 26 Q46 36 36 36Z" fill="#9EE6A8" stroke="#5DBB6A" stroke-width=".7"/><path d="M37 35 L46 27" stroke="#5DBB6A" stroke-width=".6"/>';}return''}
export const CHARACTERS = DATA.map(h => ({ id: ({cat:'cat',dog:'dog',bunny:'bunny',sheep:'sheep',heart:'heart',star:'star',drop:'drop',bee:'bee',fox:'fox',pony:'pony'})[h.ear], name: h.n, kind: h.k, ending: h.e }));
const BY_ID = Object.fromEntries(DATA.map((h, i) => [CHARACTERS[i].id, h]));
export const STAGES = 8;
export const DECORATIONS = [
  { id: 'pin-heart', name: '하트 핀' }, { id: 'flower', name: '꽃' }, { id: 'star-clip', name: '별 핀' }, { id: 'ribbon-blue', name: '파란 리본' },
  { id: 'glasses', name: '하트 안경' }, { id: 'shell-necklace', name: '조개 목걸이' }, { id: 'bell', name: '방울' }, { id: 'leaf', name: '나뭇잎' },
];
export function drawCharacter(id, stage, opts = {}) {
  const h = BY_ID[id] || DATA[0];
  const s = Math.max(0, Math.min(STAGES - 1, Math.floor(Number(stage) || 0)));
  const deco = DECORATIONS.some(d => d.id === opts.decoration) ? opts.decoration : null;
  return draw(h, s, deco);
}
export function pickCharacter(usedIds, rng = Math.random) {
  const all = CHARACTERS.map(c => c.id);
  const pool = all.filter(id => !(usedIds || []).includes(id));
  const list = pool.length ? pool : all;
  return list[Math.floor(rng() * list.length) % list.length];
}

// ---- v2: clay-render images (assets/char/<id>-<1..8>.webp); SVG above stays as the offline/failed-load fallback
const ASSET_BASE = (() => { try { return new URL('../assets/', import.meta.url).href; } catch { return 'assets/'; } })();
export function charUrl(id, stage) {
  const s = Math.max(0, Math.min(STAGES - 1, Math.floor(Number(stage) || 0)));
  return `${ASSET_BASE}char/${BY_ID[id] ? id : 'cat'}-${s + 1}.webp`;
}
// images 5-8 come from a second sheet and the final one carries a big glow, so widen them to keep growth visible
const STAGE_WIDTH = [80, 84, 88, 92, 108, 112, 118, 140];
const DECO_BOX = { glasses: '34 48 52 28', 'shell-necklace': '42 80 36 22', bell: '42 80 36 22' };
export function decoSticker(id) {
  if (!DECORATIONS.some(d => d.id === id)) return '';
  const h = DATA[0];
  return `<svg class="deco" viewBox="${DECO_BOX[id] || '26 16 30 30'}">${decoration(id, h)}</svg>`;
}
// HTML for a character: image with SVG fallback, optional decoration sticker
export function charHtml(id, stage, opts = {}) {
  const deco = opts.decoration ? decoSticker(opts.decoration) : '';
  const svg = drawCharacter(id, stage).replace(/"/g, '&quot;');
  const s = Math.max(0, Math.min(STAGES - 1, Math.floor(Number(stage) || 0)));
  const w = STAGE_WIDTH[s];
  return `<div class="charbox"><img class="charimg" style="width:${w}%;margin-left:${(100 - w) / 2}%" src="${charUrl(id, stage)}" alt="" draggable="false" onerror="this.outerHTML=this.dataset.svg" data-svg="${svg}">${deco}</div>`;
}
