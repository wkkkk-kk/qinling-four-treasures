"use strict";
const select = (selector, parent = document) => parent.querySelector(selector);
const all = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const make = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const titles = {top:"总览",characters:"四宝角色",stories:"山林故事",stickers:"表情图鉴",gallery:"作品展厅",motion:"动态影像",community:"共创广场",cooperation:"秦岭四宝项目"};
const characters = [
  {id:"jinyue",name:"金跃",animal:"金丝猴",role:"热情的同行邀请者",tagline:"好东西，分你一半。",intro:"路上遇见好东西，金跃总想赶快拿给朋友看。他热情、机敏，也有一点小冒失：常常先把大的那一份递出去，才发现自己留下的最小。",anchor:"金橙毛发、蓝色面部、短而上翘的鼻、红围巾与长卷尾",rhythm:"重心先走，手追上，尾巴最后才停。",quote:"“这个给你，我们下次再一起找。”",sheet:"assets/overview/jinyue.webp",card:"assets/overview/jinyue.webp",storyTitle:"大的那一半",story:"金跃发现一颗熟透的果子，把它分成两半。看见伙伴走来，他立刻把大块递过去。伙伴问“那你呢？”，他才低头看看手里剩下的小块，又笑了。树荫下，他们一边分享，一边等其他伙伴到来。",storyQuote:"“下次我们再一起找。”",storyImage:"assets/story-cover.webp",stickerCount:32,workImage:"assets/product-study.webp",workLabel:"文创概念与角色海报",workDescription:"围绕金跃的红围巾、金色卷尾与分享动作展开。",workLink:"assets/hero-poster.png",workLinkLabel:"下载角色主视觉海报"},
  {id:"qizai",name:"七仔",animal:"棕白大熊猫",role:"安静的倾听者",tagline:"你慢慢说，我在听。",intro:"同伴们急着说话时，七仔会先安静地听。他总能注意到谁还没有开口，再把身旁的位置留出来。七仔温和、专注，回应不急，却会陪着对方把话说完。",anchor:"巧克力棕圆耳、眼斑与四肢，奶油白脸腹，竹绿短披衣",rhythm:"先侧耳，等半拍，再把身旁的空位让出来。",quote:"“我在这儿，慢慢来。”",sheet:"assets/overview/qizai.webp",card:"assets/overview/qizai.webp",storyTitle:"留一个位置",story:"七仔的故事从倾听开始。有人想说话时，他会停下来，把身旁的空位让出来；有人暂时不想说，他就安静地陪在旁边。竹影慢慢移动，同行的人不必急着给出答案。",storyQuote:"“我先听你说。”",storyImage:"assets/edition/qizai-poster.webp",stickerCount:32,workImage:"assets/characters/qizai/profile.webp",workLabel:"角色设定与表情素材",workDescription:"已整理三视图、16张透明底表情与STL源件。",workLink:"assets/characters/qizai/profile.webp",workLinkLabel:"查看角色设定图"},
  {id:"danxiang",name:"丹翔",animal:"朱鹮",role:"敏锐的观察与查证者",tagline:"我再看清楚一点。",intro:"丹翔观察细致、回应及时，常在大家忙着赶路时先注意到同伴的情绪和需要。她行动很快，也会停下来再次确认；飞近一点、看看清楚，再把可靠的消息带回来。",anchor:"朱红面部、下弯长喙、后枕羽冠、粉白羽翼与金色花形扣",rhythm:"先探头，收翼停一下，再回头核实。",quote:"“我来看看。”",sheet:"assets/overview/danxiang.webp",card:"assets/overview/danxiang.webp",storyTitle:"我来看看",story:"丹翔总是先看见队伍里的小变化。有人走慢了，她会盘旋回来；有人没说出口，她就轻轻问一句“我来看看”。她陪伙伴把事情弄明白，也会在需要时伸翼遮护或给一个拥抱。",storyQuote:"“不用一个人面对，身边一直有人留意着你。”",storyImage:"assets/characters/danxiang/story-visual.webp",stickerCount:32,workImage:"assets/characters/danxiang/product-concept.webp",workLabel:"故事主视觉与文创概念",workDescription:"以留意与陪伴为主题的主视觉及首发文创方向稿。",workLink:"assets/characters/danxiang/story-visual.png",workLinkLabel:"查看故事主视觉概念"},
  {id:"yantuo",name:"岩拓",animal:"羚牛",role:"沉稳的收尾与照应者",tagline:"稳住，慢慢来。",intro:"岩拓是秦岭山路上的稳行伙伴。他不急着赶路，总会留意身边的人；有人落后，他就停下来等一等。习惯走在前面的他，也会折返回来，把队伍里最后一个伙伴接上。",anchor:"厚肩、宽鼻镜、成对弯角、金棕毛发与分趾蹄",rhythm:"落蹄、站住、回望，最后才开口。",quote:"“我在后面，大家慢慢走。”",sheet:"assets/overview/yantuo.webp",card:"assets/overview/yantuo.webp",storyTitle:"最后一个也要等到",story:"岩拓习惯走在队伍前面，也总会回头看看。天色渐晚时，他举起灯，放慢脚步，等还在后面收拾行囊的伙伴一起回到驿站。这一次，伙伴们也为他留了灯。",storyQuote:"“一起到，才算到了。”",storyImage:"assets/characters/yantuo/story-visual.webp",stickerCount:32,workImage:"assets/characters/yantuo/product-concept.webp",workLabel:"晨行主视觉与文创概念",workDescription:"以稳行、回望与照应为主题的视觉和产品方向稿。",workLink:"assets/characters/yantuo/story-visual.png",workLinkLabel:"查看故事主视觉概念"}
];
const productWorks = artworkCollection;
const charById = Object.assign(Object.create(null), Object.fromEntries(characters.map(item => [item.id, item])));
const art = select("#art-dialog");
const share = select("#share-dialog");
const main = select("#page-main");
const nav = select("#main-nav");
const menu = select(".mobile-menu");
let stickerItems;
let stickerRequest;
let stickerFilter = "全部";
let stickerCharacter = "全部角色";
let currentPage;
let currentDetail;
let activeSticker;
let opener;
let renderId = 0;
const absoluteHash = () => location.hash.slice(1).split("/");

