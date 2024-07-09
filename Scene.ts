import RGBA from "./Color.js";
import Vector2 from "./Vector.js";

export type Cell = RGBA | HTMLImageElement | null;

export default class Scene {
  cells: Array<Cell>;
  width: number;
  height: number;
  constructor(cells: Array<Array<Cell>>) { 
    this.height = cells.length;
    this.width = Number.MIN_VALUE;
    for (let row of cells) {
      this.width = Math.max(this.width, row.length)
    }
    this.cells = [];
    for (let row of cells) {
      this.cells = this.cells.concat(row);
      for (let i = 0; i < this.width - row.length; ++i) {
        this.cells.push(null);
      }
    }
    
  }

  contains(p: Vector2): boolean {
    return 0 <= p.x && p.x < this.width && 0 <= p.y && p.y < this.height;
  }

  getCell(p: Vector2): Cell | undefined {
    const fp = p.map(Math.floor);
    if (!this.contains(fp)) return undefined;
    return this.cells[fp.y * this.width + fp.x];
  }

  isWall(p: Vector2): boolean {
    const c = this.getCell(p);
    return c !== null && c !== undefined;
  }

  size(): Vector2 {
    return new Vector2(this.width, this.height);
  }

}
