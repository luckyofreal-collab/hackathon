export function mountReaction({ players, onWinner, toast, sound }) {
  const root = document.createElement("div");
  root.className = "reaction-board";
  root.innerHTML = `<div class="reaction-lane" data-player="0"><strong></strong><span>PRESS</span><b class="big-key">A</b></div><div class="reaction-lane" data-player="1"><strong></strong><span>PRESS</span><b class="big-key">←</b></div><div class="stage-message">WAIT FOR GREEN — FALSE STARTS LOSE THE ROUND</div>`;
  const lanes = [...root.querySelectorAll(".reaction-lane")];
  lanes.forEach((lane, i) => lane.querySelector("strong").textContent = players[i]);
  let phase = "waiting", timer, settled = false;
  const keys = { a: 0, arrowleft: 1 };
  function press(e) {
    const player = keys[e.key.toLowerCase()];
    if (player === undefined || phase === "done") return;
    e.preventDefault();
    if (settled) return;
    if (phase !== "green") {
      settled = true; phase = "done"; clearTimeout(timer);
      lanes[player].classList.add("done");
      root.querySelector(".stage-message").textContent = "FALSE START — " + players[player] + " loses the round";
      toast(players[player] + " jumped the gun!");
      setTimeout(() => onWinner(1 - player), 1100);
      return;
    }
    settled = true; phase = "done";
    lanes[player].classList.add("done");
    root.querySelector(".stage-message").textContent = players[player] + " strikes first!";
    sound("hit");
    setTimeout(() => onWinner(player), 850);
  }
  window.addEventListener("keydown", press);
  timer = setTimeout(() => {
    if (phase !== "waiting") return;
    phase = "green"; lanes.forEach(l => l.classList.add("go"));
    root.querySelectorAll(".reaction-lane span").forEach(x => x.textContent = "NOW!");
    root.querySelector(".stage-message").textContent = "GO! HIT YOUR KEY";
    sound("start");
  }, 1500 + Math.random() * 2500);
  return { element: root, destroy() { clearTimeout(timer); window.removeEventListener("keydown", press); } };
}