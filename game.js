// ===== CONFIG =====
const HITBOX_MARGIN = 80;

// ===== CANVAS =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===== IMAGES =====
const bg = new Image();
bg.src = "assets/bg.png";

const playerImg = new Image();
playerImg.src = "assets/player.png";

const enemyImg = new Image();
enemyImg.src = "assets/enemy.png";

const enemy2Img = new Image();
enemy2Img.src = "assets/enemy2.png";

const speedImg = new Image();
speedImg.src = "assets/speed.png"; // 🔥 SPEED POWER-UP PNG

// ===== SOUNDS =====
const gameOverSound = new Audio("assets/gameover.mp3");

const boostSound = new Audio("assets/boost.mp3");
boostSound.volume = 0.7;

// ===== PLAYER =====
let player = {
  x: canvas.width * 0.1,
  y: canvas.height / 2,
  w: 300,
  h: 300
  
};

// ===== GAME DATA =====
let enemies = [];
let score = 0;
let gameOver = false;

// SPEED POWER-UP
let speedPower = null;
let speedActive = false;
let speedTimer = 0;
let playerSpeed = 30; // normal speed

// difficulty
let enemySpeed = 4;
let spawnGap = 1500;
let lastSpawn = 0;

// ===== CONTROLS =====
// Desktop keyboard
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") player.y -= playerSpeed;
  if (e.key === "ArrowDown") player.y += playerSpeed;
});

// Mobile touch
canvas.addEventListener("touchmove", e => {
  let touchY = e.touches[0].clientY;
  player.y = touchY - player.h / 2;
});

// ===== DIFFICULTY =====
function increaseDifficulty() {
  if (score % 5 === 0) {
    enemySpeed += 0.5;
    spawnGap -= 100;

    if (enemySpeed > 12) enemySpeed = 12;
    if (spawnGap < 600) spawnGap = 600;
  }
}

// ===== SPAWN ENEMY =====
function spawnEnemy() {
  let isType2 = score >= 100 && Math.random() < 0.3;
  enemies.push({
    x: canvas.width + 65,
    y: Math.random() * (canvas.height - 150),
    w: isType2 ? 200 : 300,
    h: isType2 ? 200 : 300,
    type: isType2 ? 2 :1
  });
}

// ===== SPAWN SPEED POWER-UP =====
function spawnSpeedPower() {
  speedPower = {
    x: canvas.width + 100,
    y: Math.random() * (canvas.height - 100),
    w: 80,
    h: 80
  };
}

// ===== GAME LOOP =====
function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // Player limit
  player.y = Math.max(0, Math.min(player.y, canvas.height - player.h));

  // Player glow if speed active
  if (speedActive) {
    ctx.save();
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 25;
  }

  // Player draw
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  if (speedActive) ctx.restore();

  // Spawn timing
  let now = Date.now();
  if (now - lastSpawn > spawnGap) {
    spawnEnemy();
    lastSpawn = now;
  }

  // Enemies
  enemies.forEach((e, i) => {
    e.x -= enemySpeed;

    // Draw enemy type
    if (e.type === 2) {
      ctx.drawImage(enemy2Img, e.x, e.y, e.w, e.h);
    } else {
      ctx.drawImage(enemyImg, e.x, e.y, e.w, e.h);
    }

    // Collision (if speedActive → not out)
    if (
      !speedActive &&
      player.x + HITBOX_MARGIN < e.x + e.w - HITBOX_MARGIN &&
      player.x + player.w - HITBOX_MARGIN > e.x + HITBOX_MARGIN &&
      player.y + HITBOX_MARGIN < e.y + e.h - HITBOX_MARGIN &&
      player.y + player.h - HITBOX_MARGIN > e.y + HITBOX_MARGIN
    ) {
      endGame();
    }

    // Enemy passed → score + difficulty
    if (e.x + e.w < 0) {
      enemies.splice(i, 1);
      score++;
      increaseDifficulty();

      // Score 50 → spawn speed power
      if (score === 50) {
        spawnSpeedPower();
      }
      // Score 185 → spawn speed power
      if (score === 185) {
        spawnSpeedPower();
      }
      // Score 300 → spawn speed power
      if (score === 300) {
        spawnSpeedPower();
      }
    }
  });

  // SPEED POWER-UP DRAW
  if (speedPower && !speedActive) {
    speedPower.x -= 4;
    ctx.drawImage(speedImg, speedPower.x, speedPower.y, speedPower.w, speedPower.h);

    // PICK UP
    if (
      player.x < speedPower.x + speedPower.w &&
      player.x + player.w > speedPower.x &&
      player.y < speedPower.y + speedPower.h &&
      player.y + player.h > speedPower.y
    ) {
      speedActive = true;
      speedTimer = Date.now();
      playerSpeed = 60; // 🔥 2x speed
      speedPower = null;

      // SOUND
      boostSound.currentTime = 0;
      boostSound.play();
    }
  }

  // BOOST TEXT
  if (speedActive) {
    ctx.fillStyle = "cyan";
    ctx.font = "20px Arial";
    ctx.fillText("BOOST ACTIVE", canvas.width - 160, 40);
  }

  // BOOST TIMER 5 SEC
  if (speedActive && Date.now() - speedTimer > 10000) {
    speedActive = false;
    playerSpeed = 30; // normal
  }

  // Score text
  ctx.fillStyle = "white";
  ctx.font = "26px Arial";
  ctx.fillText("Score: " + score, 20, 40);

  requestAnimationFrame(gameLoop);
}

// ===== GAME OVER =====
function endGame() {
  gameOver = true;
  gameOverSound.play();

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "42px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2 - 140, canvas.height / 2);

  ctx.font = "26px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2 - 60, canvas.height / 2 + 40);

  ctx.font = "18px Arial";
  ctx.fillText("Click / Tap to Restart", canvas.width / 2 - 90, canvas.height / 2 + 80);

  canvas.addEventListener("click", () => location.reload(), { once: true });
  canvas.addEventListener("touchstart", () => location.reload(), { once: true });
}

// ===== START =====
bg.onload = () => {
  // User click / tap pe game start
  canvas.addEventListener("click", startGameOnce, { once: true });
  canvas.addEventListener("touchstart", startGameOnce, { once: true });
};

function startGameOnce() {
  gameLoop(); // game start
}