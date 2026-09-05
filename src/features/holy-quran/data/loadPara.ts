import type { ParaFile, QuranAyah } from "../types";

const loaders: Record<number, () => Promise<{ default: ParaFile }>> = {
  1: () => import("./paras/para-01.json"),
  2: () => import("./paras/para-02.json"),
  3: () => import("./paras/para-03.json"),
  4: () => import("./paras/para-04.json"),
  5: () => import("./paras/para-05.json"),
  6: () => import("./paras/para-06.json"),
  7: () => import("./paras/para-07.json"),
  8: () => import("./paras/para-08.json"),
  9: () => import("./paras/para-09.json"),
  10: () => import("./paras/para-10.json"),
  11: () => import("./paras/para-11.json"),
  12: () => import("./paras/para-12.json"),
  13: () => import("./paras/para-13.json"),
  14: () => import("./paras/para-14.json"),
  15: () => import("./paras/para-15.json"),
  16: () => import("./paras/para-16.json"),
  17: () => import("./paras/para-17.json"),
  18: () => import("./paras/para-18.json"),
  19: () => import("./paras/para-19.json"),
  20: () => import("./paras/para-20.json"),
  21: () => import("./paras/para-21.json"),
  22: () => import("./paras/para-22.json"),
  23: () => import("./paras/para-23.json"),
  24: () => import("./paras/para-24.json"),
  25: () => import("./paras/para-25.json"),
  26: () => import("./paras/para-26.json"),
  27: () => import("./paras/para-27.json"),
  28: () => import("./paras/para-28.json"),
  29: () => import("./paras/para-29.json"),
  30: () => import("./paras/para-30.json"),
};

const cache = new Map<number, ParaFile>();

/** Strip file BOM only. Never alter Arabic letters or harakat. */
export function stripFileBom(text: string): string {
  return text.replace(/^\uFEFF/, "");
}

export async function loadPara(juz: number): Promise<ParaFile> {
  const cached = cache.get(juz);
  if (cached) return cached;
  const loader = loaders[juz];
  if (!loader) throw new Error(`Unknown para ${juz}`);
  const mod = await loader();
  const file = (mod.default ?? mod) as ParaFile;
  const cleaned: ParaFile = {
    juz: file.juz,
    ayahs: file.ayahs.map((ayah: QuranAyah) => ({
      ...ayah,
      text: stripFileBom(ayah.text),
    })),
  };
  cache.set(juz, cleaned);
  return cleaned;
}

export function recitationUrl(globalAyah: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyah}.mp3`;
}
