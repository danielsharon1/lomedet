const DATA = __DATA__;
const AVATAR = "data:image/jpeg;base64,__AVATAR__";
const VERSION = "__VERSION__";
const SITE = "__SITE__";
const BASE_COURSES = DATA.courses.map(c=>({id:c.id,name:c.name,em:c.emoji,d:c.desc}));
const TOPICS = Object.fromEntries(DATA.courses.map(c=>[c.id,(c.topics||[]).map(t=>({n:t.name,s:t.lessons||''}))]));
const LV = {1:'קל',2:'בינוני',3:'קשה'};
const LVD = {1:'מושגים והגדרות בסיסיים',2:'הבנה – למה ואיך',3:'חיבור בין נושאים ופרטים עדינים'};
const PTS = {1:10,2:15,3:20};
const N = 15;
const QUOTES = [
  'כל שאלה שאת פותרת היום היא נקודה שלא תפספסי במבחן 💪',
  'לא צריך להיות מושלמת – רק להתחיל. השאר יגיע.',
  'עשר דקות של תרגול עכשיו שוות שעה של לחץ לפני המבחן.',
  'הטעויות של היום הן התשובות הנכונות של מחר.',
  'את יותר מוכנה ממה שאת חושבת. בואי נוכיח את זה.',
  'צעד קטן כל יום – וקפיצה גדולה ביום המבחן.',
  'המוח שלך הוא שריר. היום – אימון 🧠',
  'כל מבחן כאן הוא חזרה גנרלית. במבחן האמיתי כבר תכירי את הדרך.',
  'אל תחכי למוטיבציה – תתחילי, והיא תבוא בדרך.',
  'גם דף אחד נוסף הוא התקדמות. כל התקדמות נחשבת.',
  'את לא לבד בזה – רק את, השאלות, וקצת סבלנות ✨',
  'מי שמתרגלת – זוכרת. מי שזוכרת – מצליחה.',
  'היום את לומדת, מחר את חוגגת 🎉',
  'כל "לא נכון" מלמד אותך משהו שאף סיכום לא ילמד.',
  'קצת מאמץ עכשיו = הרבה שקט לפני המבחן.',
  'תאמיני בעצמך – כבר עשית דברים קשים מזה.',
  'מבחן אחד ביום מרחיק את הלחץ 😉',
  'הצלחה היא סכום של מאמצים קטנים שחוזרים כל יום.',
  'את בונה ידע לבנה אחרי לבנה. עוד לבנה היום?',
  'כשזה מרגיש קשה – זה סימן שאת לומדת משהו חדש.',
  'הגרסה של מחר שלך תודה לך על הלמידה של היום.',
  'תתחילי מהקל, תגיעי לקשה. צעד אחרי צעד.',
  'אין קיצורי דרך – אבל יש דרך כיפית יותר. הנה היא 🙂',
  'עוד מבחן אחד קטן, ואת קרובה יותר ליעד.',
  'גם הכי חכמים התחילו משאלה ראשונה.'
];

// ---------- storage ----------
const mem = {};
const store = {
  get(k,d){try{const v=localStorage.getItem(k);return v==null?(k in mem?mem[k]:d):JSON.parse(v)}catch(e){return k in mem?mem[k]:d}},
  set(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
};
const S = Object.assign({course:'history',lvl:1,sound:true,vib:true,music:true,name:'מאיה'}, store.get('qz_settings',{}));
function persist(){store.set('qz_settings',S)}
function lvlLabel(r){return r.mode==='sim'?'⏱ סימולציה':r.mode==='focus'?'🎯 ממוקד':r.mode==='mistakes'?'🔁 טעויות':(LV[r.l]||'')}
function custom(){return store.get('qz_custom',{courses:[],q:{}})}
function allCourses(){return BASE_COURSES.concat(custom().courses)}
function courseById(id){return allCourses().find(c=>c.id===id)}
function courseQs(id){
  const base=DATA.q[id]||[];
  const cu=(custom().q[id]||[]);
  return base.concat(cu);
}
if(!courseById(S.course))S.course='history';

let Q=null;
(function(){const b=store.get('qz_board',[]);let ch=false;b.forEach((r,i)=>{if(!r.id){r.id='old'+i+'_'+r.d;ch=true}});if(ch)store.set('qz_board',b)})();
const $=id=>document.getElementById(id);
function go(s){document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));$('s-'+s).classList.add('on');window.scrollTo(0,0);if(s==='home')renderHome();if(s==='settings')renderSettings()}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function uname(){return (S.name||'').trim()||'מאיה'}

// ---------- home ----------
function segHTML(el,cb){el.innerHTML=[1,2,3].map(l=>`<button class="${S.lvl==l?'sel':''}" data-l="${l}">${LV[l]}</button>`).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{S.lvl=+b.dataset.l;persist();cb()})}
function renderHome(){
  $('courses').innerHTML=allCourses().map(c=>{const n=courseQs(c.id).length;const rd=readiness(c.id),dt=daysTo(c.id);return `<button class="course ${S.course===c.id?'sel':''}" data-c="${esc(c.id)}"><span class="em">${esc(c.em)}</span><span class="cinfo"><b>${esc(c.name)}</b><small>${esc(c.d||'')} · ${n} שאלות</small>${rd!=null||dt!=null&&dt>=0?`<span class="cbadges">${rd!=null?`<i class="rb ${rd>=75?'g':rd>=50?'y':'r'}">מוכנות ${rd}%</i>`:''}${dt!=null&&dt>=0?`<i class="db">📅 ${dt===0?'היום':'עוד '+dt+' ימים'}</i>`:''}</span>`:''}</span></button>`}).join('');
  $('courses').querySelectorAll('.course').forEach(b=>b.onclick=()=>{S.course=b.dataset.c;persist();buzz(8);renderHome()});
  segHTML($('lvlHome'),renderHome);
  const avail=courseQs(S.course).filter(q=>q.l===S.lvl).length;
  $('lvdesc').textContent=LVD[S.lvl]+' · '+avail+' שאלות ברמה הזאת';
  setNames();
  const pr=store.get('qz_progress',null),rb=$('resumeBox');
  if(pr&&pr.qs&&!pr.finished){const c=courseById(pr.course)||{em:'',name:''};const done=pr.mode==='sim'?Object.keys(pr.answers||{}).length:pr.i;rb.style.display='block';$('resumeTxt').textContent=`${c.em} ${c.name} · ${pr.mode==='sim'?'סימולציה':'מבחן'} · ${done}/${pr.qs.length} שאלות${pr.mode==='sim'?' · נשארו '+fmtTime(pr.remain):''}`}else rb.style.display='none';
  renderHeroInfo();
  $('modeSeg').querySelectorAll('button').forEach(b=>b.classList.toggle('sel',b.dataset.m===(S.mode||'quiz')));
  const cardsMode=S.mode==='cards';$('lvlBlock').style.display=cardsMode?'none':'block';
  $('startBtn').textContent=cardsMode?'התחילי כרטיסיות 🃏':'התחילי מבחן ▸'
}
function setNames(){$('wName').textContent='היי '+uname()+' 👋';$('heroName').textContent='היי '+uname()+' ✨'}

// ---------- settings ----------
function renderSettings(){
  $('swSound').classList.toggle('on',S.sound);$('swVib').classList.toggle('on',S.vib);
  $('swMusic').classList.toggle('on',S.music);
  $('nameSet').value=S.name||'';
  renderCustomList();renderReports();renderExamDates();renderBk();
  $('remindBox').style.display=NATIVE?'block':'none';$('swRemind').classList.toggle('on',!!S.remind);$('remindAt').value=S.remindAt||'19:00';
  $('getApp').style.display=NATIVE?'none':'block';$('installNote').style.display=NATIVE?'none':'block';
  $('themeSeg').querySelectorAll('button').forEach(b=>b.classList.toggle('sel',b.dataset.t===(S.theme||'auto')));
}
function toggle(k){S[k]=!S[k];persist();renderSettings();if(k==='vib'&&S.vib)buzz(40);if(k==='sound'&&S.sound)tone(true)}

// ---------- sound fx + vibration ----------
let actx=null;
function ac(){actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();return actx}
function tone(ok){if(!S.sound)return;try{const c=ac();const notes=ok?[660,880]:[300,220];
  notes.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=ok?'sine':'triangle';o.frequency.value=f;const t=c.currentTime+i*.11;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.25,t+.02);g.gain.exponentialRampToValueAtTime(0.0001,t+.18);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.2)})}catch(e){}}
