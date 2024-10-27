import * as W from "./World"
import * as U from './util'

const pushDef = (r: string[], m: string | undefined | null) => {
  if (m != null) {
    console.log(m)
    r.push(m)
  }
}

const dmsgs = new Map<number, string>(
  [
    [1, "操業開始しました"],
  ]
)

const tmsgs = ([
  [80000000, "出荷したタイツの総量が 東京タワーの重さを超えた"],
  [926560000, "出荷したタイツの総量が タイタニックの重さを超えた"],
  [185.4e8, "出荷したタイツの枚数が、日本国内で流通している紙幣の枚数 (2023年末時点) を超えた"],
  [1.2e8 * 1100, "出荷したタイツの総量が全日本人の質量を超えた"],
  [8.25e12, "出荷したタイツの総量が全人類の質量を超えた"],
  [5.5e14, "出荷したタイツの総量が 琵琶湖の水の重さを超えた"],
  [2.9524e16, "出荷したタイツの総量が 火星の衛星ダイモスの質量を超えた"],
  [1.8786e22, "小惑星ケレスの質量を超えた"],
  [6.02214076e23, "出荷したタイツの枚数が アボガドロ定数 を超えた"],
  [1.47e24, "出荷したタイツの総量が月の質量を超えた"],
  [1.2e26, "出荷したタイツの総量が地球質量を超えた"],
  [3.796e28, "出荷したタイツの総量が木製質量を超えた"],
  [3.98e31, "出荷したタイツの総量が太陽質量を超えた"],
  [3.98e31 * 1.5e12, "出荷したタイツの総量が銀河系の質量を超えた"],
  [3e54, "出荷したタイツの総量が観測可能な宇宙の全質量を超えた"],
  [3.98e31 * 65e8, "出荷したタイツの総量が M87 の中心にある超巨大ブラックホールの質量を超えた"],
] as [number, string][]).sort((a: [number, string], b: [number, string]) => a[0] - b[0])

const tmsg = (wo: W.World): string | null => {
  for (const [n, m] of tmsgs) {
    if (wo.prev.total < n && n <= wo.total) {
      return m
    }
  }
  return null
}

const powerTen = (wo: W.World): string | null => {
  const p = (n: number): number => Math.floor(Math.log10(Math.max(n, 1)))
  const p1 = p(wo.total)
  if (p1 < 4) { return null }
  const p0 = p(wo.prev.total)
  if (p0 == p1) { return null }
  const m = `タイツの出荷が ${U.numText(10 ** p1, true)}枚を超えた`
  console.log(m)

  return m
}

export function makeMsg(wo: W.World): string[] {
  const r: string[] = []
  pushDef(r, dmsgs.get(wo.duration))
  pushDef(r, powerTen(wo))
  pushDef(r, tmsg(wo))
  console.log({ wo: wo, r: r })
  return r
}
