import { sprintf } from "sprintf-js";

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

export const numText = (n0: number, one: boolean = false): string => {
  if (n0 == 0) { return "0" }
  if (n0 < 0) {
    return `-${numText(-n0)}`
  }
  if (n0 <= 9999) {
    return `${Math.floor(n0)}`
  }
  const n = Math.floor(n0 * (1 + 2 ** -50))
  let baseExp = Math.floor(Math.log10(n))
  let base = 10 ** baseExp // 1 ≦ base < 10
  let frac = Math.floor(n * 10 ** 3 / base)
  if (10 ** 4 <= frac) {
    baseExp += 1
    base = 10 ** baseExp
    frac = Math.floor(n * 10 ** 3 / base)
  }
  const s0 = `${frac}`
  const d = (baseExp + 1) % 4
  const unames = ["", "万", "億", "兆", "京", "垓", "𥝱", "穣", "溝", "澗", "正", "載", "極",
    "恒河沙",
    "阿僧祇",
    "那由他",
    "不可思議",
    "無量大数"]
  const u = unames[(baseExp - baseExp % 4) / 4]
  if (u == undefined) {
    return "表示不能";
  }
  if (d == 0) {
    return s0 + u
  } else if (one) {
    return s0.substring(0, d) + u
  } else {
    return s0.substring(0, d) + "." + s0.substring(d, 4) + u
  }
}

export const qdigit = (x: number): number => {
  if (Math.abs(x) < 9999) {
    return Math.floor(x)
  }
  const k = Math.floor(Math.log10(Math.abs(x)))
  const b = 10 ** (k - 3)
  return b * Math.floor(x / b)
}

export const didigit = (x: number): number => {
  if (Math.abs(x) < 99) {
    return Math.floor(x)
  }
  const k = Math.floor(Math.log10(Math.abs(x)))
  const b = 10 ** (k - 1)
  return b * Math.floor(x / b)
}

export const ratioText = (x: number): string => {
  if (x < 10) { return sprintf("%.3f", x) }
  if (x < 100) { return sprintf("%.2f", x) }
  if (x < 1000) { return sprintf("%.1f", x) }
  if (x < 10000) { return sprintf("%.0f", x) }
  return numText(x)
}