function fanfare(p){if(!S.sound)return;try{const c=ac(),t0=c.currentTime+.05;
  const seq=p>=.8?[[72,0],[76,.12],[79,.24],[84,.38],[88,.38]]:p>=.55?[[72,0],[76,.14],[79,.28],[84,.45]]:[[67,0],[72,.18],[76,.36]];
  seq.forEach(([m,d])=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=440*Math.pow(2,(m-69)/12);const t=t0+d;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.02);g.gain.exponentialRampToValueAtTime(0.0001,t+(d>.3?1.2:.5));o.connect(g).connect(c.destination);o.start(t);o.stop(t+1.3)})}catch(e){}}
function buzz(p){if(S.vib&&navigator.vibrate){try{navigator.vibrate(p)}catch(e){}}}

// ---------- background music ----------
const Music={on:false,timer:null,step:0,next:0,BEAT:60/66,
  CH:[[48,55,64,71],[45,52,60,67],[41,53,57,64],[43,50,59,62]],PL:[72,74,76,79,81,84],
  hz(m){return 440*Math.pow(2,(m-69)/12)},
  start(){if(this.on)return;try{const c=ac();
    const m=c.createGain();m.gain.value=0.0001;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1500;lp.Q.value=.3;
    const dl=c.createDelay(2);dl.delayTime.value=.42;const fb=c.createGain();fb.gain.value=.33;const wet=c.createGain();wet.gain.value=.45;
    lp.connect(m);lp.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(m);m.connect(c.destination);
    m.gain.exponentialRampToValueAtTime(0.11,c.currentTime+3);
    this.m=m;this.bus=lp;this.on=true;this.next=c.currentTime+.1;this.sched();this.timer=setInterval(()=>this.sched(),250);
  }catch(e){this.on=false}},
  stop(){if(!this.on)return;this.on=false;clearInterval(this.timer);try{const c=actx,m=this.m;m.gain.cancelScheduledValues(c.currentTime);m.gain.setValueAtTime(Math.max(m.gain.value,0.0001),c.currentTime);m.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+.9);setTimeout(()=>{try{m.disconnect()}catch(e){}},1200)}catch(e){}},
  sched(){const c=actx;while(this.next<c.currentTime+1.6){this.beat(this.step,this.next);this.next+=this.BEAT;this.step++}},
  beat(s,t){const c=actx,b=this.bus;
    if(s%8===0){const ch=this.CH[(s/8|0)%this.CH.length],dur=this.BEAT*8+1.2;
      ch.forEach((n,i)=>['sine','triangle'].forEach((ty,k)=>{const o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.value=this.hz(n);o.detune.value=k?6:-4;
        const v=(ty==='sine'?.09:.035)*(i===0?1.1:1);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+1.8);g.gain.setValueAtTime(v,t+dur-2.4);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
        o.connect(g);g.connect(b);o.start(t);o.stop(t+dur+.05)}))}
    if(s%2===1&&Math.random()<.55){const n=this.PL[Math.floor(Math.random()*this.PL.length)],o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=this.hz(n);
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.02);g.gain.exponentialRampToValueAtTime(0.0001,t+1.6);o.connect(g);g.connect(b);o.start(t);o.stop(t+1.7)}
  }};
function musicUI(){const b=$('musicBtn');b.classList.toggle('off',!S.music);b.querySelector('span').textContent=S.music?'🎵':'🔇';const sw=$('swMusic');if(sw)sw.classList.toggle('on',S.music)}
function toggleMusic(e){if(e)e.stopPropagation();S.music=!S.music;persist();S.music?Music.start():Music.stop();musicUI();buzz(15)}
function duck(on){try{if(Music.on&&Music.m){const c=actx,g=Music.m.gain;g.cancelScheduledValues(c.currentTime);g.setValueAtTime(Math.max(g.value,0.0001),c.currentTime);g.exponentialRampToValueAtTime(on?0.025:0.11,c.currentTime+(on?.4:1.5))}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)Music.stop();else if(S.music&&!Music.on&&actx)Music.start()});

// ---------- welcome ----------
function showQuote(){const last=store.get('qz_lastq',-1);let i;do{i=Math.floor(Math.random()*QUOTES.length)}while(QUOTES.length>1&&i===last);store.set('qz_lastq',i);$('wQuote').textContent=QUOTES[i]}
function enterApp(){$('welcome').classList.add('hide');setTimeout(()=>$('welcome').style.display='none',550);
  ac();if(S.music)Music.start();buzz(20);
  if(!store.get('qz_tour_done',false))setTimeout(startTour,700)}

// ---------- quiz (practice / focused / simulation) ----------
const SIM = Object.fromEntries(DATA.courses.map(c=>[c.id,{n:(c.sim||{}).questions||20,min:(c.sim||{}).minutes||40,tf:(c.sim||{}).true_false||0}]));
function setQText(q){$('qtext').innerHTML=(q.tf?'<span class="tftag">נכון או לא נכון?</span>':'')+esc(q.q)}
function optOrder(q){if(q.tf)return q.o[0]==='נכון'?[0,1]:[1,0];return shuffle(q.o.map((_,i)=>i))}
function optsClass(q){$('opts').classList.toggle('tfwrap',!!q.tf)}
function simCfg(id){return SIM[id]||{n:20,min:40,note:'20 שאלות ב-40 דקות'}}
function reportedIds(){return new Set(store.get('qz_reports',[]).map(r=>r.qid))}
function usable(id){const rep=reportedIds();return courseQs(id).filter(q=>!rep.has(q.id))}
function pickQuestions(){
  const all=usable(S.course).filter(q=>q.l===S.lvl);
  const seenKey='qz_seen_'+S.course+'_'+S.lvl;
  let seen=store.get(seenKey,[]);
  const fresh=shuffle(all.filter(q=>!seen.includes(q.id)));
  const old=shuffle(all.filter(q=>seen.includes(q.id)));
  let chosen=fresh.slice(0,N);
  if(chosen.length<N){const fill=old.slice(0,N-chosen.length);chosen=chosen.concat(fill);seen=fill.map(q=>q.id)}
  seen=seen.concat(chosen.filter(q=>!seen.includes(q.id)).map(q=>q.id));
  store.set(seenKey,seen);
  return shuffle(chosen);
}
function pickSim(course){
  const cfg=simCfg(course),all=usable(course);
  const seenKey='qz_seen_sim_'+course;let seen=store.get(seenKey,[]);
  const tfPool=all.filter(q=>q.tf),mcAll=all.filter(q=>!q.tf);
  const nTf=Math.min(tfPool.length,Math.round(cfg.n*(cfg.tf||0))),nMc=cfg.n-nTf;
  let chosen=shuffle(tfPool.filter(q=>!seen.includes(q.id))).concat(shuffle(tfPool.filter(q=>seen.includes(q.id)))).slice(0,nTf);
  const want={1:Math.round(nMc*.4),2:Math.round(nMc*.4)};want[3]=nMc-want[1]-want[2];
  [1,2,3].forEach(l=>{const pool=mcAll.filter(q=>q.l===l);const f=shuffle(pool.filter(q=>!seen.includes(q.id))),o=shuffle(pool.filter(q=>seen.includes(q.id)));chosen=chosen.concat(f.concat(o).slice(0,want[l]))});
  if(chosen.length<cfg.n){const rest=shuffle(all.filter(q=>!chosen.includes(q)));chosen=chosen.concat(rest.slice(0,cfg.n-chosen.length))}
  seen=seen.concat(chosen.map(q=>q.id));if(seen.length>all.length)seen=chosen.map(q=>q.id);store.set(seenKey,seen);
  return shuffle(chosen);
}
function pickFocus(course,topic){
  const st=qStats(course),pool=usable(course).filter(q=>topicOf(course,q)===topic);
  const missed=shuffle(pool.filter(q=>st.q[q.id]&&st.q[q.id].bad>0)),rest=shuffle(pool.filter(q=>!(st.q[q.id]&&st.q[q.id].bad>0)));
  return missed.concat(rest).slice(0,N);
}
function pickMistakes(course){
  const st=qStats(course);const pool=usable(course).filter(q=>st.q[q.id]&&st.q[q.id].last===false);
  return shuffle(pool).slice(0,N);
}
function beginQuiz(qs,mode,extra){
  if(!qs.length){ask('אין שאלות להצגה כאן כרגע. נסי קורס או רמה אחרים.','הבנתי',()=>{});return}
  Q=Object.assign({qs,i:0,ok:0,bad:0,items:[],course:S.course,lvl:S.lvl,mode,cur:null,answers:{},startedAt:Date.now()},extra||{});
  if(mode==='sim'){Q.remain=simCfg(S.course).min*60}
  openQuiz();
}
function setMode(m){S.mode=m;persist();buzz(8);renderHome()}
function startMain(){if(S.mode==='cards')return openCards();startQuiz()}
function startQuiz(){beginQuiz(pickQuestions(),'practice')}
function startSim(){const c=courseById(S.course),cfg=simCfg(S.course);
  ask(`סימולציית מבחן – ${c.name}\n${cfg.n} שאלות · ${cfg.min} דקות · כל הרמות.\nבלי הסברים בזמן המבחן – את כל התשובות וההסברים תראי בסוף. אפשר לחזור לשאלות קודמות ולשנות תשובה.`,'מתחילים ⏱',()=>beginQuiz(pickSim(S.course),'sim',{lvl:0}))}
