import * as G from './game2'
import "jest"

namespace CK {
  export const none = G.CellKind.none
  export const house = G.CellKind.house
  export const factory = G.CellKind.factory
  export const pLabo = G.CellKind.pLabo
  export const bLabo = G.CellKind.bLabo
  export const magic = G.CellKind.magic
}

describe("G.CellKind.create", () => {
  const F = G.FieldObjKind
  test("none", () => expect(CK.none.kind).toBe(F.none))
  test("house", () => expect(CK.house.kind).toBe(F.house))
  test("factory", () => expect(CK.factory.kind).toBe(F.factory))
  test("pLabo", () => expect(CK.pLabo.kind).toBe(F.pLabo))
  test("bLabo", () => expect(CK.bLabo.kind).toBe(F.bLabo))
  test("magic", () => expect(CK.magic.kind).toBe(F.magic))
})

describe("Unbuildables.buildableLevel", () => {
  ([
    [{ pDev: 0, bDev: 0, money: 0 }, 0],
    [{ pDev: 1e8, bDev: 1e8, money: 1e8 }, 0],
  ] as [G.Powers, number][]).forEach(([i, ex]) => {
    test(
      "none:" + JSON.stringify(i), () =>
      expect(CK.none.buildableLevel(i)).toBe(ex)
    )
    test(
      "house:" + JSON.stringify(i), () =>
      expect(CK.house.buildableLevel(i)).toBe(ex)
    )
  })
})

describe("Factory.buildableLevel", () => {
  describe("Factory", () => {
    ([
      [{ pDev: 0, bDev: 0, money: 0 }, 0],
      [{ pDev: 0, bDev: 1e10, money: 1e10 }, 0],
      [{ pDev: 100, bDev: 0, money: 0 }, 2],
      [{ pDev: 999, bDev: 0, money: 0 }, 2],
      [{ pDev: 1e3, bDev: 0, money: 0 }, 3],
      [{ pDev: 0.99e25, bDev: 0, money: 0 }, 24],
      [{ pDev: 1e25, bDev: 0, money: 0 }, 25],
      [{ pDev: 1.1e25, bDev: 0, money: 0 }, 25],
      [{ pDev: 0.99e26, bDev: 0, money: 0 }, 25],
      [{ pDev: 1e26, bDev: 0, money: 0 }, 25],
      [{ pDev: 1e99, bDev: 1e99, money: 1e99 }, 25],
    ] as [G.Powers, number][]).forEach(([i, ex]) => {
      test(
        JSON.stringify(i), () =>
        expect(CK.factory.buildableLevel(i)).toBe(ex)
      )
    })
  });
  describe("Labo", () => {
    ([
      [{ pDev: 100, bDev: 0, money: 0 }, 0],
      [{ pDev: 100, bDev: 0, money: 1e10 }, 0],
      [{ pDev: 100, bDev: 100, money: 0 }, 2],
      [{ pDev: 100, bDev: 999, money: 0 }, 2],
      [{ pDev: 100, bDev: 1e3, money: 0 }, 3],
      [{ pDev: 100, bDev: 0.99e25, money: 0 }, 24],
      [{ pDev: 100, bDev: 1e25, money: 0 }, 25],
      [{ pDev: 100, bDev: 1.1e25, money: 0 }, 25],
      [{ pDev: 100, bDev: 0.99e26, money: 0 }, 25],
      [{ pDev: 100, bDev: 1e26, money: 0 }, 25],
      [{ pDev: 100, bDev: 1e99, money: 1e99 }, 25],
    ] as [G.Powers, number][]).forEach(([i, ex]) => {
      test(
        JSON.stringify(i), () =>
        expect(CK.pLabo.buildableLevel(i)).toBe(ex)
      );
      test(
        JSON.stringify(i), () =>
        expect(CK.bLabo.buildableLevel(i)).toBe(ex)
      );
    })
  })
})
