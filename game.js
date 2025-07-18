const canvas = document.getElementById("game");
const ctx    = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const controlBtn   = document.getElementById("controlBtn");
const themeTune    = document.getElementById("themeTune");
const scoreList    = document.getElementById("scoreList");

const box   = 26;
const count = 19;
let score   = 0;
let velocity = { x: 0, y: 0 };
let snake    = [{ x: 10, y: 10 }];
let fruit    = { x: 5, y: 5 };

let gameState = 'start';    // 'start' | 'playing' | 'paused'
let timer     = null;
const MAX_SCORES = 5;

// — preload eat‑sounds —
const eatSounds = [
  new Audio("eat1.mp3"),
  new Audio("eat2.mp3"),
  new Audio("eat3.mp3")
];
eatSounds.forEach(s => s.load());

// — preload goob sprite —
const goobImg = new Image();
goobImg.src = "goob.png";

// — preload fruit sprites —
const fruitImgs = ["cherry.png", "banana.png", "apple.png"]
  .map(fn => {
    const img = new Image();
    img.src = fn;
    return img;
  });
let currentFruitImg = fruitImgs[0];

// Load and save high scores
function loadHighScores() {
  return JSON.parse(localStorage.getItem('hgscores') || '[]');
}

function saveHighScores(arr) {
  localStorage.setItem('hgscores', JSON.stringify(arr));
}

function updateScoreboard() {
  const highs = loadHighScores();
  scoreList.innerHTML = highs.map(s => `<li>${s}</li>`).join('');
}

// Record score on game over
function recordScore(sc) {
  const highs = loadHighScores();
  highs.push(sc);
  highs.sort((a, b) => b - a);
  if (highs.length > MAX_SCORES) highs.length = MAX_SCORES;
  saveHighScores(highs);
}

// Initialize scoreboard display
updateScoreboard();

// Control button handler
controlBtn.addEventListener('click', () => {
  if (gameState === 'start') {
    themeTune.play();            // play theme once at start
  }
  if (gameState === 'start' || gameState === 'paused') {
    gameState = 'playing';
    controlBtn.textContent = 'Pause';
    gameLoop();
  } else if (gameState === 'playing') {
    gameState = 'paused';
    controlBtn.textContent = 'Resume';
    clearTimeout(timer);
  }
});

function gameLoop() {
  if (gameState !== 'playing') return;

  // move head
  const head = {
    x: snake[0].x + velocity.x,
    y: snake[0].y + velocity.y
  };
  snake.unshift(head);

  // eat fruit?
  if (head.x === fruit.x && head.y === fruit.y) {
    score++;
    scoreDisplay.textContent = "Score: " + score;
    fruit.x = Math.floor(Math.random() * count);
    fruit.y = Math.floor(Math.random() * count);
    currentFruitImg =
      fruitImgs[Math.floor(Math.random() * fruitImgs.length)];
    const s = eatSounds[Math.floor(Math.random() * eatSounds.length)];
    s.pause(); s.currentTime = 0; s.play();
  } else {
    snake.pop();
  }

  // collision detection
  if (
    head.x < 0 || head.y < 0 ||
    head.x >= count || head.y >= count ||
    snake.slice(1).some(p => p.x === head.x && p.y === head.y)
  ) {
    clearTimeout(timer);
    recordScore(score);
    updateScoreboard();
    setTimeout(() => {
      alert("Game Over! Your score: " + score);
      window.location.reload();
    }, 100);
    return;
  }

  // draw board
  ctx.fillStyle = "#001100";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentFruitImg, fruit.x * box, fruit.y * box, box, box);
  snake.forEach(part => {
    ctx.drawImage(goobImg, part.x * box, part.y * box, box, box);
  });

  // speed up with score
  const baseSpeed = 150;
  const speed = Math.max(50, baseSpeed - score * 5);
  timer = setTimeout(gameLoop, speed);
}

// keyboard controls
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp"    && velocity.y === 0) velocity = { x: 0, y: -1 };
  if (e.key === "ArrowDown"  && velocity.y === 0) velocity = { x: 0, y:  1 };
  if (e.key === "ArrowLeft"  && velocity.x === 0) velocity = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && velocity.x === 0) velocity = { x:  1, y: 0 };
});
