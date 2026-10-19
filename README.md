# Duel Dash

A local two-player mini-arcade built with HTML, CSS, JavaScript, and Canvas. Pick one or more minigames, choose a best-of-three or best-of-five match, and settle the rivalry on one keyboard.

## Play

Open `index.html` in a modern browser. If your browser restricts ES modules on local files, run a static server from the project directory (for example, `python -m http.server 8000`) and visit `http://localhost:8000`. No build step or dependencies are required. The project can also be hosted on GitHub Pages.

## Minigames

- **Reaction Duel** — wait for the red lane to turn green. Player One presses **A**; Player Two presses **←**. A false start loses the round.
- **Typing Race** — both players type the same short sentence in their own input. The first to complete it accurately wins; incorrect characters are rejected. Click an input to take your turn typing.
- **Tank Battle** — Player One moves with **WASD** and fires with **Space**. Player Two moves with **Arrow keys** and fires with **Enter**. Each tank can take three hits. If the 75-second limit expires, the tank with more health wins.

Every round starts with a 3-2-1-GO countdown. The first player to win two rounds in best-of-three or three rounds in best-of-five takes the match. Use **Rematch** to replay with the same names and settings. Sound effects are synthesized in the browser with Web Audio.

## Files

- `index.html` — menu, match, and winner screens
- `style.css` — responsive arcade interface
- `main.js` — selection, match flow, score, countdown, and sound
- `games/reaction.js` — reaction minigame
- `games/typing.js` — typing minigame
- `games/tank.js` — Canvas tank battle

## Browser support

Use a current browser with JavaScript modules, Canvas, and Web Audio support. Sound begins after the first user interaction, as required by browser autoplay policies.