function startFocus(course,topic){S.course=course;persist();beginQuiz(pickFocus(course,topic),'focus',{lvl:0,topic})}
function startMistakes(course){S.course=course;persist();beginQuiz(pickMistakes(course),'mistakes',{lvl:0})}
function modeLabel(){return Q.mode==='sim'?'⏱ סימולציה':Q.mode==='focus'?'🎯 '+topicName(Q.course,Q.topic):Q.mode==='mistakes'?'🔁 חזרה על טעויות':'רמה: '+LV[Q.lvl]}
function openQuiz(){
  const c=courseById(Q.course)||{em:'',name:''};
  $('chipCourse').textContent=c.em+' '+c.name;$('chipLvl').textContent=modeLabel();
  document.body.classList.toggle('simmode',Q.mode==='sim');
  $('chipBad').classList.remove('urgent');
  go('quiz');
  if(Q.mode==='sim'){startTimer();showSimQ()}else showQ();
}
function saveProgress(){if(!Q||Q.finished)return;const copy=Object.assign({},Q);delete copy.timer;store.set('qz_progress',copy)}
function clearProgress(){store.set('qz_progress',null);try{localStorage.removeItem('qz_progress')}catch(e){}}

// --- practice-style question (instant feedback) ---
function showQ(){
  const q=Q.qs[Q.i];
  $('count').textContent=(Q.i+1)+'/'+Q.qs.length;
  $('bar').style.width=(Q.i/Q.qs.length*100)+'%';
  $('chipOk').textContent='✓ '+Q.ok;$('chipBad').textContent='✗ '+Q.bad;
  setQText(q);
  $('fb').className='fb';$('nextBtn').classList.remove('on');$('simNav').style.display='none';
  let cur=Q.cur&&Q.cur.id===q.id?Q.cur:null;
  optsClass(q);
  if(!cur){const order=optOrder(q);cur=Q.cur={id:q.id,t:topicOf(Q.course,q),l:q.l,q:q.q,order,opts:order.map(k=>q.o[k]),correct:q.o[0],e:q.e,picks:[],first:null,done:false}}
  $('opts').innerHTML=cur.order.map(k=>`<button class="opt" data-k="${k}"><span class="dot"></span><span>${esc(q.o[k])}</span></button>`).join('');
  $('opts').querySelectorAll('.opt').forEach(b=>b.onclick=()=>answer(b));
  // restore wrong picks if resuming
  cur.picks.filter(p=>!p.ok).forEach(p=>{const k=q.o.indexOf(p.t);const b=$('opts').querySelector(`.opt[data-k="${k}"]`);if(b){b.classList.add('wrong');b.disabled=true;b.querySelector('.dot').textContent='✗'}});
  if(cur.done){ // resumed after answering correctly: show the solved state + "next"
    const b=$('opts').querySelector('.opt[data-k="0"]');b.classList.add('right');b.querySelector('.dot').textContent='✓';
    $('opts').querySelectorAll('.opt').forEach(o=>{o.disabled=true;if(o!==b)o.classList.add('dim')});
    $('fb').className='fb ok on';$('fb').innerHTML=`<b>ענית נכון 👍</b>${esc(q.e)}`;
    if(!Q.items.some(it=>it.id===cur.id))Q.items.push(cur);
    $('nextBtn').textContent=Q.i===Q.qs.length-1?'לתוצאות ←':'לשאלה הבאה ←';$('nextBtn').classList.add('on');
  }
}
function answer(b){
  const cur=Q.cur;if(cur.done||b.disabled)return;
  const q=Q.qs[Q.i],k=+b.dataset.k;
  if(k===0){
    cur.done=true;cur.picks.push({t:q.o[0],ok:true});
    if(cur.first===null){cur.first=true;Q.ok++}
    b.classList.add('right');b.querySelector('.dot').textContent='✓';
    $('opts').querySelectorAll('.opt').forEach(o=>{o.disabled=true;if(o!==b)o.classList.add('dim')});
    tone(true);buzz(30);
    $('fb').className='fb ok on';
    $('fb').innerHTML=`<b>${cur.first?pick(['נכון! 🎯','מעולה! ⭐','בדיוק! 💪','יפה מאוד! ✨']):'עכשיו זה נכון 👍'}</b>${esc(q.e)}`;
    Q.items.push(cur);
    $('nextBtn').textContent=Q.i===Q.qs.length-1?'לתוצאות ←':'לשאלה הבאה ←';
    $('nextBtn').classList.add('on');
  }else{
    const why=(q.w||[])[k-1]||'';
    cur.picks.push({t:q.o[k],ok:false,why});
    if(cur.first===null){cur.first=false;Q.bad++}
    b.classList.add('wrong');b.disabled=true;b.querySelector('.dot').textContent='✗';
    tone(false);buzz([80,60,80]);
    $('fb').className='fb bad on';
    $('fb').innerHTML=`<b>לא נכון – הנה למה 🤔</b>${esc(why)}<div style="margin-top:6px;font-weight:600">נסי שוב 👇</div>`;
  }
  $('chipOk').textContent='✓ '+Q.ok;$('chipBad').textContent='✗ '+Q.bad;
  saveProgress();
  setTimeout(()=>$('fb').scrollIntoView({behavior:'smooth',block:'nearest'}),50);
}
function nextQ(){Q.i++;Q.cur=null;if(Q.i>=Q.qs.length)return finishQuiz();saveProgress();showQ();window.scrollTo(0,0)}

