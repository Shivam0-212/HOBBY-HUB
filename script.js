/***********************
  HOBBY HUB PROTOTYPE
  Implements:
  - Guest/User/Organizer/Admin roles
  - Hobby-based mapping engine
  - Social + Learning + Events
  - Moderation panel
************************/

/* ------------------ DATA ------------------ */
const HOBBIES = [
  { id: "music", name: "Music 🎵", desc: "Chord progressions, practice tips, songwriting." },
  { id: "coding", name: "Coding 💻", desc: "Web dev, projects, debugging & learning paths." },
  { id: "painting", name: "Painting 🎨", desc: "Art styles, brush techniques, color theory." },
  { id: "photography", name: "Photography 📷", desc: "Camera settings, composition, editing." },
  { id: "gaming", name: "Gaming 🎮", desc: "Strategy, esports, reviews & friendly matches." },
  { id: "cooking", name: "Cooking 🍳", desc: "Recipes, plating, kitchen hacks." }
];

// LocalStorage keys
const KEY_USERS = "hh_users";
const KEY_SESSION = "hh_session";
const KEY_POSTS = "hh_posts";
const KEY_EVENTS = "hh_events";
const KEY_RESOURCES = "hh_resources";
const KEY_BANS = "hh_banned";

/* ------------------ HELPERS ------------------ */
const $ = (id) => document.getElementById(id);

function nowStamp(){
  return new Date().toLocaleString();
}

function uid(){
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function getLS(key, fallback){
  const raw = localStorage.getItem(key);
  if(!raw) return fallback;
  try{ return JSON.parse(raw); }catch{ return fallback; }
}

function setLS(key, val){
  localStorage.setItem(key, JSON.stringify(val));
}

/* ------------------ INIT SEED ------------------ */
function seedDemoAccounts(){
  const users = getLS(KEY_USERS, []);

  const exists = (email) => users.some(u => u.email === email);

  if(!exists("admin@hub.com")){
    users.push({
      id: uid(),
      name: "Admin",
      email: "admin@hub.com",
      pass: "admin123",
      role: "admin",
      hobbies: ["coding"]
    });
  }

  if(!exists("org@hub.com")){
    users.push({
      id: uid(),
      name: "Event Organizer",
      email: "org@hub.com",
      pass: "org123",
      role: "organizer",
      hobbies: ["music", "painting"]
    });
  }

  setLS(KEY_USERS, users);
}

function seedDemoContent(){
  const posts = getLS(KEY_POSTS, []);
  const events = getLS(KEY_EVENTS, []);
  const resources = getLS(KEY_RESOURCES, []);

  if(posts.length === 0){
    posts.push(
      {
        id: uid(),
        hobby: "music",
        author: "Priya Sharma",
        authorRole: "user",
        text: "Just learned a new chord progression for my song 🎸 Sharing notes with you all!",
        time: nowStamp()
      },
      {
        id: uid(),
        hobby: "coding",
        author: "Rahul",
        authorRole: "user",
        text: "Guide: Web Development Basics — HTML + CSS + JS roadmap. Ask if you need help!",
        time: nowStamp()
      }
    );
  }

  if(events.length === 0){
    events.push(
      {
        id: uid(),
        hobby: "painting",
        title: "Painting Workshop",
        date: "2026-02-25",
        location: "Art Studio, City",
        createdBy: "Event Organizer",
        participants: []
      },
      {
        id: uid(),
        hobby: "coding",
        title: "Beginner Web Dev Bootcamp",
        date: "2026-02-28",
        location: "Online",
        createdBy: "Event Organizer",
        participants: []
      }
    );
  }

  if(resources.length === 0){
    resources.push(
      { id: uid(), hobby: "music", type: "PDF", title: "Free Music Theory PDF", url: "https://example.com", addedBy: "Priya Sharma" },
      { id: uid(), hobby: "coding", type: "Article", title: "Basics of Game Development", url: "https://example.com", addedBy: "Rahul" }
    );
  }

  setLS(KEY_POSTS, posts);
  setLS(KEY_EVENTS, events);
  setLS(KEY_RESOURCES, resources);
}

seedDemoAccounts();
seedDemoContent();

/* ------------------ UI REFS ------------------ */
const authScreen = $("authScreen");
const hobbyScreen = $("hobbyScreen");
const dashboard = $("dashboard");

const tabLogin = $("tabLogin");
const tabRegister = $("tabRegister");
const loginBox = $("loginBox");
const registerBox = $("registerBox");

const btnLogin = $("btnLogin");
const btnRegister = $("btnRegister");
const btnGuest = $("btnGuest");
const btnLogout = $("btnLogout");

const hobbyGrid = $("hobbyGrid");
const btnContinue = $("btnContinue");

const myHobbies = $("myHobbies");
const communityList = $("communityList");
const feed = $("feed");

const currentCommunityTitle = $("currentCommunityTitle");
const currentCommunityDesc = $("currentCommunityDesc");

const userName = $("userName");
const userRole = $("userRole");
const avatarCircle = $("avatarCircle");

const postText = $("postText");
const btnPost = $("btnPost");
const postHint = $("postHint");

const eventsBox = $("eventsBox");
const resourcesBox = $("resourcesBox");

const btnChangeHobbies = $("btnChangeHobbies");

const organizerBtn = $("btnNewEvent");
const btnAddResource = $("btnAddResource");

const adminTools = $("adminTools");
const btnOpenAdmin = $("btnOpenAdmin");

/* Modals */
const modalOverlay = $("modalOverlay");
const eventModal = $("eventModal");
const resourceModal = $("resourceModal");
const adminModal = $("adminModal");

const btnCloseEvent = $("btnCloseEvent");
const btnSaveEvent = $("btnSaveEvent");

const btnCloseResource = $("btnCloseResource");
const btnSaveResource = $("btnSaveResource");

const btnCloseAdmin = $("btnCloseAdmin");

const globalSearch = $("globalSearch");

/* ------------------ STATE ------------------ */
let selectedHobbies = new Set();
let currentCommunity = null;

/* ------------------ SESSION ------------------ */
function getSession(){
  return getLS(KEY_SESSION, null);
}

function setSession(s){
  setLS(KEY_SESSION, s);
}

function clearSession(){
  localStorage.removeItem(KEY_SESSION);
}

function isBanned(email){
  const banned = getLS(KEY_BANS, []);
  return banned.includes(email);
}

/* ------------------ SCREEN SWITCH ------------------ */
function showScreen(which){
  authScreen.classList.remove("active");
  hobbyScreen.classList.remove("active");
  dashboard.classList.remove("active");

  which.classList.add("active");
}

/* ------------------ AUTH TABS ------------------ */
tabLogin.onclick = () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginBox.classList.remove("hidden");
  registerBox.classList.add("hidden");
};

