
export type Message = {
  text: string,
  at: number,
}
export type World = {
  buildings: Cell[];
  duration: number;
  total: number;
  powers: Powers;
  messages: Message[];
  maxMagic: number;
  size: { w: number, h: number },

  prev: {
    duration: number;
    total: number;
    powers: Powers;
  },
};
export type Cell = {
  kind: FieldObjKindType;
  q: Quality;
  area: Area;
  construction: number;
  constructionTotal: number;
};
export type Powers = {
  money: number;
  pDev: number;
  bDev: number;
};
export type Area = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Quality = {
  level: number;
  improve: number;
};
export const FieldObjKind = {
  none: "none",
  house: "house",
  factory: "factory",
  pLabo: "pLabo",
  bLabo: "bLabo",
  magic: "magic",
} as const;
export type FieldObjKindType = (typeof FieldObjKind)[keyof (typeof FieldObjKind)];

export const isInitialWorld = (w: World): boolean => {
  return w.buildings.length == 1 && (w.buildings[0]?.q?.improve ?? 0) == 0
}
