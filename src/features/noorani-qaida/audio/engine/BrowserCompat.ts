export type BrowserFamily = "chrome" | "safari" | "edge" | "firefox" | "samsung" | "other";
export type DeviceOs = "ios" | "android" | "windows" | "mac" | "other";

export interface BrowserProfile {
  family: BrowserFamily;
  os: DeviceOs;
  supportsSpeechSynthesis: boolean;
  requiresUserGesture: boolean;
  needsResumeWatch: boolean;
  preferLocalVoices: boolean;
}

export function detectBrowserProfile(): BrowserProfile {
  if (typeof navigator === "undefined") {
    return {
      family: "other",
      os: "other",
      supportsSpeechSynthesis: false,
      requiresUserGesture: true,
      needsResumeWatch: false,
      preferLocalVoices: true,
    };
  }

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouch = navigator.maxTouchPoints || 0;

  const isIPad = /iPad/i.test(ua) || (platform === "MacIntel" && maxTouch > 1);
  const isIPhone = /iPhone|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isWindows = /Windows/i.test(ua);
  const isMac = /Mac/i.test(ua) && !isIPad;

  let os: DeviceOs = "other";
  if (isIPhone || isIPad) os = "ios";
  else if (isAndroid) os = "android";
  else if (isWindows) os = "windows";
  else if (isMac) os = "mac";

  let family: BrowserFamily = "other";
  if (/Edg\//i.test(ua)) family = "edge";
  else if (/SamsungBrowser/i.test(ua)) family = "samsung";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) family = "chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) family = "safari";
  else if (/Firefox\//i.test(ua)) family = "firefox";

  const supportsSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

  return {
    family,
    os,
    supportsSpeechSynthesis,
    requiresUserGesture: os === "ios" || os === "android" || family === "safari",
    needsResumeWatch: family === "chrome" || family === "edge",
    preferLocalVoices: true,
  };
}
