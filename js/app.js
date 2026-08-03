"use strict";

const STORAGE_KEY = "berryVibesStateV1";

const defaultState = {
  xp: 3957,
  streak: 12,
  hearts: 5,
  dailyXp: 70,
  savedRecipes: [],
  battleIndex: 0,
  battleCorrect: 0,
  currentView: "home"
};

const recipes = [
  {id:"cinnamon-pancakes",name:"Cinnamony Cinnamon Buttermilk Pancakes",category:"breakfast",emoji:"🥞",description:"Fluffy cinnamon pancakes with cozy buttermilk-style tang.",tags:["fluffy","cinnamon","breakfast"]},
  {id:"microwave-rolls",name:"Microwave Cinnamon Rolls",category:"breakfast",emoji:"🌀",description:"Soft spirals with cinnamon warmth and a quick microwave finish.",tags:["warm","soft","quick"]},
  {id:"clear-glaze-donuts",name:"Clear-Glaze Microwave Donuts",category:"breakfast",emoji:"🍩",description:"Tender little donuts with a glossy sweet finish.",tags:["donut","glaze","fun"]},
  {id:"brownie-batter-cake",name:"Brownie Batter Cake",category:"chocolate",emoji:"🍫",description:"Deep cocoa flavor with a soft brownie-batter center.",tags:["chocolate","gooey","cake"]},
  {id:"oreo-bowl",name:"Oreo Frozen Yogurt Bowl",category:"chocolate",emoji:"🍨",description:"Cold creamy crunch with cookie-and-cream energy.",tags:["oreo","cold","creamy"]},
  {id:"chili-mocha",name:"Chili Mocha Latte",category:"drinks",emoji:"☕",description:"Chocolate coffee warmth with a tiny spicy kick.",tags:["coffee","mocha","spiced"]},
  {id:"iced-vanilla-latte",name:"Iced Vanilla Latte",category:"drinks",emoji:"🧋",description:"Cold café-style vanilla coffee for an easy cozy sip.",tags:["iced","coffee","vanilla"]},
  {id:"mini-pizza",name:"Mini Tortilla Pizza",category:"savory",emoji:"🍕",description:"Crisp-edged tortilla pizza with melty cheese comfort.",tags:["pizza","savory","quick"]},
  {id:"spinach-wrap",name:"Spinach Chicken Wrap",category:"savory",emoji:"🌯",description:"A cozy savory wrap with chicken and fresh greens.",tags:["wrap","chicken","savory"]}
];

const battleRounds = [
  {
    category:"DONUT DUEL",
    question:"Which option has the lighter calorie profile?",
    ccd:{emoji:"🍩",name:"CCD Microwave Donut",calories:120,protein:"6g"},
    classic:{emoji:"🍩",name:"Fast-Food Donut",calories:260,protein:"4g"},
    correct:"ccd",
    explanation:"CCD wins this round with the lighter calorie profile."
  },
  {
    category:"PANCAKE PICK",
    question:"Which choice is built around the CCD recipe world?",
    ccd:{emoji:"🥞",name:"CCD Cinnamon Pancakes",calories:210,protein:"8g"},
    classic:{emoji:"🥞",name:"Diner Pancake Stack",calories:430,protein:"7g"},
    correct:"ccd",
    explanation:"You found the CCD recipe! Cozy path unlocked."
  },
  {
    category:"COFFEE CLASH",
    question:"Which drink is the Berry Vibes CCD choice?",
    ccd:{emoji:"☕",name:"CCD Chili Mocha",calories:95,protein:"5g"},
    classic:{emoji:"🥤",name:"Coffee-Shop Mocha",calories:330,protein:"7g"},
    correct:"ccd",
    explanation:"CCD Chili Mocha takes the berry badge this round."
  },
  {
    category:"PIZZA PUZZLE",
    question:"Which option belongs to your CCD collection?",
    ccd:{emoji:"🍕",name:"Mini Tortilla Pizza",calories:240,protein:"14g"},
    classic:{emoji:"🍕",name:"Fast-Food Personal Pizza",calories:520,protein:"18g"},
    correct:"ccd",
    explanation:"Mini Tortilla Pizza is the CCD recipe. Battle complete!"
  }
];

