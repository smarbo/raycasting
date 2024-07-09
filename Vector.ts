export default class Vector2 {
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
  
  static fromScalar(n: number): Vector2 {
    return new Vector2(n,n);
  }

  array(): [number, number] {
    return [this.x, this.y];
  }

  map(f: (x: number) => number): Vector2 {
    return new Vector2(f(this.x), f(this.y));
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
