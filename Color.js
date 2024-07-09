export default class RGBA {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static red() {
        return new RGBA(1, 0, 0, 1);
    }
    static green() {
        return new RGBA(0, 1, 0, 1);
    }
    static blue() {
        return new RGBA(0, 0, 1, 1);
    }
    static yellow() {
        return new RGBA(1, 1, 0, 1);
    }
    static purple() {
        return new RGBA(1, 0, 1, 1);
    }
    static cyan() {
        return new RGBA(0, 1, 1, 1);
    }
    static fromObject(object) {
        let { r, g, b, a } = object;
        return new RGBA(r, g, b, a);
    }
    brightness(factor) {
        return new RGBA(factor * this.r, factor * this.g, factor * this.b, this.a);
    }
    toStyle() {
        return (`rgba(` +
            `${Math.floor(this.r * 255)}, ` +
            `${Math.floor(this.g * 255)}, ` +
            `${Math.floor(this.b * 255)}, ` +
            `${this.a})`);
    }
}
//# sourceMappingURL=Color.js.map