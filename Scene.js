import Vector2 from "./Vector.js";
export default class Scene {
    constructor(cells) {
        this.height = cells.length;
        this.width = Number.MIN_VALUE;
        for (let row of cells) {
            this.width = Math.max(this.width, row.length);
        }
        this.cells = [];
        for (let row of cells) {
            this.cells = this.cells.concat(row);
            for (let i = 0; i < this.width - row.length; ++i) {
                this.cells.push(null);
            }
        }
    }
    contains(p) {
        return 0 <= p.x && p.x < this.width && 0 <= p.y && p.y < this.height;
    }
    getCell(p) {
        const fp = p.map(Math.floor);
        if (!this.contains(fp))
            return undefined;
        return this.cells[fp.y * this.width + fp.x];
    }
    isWall(p) {
        const c = this.getCell(p);
        return c !== null && c !== undefined;
    }
    size() {
        return new Vector2(this.width, this.height);
    }
}
//# sourceMappingURL=Scene.js.map