// 当前入口口令；比较时会忽略前后空格和英文字母大小写。
const ACCESS_CODE = "Tenacious Goddess";

document.documentElement.classList.add("has-js");

const gate = document.querySelector("#gate");
const gatePanel = gate.querySelector(".gate__panel");
const accessForm = document.querySelector("#access-form");
const accessInput = document.querySelector("#access-code");
const birthdaySite = document.querySelector("#birthday-site");
const pageControls = document.querySelector(".page-controls");
const previousPage = document.querySelector("#previous-page");
const nextPage = document.querySelector("#next-page");
const chapters = [...document.querySelectorAll("main .chapter")];
const introChapter = document.querySelector("#intro");
let activeChapter = 0;
let turningPage = false;
let courtStoryReached = false;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (window.BirthdayParticles) introChapter.classList.add("is-assembling");

function normalizeCode(value) {
  return value.trim().toLowerCase();
}

async function openBirthdaySite() {
  document.dispatchEvent(new Event('birthday:entered'));
  accessInput.removeAttribute("aria-invalid");
  accessForm.classList.remove("is-error");
  accessInput.disabled = true;
  accessForm.querySelector("button").disabled = true;
  gate.classList.add("is-celebrating");

  if (window.BirthdayParticles) {
    await window.BirthdayParticles.hideGateCat();
  } else {
    await new Promise((resolve) => window.setTimeout(resolve, 350));
  }

  gate.classList.add("is-opening");
  window.setTimeout(() => {
    gate.hidden = true;
    birthdaySite.hidden = false;
    document.body.classList.remove("is-locked");
    window.scrollTo({ top: 0, behavior: "instant" });
    showChapter(0);
    if (window.BirthdayParticles) {
      turningPage = true;
      window.BirthdayParticles.playIntroAssembly(() => {
        introChapter.classList.remove("is-assembling");
      }).finally(() => {
        turningPage = false;
        updatePageControls();
      });
    } else {
      introChapter.classList.remove("is-assembling");
    }
  }, reducedMotion.matches ? 0 : 700);
}

function showWrongCodeMessage() {
  accessInput.setAttribute("aria-invalid", "true");
  accessForm.classList.remove("is-error");
  void accessForm.offsetWidth;
  accessForm.classList.add("is-error");
  gatePanel.classList.remove("is-shaking");
  void gatePanel.offsetWidth;
  gatePanel.classList.add("is-shaking");
  accessInput.select();
}

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (normalizeCode(accessInput.value) === normalizeCode(ACCESS_CODE)) {
    openBirthdaySite();
    return;
  }

  showWrongCodeMessage();
});

// 每次只显示一幕；长内容仍用同一组按钮分屏阅读。
function chapterReader(chapter) {
  // 小窗口里的篮球正文也可以用原来的上下按钮读完。
  return chapter.id === "court" && courtStoryReached ? courtStory : chapter;
}

function updatePageControls() {
  const chapter = chapters[activeChapter];
  const reader = chapterReader(chapter);
  const courtNeedsCompletion = chapter.id === "court" && !courtStoryReached;
  previousPage.disabled = activeChapter === 0 && reader.scrollTop < 2;
  nextPage.disabled = courtNeedsCompletion || (
    activeChapter === chapters.length - 1 &&
    reader.scrollTop >= reader.scrollHeight - reader.clientHeight - 2
  );
  pageControls.classList.toggle("is-on-light", chapter.dataset.navTheme === "light");
  pageControls.classList.toggle(
    "is-letter-reading",
    chapter.id === "letter" && chapter.classList.contains("is-reading"),
  );
}

function showChapter(index, fromBottom = false) {
  activeChapter = index;
  chapters.forEach((chapter, position) => {
    chapter.hidden = position !== index;
    chapter.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  });
  const chapter = chapters[index];
  const reader = chapterReader(chapter);
  reader.scrollTop = fromBottom ? reader.scrollHeight : 0;
  if (!reducedMotion.matches) {
    chapter.animate(
      [{ opacity: 0, transform: `translateY(${fromBottom ? "-14px" : "14px"})` },
       { opacity: 1, transform: "translateY(0)" }],
      { duration: 600, easing: "ease-out" },
    );
  }
  updatePageControls();

}

