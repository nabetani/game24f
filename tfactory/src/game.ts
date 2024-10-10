
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
  }
}

export const restoreWorld = (_: { [key: string]: any }): World => {
  return {
    size: { w: 7, h: 7 },
    buildings: [
      newHouse(3, 3, { improve: 1, level: 1 }),
    ],
    duration: 0,
    powers: { money: 3000, pDev: 0, bDev: 0 }
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

const buildingPower = (b: Building): number => {
  if (0 < b.construction) {
    return 0
  }
  return Math.floor(2 ** b.q.level * b.q.improve ** 0.5 * (b.area.h * b.area.w - 0.2))
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


export const bulidState = (wo: World, param: BuildParam, fo: FieldObj): BuildState => {
  const baseCost = (new Map<FieldObjKindType, number>(
    [[FieldObjKind.factory, 100],
    [FieldObjKind.pLabo, 1000],
    [FieldObjKind.bLabo, 10000]])).get(param.toBiuld) ?? 0
  const cost = Math.floor(2 ** (param.level + 1) * (param.size + 2)) * baseCost
  const a = fo.area
  const bArea = { ...a, w: param.size, h: param.size }
  const hindrance = !wo.buildings.every(e => !hasIntersection(e.area, bArea))
  const leftEnd = bArea.x + bArea.w - 1
  const bottomEnd = bArea.y + bArea.h - 1
  const overflow = wo.size.w <= leftEnd || wo.size.h <= bottomEnd
  const p = incomeB(wo, {
    area: { x: 0, y: 0, w: param.size, h: param.size },
    construction: 0,
    kind: param.toBiuld,
    q: { level: param.level, improve: 1 },
  })
  const power = p.bDev + p.money + p.pDev
  return {
    cost: cost,
    duration: Math.floor((param.level + 1) * (param.size ** 2 + 2)),
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
      kind: param.toBiuld,
      q: { level: param.level, improve: 1 },
    })
  w.powers.money -= bs.cost
}
