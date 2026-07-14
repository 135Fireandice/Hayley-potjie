/* ============ MOBILE DETECTION ============ */
const isMobile = window.matchMedia("(max-width: 820px)").matches || 'ontouchstart' in window;

/* ============ SECTION-AWARE BOW SYSTEM ============ */
// Each section has its own bow personality
const BOW_SCENES = {
hero: {
emojis: ['🎀','🎀','🎀','🎀','🎀','🎀','🎀','🎀','💝','🎀','✨','💎'],
count: [70, 55, 32],   // [back, mid, fore]
minSize: [10, 22, 40],
maxSize: [20, 40, 70],
minOp:   [0.15, 0.30, 0.55],
maxOp:   [0.35, 0.60, 0.85],
speed:   [7, 9, 11],   // animation duration range start
anims:   ['bowA','bowB','bowC'],
filter:  'hue-rotate(0deg)',
},
details: {
emojis: ['🎀','🎀','🎀','💛','🎀','🎀','🎁','🎀','✨','💎'],
count: [55, 45, 28],
minSize: [10, 20, 35],
maxSize: [18, 36, 58],
minOp:   [0.12, 0.25, 0.45],
maxOp:   [0.28, 0.50, 0.75],
speed:   [9, 11, 13],  // slower, more relaxed
anims:   ['bowB','bowA','bowC'],
filter:  'hue-rotate(30deg) saturate(1.2)',
},
bring: {
emojis: ['🎀','🎀','🎀','🧥','❄️','🎀','🎀','🍃','🎀','✨'],
count: [60, 48, 24],
minSize: [10, 20, 36],
maxSize: [20, 38, 62],
minOp:   [0.18, 0.32, 0.50],
maxOp:   [0.38, 0.62, 0.80],
speed:   [6, 8, 10],
anims:   ['bowC','bowA','bowB'],
filter:  'hue-rotate(150deg) saturate(1.3)',  // shift toward mint/teal
},
rsvp: {
emojis: ['🎀','🎀','🖤','🎀','🎀','✨','🎀','🎀','💎','💫'],
count: [60, 46, 22],
minSize: [8, 18, 32],
maxSize: [18, 34, 55],
minOp:   [0.20, 0.35, 0.55],
maxOp:   [0.40, 0.65, 0.85],
speed:   [5, 7, 9],   // faster, more energetic
anims:   ['bowA','bowC','bowB'],
filter:  'hue-rotate(300deg) saturate(0.8) brightness(1.4)',  // gold/cream shift
},
ticket: {
emojis: ['🎀','🎟️','🎀','🎉','🎀','🎀','💚','🎀','🎊','🎀','✨','💎','💫'],
count: [80, 60, 36],
minSize: [10, 22, 42],
maxSize: [22, 42, 75],
minOp:   [0.20, 0.38, 0.60],
maxOp:   [0.42, 0.70, 0.92],
speed:   [4, 6, 8],   // fast and celebratory
anims:   ['bowC','bowB','bowA'],
filter:  'hue-rotate(120deg) saturate(1.5)',  // vivid green celebration
},
};

// Drastically reduce bow counts on mobile to save GPU
if (isMobile) {
    for (let key in BOW_SCENES) {
        BOW_SCENES[key].count = BOW_SCENES[key].count.map(c => Math.max(5, Math.floor(c / 4)));
    }
}

const bowBg = document.getElementById('bowBackground');
let currentScene = null;
let bowNodes = [];

/* ============ AMBIENT GLITTER LAYER ============ */
const sparkleLayer = document.createElement('div');
sparkleLayer.className = 'sparkle-layer';
document.body.appendChild(sparkleLayer);

const sparkleCount = isMobile ? 20 : 60;
for (let i = 0; i < sparkleCount; i++) {
const s = document.createElement('span');
const size = 3 + Math.random() * 5;
s.style.cssText = `width:${size}px;height:${size}px; left:${Math.random() * 100}%; top:${Math.random() * 100}%; animation-duration:${2 + Math.random() * 3}s; animation-delay:-${Math.random() * 5}s;`;
sparkleLayer.appendChild(s);
}