async function turnPage(direction) {
  if (turningPage || birthdaySite.hidden) return;
  const chapter = chapters[activeChapter];
  const reader = chapterReader(chapter);
  const maxScroll = reader.scrollHeight - reader.clientHeight;
  const hasMore = direction > 0 ? reader.scrollTop < maxScroll - 2 : reader.scrollTop > 2;
  if (hasMore) {
    reader.scrollTo({
      top: Math.max(0, Math.min(maxScroll, reader.scrollTop + direction * reader.clientHeight * 0.8)),
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  } else {
    const destination = activeChapter + direction;
    if (destination < 0 || destination >= chapters.length) return;
    const isCatTransition = direction > 0 && chapter.id === "court" && chapters[destination].id === "cats";
    if (isCatTransition && window.BirthdayParticles) {
      turningPage = true;
      document.body.classList.add("is-particle-transition");
      try {
        await window.BirthdayParticles.playBasketballToPaw(() => showChapter(destination));
      } finally {
        document.body.classList.remove("is-particle-transition");
      }
    } else {
      showChapter(destination, direction < 0);
    }
  }
  turningPage = true;
  window.setTimeout(() => {
    turningPage = false;
    updatePageControls();
  }, reducedMotion.matches ? 0 : 650);
}

previousPage.addEventListener("click", () => turnPage(-1));
nextPage.addEventListener("click", () => turnPage(1));
// 保留浏览器缩放和按钮的 Enter / Space 操作，屏蔽滚轮及滚动快捷键。
birthdaySite.addEventListener("wheel", (event) => {
  if (!event.ctrlKey) event.preventDefault();
}, { passive: false });
document.addEventListener("keydown", (event) => {
  if (birthdaySite.hidden || event.target.matches("input, textarea")) return;
  if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(event.key) ||
      (event.key === " " && !event.target.closest("button"))) event.preventDefault();
});
window.addEventListener("resize", () => {
  // 拖拽后的行内像素坐标不能沿用到新窗口尺寸；回到随布局变化的原位。
  if (!draggingBasketball && !courtStoryReached && !dragBasketball.classList.contains("is-scored")) {
    dragBasketball.style.removeProperty("left");
    dragBasketball.style.removeProperty("top");
    ballHome = null;
  }
  catProps.forEach((prop) => {
    if (prop === draggedCatProp || prop.classList.contains("is-eaten")) return;
    ["left", "top", "right", "bottom"].forEach((name) => prop.style.removeProperty(name));
    catPropHomes.delete(prop);
  });
  if (!birthdaySite.hidden) updatePageControls();
});

const courtPlay = document.querySelector("#court-play");
const courtStory = document.querySelector("#court-story");
const courtInstruction = document.querySelector("#court-instruction");
const jersey = document.querySelector("#jersey");
const dragBasketball = document.querySelector("#drag-basketball");
const hoopTarget = document.querySelector("#hoop-target");
let jerseyReady = false;
let draggingBasketball = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let ballHome = null;

function changeCourtInstruction(message) {
  courtInstruction.classList.add("is-changing");
  window.setTimeout(() => {
    courtInstruction.textContent = message;
    courtInstruction.classList.remove("is-changing");
  }, reducedMotion.matches ? 0 : 300);
}

jersey.addEventListener("click", () => {
  if (jerseyReady) return;
  jerseyReady = true;
  jersey.classList.add("is-revealed");
  jersey.disabled = true;

  window.setTimeout(() => {
    changeCourtInstruction("把球投进篮筐");
    dragBasketball.disabled = false;
  }, reducedMotion.matches ? 0 : 980);
});

function rememberBallHome() {
  ballHome = {
    left: dragBasketball.offsetLeft / courtPlay.clientWidth * 100,
    top: dragBasketball.offsetTop / courtPlay.clientHeight * 100,
  };
}

function returnBallHome() {
  if (!ballHome) return;
  dragBasketball.style.left = `${ballHome.left}%`;
  dragBasketball.style.top = `${ballHome.top}%`;
}

function revealCourtStory() {
  courtPlay.classList.add("is-leaving");
  window.setTimeout(() => {
    courtPlay.hidden = true;
    courtStory.hidden = false;
    requestAnimationFrame(() => courtStory.classList.add("is-visible"));
    courtStoryReached = true;
    updatePageControls();
  }, reducedMotion.matches ? 0 : 760);
}

function scoreBasketball() {
  const stageRect = courtPlay.getBoundingClientRect();
  const targetRect = hoopTarget.getBoundingClientRect();
  const ballRect = dragBasketball.getBoundingClientRect();
  const targetLeft = targetRect.left - stageRect.left + targetRect.width / 2 - ballRect.width / 2;
  const targetTop = targetRect.top - stageRect.top + targetRect.height * 0.18;

  dragBasketball.style.left = `${targetLeft}px`;
  dragBasketball.style.top = `${targetTop}px`;
  window.setTimeout(() => dragBasketball.classList.add("is-scored"), reducedMotion.matches ? 0 : 380);
  window.setTimeout(revealCourtStory, reducedMotion.matches ? 0 : 900);
}

function finishBasketballDrag(event) {
  if (!draggingBasketball) return;
  draggingBasketball = false;
  dragBasketball.classList.remove("is-dragging");
  if (dragBasketball.hasPointerCapture(event.pointerId)) {
    dragBasketball.releasePointerCapture(event.pointerId);
  }

  const ballRect = dragBasketball.getBoundingClientRect();
  const targetRect = hoopTarget.getBoundingClientRect();
  const ballCenterX = ballRect.left + ballRect.width / 2;
  const ballCenterY = ballRect.top + ballRect.height / 2;
  const insideRim = ballCenterX >= targetRect.left &&
    ballCenterX <= targetRect.right &&
    ballCenterY >= targetRect.top - ballRect.height * 0.22 &&
    ballCenterY <= targetRect.bottom + ballRect.height * 0.18;

  if (insideRim) {
    scoreBasketball();
  } else {
    returnBallHome();
  }
}

dragBasketball.addEventListener("pointerdown", (event) => {
  if (!jerseyReady || dragBasketball.disabled || event.button !== 0) return;
  if (!ballHome) rememberBallHome();

  draggingBasketball = true;
  dragBasketball.classList.add("is-dragging");
  const stageRect = courtPlay.getBoundingClientRect();
  const ballRect = dragBasketball.getBoundingClientRect();
  dragOffsetX = event.clientX - ballRect.left;
  dragOffsetY = event.clientY - ballRect.top;
  dragBasketball.style.left = `${ballRect.left - stageRect.left}px`;
  dragBasketball.style.top = `${ballRect.top - stageRect.top}px`;
  dragBasketball.setPointerCapture(event.pointerId);
  event.preventDefault();
});

dragBasketball.addEventListener("pointermove", (event) => {
  if (!draggingBasketball) return;
  const stageRect = courtPlay.getBoundingClientRect();
  const ballRect = dragBasketball.getBoundingClientRect();
  const nextLeft = Math.max(0, Math.min(
    stageRect.width - ballRect.width,
    event.clientX - stageRect.left - dragOffsetX,
  ));
  const nextTop = Math.max(0, Math.min(
    stageRect.height - ballRect.height,
    event.clientY - stageRect.top - dragOffsetY,
  ));
  dragBasketball.style.left = `${nextLeft}px`;
  dragBasketball.style.top = `${nextTop}px`;
});

dragBasketball.addEventListener("pointerup", finishBasketballDrag);
dragBasketball.addEventListener("pointercancel", (event) => {
  if (!draggingBasketball) return;
  draggingBasketball = false;
  dragBasketball.classList.remove("is-dragging");
  if (dragBasketball.hasPointerCapture(event.pointerId)) {
    dragBasketball.releasePointerCapture(event.pointerId);
  }
  returnBallHome();
});
dragBasketball.addEventListener("dragstart", (event) => event.preventDefault());

const catPlayground = document.querySelector("#cat-playground");
const ananAvatar = document.querySelector("#anan-avatar");
const ananBubble = document.querySelector("#anan-bubble");
const ananBubbleMessage = document.querySelector("#anan-bubble-message");
const ananHint = document.querySelector("#anan-hint");
const ananMouthTarget = document.querySelector("#anan-mouth-target");
const catProps = [...document.querySelectorAll(".cat-prop")];
const catPropHomes = new WeakMap();
let ananPetCount = 0;
let ananHasEaten = false;
let draggedCatProp = null;
let catPropOffsetX = 0;
let catPropOffsetY = 0;

function showAnanBubble(message) {
  ananBubble.hidden = false;
  ananBubble.classList.remove("is-flipped");
  ananBubbleMessage.textContent = message;
}

ananAvatar.addEventListener("click", () => {
  ananAvatar.classList.remove("is-petted");
  void ananAvatar.offsetWidth;
  ananAvatar.classList.add("is-petted");

  if (ananHasEaten) return;
  if (ananPetCount === 0) {
    showAnanBubble("喵");
    ananHint.textContent = "再摸一摸";
  } else {
    showAnanBubble("meow~");
    ananHint.textContent = "安安饿了";
  }
  ananPetCount += 1;
});

function rememberCatPropHome(prop) {
  if (catPropHomes.has(prop)) return;
  catPropHomes.set(prop, {
    left: prop.offsetLeft / catPlayground.clientWidth * 100,
    top: prop.offsetTop / catPlayground.clientHeight * 100,
  });
}

function returnCatPropHome(prop) {
  const home = catPropHomes.get(prop);
  if (!home) return;
  prop.style.left = `${home.left}%`;
  prop.style.top = `${home.top}%`;
}

function finishCatPropDrag(event) {
  if (!draggedCatProp) return;
  const prop = draggedCatProp;
  draggedCatProp = null;
  prop.classList.remove("is-dragging");
  if (prop.hasPointerCapture(event.pointerId)) prop.releasePointerCapture(event.pointerId);

  const propRect = prop.getBoundingClientRect();
  const targetRect = ananMouthTarget.getBoundingClientRect();
  const centerX = propRect.left + propRect.width / 2;
  const centerY = propRect.top + propRect.height / 2;
  const reachesMouth = centerX >= targetRect.left && centerX <= targetRect.right &&
    centerY >= targetRect.top && centerY <= targetRect.bottom;

  if (!reachesMouth) {
    returnCatPropHome(prop);
    return;
  }

  if (ananPetCount < 2) {
    showAnanBubble("先摸摸我");
    ananHint.textContent = "先摸两下安安";
    returnCatPropHome(prop);
    return;
  }

  if (prop.dataset.kind === "toy") {
    showAnanBubble("安安现在不想玩");
    ananHint.textContent = "安安饿了";
    returnCatPropHome(prop);
    return;
  }

  ananHasEaten = true;
  prop.classList.add("is-eaten");
  showAnanBubble("咪喵mimomeowmeowmeow~");
  ananHint.textContent = "点击看安安在说什么";
  ananBubble.disabled = false;
  ananBubble.setAttribute("aria-label", "点击看安安在说什么");
}

catProps.forEach((prop) => {
  prop.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || draggedCatProp || prop.classList.contains("is-eaten")) return;
    rememberCatPropHome(prop);
    const startLeft = prop.offsetLeft;
    const startTop = prop.offsetTop;
    prop.style.left = `${startLeft}px`;
    prop.style.top = `${startTop}px`;
    prop.style.right = "auto";
    prop.style.bottom = "auto";
    draggedCatProp = prop;
    prop.classList.add("is-dragging");
    const propRect = prop.getBoundingClientRect();
    catPropOffsetX = event.clientX - propRect.left;
    catPropOffsetY = event.clientY - propRect.top;
    prop.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  prop.addEventListener("pointermove", (event) => {
    if (draggedCatProp !== prop) return;
    const stageRect = catPlayground.getBoundingClientRect();
    const propRect = prop.getBoundingClientRect();
    prop.style.left = `${Math.max(0, Math.min(stageRect.width - propRect.width, event.clientX - stageRect.left - catPropOffsetX))}px`;
    prop.style.top = `${Math.max(0, Math.min(stageRect.height - propRect.height, event.clientY - stageRect.top - catPropOffsetY))}px`;
  });

  prop.addEventListener("pointerup", finishCatPropDrag);
  prop.addEventListener("pointercancel", (event) => {
    if (draggedCatProp !== prop) return;
    draggedCatProp = null;
    prop.classList.remove("is-dragging");
    if (prop.hasPointerCapture(event.pointerId)) prop.releasePointerCapture(event.pointerId);
    returnCatPropHome(prop);
  });
  prop.addEventListener("dragstart", (event) => event.preventDefault());
});

