
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
  none: 0,
  house: 1,
  factory: 2,
  pLabo: 3,
  bLabo: 4,
} as const


export type FieldObjKindType = typeof FieldObjKind[keyof (typeof FieldObjKind)]

export const fieldObjName = (f: FieldObjKindType): keyof (typeof FieldObjKind) => {
  const r = Object.entries(FieldObjKind).find((v) => { return v[1] == f })
  return r ? (r[0] as keyof (typeof FieldObjKind)) : "none"
}
export type SizeType = 1 | 2 | 3;
export type WhatToBuild = typeof FieldObjKind.factory | typeof FieldObjKind.pLabo | typeof FieldObjKind.bLabo

export type BuildParam = {
  level: number,
  size: SizeType,
  toBiuld: WhatToBuild,
}

export type FieldObj = {
  kind: FieldObjKindType,
  area: Area,
}

const newEmpty = (x: number, y: number): FieldObj => {
  return {
    kind: FieldObjKind.none,
    area: { x: x, y: y, w: 1, h: 1 },
  }
}

export type Building = {
  kind: FieldObjKindType,
  q: Quality,
  area: Area,
  construction: number,
  constructionTotal: number,
}

const isBuilding = (o: any): o is Building => {
  const b = o as Building
  return (
    typeof (b.kind) == "number"
    && !!b.q
    && !!b.area
    && typeof (b.construction) == "number"
  )
}

export type Powers = {
  money: number,
  pDev: number,
  bDev: number,
}

const powerZero: Powers = {
  money: 0,
  pDev: 0,
  bDev: 0,
} as const

const powerAdd = (a: Powers, b: Powers): Powers => {
  return {
    money: a.money + b.money,
    pDev: a.pDev + b.pDev,
    bDev: a.bDev + b.bDev,
  }
}

export type World = {
  size: { w: number, h: number },
  buildings: Building[],
  duration: number,
  powers: Powers,
}

const newHouse = (x: number, y: number, q: Quality): Building => {
  return {
    kind: FieldObjKind.house,
    q: q,
    area: { x: x, y: y, w: 1, h: 1 },
    construction: 0,
    constructionTotal: 1,
  }
}

export const restoreWorld = (_: { [key: string]: any }): World => {
  return {
    size: { w: 7, h: 7 },
    buildings: [
      newHouse(3, 3, { improve: 0, level: 1 }),
    ],
    duration: 0,
    powers: { money: 3000, pDev: 1, bDev: 1 }
  }
}

const isWorld = (o: any): o is World => {
  const w = o as World
  return (
    Array.isArray(w?.buildings)
    && typeof (w?.duration) == "number"
    && !!w?.powers
    && !!w?.size)
}

export const levelMax = 15
export const buildableMax = (wo: World, k: WhatToBuild): number => {
  const f = (p: number): number => {
    const v = Math.floor(Math.log10(Math.max(1, p)))
    return U.clamp(v, 2, levelMax)
  }
  switch (k) {
    case FieldObjKind.factory:
      return f(wo.powers.pDev)
    case FieldObjKind.pLabo:
      return f(wo.powers.bDev)
    case FieldObjKind.bLabo:
      return f(wo.powers.bDev)
    default:
      return 2;
  }
}

const powFromLevel = (level: number, im: number = 0): number => {
  // 当初は lv1→ lv.2 は 2倍
  // lv.max は 2**53 にする。
  const m = (levelMax - 1) ** 2
  const x = level + (level - 1) ** 2 / m * (53 - levelMax)
  return 2 ** x * (1.0 + im * 0.1)
}

const buildingPower = (b: Building): number => {
  if (0 < b.construction) {
    return 0
  }
  const f = (lev: number, im: number, a: { w: number, h: number }): number => (
    powFromLevel(lev, im) * (a.w * a.h - 0.2))
  const base = f(1, 0, { w: 1, h: 1 })
  const raw = f(b.q.level, b.q.improve, b.area)
  return qdigit(raw / base * 100)
}

export const incomeB = (w: World, b: Building): Powers => {
  const z = { ...powerZero }
  switch (b.kind) {
    case FieldObjKind.bLabo:
      z.bDev += buildingPower(b)
      return z
    case FieldObjKind.pLabo:
      z.pDev += buildingPower(b)
      return z
    case FieldObjKind.factory:
      z.money += buildingPower(b)
      return z
    case FieldObjKind.house:
      const pow = buildingPower(b)
      z.money += pow
      return z
    default:
      return powerZero
  }
}

export const incomeW = (w: World): Powers => {
  return w.buildings.reduce((acc, b): Powers => powerAdd(acc, incomeB(w, b)), powerZero)
}

