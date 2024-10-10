
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
      { area: { x: 0, y: 0, w: 3, h: 3 }, construction: 10, kind: FieldObjKind.factory, q: { improve: 1, level: 1 } },
      { area: { x: 6, y: 0, w: 1, h: 1 }, construction: 30, kind: FieldObjKind.pLabo, q: { improve: 1, level: 1 } },
      { area: { x: 0, y: 6, w: 1, h: 1 }, construction: 10, kind: FieldObjKind.bLabo, q: { improve: 1, level: 1 } },
    ],
    duration: 0,
    powers: { money: 0, pDev: 0, bDev: 0 }
  }
}

export const progress = (o: World | Building): void => {
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
  canBuild: boolean,
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
  return {
    cost: cost,
    duration: Math.floor((param.level + 1) * (param.size ** 2 + 2)),
    canBuild: fo.kind == FieldObjKind.none && !hindrance && !overflow
  }
}