// --- simulation question (no feedback, navigation, timer) ---
function showSimQ(){
  const q=Q.qs[Q.i];
  if(!Q.orders)Q.orders={};
  if(!Q.orders[q.id])Q.orders[q.id]=optOrder(q);
  optsClass(q);
  const answered=Object.keys(Q.answers).length;
  $('count').textContent=(Q.i+1)+'/'+Q.qs.length;
  $('bar').style.width=(answered/Q.qs.length*100)+'%';
  $('chipOk').textContent='✍️ '+answered+' נענו';$('chipBad').textContent='⏳ '+fmtTime(Q.remain);
  setQText(q);$('fb').className='fb';$('nextBtn').classList.remove('on');
  const sel=Q.answers[q.id];
  $('opts').innerHTML=Q.orders[q.id].map(k=>`<button class="opt ${sel===k?'chosen':''}" data-k="${k}"><span class="dot">${sel===k?'●':''}</span><span>${esc(q.o[k])}</span></button>`).join('');
  $('opts').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{Q.answers[q.id]=+b.dataset.k;buzz(12);saveProgress();showSimQ()});
  $('simNav').style.display='flex';
  $('simPrev').disabled=Q.i===0;
  $('simNext').textContent=Q.i===Q.qs.length-1?'הגשה ✓':'הבאה ←';
  $('simSubmit').style.display=Q.i===Q.qs.length-1?'none':'block';
}
function simMove(d){if(d>0&&Q.i===Q.qs.length-1)return submitSim();Q.i=Math.max(0,Math.min(Q.qs.length-1,Q.i+d));saveProgress();showSimQ();window.scrollTo(0,0)}
function submitSim(force){
  const left=Q.qs.length-Object.keys(Q.answers).length;
  const go2=()=>{stopTimer();
    Q.items=Q.qs.map(q=>{const k=Q.answers[q.id],order=Q.orders&&Q.orders[q.id]||q.o.map((_,i)=>i);const ok=k===0;
      const picks=k==null?[]:[{t:q.o[k],ok,why:ok?'':((q.w||[])[k-1]||'')}];
      return {id:q.id,t:topicOf(Q.course,q),l:q.l,q:q.q,opts:order.map(i=>q.o[i]),correct:q.o[0],e:q.e,picks,first:ok,skipped:k==null}});
    Q.ok=Q.items.filter(i=>i.first).length;Q.bad=Q.items.length-Q.ok;finishQuiz()};
  if(force)return go2();
  ask(left?`נשארו ${left} שאלות בלי תשובה. להגיש בכל זאת?`:'להגיש את המבחן?','הגשה',go2);
}
function fmtTime(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function startTimer(){stopTimer();let last=Date.now();Q.timer=setInterval(()=>{const now=Date.now();Q.remain-=(now-last)/1000;last=now;
  $('chipBad').textContent='⏳ '+fmtTime(Q.remain);$('chipBad').classList.toggle('urgent',Q.remain<300);
  if(Math.round(Q.remain)%5===0)saveProgress();
  if(Q.remain<=0){stopTimer();buzz([200,100,200]);ask('נגמר הזמן! ⏰ המבחן מוגש עכשיו.','לתוצאות',()=>{});submitSim(true)}},1000)}
function stopTimer(){if(Q&&Q.timer){clearInterval(Q.timer);Q.timer=null}}

function quitQuiz(){
  const fresh=Q&&Q.mode!=='sim'&&Q.i===0&&Q.cur&&!Q.cur.picks.length;
  if(fresh){Q=null;clearProgress();return go('home')}
  stopTimer();saveProgress();
  ask('לצאת מהמבחן? הוא נשמר – אפשר להמשיך מאותה נקודה במסך הבית.','יציאה',()=>{go('home')});
  $('mNo').onclick=()=>{$('modal').classList.remove('on');if(Q&&Q.mode==='sim')startTimer()};
}
function resumeQuiz(){const p=store.get('qz_progress',null);if(!p)return;Q=p;Q.timer=null;openQuiz()}
function discardProgress(){ask('למחוק את המבחן שלא הסתיים?','מחיקה',()=>{clearProgress();Q=null;renderHome()})}

function finishQuiz(){
  stopTimer();Q.finished=true;clearProgress();document.body.classList.remove('simmode');
  const tot=Q.qs.length,c=courseById(Q.course)||{};
  const pts=Q.items.reduce((s,it)=>s+(it.first?PTS[it.l||Q.lvl||1]:0),0);
  const rec={id:'t'+Date.now(),n:uname(),c:Q.course,cn:c.name,ce:c.em,l:Q.lvl||0,mode:Q.mode,ok:Q.ok,t:tot,p:pts,d:Date.now(),items:Q.items};
  if(Q.mode==='sim')rec.dur=Math.round(simCfg(Q.course).min*60-Math.max(0,Q.remain));
  const b=store.get('qz_board',[]);b.push(rec);
  let saved=store.set('qz_board',b);
  if(!saved){for(let i=0;i<b.length-1&&!saved;i++){if(b[i].items){delete b[i].items;saved=store.set('qz_board',b)}}}
  Q.rec=rec;
  go('result');
  $('rScore').textContent=Q.ok;$('rOk').textContent=Q.ok;$('rBad').textContent=Q.bad;$('rPts').textContent=pts;
  $('rOf').textContent='מתוך '+tot;
  const pct=tot?Q.ok/tot:0;
  $('rTitle').textContent=Q.mode==='sim'?'סיימת את הסימולציה! 🎓':'סיימת! 🎉';
  $('rGrade').textContent=Q.mode==='sim'?'ציון: '+Math.round(pct*100)+' · זמן: '+fmtTime(rec.dur||0):'';
  $('ringc').style.strokeDashoffset=465;
  setTimeout(()=>{$('ringc').style.strokeDashoffset=465*(1-pct)},60);
  $('ringc').setAttribute('stroke',pct>=.8?'#2e9e6a':pct>=.55?'#e9a23b':'#d6493f');
  $('rMsg').textContent=pct===1?'מושלם! את מוכנה למבחן 🏅':pct>=.8?'מצוין! עוד קצת ואת שם 💪':pct>=.55?'יפה! כדאי לעבור על הטעויות 📚':'זה הזמן לחזור על החומר – את בדרך הנכונה 🌱';
  $('rSaved').textContent=saved?'✓ התוצאה נשמרה אוטומטית בטבלת הניקוד':'לא הצלחתי לשמור בטלפון (אין מקום פנוי)';
  fanfare(pct);buzz(pct>=.55?[40,40,40]:60);
}
function newQuizSameMode(){if(Q&&Q.mode==='sim')return startSim();if(Q&&Q.mode==='focus')return startFocus(Q.course,Q.topic);if(Q&&Q.mode==='mistakes')return startMistakes(Q.course);startQuiz()}

// ---------- topics & weakness stats ----------
function topicList(course){return (TOPICS[course]||[]).concat(custom().q[course]&&custom().q[course].length?[{n:'חומר שהעלית',s:'קבצים'}]:[])}
function topicOf(course,q){if(typeof q.t==='number')return q.t;return (TOPICS[course]||[]).length}
function topicName(course,t){const l=topicList(course);return l[t]?l[t].n:'נושא'}
function qStats(course){
  const recs=store.get('qz_board',[]).filter(r=>r.c===course&&r.items).sort((a,b)=>a.d-b.d);
  const q={},topics={};let tot=0,ok=0;
  recs.forEach(r=>r.items.forEach(it=>{
    const s=q[it.id]||(q[it.id]={n:0,ok:0,bad:0,last:null});s.n++;if(it.first)s.ok++;else s.bad++;s.last=!!it.first;
    const t=typeof it.t==='number'?it.t:(()=>{const qq=courseQs(course).find(x=>x.id===it.id);return qq?topicOf(course,qq):-1})();
    if(t<0)return;const T=topics[t]||(topics[t]={n:0,ok:0});T.n++;if(it.first)T.ok++;tot++;if(it.first)ok++;
  }));
  return {q,topics,tot,ok,tests:recs.length,recs};
}
let statsCourse=null;
function openStats(){statsCourse=statsCourse||S.course;go('stats');renderStats()}
function renderStats(){
  const cs=allCourses();
  $('stTabs').innerHTML=cs.map(c=>`<button class="${statsCourse===c.id?'sel':''}" data-c="${esc(c.id)}">${esc(c.em+' '+c.name)}</button>`).join('');
  $('stTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{statsCourse=b.dataset.c;renderStats()});
  const st=qStats(statsCourse),tl=topicList(statsCourse);
  const pctAll=st.tot?Math.round(st.ok/st.tot*100):0;
  const wrongNow=Object.values(st.q).filter(s=>s.last===false).length;
  const rd=readiness(statsCourse);
  $('stReady').innerHTML=rd==null?'':`<div class="ready"><div class="rg" style="--p:${rd}"><b>${rd}%</b></div><div><b>מוכנות למבחן</b><p>${rd>=80?'את במצב מצוין – תמשיכי לשמור על הקצב 💪':rd>=60?'בדרך הנכונה. חזרה על הנושאים האדומים תקפיץ אותך.':'עוד יש עבודה – התחילי מהנושא שמומלץ למטה 🎯'}</p><small>מחושב מ-60 התשובות האחרונות ומכמה נושאים תרגלת</small></div></div>`;
  $('stTiles').innerHTML=`<div class="stat"><b>${st.tests}</b><small>מבחנים</small></div><div class="stat"><b>${st.tot}</b><small>תשובות</small></div><div class="stat ${pctAll>=80?'ok':pctAll<55&&st.tot?'bad':''}"><b>${st.tot?pctAll+'%':'–'}</b><small>הצלחה</small></div>`;
  // trend: last 10 tests
  const last=st.recs.slice(-10);
  $('stTrend').innerHTML=last.length>1?`<div class="label">ההתקדמות שלך – ${last.length} המבחנים האחרונים</div><div class="trend">${last.map(r=>{const p=Math.round(r.ok/r.t*100);return `<div class="tcol"><span>${p}</span><i style="height:${Math.max(6,p)}%" class="${p>=80?'g':p>=55?'y':'r'}"></i><small>${new Date(r.d).toLocaleDateString('he-IL',{day:'numeric',month:'numeric'})}</small></div>`}).join('')}</div>`:'';
  const rows=tl.map((t,i)=>{const s=st.topics[i]||{n:0,ok:0};return {i,n:t.n,s:t.s,ans:s.n,ok:s.ok,p:s.n?s.ok/s.n:null}});
  const tried=rows.filter(r=>r.ans).sort((a,b)=>a.p-b.p||b.ans-a.ans),untried=rows.filter(r=>!r.ans);
  const weak=tried.find(r=>r.p<.75&&r.ans>=3);
  $('stCall').innerHTML=!st.tot?`<div class="callout">עוד אין נתונים לקורס הזה. אחרי כמה מבחנים יופיע כאן איפה כדאי לחזור על החומר 📈</div>`:
    weak?`<div class="callout warn"><b>כדאי לחזור על: ${esc(weak.n)}</b>${weak.s?`<span>${esc(weak.s)} בסיכומים</span>`:''}<p>ענית נכון רק על ${Math.round(weak.p*100)}% מהשאלות בנושא הזה (${weak.ok} מתוך ${weak.ans}).</p><button class="btn dark" onclick="startFocus('${esc(statsCourse)}',${weak.i})">🎯 תרגול ממוקד על הנושא</button></div>`:
    `<div class="callout good"><b>אין נקודת חולשה בולטת 🎉</b><p>בכל הנושאים שתרגלת את מעל 75%. נסי רמה קשה יותר או סימולציה.</p></div>`;
  $('stMist').innerHTML=wrongNow?`<button class="btn ghost" onclick="startMistakes('${esc(statsCourse)}')">🔁 חזרה על ${Math.min(wrongNow,N)} שאלות שטעית בהן לאחרונה</button>`:'';
  $('stBars').innerHTML=tried.concat(untried).map(r=>{const p=r.p==null?null:Math.round(r.p*100);const cls=p==null?'none':p>=80?'g':p>=55?'y':'r';
    return `<button class="tbar" onclick="${r.ans?`startFocus('${esc(statsCourse)}',${r.i})`:`startFocus('${esc(statsCourse)}',${r.i})`}"><div class="tl"><b>${esc(r.n)}</b><small>${r.s?esc(r.s)+' · ':''}${r.ans?r.ok+'/'+r.ans+' נכונות':'עוד לא תרגלת'}</small></div><div class="track"><i class="${cls}" style="width:${p==null?0:Math.max(4,p)}%"></i></div><div class="tp ${cls}">${p==null?'–':p+'%'}</div></button>`}).join('');
}

// ---------- report a question ----------
let repCtx=null;
function openReport(fromHist,it){
  const q=fromHist?it:(Q&&Q.qs[Q.i]);if(!q)return;
  repCtx={qid:q.id,q:q.q,correct:fromHist?q.correct:q.o[0],course:fromHist?fromHist:Q.course};
  $('repQ').textContent=q.q;$('repNote').value='';
  $('repReasons').querySelectorAll('button').forEach((b,i)=>b.classList.toggle('sel',i===0));
  $('report').classList.add('on');
}
function repReason(b){$('repReasons').querySelectorAll('button').forEach(x=>x.classList.toggle('sel',x===b))}
function sendReport(){
  const r=$('repReasons').querySelector('.sel');
  const list=store.get('qz_reports',[]);
  list.push(Object.assign({},repCtx,{reason:r?r.textContent:'',note:$('repNote').value.trim(),d:Date.now()}));
  store.set('qz_reports',list);$('report').classList.remove('on');buzz(30);
  ask('תודה! 🙏 השאלה סומנה ולא תופיע שוב במבחנים. אפשר לשלוח את כל הדיווחים מההגדרות.','מעולה',()=>{});
}
function renderReports(){const l=store.get('qz_reports',[]);$('repCount').textContent=l.length?`יש ${l.length} דיווחים`:'אין דיווחים כרגע';
  $('repList').innerHTML=l.map((r,i)=>`<div class="cur"><span>${esc(r.reason)} – ${esc(r.q.slice(0,50))}…</span><button onclick="delReport(${i})">החזרה</button></div>`).join('');
  $('repCopy').style.display=l.length?'block':'none'}
function delReport(i){const l=store.get('qz_reports',[]);l.splice(i,1);store.set('qz_reports',l);renderReports()}
function copyReports(){const l=store.get('qz_reports',[]);const txt='דיווחים על שאלות – לומדת למבחן\n\n'+l.map((r,i)=>`${i+1}. [${(courseById(r.course)||{}).name||r.course}] ${r.q}\nהתשובה שסומנה כנכונה: ${r.correct}\nסיבה: ${r.reason}${r.note?'\nהערה: '+r.note:''}`).join('\n\n');
  const done=()=>{$('repCopyMsg').textContent='✓ הועתק! עכשיו אפשר להדביק בוואטסאפ ולשלוח';};
  try{navigator.clipboard.writeText(txt).then(done,()=>{$('repText').style.display='block';$('repText').value=txt;$('repCopyMsg').textContent='העתיקי את הטקסט מהתיבה:'})}catch(e){$('repText').style.display='block';$('repText').value=txt}}

// ---------- theme ----------
function applyTheme(){const t=S.theme||'auto';const dark=t==='dark'||(t==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';const m=document.querySelector('meta[name=theme-color]');if(m)m.content=dark?'#0f1513':'#1f3b34'}
function setTheme(t){S.theme=t;persist();applyTheme();renderSettings()}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme)}catch(e){}

// ---------- leaderboard ----------
let boardTab='all';
let boardSort='pts',boardLvl=0;
function setLvlF(l){boardLvl=l;renderBoard()}
function delTest(id,back){ask('למחוק את המבחן הזה מההיסטוריה?','מחיקה',()=>{store.set('qz_board',store.get('qz_board',[]).filter(r=>r.id!==id));buzz(30);openBoard()})}
function openBoard(){go('board');renderBoard()}
function renderBoard(){
  const tabs=[{id:'all',name:'הכול'}].concat(allCourses().map(c=>({id:c.id,name:c.em+' '+c.name})));
  $('bTabs').innerHTML=tabs.map(t=>`<button class="${boardTab===t.id?'sel':''}" data-t="${esc(t.id)}">${esc(t.name)}</button>`).join('');
  $('bTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{boardTab=b.dataset.t;renderBoard()});
  let b=store.get('qz_board',[]);
  if(boardTab!=='all')b=b.filter(r=>r.c===boardTab);
  if(boardLvl==4)b=b.filter(r=>r.mode==='sim');else if(boardLvl)b=b.filter(r=>r.l===boardLvl&&r.mode!=='sim');
  $('lvF').querySelectorAll('button').forEach(x=>x.classList.toggle('sel',+x.dataset.l===boardLvl));
  $('bCount').textContent=b.length?b.length+' מבחנים':'';
  if(boardSort==='date')b.sort((x,y)=>y.d-x.d);else b.sort((x,y)=>(y.ok/y.t)-(x.ok/x.t)||y.t-x.t||y.d-x.d);
  $('sortPts').classList.toggle('sel',boardSort==='pts');$('sortDate').classList.toggle('sel',boardSort==='date');
  if(!b.length){$('lb').innerHTML='<div class="empty">עוד אין תוצאות. סיימי מבחן והוא יישמר כאן אוטומטית 💪</div>';return}
  const medal=['🥇','🥈','🥉'];
  $('lb').innerHTML=b.slice(0,50).map((r,i)=>{const c=courseById(r.c)||{em:r.ce||'',name:r.cn||''};const dt=new Date(r.d).toLocaleDateString('he-IL',{day:'numeric',month:'numeric'})+' '+new Date(r.d).toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'});
    return `<div class="lbr" data-id="${esc(r.id||'')}"><div class="rk">${boardSort==='pts'?(medal[i]||i+1):'📝'}</div><div class="nm">${esc(r.n)}<small>${esc(c.em)} ${esc(c.name)} · ${lvlLabel(r)} · ${dt}</small></div><div class="pt">${Math.round(r.ok/r.t*100)}%<small>${r.ok}/${r.t} · ${r.p} נק'</small></div><button class="del" data-del="${esc(r.id||'')}" aria-label="מחיקה">🗑</button></div>`}).join('');
  $('lb').querySelectorAll('.lbr').forEach(el=>el.onclick=()=>openHist(el.dataset.id));
  $('lb').querySelectorAll('.del').forEach(el=>el.onclick=e=>{e.stopPropagation();delTest(el.dataset.del)});
}
function setSort(s){boardSort=s;renderBoard()}
function resetBoard(){ask('למחוק את כל התוצאות וההיסטוריה?','מחיקה',()=>{store.set('qz_board',[]);buzz(40)})}

// ---------- test history ----------
let curHist=null;
function openHist(id){
  curHist=id;
  const r=store.get('qz_board',[]).find(x=>x.id===id);
  if(!r||!r.items){ask('לתוצאה הזאת אין פירוט שאלות (נשמרה בגרסה קודמת).','הבנתי',()=>{});return}
  $('hDel').onclick=()=>delTest(id);
  const c=courseById(r.c)||{em:r.ce||'',name:r.cn||''};
  $('hHead').innerHTML=`<div class="hsum"><b>${esc(c.em)} ${esc(c.name)}</b><span>${lvlLabel(r).replace(/^(קל|בינוני|קשה)$/,'רמה $1')} · ${new Date(r.d).toLocaleDateString('he-IL')} · ${new Date(r.d).toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'})}</span>
    <div class="hstats"><span class="okc">✓ ${r.ok} נכונות</span><span class="badc">✗ ${r.t-r.ok} טעויות</span><span>${r.p} נק'</span></div></div>`;
  const onlyBad=$('hOnlyBad').classList.contains('sel');
  $('hList').innerHTML=r.items.map((it,i)=>{ if(onlyBad&&it.first)return '';
    const wrongTexts=it.picks.filter(p=>!p.ok);
    const opts=it.opts.map(o=>{const isC=o===it.correct,w=wrongTexts.find(p=>p.t===o);
      return `<div class="hopt ${isC?'c':''} ${w?'w':''}"><span class="mk">${isC?'✓':w?'✗':''}</span><span>${esc(o)}${w?'<em>הבחירה שלך</em>':''}${isC&&it.first?'<em>ענית נכון בניסיון הראשון</em>':''}</span></div>${w&&w.why?`<div class="hwhy">💡 ${esc(w.why)}</div>`:''}`}).join('');
    return `<div class="hq ${it.first?'good':'miss'}"><div class="hqt"><span class="hn">${i+1}</span>${esc(it.q)}</div>${it.skipped?'<div class="hwhy">⏳ לא ענית על השאלה הזאת</div>':''}${opts}<div class="hexp">📘 ${esc(it.e)}</div><button class="replink" data-i="${i}">⚑ יש טעות בשאלה?</button></div>`}).join('')||'<div class="empty">אין טעויות במבחן הזה 🎉</div>';
  $('hList').querySelectorAll('.replink').forEach(b=>b.onclick=()=>openReport(r.c,r.items[+b.dataset.i]));
  go('hist');
}
function histFilter(bad){$('hOnlyBad').classList.toggle('sel',bad);$('hAll').classList.toggle('sel',!bad);openHist(curHist)}

// ---------- upload material → new questions ----------
let samplePromise=null;
function getSample(){if(!samplePromise){samplePromise=(async()=>{try{if(!(window.claude&&claude.use))return null;return await claude.use('sample')}catch(e){return null}})()}return samplePromise}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s)})}
async function fileText(f){
  const name=f.name.toLowerCase();
  if(name.endsWith('.txt')||name.endsWith('.md')||f.type.startsWith('text/'))return await f.text();
  if(name.endsWith('.docx')){
    if(!window.mammoth)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    const r=await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()});return r.value;
  }
  if(name.endsWith('.pdf')){
    if(!window.pdfjsLib)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let out='';
    for(let p=1;p<=Math.min(pdf.numPages,60);p++){const pg=await pdf.getPage(p);const tc=await pg.getTextContent();out+=tc.items.map(i=>i.str).join(' ')+'\n'}
    return out;
  }
  throw new Error('type');
}
function upMsg(html,kind){const el=$('upStatus');el.className='upstatus '+(kind||'');el.innerHTML=html}
async function uploadMaterial(inp){
  const files=Array.from(inp.files||[]);inp.value='';if(!files.length)return;
  upMsg('⏳ קוראת את הקבצים...','busy');
  let text='';
  for(const f of files){try{text+='\n\n=== '+f.name+' ===\n'+(await fileText(f))}catch(e){upMsg('לא הצלחתי לקרוא את "'+esc(f.name)+'". אפשר להעלות PDF, Word (docx) או טקסט'+(e.message==='load'?' (צריך חיבור לאינטרנט)':'')+'.','err');return}}
  text=text.replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n').trim();
  if(text.length<200){upMsg('לא מצאתי מספיק טקסט בקובץ (אולי זה קובץ סרוק כתמונה?).','err');return}
  upMsg('⏳ מתחברת ל-Claude...','busy');
  const sample=await Promise.race([getSample(),new Promise(r=>setTimeout(()=>r(null),11000))]);
  if(!sample){upMsg('יצירת שאלות אוטומטית עובדת רק כשמחוברים ל-Claude (גם חשבון חינמי מספיק) – פתחי את הקישור כשאת מחוברת.<br>אפשרות נוספת: לשלוח את הקובץ לאחיך, והוא יוסיף אותו לגרסה הבאה 🙂','err');return}
  const courses=allCourses().map(c=>({id:c.id,name:c.name,desc:c.d||''}));
  const prompt=`את/ה כותב/ת שאלות תרגול למבחן לסטודנטית למדעי התזונה. כל הפלט בעברית.
להלן חומר לימוד חדש שהסטודנטית העלתה. כתוב/כתבי ממנו שאלות רב-ברירה שמבוססות אך ורק על החומר.

קורסים קיימים: ${JSON.stringify(courses)}
אם החומר שייך לאחד הקורסים הקיימים – החזר את ה-id שלו ב-"match". אחרת "match": null ותן שם, אימוג'י ותיאור קצר לקורס חדש.

כתוב 8 שאלות לכל רמה (סה"כ 24):
- רמה 1 (קל): מושגים והגדרות.
- רמה 2 (בינוני): הבנה – למה ואיך.
- רמה 3 (קשה): חיבור בין נושאים ופרטים עדינים.
לכל שאלה בדיוק 3 תשובות: הראשונה נכונה, שתיים שגויות אך סבירות.
לכל תשובה שגויה כתוב הסבר קצר (משפט-שניים) למה היא שגויה – שמכוון לרעיון הנכון אבל לא חושף את התשובה הנכונה.
בנוסף, הסבר קצר (משפט אחד) שמסכם את הרעיון ומוצג אחרי תשובה נכונה.

החזר JSON בלבד במבנה:
{"match": "id או null", "course": {"name": "...", "emoji": "...", "desc": "..."}, "questions": [{"l":1,"q":"...","o":["נכונה","שגויה1","שגויה2"],"w":["למה שגויה1","למה שגויה2"],"e":"הסבר"}]}

החומר:
"""${text.slice(0,45000)}"""`;
  upMsg('✨ Claude כותב שאלות מהחומר... (זה יכול לקחת דקה)','busy');
  let res;
  try{res=await sample.json(prompt,{modelTier:'complex'})}
  catch(e){upMsg(e&&e.code==='not_granted'?'צריך לאשר ל-Claude לעבוד עם הדף כדי ליצור שאלות.':e&&e.code==='rate_limited'?'יותר מדי בקשות כרגע – נסי שוב בעוד כמה דקות.':'משהו השתבש ביצירת השאלות. נסי שוב.','err');return}
  const qs=(res&&Array.isArray(res.questions)?res.questions:[]).filter(q=>q&&q.q&&Array.isArray(q.o)&&q.o.length===3&&[1,2,3].includes(+q.l)).map((q,i)=>({id:'u'+Date.now()+'_'+i,l:+q.l,q:String(q.q),o:q.o.map(String),w:(Array.isArray(q.w)?q.w:[]).map(String).concat(['','']).slice(0,2),e:String(q.e||'')}));
  if(!qs.length){upMsg('לא התקבלו שאלות תקינות. נסי שוב או עם קובץ אחר.','err');return}
  const cu=custom();let cid=res.match&&courseById(res.match)?res.match:null,created=false;
  if(!cid){cid='c'+Date.now();const co=res.course||{};cu.courses.push({id:cid,name:String(co.name||files[0].name.replace(/\.[^.]+$/,'')).slice(0,40),em:String(co.emoji||'📗').slice(0,4),d:String(co.desc||'חומר שהועלה').slice(0,60)});created=true}
  cu.q[cid]=(cu.q[cid]||[]).concat(qs);
  if(!store.set('qz_custom',cu)){upMsg('אין מספיק מקום בטלפון לשמור את השאלות.','err');return}
  const c=courseById(cid);
  upMsg(`✓ נוספו ${qs.length} שאלות ${created?'לקורס חדש':'לקורס'}: <b>${esc(c.em)} ${esc(c.name)}</b>`,'ok');
  S.course=cid;persist();renderCustomList();buzz([30,40,30]);fanfare(1);
}
function renderCustomList(){const cu=custom();const counts=Object.entries(cu.q).filter(([k,v])=>v.length);
  $('cuList').innerHTML=counts.length?counts.map(([id,v])=>{const c=courseById(id);return `<div class="cur"><span>${esc(c?c.em+' '+c.name:id)} · ${v.length} שאלות שהועלו</span><button onclick="delCustom('${esc(id)}')">מחיקה</button></div>`}).join(''):''}
