import { Amiri, Plus_Jakarta_Sans } from "next/font/google";

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-hq-body",
  display: "swap",
});

const quran = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-hq-quran",
  display: "swap",
  preload: false,
});

export const holyQuranFontVariables = `${body.variable} ${quran.variable}`;
