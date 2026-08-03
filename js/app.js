"use strict";

const recipes = [
  {id:"pancakes",name:"Cinnamony Cinnamon Buttermilk Pancakes",category:"breakfast",icon:"🥞",description:"Warm, fluffy pancakes with cinnamon and a soft buttermilk-style tang.",expect:"Fluffy centers, lightly crisp edges, cozy cinnamon warmth, and a soft breakfast-café feel.",tip:"Let the batter rest for a few minutes before cooking for an even fluffier texture.",tags:["fluffy","cinnamon","breakfast"]},
  {id:"cinnamon-rolls",name:"Microwave Cinnamon Rolls",category:"bakery",icon:"🌀",description:"Soft cinnamon spirals made for a fast cozy bakery-style moment.",expect:"Tender dough, a warm cinnamon center, and sweet glaze energy without a long bake.",tip:"Roll the dough evenly so every bite gets the same cinnamon swirl.",tags:["cinnamon","bakery","microwave"]},
  {id:"brownie-cake",name:"Brownie Batter Cake",category:"chocolate",icon:"🍫",description:"A chocolate-forward cake with a soft brownie-batter-inspired center.",expect:"Deep cocoa flavor, soft texture, and a rich dessert-bar feeling.",tip:"Stop cooking while the center still looks slightly soft so it stays fudgy.",tags:["chocolate","fudgy","dessert"]},
  {id:"oreo-bowl",name:"Oreo Frozen Yogurt Bowl",category:"chocolate",icon:"🍨",description:"Cold, creamy, cookie-filled comfort with a crunchy Oreo finish.",expect:"Creamy base, cookie crunch, and a chilled cookies-and-cream vibe.",tip:"Add the cookie pieces last so they stay crisp.",tags:["oreo","chilled","creamy"]},
  {id:"mocha",name:"Chili Mocha Latte",category:"drinks",icon:"☕",description:"Chocolate coffee with cinnamon warmth and a tiny spark of chili.",expect:"Cozy cocoa, coffee bitterness, cinnamon warmth, and gentle heat at the finish.",tip:"Use only a tiny pinch of chili first; you can always add more.",tags:["coffee","mocha","warm"]},
  {id:"latte",name:"Iced Vanilla Latte",category:"drinks",icon:"🥤",description:"A smooth, sweet café-style iced drink for a relaxed afternoon.",expect:"Cool milkiness, vanilla sweetness, and a mellow coffee finish.",tip:"Pour coffee over plenty of ice so the drink stays extra cold.",tags:["iced","coffee","vanilla"]},
  {id:"pizza",name:"Mini Tortilla Pizza",category:"savory",icon:"🍕",description:"A crisp tortilla base with melty cheese and cozy pizza-shop flavor.",expect:"Crisp edges, melty center, savory tomato flavor, and a quick pizza-night vibe.",tip:"Keep toppings light so the tortilla stays crisp.",tags:["pizza","savory","crispy"]},
  {id:"wrap",name:"Spinach Chicken Wrap",category:"savory",icon:"🌯",description:"A soft wrap packed with savory chicken, greens, and creamy comfort.",expect:"Soft tortilla, savory filling, and a balanced handheld meal.",tip:"Warm the tortilla for a few seconds before rolling to prevent cracking.",tags:["wrap","chicken","savory"]},
  {id:"cake-pops",name:"CCD Cake Pop Bites",category:"bakery",icon:"🍭",description:"Tiny celebratory cake bites with playful bakery-case energy.",expect:"Soft cake centers, sweet coating, and a fun bite-sized dessert feel.",tip:"Chill the cake bites before coating so they hold their shape.",tags:["cake","party","bakery"]}
];

const state = {
  route: "home",
  filter: "all",
  search: "",
  favorites: new Set(),
  activeRecipe: null
};

