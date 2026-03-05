const ERA_TABLE: { name: string; abbr: string; startYear: number }[] = [
  { name: "令和", abbr: "R", startYear: 2019 },
  { name: "平成", abbr: "H", startYear: 1989 },
  { name: "昭和", abbr: "S", startYear: 1926 },
  { name: "大正", abbr: "T", startYear: 1912 },
  { name: "明治", abbr: "M", startYear: 1868 },
];

/**
 * Parse a wareki string like "昭和33" or "S33" into a western year.
 * Returns null if not parseable.
 */
export function warekiToSeireki(input: string): number | null {
  const trimmed = input.trim();
  for (const era of ERA_TABLE) {
    const patterns = [
      new RegExp(`^${era.name}(\\d+)$`),
      new RegExp(`^${era.abbr}(\\d+)$`, "i"),
    ];
    for (const pat of patterns) {
      const m = trimmed.match(pat);
      if (m) {
        const eraYear = parseInt(m[1], 10);
        if (eraYear >= 1) {
          return era.startYear + eraYear - 1;
        }
      }
    }
  }
  return null;
}

/**
 * Try to parse input as either a western year or a wareki year.
 */
export function parseYearInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Pure number = western year
  if (/^\d{4}$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }

  // Try wareki
  const wareki = warekiToSeireki(trimmed);
  if (wareki) return wareki;

  // Partial number
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num > 0) return num;

  return null;
}

/**
 * Format a year for display, showing both western and wareki.
 */
export function formatYear(year: number): string {
  for (const era of ERA_TABLE) {
    if (year >= era.startYear) {
      const eraYear = year - era.startYear + 1;
      return `${year}年（${era.name}${eraYear}年）`;
    }
  }
  return `${year}年`;
}