function setMenu(open) {
  nav.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
  select("use", menu).setAttribute("href", open ? "#ico-close" : "#ico-menu");
}
menu.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", () => setMenu(false));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menu.focus(); }
});
document.addEventListener("click", event => {
  if (nav.classList.contains("open") && !event.target.closest(".mast")) setMenu(false);
});
select(".skip").addEventListener("click", event => { event.preventDefault(); main.focus(); });

function roleCard(character, className = "character-card") {
  const link = make("a", "", className); link.href = "#characters/" + character.id;
  const figure = make("figure");
  const image = make("img"); image.src = character.card; image.alt = character.name + "角色形象"; image.loading = "lazy";
  figure.append(image);
  const copy = make("div", "", "character-card-copy");
  copy.append(make("p", character.animal, "character-species"), make("h3", character.name), make("p", character.role, "character-tagline"), make("span", "进入角色档案", "text-link"));
  link.append(figure, copy); return link;
}
characters.forEach(character => {
  select("#home-characters").append(roleCard(character));
  select("#character-grid").append(roleCard(character));
});

function renderCharacter(id) {
  const character = charById[id];
  const index = select("#character-index"); const profile = select("#character-profile");
  if (!character) { index.hidden = false; profile.hidden = true; return; }
  index.hidden = true; profile.hidden = false;
  const sheet = select("#profile-sheet"); sheet.src = character.sheet; sheet.alt = character.name + "主题故事与文创主视觉";
  select("#profile-caption").textContent = character.name + " · " + character.animal + "角色主视觉";
  select("#profile-species").textContent = "QINLING FOUR TREASURES  /  " + character.animal;
  select("#profile-name").textContent = character.name;
  select("#profile-role").textContent = character.role + " · “" + character.tagline + "”";
  select("#profile-intro").textContent = character.intro;
  const facts = select("#profile-facts"); facts.replaceChildren();
  [["识别特征",character.anchor],["动作节拍",character.rhythm],["现有表情",character.stickerCount + " 张"]].forEach(([label,value]) => {
    const row = make("div"); row.append(make("dt",label),make("dd",value)); facts.append(row);
  });
  select("#profile-quote").textContent = character.quote;
  select("#profile-stickers").href = "#stickers/role-" + character.id;
  select("#profile-story").href = "#stories/" + character.id;
  select("#profile-motion").href = "#motion/" + character.id;
  select("#profile-works-title").textContent = character.name + "的海报与文创";
  select("#profile-gallery-link").href = "#gallery/" + id;
  const dialogue = select("#jinyue-dialogue");
  dialogue.hidden = id !== "jinyue";
  if (dialogue.hidden) select("video", dialogue).pause();
  renderArchive(character);
  select("#profile-work-cards").replaceChildren(
    ...productWorks.filter(work => work.character === id).map(work => artworkCard(work, "work-card"))
  );
}

