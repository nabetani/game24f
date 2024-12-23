import * as W from "./World"
import * as U from './util'
import * as G from "./game2"

const pushDef = (r: W.Message[], at: number, m: string[]) => {
  if (m != null) {
    m.forEach(t => {
      r.push({ at: at, text: t })
    })
  }
}

const dmsgs = new Map<number, string>(
  [
    [1, "操業開始"],
  ]
)

function powerOfTen(): [number, string][] {
  const msgs: [number, string][] = []
  for (let i = 4; i < 72; i++) {
    msgs.push([10 ** i, `タイツの出荷が ${U.numText(10 ** i, true)}枚を超えた`])
  }
  return msgs
}

const kg = 1e3 / 50
const ton = 1e6 / 50
const me = 5.972e24 * kg
const ms = 1.9891e30 * kg
const km3 = 1e12 * kg
const abo = 6.02214076e23
const tmsgs = (([
  ...powerOfTen(),
  [43.4 * ton, "出荷したタイツの総重量が 初代ガンダム の重さを超えた"],
  [45e3 * ton, "出荷したタイツの総重量が 初代ウルトラマンの体重 を超えた"],
  [14200 * ton, "出荷したタイツの総重量が バケットホイールエクスカベーター Bagger 293 の重量を超えた"],
  [1800e4 * ton, "出荷したタイツの総重量が 初代マクロス の運用慣性重量 を超えた"],
  [536066, "出荷したタイツの枚数が鳥取県の人口 (2024年) を超えた"],
  [2521262, "出荷したタイツの枚数が京都府の人口 (2024年) を超えた"],
  [14105098, "出荷したタイツの枚数が東京都の人口 (2024年) を超えた"],
  [1.23941e8, "出荷したタイツの枚数が日本の人口 (2024年) を超えた"],
  [80.258e8, "出荷したタイツの枚数が地球の人口 (2023年) を超えた"],
  [280e8, "出荷したタイツの枚数が Apple M4 のトランジスタ数 を超えた"],
  [4.19 * km3, "出荷したタイツの総重量が 十和田湖の水の重さ を超えた"],
  [27.5 * km3, "出荷したタイツの総重量が 琵琶湖の水の重さ を超えた"],
  [932 * km3, "出荷したタイツの総重量が チチカカ湖の水の重さ を超えた"],
  [78200 * km3, "出荷したタイツの総重量が カスピ海の水の重さ を超えた"],
  [5.2e18 * kg, "出荷したタイツの総重量が 地球の大気の総重量 を超えた"],
  [3.510e10 * kg, "出荷したタイツの総重量が 小惑星イトカワの 質量 を超えた"],
  [4.5e11 * kg, "出荷したタイツの総重量が 小惑星リュウグウの 質量 を超えた"],
  [1.8e15 * kg, "出荷したタイツの総重量が 火星の衛星ダイモス の質量を超えた"],
  [1.26e16 * kg, "出荷したタイツの総重量が 火星の衛星フォボス の質量を超えた"],
  [9.4e20 * kg, "出荷したタイツの総重量が 準惑星ケレスの 質量を超えた"],
  [0.1074 * me, "出荷したタイツの総重量が 火星 の質量を超えた"],
  [14.54 * me, "出荷したタイツの総重量が 天王星 の質量を超えた"],
  [abo, "出荷したタイツの枚数が アボガドロ定数 を超えた"],
  [25000e12 * ton, "出荷したタイツの総重量が 南極の氷 の重さを超えた"],
  [1.4e18 * ton, "出荷したタイツの枚数が 海水の総重量 を超えた"],
  [0.0123 * me, "出荷したタイツの総重量が 月 の質量を超えた"],
  [0.0553 * me, "出荷したタイツの総重量が 水星 の質量を超えた"],
  [me, "出荷したタイツの総重量が 地球質量 を超えた"],
  [95.163 * me, "出荷したタイツの総重量が 土星 の質量を超えた"],
  [317.8 * me, "出荷したタイツの総重量が 木星 の質量を超えた"],
  [317.8 * me * 85, "出荷したタイツの総重量が とても小さな恒星 EBLM J0555-57 Ab の質量を超えた"],
  [0.1221 * ms, "出荷したタイツの総重量が プロキシマ・ケンタウリ の質量を超えた"],
  [1 / 26.9815386 * abo, "出荷したタイツの枚数が 一円玉に含まれるアルミニウムの原子数 を超えた"],
  [500 / 18 * abo, "出荷したタイツの枚数が 500ml の水に含まれる水分子の数 を超えた"],
  [ms, "出荷したタイツの総重量が 太陽質量 を超えた"],
  [18 * ms, "出荷したタイツの総重量が ベテルギウス の質量を超えた"],
  [315 * ms, "出荷したタイツの総重量が 巨大な恒星 RMC 136a1 の質量を超えた"],
  [10e10 * ms, "出荷したタイツの総重量が マゼラン星雲 の質量を超えた"],
  [2e12 * ms, "出荷したタイツの総重量が 天の川銀河 の質量を超えた"],
  [1.5e53 * kg, "出荷したタイツの総重量が観測可能な宇宙の全質量を超えた"],
]) as [number, string][]).sort((a: [number, string], b: [number, string]) => a[0] - b[0])

// console.log(tmsgs);

const tmsg = (wo: W.World): string[] => {
  const msgs: string[] = []
  for (const [n, m] of tmsgs) {
    if (wo.prev.total < n && n <= wo.total) {
      msgs.push(m)
    }
  }
  if (wo.prev.buildableMagicLevel < wo.buildableMagicLevel) {
    if (wo.prev.buildableMagicLevel == 0) {
      msgs.push("魔術研が開放された")
    } else {
      msgs.push(`魔術研 Lv. ${wo.buildableMagicLevel} が開放された`)
    }
  }
  if (!wo.prev.canMigrate && wo.canMigrate && wo.maxMagic < G.trueMaxMagicLevel) {
    msgs.push("新しい操作「転生」が開放された（ハンバーガーボタン → 転生）")
  }
  return msgs
}

export function makeMsg(wo: W.World): W.Message[] {
  const r: W.Message[] = []
  const m = dmsgs.get(wo.duration)
  if (m != null) {
    pushDef(r, wo.duration, [m])
  }
  pushDef(r, wo.duration, tmsg(wo))
  return r
}
