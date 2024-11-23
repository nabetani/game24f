export const clientWH = (): { w: number, h: number } => {
  const cw0 = document.documentElement.clientWidth
  const ch = Math.min(document.documentElement.clientHeight, cw0 * 900 / 512)
  const cw = ch * 512 / 900
  return { w: cw, h: ch }
}

export const fieldWH = (): { w: number, h: number } => {
  const { w } = clientWH()
  const fw = w * 0.95
  return { w: fw, h: fw * 9 / 5 * 0.7 }
}

export const border = (): number => {
  return clientWH().w / 256
}
