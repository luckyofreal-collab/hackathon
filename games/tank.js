export function mountTank({ players, onWinner, toast, sound }) {
  const root = document.createElement("div"); root.className = "tank-wrap";
  root.innerHTML = `<div class="tank-hud"><span><strong></strong> <span class="hp1">● ● ●</span></span><span><strong class="p2"></strong> <span class="hp2">● ● ●</span></span></div><canvas id="tank-canvas" width="520" height="300" aria-label="Tank battle arena"></canvas><div class="tank-hint">P1: WASD + SPACE &nbsp;·&nbsp; P2: ARROWS + ENTER</div>`;
  root.querySelector(".tank-hud strong").textContent = players[0];
  root.querySelector(".p2").textContent = players[1];
  const canvas = root.querySelector("canvas"), ctx = canvas.getContext("2d");
  const walls = [{x:125,y:65,w:42,h:35},{x:350,y:65,w:42,h:35},{x:125,y:200,w:42,h:35},{x:350,y:200,w:42,h:35},{x:240,y:125,w:40,h:50}];
  const tanks = [{x:48,y:150,a:0,color:"#c9f36a",hp:3,cool:0},{x:472,y:150,a:Math.PI,color:"#a58bff",hp:3,cool:0}];
  const bullets = []; const keys = new Set(); let raf, last = performance.now(), running = true, elapsed = 0;
  function collides(x,y,r=10) { return x<r||x>520-r||y<r||y>300-r||walls.some(w=>x+r>w.x&&x-r<w.x+w.w&&y+r>w.y&&y-r<w.y+w.h); }
  function keydown(e) { const k=e.key.toLowerCase(); if(["arrowup","arrowdown","arrowleft","arrowright"," ","enter"].includes(k)) e.preventDefault(); keys.add(k); }
  function keyup(e) { keys.delete(e.key.toLowerCase()); }
  window.addEventListener("keydown",keydown); window.addEventListener("keyup",keyup);
  function fire(t) { if(t.cool>0)return; bullets.push({x:t.x+Math.cos(t.a)*15,y:t.y+Math.sin(t.a)*15,vx:Math.cos(t.a)*250,vy:Math.sin(t.a)*250,owner:t});t.cool=.45;sound("hit"); }
  function update(dt) {
    elapsed+=dt;
    tanks.forEach((t,i)=>{ t.cool=Math.max(0,t.cool-dt); const left=i?"arrowleft":"a",right=i?"arrowright":"d",up=i?"arrowup":"w",down=i?"arrowdown":"s",shoot=i?"enter":" ";
      if(keys.has(left))t.a-=2.8*dt;if(keys.has(right))t.a+=2.8*dt;
      let move=(keys.has(up)?1:0)-(keys.has(down)?1:0);
      if(move){const nx=t.x+Math.cos(t.a)*move*110*dt,ny=t.y+Math.sin(t.a)*move*110*dt;if(!collides(nx,t.y))t.x=nx;if(!collides(t.x,ny))t.y=ny;}
      if(keys.has(shoot))fire(t);
    });
    for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(collides(b.x,b.y,3)){bullets.splice(i,1);continue;}
      const target=tanks.find(t=>t!==b.owner&&Math.hypot(t.x-b.x,t.y-b.y)<14);
      if(target){target.hp--;bullets.splice(i,1);sound("hit");root.classList.remove("shake");void root.offsetWidth;root.classList.add("shake");if(target.hp<=0){finish(b.owner===tanks[0]?0:1);return;}}
    }
    root.querySelector(".hp1").textContent="● ".repeat(tanks[0].hp).trim()||"—";
    root.querySelector(".hp2").textContent="● ".repeat(tanks[1].hp).trim()||"—";
    if(elapsed>75){finish(tanks[0].hp===tanks[1].hp?Math.floor(Math.random()*2):tanks[0].hp>tanks[1].hp?0:1);}
  }
  function finish(i){if(!running)return;running=false;toast(players[i]+" wins Tank Battle!");sound("win");setTimeout(()=>onWinner(i),1000);}
  function draw() {
    ctx.fillStyle="#111522";ctx.fillRect(0,0,520,300);
    ctx.strokeStyle="#ffffff08";ctx.lineWidth=1;for(let x=0;x<520;x+=26){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,300);ctx.stroke()}for(let y=0;y<300;y+=26){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(520,y);ctx.stroke()}
    walls.forEach(w=>{ctx.fillStyle="#35384b";ctx.fillRect(w.x,w.y,w.w,w.h);ctx.strokeStyle="#55596c";ctx.strokeRect(w.x+.5,w.y+.5,w.w-1,w.h-1)});
    tanks.forEach(t=>{ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.a);ctx.fillStyle=t.color;ctx.fillRect(-10,-8,20,16);ctx.fillRect(2,-3,14,6);ctx.fillStyle="#171925";ctx.fillRect(-8,-10,4,20);ctx.fillRect(4,-10,4,20);ctx.restore()});
    bullets.forEach(b=>{ctx.fillStyle=b.owner.color;ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill()});
    ctx.fillStyle="#a3a5b8";ctx.font="10px monospace";ctx.fillText("75s limit",8,16);
  }
  function frame(now){if(!running)return;const dt=Math.min((now-last)/1000,.04);last=now;update(dt);draw();if(running)raf=requestAnimationFrame(frame);}
  draw();raf=requestAnimationFrame(frame);
  return {element:root,destroy(){running=false;cancelAnimationFrame(raf);window.removeEventListener("keydown",keydown);window.removeEventListener("keyup",keyup);}};
}