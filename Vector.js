export default class Vector2 {
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
    static fromScalar(n) {
        return new Vector2(n, n);
    }
    array() {
        return [this.x, this.y];
    }
    map(f) {
        return new Vector2(f(this.x), f(this.y));
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
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    norm() {
        const l = this.length();
        if (l == 0)
            return new Vector2(0, 0);
        return new Vector2(this.x / l, this.y / l);
    }
    sqrLength() {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }
    sqrDistance(that) {
        return that.sub(this).sqrLength();
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
//# sourceMappingURL=Vector.js.map