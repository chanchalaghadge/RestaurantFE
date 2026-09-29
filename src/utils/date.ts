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

/** Uses a compact Indian date and 12-hour time format, for example: 25 Sep 2026, 2:45 pm. */
export function formatDateTime(value: Date | string | number): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}