let state = loadState();
let activeRecipeFilter = "all";
let recipeSearchQuery = "";
let toastTimer = null;
let battleLocked = false;

const views = [...document.querySelectorAll("[data-view]")];
const navButtons = [...document.querySelectorAll(".nav-button")];
const lessonDialog = document.querySelector("#lesson-dialog");
const toast = document.querySelector("#toast");

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!saved || typeof saved !== "object") return {...defaultState};
    return {
      ...defaultState,
      ...saved,
      savedRecipes:Array.isArray(saved.savedRecipes) ? saved.savedRecipes : []
    };
  }catch(error){
    console.warn("Could not load Berry Vibes progress:", error);
    return {...defaultState};
  }
}

function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(error){
    console.warn("Could not save Berry Vibes progress:", error);
  }
}

function setText(selector,value){
  const el=document.querySelector(selector);
  if(el) el.textContent=String(value);
}

function showToast(message){
  toast.textContent=message;
  toast.classList.add("show-toast");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show-toast"),2200);
}

function setView(viewName){
  const target=document.querySelector(`[data-view="${viewName}"]`);
  if(!target) return;

  views.forEach(view=>view.classList.toggle("active-view",view.dataset.view===viewName));
  navButtons.forEach(button=>button.classList.toggle("active-nav",button.dataset.viewTarget===viewName));

  state.currentView=viewName;
  saveState();

  window.scrollTo({top:0,behavior:"smooth"});

  if(viewName==="recipes") renderRecipes();
  if(viewName==="profile") updateStats();
}

function updateStats(){
  const savedCount=state.savedRecipes.length;
  const level=Math.max(1,Math.floor(state.xp/500)+1);
  const dailyPercent=Math.min(100,Math.round((state.dailyXp/100)*100));

  setText("#top-streak",state.streak);
  setText("#top-xp",state.xp);
  setText("#top-hearts",state.hearts);
  setText("#daily-xp",state.dailyXp);
  setText("#daily-percent",`${dailyPercent}%`);
  setText("#side-streak",state.streak);
  setText("#profile-streak",state.streak);
  setText("#profile-xp",state.xp);
  setText("#profile-saved",savedCount);
  setText("#profile-level",level);
  setText("#saved-count",`${savedCount} saved`);

  const ring=document.querySelector(".progress-ring");
  if(ring){
    ring.style.background=`radial-gradient(circle at center,#fff 53%,transparent 54%),conic-gradient(var(--berry-500) 0 ${dailyPercent}%,var(--berry-100) ${dailyPercent}% 100%)`;
  }
}

function addXp(amount,message=""){
  state.xp+=amount;
  state.dailyXp=Math.min(100,state.dailyXp+amount);
  saveState();
  updateStats();
  showToast(message?`+${amount} XP · ${message}`:`+${amount} Berry XP! ✨`);
}

function openLessonDialog(){
  if(typeof lessonDialog.showModal==="function") lessonDialog.showModal();
  else setView("battle");
}

function closeLessonDialog(){
  if(lessonDialog.open) lessonDialog.close();
}

