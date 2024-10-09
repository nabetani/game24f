
export class XY {
  private _x: number = 0
  private _y: number = 0
  get x(): number { return this._x; }
  get y(): number { return this._y; }
  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }
  static of(x: number, y: number): XY {
    return new XY(x, y)
  }
  add(v: XY) {
    return new XY(this.x + v.x, this.y + v.y)
  }
  sub(v: XY) {
    return new XY(this.x - v.x, this.y - v.y)
  }
  mul(e: number) {
    return new XY(this.x * e, this.y * e)
  }
  div(e: number) {
    return new XY(this.x / e, this.y / e)
  }
};

export class Area {
  private p: XY
  private s: XY
  constructor(topleft: XY, size: XY) {
    this.p = topleft
    this.s = size
  }
  static fromPS(pos: XY, size: XY): Area {
    return new Area(pos, size);
  }
  static fromXYWH(x: number, y: number, w: number, h: number): Area {
    return new Area(XY.of(x, y), XY.of(w, h));
  }
  get topleft(): Readonly<XY> { return this.p }
  get wh(): Readonly<XY> { return this.s }
  get size(): number { return this.s.x * this.s.y }
  includes(t: XY): boolean {
    const dx = t.x - this.p.x
    const dy = t.y - this.p.y
    return 0 <= dx && dx < this.s.x && 0 <= dy && dy < this.s.y
  }
}

