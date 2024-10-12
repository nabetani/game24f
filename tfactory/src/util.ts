
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
  static get zero(): XY {
    return new XY(0, 0)
  }
  static fromXY(o: { x: number, y: number }): XY {
    return new XY(o.x, o.y)
  }
  static fromWH(o: { w: number, h: number }): XY {
    return new XY(o.w, o.h)
  }
  static fromNum(n: number): XY {
    const B = (1 << 15);
    return XY.of(n % B, (n - (n % B)) / B)
  }
  toNum(): number {
    const B = (1 << 15);
    return this.x + this.y * B
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
  static fromXYWH(o: { x: number, y: number, w: number, h: number }): Area {
    return new Area(XY.of(o.x, o.y), XY.of(o.w, o.h));
  }
  get topleft(): Readonly<XY> { return this.p }
  get wh(): Readonly<XY> { return this.s }
  get size(): number { return this.s.x * this.s.y }
  includes(t: XY): boolean {
    const dx = t.x - this.p.x
    const dy = t.y - this.p.y
    return 0 <= dx && dx < this.s.x && 0 <= dy && dy < this.s.y
  }
  forEachXY(proc: (xy: XY) => any): void {
    for (let dy = 0; dy < this.s.y; ++dy) {
      for (let dx = 0; dx < this.s.x; ++dx) {
        proc(this.p.add(XY.of(dx, dy)))
      }
    }
  }
}

export const clamp = (v: number, low: number, high: number): number => {
  if (v < low) { return low }
  if (v < high) { return v }
  return high
}

export const numText = (n0: number): string => {
  const n = Math.round(n0)
  if (n == 0) { return "0" }
  if (n < 0) {
    return `-${numText(-n)}`
  }
  if (n <= 9999) {
    return `${Math.round(n)}`
  }
  let baseExp = Math.floor(Math.log10(n))
  let base = 10 ** baseExp // 1 ≦ base < 10
  let frac = Math.round(n * 10 ** 3 / base)
  if (10 ** 4 <= frac) {
    baseExp += 1
    base = 10 ** baseExp
    frac = Math.round(n * 10 ** 3 / base)
  }
  const s0 = `${frac}`
  const d = (baseExp + 1) % 4
  const unames = ["", "万", "億", "兆", "京", "垓", "抒", "壌", "溝", "澗", "正", "載", "極"]
  const u = unames[(baseExp - baseExp % 4) / 4]
  if (d == 0) {
    return s0 + u
  } else {
    return s0.substring(0, d) + "." + s0.substring(d, 4) + u
  }
}