const pages = [...document.querySelectorAll("[data-page]")];
const navLinks = [...document.querySelectorAll(".nav-link")];
const mainNav = document.querySelector("#mainNav");
const menuButton = document.querySelector("#menuButton");
const recipeGrid = document.querySelector("#recipeGrid");
const recipeSearch = document.querySelector("#recipeSearch");
const filterButtons = [...document.querySelectorAll(".filter")];
const recipeDialog = document.querySelector("#recipeDialog");
const closeDialog = document.querySelector("#closeDialog");
const dialogIcon = document.querySelector("#dialogIcon");
const dialogCategory = document.querySelector("#dialogCategory");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogDescription = document.querySelector("#dialogDescription");
const dialogExpect = document.querySelector("#dialogExpect");
const dialogTip = document.querySelector("#dialogTip");
const dialogSave = document.querySelector("#dialogSave");
const favoritesButton = document.querySelector("#favoritesButton");
const favoritesDrawer = document.querySelector("#favoritesDrawer");
const closeFavorites = document.querySelector("#closeFavorites");
const favoritesList = document.querySelector("#favoritesList");
const favoriteCount = document.querySelector("#favoriteCount");
const battleResult = document.querySelector("#battleResult");
const berrybelleButton = document.querySelector("#berrybelleButton");
const berrybelleMessage = document.querySelector("#berrybelleMessage");
const toast = document.querySelector("#toast");

function goTo(route, updateHash = true) {
  const valid = pages.some(page => page.dataset.page === route) ? route : "home";
  state.route = valid;

  pages.forEach(page => page.classList.toggle("active", page.dataset.page === valid));
  navLinks.forEach(link => link.classList.toggle("active", link.dataset.route === valid));

  mainNav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");

  if (updateHash) {
    history.replaceState(null, "", `#${valid}`);
  }

  window.scrollTo({top: 0, behavior: "smooth"});
}

function setFilter(filter) {
  state.filter = filter;
  filterButtons.forEach(button => button.classList.toggle("active", button.dataset.filter === filter));
  renderRecipes();
}

function renderRecipes() {
  const query = state.search.trim().toLowerCase();

  const visible = recipes.filter(recipe => {
    const categoryMatch = state.filter === "all" || recipe.category === state.filter;
    const searchMatch =
      recipe.name.toLowerCase().includes(query) ||
      recipe.description.toLowerCase().includes(query) ||
      recipe.tags.some(tag => tag.includes(query));

    return categoryMatch && searchMatch;
  });

  recipeGrid.innerHTML = "";

  if (!visible.length) {
    recipeGrid.innerHTML = '<div class="empty"><h2>No cozy match yet 🍓</h2><p>Try another search or category.</p></div>';
    return;
  }

  visible.forEach(recipe => {
    const saved = state.favorites.has(recipe.id);
    const card = document.createElement("article");
    card.className = "recipe-card";

    card.innerHTML = `
      <div class="recipe-top">
        <div class="recipe-icon">${recipe.icon}</div>
        <button class="favorite-toggle ${saved ? "saved" : ""}" data-favorite="${recipe.id}" type="button" aria-label="${saved ? "Remove" : "Save"} ${recipe.name}">
          ${saved ? "♥" : "♡"}
        </button>
      </div>
      <h2>${recipe.name}</h2>
      <p>${recipe.description}</p>
      <div class="tags">${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
      <button class="pill pink-button view-button" data-open-recipe="${recipe.id}" type="button">View Recipe</button>
    `;

    recipeGrid.appendChild(card);
  });
}

function openRecipe(id) {
  const recipe = recipes.find(item => item.id === id);
  if (!recipe) return;

  state.activeRecipe = recipe.id;
  dialogIcon.textContent = recipe.icon;
  dialogCategory.textContent = recipe.category;
  dialogTitle.textContent = recipe.name;
  dialogDescription.textContent = recipe.description;
  dialogExpect.textContent = recipe.expect;
  dialogTip.textContent = recipe.tip;
  dialogSave.textContent = state.favorites.has(recipe.id) ? "♥ Saved Recipe" : "♡ Save Recipe";
  recipeDialog.showModal();
}

