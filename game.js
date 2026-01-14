const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== IMAGES =====
const bg = new Image();
bg.src = "assets/bg.png";

const playerImg = new Image();
playerImg.src = "assets/player.png";

const enemyImg = new Image();
enemyImg.src = "assets/enemy.png";

// ===== SOUNDS =====
const bgMusic = new Audio("assets/bgmusic.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

const gameOverSound = new Audio("assets/gameover.mp3");

// ===== PLAYER =====
let player = {
  x: canvas.width / 2 - 30,
  y: canvas.height / 2,
  w: 60,
  h: 60
};

// ===== GAME DATA =====
let enemies = [];
let score = 0;
let gameOver = false;

// ===== TOUCH CONTROL (UP / DOWN) =====
canvas.addEventListener("touchmove", e => {
  let touchY = e.touches[0].clientY;
  player.y = touchY - player.h / 2;
});

// ===== ENEMY SPAWN =====
setInterval(() => {
  if (!gameOver) {
    enemies.push({
      x: canvas.width + 50,
      y: Math.random() * (canvas.height - 60),
      w: 50,
      h: 50,
      speed: 6
    });
  }
}, 1200);

// ===== GAME LOOP =====
function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // Player
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  // Enemies
  enemies.forEach((e, i) => {
    e.x -= e.speed;
    ctx.drawImage(enemyImg, e.x, e.y, e.w, e.h);

    // Collision
    if (
      player.x < e.x + e.w &&
      player.x + player.w > e.x &&
      player.y < e.y + e.h &&
      player.y + player.h > e.y
    ) {
      endGame();
    }

    if (e.x < -60) {
      enemies.splice(i, 1);
      score++;
    }
  });

  // Score
  ctx.fillStyle = "white";
  ctx.font = "26px Arial";
  ctx.fillText("Score: " + score, 20, 40);

  requestAnimationFrame(gameLoop);
}

// ===== GAME OVER =====
function endGame() {
  gameOver = true;
  bgMusic.pause();
  gameOverSound.play();

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);

  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, canvas.width / 2 - 60, canvas.height / 2 + 40);

  ctx.font = "18px Arial";
  ctx.fillText("Tap to Restart", canvas.width / 2 - 70, canvas.height / 2 + 80);

  canvas.addEventListener("touchstart", () => location.reload(), { once: true });
}

// ===== START GAME =====
bg.onload = () => {
  bgMusic.play();
  gameLoop();
};