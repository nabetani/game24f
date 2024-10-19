
import * as G from './game'
import "jest"
import { numText } from './util';

describe(G.qdigit, () =>
  ([
    [0, 0],
    [1, 1],
    [12, 12],
    [123, 123],
    [1234, 1234],
    [9999, 9999],
    [12344, 12340],
    [12349, 12340],
    [99999, 99990],
    [1234567, 1234000],
    [1000000, 1000000],
  ] as [number, number][]).forEach(([v, ex]) => {
    test(
      `numText(${v})`, () => expect(G.qdigit(v)).toBe(ex)
    );
  })
);

describe(G.didigit, () => {
  ([
    [0, 0],
    [1, 1],
    [12, 12],
    [123, 120],
    [1234, 1200],
    [9999, 9900],
    [12344, 12000],
    [12349, 12000],
    [99999, 99000],
    [1234567, 1200000],
    [1000000, 1000000],
  ] as [number, number][]).forEach(([v, ex]) => {
    test(
      `numText(${v})`, () => expect(G.didigit(v)).toBe(ex)
    );
  })
})


describe(G.buildLevel, () => {
  ([
    [0, 0],
    [1, 0],
    [9, 0],
    [10, 1],
    [100, 2],
    [9999, 3],
    [12344, 4],
    [99999, 4],
    [1234567, 6],
    [1000000, 6],
    [1.1e100, 100],
  ] as [number, number][]).forEach(([v, ex]) => {
    test(
      `buildLevel(${v})`, () => expect(G.buildLevel(v)).toBe(ex)
    )
  });
})