ananBubble.addEventListener("click", () => {
  if (!ananHasEaten) return;
  ananBubble.classList.toggle("is-flipped");
  ananHint.textContent = ananBubble.classList.contains("is-flipped")
    ? "生日祝福已送达"
    : "点击看安安在说什么";
});

const openLetterButton = document.querySelector("#open-letter");
const letterSheet = document.querySelector("#letter-sheet");

openLetterButton.addEventListener("click", () => {
  if (openLetterButton.classList.contains("is-open")) return;

  openLetterButton.classList.add("is-open");
  openLetterButton.setAttribute("aria-expanded", "true");
  openLetterButton.querySelector(".envelope__prompt").textContent = "信已打开";

  window.setTimeout(() => {
    letterSheet.hidden = false;
    const chapter = chapters[activeChapter];
    if (chapter.id === "letter") {
      chapter.classList.add("is-reading");
      letterSheet.focus({ preventScroll: true });
      // 阅读模式只显示信纸，从开头读起，不让入场动画的位移影响滚动位置。
      chapter.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
      window.setTimeout(updatePageControls, 650);
    }
  }, 650);
});

const endingCat = document.querySelector("#ending-cat");
const endingReply = document.querySelector("#ending-reply");
const endingMessages = [
  "呼噜声 +1，今日好运已经到账。",
  "安安把脑袋又递过来了一点。",
  "检测到连续摸猫：一曼今天会有好事。",
  "再摸就要收一根猫条手续费了。",
  "安安决定把这一摸记进生日账本。",
];
let endingCatClicks = 0;

endingCat.addEventListener("click", () => {
  endingCat.classList.remove("is-petted");
  void endingCat.offsetWidth;
  endingCat.classList.add("is-petted");
  endingReply.textContent = endingMessages[endingCatClicks % endingMessages.length];
  endingReply.hidden = false;
  endingCatClicks += 1;
});

window.addEventListener("load", () => accessInput.focus());
