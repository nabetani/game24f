
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
export const FieldObjKind = {
  none: 0,
  house: 1,
  factory: 2,
  pLabo: 3,
  bLabo: 4,
} as const

export type FieldObjKindType = typeof FieldObjKind[keyof (typeof FieldObjKind)]

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