function delCustom(id){ask('למחוק את השאלות שהועלו לקורס הזה?','מחיקה',()=>{const cu=custom();delete cu.q[id];cu.courses=cu.courses.filter(c=>c.id!==id||BASE_COURSES.some(b=>b.id===id));store.set('qz_custom',cu);if(!courseById(S.course))S.course='history';persist();renderSettings()})}

// ---------- first-run tour ----------
const TOUR=[
 {sel:'#courses',title:'בוחרים קורס 📚',text:'כאן בוחרים על איזה קורס להתאמן. כל קורס מלא בשאלות מהחומר שלך.'},
 {sel:'#lvlHome',title:'בוחרים רמת קושי 🎚️',text:'קל – מושגים, בינוני – הבנה, קשה – כמו שאלות מבחן מאתגרות.'},
 {sel:'#startBtn',title:'מתחילים מבחן ▸',text:'כל מבחן הוא 15 שאלות, ובכל פעם שאלות אחרות. טעית? תקבלי הסבר למה – ותנסי שוב.'},
 {sel:'#modeSeg',title:'שאלון או כרטיסיות 🔀',text:'בוחרים איך ללמוד: שאלון עם 15 שאלות, או כרטיסיות לשינון מהיר של מושגים.'},
 {sel:'#statsBtn',title:'ההתקדמות שלי 📊',text:'כמה מבחנים עשית, אחוז הצלחה, ובאיזה נושא כדאי לחזור על החומר – עם תרגול ממוקד בלחיצה.'},
 {sel:'#simBtn',title:'סימולציית מבחן ⏱',text:'מבחן באורך ובזמן של המבחן האמיתי, עם טיימר – וההסברים מגיעים רק בסוף.'},
 {sel:'#boardBtn',title:'טבלת ניקוד והיסטוריה 🏆',text:'כל מבחן נשמר כאן אוטומטית. לוחצים עליו כדי לחזור על כל השאלות והטעויות, ו-🗑 מוחק מבחן ישן.'},
 {sel:'#setBtn',title:'הגדרות ⚙️',text:'כאן מעלים קבצים חדשים (PDF / Word) כדי ליצור עוד מבחנים, ומשנים קול, צלילים ושם.'},
 {sel:'#musicBtn',title:'מוזיקת רקע 🎵',text:'לחיצה כאן משתיקה או מחזירה את המוזיקה.'},
 {sel:null,title:'שומרים כאפליקציה 📲',text:'<b>אייפון:</b> ב-Safari לוחצים על כפתור השיתוף <span class="ic">⬆️</span> ← "הוסף למסך הבית".<br><b>אנדרואיד:</b> ב-Chrome לוחצים על ⋮ ← "הוספה למסך הבית".<br>וככה האפליקציה תמיד במרחק לחיצה 💚'}
];
let tourI=0;
function startTour(){go('home');tourI=0;$('tour').classList.add('on');showTourStep()}
function endTour(){$('tour').classList.remove('on');store.set('qz_tour_done',true)}
function showTourStep(){
  const st=TOUR[tourI],spot=$('tSpot'),tip=$('tTip');
  $('tTitle').textContent=st.title;$('tText').innerHTML=st.text;
  $('tDots').innerHTML=TOUR.map((_,i)=>`<i class="${i===tourI?'on':''}"></i>`).join('');
  $('tNext').textContent=tourI===TOUR.length-1?'יאללה! 🚀':'הבא ←';
  $('tPrev').style.visibility=tourI?'visible':'hidden';
  tip.classList.remove('up','down','center');
  const el=st.sel&&document.querySelector(st.sel);
  if(!el){spot.style.display='none';tip.classList.add('center');tip.style.top='';tip.style.left='';$('tour').classList.add('dim');return}
  $('tour').classList.remove('dim');
  el.scrollIntoView({block:'center',behavior:'instant'});
  requestAnimationFrame(()=>{const r=el.getBoundingClientRect(),pad=8;
    spot.style.display='block';spot.style.left=(r.left-pad)+'px';spot.style.top=(r.top-pad)+'px';spot.style.width=(r.width+pad*2)+'px';spot.style.height=(r.height+pad*2)+'px';
    const vh=window.innerHeight,below=r.bottom+pad+14,tipH=tip.offsetHeight||170;
    const ax=Math.min(Math.max(r.left+r.width/2,30),window.innerWidth-30);
    tip.style.setProperty('--ax',(ax-12)+'px');
    if(below+tipH<vh-10){tip.classList.add('down');tip.style.top=below+'px'}else{tip.classList.add('up');tip.style.top=Math.max(10,r.top-pad-14-tipH)+'px'}
  });
}
function tourNext(){if(tourI<TOUR.length-1){tourI++;showTourStep()}else endTour()}
function tourPrev(){if(tourI>0){tourI--;showTourStep()}}
window.addEventListener('resize',()=>{if($('tour').classList.contains('on'))showTourStep()});


