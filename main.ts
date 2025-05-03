const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const width = canvas.width;
const height = canvas.height;
const COLS = 30;
const ROWS = 40;
const TILE_SIZE = 16;

const keys: Record<string, boolean> = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

const mushroomGrid: (Mushroom | null)[][] = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => null)
);

class Mushroom {
  hp = 4;

  constructor(public col: number, public row: number) {}

  get x() { return this.col * TILE_SIZE; }
  get y() { return this.row * TILE_SIZE; }

  hit(): boolean {
    this.hp--;
    return this.hp <= 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const colors = ["gray", "brown", "orange", "red"];
    ctx.fillStyle = colors[4 - this.hp] || "gray";
    ctx.fillRect(this.x + 2, this.y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  }
}

for (let i = 5; i < ROWS - 5; i++) {
  for (let j = 0; j < COLS; j++) {
    if (Math.random() < 0.05) {
      mushroomGrid[i][j] = new Mushroom(j, i);
    }
  }
}

class CentipedeSegment {
  dir: number = 1;

  constructor(public col: number, public row: number) {}

  update() {
    const nextCol = this.col + this.dir;
    const outOfBounds = nextCol < 0 || nextCol >= COLS;
    const hitsMushroom = !outOfBounds && mushroomGrid[this.row][nextCol];

    if (outOfBounds || hitsMushroom) {
      this.dir *= -1;
      this.row++;
    } else {
      this.col = nextCol;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(this.col * TILE_SIZE + TILE_SIZE / 2, this.row * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  get x() { return this.col * TILE_SIZE + TILE_SIZE / 2; }
  get y() { return this.row * TILE_SIZE + TILE_SIZE / 2; }
}

const centipede: CentipedeSegment[] = [];
for (let i = 0; i < 10; i++) {
  centipede.push(new CentipedeSegment(i, 0));
}

this.bullets.forEach(b => {

  const col = Math.floor(b.x / TILE_SIZE);
  const row = Math.floor(b.y / TILE_SIZE);
  const mush = mushroomGrid[row]?.[col];
  if (mush) {
    if (mush.hit()) {
      mushroomGrid[row][col] = null;
    }
    b.offscreen = true;
  }

  centipede.forEach((seg, i) => {
    const dx = b.x - seg.x;
    const dy = b.y - seg.y;
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      centipede.splice(i, 1);
      mushroomGrid[Math.floor(seg.y / TILE_SIZE)][Math.floor(seg.x / TILE_SIZE)] = new Mushroom(Math.floor(seg.x / TILE_SIZE), Math.floor(seg.y / TILE_SIZE));
      b.offscreen = true;
    }
  });
});

if (timestamp % 10 === 0) centipede.forEach(seg => seg.update());

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    mushroomGrid[row][col]?.draw(ctx);
  }
}

centipede.forEach(seg => seg.draw(ctx));

class Player {
  x = width / 2;
  y = height - 40;
  speed = 4;
  bullets: Bullet[] = [];

  update() {
    if (keys["ArrowLeft"]) this.x -= this.speed;
    if (keys["ArrowRight"]) this.x += this.speed;
    if (keys["ArrowUp"]) this.y -= this.speed;
    if (keys["ArrowDown"]) this.y += this.speed;

    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(height - 160, Math.min(height, this.y));

    this.bullets.forEach(b => b.update());
    this.bullets = this.bullets.filter(b => !b.offscreen);
  }

  shoot() {
    this.bullets.push(new Bullet(this.x, this.y));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x - 5, this.y - 5, 10, 10);
    this.bullets.forEach(b => b.draw(ctx));
  }
}

class Bullet {
  x: number;
  y: number;
  speed = 6;
  offscreen = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update() {
    this.y -= this.speed;
    if (this.y < 0) this.offscreen = true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x - 2, this.y - 6, 4, 8);
  }
}

const player = new Player();

let lastShot = 0;
function gameLoop(timestamp: number) {
  ctx.clearRect(0, 0, width, height);

  if (keys[" "] && timestamp - lastShot > 300) {
    player.shoot();
    lastShot = timestamp;
  }

  player.update();
  player.draw(ctx);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
