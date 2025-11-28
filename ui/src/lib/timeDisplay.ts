// ui/src/lib/timeDisplay.ts
export const HELSINKI_TZ = "Europe/Helsinki";

/**
 * Display a UTC date/time in Helsinki timezone for the user
 */
export const displayInHelsinki = (utcDate: Date | string): string => {
  const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
  return date.toLocaleString("fi-FI", {
    timeZone: HELSINKI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Display time only in Helsinki timezone
 */
export const displayTimeInHelsinki = (utcDate: Date | string): string => {
  const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
  return date.toLocaleString("fi-FI", {
    timeZone: HELSINKI_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Display date only in Helsinki timezone
 */
export const displayDateInHelsinki = (utcDate: Date | string): string => {
  const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
  return date.toLocaleString("fi-FI", {
    timeZone: HELSINKI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