// ---------- streak, exam countdown, readiness ----------
function dayKey(d){const x=new Date(d);return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate()}
function streak(){const days=new Set(store.get('qz_board',[]).map(r=>dayKey(r.d)));let n=0;const d=new Date();
  if(!days.has(dayKey(d)))d.setDate(d.getDate()-1); // today not done yet – streak still alive from yesterday
  while(days.has(dayKey(d))){n++;d.setDate(d.getDate()-1)}
  return {n,today:days.has(dayKey(Date.now()))}}
function examDate(id){return (store.get('qz_exams',{})||{})[id]||''}
function daysTo(id){const s=examDate(id);if(!s)return null;const t=new Date(s+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);return Math.round((t-n)/864e5)}
function readiness(course){const st=qStats(course),tl=topicList(course);
  const recent=[];st.recs.slice().reverse().forEach(r=>r.items.forEach(it=>{if(recent.length<60)recent.push(it.first?1:0)}));
  if(recent.length<5)return null;
  const acc=recent.reduce((a,b)=>a+b,0)/recent.length;
  const covered=tl.filter((_,i)=>(st.topics[i]||{n:0}).n>=2).length/Math.max(1,tl.length);
  return Math.round(acc*(0.6+0.4*covered)*100)}
function renderHeroInfo(){
  let near=null;allCourses().forEach(c=>{const d=daysTo(c.id);if(d!=null&&d>=0&&(!near||d<near.d))near={d,c}});
  const st=qStats(S.course),pct=st.tot?Math.round(st.ok/st.tot*100):null,rd=readiness(S.course),cfg=simCfg(S.course);
  $('heroInfo').innerHTML=`<button class="hbtn" id="statsBtn" onclick="openStats()"><span>📊</span><b>ההתקדמות שלי</b><small>${st.tests?st.tests+' מבחנים · '+pct+'% הצלחה'+(rd!=null?' · מוכנות '+rd+'%':''):'עוד אין מבחנים'}</small></button><button class="hbtn" id="simBtn" onclick="startSim()"><span>⏱</span><b>סימולציית מבחן</b><small>${cfg.n} שאלות · ${cfg.min} דק'</small></button>`+(near?`<span class="hchip">📅 ${near.d===0?'המבחן היום!':near.d===1?'מחר מבחן':'עוד '+near.d+' ימים'} · ${esc(near.c.name)}</span>`:'');
}
function renderExamDates(){const ex=store.get('qz_exams',{})||{};
  $('examDates').innerHTML=allCourses().map(c=>`<label class="exrow"><span>${esc(c.em+' '+c.name)}</span><input type="date" value="${esc(ex[c.id]||'')}" onchange="setExam('${esc(c.id)}',this.value)"></label>`).join('')}
