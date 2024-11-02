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
    [1, "操業開始"],
  ]
)

const kg = 1e3 / 50
const ton = 1e6 / 50
const me = 5.972e24 * kg
const ms = 1.9891e30 * kg
const tmsgs = ([
  [43.4 * ton, "出荷したタイツの総重量が 初代ガンダム の重さを超えた"],
  [45e3 * ton, "出荷したタイツの総重量が 初代ウルトラマンの体重 を超えた"],
  [1800e4 * ton, "出荷したタイツの総重量が 初代マクロス の運用慣性重量 を超えた"],
  [185.4e8, "出荷したタイツの枚数が、日本国内で流通している紙幣の枚数 (2023年末時点) を超えた"],
  [1.2488e8 * 55 * kg, "出荷したタイツの総重量が全日本人の重さを超えた"],
  [1.2488e8, "出荷したタイツの枚数が日本の人口を超えた"],
  [81.19e8, "出荷したタイツの総重量が地球の人口を超えた"],
  [81.19e8 * 55 * kg, "出荷したタイツの総重量が全人類の重さを超えた"],
  [275e8 * ton, "出荷したタイツの総重量が 琵琶湖の水の重さ を超えた"],
  [1.8e15 * kg, "出荷したタイツの総重量が 火星の衛星ダイモス の質量を超えた"],
  [1.26e16 * kg, "出荷したタイツの総重量が 火星の衛星フォボス の質量を超えた"],
  [9.4e20 * kg, "出荷したタイツの総重量が 準惑星ケレスの 質量を超えた"],
  [6.02214076e23, "出荷したタイツの枚数が アボガドロ定数 を超えた"],
  [25000e12 * ton, "出荷したタイツの総重量が 南極の氷 の重さを超えた"],
  [1.4e18 * ton, "出荷したタイツの枚数が 海水の総重量 を超えた"],
  [0.0123 * me, "出荷したタイツの総重量が 月 の質量を超えた"],
  [0.0553 * me, "出荷したタイツの総重量が 水星 の質量を超えた"],
  [me, "出荷したタイツの総重量が 地球質量 を超えた"],
  [95.163 * me, "出荷したタイツの総重量が 土星 の質量を超えた"],
  [317.8 * me, "出荷したタイツの総重量が 木星 の質量を超えた"],
  [ms, "出荷したタイツの総重量が 太陽質量 を超えた"],
  [18 * ms, "出荷したタイツの総重量が ベテルギウス の質量を超えた"],
  [10e10 * ms, "出荷したタイツの総重量が マゼラン星雲"],
  [2e12 * ms, "出荷したタイツの総重量が 天の川銀河 の質量を超えた"],
  [1.5e53 * kg, "出荷したタイツの総重量が観測可能な宇宙の全質量を超えた"],
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
  // console.log({ wo: wo, r: r })
  return r
}
