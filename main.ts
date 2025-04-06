const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const width = canvas.width;
const height = canvas.height;

const keys: Record<string, boolean> = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

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