function escapeHtml(value){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function renderRecipes(){
  const grid=document.querySelector("#recipe-grid");
  if(!grid) return;

  const query=recipeSearchQuery.trim().toLowerCase();
  const filtered=recipes.filter(recipe=>{
    const categoryMatch=activeRecipeFilter==="all"||recipe.category===activeRecipeFilter;
    const searchMatch=!query||
      recipe.name.toLowerCase().includes(query)||
      recipe.description.toLowerCase().includes(query)||
      recipe.tags.some(tag=>tag.toLowerCase().includes(query));
    return categoryMatch&&searchMatch;
  });

  grid.innerHTML="";

  if(!filtered.length){
    grid.innerHTML=`<div class="empty-state"><div style="font-size:3rem">🍓</div><h3>No cozy recipes found</h3><p>Try another search or filter.</p></div>`;
    return;
  }

  filtered.forEach(recipe=>{
    const saved=state.savedRecipes.includes(recipe.id);
    const card=document.createElement("article");
    card.className="recipe-card";
    card.innerHTML=`
      <div class="recipe-visual" aria-hidden="true">${recipe.emoji}</div>
      <div class="recipe-card-body">
        <h3>${escapeHtml(recipe.name)}</h3>
        <p>${escapeHtml(recipe.description)}</p>
        <div class="recipe-tag-row">${recipe.tags.map(tag=>`<span class="recipe-tag">${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="recipe-actions">
          <button type="button" class="save-recipe ${saved?"saved":""}" data-save-recipe="${recipe.id}">${saved?"♥ SAVED":"♡ SAVE"}</button>
          <button type="button" class="battle-recipe" data-battle-recipe="${recipe.id}">⚔ BATTLE</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function toggleSaveRecipe(recipeId){
  if(state.savedRecipes.includes(recipeId)){
    state.savedRecipes=state.savedRecipes.filter(id=>id!==recipeId);
    showToast("Recipe removed from your cozy cookbook.");
  }else{
    state.savedRecipes.push(recipeId);
    state.xp+=5;
    state.dailyXp=Math.min(100,state.dailyXp+5);
    showToast("+5 XP · Recipe saved 💗");
  }
  saveState();
  updateStats();
  renderRecipes();
}

function renderBattle(){
  const round=battleRounds[state.battleIndex % battleRounds.length];

  setText("#battle-counter",`${state.battleIndex+1} / ${battleRounds.length}`);
  setText("#battle-category",round.category);
  setText("#battle-question",round.question);
  setText("#ccd-food",round.ccd.emoji);
  setText("#ccd-name",round.ccd.name);
  setText("#ccd-cal",round.ccd.calories);
  setText("#ccd-protein",round.ccd.protein);
  setText("#classic-food",round.classic.emoji);
  setText("#classic-name",round.classic.name);
  setText("#classic-cal",round.classic.calories);
  setText("#classic-protein",round.classic.protein);

  const bar=document.querySelector("#battle-progress-bar");
  if(bar) bar.style.width=`${((state.battleIndex+1)/battleRounds.length)*100}%`;

  document.querySelectorAll(".choice-card").forEach(card=>{
    card.classList.remove("correct-choice","wrong-choice");
    card.disabled=false;
  });

  const feedback=document.querySelector("#battle-feedback");
  feedback.className="battle-feedback";
  feedback.innerHTML=`<div class="feedback-icon">🍓</div><div><strong>Choose your answer!</strong><p>BerryBelle will tell you how it went.</p></div>`;

  document.querySelector("#next-battle").hidden=true;
  battleLocked=false;
}

function handleBattleChoice(choice){
  if(battleLocked) return;
  battleLocked=true;

  const round=battleRounds[state.battleIndex % battleRounds.length];
  const isCorrect=choice===round.correct;
  const selected=document.querySelector(`.choice-card[data-choice="${choice}"]`);
  const correct=document.querySelector(`.choice-card[data-choice="${round.correct}"]`);

  document.querySelectorAll(".choice-card").forEach(card=>card.disabled=true);
  correct?.classList.add("correct-choice");
  if(!isCorrect) selected?.classList.add("wrong-choice");

  const feedback=document.querySelector("#battle-feedback");

  if(isCorrect){
    state.battleCorrect+=1;
    feedback.className="battle-feedback success-feedback";
    feedback.innerHTML=`<div class="feedback-icon">🏆</div><div><strong>Cozy win!</strong><p>${escapeHtml(round.explanation)}</p></div>`;
    addXp(20,"Battle win");
  }else{
    feedback.className="battle-feedback error-feedback";
    feedback.innerHTML=`<div class="feedback-icon">💡</div><div><strong>Almost!</strong><p>${escapeHtml(round.explanation)} The correct answer is highlighted.</p></div>`;
    showToast("Good try — the correct choice is glowing.");
  }

  saveState();
  document.querySelector("#next-battle").hidden=false;
}

function nextBattle(){
  if(state.battleIndex>=battleRounds.length-1){
    const score=state.battleCorrect;
    state.battleIndex=0;
    state.battleCorrect=0;
    saveState();
    renderBattle();
    showToast(`Battle set complete! ${score}/${battleRounds.length} cozy wins 🏆`);
    setView("path");
    return;
  }

  state.battleIndex+=1;
  saveState();
  renderBattle();
}

function resetDemo(){
  if(!window.confirm("Reset Berry Vibes demo progress?")) return;
  state={...defaultState,savedRecipes:[]};
  saveState();
  updateStats();
  renderRecipes();
  renderBattle();
  setView("home");
  showToast("Demo progress reset.");
}

function wireEvents(){
  document.addEventListener("click",event=>{
    const viewButton=event.target.closest("[data-view-target]");
    if(viewButton){
      setView(viewButton.dataset.viewTarget);
      return;
    }

    const worldButton=event.target.closest("[data-world]");
    if(worldButton){
      activeRecipeFilter=worldButton.dataset.world;
      setView("recipes");
      document.querySelectorAll(".filter-chip").forEach(button=>{
        button.classList.toggle("active-filter",button.dataset.filter===activeRecipeFilter);
      });
      renderRecipes();
      return;
    }

    const lessonNode=event.target.closest("[data-lesson]");
    if(lessonNode){
      if(lessonNode.dataset.lesson==="food-battle") openLessonDialog();
      else showToast("Lesson complete in this demo ✨");
      return;
    }

    const choice=event.target.closest(".choice-card[data-choice]");
    if(choice){
      handleBattleChoice(choice.dataset.choice);
      return;
    }

    const saveButton=event.target.closest("[data-save-recipe]");
    if(saveButton){
      toggleSaveRecipe(saveButton.dataset.saveRecipe);
      return;
    }

    const battleButton=event.target.closest("[data-battle-recipe]");
    if(battleButton){
      setView("battle");
      showToast("Recipe battle loaded! ⚔️");
      return;
    }

    const statButton=event.target.closest("[data-stat]");
    if(statButton){
      if(statButton.dataset.stat==="streak") showToast(`${state.streak}-day cozy streak 🔥`);
      if(statButton.dataset.stat==="xp") showToast(`${state.xp} Berry XP collected ✨`);
      if(statButton.dataset.stat==="hearts") showToast(`${state.hearts} hearts available 💗`);
    }
  });

  document.querySelector("#next-battle")?.addEventListener("click",nextBattle);

  document.querySelector("#recipe-search")?.addEventListener("input",event=>{
    recipeSearchQuery=event.target.value;
    renderRecipes();
  });

  document.querySelector("#recipe-filters")?.addEventListener("click",event=>{
    const filterButton=event.target.closest("[data-filter]");
    if(!filterButton) return;

    activeRecipeFilter=filterButton.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach(button=>{
      button.classList.toggle("active-filter",button===filterButton);
    });
    renderRecipes();
  });

  document.querySelector(".dialog-close")?.addEventListener("click",closeLessonDialog);
  document.querySelector("#start-lesson-button")?.addEventListener("click",()=>{
    closeLessonDialog();
    setView("battle");
    renderBattle();
  });

  lessonDialog?.addEventListener("click",event=>{
    const rect=lessonDialog.getBoundingClientRect();
    const outside=event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;
    if(outside) closeLessonDialog();
  });

  document.querySelector("#reset-progress")?.addEventListener("click",resetDemo);
}

function init(){
  wireEvents();
  updateStats();
  renderRecipes();
  renderBattle();

  const start=document.querySelector(`[data-view="${state.currentView}"]`) ? state.currentView : "home";
  setView(start);
}

init();
