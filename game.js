const canvas = document.getElementById("game");
const ctx    = canvas.getContext("2d");

const box   = 26;
const count = 19;

let snake    = [{ x: 10, y: 10 }];
let fruit    = { x:  5, y:  5 };
let velocity = { x:  0, y:  0 };
let score    =  0;

const scoreDisplay = document.getElementById("score");

const eatSounds = [
  new Audio('eat1.mp3'),
  new Audio('eat2.mp3'),
  new Audio('eat3.mp3')
];

const goobImg = new Image();
goobImg.src = 'goob.png';

const fruitImgs = ['cherry.png', 'banana.png', 'apple.png'].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});
let currentFruitImg = fruitImgs[0];

let gameRunning = true;

function gameLoop() {
  if (!gameRunning) return;
  setTimeout(() => requestAnimationFrame(gameLoop), 160);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(currentFruitImg, fruit.x * box, fruit.y * box, box, box);

  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
  snake.unshift(head);

  if (head.x === fruit.x && head.y === fruit.y) {
    score++;
    scoreDisplay.textContent = "Score: " + score;
    fruit.x = Math.floor(Math.random() * count);
    fruit.y = Math.floor(Math.random() * count);
    currentFruitImg = fruitImgs[Math.floor(Math.random() * fruitImgs.length)];
    const sound = eatSounds[Math.floor(Math.random() * eatSounds.length)];
    sound.pause();
    sound.currentTime = 0;
    sound.play();
  } else {
    snake.pop();
  }

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= count || head.y >= count ||
    snake.slice(1).some(p => p.x === head.x && p.y === head.y)
  ) {
    gameRunning = false;
    setTimeout(() => {
      alert("Game Over! Your score: " + score);
      window.location.reload();
    }, 100);
    return;
  }

  snake.forEach(part => {
    ctx.drawImage(goobImg, part.x * box, part.y * box, box, box);
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "w"    && velocity.y === 0) velocity = { x: 0,  y: -1 };
  if (e.key === "s"  && velocity.y === 0) velocity = { x: 0,  y:  1 };
  if (e.key === "a"  && velocity.x === 0) velocity = { x: -1, y:  0 };
  if (e.key === "d" && velocity.x === 0) velocity = { x:  1, y:  0 };
});

gameLoop();