function toggleFavorite(id) {
  const recipe = recipes.find(item => item.id === id);
  if (!recipe) return;

  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    showToast(`${recipe.name} removed from favorites.`);
  } else {
    state.favorites.add(id);
    showToast(`${recipe.name} saved! 🍓`);
  }

  renderRecipes();
  renderFavorites();

  if (state.activeRecipe === id && recipeDialog.open) {
    dialogSave.textContent = state.favorites.has(id) ? "♥ Saved Recipe" : "♡ Save Recipe";
  }
}

function renderFavorites() {
  favoriteCount.textContent = state.favorites.size;
  favoritesList.innerHTML = "";

  if (!state.favorites.size) {
    favoritesList.innerHTML = '<div class="favorite-item"><strong>No saved recipes yet.</strong><span>Tap a heart on a recipe card.</span></div>';
    return;
  }

  [...state.favorites].forEach(id => {
    const recipe = recipes.find(item => item.id === id);
    if (!recipe) return;

    const item = document.createElement("div");
    item.className = "favorite-item";
    item.innerHTML = `<strong>${recipe.icon} ${recipe.name}</strong><span>${recipe.description}</span>`;
    favoritesList.appendChild(item);
  });
}

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.addEventListener("click", event => {
  const routeLink = event.target.closest("[data-route]");
  if (routeLink) {
    event.preventDefault();
    goTo(routeLink.dataset.route);
    return;
  }

  const routeButton = event.target.closest("[data-go]");
  if (routeButton) {
    goTo(routeButton.dataset.go);

    if (routeButton.dataset.go === "recipes" && routeButton.dataset.filter) {
      setFilter(routeButton.dataset.filter);
    }

    return;
  }

  const recipeButton = event.target.closest("[data-open-recipe]");
  if (recipeButton) {
    openRecipe(recipeButton.dataset.openRecipe);
    return;
  }

  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favorite);
  }
});

menuButton.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

recipeSearch.addEventListener("input", () => {
  state.search = recipeSearch.value;
  renderRecipes();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

closeDialog.addEventListener("click", () => recipeDialog.close());

recipeDialog.addEventListener("click", event => {
  const rect = recipeDialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) recipeDialog.close();
});

dialogSave.addEventListener("click", () => {
  if (state.activeRecipe) toggleFavorite(state.activeRecipe);
});

favoritesButton.addEventListener("click", () => {
  favoritesDrawer.classList.add("open");
  favoritesDrawer.setAttribute("aria-hidden", "false");
});

closeFavorites.addEventListener("click", () => {
  favoritesDrawer.classList.remove("open");
  favoritesDrawer.setAttribute("aria-hidden", "true");
});

document.querySelectorAll(".battle-choice").forEach(button => {
  button.addEventListener("click", () => {
    const message = button.dataset.choice === "ccd"
      ? "🍓 BerryBelle picked the CCD side with you! Soft, swirly, quick, and very cozy."
      : "🥐 Bakery wins this round! BerryBelle respects a dramatic icing-glaze moment.";

    battleResult.textContent = message;
    battleResult.classList.remove("pop");
    void battleResult.offsetWidth;
    battleResult.classList.add("pop");
  });
});

const berryMessages = [
  "🍓 BerryBelle says: your cozy era looks good on you.",
  "🎀 BerryBelle says: pick the recipe that sounds the most fun.",
  "✨ BerryBelle has distributed one complimentary sparkle.",
  "⚔️ BerryBelle is ready to referee another food battle.",
  "🥞 BerryBelle votes for a breakfast side quest."
];

let berryIndex = 0;

berrybelleButton.addEventListener("click", () => {
  berrybelleMessage.textContent = berryMessages[berryIndex];
  berryIndex = (berryIndex + 1) % berryMessages.length;
});

window.addEventListener("hashchange", () => {
  goTo(location.hash.replace("#", "") || "home", false);
});

renderRecipes();
renderFavorites();
goTo(location.hash.replace("#", "") || "home", false);
