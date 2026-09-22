const dateOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

/** Uses the application-wide date format, for example: Sep 21, 2026. */
export function formatDate(value: Date | string | number): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", dateOptions).format(date);
}

export function formatTime(value: Date | string | number): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(date);
}