function renderArchive(character) {
  const entry = archiveDetails[character.id];
  const section = select("#profile-archive");
  const heading = make("h2", character.name + "的设计档案");
  const image = make("img");
  image.src = "assets/characters/" + character.id + "/profile.webp";
  image.alt = character.name + "的正面、侧面和背面造型";
  image.loading = "lazy";
  const original = make("a", "", "archive-sheet");
  original.href = image.src;
  original.target = "_blank";
  original.rel = "noopener";
  original.append(image, make("span", "查看角色三视图"));
  const copy = make("div", "", "archive-color");
  copy.append(make("h3", entry.headline));
  const palette = make("ul", "", "archive-palette");
  for (const [label, color] of entry.colors) {
    const item = make("li", label);
    const swatch = make("span");
    swatch.setAttribute("aria-hidden", "true");
    swatch.style.background = color;
    item.prepend(swatch);
    palette.append(item);
  }
  copy.append(palette);
  if (entry.source) {
    const source = make("a", "国家林业和草原局 · 七仔的保护故事", "text-link");
    source.href = entry.source;
    source.target = "_blank";
    source.rel = "noopener";
    copy.append(make("p", "七仔是全球唯一圈养的棕白色大熊猫。角色保留真实七仔的棕白毛色，并以竹纹披衣表现秦岭故事。"), source);
  }
  const spread = make("div", "", "archive-spread");
  spread.append(original, copy);
  const notes = make("div", "", "archive-notes");
  for (const [label, text] of entry.notes) {
    const note = make("div");
    note.append(make("h3", label), make("p", text));
    notes.append(note);
  }
  section.replaceChildren(heading, spread, notes);
}

function artworkCard(work, className) {
  const card = make("article", "", className);
  if (work.kind === "主题海报") card.classList.add("is-poster");
  const link = make("a", "", "artwork-preview");
  link.href = work.image;
  link.target = "_blank";
  link.rel = "noopener";
  link.setAttribute("aria-label", "查看大图：" + work.title);
  const image = make("img");
  image.src = work.image;
  image.alt = work.title + " · " + work.kind;
  image.loading = "lazy";
  link.append(image);
  const copy = make("div", "", className + "-copy");
  const category = work.kind === "主题海报" ? work.kind : work.kind + " · 概念设计";
  copy.append(make("p", category, "eyebrow"), make("h3", work.title), make("p", work.description));
  card.append(link, copy);
  return card;
}

const storyChapters = select("#story-chapters");
const storyGrid = select("#story-grid");

function sectionLink(label, href, className) {
  const link = make("a", label, className);
  link.href = href;
  return link;
}

function scenePlayButton(character, text = "播放场景 GIF") {
  const button = make("button", text, "button scene-play");
  button.type = "button";
  button.setAttribute("aria-haspopup", "dialog");
  button.addEventListener("click", () => openScene(character.id));
  return button;
}

