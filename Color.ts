export default class RGBA {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number,
  ) { }

  static red(): RGBA {
    return new RGBA(1, 0, 0, 1);
  }

  static green(): RGBA {
    return new RGBA(0, 1, 0, 1);
  }

  static blue(): RGBA {
    return new RGBA(0, 0, 1, 1);
  }

  static yellow(): RGBA {
    return new RGBA(1, 1, 0, 1);
  }

  static purple(): RGBA {
    return new RGBA(1, 0, 1, 1);
  }

  static cyan(): RGBA {
    return new RGBA(0, 1, 1, 1);
  }

  static fromObject(object: {
    r: number;
    g: number;
    b: number;
    a: number;
  }): RGBA {
    let { r, g, b, a } = object;
    return new RGBA(r, g, b, a);
  }

  brightness(factor: number): RGBA {
    return new RGBA(factor * this.r, factor * this.g, factor * this.b, this.a);
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
