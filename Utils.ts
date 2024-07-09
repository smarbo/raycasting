import Color from "./Color.js";
import Scene, { Cell } from "./Scene.js";
import Vector2 from "./Vector.js";

export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

export async function loadImageData(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  return new Promise((res, rej) => {
    image.onload = () => res(image);
    image.onerror = rej;
  });
}


export async function decodeMap(encoded: string): Promise<Scene> {
  let scene: (Color | EncodedColor | ImageURL | null)[][] = JSON.parse(atob(encoded));
  let result: Array<Array<Cell>> = [];

  for (let y = 0; y < scene.length; y++) {
    let row: Array<Color | HTMLImageElement | null> = [];
    for (let x = 0; x < scene[y].length; x++) {
      let cell = scene[y][x];
      if (cell && 'r' in cell && 'g' in cell && 'b' in cell && 'a' in cell) {
        row.push(Color.fromObject(cell as EncodedColor));
      } else if (cell && 'url' in cell) {
        let cellRes = await loadImageData((cell as ImageURL).url).catch(() => Color.purple());
        row.push(cellRes);
      } else {
        row.push(null);
      }
    }
    result.push(row);
  }
  return new Scene(result);
}

export function canvasSize(ctx: CanvasRenderingContext2D): Vector2 {
  return new Vector2(ctx.canvas.width, ctx.canvas.height);
}
