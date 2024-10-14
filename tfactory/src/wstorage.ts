import * as G from "./game"

// Array.new(25){[*?a..?z,*?A..?Z,*0..9].sample}.join+"."
const APP_WS_ID = "DNlosfxLXYeS1yi2qbB8lZWJy."

const storeWS = <T>(key: string, val: T) => {
  const s = localStorage;
  const wsKey = APP_WS_ID + key;
  s.setItem(wsKey, JSON.stringify(val));
}

const readWS = <T>(key: string, fallback: T): T => {
  const s = localStorage;
  const wsKey = APP_WS_ID + key;
  const i = s.getItem(wsKey)
  if (i == undefined) {
    return fallback
  }
  return JSON.parse(i);
}

class WSItem<T> {
  key: string
  fallback: T
  constructor(key: string, fallback: T) {
    this.key = key
    this.fallback = fallback
  }
  get value() {
    return readWS<T>(this.key, this.fallback)
  }
  write(val: T) {
    storeWS(this.key, val)
  }
}

export const soundOn = new WSItem<boolean>("soundOn", false)
export const world = new WSItem<G.World>("world", G.emptyWorld())
