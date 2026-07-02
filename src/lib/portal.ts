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