tabRegister.onclick = () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerBox.classList.remove("hidden");
  loginBox.classList.add("hidden");
};

/* ------------------ LOGIN ------------------ */
btnLogin.onclick = () => {
  const email = $("loginEmail").value.trim().toLowerCase();
  const pass = $("loginPass").value.trim();

  const users = getLS(KEY_USERS, []);
  const user = users.find(u => u.email === email && u.pass === pass);

  if(!email || !pass) return alert("Enter email and password!");
  if(isBanned(email)) return alert("This account is banned by Admin.");

  if(!user) return alert("Invalid login!");

  setSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    hobbies: user.hobbies || [],
    mode: "auth"
  });

  startApp();
};

/* ------------------ REGISTER ------------------ */
btnRegister.onclick = () => {
  const name = $("regName").value.trim();
  const email = $("regEmail").value.trim().toLowerCase();
  const pass = $("regPass").value.trim();
  const role = $("regRole").value;

  if(!name || !email || !pass) return alert("Fill all fields!");

  const users = getLS(KEY_USERS, []);
  if(users.some(u => u.email === email)) return alert("Email already registered!");

  const newUser = {
    id: uid(),
    name,
    email,
    pass,
    role,
    hobbies: []
  };

  users.push(newUser);
  setLS(KEY_USERS, users);

  alert("Account created! Now login.");
  tabLogin.click();
};

/* ------------------ GUEST MODE ------------------ */
btnGuest.onclick = () => {
  setSession({
    id: "guest",
    name: "Guest",
    email: "guest@local",
    role: "guest",
    hobbies: [],
    mode: "guest"
  });

  startApp();
};

/* ------------------ LOGOUT ------------------ */
btnLogout.onclick = () => {
  clearSession();
  location.reload();
};

/* ------------------ HOBBY SCREEN ------------------ */
function renderHobbyGrid(){
  hobbyGrid.innerHTML = "";

  HOBBIES.forEach(h => {
    const div = document.createElement("div");
    div.className = "hobby";
    div.innerHTML = `<h3>${h.name}</h3><p class="muted small">${h.desc}</p>`;

    div.onclick = () => {
      if(selectedHobbies.has(h.id)){
        selectedHobbies.delete(h.id);
        div.classList.remove("selected");
      }else{
        selectedHobbies.add(h.id);
        div.classList.add("selected");
      }
    };

    hobbyGrid.appendChild(div);
  });
}

