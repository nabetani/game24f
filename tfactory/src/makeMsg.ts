import * as W from "./World"

const pushDef = (r: string[], m: string | undefined | null) => {
  if (m != null) {
    r.push(m)
  }
}

const dmsgs = new Map<number, string>(
  [
    [1, "操業開始しました"],
  ]
)

export function makeMsg(wo: W.World): string[] {
  const r: string[] = []
  pushDef(r, dmsgs.get(wo.duration))
  return r
}
