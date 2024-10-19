import * as G from './game2'
import "jest"

namespace CK {
  export const none = (): G.CellKind.I => G.CellKind.create(G.FieldObjKind.none)
  export const house = (): G.CellKind.I => G.CellKind.create(G.FieldObjKind.house)
  export const factory = (): G.CellKind.I => G.CellKind.create(G.FieldObjKind.factory)
  export const pLabo = (): G.CellKind.I => G.CellKind.create(G.FieldObjKind.pLabo)
  export const bLabo = (): G.CellKind.I => G.CellKind.create(G.FieldObjKind.bLabo)
  export const magic = (): G.CellKind.I => G.CellKind.create(G.FieldObjKind.magic)
}

describe("G.CellKind.create", () => {
  const F = G.FieldObjKind
  test("none", () => expect(CK.none().kind).toBe(F.none))
  test("house", () => expect(CK.house().kind).toBe(F.house))
  test("factory", () => expect(CK.factory().kind).toBe(F.factory))
  test("pLabo", () => expect(CK.pLabo().kind).toBe(F.pLabo))
  test("bLabo", () => expect(CK.bLabo().kind).toBe(F.bLabo))
  test("magic", () => expect(CK.magic().kind).toBe(F.magic))
})

describe("Unbuildables.buildableLevel", () => {
  ([
    [{ pDev: 0, bDev: 0, money: 0 }, 0],
    [{ pDev: 1e8, bDev: 1e8, money: 1e8 }, 0],
  ] as [G.Powers, number][]).forEach(([i, ex]) => {
    test(
      "none:" + JSON.stringify(i), () =>
      expect(CK.none().buildableLevel(i)).toBe(ex)
    )
    test(
      "house:" + JSON.stringify(i), () =>
      expect(CK.house().buildableLevel(i)).toBe(ex)
    )
  })
})

describe("Factory.buildableLevel", () => {
  ([
    [{ pDev: 0, bDev: 0, money: 0 }, 0],
    [{ pDev: 100, bDev: 0, money: 0 }, 2],
    [{ pDev: 999, bDev: 0, money: 0 }, 2],
    [{ pDev: 1e3, bDev: 0, money: 0 }, 3],
    [{ pDev: 0.99e20, bDev: 0, money: 0 }, 19],
    [{ pDev: 1e20, bDev: 0, money: 0 }, 20],
    [{ pDev: 1.1e20, bDev: 0, money: 0 }, 20],
  ] as [G.Powers, number][]).forEach(([i, ex]) => {
    test(
      JSON.stringify(i), () =>
      expect(CK.factory().buildableLevel(i)).toBe(ex)
    )
  })
})