// CSS animations injected once
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes bowA { 0%,100% { transform: translate(0,0) rotate(0deg) scale(1); } 33% { transform: translate(14px,-18px) rotate(18deg) scale(1.06); } 66% { transform: translate(-10px,16px) rotate(-10deg) scale(0.94); } } @keyframes bowB { 0%,100% { transform: translate(0,0) rotate(0deg); } 25% { transform: translate(-22px,12px) rotate(-22deg); } 75% { transform: translate(18px,-14px) rotate(14deg); } } @keyframes bowC { 0%,100% { transform: translate(0,0) scale(1) rotate(0deg); } 50% { transform: translate(12px,24px) scale(1.12) rotate(28deg); } } .bow-background { transition: filter 1.2s ease; } .bow-layer-bow { position:absolute; line-height:1; user-select:none; pointer-events:none; will-change:transform; transition: opacity 0.8s ease; }`;
document.head.appendChild(styleEl);

function buildScene(scene) {
if (currentScene === scene) return;
currentScene = scene;
const cfg = BOW_SCENES[scene];
// Fade out old bows
bowNodes.forEach(n => { n.style.opacity = '0'; });
setTimeout(() => {
// Clear
bowBg.innerHTML = '';
bowNodes = [];
// Set filter on container for colour shift
 bowBg.style.filter = cfg.filter;
 
 // Remove drop-shadow on mobile (massive GPU saver)
 const shadow = isMobile ? '' : 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.07));';
 
 // Build 3 layers
 [0, 1, 2].forEach(layerIdx => {
   const count   = cfg.count[layerIdx];
   const minS    = cfg.minSize[layerIdx];
   const maxS    = cfg.maxSize[layerIdx];
   const minO    = cfg.minOp[layerIdx];
   const maxO    = cfg.maxOp[layerIdx];
   const anim    = cfg.anims[layerIdx];
   const speedBase = cfg.speed[layerIdx];
   for (let i = 0; i < count; i++) {
     const el = document.createElement('div');
     el.className = 'bow-layer-bow';
     const size = minS + Math.random() * (maxS - minS);
     const op   = minO + Math.random() * (maxO - minO);
     const dur  = speedBase + Math.random() * 5;
     el.textContent = cfg.emojis[Math.floor(Math.random() * cfg.emojis.length)];
     el.style.cssText = `
       font-size: ${size}px;
       left: ${Math.random() * 100}%;
       top:  ${Math.random() * 100}%;
       opacity: 0;
       transform: rotate(${Math.random() * 360}deg);
       animation: ${anim} ${dur}s ease-in-out infinite;
       animation-delay: -${Math.random() * dur}s;
       ${shadow}
       z-index: ${layerIdx};
     `;
     bowBg.appendChild(el);
     bowNodes.push(el);
     // Stagger fade-in
     setTimeout(() => { el.style.opacity = String(op); }, 50 + Math.random() * 400);
   }
 });
}, 400); // wait for fade-out
}

// Observe each section and switch scenes
const sections = [
{ id: 'hero',         scene: 'hero'    },
{ id: 'details',      scene: 'details' },
{ id: 'bring',        scene: 'bring'   },
{ id: 'rsvp',         scene: 'rsvp'    },
{ id: 'ticketSection',scene: 'ticket'  },
];
const sectionObserver = new IntersectionObserver(entries => {
entries.forEach(e => {
if (e.isIntersecting) {
const s = sections.find(s => s.id === e.target.id);
if (s) buildScene(s.scene);
}
});
}, { threshold: 0.3 });
sections.forEach(s => {
const el = document.getElementById(s.id);
if (el) sectionObserver.observe(el);
});
// Start with hero
buildScene('hero');

/* ============ CUSTOM CURSOR ============ */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
window.addEventListener('mousemove',e=>{
mx=e.clientX;my=e.clientY;
dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
});
function animateRing(){
rx+=(mx-rx)*.15;ry+=(my-ry)*.15; // Fixed syntax error here
ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll('a,button,input,textarea,li,.card,.fee-btn').forEach(el=>{
el.addEventListener('mouseenter',()=>ring.classList.add('hover'));
el.addEventListener('mouseleave',()=>ring.classList.remove('hover'));
});

/* ============ COUNTDOWN ============ */
const cdD=document.getElementById('cdD'),cdH=document.getElementById('cdH');
const cdM=document.getElementById('cdM'),cdS=document.getElementById('cdS');
const target=new Date('2026-07-25T13:00:00').getTime();
function tick(){
const d=target-Date.now();if(d<=0)return;
const days=Math.floor(d/86400000),hrs=Math.floor(d%86400000/3600000),
min=Math.floor(d%3600000/60000),sec=Math.floor(d%60000/1000);
cdD.textContent=String(days).padStart(2,'0');
cdH.textContent=String(hrs).padStart(2,'0');
cdM.textContent=String(min).padStart(2,'0');
cdS.textContent=String(sec).padStart(2,'0');
}
tick();setInterval(tick,1000);

/* ============ 3D TILT CARDS ============ */
document.querySelectorAll('[data-tilt]').forEach(card=>{
card.addEventListener('mousemove',e=>{
const r=card.getBoundingClientRect();
const x=(e.clientX-r.left)/r.width-.5;
const y=(e.clientY-r.top)/r.height-.5;
card.style.transform=`translateY(-6px) rotateX(${-y*10}deg) rotateY(${x*10}deg)`;
});
card.addEventListener('mouseleave',()=>card.style.transform='');
});

/* ============ SCROLL REVEAL ============ */
const io=new IntersectionObserver(entries=>{
entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')});
},{threshold:.15});
document.querySelectorAll('.card,.section-title,.bring-list li,.rsvp-form').forEach(el=>{
el.classList.add('reveal');io.observe(el);
});

/* ============ BRING LIST ============ */
document.getElementById('bringList').addEventListener('click',e=>{
const li=e.target.closest('li');
if(li){li.classList.toggle('done');toast(li.classList.contains('done')?'Added! 🎉':'Removed')}
});

/* ============ ENTRANCE FEE PICKER ============ */
const MAX = 8;
function loadCounts(){
return {
chips:  parseInt(sessionStorage.getItem('fee_chips')  || '0'),
sweets: parseInt(sessionStorage.getItem('fee_sweets') || '0'),
};
}
function saveCounts(counts){
sessionStorage.setItem('fee_chips',  counts.chips);
sessionStorage.setItem('fee_sweets', counts.sweets);
}
let counts = loadCounts();
let userChoice = null;
const feeChipsBtn   = document.getElementById('feeChips');
const feeSweetsBtn  = document.getElementById('feeSweetsBtn');
const chipsCountEl  = document.getElementById('chipsCount');
const sweetsCountEl = document.getElementById('sweetsCount');
const chipsBarEl    = document.getElementById('chipsBar');
const sweetsBarEl   = document.getElementById('sweetsBar');
const feeSelectedEl = document.getElementById('feeSelected');
const feeSelectedTxt= document.getElementById('feeSelectedText');
const feeClearBtn   = document.getElementById('feeClear');

function updateFeeUI(){
chipsCountEl.textContent  =  `${counts.chips} / ${MAX}` ;
sweetsCountEl.textContent =  `${counts.sweets} / ${MAX}` ;
chipsBarEl.style.width  =  `${(counts.chips / MAX) * 100}%` ;
sweetsBarEl.style.width =  `${(counts.sweets / MAX) * 100}%` ;
feeChipsBtn.classList.toggle('full',  counts.chips   >= MAX);
feeSweetsBtn.classList.toggle('full', counts.sweets  >= MAX);
feeChipsBtn.disabled  = counts.chips   >= MAX  && userChoice !== 'chips'; // Fixed & & syntax error
feeSweetsBtn.disabled = counts.sweets  >= MAX  && userChoice !== 'sweets'; // Fixed & & syntax error
feeChipsBtn.classList.toggle('selected',  userChoice === 'chips');
feeSweetsBtn.classList.toggle('selected', userChoice === 'sweets');
if(userChoice){
feeSelectedEl.classList.remove('hidden'); // Fixed typo
const emoji = userChoice === 'chips' ? '🍟' : '🍬';
feeSelectedTxt.textContent =  `You're bringing: ${emoji} ${userChoice.charAt(0).toUpperCase()+userChoice.slice(1)}` ;
} else {
feeSelectedEl.classList.add('hidden');
}
}
function pickFee(type){
if(userChoice === type) return;
if(userChoice){
counts[userChoice] = Math.max(0, counts[userChoice] - 1);
}
if(counts[type] >= MAX){
toast(`Oops! ${type === 'chips' ? '🍟 Chips' : '🍬 Sweets'} is full — choose the other one!`);
return;
}
userChoice = type;
counts[type]++;
saveCounts(counts);
updateFeeUI();
toast(type === 'chips' ? '🍟 Chips locked in! Bring your fave flavour' : '🍬 Sweets locked in! The sweeter the better');
confetti();
}
function clearFee(){
if(!userChoice) return;
counts[userChoice] = Math.max(0, counts[userChoice] - 1);
saveCounts(counts);
userChoice = null;
updateFeeUI();
toast('No worries, pick again 👆');
}
feeChipsBtn.addEventListener('click', () => pickFee('chips'));
feeSweetsBtn.addEventListener('click', () => pickFee('sweets'));
feeClearBtn.addEventListener('click', clearFee);
updateFeeUI();

