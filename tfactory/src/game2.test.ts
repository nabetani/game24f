import * as G from './game2'
import * as World from './World'
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
  const F = World.FieldObjKind
  test("none", () => expect(CK.none.kind).toBe(F.none))
  test("house", () => expect(CK.house.kind).toBe(F.house))
  test("factory", () => expect(CK.factory.kind).toBe(F.factory))
  test("pLabo", () => expect(CK.pLabo.kind).toBe(F.pLabo))
  test("bLabo", () => expect(CK.bLabo.kind).toBe(F.bLabo))
  test("magic", () => expect(CK.magic.kind).toBe(F.magic))
})

