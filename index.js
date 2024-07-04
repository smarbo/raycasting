"use strict";
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static zero() {
        return new Vector2(0, 0);
    }
    static fromAngle(angle) {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }
    array() {
        return [this.x, this.y];
    }
    dot(that) {
        return this.x * that.x + this.y * that.y;
    }
    mul(that) {
        return new Vector2(this.x * that.x, this.y * that.y);
    }
    div(that) {
        return new Vector2(this.x / that.x, this.y / that.y);
    }
    add(that) {
        return new Vector2(this.x + that.x, this.y + that.y);
    }
    sub(that) {
        return new Vector2(this.x - that.x, this.y - that.y);
    }
    scale(n) {
        return new Vector2(this.x * n, this.y * n);
    }
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    norm() {
        const l = this.length();
        if (l == 0)
            return new Vector2(0, 0);
        return new Vector2(this.x / l, this.y / l);
    }
    distance(that) {
        return that.sub(this).length();
    }
    rot90() {
        return new Vector2(-this.y, this.x);
    }
    lerp(that, t) {
        return that.sub(this).scale(t).add(this);
    }
}
function canvasSize(ctx) {
    return new Vector2(ctx.canvas.width, ctx.canvas.height);
}
function degToRad(deg) {
    return deg * (Math.PI / 180);
}
function radToDeg(rad) {
    return rad * (180 / Math.PI);
}
function decodeMap(encoded) {
    return JSON.parse(atob(encoded));
}
const EPS = 1e-6;
const NEAR_CLIPPING_PLANE = 1.0;
const FAR_CLIPPING_PLANE = 10.0;
const FOV = degToRad(100);
const SCREEN_WIDTH = 2000;
const PLAYER_STEP_LEN = 0.5;
function line(ctx, p1, p2, color, width) {
    ctx.strokeStyle = color || "magenta";
    ctx.lineWidth = width || 0.1;
    ctx.beginPath();
    ctx.moveTo(...p1.array());
    ctx.lineTo(...p2.array());
    ctx.stroke();
    ctx.closePath();
}
function circle(ctx, center, r, color) {
    ctx.fillStyle = color || "magenta";
    ctx.beginPath();
    ctx.arc(...center.array(), r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}
function snap(x, dx) {
    if (dx > 0)
        return Math.ceil(x + Math.sign(dx) * EPS);
    if (dx < 0)
        return Math.floor(x + Math.sign(dx) * EPS);
    return x;
}
function hittingCell(p1, p2) {
    const d = p2.sub(p1);
    return new Vector2(Math.floor(p2.x + Math.sign(d.x) * EPS), Math.floor(p2.y + Math.sign(d.y) * EPS));
}
function castRay(scene, p1, p2) {
    for (;;) {
        const c = hittingCell(p1, p2);
        if (!insideScene(scene, c) || scene[c.y][c.x] !== null)
            break;
        const p3 = rayStep(p1, p2);
        p1 = p2;
        p2 = p3;
    }
    return p2;
}
function rayStep(p1, p2) {
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
            if (p2.distance(p3t) < p2.distance(p3)) {
                p3 = p3t;
            }
        }
    }
    else {
        const y3 = snap(p2.y, d.y);
        const x3 = p2.x;
        p3 = new Vector2(x3, y3);
    }
    return p3;
}
function sceneSize(scene) {
    let y = scene.length;
    let x = Number.MIN_VALUE;
    for (let row of scene) {
        x = Math.max(x, row.length);
    }
    return new Vector2(x, y);
}
function insideScene(scene, p) {
    const size = sceneSize(scene);
    return 0 <= p.x && p.x < size.x && 0 <= p.y && p.y < size.y;
}
function renderMinimap(ctx, player, position, size, scene) {
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
function renderScene(ctx, player, scene) {
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
                ctx.fillRect(x * stripWidth, (ctx.canvas.height - stripHeight) * 0.5, stripWidth, stripHeight > 1 ? stripHeight : 1);
            }
        }
    }
}
class Player {
    constructor(position, direction) {
        this.position = position;
        this.direction = direction;
    }
    fovRange() {
        const p = this.position.add(Vector2.fromAngle(this.direction).scale(NEAR_CLIPPING_PLANE));
        const l = Math.tan(FOV * 0.5) * NEAR_CLIPPING_PLANE;
        const p1 = p.sub(p.sub(this.position).rot90().norm().scale(l));
        const p2 = p.add(p.sub(this.position).rot90().norm().scale(l));
        return [p1, p2];
    }
}
function renderGame(ctx, player, scene) {
    const gridSize = sceneSize(scene);
    const cellSize = ctx.canvas.width * 0.03;
    const minimapPosition = Vector2.zero().add(canvasSize(ctx)
        .scale(0.02)
        .add(new Vector2(0, ctx.canvas.height - cellSize * gridSize.y * 1.2)));
    const minimapSize = sceneSize(scene).scale(cellSize);
    ctx.fillStyle = "#181818";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    renderScene(ctx, player, scene);
    renderMinimap(ctx, player, minimapPosition, minimapSize, scene);
}
(() => {
    console.log(`FOV: ${radToDeg(FOV)}`);
    let scene = decodeMap("W1sicmVkIiwiYmx1ZSIsImdyZWVuIiwiYmx1ZSIsImdyZWVuIiwiYmx1ZSIsImdyZWVuIixudWxsXSxbInJlZCIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbF0sWyJyZWQiLCJncmVlbiIsImJsdWUiLCJncmVlbiIsImJsdWUiLCJncmVlbiIsImJsdWUiLG51bGxdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGxdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGxdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGxdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGxdLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGxdXQ==");
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
    const game = document.querySelector("#game");
    if (game == null)
        throw new Error("No canvas with id `game`");
    const factor = 80;
    game.width = 16 * factor;
    game.height = 9 * factor;
    const ctx = game.getContext("2d");
    if (ctx === null)
        throw new Error("2D Context not supported.");
    const player = new Player(new Vector2(5, 5), Math.PI * 1.25);
    window.addEventListener("keydown", (e) => {
        switch (e.key.toLowerCase()) {
            case "w":
                player.position = player.position.add(Vector2.fromAngle(player.direction).scale(PLAYER_STEP_LEN));
                renderGame(ctx, player, scene);
                break;
            case "s":
                player.position = player.position.sub(Vector2.fromAngle(player.direction).scale(PLAYER_STEP_LEN));
                renderGame(ctx, player, scene);
                break;
            case "d":
                player.direction += Math.PI * 0.04;
                renderGame(ctx, player, scene);
                break;
            case "a":
                player.direction -= Math.PI * 0.04;
                renderGame(ctx, player, scene);
                break;
        }
    });
    renderGame(ctx, player, scene);
})();
//# sourceMappingURL=index.js.map