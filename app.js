const rows = [
  {name:'Les voyelles', chars:[['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']]},
  {name:'La ligne K', chars:[['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko']]},
  {name:'La ligne S', chars:[['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so']]},
  {name:'La ligne T', chars:[['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to']]},
  {name:'La ligne N', chars:[['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']]},
  {name:'La ligne H', chars:[['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho']]},
  {name:'La ligne M', chars:[['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo']]},
  {name:'La ligne Y', chars:[['や','ya'],['',''],['ゆ','yu'],['',''],['よ','yo']]},
  {name:'La ligne R', chars:[['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro']]},
  {name:'La ligne W', chars:[['わ','wa'],['',''],['',''],['',''],['を','wo']]},
  {name:'Son final', chars:[['ん','n'],['','',''],['','',''],['','',''],['','','']]}
];
const vowels = rows[0].chars;
const allChars = rows.flatMap(r=>r.chars).filter(c=>c[0]);
const lessons = rows.slice(0,5);
let state = JSON.parse(localStorage.getItem('hiraState')||'{"learned":[],"streak":0,"minutes":0}');
let quizIndex=0, quizRight=0, quizLocked=false, lessonIndex=0;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function save(){localStorage.setItem('hiraState',JSON.stringify(state));updateStats()}
function updateStats(){const n=state.learned.length;$('#learnedCount').innerHTML=`${n}<span> / 46</span>`;$('#lessonProgress').textContent=Math.min(n,5);$('#weekCount').textContent=`${n} caractère${n===1?'':'s'} appris`;$('#streak').textContent=state.streak;$('#goalNum').textContent=state.minutes;$('#goalRing').style.strokeDashoffset=270-(270*Math.min(state.minutes,5)/5)}
function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2200)}
function showView(name){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));const names={accueil:'Vue d’ensemble',lecons:'Leçons',entrainement:'Entraînement',tableau:'Tableau des kana'};$('#crumb').textContent=names[name];if(name==='entrainement')renderQuiz();if(name==='tableau')renderBoard();if(name==='lecons')renderLessons();window.scrollTo({top:0,behavior:'smooth'})}
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)));
function speak(text){if(!('speechSynthesis'in window)){toast(`${text} — essaie de le prononcer à voix haute !`);return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.78;speechSynthesis.speak(u)}
function markLearned(char){if(char&&!state.learned.includes(char)){state.learned.push(char);save()}}
function startLesson(){lessonIndex=0;showView('entrainement');renderQuiz(true)}
$('#startLesson').addEventListener('click',startLesson);
function renderLessons(){const list=$('#lessonList');list.innerHTML=lessons.map((row,i)=>`<article class="lesson-row"><div class="lesson-row-num">${row.chars[0][0]}</div><div class="lesson-row-copy"><small>LEÇON ${String(i+1).padStart(2,'0')}</small><h3>${row.name}</h3><p>${row.chars.map(c=>c[1]).join(' · ')}</p></div><span class="lesson-row-status">${state.learned.filter(c=>row.chars.some(x=>x[0]===c)).length}/${row.chars.length}</span><button class="primary-button" data-lesson="${i}">${i===0?'Revoir':'Découvrir'} <span>→</span></button></article>`).join('');$$('[data-lesson]').forEach(b=>b.addEventListener('click',()=>{lessonIndex=Number(b.dataset.lesson);showView('entrainement');renderQuiz(true)}))}
function renderBoard(){const board=$('#kanaBoard');board.innerHTML=allChars.map(([jp,romaji])=>`<button class="kana-tile ${state.learned.includes(jp)?'learned':''}" data-char="${jp}" aria-label="${romaji}, ${jp}"><b>${jp}</b><span>${romaji}</span>${state.learned.includes(jp)?'<em>✓ appris</em>':''}</button>`).join('');$$('.kana-tile').forEach(tile=>tile.addEventListener('click',()=>{speak(tile.dataset.char);markLearned(tile.dataset.char);tile.classList.add('learned');tile.innerHTML=`<b>${tile.dataset.char}</b><span>${allChars.find(c=>c[0]===tile.dataset.char)[1]}</span><em>✓ appris</em>`}))}
function renderQuiz(fromLesson=false,reset=true){if(reset){quizIndex=0;quizRight=0}quizLocked=false;let pool=fromLesson?lessons[lessonIndex].chars:vowels;const questions=pool.filter(c=>c[0]);const card=$('#quizCard');if(quizIndex>=questions.length){card.innerHTML=`<div class="quiz-meta"><span>LEÇON TERMINÉE</span><span>✳ ${quizRight} / ${questions.length}</span></div><div class="quiz-kana">${quizRight===questions.length?'すごい！':'よくできました'}</div><div class="quiz-question">${quizRight===questions.length?'Parfait, tu as tout juste !':'Belle séance. Chaque répétition compte.'}</div><div style="margin-top:20px"><button class="primary-button" id="againBtn">${fromLesson?'Rejouer':'Recommencer'} →</button> <button class="answer-button" id="boardBtn">Voir le tableau</button></div>`;$('#againBtn').onclick=()=>renderQuiz(fromLesson);$('#boardBtn').onclick=()=>showView('tableau');return}
const q=questions[quizIndex];const distractors=allChars.filter(c=>c[1]!==q[1]).map(c=>c[1]);const options=[q[1]];while(options.length<4){const x=distractors[Math.floor(Math.random()*distractors.length)];if(!options.includes(x))options.push(x)}options.sort(()=>Math.random()-.5);card.innerHTML=`<div class="quiz-meta"><span>${fromLesson?'LEÇON '+String(lessonIndex+1).padStart(2,'0')+' · '+lessons[lessonIndex].name.toUpperCase():'RÉVISION DES VOYELLES'}</span><span>${quizIndex+1} / ${questions.length}</span></div><div class="quiz-progress"><span style="width:${quizIndex/questions.length*100}%"></span></div><div class="quiz-question">Quel est le son de ce caractère ?</div><div class="quiz-kana">${q[0]}</div><div class="quiz-answers">${options.map(o=>`<button class="answer-button" data-answer="${o}">${o}</button>`).join('')}</div><div class="quiz-feedback" id="quizFeedback"></div>`;$$('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{if(quizLocked)return;quizLocked=true;const good=btn.dataset.answer===q[1];btn.classList.add(good?'correct':'wrong');if(good){quizRight++;markLearned(q[0]);$('#quizFeedback').textContent='Exactement ! Bien joué.';speak(q[0]);state.minutes=Math.min(5,state.minutes+1);save()}else{$$('[data-answer]').find(b=>b.dataset.answer===q[1]).classList.add('correct');$('#quizFeedback').textContent=`Le son est « ${q[1]} ». Garde-le en tête !`}setTimeout(()=>{quizIndex++;renderQuiz(fromLesson,false)},850)}))}
updateStats();renderBoard();