/* ============ RSVP FORM ============ */
const form     = document.getElementById('rsvpForm');
const rsvpName = document.getElementById('rsvpName');
const rsvpBtn  = document.getElementById('rsvpBtn');
let holdTimer;
rsvpBtn.addEventListener('mousedown',()=>{
holdTimer=setTimeout(()=>triggerEgg('hold','You held the button! Secret: the potjie recipe is a family secret 👀'),3000);
});
rsvpBtn.addEventListener('mouseup',()=>clearTimeout(holdTimer));
rsvpBtn.addEventListener('mouseleave',()=>clearTimeout(holdTimer));
form.addEventListener('submit',e=>{
e.preventDefault();
const name=rsvpName.value.trim();
if(!name) return;
if(!userChoice){
toast('Pick your entrance fee first! 🎟️');
return;
}
const code='POTJIE-'+Math.random().toString(36).substring(2,6).toUpperCase();
document.getElementById('ticketName').textContent=name.toUpperCase();
document.getElementById('ticketCode').textContent='#'+code;
document.getElementById('ticketFee').textContent=userChoice==='chips'?'🍟 CHIPS':'🍬 SWEETS';
document.getElementById('ticketSection').classList.remove('hidden');
setTimeout(()=>document.getElementById('ticketSection').scrollIntoView({behavior:'smooth'}),100);
confetti();
toast(`You're in! 🎉 See you 25 July — don't forget the ${userChoice}!`);
});

