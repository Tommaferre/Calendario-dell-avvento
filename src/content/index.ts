import rawContent from "./advent-content.json";
import appConfig from "../../config/app.json";
import { validateAdventContent, type AdventContent, type DayContent } from "./types";

export const content = rawContent as AdventContent;
export const config = appConfig as {
  year: number;
  timezone: string;
  appTitle: string;
  dedication: string;
  publicUrl: string;
  repository: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
  reminderTime: string;
  finalDay: number;
};

if (import.meta.env.DEV) {
  const issues = validateAdventContent(content);
  if (issues.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      "[advent-content] Trovati problemi di validazione nei contenuti:",
      issues
    );
  }
}

export function getDayContent(day: number): DayContent | undefined {
  return content.days.find((entry) => entry.day === day);
}

export function assetUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${relativePath}`.replace(/\/{2,}/g, "/").replace(":/", "://");
}