btnContinue.onclick = () => {
  const s = getSession();
  if(!s) return;

  if(s.role !== "guest" && selectedHobbies.size === 0){
    return alert("Select at least 1 hobby!");
  }

  // save hobbies for logged in user
  if(s.role !== "guest"){
    const users = getLS(KEY_USERS, []);
    const idx = users.findIndex(u => u.id === s.id);
    if(idx !== -1){
      users[idx].hobbies = [...selectedHobbies];
      setLS(KEY_USERS, users);

      s.hobbies = [...selectedHobbies];
      setSession(s);
    }
  }else{
    s.hobbies = [...selectedHobbies];
    setSession(s);
  }

  showScreen(dashboard);
  bootDashboard();
};

/* ------------------ DASHBOARD ------------------ */
function bootDashboard(){
  const s = getSession();
  if(!s) return;

  userName.textContent = s.name;
  userRole.textContent = s.role.toUpperCase();

  // Role controls
  adminTools.classList.toggle("hidden", s.role !== "admin");
  organizerBtn.classList.toggle("hidden", s.role !== "organizer");
  btnPost.disabled = (s.role === "guest");
  postText.disabled = (s.role === "guest");
  btnAddResource.disabled = (s.role === "guest");

  postHint.textContent = (s.role === "guest")
    ? "Guest mode: Register/Login to post."
    : "";

  // hobbies
  myHobbies.innerHTML = "";
  (s.hobbies || []).forEach(hid => {
    const h = HOBBIES.find(x => x.id === hid);
    if(!h) return;
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = h.name;
    myHobbies.appendChild(chip);
  });

  // communities list = hobbies selected
  communityList.innerHTML = "";

  const list = (s.hobbies || []).length ? s.hobbies : ["coding"]; // guest fallback

  list.forEach((hid, i) => {
    const h = HOBBIES.find(x => x.id === hid);
    const item = document.createElement("div");
    item.className = "item";
    item.textContent = h ? h.name : hid;

    item.onclick = () => {
      document.querySelectorAll(".list .item").forEach(x => x.classList.remove("active"));
      item.classList.add("active");
      currentCommunity = hid;
      renderCommunity();
    };

    communityList.appendChild(item);

    if(i === 0){
      item.classList.add("active");
      currentCommunity = hid;
    }
  });

  renderCommunity();
}

/* ------------------ COMMUNITY RENDER ------------------ */
function renderCommunity(){
  const h = HOBBIES.find(x => x.id === currentCommunity);
  currentCommunityTitle.textContent = h ? `${h.name} Community` : "Community";
  currentCommunityDesc.textContent = h ? h.desc : "Hobby-based community";

  renderFeed();
  renderEvents();
  renderResources();
}

