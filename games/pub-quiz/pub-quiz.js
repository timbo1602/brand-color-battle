(() => {
  "use strict";
  if (!window.ArcadeShared.setupGamePage("pubQuiz")) return;
  const questions = window.PUB_QUIZ_QUESTIONS || [];
  const categories = window.PUB_QUIZ_CATEGORIES || {};
  const storage = window.ArcadeStorage;
  const audio = window.ArcadeAudio;
  const bestKey = "pub-quiz:highscore";
  const screens = [...document.querySelectorAll(".game-screen")];
  const categorySelect = document.getElementById("quiz-category");
  let timerId = 0;
  let state = { round: [], index: 0, score: 0, selected: null, order: [], answered: false, timeLeft: 20, lastTick: 0 };

  Object.entries(categories).forEach(([value,label]) => { const option=document.createElement("option");option.value=value;option.textContent=label;categorySelect.appendChild(option); });
  document.getElementById("hud-best").textContent = window.ArcadeShared.format(storage.readNumber(bestKey,0,{min:0,max:20000}));

  function show(id){screens.forEach(screen=>{screen.hidden=screen.id!==id;});window.scrollTo({top:0,behavior:"smooth"});}
  function start(){
    stopTimer();
    const mode=document.getElementById("quiz-mode").value;
    const pool=mode==="category"?questions.filter(q=>q.category===categorySelect.value):questions;
    const count=mode==="quick"?5:10;
    state={round:window.ArcadeShared.sample(pool,count),index:0,score:0,selected:null,order:[],answered:false,timeLeft:20,lastTick:0};
    renderQuestion();audio.play("select");
  }
  function renderQuestion(){
    stopTimer();state.selected=null;state.order=[];state.answered=false;state.timeLeft=20;
    const q=state.round[state.index];
    document.getElementById("hud-progress").textContent=`${state.index+1} / ${state.round.length}`;
    document.getElementById("hud-score").textContent=window.ArcadeShared.format(state.score);
    document.getElementById("progress-bar").style.width=`${state.index/state.round.length*100}%`;
    document.getElementById("question-category").textContent=categories[q.category];
    document.getElementById("question-text").textContent=q.question;
    document.getElementById("feedback").hidden=true;
    document.getElementById("submit-answer").hidden=false;
    document.getElementById("submit-answer").disabled=true;
    renderAnswer(q);show("question-screen");startTimer();
  }
  function renderAnswer(q){
    const area=document.getElementById("answer-area");area.replaceChildren();
    const instruction=document.getElementById("question-instruction");
    if(q.type==="choice"){
      instruction.textContent="Wähle eine Antwort.";const grid=document.createElement("div");grid.className="option-grid";
      window.ArcadeShared.shuffle(q.options).forEach(option=>{const button=document.createElement("button");button.type="button";button.className="option-button";button.textContent=option;button.addEventListener("click",()=>{state.selected=option;grid.querySelectorAll("button").forEach(b=>b.classList.toggle("is-selected",b===button));document.getElementById("submit-answer").disabled=false;audio.play("select");});grid.appendChild(button);});area.appendChild(grid);
    } else if(q.type==="estimate"){
      instruction.textContent=`Gib deine Schätzung in ${q.unit} ein.`;const wrap=document.createElement("div");wrap.className="estimate-wrap";const label=document.createElement("label");label.textContent=`Deine Schätzung (${q.unit})`;const input=document.createElement("input");input.type="number";input.inputMode="numeric";input.addEventListener("input",()=>{state.selected=input.value===""?null:Number(input.value);document.getElementById("submit-answer").disabled=state.selected===null;});label.appendChild(input);wrap.appendChild(label);area.appendChild(wrap);setTimeout(()=>input.focus(),0);
    } else {
      instruction.textContent="Tippe die Elemente in der richtigen Reihenfolge an.";const chosen=document.createElement("div");chosen.className="chosen-order";const list=document.createElement("div");list.className="order-list";
      window.ArcadeShared.shuffle(q.answer).forEach(value=>{const button=document.createElement("button");button.type="button";button.className="order-button";button.textContent=value;button.addEventListener("click",()=>{state.order.push(value);button.disabled=true;const tag=document.createElement("span");tag.textContent=`${state.order.length}. ${value}`;chosen.appendChild(tag);document.getElementById("submit-answer").disabled=state.order.length!==q.answer.length;audio.play("select");});list.appendChild(button);});area.append(chosen,list);
    }
  }
  function startTimer(){state.lastTick=performance.now();timerId=window.setInterval(()=>{if(document.hidden||state.answered)return;const now=performance.now();state.timeLeft=Math.max(0,state.timeLeft-(now-state.lastTick)/1000);state.lastTick=now;updateTime();if(state.timeLeft<=0)evaluate();},100);}
  function updateTime(){document.getElementById("hud-time").textContent=state.timeLeft.toFixed(1);document.getElementById("timer-bar").style.transform=`scaleX(${state.timeLeft/20})`;}
  function stopTimer(){window.clearInterval(timerId);timerId=0;}
  function evaluate(){
    if(state.answered)return;state.answered=true;stopTimer();const q=state.round[state.index];let correct=false;
    if(q.type==="choice")correct=state.selected===q.answer;else if(q.type==="estimate")correct=state.selected!==null&&Math.abs(state.selected-q.answer)<=q.tolerance;else correct=q.answer.every((value,index)=>state.order[index]===value);
    const earned=correct?100+Math.round(state.timeLeft*5):0;state.score+=earned;document.getElementById("hud-score").textContent=window.ArcadeShared.format(state.score);
    document.querySelectorAll(".option-button").forEach(button=>{button.disabled=true;button.classList.toggle("is-correct",button.textContent===q.answer);button.classList.toggle("is-wrong",button.classList.contains("is-selected")&&!correct);});
    document.getElementById("submit-answer").hidden=true;const box=document.getElementById("feedback");box.hidden=false;document.getElementById("feedback-title").textContent=correct?`Richtig · +${earned} Punkte`:q.type==="estimate"?`Gesucht: ${q.answer} ${q.unit}`:"Nicht ganz";document.getElementById("feedback-text").textContent=q.explanation;const source=document.getElementById("feedback-source");source.href=q.source;audio.play(correct?"correct":"wrong");document.getElementById("live-region").textContent=document.getElementById("feedback-title").textContent;
  }
  function next(){state.index+=1;if(state.index>=state.round.length){finish();}else{renderQuestion();}}
  function finish(){stopTimer();const old=storage.readNumber(bestKey,0,{min:0,max:20000});const high=state.score>old;if(high)storage.writeRaw(bestKey,state.score);document.getElementById("result-title").textContent=high?"Neuer Kneipenrekord!":"Runde beendet";document.getElementById("result-score").textContent=window.ArcadeShared.format(state.score);document.getElementById("result-copy").textContent=`Du hast ${state.round.length} Fragen gespielt. Maximal möglich waren ${state.round.length*200} Punkte.`;document.getElementById("result-best").textContent=`Persönlicher Bestwert: ${window.ArcadeShared.format(Math.max(old,state.score))}`;document.getElementById("progress-bar").style.width="100%";document.getElementById("hud-best").textContent=window.ArcadeShared.format(Math.max(old,state.score));audio.play(high?"highscore":"end");show("result-screen");}
  document.getElementById("quiz-mode").addEventListener("change",event=>{document.getElementById("category-field").hidden=event.target.value!=="category";});document.getElementById("start-game").addEventListener("click",start);document.getElementById("submit-answer").addEventListener("click",evaluate);document.getElementById("next-question").addEventListener("click",next);document.getElementById("restart-game").addEventListener("click",()=>show("start-screen"));document.addEventListener("visibilitychange",()=>{state.lastTick=performance.now();});window.addEventListener("pagehide",stopTimer);
})();
