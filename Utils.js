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
import Scene from "./Scene.js";
import Vector2 from "./Vector.js";
export function degToRad(deg) {
    return deg * (Math.PI / 180);
}
export function radToDeg(rad) {
    return rad * (180 / Math.PI);
}
export function loadImageData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = new Image();
        image.src = url;
        return new Promise((res, rej) => {
            image.onload = () => res(image);
            image.onerror = rej;
        });
    });
}
export function decodeMap(encoded) {
    return __awaiter(this, void 0, void 0, function* () {
        let scene = JSON.parse(atob(encoded));
        let result = [];
        for (let y = 0; y < scene.length; y++) {
            let row = [];
            for (let x = 0; x < scene[y].length; x++) {
                let cell = scene[y][x];
                if (cell && 'r' in cell && 'g' in cell && 'b' in cell && 'a' in cell) {
                    row.push(Color.fromObject(cell));
                }
                else if (cell && 'url' in cell) {
                    let cellRes = yield loadImageData(cell.url).catch(() => Color.purple());
                    row.push(cellRes);
                }
                else {
                    row.push(null);
                }
            }
            result.push(row);
        }
        return new Scene(result);
    });
}
export function canvasSize(ctx) {
    return new Vector2(ctx.canvas.width, ctx.canvas.height);
}
//# sourceMappingURL=Utils.js.map