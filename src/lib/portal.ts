export const MONTH_NAMES = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatStudentLevel(level?: string | null) {
  if (!level) return "Beginner";
  return level
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatCurrency(amount: number, currency = "USD") {
  const numeric = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch {
    return `${currency} ${numeric.toFixed(0)}`;
  }
}

export function formatFeePeriod(month?: number | null, year?: number | null) {
  if (!month || !year) return "Custom invoice";
  return `${MONTH_NAMES[month] || `Month ${month}`} ${year}`;
}

export function getSessionSubject(course?: string | null, notes?: string | null) {
  if (course) return course;
  if (notes) return notes.split(" - ")[0];
  return "Quran Class";
}

export type ProgressPeriod = "today" | "week" | "month" | "all";

export const PROGRESS_PERIODS: { value: ProgressPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

export function getPeriodRange(period: ProgressPeriod) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "week") {
    const day = start.getDay();
    const diffFromMonday = (day + 6) % 7;
    start.setDate(start.getDate() - diffFromMonday);
  } else if (period === "month") {
    start.setDate(1);
  } else if (period === "all") {
    start.setFullYear(2000);
  }

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function isWithinPeriod(value: string | Date | null | undefined, period: ProgressPeriod) {
  if (!value) return false;
  const { start, end } = getPeriodRange(period);
  const date = value instanceof Date ? value : new Date(value);
  return date >= start && date <= end;
}
