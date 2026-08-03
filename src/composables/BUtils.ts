//export function B() {
export const B = {
  ts: (d: string) => {
    if (!d) return "";
    const date = new Date(d);

    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // Break the date down into raw layout tokens
    const parts = formatter.formatToParts(date);
    const p = Object.fromEntries(parts.map((item) => [item.type, item.value]));

    // Extract the first letter of AM/PM and lowercase it ("AM" -> "a")
    const amPmMarker = p.dayPeriod ? p.dayPeriod.charAt(0).toLowerCase() : "";

    // Assemble your exact pattern string
    const finalString = `${p.month} ${p.day}, ${p.year} ${p.hour}:${p.minute}:${p.second}${amPmMarker}`;

    return finalString;
    // Output: "Jul 30, 2026 08:12:10a"
  },

  plural: (n: number, singular: string, plural?: string) => {
    return n === 1 ? singular : plural || `${singular}s`;
  },
};
