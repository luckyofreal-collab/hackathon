import { mountReaction } from "./games/reaction.js";
import { mountTyping } from "./games/typing.js";
import { mountTank } from "./games/tank.js";

const $ = (s) => document.querySelector(s);
const home = $("#home-screen"), match = $("#match-screen"), winner = $("#winner-screen"), stage = $("#game-stage");
const games = {
  reaction: { title: "Reaction Duel", subtitle: "Stay sharp. Don't jump the gun.", mount: mountReaction },
  typing: { title: "Typing Race", subtitle: "Same words. Faster fingers.", mount: mountTyping },
  tank: { title: "Tank Battle", subtitle: "Three hits. Last tank standing.", mount: mountTank }
};
let players = ["Player One","Player Two"], selectedGames = ["reaction","typing","tank"], bestOf = 3;
let scores = [0,0], round = 1, roundGame, activeGame, countdownTimer, gameIndex = 0, toastTimer, audioContext;

function sound(kind) {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    const now = audioContext.currentTime, notes = kind === "win" ? [523,659,784,1046] : kind === "hit" ? [180] : [880];
    notes.forEach((freq,i) => {
      const osc=audioContext.createOscillator(), gain=audioContext.createGain();
      osc.type=kind==="hit"?"triangle":"sine";osc.frequency.setValueAtTime(freq,now+i*.11);
      gain.gain.setValueAtTime(.0001,now+i*.11);gain.gain.exponentialRampToValueAtTime(kind==="hit"?.08:.06,now+i*.11+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.11+.13);
      osc.connect(gain);gain.connect(audioContext.destination);osc.start(now+i*.11);osc.stop(now+i*.11+.15);
    });
  } catch {}
}
function toast(message) { const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1600); }
function show(screen) { [home,match,winner].forEach(s=>s.classList.add("hidden"));screen.classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"}); }
function updateScoreboard() {
  $("#round-number").textContent=round;$("#round-of").textContent="OF "+bestOf;
  $("#score-name-one").textContent=players[0];$("#score-name-two").textContent=players[1];
  $("#score-one").textContent=scores[0];$("#score-two").textContent=scores[1];
  const target=Math.ceil(bestOf/2);$("#score-pips").innerHTML=Array.from({length:target},(_,i)=>`<i class="${i<scores[0]?"on":""}"></i>`).join("")+"<span style='width:8px'></span>"+Array.from({length:target},(_,i)=>`<i class="${i<scores[1]?"on":""}" style="${i<scores[1]?"background:var(--purple)":""}"></i>`).join("");
}
function cleanupRound(){clearInterval(countdownTimer);if(activeGame){activeGame.destroy?.();activeGame=null;}stage.replaceChildren();}
function beginMatch() {
  const checked=[...document.querySelectorAll(".game-card input:checked")].map(i=>i.value);
  if (!checked.length){toast("Pick at least one minigame to start");return;}
  selectedGames=checked; players=[$("#player-one").value.trim()||"Player One",$("#player-two").value.trim()||"Player Two"];
  scores=[0,0];round=1;gameIndex=0;
  $("#score-name-one").textContent=players[0];$("#score-name-two").textContent=players[1];
  show(match);updateScoreboard();startRound();
}
function startRound() {
  cleanupRound();updateScoreboard();
  roundGame=selectedGames[gameIndex%selectedGames.length];
  const game=games[roundGame];
  $("#game-title").textContent=game.title;$("#game-subtitle").textContent=game.subtitle;$("#game-kicker").textContent="MINIGAME "+String(gameIndex+1).padStart(2,"0");
  const overlay=$("#countdown");overlay.classList.remove("hidden");
  let n=3;overlay.textContent=n;sound("start");
  countdownTimer=setInterval(()=>{
    n--;
    if(n>0){overlay.textContent=n;sound("start");}
    else if(n===0){overlay.textContent="GO!";sound("start");}
    else {clearInterval(countdownTimer);overlay.classList.add("hidden");activeGame=game.mount({players,onWinner:finishRound,toast,sound});stage.append(activeGame.element);activeGame.start?.();}
  },750);
}
function finishRound(winnerIndex) {
  if(match.classList.contains("hidden"))return;
  cleanupRound();scores[winnerIndex]++;round++;gameIndex++;sound("win");updateScoreboard();
  const target=Math.ceil(bestOf/2);
  if(scores[winnerIndex]>=target){showWinner(winnerIndex);return;}
  toast(players[winnerIndex]+" takes the round!");
  setTimeout(()=>{if(!match.classList.contains("hidden"))startRound();},1000);
}
function showWinner(i) {
  $("#winner-name").textContent=players[i].toUpperCase();$("#winner-copy").textContent=players[i]+" wins the match "+scores[0]+"–"+scores[1]+". Run it back?";
  $("#final-label-one").textContent=players[0].toUpperCase();$("#final-label-two").textContent=players[1].toUpperCase();
  $("#final-score-one").textContent=scores[0];$("#final-score-two").textContent=scores[1];show(winner);
}
function returnHome(){cleanupRound();show(home);}
$("#start-match").addEventListener("click",beginMatch);
$("#back-home").addEventListener("click",returnHome);$("#quit-match").addEventListener("click",returnHome);$("#winner-menu").addEventListener("click",returnHome);
$("#rematch").addEventListener("click",beginMatch);
document.querySelectorAll(".format-btn").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".format-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");bestOf=Number(btn.dataset.best);}));
document.querySelectorAll(".game-card input").forEach(input=>input.addEventListener("change",()=>{
  input.closest(".game-card").classList.toggle("selected",input.checked);
  const count=document.querySelectorAll(".game-card input:checked").length;$("#game-count").textContent=count;
}));
document.addEventListener("keydown", e=>{
  if(e.key==="Escape"&&!match.classList.contains("hidden"))returnHome();
});
