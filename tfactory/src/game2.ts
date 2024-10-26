
import * as U from './util'

export type Quality = {
  level: number,
  improve: number,
}

export type Area = {
  x: number,
  y: number,
  w: number,
  h: number,
}

const hasIntersection = (a: Area, b: Area): boolean => {
  const i = (a0: number, al: number, b0: number, bl: number): boolean => {
    const a1 = a0 + al - 1
    const b1 = b0 + bl - 1
    return !(b1 < a0 || a1 < b0)

  }
  return i(a.x, a.w, b.x, b.w) && i(a.y, a.h, b.y, b.h)
};

export const FieldObjKind = {
  none: "none",
  house: "house",
  factory: "factory",
  pLabo: "pLabo",
  bLabo: "bLabo",
  magic: "magic",
} as const

export type FieldObjKindType = typeof FieldObjKind[keyof (typeof FieldObjKind)]

export type SizeType = 1 | 2 | 3;

export type Cell = {
  kind: FieldObjKindType,
  q: Quality,
  area: Area,
  construction: number,
  constructionTotal: number,
}

export type WhatToBuild = typeof FieldObjKind.factory | typeof FieldObjKind.pLabo | typeof FieldObjKind.bLabo | typeof FieldObjKind.magic

export type Powers = {
  money: number,
  pDev: number,
  bDev: number,
}

const powersZero = () => ({
  money: 0,
  pDev: 0,
  bDev: 0,
})

export
  const
  powersAdd = (a: Powers, b: Powers): Powers => {
    return {
      money: a.money + b.money,
      pDev: a.pDev + b.pDev,
      bDev: a.bDev + b.bDev,
    }
  }

export type BuildParam = {
  level: number,
  size?: SizeType,
  toBiuld?: WhatToBuild,
}

export namespace CellKind {
  export interface I {
    get kind(): FieldObjKindType
    get canImprove(): boolean
    get maxLevel(): number | null
    get destroyCostRatio(): number | null
    buildableLevel(p: Powers): number
    buildCost(level: number, size: SizeType): number
    improveCost(q: Quality, size: SizeType): number | null
    power(q: Quality, areaSize: number): number | undefined
    neibourEffect(w: World, c: Cell): number

  }
  class None implements I {
    get kind(): FieldObjKindType { return FieldObjKind.none }
    get maxLevel() { return null }
    get canImprove(): boolean { return false }
    buildableLevel(_: Powers): number { return 0 }
    buildCost(_1: number, _2: SizeType): number { return 0 }
    improveCost(_q: Quality, _size: SizeType): null { return null }
    power(_q: Quality, _areaSize: number): undefined { return undefined }
    get destroyCostRatio(): null { return null }
    neibourEffect(_w: World, _c: Cell): number { return 1 }
  }

  type IncomeParamType = {
    levBase: number,
    start: number,
  }

  type IncomeBaseParamType = { level: number, improve?: number }

  abstract class Building implements I {
    abstract get maxLevel(): number
    abstract get kind(): FieldObjKindType
    get canImprove(): boolean { return true }
    abstract buildableLevel(_: Powers): number
    abstract buildCost(level: number, size: SizeType): number;
    abstract incomeBase(_: IncomeBaseParamType): number
    power(q: Quality, areaSize: number): number {
      return this.incomeBase(q) * areaSize
    }
    abstract improveCost(q: Quality, size: SizeType): number
    abstract get destroyCostRatio(): number | null
    abstract neibourEffect(w: World, c: Cell): number
  }

  abstract class StdBuilding extends Building {
    abstract get kind(): FieldObjKindType
    get maxLevel(): number { return 25 }
    abstract buildlevelSrc(p: Powers): number
    abstract get buildCostBase(): number
    get destroyCostRatio(): number { return 0.1 }
    buildCost(level: number, size: SizeType): number {
      // Lv1 1e3 → Lv25:1e50
      // 2 + 1..25 + 23
      const relLevel = (level - 1) / (this.maxLevel - 1)
      const p = 2 + level + relLevel ** 1.5 * 23
      const c = this.buildCostBase * 10 ** p * size ** 2
      return U.didigit(c)
    }
    improveCost(q: Quality, size: SizeType): number {
      const b = this.buildCost(q.level, size)
      return b / 10
    }
    buildableLevel(p: Powers): number {
      return U.clamp(
        Math.floor(Math.log10(this.buildlevelSrc(p))),
        0, this.maxLevel)
    }
    abstract get incomeParam(): IncomeParamType
    abstract incomeBase(i: IncomeBaseParamType): number
    abstract isPowerNeibourType(k: FieldObjKindType): boolean
    neibourEffect(w: World, c: Cell): number {
      let e = 1
      let m: Quality[] = []
      eachNeibours(w, c.area, (b, tLen) => {
        const dl = b.q.level - c.q.level
        if (this.isPowerNeibourType(b.kind) && 0 <= dl) {
          e += 0.5 * tLen * (dl + 1)
        }
        if (b.kind == FieldObjKind.magic) {
          m.push(b.q)
        }
      })
      return e * ((): number => {
        if (m.length == 0) { return 1 }
        if (m.length == 1) { return 100 ** m[0].level }
        return 1e-3
      })()
    }
  }