/* ============ TOAST ============ */
const toastEl=document.getElementById('toast');
let toastT;
function toast(msg){
toastEl.textContent=msg;toastEl.classList.add('show');
clearTimeout(toastT);
toastT=setTimeout(()=>toastEl.classList.remove('show'),3000);
}

/* ============ CONFETTI (now with bows & bling) ============ */
function confetti(){
const colors=['#009b77','#c8b273','#e63946','#b2e1d6','#ded0ab'];
const bling=['🎀','✨','💎','💫','🎉'];
const cCount = isMobile ? 20 : 50; // Reduced on mobile
const bCount = isMobile ? 10 : 24; // Reduced on mobile
for(let i=0;i<cCount;i++){
const c=document.createElement('div');
c.className='confetti';
c.style.left=Math.random()*100+'vw';
c.style.background=colors[Math.floor(Math.random()*colors.length)];
c.style.animationDuration=(2+Math.random()*2)+'s';
c.style.transform=`rotate(${Math.random()*360}deg)`;
document.body.appendChild(c);
setTimeout(()=>c.remove(),4500);
}
// Bedazzled pieces — bows, gems and sparkles fluttering down
for(let i=0;i<bCount;i++){
const b=document.createElement('div');
b.className='confetti';
b.style.left=Math.random()*100+'vw';
b.style.background='transparent';
b.style.fontSize=(14+Math.random()*14)+'px';
b.style.lineHeight='1';
b.textContent=bling[Math.floor(Math.random()*bling.length)];
b.style.animationDuration=(2.4+Math.random()*2.2)+'s';
document.body.appendChild(b);
setTimeout(()=>b.remove(),5000);
}
}

/* ============ MOUSE SPARKLE TRAIL ============ */
// Disabled on mobile to save battery and prevent touch lag
if (!isMobile) {
    let lastSparkleTime = 0;
    window.addEventListener('mousemove', e => {
        const now = Date.now();
        if (now - lastSparkleTime < 90) return; // throttle
        lastSparkleTime = now;
        const s = document.createElement('div');
        s.className = 'mouse-sparkle';
        s.textContent = Math.random() > 0.5 ? '✨' : '🎀';
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 900);
    });
}