/* ------------------ POSTS (SOCIAL MODULE) ------------------ */
function renderFeed(filterText=""){
  const posts = getLS(KEY_POSTS, []);
  const s = getSession();

  feed.innerHTML = "";

  let filtered = posts.filter(p => p.hobby === currentCommunity);

  if(filterText){
    const q = filterText.toLowerCase();
    filtered = filtered.filter(p =>
      p.text.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q)
    );
  }

  if(filtered.length === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<h3>No posts yet ✨</h3><p class="muted">Be the first to share something!</p>`;
    feed.appendChild(empty);
    return;
  }

  filtered.slice().reverse().forEach(p => {
    const div = document.createElement("div");
    div.className = "post";

    const canDelete =
      (s.role === "admin") ||
      (s.role !== "guest" && s.name === p.author);

    div.innerHTML = `
      <div class="meta">
        <div class="row">
          <b>${p.author}</b>
          <span class="badge">${p.authorRole}</span>
          <span class="badge">${p.time}</span>
        </div>
        <div class="row">
          ${canDelete ? `<button class="btn danger" data-del="${p.id}">Delete</button>` : ""}
        </div>
      </div>
      <div>${escapeHtml(p.text)}</div>
    `;

    feed.appendChild(div);
  });

  // bind delete
  document.querySelectorAll("[data-del]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-del");
      deletePost(id);
    };
  });
}

function escapeHtml(str){
  return str
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

btnPost.onclick = () => {
  const s = getSession();
  if(!s || s.role === "guest") return alert("Guest cannot post!");

  const text = postText.value.trim();
  if(!text) return alert("Write something!");

  const posts = getLS(KEY_POSTS, []);
  posts.push({
    id: uid(),
    hobby: currentCommunity,
    author: s.name,
    authorRole: s.role,
    text,
    time: nowStamp()
  });

  setLS(KEY_POSTS, posts);
  postText.value = "";
  renderFeed(globalSearch.value.trim());
};

function deletePost(postId){
  const s = getSession();
  const posts = getLS(KEY_POSTS, []);
  const p = posts.find(x => x.id === postId);

  if(!p) return;

  const allowed =
    (s.role === "admin") ||
    (s.role !== "guest" && s.name === p.author);

  if(!allowed) return alert("Not allowed!");

  const newPosts = posts.filter(x => x.id !== postId);
  setLS(KEY_POSTS, newPosts);
  renderFeed(globalSearch.value.trim());
}

/* ------------------ EVENTS MODULE ------------------ */
function renderEvents(filterText=""){
  const events = getLS(KEY_EVENTS, []);
  const s = getSession();

  eventsBox.innerHTML = "";

  let filtered = events.filter(e => e.hobby === currentCommunity);

  if(filterText){
    const q = filterText.toLowerCase();
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  }

  if(filtered.length === 0){
    eventsBox.innerHTML = `<div class="box"><b>No events</b><p class="muted small">Organizer can create events.</p></div>`;
    return;
  }

  filtered.forEach(e => {
    const joined = e.participants.includes(s.email);

    const div = document.createElement("div");
    div.className = "box";
    div.innerHTML = `
      <b>${escapeHtml(e.title)}</b>
      <p class="muted small">${e.date} • ${escapeHtml(e.location)}</p>
      <p class="muted small">Created by: ${escapeHtml(e.createdBy)}</p>
      <div class="row">
        <button class="btn ${joined ? "ghost" : ""}" data-join="${e.id}">
          ${joined ? "Joined ✓" : "Join"}
        </button>
        <span class="muted small">${e.participants.length} participants</span>
      </div>
    `;
    eventsBox.appendChild(div);
  });

  document.querySelectorAll("[data-join]").forEach(btn => {
    btn.onclick = () => joinEvent(btn.getAttribute("data-join"));
  });
}

function joinEvent(eventId){
  const s = getSession();
  if(s.role === "guest") return alert("Guest cannot join events!");

  const events = getLS(KEY_EVENTS, []);
  const idx = events.findIndex(e => e.id === eventId);
  if(idx === -1) return;

  if(!events[idx].participants.includes(s.email)){
    events[idx].participants.push(s.email);
    setLS(KEY_EVENTS, events);
  }

  renderEvents(globalSearch.value.trim());
}

/* Organizer create event */
$("btnNewEvent").onclick = () => openModal(eventModal);

btnCloseEvent.onclick = () => closeModal(eventModal);

btnSaveEvent.onclick = () => {
  const s = getSession();
  if(s.role !== "organizer") return alert("Only organizer can create events!");

  const title = $("eventTitle").value.trim();
  const date = $("eventDate").value;
  const location = $("eventLocation").value.trim();

  if(!title || !date || !location) return alert("Fill all event fields!");

  const events = getLS(KEY_EVENTS, []);
  events.push({
    id: uid(),
    hobby: currentCommunity,
    title,
    date,
    location,
    createdBy: s.name,
    participants: []
  });

  setLS(KEY_EVENTS, events);

  $("eventTitle").value = "";
  $("eventDate").value = "";
  $("eventLocation").value = "";

  closeModal(eventModal);
  renderEvents(globalSearch.value.trim());
};

/* ------------------ RESOURCES MODULE ------------------ */
function renderResources(filterText=""){
  const resources = getLS(KEY_RESOURCES, []);
  resourcesBox.innerHTML = "";

  let filtered = resources.filter(r => r.hobby === currentCommunity);

  if(filterText){
    const q = filterText.toLowerCase();
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
    );
  }

  if(filtered.length === 0){
    resourcesBox.innerHTML = `<div class="box"><b>No resources</b><p class="muted small">Add the first learning resource!</p></div>`;
    return;
  }

  filtered.slice().reverse().forEach(r => {
    const div = document.createElement("div");
    div.className = "box";
    div.innerHTML = `
      <b>${escapeHtml(r.title)}</b>
      <p class="muted small">${escapeHtml(r.type)} • Added by ${escapeHtml(r.addedBy)}</p>
      <a href="${r.url}" target="_blank">Open Resource ↗</a>
    `;
    resourcesBox.appendChild(div);
  });
}

btnAddResource.onclick = () => {
  const s = getSession();
  if(s.role === "guest") return alert("Guest cannot add resources!");
  openModal(resourceModal);
};

btnCloseResource.onclick = () => closeModal(resourceModal);

btnSaveResource.onclick = () => {
  const s = getSession();
  if(s.role === "guest") return;

  const type = $("resType").value;
  const title = $("resTitle").value.trim();
  const url = $("resUrl").value.trim();

  if(!type || !title || !url) return alert("Fill all resource fields!");

  const resources = getLS(KEY_RESOURCES, []);
  resources.push({
    id: uid(),
    hobby: currentCommunity,
    type,
    title,
    url,
    addedBy: s.name
  });

  setLS(KEY_RESOURCES, resources);

  $("resTitle").value = "";
  $("resUrl").value = "";

  closeModal(resourceModal);
  renderResources(globalSearch.value.trim());
};

/* ------------------ ADMIN / MODERATION ------------------ */
btnOpenAdmin.onclick = () => {
  const s = getSession();
  if(s.role !== "admin") return;
  openModal(adminModal);
  renderAdminPanel();
};

btnCloseAdmin.onclick = () => closeModal(adminModal);

function renderAdminPanel(){
  const users = getLS(KEY_USERS, []);
  const posts = getLS(KEY_POSTS, []);
  const banned = getLS(KEY_BANS, []);

  $("adminUsers").innerHTML = "";
  $("adminPosts").innerHTML = "";

  users.forEach(u => {
    const isBan = banned.includes(u.email);

    const box = document.createElement("div");
    box.className = "box";
    box.innerHTML = `
      <b>${escapeHtml(u.name)}</b>
      <p class="muted small">${escapeHtml(u.email)} • ${u.role}</p>
      <button class="btn ${isBan ? "ghost" : "danger"}" data-ban="${u.email}">
        ${isBan ? "Unban" : "Ban"}
      </button>
    `;
    $("adminUsers").appendChild(box);
  });

  posts.slice().reverse().slice(0, 8).forEach(p => {
    const box = document.createElement("div");
    box.className = "box";
    box.innerHTML = `
      <b>${escapeHtml(p.author)}</b>
      <p class="muted small">${p.hobby} • ${p.time}</p>
      <p>${escapeHtml(p.text).slice(0, 120)}...</p>
      <button class="btn danger" data-apdel="${p.id}">Remove Post</button>
    `;
    $("adminPosts").appendChild(box);
  });

  document.querySelectorAll("[data-ban]").forEach(btn => {
    btn.onclick = () => toggleBan(btn.getAttribute("data-ban"));
  });

  document.querySelectorAll("[data-apdel]").forEach(btn => {
    btn.onclick = () => {
      deletePost(btn.getAttribute("data-apdel"));
      renderAdminPanel();
    };
  });
}

function toggleBan(email){
  const banned = getLS(KEY_BANS, []);
  const idx = banned.indexOf(email);

  if(idx === -1) banned.push(email);
  else banned.splice(idx, 1);

  setLS(KEY_BANS, banned);
  renderAdminPanel();
}

/* ------------------ MODALS ------------------ */
function openModal(modal){
  modalOverlay.classList.remove("hidden");
  modal.classList.remove("hidden");
}

function closeModal(modal){
  modalOverlay.classList.add("hidden");
  modal.classList.add("hidden");
}

modalOverlay.onclick = () => {
  closeModal(eventModal);
  closeModal(resourceModal);
  closeModal(adminModal);
};

/* ------------------ CHANGE HOBBIES ------------------ */
btnChangeHobbies.onclick = () => {
  const s = getSession();
  if(!s) return;

  selectedHobbies = new Set(s.hobbies || []);
  showScreen(hobbyScreen);
  renderHobbyGrid();

  // auto-select UI
  setTimeout(() => {
    [...hobbyGrid.children].forEach((card, i) => {
      const hid = HOBBIES[i].id;
      if(selectedHobbies.has(hid)) card.classList.add("selected");
    });
  }, 10);
};

/* ------------------ SEARCH ------------------ */
globalSearch.oninput = () => {
  const q = globalSearch.value.trim();
  renderFeed(q);
  renderEvents(q);
  renderResources(q);
};

/* ------------------ APP START ------------------ */
function startApp(){
  const s = getSession();
  if(!s){
    showScreen(authScreen);
    return;
  }

  // if user has hobbies, go dashboard else go hobby selection
  if(s.role === "guest"){
    selectedHobbies = new Set(["coding", "music"]);
    showScreen(hobbyScreen);
    renderHobbyGrid();
    return;
  }

  if(!s.hobbies || s.hobbies.length === 0){
    selectedHobbies = new Set();
    showScreen(hobbyScreen);
    renderHobbyGrid();
    return;
  }

  showScreen(dashboard);
  bootDashboard();
}

/* ------------------ INITIAL LOAD ------------------ */
startApp();