  class Factory extends StdBuilding {
    get buildCostBase(): number { return 1 }
    get incomeParam(): IncomeParamType {
      return { levBase: 6, start: 100 }
    }
    buildlevelSrc(p: Powers): number {
      return p.pDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.factory
    }
    isPowerNeibourType(k: FieldObjKindType): boolean {
      return k === FieldObjKind.pLabo
    }
    incomeBase(i: IncomeBaseParamType): number {
      // Lv1:1e2 → Lv25:1e40
      // 1 + 1...25 + 0...14
      const rel = (i.level - 1) / (this.maxLevel - 1)
      const p = 1 + i.level + rel ** 1.5 * 14
      return 10 ** p * (1 + (i.improve ?? 0) ** 0.8)
    }
  }

  class PLabo extends StdBuilding {
    get buildCostBase(): number { return 3 }
    get incomeParam(): IncomeParamType {
      return { levBase: 50, start: 300 }
    }
    buildlevelSrc(p: Powers): number {
      return p.bDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.pLabo
    }
    isPowerNeibourType(k: FieldObjKindType): boolean {
      return k === FieldObjKind.bLabo
    }
    incomeBase(i: IncomeBaseParamType): number {
      // Lv1:1e2 → Lv25:1e20
      // 1 + 1...12.5 + 0...7
      const rel = (i.level - 1) / (this.maxLevel - 1)
      const p = 1 + i.level + rel ** 1.5 * 7
      return 10 ** p * (1 + (i.improve ?? 0) ** 0.8)
    }
  }

  class BLabo extends StdBuilding {
    get buildCostBase(): number { return 9 }
    get incomeParam(): IncomeParamType {
      return { levBase: 100, start: 1000 }
    }
    buildlevelSrc(p: Powers): number {
      return p.bDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.bLabo
    }
    isPowerNeibourType(_k: FieldObjKindType): boolean { return false }
    incomeBase(i: IncomeBaseParamType): number {
      // Lv1:1e2 → Lv25:1e20
      // 1 + 1...12.5 + 0...7
      const rel = (i.level - 1) / (this.maxLevel - 1)
      const p = 1 + i.level + rel ** 1.5 * 7
      return 10 ** p * (1 + (i.improve ?? 0) ** 0.8)
    }
  }

  class House extends Building {
    buildCost(_1: number, _2: SizeType): number { return 0 }
    get kind(): FieldObjKindType {
      return FieldObjKind.house
    }
    improveCost(_q: Quality, _size: SizeType): number {
      return this.incomeBase({ level: 1, improve: 0 })
    }
    get maxLevel(): number { return 1 }
    get destroyCostRatio(): null { return null }
    incomeBase(i: IncomeBaseParamType): number {
      const imp = (1.0 + (i.improve ?? 0) ** 0.8 * 0.1)
      const start = 200
      const levBase = 1
      return start * levBase ** (i.level - 1) * imp
    }
    buildableLevel(_: Powers): number { return 0 }
    neibourEffect(w: World, c: Cell): number {
      let e = 1
      eachNeibours(w, c.area, (b, tLen) => {
        const dl = b.q.level - c.q.level
        if (b.kind == FieldObjKind.pLabo && 0 <= dl) {
          e += 0.5 * tLen * (dl + 1)
        }
        return
      })
      return e
    }

  }
  class Magic extends Building {
    buildCost(level: number, size: SizeType): number {
      const c = 10 ** 12 * 100 ** ((level - 1) ** 2) * size
      return U.didigit(c)
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.magic
    }
    get destroyCostRatio(): number { return 1 }
    get maxLevel(): number { return 5 }
    buildableLevel(p: Powers): number {
      const m = buildLevel(Math.min(p.bDev, p.pDev))
      return U.clamp(Math.floor((m - 8) / 2), 0, this.maxLevel)
    }
    improveCost(q: Quality, size: SizeType): number {
      const b = this.buildCost(q.level, size)
      return b / 10
    }
    incomeBase(_: IncomeBaseParamType): number {
      return 0
    }
    neibourEffect(w: World, c: Cell): number {
      // TODO: implement me
      return 1
    }
  }

