
import { makeMsg } from './makeMsg';
import * as U from './util'
import { Area, Cell, FieldObjKind, FieldObjKindType, Powers, Quality, World } from './World';

const hasIntersection = (a: Area, b: Area): boolean => {
  const i = (a0: number, al: number, b0: number, bl: number): boolean => {
    const a1 = a0 + al - 1
    const b1 = b0 + bl - 1
    return !(b1 < a0 || a1 < b0)

  }
  return i(a.x, a.w, b.x, b.w) && i(a.y, a.h, b.y, b.h)
};

export type SizeType = 1 | 2 | 3;

export type WhatToBuild = typeof FieldObjKind.factory | typeof FieldObjKind.pLabo | typeof FieldObjKind.bLabo | typeof FieldObjKind.magic

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

  type IncomeBaseParamType = { level: number, improve?: number }

  abstract class Building implements I {
    abstract get maxLevel(): number
    abstract get canImprove(): boolean
    abstract get kind(): FieldObjKindType
    abstract buildableLevel(_: Powers): number
    abstract buildCost(level: number, size: SizeType): number;
    abstract incomeBase(_: IncomeBaseParamType): number
    abstract improveCost(q: Quality, size: SizeType): number | null
    abstract get destroyCostRatio(): number | null
    abstract neibourEffect(w: World, c: Cell): number
    abstract power(q: Quality, areaSize: number): number
  }

  abstract class StdBuilding extends Building {
    get canImprove(): boolean { return true }
    abstract get kind(): FieldObjKindType
    get maxLevel(): number { return 50 }
    abstract buildlevelSrc(p: Powers): number
    abstract get buildCostBase(): number
    get destroyCostRatio(): number { return 0.1 }
    power(q: Quality, areaSize: number): number {
      return this.incomeBase(q) * areaSize
    }
    buildCost(level: number, size: SizeType): number {
      const c = this.buildCostBase * 10 ** (level + 2) * size ** 2
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
    improve(i: IncomeBaseParamType): number {
      return 1 + (i.improve ?? 0) ** 0.8 / 10
    }
    abstract incomeBase(i: IncomeBaseParamType): number
    abstract isPowerNeibourType(k: FieldObjKindType): boolean
    neibourEffect(w: World, c: Cell): number {
      let e = 1
      let m: Cell[] = []
      eachNeibours(w, c.area, (b, tLen) => {
        const dl = b.q.level - c.q.level
        if (this.isPowerNeibourType(b.kind) && 0 <= dl) {
          e += 0.5 * tLen * (dl + 1)
        }
        if (b.kind == FieldObjKind.magic) {
          m.push(b)
        }
      })
      return e * ((): number => {
        if (m.length == 0) { return 1 }
        if (m.length == 1) {
          return magic.incomeBase({ level: m[0].q.level }) * magic.neibourEffect(w, m[0])
        }
        return 1e-3
      })()
    }
  }

  class Factory extends StdBuilding {
    get buildCostBase(): number { return 1 }
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
      // build cost: this.buildCostBase * 10 ** (level + 2)
      return U.qdigit(100 * 6 ** (i.level - 1) * this.improve(i))
    }
  }

  class PLabo extends StdBuilding {
    get buildCostBase(): number { return 9 }
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
      return U.qdigit(20 * 6 ** (i.level - 1) * this.improve(i))
    }
  }

  class BLabo extends StdBuilding {
    get buildCostBase(): number { return 60 }
    buildlevelSrc(p: Powers): number {
      return p.bDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.bLabo
    }
    isPowerNeibourType(_k: FieldObjKindType): boolean { return false }
    incomeBase(i: IncomeBaseParamType): number {
      return U.qdigit(4 * 6 ** (i.level - 1) * this.improve(i))
    }
  }

  class House extends Building {
    get canImprove(): boolean { return true }
    buildCost(_1: number, _2: SizeType): number { return 0 }
    get kind(): FieldObjKindType {
      return FieldObjKind.house
    }
    improveCost(q: Quality, _size: SizeType): number {
      return U.didigit(100 * 2 ** (q.improve ?? 0))
    }
    power(q: Quality, _areaSize: number): number {
      return this.incomeBase(q)
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
    get canImprove(): boolean { return false }
    power(q: Quality, _areaSize: number): number {
      return this.incomeBase(q)
    }
    buildCost(level: number, size: SizeType): number {
      const base = 1000e12 // 1000兆
      // lv. 1→10 で、コストが 1e14 → 1e64 (1e50倍）
      const relLevel = (level - 1) / (this.maxLevel - 1)
      const c = size * base * 10 ** (relLevel * 50)
      return U.didigit(c)
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.magic
    }
    get destroyCostRatio(): number { return 100 }
    get maxLevel(): number { return 10 }
    buildableLevel(p: Powers): number {
      const m = buildLevel(Math.min(p.bDev, p.pDev))
      // Lv.10 で 1 がビルド可能。そこから5ごとに増える
      const b = 1 + Math.floor((m - 10) / 5)
      // console.log({ b: b, m: m, p: p })
      return U.clamp(b, 0, this.maxLevel)
    }
    improveCost(_q: Quality, _size: SizeType): null {
      return null
    }
    incomeBase(i: IncomeBaseParamType): number {
      return 20 * 5 ** (i.level - 1)
    }
    neibourEffect(w: World, c: Cell): number {
      let e = 0
      eachNeibours(w, c.area, (b, tLen) => {
        if (b.kind == FieldObjKind.house) {
          e += tLen * b.q.improve
        }
      })
      return U.didigit((1 + e / 5) ** 0.8 * 10) / 10
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
    prev: {
      duration: 0,
      powers: { bDev: 0, pDev: 0, money: 0 },
      total: 0,
    },
    size: { w: 5, h: 10 },
    buildings: [
      newHouse(2, 4, { improve: 0, level: 1 }),
    ],
    duration: 0,
    total: 0,
    messages: ["操業開始"],
    powers: { money: 1e5, pDev: 100, bDev: 100 } // TODO: fix
    // powers: { money: 1e60, pDev: 1e60, bDev: 1e60 } // TODO: fix
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
  if (o.prev == null) {
    o.prev = { duration: 0, powers: { money: 0, pDev: 0, bDev: 0 }, total: 0 }
  }
  o.prev.duration = o.duration
  o.prev.total = o.total
  o.prev.powers = { ...o.powers }

  o.buildings.forEach(b => progressB(b))
  const i = incomeW(o)
  ++o.duration
  o.total += i.money ?? 0
  o.powers = powersAdd(o.powers, i)
  const msgs = makeMsg(o)
  console.log({ o: o, msgs: msgs })
  o.messages ??= []
  o.messages.push(...msgs)
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

export const destroyCost = (_wo: World, c: Cell): number | null => {
  const k = CellKind.o[c.kind]
  const r = k.destroyCostRatio
  if (r == null) { return null }
  const cost = k.buildCost(c.q.level, c.area.h as SizeType)
  return cost * r
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
