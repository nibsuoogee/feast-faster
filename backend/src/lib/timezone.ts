export function convertToHelsinki(date: Date): Date {
  const formatter = new Intl.DateTimeFormat("fi-FI", {
    timeZone: "Europe/Helsinki",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  const helsinkiString = `${get("year")}-${get("month")}-${get("day")}T${get(
    "hour"
  )}:${get("minute")}:${get("second")}`;

  return new Date(helsinkiString);
}