  export const none = new None();
  export const house = new House();
  export const factory = new Factory();
  export const pLabo = new PLabo();
  export const bLabo = new BLabo();
  export const magic = new Magic();
  export const o = {
    none: none,
    house: house,
    factory: factory,
    pLabo: pLabo,
    bLabo: bLabo,
    magic: magic,
  } as { [key in FieldObjKindType]: I }
}

export type World = {
  size: { w: number, h: number },
  buildings: Cell[],
  duration: number,
  total: number,
  powers: Powers,
}

const touchingLen = (a: Area, b: Area): number => {
  type n4 = [number, number, number, number]
  const x: n4 = [a.x, a.w, b.x, b.w]
  const y: n4 = [a.y, a.h, b.y, b.h]
  const touching = ([x0, w0, x1, w1]: n4): boolean => {
    return x0 + w0 == x1 || x1 + w1 == x0

  }
  const overwrap = ([x0, w0, x1, w1]: n4): number => {
    const r = Math.min(x0 + w0, x1 + w1)
    const l = Math.max(x0, x1)
    return Math.max(r - l, 0)
  }
  if (touching(x)) return overwrap(y)
  if (touching(y)) return overwrap(x)
  return 0
}

const eachNeibours = (w: World, a: Area, proc: (b: Cell, t: number) => void) => {
  w.buildings.forEach(b => {
    if (b.construction <= 0) {
      const t = touchingLen(b.area, a)
      if (0 < t) {
        proc(b, t)
      }
    }
  })
}

const newHouse = (x: number, y: number, q: Quality): Cell => {
  return {
    kind: FieldObjKind.house,
    q: q,
    area: { x: x, y: y, w: 1, h: 1 },
    construction: 0,
    constructionTotal: 1,
  }
}

export const emptyWorld = (): World => {
  return {
    size: { w: 5, h: 10 },
    buildings: [
      newHouse(2, 4, { improve: 0, level: 1 }),
    ],
    duration: 0,
    total: 0,
    powers: { money: 1e5, pDev: 100, bDev: 100 } // TODO: fix
    // powers: { money: 1e30, pDev: 9e14, bDev: 9e14 } // TODO: fix
  }
}

export const incomeB = (w: World, c: Cell): Powers => {
  const t = ((): keyof Powers | null => {
    switch (c.kind) {
      case FieldObjKind.bLabo: return "bDev"
      case FieldObjKind.pLabo: return "pDev"
      case FieldObjKind.factory: return "money"
      case FieldObjKind.house: return "money"
      default:
        return null
    }
  })();
  if (t == null) {
    return powersZero()
  } else {
    const k = CellKind.o[c.kind]
    const r = powersZero()
    r[t] = Math.floor((k.power(c.q, c.area.h * c.area.w) ?? 0) * k.neibourEffect(w, c))
    return r
  }
}

export const incomeW = (w: World): Powers => {
  return w.buildings.reduce(
    (acc, b): Powers => {
      if (0 < b.construction) { return acc }
      return powersAdd(acc, incomeB(w, b))
    }, powersZero())
}

const progressB = (c: Cell): void => {
  if (0 < c.construction) --c.construction
}

export const progress = (o: World): void => {
  o.buildings.forEach(b => progressB(b))
  const i = incomeW(o)
  ++o.duration
  o.total += i.money ?? 0
  o.powers = powersAdd(o.powers, i)
}

const newEmpty = (x: number, y: number): Cell => {
  return {
    kind: FieldObjKind.none,
    area: { x: x, y: y, w: 1, h: 1 },
    q: { level: 0, improve: 0 },
    construction: 0,
    constructionTotal: 0,
  }
}

export const cells = (w: World): Cell[] => {
  const s = new Set<number>()
  const r: Cell[] = [...w.buildings]
  w.buildings.forEach(b => {
    U.Area.fromXYWH(b.area).forEachXY(xy => {
      s.add(xy.toNum())
    })
  })
  U.Area.fromXYWH({ x: 0, y: 0, ...w.size }).forEachXY(xy => {
    if (!s.has(xy.toNum())) {
      r.push(newEmpty(xy.x, xy.y))
    }
  })
  return r
}

