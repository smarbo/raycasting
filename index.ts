class Vector2 {
  constructor(
    public x: number,
    public y: number,
  ) { }

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static fromAngle(angle: number): Vector2 {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }

  array(): [number, number] {
    return [this.x, this.y];
  }

  dot(that: Vector2): number {
    return this.x * that.x + this.y * that.y;
  }

  mul(that: Vector2): Vector2 {
    return new Vector2(this.x * that.x, this.y * that.y);
  }

  div(that: Vector2): Vector2 {
    return new Vector2(this.x / that.x, this.y / that.y);
  }

  add(that: Vector2): Vector2 {
    return new Vector2(this.x + that.x, this.y + that.y);
  }

  sub(that: Vector2): Vector2 {
    return new Vector2(this.x - that.x, this.y - that.y);
  }

  scale(n: number): Vector2 {
    return new Vector2(this.x * n, this.y * n);
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  norm(): Vector2 {
    const l = this.length();

    if (l == 0) return new Vector2(0, 0);

    return new Vector2(this.x / l, this.y / l);
  }

  sqrLength(): number {
    return this.x ** 2 + this.y ** 2;
  }

  sqrDistance(that: Vector2): number {
    return that.sub(this).sqrLength();
  }

  distance(that: Vector2): number {
    return that.sub(this).length();
  }

  rot90(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  lerp(that: Vector2, t: number): Vector2 {
    return that.sub(this).scale(t).add(this);
  }
}

function canvasSize(ctx: CanvasRenderingContext2D): Vector2 {
  return new Vector2(ctx.canvas.width, ctx.canvas.height);
}

function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

function decodeMap(encoded: string): Scene {
  return JSON.parse(atob(encoded));
}

const EPS = 1e-6;
const NEAR_CLIPPING_PLANE = 0.25;
const FAR_CLIPPING_PLANE = 10.0;
const FOV = degToRad(100);
const SCREEN_WIDTH = 500;
const PLAYER_STEP_LEN = 0.5;
const PLAYER_SPEED = 1;
// 0.25 is too slow, 1 is too fast
const PLAYER_ROT_SPEED = 0.3;

function line(
  ctx: CanvasRenderingContext2D,
  p1: Vector2,
  p2: Vector2,
  color?: string,
  width?: number,
) {
  ctx.strokeStyle = color || "magenta";
  ctx.lineWidth = width || 0.1;
  ctx.beginPath();
  ctx.moveTo(...p1.array());
  ctx.lineTo(...p2.array());
  ctx.stroke();
  ctx.closePath();
}

function circle(
  ctx: CanvasRenderingContext2D,
  center: Vector2,
  r: number,
  color?: string,
) {
  ctx.fillStyle = color || "magenta";
  ctx.beginPath();
  ctx.arc(...center.array(), r, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function snap(x: number, dx: number): number {
  if (dx > 0) return Math.ceil(x + Math.sign(dx) * EPS);
  if (dx < 0) return Math.floor(x + Math.sign(dx) * EPS);
  return x;
}

function hittingCell(p1: Vector2, p2: Vector2): Vector2 {
  const d = p2.sub(p1);
  return new Vector2(
    Math.floor(p2.x + Math.sign(d.x) * EPS),
    Math.floor(p2.y + Math.sign(d.y) * EPS),
  );
}

type Scene = Array<Array<string | null>>;

function castRay(scene: Scene, p1: Vector2, p2: Vector2): Vector2 {
  let start = p1;
  while (start.sqrDistance(p1) < FAR_CLIPPING_PLANE ** 2) {
    const c = hittingCell(p1, p2);
    if (insideScene(scene, c) && scene[c.y][c.x] !== null) break;
    const p3 = rayStep(p1, p2);
    p1 = p2;
    p2 = p3;
  }

  return p2;
}

function rayStep(p1: Vector2, p2: Vector2): Vector2 {
  // y = mx + c
  // x = (y - c)/m
  //

  const d = p2.sub(p1);

  let p3 = p2;
  if (d.x != 0) {
    const k = d.y / d.x;
    const c = p1.y - k * p1.x;

    {
      const x3 = snap(p2.x, d.x);
      const y3 = x3 * k + c;

      p3 = new Vector2(x3, y3);
    }

    if (k !== 0) {
      const y3 = snap(p2.y, d.y);
      const x3 = (y3 - c) / k;

      const p3t = new Vector2(x3, y3);

      if (p2.sqrDistance(p3t) < p2.sqrDistance(p3)) {
        p3 = p3t;
      }
    }
  } else {
    const y3 = snap(p2.y, d.y);
    const x3 = p2.x;
    p3 = new Vector2(x3, y3);
  }

  return p3;
}

function sceneSize(scene: Scene): Vector2 {
  let y = scene.length;
  let x = Number.MIN_VALUE;

  for (let row of scene) {
    x = Math.max(x, row.length);
  }

  return new Vector2(x, y);
}

function insideScene(scene: Scene, p: Vector2): boolean {
  const size = sceneSize(scene);
  return 0 <= p.x && p.x < size.x && 0 <= p.y && p.y < size.y;
}

function renderMinimap(
  ctx: CanvasRenderingContext2D,
  player: Player,
  position: Vector2,
  size: Vector2,
  scene: Scene,
) {
  ctx.save();

  const gridSize = sceneSize(scene);

  ctx.translate(...position.array());
  ctx.scale(...size.div(gridSize).array());

  ctx.fillStyle = "#202020";
  ctx.fillRect(0, 0, ...gridSize.array());

  for (let y = 0; y < gridSize.y; y++) {
    for (let x = 0; x < gridSize.x; x++) {
      const color = scene[y][x];
      if (color !== null) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  for (let x = 0; x <= gridSize.x; x++) {
    line(ctx, new Vector2(x, 0), new Vector2(x, gridSize.y), "#303030", 0.1);
  }
  for (let y = 0; y <= gridSize.y; y++) {
    line(ctx, new Vector2(0, y), new Vector2(gridSize.x, y), "#303030", 0.1);
  }

  const [p1, p2] = player.fovRange();

  circle(ctx, player.position, 0.2);
  line(ctx, p1, p2);
  line(ctx, player.position, p1);
  line(ctx, player.position, p2);

  ctx.restore();
}

function renderScene(
  ctx: CanvasRenderingContext2D,
  player: Player,
  scene: Scene,
) {
  const stripWidth = Math.ceil(ctx.canvas.width / SCREEN_WIDTH);
  const [r1, r2] = player.fovRange();
  for (let x = 0; x < SCREEN_WIDTH; x++) {
    const p = castRay(scene, player.position, r1.lerp(r2, x / SCREEN_WIDTH));
    const c = hittingCell(player.position, p);
    if (insideScene(scene, c)) {
      const color = scene[c.y][c.x];
      if (color !== null) {
        const v = p.sub(player.position);
        const d = Vector2.fromAngle(player.direction);
        let stripHeight = ctx.canvas.height / v.dot(d);
        ctx.fillStyle = color;
        ctx.fillRect(
          x * stripWidth,
          (ctx.canvas.height - stripHeight) * 0.5,
          stripWidth,
          stripHeight > 1 ? stripHeight : 1,
        );
      }
    }
  }
}

class Player {
  constructor(
    public position: Vector2,
    public direction: number,
  ) { }

  fovRange(): [Vector2, Vector2] {
    const p = this.position.add(
      Vector2.fromAngle(this.direction).scale(NEAR_CLIPPING_PLANE),
    );
    const l = Math.tan(FOV * 0.5) * NEAR_CLIPPING_PLANE;

    const p1 = p.sub(p.sub(this.position).rot90().norm().scale(l));
    const p2 = p.add(p.sub(this.position).rot90().norm().scale(l));

    return [p1, p2];
  }
}

function renderGame(
  ctx: CanvasRenderingContext2D,
  player: Player,
  scene: Scene,
) {
  const gridSize = sceneSize(scene);
  const cellSize = ctx.canvas.width * 0.03;

  const minimapPosition = Vector2.zero().add(
    canvasSize(ctx)
      .scale(0.02)
      .add(new Vector2(0, ctx.canvas.height - cellSize * gridSize.y * 1.2)),
  );
  const minimapSize = sceneSize(scene).scale(cellSize);

  ctx.fillStyle = "#181818";
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  renderScene(ctx, player, scene);
  //renderMinimap(ctx, player, minimapPosition, minimapSize, scene);
}

(() => {
  console.log(`FOV: ${radToDeg(FOV)}`);

  let scene = decodeMap(
    "W1tudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbF0sW251bGwsInJlZCIsInJlZCIsInJlZCIsImdyZWVuIiwiYmx1ZSIsImdyZWVuIiwiYmx1ZSIsImdyZWVuIiwiYmx1ZSIsbnVsbCxudWxsXSxbbnVsbCwicmVkIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsImdyZWVuIixudWxsLCJncmVlbiIsbnVsbCxudWxsXSxbbnVsbCwicmVkIixudWxsLCJibHVlIiwiZ3JlZW4iLCJibHVlIixudWxsLCJibHVlIixudWxsLCJibHVlIixudWxsLG51bGxdLFtudWxsLCJncmVlbiIsbnVsbCxudWxsLG51bGwsImdyZWVuIiwiYmx1ZSIsImdyZWVuIixudWxsLCJncmVlbiIsbnVsbCxudWxsXSxbbnVsbCwiYmx1ZSIsbnVsbCwiYmx1ZSIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLCJibHVlIixudWxsLG51bGxdLFtudWxsLCJncmVlbiIsbnVsbCxudWxsLCJncmVlbiIsImJsdWUiLG51bGwsImJsdWUiLG51bGwsImdyZWVuIixudWxsLG51bGxdLFtudWxsLCJibHVlIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsImdyZWVuIixudWxsLCJibHVlIixudWxsLG51bGxdLFtudWxsLCJncmVlbiIsbnVsbCwiYmx1ZSIsImdyZWVuIiwiYmx1ZSIsbnVsbCwiYmx1ZSIsbnVsbCwicmVkIixudWxsLG51bGxdLFtudWxsLCJibHVlIixudWxsLG51bGwsbnVsbCwiZ3JlZW4iLG51bGwsImdyZWVuIixudWxsLG51bGwsbnVsbCxudWxsXSxbbnVsbCwiZ3JlZW4iLCJibHVlIiwiZ3JlZW4iLCJibHVlIiwiZ3JlZW4iLCJibHVlIiwiZ3JlZW4iLCJibHVlIiwicmVkIixudWxsLG51bGxdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbF1d",
  );

  /*
  let scene = [
    [null, null, "red", "purple", null, null, null, null, null, null],
    [null, null, null, "magenta", null, null, null, null, null, null],
    [null, "blue", "green", "yellow", null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
  ];
  */
  const game = document.querySelector("#game") as HTMLCanvasElement | null;

  if (game == null) throw new Error("No canvas with id `game`");

  const factor = 80;
  game.width = 16 * factor;
  game.height = 9 * factor;

  const ctx = game.getContext("2d") as CanvasRenderingContext2D;
  if (ctx === null) throw new Error("2D Context not supported.");

  const player = new Player(new Vector2(2.5, 2.5), Math.PI*0.3);

  let movingForward = false;
  let movingBackward = false;
  let turningLeft = false;
  let turningRight = false;

  window.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
      case "arrowup":
      case "w": movingForward =  true; break;
      case "arrowdown":
      case "s": movingBackward = true; break;
      case "arrowleft":
      case "a": turningLeft =    true; break;
      case "arrowright":
      case "d": turningRight =   true; break;
    }
  });

  window.addEventListener("keyup", (e) => {
    switch (e.key.toLowerCase()) {
      case "arrowup":
      case "w": movingForward =  false; break;
      case "arrowdown":
      case "s": movingBackward = false; break;
      case "arrowleft":
      case "a": turningLeft =    false; break;
      case "arrowright":
      case "d": turningRight =   false; break;
    }
  });

  let prevTimestamp = 0;
  const frame = (timestamp: number) => {
    const deltaTime = (timestamp - prevTimestamp) / 1000;
    prevTimestamp = timestamp;
    let velocity = Vector2.zero();
    let angularVelocity = 0.0;
    if (movingForward) {
      velocity = velocity.add(Vector2.fromAngle(player.direction).scale(PLAYER_SPEED));
    }
    if (movingBackward) {
      velocity = velocity.sub(Vector2.fromAngle(player.direction).scale(PLAYER_SPEED));
    }
    if (turningLeft) {
      angularVelocity -= Math.PI * PLAYER_ROT_SPEED;
    }
    if (turningRight) {
      angularVelocity += Math.PI * PLAYER_ROT_SPEED;
    }

    player.direction = player.direction + angularVelocity*deltaTime;
    player.position = player.position.add(velocity.scale(deltaTime));
    renderGame(ctx, player, scene);
    window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame((timestamp) => {
    prevTimestamp = timestamp;
    window.requestAnimationFrame(frame);
  });

  renderGame(ctx, player, scene);
})();
