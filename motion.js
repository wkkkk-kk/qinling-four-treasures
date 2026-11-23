const sceneDetails = {
  jinyue: { setting: "林冠 · 午后", title: "林光里的金跃", caption: "暖光穿过树冠，镜头向金跃递出的果子缓缓靠近。" },
  qizai: { setting: "竹林 · 清晨", title: "七仔的竹影", caption: "光线在竹影间渐亮，棕白七仔安静坐着。" },
  danxiang: { setting: "水岸 · 朝霞", title: "丹翔掠过水岸", caption: "镜头沿水面轻移，从霞光与倒影里看向展翅的丹翔。" },
  yantuo: { setting: "山径 · 暮色", title: "岩拓留一盏灯", caption: "暮色渐深，山径上的一盏暖灯缓缓亮起。" }
};

const SystemMotion = matchMedia("(prefers-reduced-motion: reduce)");
const motionPref = document.querySelector("#motion-preference");
let reduceSiteMotion = false;
try {
  reduceSiteMotion = localStorage.getItem("qinling-reduced-motion") === "yes";
} catch {}
const motionIsReduced = () => SystemMotion.matches || reduceSiteMotion;

function applyMotionPreference() {
  document.documentElement.classList.toggle("quiet-motion", motionIsReduced());
  motionPref.setAttribute("aria-pressed", String(motionIsReduced()));
  motionPref.disabled = SystemMotion.matches;
}

motionPref.hidden = false;
motionPref.addEventListener("click", () => {
  reduceSiteMotion = !reduceSiteMotion;
  try {
    localStorage.setItem("qinling-reduced-motion", reduceSiteMotion ? "yes" : "no");
  } catch {}
  applyMotionPreference();
});
SystemMotion.addEventListener("change", applyMotionPreference);
applyMotionPreference();

const revealed = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("has-arrived");
    revealed.unobserve(entry.target);
  }
}, { threshold: 0.08 });

function watchReveals(section) {
  section.querySelectorAll("[data-reveal]:not(.has-arrived)").forEach(node => revealed.observe(node));
}

const sceneDialog = document.querySelector("#scene-dialog");
const sceneImage = document.querySelector("#scene-dialog-image");
const sceneToggle = document.querySelector("#scene-toggle");
const sceneDownload = document.querySelector("#scene-download");
const sceneStatus = document.querySelector("#scene-dialog-status");
let sceneRole;
let scenePlaying = false;

const scenePoster = role => "assets/edition/" + role + "-poster.webp";
const sceneGif = role => "assets/motion/" + role + ".gif";

function setScenePlayback(playing) {
  scenePlaying = playing;
  sceneStatus.textContent = "";
  sceneImage.src = playing ? sceneGif(sceneRole) : scenePoster(sceneRole);
  sceneToggle.textContent = playing ? "停止播放" : "播放 GIF";
}
sceneImage.addEventListener("error", () => {
  if (!scenePlaying || !sceneDialog.open) return;
  setScenePlayback(false);
  sceneStatus.textContent = "动图加载失败，可以重试播放。";
});
sceneToggle.addEventListener("click", () => setScenePlayback(!scenePlaying));
sceneDialog.querySelector(".dialog-close").addEventListener("click", () => sceneDialog.close());
sceneDialog.addEventListener("click", event => {
  if (event.target === sceneDialog) sceneDialog.close();
});
sceneDialog.addEventListener("close", () => {
  scenePlaying = false;
  sceneImage.removeAttribute("src");
});
SystemMotion.addEventListener("change", () => {
  if (SystemMotion.matches && sceneDialog.open) setScenePlayback(false);
});

function openScene(role) {
  const scene = sceneDetails[role];
  sceneRole = role;
  document.querySelector("#scene-dialog-title").textContent = scene.title;
  sceneImage.alt = scene.caption;
  sceneDownload.href = sceneGif(role);
  sceneDownload.download = scene.title + ".gif";
  sceneDialog.showModal();
  setScenePlayback(true);
}
