export const PAKISTAN_TIMEZONE = "Asia/Karachi";

export const TIMEZONE_OPTIONS = [
  { country: "Pakistan", timezone: "Asia/Karachi", label: "Pakistan - PKT (Asia/Karachi)", aliases: ["pk"] },
  { country: "Nigeria", timezone: "Africa/Lagos", label: "Nigeria - WAT (Africa/Lagos)", aliases: ["lagos", "abuja", "port harcourt", "kano", "ng"] },
  { country: "Finland", timezone: "Europe/Helsinki", label: "Finland - EET (Europe/Helsinki)", aliases: ["helsinki", "espoo", "fi", "finnish"] },
  { country: "Denmark", timezone: "Europe/Copenhagen", label: "Denmark - CET (Europe/Copenhagen)", aliases: ["copenhagen", "aarhus", "dk", "danish"] },
  { country: "United Kingdom", timezone: "Europe/London", label: "United Kingdom - London", aliases: ["uk", "britain", "england"] },
  { country: "United States Eastern", timezone: "America/New_York", label: "USA - Eastern Time", aliases: ["usa", "us", "united states"] },
  { country: "United States Central", timezone: "America/Chicago", label: "USA - Central Time" },
  { country: "United States Pacific", timezone: "America/Los_Angeles", label: "USA - Pacific Time" },
  { country: "Canada Eastern", timezone: "America/Toronto", label: "Canada - Toronto" },
  { country: "Canada Pacific", timezone: "America/Vancouver", label: "Canada - Vancouver" },
  { country: "Australia", timezone: "Australia/Sydney", label: "Australia - Sydney" },
  { country: "UAE", timezone: "Asia/Dubai", label: "UAE - Dubai", aliases: ["dubai", "emirates", "united arab emirates"] },
  { country: "Dubai", timezone: "Asia/Dubai", label: "Dubai - Gulf Time (Asia/Dubai)", aliases: ["uae"] },
  { country: "Saudi Arabia", timezone: "Asia/Riyadh", label: "Saudi Arabia - Riyadh", aliases: ["saudia", "saudi", "ksa", "riyadh"] },
  { country: "Qatar", timezone: "Asia/Qatar", label: "Qatar - Doha" },
  { country: "Kuwait", timezone: "Asia/Kuwait", label: "Kuwait" },
  { country: "Germany", timezone: "Europe/Berlin", label: "Germany - Berlin" },
  { country: "France", timezone: "Europe/Paris", label: "France - Paris" },
  { country: "Netherlands", timezone: "Europe/Amsterdam", label: "Netherlands - Amsterdam" },
  { country: "India", timezone: "Asia/Kolkata", label: "India - IST" },
  { country: "Bangladesh", timezone: "Asia/Dhaka", label: "Bangladesh - Dhaka" },
  { country: "South Africa", timezone: "Africa/Johannesburg", label: "South Africa - Johannesburg" },
];

export function timezoneForCountry(country?: string | null) {
  if (!country) return "";
  const lower = country.toLowerCase().trim();
  const namesOf = (option: (typeof TIMEZONE_OPTIONS)[number]) =>
    [option.country, ...(option.aliases || [])].map((name) => name.toLowerCase());

  const exact = TIMEZONE_OPTIONS.find((option) => namesOf(option).includes(lower));
  if (exact) return exact.timezone;
  if (lower.length < 3) return "";

  return TIMEZONE_OPTIONS.find((option) =>
    namesOf(option).some((name) => name.includes(lower) || lower.includes(name))
  )?.timezone || "";
}

export function formatTimeInZone(value: string | Date, timezone = PAKISTAN_TIMEZONE) {
  const date = value instanceof Date ? value : new Date(value);
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }
}

export function formatTimePair(value: string | Date, localTimezone?: string | null) {
  const timezone = localTimezone || PAKISTAN_TIMEZONE;
  return {
    local: formatTimeInZone(value, timezone),
    pkt: formatTimeInZone(value, PAKISTAN_TIMEZONE),
    timezone,
  };
}

export const WEEK_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function formatClock(value: string) {
  const [hours, minutes] = value.split(":");
  const hourNumber = Number(hours || 0);
  const displayHour = hourNumber % 12 || 12;
  const suffix = hourNumber >= 12 ? "PM" : "AM";
  return `${displayHour}:${minutes?.padStart(2, "0")} ${suffix}`;
}

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? "00" : "30";
  const value = `${String(hours).padStart(2, "0")}:${minutes}`;
  return { value, label: formatClock(value) };
});

export function getNextDateForDay(dayOfWeek: number) {
  const date = new Date();
  const diff = (dayOfWeek - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function timezoneOffsetMs(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const utcLike = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );
  return utcLike - date.getTime();
}

export function localWallTimeToDate(dayOfWeek: number, time: string, timezone: string) {
  const base = getNextDateForDay(dayOfWeek);
  const [hours, minutes] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hours || 0,
    minutes || 0,
    0
  ));
  const offset = timezoneOffsetMs(utcGuess, timezone);
  return new Date(utcGuess.getTime() - offset);
}

export function getZonedDayAndMinutes(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    dayOfWeek: dayMap[values.weekday] ?? 0,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}
