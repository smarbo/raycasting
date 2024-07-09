export default class Color {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number,
  ) { }

  static red(): Color {
    return new Color(1, 0, 0, 1);
  }

  static green(): Color {
    return new Color(0, 1, 0, 1);
  }

  static blue(): Color {
    return new Color(0, 0, 1, 1);
  }

  static yellow(): Color {
    return new Color(1, 1, 0, 1);
  }

  static purple(): Color {
    return new Color(1, 0, 1, 1);
  }

  static cyan(): Color {
    return new Color(0, 1, 1, 1);
  }

  static fromObject(object: {
    r: number;
    g: number;
    b: number;
    a: number;
  }): Color {
    let { r, g, b, a } = object;
    return new Color(r, g, b, a);
  }

  brightness(factor: number): Color {
    return new Color(factor * this.r, factor * this.g, factor * this.b, this.a);
  }

  toStyle(): string {
    return (
      `rgba(` +
      `${Math.floor(this.r * 255)}, ` +
      `${Math.floor(this.g * 255)}, ` +
      `${Math.floor(this.b * 255)}, ` +
      `${this.a})`
    );
  }
}
