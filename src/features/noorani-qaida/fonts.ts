import { Amiri, Fredoka, Nunito } from "next/font/google";

const display = Fredoka({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-qaida-display",
  display: "swap",
});

const body = Nunito({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-qaida-body",
  display: "swap",
});

const arabic = Amiri({
  subsets: ["arabic", "latin"],
  weight: "700",
  variable: "--font-qaida-arabic",
  display: "swap",
  preload: false,
});

export const qaidaFontVariables = `${display.variable} ${body.variable} ${arabic.variable}`;
