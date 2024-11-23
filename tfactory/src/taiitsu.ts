import { ttag } from "./appconst";
import * as W from "./World"

export const taiitsu = (wo: W.World, duration: number, lines: string[]): void => {
  const text = [
    `#${ttag}`,
    ...lines,
    (wo.maxMagic <= 1 ? `期間 ${duration}` : `期間 ${duration} (転生 ${wo.maxMagic - 1})`),
    window.location
  ].join("\n")
  const encoded = encodeURIComponent(text);
  const url = "https://taittsuu.com/share?text=" + encoded;
  if (!window.open(url)) {
    location.href = url;
  }
}
