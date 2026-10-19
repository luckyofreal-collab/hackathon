const PROMPTS = [
  "Quick hands win close games",
  "Stay calm and trust your reflexes",
  "Every champion starts with one win",
  "Good games make great rivalries",
  "The fastest fingers take the crown"
];
export function mountTyping({ players, onWinner, toast, sound }) {
  const phrase = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  const root = document.createElement("div"); root.className = "typing-game";
  root.innerHTML = `<div class="race-player"><div class="race-head"><span></span><span>0%</span></div><div class="race-bar"><div class="race-fill"></div></div><input class="race-input" maxlength="${phrase.length}" autocomplete="off" spellcheck="false" placeholder="Type here…"></div><div class="race-player p2"><div class="race-head"><span></span><span>0%</span></div><div class="race-bar"><div class="race-fill"></div></div><input class="race-input" maxlength="${phrase.length}" autocomplete="off" spellcheck="false" placeholder="Type here…"></div><div class="race-prompt"></div><div class="race-instructions">TYPE THE SENTENCE EXACTLY · NO MISTAKES ALLOWED</div>`;
  const inputs = [...root.querySelectorAll("input")], heads = [...root.querySelectorAll(".race-head")], fills = [...root.querySelectorAll(".race-fill")];
  heads.forEach((h,i) => h.firstElementChild.textContent = players[i] + (i ? " · P" : " · Q"));
  const renderPrompt = () => { const typed = inputs[0].value; root.querySelector(".race-prompt").innerHTML = [...phrase].map((c,i) => { const t = typed[i]; return !t ? "<span>"+c+"</span>" : t === c ? '<span class="typed-correct">'+c+"</span>" : '<span class="typed-wrong">'+c+"</span>"; }).join(""); };
  let done = false;
  function update(i) {
    const value = inputs[i].value;
    const pct = Math.floor(value.length / phrase.length * 100);
    heads[i].lastElementChild.textContent = pct + "%";
    fills[i].style.width = pct + "%";
    if (i === 0) renderPrompt();
    if (done) return;
    if (value !== phrase.slice(0, value.length)) {
      inputs[i].value = value.slice(0, -1);
      toast(players[i] + ": no errors — try again");
      update(i); return;
    }
    if (value === phrase) {
      done = true; inputs.forEach(input => input.disabled = true);
      sound("win"); heads[i].lastElementChild.textContent = "FINISH!";
      setTimeout(() => onWinner(i), 800);
    }
  }
  inputs.forEach((input,i) => input.addEventListener("input", () => update(i)));
  renderPrompt();
  return { element: root, start() { inputs[0].focus(); }, destroy() {} };
}