function currentStoryChapter(id) {
  for (const link of all("a", storyChapters)) {
    if (link.dataset.role === id) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

function showStoryChapter(id, smooth) {
  const chapter = document.getElementById("story-" + id);
  if (!chapter) return;
  currentStoryChapter(id);
  select("h2", chapter).focus({ preventScroll: true });
  chapter.scrollIntoView({ block: "start", behavior: smooth && !motionIsReduced() ? "smooth" : "instant" });
}

function renderStories(detail, samePage) {
  if (!storyGrid.childElementCount) {
    for (const [index, character] of characters.entries()) {
      const { id, name } = character;
      const scene = sceneDetails[id];
      const jump = sectionLink(name, "#stories/" + id);
      jump.dataset.role = id;
      jump.addEventListener("click", () => {
        if (location.hash === jump.hash) showStoryChapter(id, true);
      });
      storyChapters.append(jump);

      const chapter = make("article", "", "story-scene story-" + id);
      chapter.id = "story-" + id;
      chapter.dataset.role = id;
      const body = make("div", "", "frame story-body");
      const copy = make("div", "", "story-scene-copy");
      copy.dataset.reveal = "";
      const heading = make("h2", character.storyTitle);
      heading.tabIndex = -1;
      const artwork = make("div", "", "story-painting");
      const image = make("img");
      image.src = scenePoster(id);
      image.alt = scene.title + " · 故事插画";
      image.width = 623;
      image.height = 623;
      if (index > 0) image.loading = "lazy";
      artwork.append(image);
      copy.append(
        make("p", name + " / " + scene.setting, "eyebrow"),
        heading, make("p", character.story, "story-scene-text"),
        make("blockquote", character.storyQuote)
      );
      const actions = make("div", "", "buttons");
      actions.append(
        scenePlayButton(character),
        sectionLink("角色档案", "#characters/" + id, "button scene-outline"),
        sectionLink("相关作品", "#gallery/" + id, "button scene-outline")
      );
      copy.append(actions);
      body.append(copy, artwork);
      chapter.append(body);
      storyGrid.append(chapter);
    }
  }
  watchReveals(storyGrid);
  if (charById[detail]) {
    requestAnimationFrame(() => {
      if (location.hash === "#stories/" + detail) showStoryChapter(detail, samePage);
    });
  } else {
    currentStoryChapter(characters[0].id);
  }
}

let storyScrollFrame = 0;
window.addEventListener("scroll", () => {
  if (currentPage !== "stories" || storyScrollFrame) return;
  storyScrollFrame = requestAnimationFrame(() => {
    storyScrollFrame = 0;
    if (currentPage !== "stories") return;
    const marker = Math.max(110, window.innerHeight * 0.36);
    const chapters = all(".story-scene", storyGrid);
    const current = chapters.findLast(chapter => chapter.getBoundingClientRect().top <= marker);
    currentStoryChapter(current?.dataset.role || characters[0].id);
  });
}, { passive: true });

function renderMotionGallery(detail) {
  const grid = select("#motion-gallery");
  grid.replaceChildren(...characters.map(character => {
    const { id, name } = character;
    const scene = sceneDetails[id];
    const card = make("article", "", "motion-card");
    card.id = "motion-" + id;
    const preview = make("button", "", "motion-preview");
    preview.type = "button";
    preview.setAttribute("aria-label", "播放" + scene.title);
    preview.setAttribute("aria-haspopup", "dialog");
    preview.addEventListener("click", () => openScene(id));
    const image = make("img");
    image.src = scenePoster(id);
    image.alt = "";
    image.width = image.height = 623;
    image.loading = "lazy";
    const badge = make("span", "▶", "motion-preview-icon");
    badge.setAttribute("aria-hidden", "true");
    preview.append(image, badge);
    const content = make("div", "", "motion-card-copy");
    const heading = make("h2", scene.title);
    heading.tabIndex = -1;
    const actions = make("div", "", "buttons");
    const download = sectionLink("保存 GIF", sceneGif(id), "button primary");
    download.download = scene.title + ".gif";
    actions.append(download, sectionLink("看" + name + "的故事", "#stories/" + id, "button ghost"));
    content.append(make("p", scene.setting, "eyebrow"), heading, make("p", scene.caption), actions);
    card.append(preview, content);
    return card;
  }));
  if (charById[detail]) {
    const card = document.getElementById("motion-" + detail);
    select("h2", card).focus({ preventScroll: true });
    card.scrollIntoView({ block: "center", behavior: "instant" });
  }
}

function renderGallery(detail) {
  const grid = select("#gallery-grid");
  const role = charById[detail];
  const roles = role ? [role] : characters;
  const filters = select("#gallery-filters");
  filters.replaceChildren(...[null, ...characters].map(item => {
    const link = make("a", item?.name || "全部角色");
    link.href = "#gallery" + (item ? "/" + item.id : "");
    if (item === (role || null)) link.setAttribute("aria-current", "page");
    return link;
  }));
  grid.replaceChildren(...roles.map(item => {
    const section = make("section", "", "edition-gallery-group");
    const head = make("div", "", "section-head");
    const title = make("h2", item.name + " · " + item.animal);
    const link = make("a", "角色档案", "text-link");
    link.href = "#characters/" + item.id;
    head.append(title, link);
    const works = make("div", "", "edition-gallery-cards");
    works.append(...productWorks.filter(work => work.character === item.id).map(work => artworkCard(work, "gallery-card")));
    section.append(head, works);
    return section;
  }));
}

function loadStickers() {
  if (stickerItems) return Promise.resolve(stickerItems);
  if (!stickerRequest) {
    stickerRequest = fetch("stickers.json").then(response => {
      if (!response.ok) throw new Error("图鉴暂时无法读取");
      return response.json();
    }).then(items => { stickerItems = items; return items; })
      .catch(error => { stickerRequest = undefined; throw error; });
  }
  return stickerRequest;
}
function renderStickers() {
  const grid = select("#sticker-grid");
  const charFilters = select("#character-filters");
  const filters = select("#sticker-filters");
  if (!charFilters.children.length) ["全部角色", ...characters.map(item => item.name)].forEach((name,index) => {
    const button = make("button",name); button.type = "button";
    button.addEventListener("click", () => { stickerCharacter = name; renderStickers(); });
    charFilters.append(button);
  });
  const categories = ["全部", ...new Set(stickerItems.map(item => item.category))];
  if (!filters.children.length) categories.forEach(category => {
    const button = make("button", category); button.type = "button";
    button.addEventListener("click", () => { stickerFilter = category; renderStickers(); });
    filters.append(button);
  });
  all("button", charFilters).forEach(button => button.setAttribute("aria-pressed",String(button.textContent === stickerCharacter)));
  all("button", filters).forEach(button => button.setAttribute("aria-pressed",String(button.textContent === stickerFilter)));
  const matching = stickerItems.filter(item => (stickerCharacter === "全部角色" || item.characterName === stickerCharacter) && (stickerFilter === "全部" || item.category === stickerFilter));
  select("#sticker-count").textContent = matching.length + " 款";
  const tiles = matching.map(item => {
    const link = make("a", "", "sticker-tile");
    link.href = "#stickers/" + item.id; link.setAttribute("aria-label", "预览" + item.characterName + "表情：" + item.name);
    const image = make("img"); image.loading = "lazy"; image.src = item.preview; image.alt = ""; image.width = 310; image.height = 310;
    const label = make("span", item.characterName + " · " + item.name); const plus = make("b", "＋"); plus.setAttribute("aria-hidden","true");
    label.append(plus); link.append(image,label); return link;
  });
  grid.replaceChildren(...tiles);
}
function showSticker(item) {
  activeSticker = item.id;
  const image = make("img"); image.src = item.src; image.alt = item.characterName + "表情：" + item.name;
  const title = make("h2",item.name); title.id = "dialog-title";
  const info = make("p",item.characterName + " · " + item.category + " · PNG");
  const actions = make("div","","buttons");
  const download = make("a","下载单张 PNG","button primary"); download.href = item.src; download.download = item.characterName + "_" + item.name + ".png";
  actions.append(download);
  if (item.character === "jinyue" && Number(item.id) <= 32) {
    const transparent = make("a","试用透明细边版","button ghost"); transparent.href = "trial/index.html?item=T" + String(item.id).padStart(2,"0"); actions.append(transparent);
    const motion = {17:"F05", 19:"F06"}[Number(item.id)];
    if (motion) {
      const link = make("a","试发三维动图","button ghost");
      link.href = "trial/index.html?item=" + motion;
      actions.append(link);
    }
  }
  const shareItem = make("button","分享这张","button ghost"); shareItem.type = "button"; shareItem.addEventListener("click",openShare); actions.append(shareItem);
  select("#dialog-inner").replaceChildren(image,title,info,actions);
  if (!art.open) art.showModal();
}
function closeArtwork() {
  if (activeSticker) { activeSticker = undefined; history.replaceState(null,"",location.hash.split("/")[0] === "#stickers" ? "#stickers" : location.hash); }
  art.close(); if (opener?.isConnected) opener.focus({preventScroll:true});
}
art.addEventListener("cancel",event=>{event.preventDefault();closeArtwork();});
select(".dialog-close",art).addEventListener("click",closeArtwork);
art.addEventListener("click",event=>{if(event.target===art)closeArtwork();});

async function openShare() {
  const url = new URL(location.href).href;
  select("#share-url").value = url;
  const status = select("#share-status"); status.textContent = "";
  const canvas = select("#share-qr"); const save = select("#save-qr"); canvas.hidden = true; save.hidden = true;
  if (!share.open) share.showModal();
  try {
    const {default:QRCode} = await import("./assets/qr/index.js");
    const qr = new QRCode(0,0); qr.addData(url); qr.make();
    const count=qr.getModuleCount(),scale=10,quiet=4; canvas.width=canvas.height=(count+quiet*2)*scale;
    const ctx=canvas.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle="#173c2f";
    for(let y=0;y<count;y++) for(let x=0;x<count;x++) if(qr.isDark(y,x)) ctx.fillRect((x+quiet)*scale,(y+quiet)*scale,scale,scale);
    save.href=canvas.toDataURL("image/png"); canvas.hidden=false; save.hidden=false;
  } catch { status.textContent="可复制此链接分享。"; }
}
all("[data-share]").forEach(button=>button.addEventListener("click",openShare));
select(".dialog-close",share).addEventListener("click",()=>share.close());
share.addEventListener("click",event=>{if(event.target===share)share.close();});
select("#copy-url").addEventListener("click",async()=>{
  const field=select("#share-url");
  try{await navigator.clipboard.writeText(field.value);select("#share-status").textContent="链接已复制";}
  catch{field.focus();field.select();select("#share-status").textContent=document.execCommand("copy")?"链接已复制":"请复制已选中的链接";}
});

async function route() {
  const legacy = {"#about":"#characters/jinyue", "#story":"#stories/jinyue"};
  if (Object.hasOwn(legacy, location.hash)) {
    history.replaceState(history.state, "", legacy[location.hash]);
  }
  const token=++renderId; const [raw,detail]=absoluteHash(); const page=Object.hasOwn(titles,raw)?raw:"top";
  const changed=page!==currentPage||detail!==currentDetail; const previous=currentPage;
  if(share.open) share.close();
  if(sceneDialog.open) sceneDialog.close();
  if(art.open&&(page!=="stickers"||!detail)) art.close();
  activeSticker=undefined;
  if(changed){
    currentPage=page; currentDetail=detail; setMenu(false);
    all("[data-page]").forEach(panel=>{panel.hidden=panel.dataset.page!==page;});
    all("[data-nav]").forEach(link=>{if(link.dataset.nav===page)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");});
    document.title=(detail&&charById[detail]?charById[detail].name+" · ":"")+titles[page]+"｜秦岭四宝";
    if(previous && !(page === "stories" && previous === "stories" && charById[detail])) {
      main.focus({preventScroll:true});
      window.scrollTo(0,0);
    }
  }
  if(page==="characters") renderCharacter(detail);
  if(page!=="characters" || detail!=="jinyue") select("#jinyue-dialogue video").pause();
  if(page==="top") watchReveals(select('[data-page="top"]'));
  if(page==="stories") renderStories(detail, previous === "stories");
  if(page==="motion") renderMotionGallery(detail);
  if(page==="gallery") renderGallery(detail);
  if(page==="community") window.renderCommunity(detail);
  if(page==="stickers"){
    if(detail&&detail.startsWith("role-")){const role=charById[detail.slice(5)];if(role)stickerCharacter=role.name;}
    try{
      await loadStickers(); if(token!==renderId)return;
      renderStickers();
      const item=detail&&!detail.startsWith("role-")&&stickerItems.find(entry=>String(entry.id)===detail);
      if(item){stickerCharacter=item.characterName;renderStickers();opener=select('.sticker-tile[href="#stickers/'+item.id+'"]');showSticker(item);}
      else if(art.open)art.close();
    }catch{
      if(token!==renderId)return;
      const text=make("p","表情图鉴暂时无法读取。"),retry=make("button","重新载入","button ghost");
      retry.addEventListener("click",route);select("#sticker-grid").replaceChildren(text,retry);
    }
  }
}
window.addEventListener("hashchange",route);
route();

async function loadCommercialLinks(){
  const container=select("#commercial-contacts");
  try{
    const response=await fetch("commercial.json");if(!response.ok)return;
    const settings=await response.json(),email=String(settings.contactEmail||"").trim();
    if(/^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(email)){const contact=make("a","联系项目团队","text-link");contact.href="mailto:"+email;container.append(contact);}
    if(settings.officialStoreUrl){try{const url=new URL(settings.officialStoreUrl);if(url.protocol==="https:"&&url.hostname&&!url.username&&!url.password){const store=make("a","访问官方店铺","text-link");store.href=url.href;store.target="_blank";store.rel="noopener noreferrer";container.append(store);}}catch{}}
  }catch{}
}
loadCommercialLinks();
