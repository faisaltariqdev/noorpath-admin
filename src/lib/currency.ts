/** Map student/parent country labels to ISO currency codes. */
export function currencyForCountry(country?: string | null): string {
  if (!country) return "USD";
  const c = country.toLowerCase().trim();

  if (
    c.includes("united kingdom")
    || c === "uk"
    || c.includes("britain")
    || c.includes("england")
    || c.includes("scotland")
    || c.includes("wales")
  ) {
    return "GBP";
  }
  if (c.includes("euro") || c.includes("germany") || c.includes("france") || c.includes("netherlands") || c.includes("ireland") || c.includes("spain") || c.includes("italy")) {
    return "EUR";
  }
  if (c.includes("pakistan") || c === "pk") return "PKR";
  if (c.includes("uae") || c.includes("dubai") || c.includes("emirates")) return "AED";
  if (c.includes("saudi")) return "SAR";
  if (c.includes("qatar")) return "QAR";
  if (c.includes("kuwait")) return "KWD";
  if (c.includes("canada")) return "CAD";
  if (c.includes("australia")) return "AUD";
  if (c.includes("india")) return "INR";
  if (c.includes("bangladesh")) return "BDT";
  if (c.includes("south africa")) return "ZAR";
  if (c.includes("united states") || c.includes("usa") || c === "us" || c.includes("america")) {
    return "USD";
  }

  return "USD";
}

export function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}
