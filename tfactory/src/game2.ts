
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
    get isDestroyable(): boolean
    buildableLevel(p: Powers): number
    buildCost(level: number, size: SizeType): number
    improveCost(q: Quality, size: SizeType): number | null
    incomeBase(i: IncomeBaseParamType): number
    power(q: Quality, areaSize: number): number
  }
  class None implements I {
    get kind(): FieldObjKindType { return FieldObjKind.none }
    get maxLevel() { return null }
    get canImprove(): boolean { return false }
    buildableLevel(_: Powers): number { return 0 }
    buildCost(_1: number, _2: SizeType): number { return 0 }
    incomeBase(_: IncomeBaseParamType): number { return 0 }
    improveCost(_q: Quality, _size: SizeType): null { return null }
    power(_q: Quality, _areaSize: number): number { return 0 }
    get isDestroyable(): boolean { return false }
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
      return this.incomeBase(q) * areaSize ** 1.2
    }

    improveCost(q: Quality, size: SizeType): number {
      const b = this.buildCost(q.level, size)
      return b / 10
    }
    abstract get isDestroyable(): boolean
  }

  abstract class StdBuilding extends Building {
    abstract get kind(): FieldObjKindType
    get maxLevel(): number { return 25 }
    abstract buildlevelSrc(p: Powers): number
    abstract costPerIncome(level: number): number
    get isDestroyable(): boolean { return true }
    buildCost(level: number, size: SizeType): number {
      return this.incomeBase({ level: level }) * (size ** 2) * this.costPerIncome(level)
    }

    buildableLevel(p: Powers): number {
      return U.clamp(
        Math.floor(Math.log10(this.buildlevelSrc(p))),
        0, this.maxLevel)
    }
    abstract get incomeParam(): IncomeParamType
    incomeBase(i: IncomeBaseParamType): number {
      const p = this.incomeParam
      const imp = (1.0 + (i.improve ?? 0) ** 0.8 * 0.1)
      return p.start * p.levBase ** (i.level - 1) * imp
    }
  }

  class Factory extends StdBuilding {
    costPerIncome(level: number): number {
      return 30 * (1 + (level - 1) / 20)
    }
    get incomeParam(): IncomeParamType {
      return { levBase: 4, start: 100 }
    }
    buildlevelSrc(p: Powers): number {
      return p.pDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.factory
    }
  }

  class PLabo extends StdBuilding {
    costPerIncome(level: number): number {
      return 100 * (1 + (level - 1) / 15)
    }
    get incomeParam(): IncomeParamType {
      return { levBase: 3.5, start: 30 }
    }
    buildlevelSrc(p: Powers): number {
      return p.bDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.pLabo
    }
  }

  class BLabo extends StdBuilding {
    costPerIncome(level: number): number {
      return 300 * (1 + (level - 1) / 10)
    }
    get incomeParam(): IncomeParamType {
      return { levBase: 3, start: 20 }
    }
    buildlevelSrc(p: Powers): number {
      return p.bDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.bLabo
    }
  }

  class House extends Building {
    buildCost(_1: number, _2: SizeType): number { return 0 }
    get kind(): FieldObjKindType {
      return FieldObjKind.house
    }
    get maxLevel(): number { return 1 }
    get isDestroyable(): boolean { return false }
    incomeBase(i: IncomeBaseParamType): number {
      const imp = (1.0 + (i.improve ?? 0) ** 0.8 * 0.1)
      const start = 1000
      const levBase = 1
      return start * levBase ** (i.level - 1) * imp

    }
    buildableLevel(_: Powers): number { return 0 }
  }
  class Magic extends Building {
    buildCost(level: number, size: SizeType): number {
      return (10 ** 12 * 10 ** (8 * level - 1)) * size ** 2
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.magic
    }
    get isDestroyable(): boolean { return false }
    get maxLevel(): number { return 5 }
    buildableLevel(_: Powers): number { return 0 }
    incomeBase(_: IncomeBaseParamType): number {
      return 0
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
    r[t] = k.power(c.q, c.area.h * c.area.w)
    return r
  }
}

export const incomeW = (w: World): Powers => {
  return w.buildings.reduce(
    (acc, b): Powers => {
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
}

export const isDestroyable = (_w: World, c: Cell): boolean => {
  const k = CellKind.o[c.kind]
  return k.isDestroyable
}

export const destroy = (w: World, c: Cell): void => {
  const p = c.area
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

export const canImprove = (w: World, c: Cell): boolean => {
  const k = CellKind.o[c.kind]
  return k.canImprove
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

export const bulidState = (wo: World, param: BuildParam, a: Area): BuildState => {
  if (param.size == undefined || param.toBiuld == undefined) {
    return {
      cost: 0,
      duration: 0,
      canBuild: false,
      power: 0,
    }
  }
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
    power: power,
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
}

export const condition = (_w: World, c: Cell): CondType => {
  console.log({ c: c })
  const k = CellKind.o[c?.kind]
  console.log({
    kind: k.kind,
    canImprove: k.canImprove,
    maxLevel: k.maxLevel,
    isDestroyable: k.isDestroyable,
  })
  return {
    level: c.q.level,
    improve: c.q.improve,
    power: k.power(c.q, c.area.w * c.area.h),
    construction: c.construction,
    constructionTotal: c.constructionTotal,
  }
}