export type BuildState = {
  cost: number,
  duration: number,
  power: number,
  canBuild: boolean,
  canBuildMagic: boolean,
}

export const isDestroyable = (_w: World, c: Cell): boolean => {
  // console.dir({ c: c })
  const k = CellKind.o[c.kind]
  return k.destroyCostRatio != null
}

export const destroy = (w: World, c: Cell): void => {
  const p = c.area
  const k = CellKind.o[c.kind]
  const ratio = k.destroyCostRatio
  if (ratio == null) { return }
  const cost = k.buildCost(c.q.level, c.area.w as SizeType) * ratio
  w.powers.money -= cost
  w.buildings = w.buildings.filter((b) => {
    const q = b.area
    return !(p.x == q.x && p.y == q.y)
  })
}

export const improveCost = (_wo: World, c: Cell): number | null => {
  const k = CellKind.o[c.kind]
  const size = c.area.w as SizeType
  return k.improveCost(c.q, size)
}

export const canImprove = (_wo: World, c: Cell): boolean => {
  const k = CellKind.o[c.kind]
  return k.canImprove
}

export const isBuilding = (_wo: World, c: Cell): boolean => {
  return c.kind != FieldObjKind.none
}

export const improve = (w: World, c: Cell): void => {
  const p = c.area
  const cost = improveCost(w, c)
  if (cost == null) { return }
  for (let b of w.buildings) {
    const q = b.area
    if (p.x == q.x && p.y == q.y) {
      b.q.improve++
      w.powers.money -= cost
      return
    }
  }
}

export const canBuildAt = (_: World, c: Cell): boolean => (
  c.kind == FieldObjKind.none
)

const canBuildMagic = (wo: World): boolean => {
  const m = CellKind.magic
  return 0 < m.buildableLevel(wo.powers)
}

export const bulidState = (wo: World, param: BuildParam, topleft: { x: number, y: number }): BuildState => {
  if (param.size == undefined || param.toBiuld == undefined) {
    return {
      cost: 0,
      duration: 0,
      canBuild: false,
      canBuildMagic: canBuildMagic(wo),
      power: 0,
    }
  }
  const a = { ...topleft, w: param.size, h: param.size }
  const noIntersection = wo.buildings.every(e => !hasIntersection(e.area, a))
  const leftEnd = a.x + a.w - 1
  const bottomEnd = a.y + a.h - 1
  const overflow = wo.size.w <= leftEnd || wo.size.h <= bottomEnd
  const k = CellKind.o[param.toBiuld]
  const cost = k.buildCost(param.level, param.size)
  const power = k.power({ level: param.level, improve: 0 }, param.size ** 2)
  return {
    cost: cost,
    duration: Math.floor((param.level + 1) * (param.size + 1)),
    canBuild: noIntersection && !overflow && cost < wo.powers.money,
    canBuildMagic: canBuildMagic(wo),
    power: power ?? 0,
  }
}

export const visibleMaxLevel = (w: World, kind: FieldObjKindType): number => {
  const k = CellKind.o[kind]
  return k.buildableLevel(w.powers)
}

export const addBuilding = (w: World, a: Area, param: BuildParam): void => {
  const bs = bulidState(w, param, a)
  w.buildings.push(
    {
      area: { x: a.x, y: a.y, w: param.size!, h: param.size! },
      construction: bs.duration,
      constructionTotal: bs.duration,
      kind: param.toBiuld!,
      q: { level: param.level, improve: 0 },
    })
  w.powers.money -= bs.cost
}
export type CondType = {
  level?: number
  improve?: number
  power?: number
  construction?: number
  constructionTotal?: number
  basicPower?: number
  improveRatio?: number
  neibourEffect?: number
}

export const condition = (w: World, c: Cell): CondType => {
  const k = CellKind.o[c.kind]
  const power = k.power(c.q, c.area.w * c.area.h)
  const basicPower = k.power({ level: c.q.level, improve: 0 }, c.area.w * c.area.h)

  const improveRatio = (power != null && basicPower != null && 0 < basicPower) ? power / basicPower : 1
  const nef = k.neibourEffect(w, c)
  return {
    level: power == undefined ? undefined : c.q.level,
    improve: power == undefined ? undefined : c.q.improve,
    power: power && Math.floor(power * nef),
    construction: c.construction,
    constructionTotal: c.constructionTotal,
    basicPower: basicPower,
    improveRatio: improveRatio,
    neibourEffect: nef,
  }
}

export const buildLevel = (d: number): number => {
  return Math.floor(Math.log10(Math.max(1, d)))
}