function setExam(id,v){const ex=store.get('qz_exams',{})||{};if(v)ex[id]=v;else delete ex[id];store.set('qz_exams',ex)}

// ---------- flashcards ----------
let FC=null;
function openCards(topic){const course=S.course;
  const st=qStats(course),known=new Set(store.get('qz_known',[]));
  let pool=usable(course).filter(q=>topic==null||topicOf(course,q)===topic);
  const score=q=>(st.q[q.id]&&st.q[q.id].last===false?0:1)+(known.has(q.id)?2:0)+Math.random();
  pool=pool.sort((a,b)=>score(a)-score(b)).slice(0,20);
  FC={course,topic,cards:pool,i:0,knew:0,again:0,flipped:false};
  go('cards');renderCardTopics();showCard();
}
function renderCardTopics(){const tl=topicList(FC.course);
  $('cTopics').innerHTML=`<button class="${FC.topic==null?'sel':''}" onclick="openCards()">כל הנושאים</button>`+tl.map((t,i)=>`<button class="${FC.topic===i?'sel':''}" onclick="openCards(${i})">${esc(t.n)}</button>`).join('')}
function showCard(){
  const c=$('card');
  if(!FC.cards.length){c.className='card done';$('cProg').textContent='';$('cFront').innerHTML='<b>אין כרטיסיות בנושא הזה</b>';$('cBack').innerHTML='';$('cBtns').innerHTML='';return}
  if(FC.i>=FC.cards.length){$('cProg').textContent='';c.className='card done';$('cFront').innerHTML=`<b>סיימת את החפיסה! 🎉</b><span>ידעת ${FC.knew} · לחזור על ${FC.again}</span>`;$('cBack').innerHTML='';$('cBtns').innerHTML='<button class="btn primary" onclick="openCards(FC.topic)">חפיסה חדשה ↻</button>';$('cBtns').classList.add('on');return}
  const q=FC.cards[FC.i];FC.flipped=false;c.className='card';
  $('cProg').textContent=(FC.i+1)+' / '+FC.cards.length;
  $('cFront').innerHTML=`<small>${esc(topicName(FC.course,topicOf(FC.course,q)))}</small><b>${q.tf?'נכון או לא נכון? ':''}${esc(q.q)}</b><span class="tap">👆 הקישי כדי לראות תשובה</span>`;
  $('cBack').innerHTML=`<small>התשובה</small><b>${esc(q.o[0])}</b><p>${esc(q.e)}</p>`;
  $('cBtns').innerHTML='<button class="btn ghost" onclick="cardAns(false)">🔁 עוד לא</button><button class="btn dark" onclick="cardAns(true)">✓ ידעתי</button>';
  $('cBtns').classList.remove('on');
}
function flipCard(){if(!FC||FC.i>=FC.cards.length)return;FC.flipped=!FC.flipped;$('card').classList.toggle('flip',FC.flipped);if(FC.flipped)$('cBtns').classList.add('on');buzz(8)}
function cardAns(k){const q=FC.cards[FC.i];const known=new Set(store.get('qz_known',[]));
  if(k){FC.knew++;known.add(q.id)}else{FC.again++;known.delete(q.id);FC.cards.push(q)}
  store.set('qz_known',[...known]);FC.i++;if(FC.cards.length>40)FC.cards.length=40;tone(k);showCard()}