export const progress = (o: World | Building): void => {
  if (isWorld(o)) {
    o.buildings.forEach(b => progress(b))
    const i = incomeW(o)
    console.log(i)
    ++o.duration
    o.powers.money += i.money ?? 0
    o.powers.pDev += i.pDev ?? 0
    o.powers.bDev += i.bDev ?? 0
  } else {
    if (0 < o.construction) --o.construction
  }
}

export const fieldObjs = (w: World): FieldObj[] => {
  const s = new Set<number>()
  const r: FieldObj[] = [...w.buildings]
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

export const defaultBuildParam = (_: World): BuildParam => {
  return {
    level: 1,
    size: 1,
    toBiuld: FieldObjKind.factory,
  }
}

export type BuildState = {
  cost: number,
  duration: number,
  power: number,
  canBuild: boolean,
}

export const isDestroyable = (fo: FieldObj): boolean => {
  const c: number[] = [FieldObjKind.factory, FieldObjKind.bLabo, FieldObjKind.pLabo]
  return c.includes(fo.kind)
}

export const destroy = (w: World, fo: FieldObj): void => {
  const p = fo.area
  w.buildings = w.buildings.filter((b) => {
    const q = b.area
    return !(p.x == q.x && p.y == q.y)
  })
}

export const improveCost = (wo: World, fo: FieldObj): number | null => {
  if (!isBuilding(fo)) { return null }
  const i = incomeB(wo, { ...fo, q: { level: fo.q.level, improve: 1 } })
  const cost = (i.bDev + i.money + i.pDev) / 10
  if (wo.powers.money < cost) { return null }
  return cost
}

export const improve = (w: World, fo: FieldObj): void => {
  const p = fo.area
  const cost = improveCost(w, fo)
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

const qdigit = (x: number): number => {
  if (Math.abs(x) < 9999) {
    return Math.floor(x)
  }
  const k = Math.floor(Math.log10(Math.abs(x)))
  const b = 10 ** (k - 3)
  return b * Math.floor(x / b)
}

export const canBuildAt = (_: World, fo: FieldObj): boolean => (
  fo.kind == FieldObjKind.none
)

export const canImprove = (_: World, fo: FieldObj): boolean => {
  switch (fo.kind) {
    case FieldObjKind.factory:
    case FieldObjKind.pLabo:
    case FieldObjKind.bLabo:
    case FieldObjKind.house:
      return true;
    default:
      return false;
  }
}

export const canDestroy = (_: World, fo: FieldObj): boolean => {
  switch (fo.kind) {
    case FieldObjKind.factory:
    case FieldObjKind.pLabo:
    case FieldObjKind.bLabo:
      return true;
    default:
      return false;
  }
}

export const bulidState = (wo: World, param: BuildParam, fo: FieldObj): BuildState => {
  const mul = (new Map<FieldObjKindType, number>(
    [[FieldObjKind.factory, 100],
    [FieldObjKind.pLabo, 300],
    [FieldObjKind.bLabo, 3000]])).get(param.toBiuld) ?? 0
  const a = fo.area
  const bArea = { ...a, w: param.size, h: param.size }
  const hindrance = !wo.buildings.every(e => !hasIntersection(e.area, bArea))
  const leftEnd = bArea.x + bArea.w - 1
  const bottomEnd = bArea.y + bArea.h - 1
  const overflow = wo.size.w <= leftEnd || wo.size.h <= bottomEnd
  const p = incomeB(wo, {
    area: { x: 0, y: 0, w: param.size, h: param.size },
    construction: 0,
    constructionTotal: 1,
    kind: param.toBiuld,
    q: { level: param.level, improve: 0 },
  })
  const power = p.bDev + p.money + p.pDev
  const cost = power * mul
  return {
    cost: cost,
    duration: Math.floor((param.level + 1) * (param.size + 1)),
    canBuild: fo.kind == FieldObjKind.none && !hindrance && !overflow && cost < wo.powers.money,
    power: power,
  }
}

export const addBuilding = (w: World, fieldObj: FieldObj, param: BuildParam): void => {
  const a = fieldObj.area
  const bs = bulidState(w, param, fieldObj)
  w.buildings.push(
    {
      area: { x: a.x, y: a.y, w: param.size, h: param.size },
      construction: bs.duration,
      constructionTotal: bs.duration,
      kind: param.toBiuld,
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

export const condition = (w: World, f: FieldObj): CondType => {
  let r: CondType = {}
  if (isBuilding(f)) {
    r.level = f.q.level
    r.improve = f.q.improve
    const p = incomeB(w, f)
    r.power = p.bDev + p.pDev + p.money
    r.construction = f.construction
    r.constructionTotal = f.constructionTotal
  }
  return r
}

