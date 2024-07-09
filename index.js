var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Color from "./Color.js";
import { degToRad, decodeMap, canvasSize } from "./Utils.js";
import Vector2 from "./Vector.js";
const EPS = 1e-6;
const NEAR_CLIPPING_PLANE = 0.25;
const FAR_CLIPPING_PLANE = 10.0;
const FOV = degToRad(100);
// resolution of screen (how many rays are shot)
const SCREEN_WIDTH = 300;
const PLAYER_SPEED = 3;
// 0.25 is too slow, 1 is too fast
const PLAYER_ROT_SPEED = 0.4;
const PLAYER_SIZE = 0.5;
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
    let start = p1;
    while (start.sqrDistance(p1) < Math.pow(FAR_CLIPPING_PLANE, 2)) {
        const c = hittingCell(p1, p2);
        if (scene.getCell(c) !== undefined && scene.getCell(c) !== null)
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
            if (p2.sqrDistance(p3t) < p2.sqrDistance(p3)) {
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
function renderMinimap(ctx, player, position, size, scene) {
    ctx.save();
    const gridSize = scene.size();
    ctx.translate(...position.array());
    ctx.scale(...size.div(gridSize).array());
    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, ...gridSize.array());
    for (let y = 0; y < gridSize.y; y++) {
        for (let x = 0; x < gridSize.x; x++) {
            const cell = scene.getCell(new Vector2(x, y));
            if (cell instanceof Color) {
                ctx.fillStyle = cell.toStyle();
                ctx.fillRect(x, y, 1, 1);
            }
            else if (cell instanceof HTMLImageElement) {
                ctx.drawImage(cell, x, y, 1, 1);
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
    ctx.fillStyle = "magenta";
    ctx.fillRect(player.position.x - PLAYER_SIZE * 0.5, player.position.y - PLAYER_SIZE * 0.5, PLAYER_SIZE, PLAYER_SIZE);
    //circle(ctx, player.position, 0.2);
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
        const cell = scene.getCell(c);
        if (cell instanceof Color) {
            const v = p.sub(player.position);
            const d = Vector2.fromAngle(player.direction);
            let stripHeight = ctx.canvas.height / v.dot(d);
            ctx.fillStyle = cell.brightness(1 / v.dot(d)).toStyle();
            ctx.fillRect(x * stripWidth, (ctx.canvas.height - stripHeight) * 0.5, stripWidth, stripHeight > 1 ? stripHeight : 1);
        }
        else if (cell instanceof HTMLImageElement) {
            const v = p.sub(player.position);
            const d = Vector2.fromAngle(player.direction);
            let stripHeight = ctx.canvas.height / v.dot(d);
            const t = p.sub(c);
            let u;
            if ((Math.abs(t.x) < EPS || Math.abs(t.x - 1) < EPS) && t.y > 0)
                u = t.y;
            else
                u = t.x;
            ctx.drawImage(cell, u * cell.width, 0, 1, cell.height, x * stripWidth, (ctx.canvas.height - stripHeight) * 0.5, stripWidth, stripHeight);
            ctx.fillStyle = new Color(0, 0, 0, 1 - 1 / v.dot(d)).toStyle();
            ctx.fillRect(x * stripWidth, (ctx.canvas.height - stripHeight) * 0.5, stripWidth, stripHeight);
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
function canPlayerGoThere(scene, pos) {
    const corner = pos.sub(Vector2.fromScalar(PLAYER_SIZE * 0.5));
    for (let dx = 0; dx < 2; ++dx) {
        for (let dy = 0; dy < 2; ++dy) {
            if (scene.isWall(corner.add(new Vector2(dx, dy).scale(0.5)))) {
                return false;
            }
        }
    }
    return true;
}
function renderGame(ctx, player, scene) {
    const gridSize = scene.size();
    const cellSize = ctx.canvas.width * 0.03;
    const minimapPosition = Vector2.zero().add(canvasSize(ctx)
        .scale(0.02)
        .add(new Vector2(0, ctx.canvas.height - cellSize * gridSize.y * 1.2)));
    const minimapSize = scene.size().scale(cellSize);
    ctx.fillStyle = "#181818";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    renderScene(ctx, player, scene);
    renderMinimap(ctx, player, minimapPosition, minimapSize, scene);
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const game = document.querySelector("#game");
    if (game == null)
        throw new Error("No canvas with id `game`");
    const factor = 80;
    game.width = 16 * factor;
    game.height = 9 * factor;
    const ctx = game.getContext("2d");
    if (ctx === null)
        throw new Error("2D Context not supported.");
    let scene = yield decodeMap("W1tudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbF0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsXSxbbnVsbCxudWxsLHsidXJsIjoiYXNzZXRzL3dhbGwxLnBuZyJ9LHsidXJsIjoiYXNzZXRzL3dhbGwxLnBuZyJ9LHsidXJsIjoiYXNzZXRzL3dhbGwyLnBuZyJ9LHsidXJsIjoiYXNzZXRzL3dhbGwxLnBuZyJ9LHsidXJsIjoiYXNzZXRzL3dhbGwxLnBuZyJ9LG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0seyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0seyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0seyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn1dLFtudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDIucG5nIn0sbnVsbCxudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0sbnVsbCx7InVybCI6ImFzc2V0cy93YWxsMS5wbmcifSxudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn1dLFtudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0sbnVsbCxudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0sbnVsbCx7InVybCI6ImFzc2V0cy93YWxsMS5wbmcifSxudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDQucG5nIn1dLFtudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDIucG5nIn0sbnVsbCxudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0seyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0sbnVsbCxudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn1dLFtudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0sbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLHsidXJsIjoiYXNzZXRzL3dhbGwzLnBuZyJ9XSxbbnVsbCxudWxsLHsidXJsIjoiYXNzZXRzL3dhbGwxLnBuZyJ9LHsidXJsIjoiYXNzZXRzL3dhbGwxLnBuZyJ9LHsidXJsIjoiYXNzZXRzL3dhbGwzLnBuZyJ9LHsidXJsIjoiYXNzZXRzL3dhbGwzLnBuZyJ9LHsidXJsIjoiYXNzZXRzL3dhbGwxLnBuZyJ9LHsidXJsIjoiYXNzZXRzL3dhbGwxLnBuZyJ9LG51bGwsbnVsbCxudWxsLHsidXJsIjoiYXNzZXRzL3dhbGwxLnBuZyJ9XSxbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCx7InVybCI6ImFzc2V0cy93YWxsMS5wbmcifSxudWxsLG51bGwsbnVsbCx7InVybCI6ImFzc2V0cy93YWxsMi5wbmcifV0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwseyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0seyJ1cmwiOiJhc3NldHMvd2FsbDQucG5nIn0seyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn0seyJ1cmwiOiJhc3NldHMvd2FsbDIucG5nIn0seyJ1cmwiOiJhc3NldHMvd2FsbDEucG5nIn1dLFtudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbF0sW251bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsXV0=");
    /*
    let wall = await loadImageData("/assets/rock_wall.jpg").catch(() => Color.purple());
    let scene = new Scene([
      [null,null,null,null,null,null,null,null,null,],
      [null,null,wall,wall,wall,null,null,null,null,],
      [null,null,null,null,wall,null,null,null,null,],
      [null,wall,wall,wall,wall,null,wall,],
      [null,null,null,null,null,null,wal,wall,wall,],
      [null,null,null,null,null,null,null,wall,null,],
      [null,null,null,null,null,null,null,null,null,],
    ]);
    */
    const player = new Player(new Vector2(5.5, 5.5), Math.PI * 1.25);
    let movingForward = false;
    let movingBackward = false;
    let turningLeft = false;
    let turningRight = false;
    window.addEventListener("keydown", (e) => {
        switch (e.key.toLowerCase()) {
            case "arrowup":
            case "w":
                movingForward = true;
                break;
            case "arrowdown":
            case "s":
                movingBackward = true;
                break;
            case "arrowleft":
            case "a":
                turningLeft = true;
                break;
            case "arrowright":
            case "d":
                turningRight = true;
                break;
        }
    });
    window.addEventListener("keyup", (e) => {
        switch (e.key.toLowerCase()) {
            case "arrowup":
            case "w":
                movingForward = false;
                break;
            case "arrowdown":
            case "s":
                movingBackward = false;
                break;
            case "arrowleft":
            case "a":
                turningLeft = false;
                break;
            case "arrowright":
            case "d":
                turningRight = false;
                break;
        }
    });
    let prevTimestamp = 0;
    const frame = (timestamp) => {
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
        player.direction = player.direction + angularVelocity * deltaTime;
        const newPosition = player.position.add(velocity.scale(deltaTime));
        if (canPlayerGoThere(scene, newPosition)) {
            player.position = newPosition;
        }
        renderGame(ctx, player, scene);
        window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame((timestamp) => {
        prevTimestamp = timestamp;
        window.requestAnimationFrame(frame);
    });
    renderGame(ctx, player, scene);
}))();
//# sourceMappingURL=index.js.map