/* ============ EASTER EGGS ============ */
const found=new Set();
const panel=document.getElementById('secretPanel');
const secretMsg=document.getElementById('secretMsg');
const secretCount=document.getElementById('secretCount');
function triggerEgg(id,msg){
if(found.has(id))return;
found.add(id);
secretMsg.textContent=msg;
secretCount.textContent=found.size;
panel.classList.remove('hidden');
if(found.size===15)setTimeout(()=>toast('🏆 ALL 15 SECRETS FOUND! You\'re a legend'),1500); // Fixed quote escape
}
const konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let kIdx=0;
window.addEventListener('keydown',e=>{
if(e.key===konami[kIdx]){kIdx++;if(kIdx===konami.length){document.body.classList.toggle('rainbow');triggerEgg('konami','KONAMI CODE! 🌈 Rainbow mode unlocked');kIdx=0}}
else kIdx=0;
});
let typed='';
window.addEventListener('keydown',e=>{
if(e.key.length===1){
typed+=e.key.toLowerCase();if(typed.length>20)typed=typed.slice(-20);
if(typed.includes('potjie'))triggerEgg('potjie','You typed "potjie"! 🍲 The party is coming together');
if(typed.includes('party')){triggerEgg('party','You typed "party"! 🎊 Confetti incoming');confetti()}
if(typed.includes('hello'))triggerEgg('hello','Hey there! 👋 Welcome to the secret club');
if(typed.includes('25july'))triggerEgg('25july','25 July locked in! See you there 🔥');
}
});
let dateClicks=0,dateTimer;
document.getElementById('dateCard').addEventListener('click',()=>{
dateClicks++;clearTimeout(dateTimer);
dateTimer=setTimeout(()=>dateClicks=0,500);
if(dateClicks===3){triggerEgg('date','Triple-clicked the date! 📆 It\'s real, we promise');dateClicks=0} // Fixed quote escape
});
let bottomTimer;
window.addEventListener('scroll',()=>{
clearTimeout(bottomTimer);
if(window.innerHeight+window.scrollY>=document.body.offsetHeight-10){
bottomTimer=setTimeout(()=>triggerEgg('bottom','You made it to the bottom! 🕳️ Keep exploring'),3000);
}
});
document.getElementById('logo').addEventListener('dblclick',()=>{
triggerEgg('logo','Logo spin! 🌀 You found the logo secret');
const l=document.getElementById('logo');
l.style.transition='transform 1s';
l.style.transform='rotate(720deg) scale(1.3)';
setTimeout(()=>l.style.transform='',1000);
});
window.addEventListener('contextmenu',e=>{
e.preventDefault();
triggerEgg('right','Right-click detected! 🕵️ Nice try, hacker');
});
const cdUnits=document.querySelectorAll('.cd-unit');
let cdSeq=0;
cdUnits.forEach((u,i)=>{
u.style.cursor='none';
u.addEventListener('click',()=>{
if(i===cdSeq){cdSeq++;if(cdSeq===4){triggerEgg('countdown','⏱️ Countdown cracked! 1→2→3→4');cdSeq=0}}
else cdSeq=0;
});
});
let shakeHist=[];
window.addEventListener('mousemove',e=>{
shakeHist.push({x:e.clientX,t:Date.now()});
if(shakeHist.length>10)shakeHist.shift();
if(shakeHist.length===10){
const span=shakeHist[9].t-shakeHist[0].t;
let dc=0;
for(let i=2;i<10;i++){
const d1=shakeHist[i-1].x-shakeHist[i-2].x;
const d2=shakeHist[i].x-shakeHist[i-1].x;
if(d1*d2<0)dc++;
}
if(span<1000&&dc>5&&!found.has('shake')){
triggerEgg('shake','You shook your mouse! 🌀 Screen shake activated');
document.body.classList.add('shaking');
setTimeout(()=>document.body.classList.remove('shaking'),500);
}
}
});
let scrollDir=0,lastScroll=0,dirChanges=0;
window.addEventListener('scroll',()=>{
const cur=window.scrollY;
if(cur>lastScroll&&scrollDir!=='d'){scrollDir='d';dirChanges++}
else if(cur<lastScroll&&scrollDir!=='u'){scrollDir='u';dirChanges++}
lastScroll=cur;
if(dirChanges>=6&&!found.has('scroll')){
triggerEgg('scroll','🎢 Scroll master! You zigzagged the page');
dirChanges=0;
}
});
let hiddenClicks=0;
document.querySelector('.hero-tag').addEventListener('click',()=>{
hiddenClicks++;
if(hiddenClicks===5)triggerEgg('tag','You clicked the tag 5 times! 🎀 Secret unlocked');
});
document.querySelector('.details .section-title').addEventListener('click',()=>{
triggerEgg('title','You clicked the title! 📰 Easter egg found');
});
let bringClicks=0;
document.querySelectorAll('#bringList li').forEach(li=>{
li.addEventListener('click',()=>{
bringClicks++;
if(bringClicks===10)triggerEgg('bring','10 taps on the list! 🍽️ You\'re a natural party planner'); // Fixed quote escape
});
});
setTimeout(()=>toast('Welcome! 👀 15 secrets hidden — can you find them all?'),1500);