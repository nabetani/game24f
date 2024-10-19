
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
  magic: 5,
} as const

export type FieldObjKindType = typeof FieldObjKind[keyof (typeof FieldObjKind)]

export type SizeType = 1 | 2 | 3;

export type WhatToBuild = typeof FieldObjKind.factory | typeof FieldObjKind.pLabo | typeof FieldObjKind.bLabo | typeof FieldObjKind.magic
/*
n=25;m=1.5e4**(1.0/(n-2));p [n,m];a=(1...n).map{(2*m**(_1-1)).round};p [a, a.size,  Ma
th.log10(a.reduce(1,&:*))]

[25, 1.519039913039954]
[[2, 3, 5, 7, 11, 16, 25, 37, 57, 86, 131, 199, 302, 459, 697, 1058, 1607, 2442, 3709, 5634, 8559, 13001, 19749, 30000], 24, 57.38281081010878]
*/
export const maxLevel = 25
export type Powers = {
  money: number,
  pDev: number,
  bDev: number,
}

export type BuildParam = {
  level: number,
  size?: SizeType,
  toBiuld?: WhatToBuild,
}

export type FieldObj = {
  kind: FieldObjKindType,
  area: Area,
}

export namespace CellKind {
  export interface I {
    get kind(): FieldObjKindType
    buildableLevel(p: Powers): number
  }
  class None implements I {
    get kind(): FieldObjKindType { return FieldObjKind.none }
    buildableLevel(_: Powers): number { return 0 }
  }

  abstract class Building implements I {
    abstract get kind(): FieldObjKindType
    abstract buildableLevel(p: Powers): number
  }

  abstract class StdBuilding extends Building {
    abstract get kind(): FieldObjKindType
    abstract buildlevelSrc(p: Powers): number
    buildableLevel(p: Powers): number {
      return U.clamp(
        Math.floor(Math.log10(this.buildlevelSrc(p))),
        0, maxLevel)
    }
  }

  class Factory extends StdBuilding {
    buildlevelSrc(p: Powers): number {
      return p.pDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.factory
    }
  }

  class PLabo extends StdBuilding {
    buildlevelSrc(p: Powers): number {
      return p.bDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.pLabo
    }
  }

  class BLabo extends StdBuilding {
    buildlevelSrc(p: Powers): number {
      return p.bDev
    }
    get kind(): FieldObjKindType {
      return FieldObjKind.bLabo
    }
  }

  class House implements Building {
    get kind(): FieldObjKindType {
      return FieldObjKind.house
    }
    buildableLevel(p: Powers): number { return 0 }
  }
  class Magic implements Building {
    get kind(): FieldObjKindType {
      return FieldObjKind.magic
    }
    buildableLevel(p: Powers): number { return 0 }
  }

  export const create = (k: FieldObjKindType): I => {
    switch (k) {
      case FieldObjKind.house: return new House()
      case FieldObjKind.factory: return new Factory()
      case FieldObjKind.pLabo: return new PLabo()
      case FieldObjKind.bLabo: return new BLabo()
      case FieldObjKind.magic: return new Magic()
    }
    return new None()
  }
}
