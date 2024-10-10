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
  plabo: 3,
  blabo: 4,
} as const

export type FieldObjKindType = typeof FieldObjKind[keyof (typeof FieldObjKind)]

export type FieldObj = {
  kind: FieldObjKindType,
  area: Area,
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
  buildings: Building[],
  duration: number,
  powers: Powers,
}

export const newHouse = (x: number, y: number, q: Quality): Building => {
  return {
    kind: FieldObjKind.house,
    q: q,
    area: { x: x, y: y, w: 1, h: 1 },
    construction: 0,
  }
}

export const restoreWorld = (_: { [key: string]: any }): World => {
  return {
    buildings: [
      newHouse(3, 3, { improve: 1, level: 1 }),
    ],
    duration: 0,
    powers: { money: 0, pDev: 0, bDev: 0 }
  }
}

export const progress = (o: World | Building): void => {
}

export const fieldObjs = (w: World): FieldObj[] => {
  return w.buildings
}
