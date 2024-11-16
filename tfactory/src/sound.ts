import * as WS from "./wstorage";

export const play = (t: string) => {
  if (WS.soundOn.value) {
    const e = document.getElementById(`sound.${t}`) as HTMLAudioElement;
    console.log({ t: t, e: e })
    if (e) {
      const v = e.getAttribute("volume")
      e.volume = v ? parseFloat(v) : 1
      e.play()
    }
  }
}

export const stopAll = () => {
  const s = document.getElementById("sounds") as HTMLElement
  s?.childNodes?.forEach((e0) => {
    const e = e0 as HTMLAudioElement
    if (e.tagName == "AUDIO") {
      e.pause()
      e.currentTime = 0
    }
  })
}
