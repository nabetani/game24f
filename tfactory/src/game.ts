import * as U from './util'

export const FieldObjID = {
  none: 0,
  house: 1,
  factory: 2,
  plabo: 3,
  blabo: 4,
} as const

export type FieldObjIDType = typeof FieldObjID[keyof (typeof FieldObjID)]
export interface FieldObj {
  get area(): Readonly<U.Area>
  get oid(): FieldObjIDType
}

type Powers = {
  money?: number;
  pdev?: number;
  bdev?: number;
}

const addPower = (a: Powers, b: Powers): Powers => {
  return {
    money: (a.money ?? 0) + (b.money ?? 0),
    pdev: (a.pdev ?? 0) + (b.pdev ?? 0),
    bdev: (a.bdev ?? 0) + (b.bdev ?? 0),
  }
}
export class Rank {
  _level: number // 製造時の能力
  _improve: number // 改善
  get level() { return this._level }
  get improve() { return this._improve }
  constructor(l: number, i: number) {
    this._level = l
    this._improve = i
  }
}

abstract class Building implements FieldObj {
  private _area: U.Area
  private _rank: Rank
  private _construction: number = 0
  get construction(): number { return this._construction }
  get area(): Readonly<U.Area> { return this._area }
  get rank(): Readonly<Rank> { return this._rank }
  abstract get oid(): FieldObjIDType
  abstract get income(): Powers
  constructor(area: U.Area, rank: Rank, co: number) {
    this._area = area
    this._rank = rank
    this._construction = co
  }
  progress(): void {
    if (0 < this._construction) {
      --this._construction
    }
  }
}

class House extends Building {
  override get oid(): FieldObjIDType { return FieldObjID.house }
  override get income(): Powers {
    const lev = this.rank.level
    const imp = this.rank.improve
    const size = this.area.size
    return {
      money: Math.floor(100 * size * (lev + imp ** 0.5)),
      pdev: 1, bdev: 1
    }
  }
  constructor(pos: U.XY) {
    super(U.Area.fromPS(pos, U.XY.of(1, 1)), new Rank(1, 0), 0)
  }
}

class EmptyCell implements FieldObj {
  private _pos: U.XY;
  get area(): Readonly<U.Area> { return U.Area.fromPS(this._pos, U.XY.of(1, 1)) }
  get oid(): FieldObjIDType { return FieldObjID.none }
  constructor(pos: U.XY) {
    this._pos = pos
  }
}

class Factory extends Building {
  override get oid(): FieldObjIDType { return FieldObjID.factory }
  override get income(): Powers {
    const lev = this.rank.level
    const imp = this.rank.improve
    const size = this.area.size
    return {
      money: Math.floor(100 * size * (lev + imp ** 0.5)),
    }
  }
  constructor(area: U.Area, rank: Rank, co: number) {
    super(area, rank, co)
  }
}

class PLabo extends Building {
  override get oid(): FieldObjIDType { return FieldObjID.plabo }
  override get income(): Powers {
    const lev = this.rank.level
    const imp = this.rank.improve
    const size = this.area.size
    return {
      money: -Math.floor(300 * size * lev),
      pdev: Math.floor(100 * size * (lev + imp ** 0.5)),
    }
  }
  constructor(area: U.Area, rank: Rank, co: number) {
    super(area, rank, co)
  }
}

class BLabo extends Building {
  override get oid(): FieldObjIDType { return FieldObjID.blabo }
  override get income(): Powers {
    const lev = this.rank.level
    const imp = this.rank.improve
    const size = this.area.size
    return {
      money: -Math.floor(1000 * size * lev),
      bdev: Math.floor(100 * size * (lev + imp ** 0.5)),
    }
  }
  constructor(area: U.Area, rank: Rank, co: number) {
    super(area, rank, co)
  }
}

export interface World {
  get wh(): U.XY
  progress(): World
  get duration(): number
  get powers(): Readonly<Powers>
  get deltsPowers(): Powers
  get buildings(): Readonly<Building[]>
  get fieldObjs(): Readonly<FieldObj[]>
}

const PowersZero = {
  money: 0,
  pdev: 0,
  bdev: 0,
} as const

class WorldImpl implements World {
  get wh(): U.XY { return U.XY.of(7, 7) }
  get duration(): number { return this._duration }
  get powers(): Readonly<Powers> { return addPower({}, this._powers) }

  _duration: number = 0
  _powers: Powers = {}
  _buildings: Building[] = []
  constructor(o: SerializedWorld) {
    this._buildings = [
      new House(this.wh.sub(U.XY.of(1, 1)).div(2)),
      new Factory(U.Area.fromXYWH(0, 0, 3, 3), new Rank(1, 0), 10),
      new Factory(U.Area.fromXYWH(4, 4, 3, 3), new Rank(1, 0), 10),
      new PLabo(U.Area.fromXYWH(this.wh.x - 1, 0, 1, 1), new Rank(1, 0), 20),
      new BLabo(U.Area.fromXYWH(0, this.wh.y - 1, 1, 1), new Rank(1, 0), 30),
    ]
  }
  get buildings(): Readonly<Building[]> {
    return this._buildings
  }
  get fieldObjs(): Readonly<FieldObj[]> {
    const bs: FieldObj[] = [...this.buildings]
    const m = new Set<number>()
    bs.forEach(b => {
      b.area.forEachXY(xy => {
        m.add(xy.toNum())
      })
    })
    U.Area.fromPS(U.XY.zero, this.wh).forEachXY(xy => {
      if (!m.has(xy.toNum())) {
        bs.push(new EmptyCell(xy))
      }
    })
    return bs
  }
  get deltsPowers(): Powers {
    return this._buildings.reduce((prev: Powers, b: Building): Powers => {
      return addPower(prev, b.income)
    }, PowersZero)
  }
  progress(): World {
    const r = new WorldImpl({})
    r._buildings = this._buildings
    r._powers = this._powers
    r._buildings.forEach(b => b.progress())
    r._powers = addPower(this._powers, this.deltsPowers)
    return r
  }
}

type SerializedWorld = { [key: string]: any }
export function restoreWorld(o: SerializedWorld): World {
  return new WorldImpl(o)
}