// ---------- backup / restore (file based, one tap) ----------
const BK_KEYS=['qz_board','qz_custom','qz_reports','qz_settings','qz_exams','qz_known','qz_tour_done'];
function makeBackup(){const data={app:'lomedet',v:1,d:Date.now()};BK_KEYS.forEach(k=>data[k]=store.get(k,null));
  const blob=new Blob([JSON.stringify(data)],{type:'application/json'});const name='lomedet-backup-'+new Date().toISOString().slice(0,10)+'.json';
  const done=()=>{store.set('qz_lastbk',Date.now());$('bkMsg').textContent='✓ הגיבוי נשמר בטלפון (בתיקיית ההורדות / קבצים).';renderBk()};
  if(NATIVE){nativeBackup(JSON.stringify(data),name).then(()=>{store.set('qz_lastbk',Date.now());$('bkMsg').textContent='✓ הגיבוי נשמר';renderBk()},()=>{});return}
  try{const f=new File([blob],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'גיבוי לומדת למבחן'}).then(done,()=>{});return}}catch(e){}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);done()}
  catch(e){$('bkMsg').textContent='הדפדפן לא אפשר לשמור קובץ.'}}
function restoreBackup(inp){const f=inp.files&&inp.files[0];inp.value='';if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const data=JSON.parse(r.result);if(data.app!=='lomedet')throw 0;
    const n=(data.qz_board||[]).length;
    ask(`לשחזר את הגיבוי מ-${new Date(data.d).toLocaleDateString('he-IL')}? (${n} מבחנים) הנתונים הנוכחיים בטלפון יוחלפו.`,'שחזור',()=>{BK_KEYS.forEach(k=>{if(data[k]!=null)store.set(k,data[k])});Object.assign(S,store.get('qz_settings',{}));applyTheme();$('bkMsg').textContent='✓ הגיבוי שוחזר – כל המבחנים חזרו';renderSettings();buzz([30,40,30])})}
    catch(e){$('bkMsg').textContent='זה לא קובץ גיבוי של האפליקציה.'}};r.readAsText(f)}
function renderBk(){const l=store.get('qz_lastbk',0);$('bkLast').textContent=l?'גיבוי אחרון: '+new Date(l).toLocaleDateString('he-IL'):'עוד לא נעשה גיבוי'}


// ---------- native app (Capacitor) integration ----------
const NATIVE=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
const NP=NATIVE?Capacitor.Plugins:{};
if(NATIVE){
  document.documentElement.classList.add('native');
  // Android back button: close overlays, leave screens, then minimize
  try{NP.App.addListener('backButton',()=>{
    if($('modal').classList.contains('on')){$('modal').classList.remove('on');return}
    if($('report').classList.contains('on')){$('report').classList.remove('on');return}
    if($('tour').classList.contains('on')){endTour();return}
    const cur=document.querySelector('.screen.on');const id=cur?cur.id:'s-home';
    if(id==='s-quiz')return quitQuiz();
    if(id==='s-hist')return openBoard();
    if(id!=='s-home')return go('home');
    NP.App.minimizeApp();
  })}catch(e){}
  try{NP.App.addListener('pause',()=>{Music.stop();if(Q&&!Q.finished)saveProgress()})}catch(e){}
  try{NP.App.addListener('resume',()=>{if(S.music&&actx)Music.start()})}catch(e){}
}
async function nativeBackup(json,name){
  const r=await NP.Filesystem.writeFile({path:name,data:json,directory:'CACHE',encoding:'utf8'});
  await NP.Share.share({title:'גיבוי לומדת למבחן',text:'קובץ גיבוי של האפליקציה',files:[r.uri],dialogTitle:'איפה לשמור את הגיבוי?'});
}
// daily study reminder (native only)
async function setReminder(on,time){
  S.remind=on;S.remindAt=time||S.remindAt||'19:00';persist();
  if(!NATIVE)return;
  const LN=NP.LocalNotifications;
  try{await LN.cancel({notifications:[{id:1001}]})}catch(e){}
  if(!on){renderSettings();return}
  try{const p=await LN.requestPermissions();if(p.display!=='granted'){S.remind=false;persist();ask('כדי לקבל תזכורת צריך לאשר התראות לאפליקציה בהגדרות הטלפון.','הבנתי',()=>{});renderSettings();return}
    const [h,m]=S.remindAt.split(':').map(Number);
    await LN.schedule({notifications:[{id:1001,title:'הגיע הזמן ללמוד 📚',body:'מבחן קצר של 15 שאלות – ועוד צעד לקראת המבחן 💪',schedule:{on:{hour:h,minute:m},allowWhileIdle:true}}]});
  }catch(e){}
  renderSettings();
}

// ---------- updates: "what's new" toast (all) + over-the-air content updates (Android app) ----------
function toast(msg,ms){const el=$('toast');el.innerHTML=msg;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),ms||4500)}
(function(){if(store.get('qz_ota_pending',null)===VERSION)store.set('qz_ota_pending',null);const last=store.get('qz_ver',null);if(last&&last!==VERSION)setTimeout(()=>toast('✨ האפליקציה עודכנה לגרסה '+VERSION),1200);store.set('qz_ver',VERSION)})();
function verNum(v){return String(v).split('.').map(Number).reduce((a,n)=>a*10000+(n||0),0)}
async function checkOTA(){
  if(!NATIVE||!navigator.onLine)return;
  try{
    const r=await fetch(SITE+'version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const info=await r.json();
    if(verNum(info.version)<=verNum(VERSION))return;
    const shell=NP.App&&NP.App.getInfo?(await NP.App.getInfo()).version:'0';
    if(info.native_min&&verNum(info.native_min)>verNum(shell)){toast('📲 יש גרסה חדשה של האפליקציה – <a href="'+info.apk+'">להורדה</a>',9000);return}
    const html=await (await fetch(SITE+'index.html?t='+Date.now(),{cache:'no-store'})).text();
    if(!html.includes('</html>')||!html.includes('const VERSION = "'+info.version+'"'))return;
    const dir='ota/'+info.version;
    await NP.Filesystem.writeFile({path:dir+'/index.html',data:html,directory:'DATA',encoding:'utf8',recursive:true});
    const uri=(await NP.Filesystem.getUri({path:dir,directory:'DATA'})).uri.replace('file://','');
    store.set('qz_ota_pending',info.version);
    if(Q&&!Q.finished)saveProgress();
    await NP.WebView.setServerBasePath({path:uri});
    await NP.WebView.persistServerBasePath();
  }catch(e){}
}
// ---------- modal ----------
function ask(msg,yes,cb){const m=$('modal');$('mText').textContent=msg;$('mYes').textContent=yes;m.classList.add('on');$('mYes').onclick=()=>{m.classList.remove('on');cb()};$('mNo').onclick=()=>m.classList.remove('on')}

// ---------- start ----------
applyTheme();
setTimeout(checkOTA,2500);
$('wAvatar').src=AVATAR;
$('verLbl').textContent='לומדת למבחן · גרסה '+VERSION;
showQuote();musicUI();renderHome();
// pre-connect to Claude (only works inside claude.ai when signed in)
setTimeout(()=>{getSample().then(s=>{const n=$('upNote');if(n&&!s)n.textContent='יצירת שאלות אוטומטית דורשת חיבור ל-Claude. בלי חיבור – שלחי את הקובץ לאחיך והוא יוסיף אותו.'})},300);
