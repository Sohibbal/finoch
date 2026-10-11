import { shortDate } from "@/lib/format";

/** Glue a date's words with no-break spaces so "Kam, 8 Okt" never splits across lines. */
export const unbreakable = (text: string) => text.replace(/ /g, " ");

/** shortDate for print: the day, date and month always stay on one line. */
export const printDate = (value: Date | string) => unbreakable(shortDate(value));
