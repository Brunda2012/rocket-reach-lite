export const REGIONS: Record<string, string[]> = {
  "North America": ["United States", "Canada", "Mexico"],
  "Europe": [
    "United Kingdom", "Germany", "France", "Netherlands", "Sweden", "Denmark",
    "Norway", "Finland", "Switzerland", "Ireland", "Spain", "Italy", "Poland",
    "Austria", "Belgium", "Czech Republic", "Portugal",
  ],
  "Asia": [
    "India", "Japan", "South Korea", "China", "Singapore", "Indonesia",
    "Thailand", "Vietnam", "Malaysia", "Philippines",
  ],
  "South America": ["Brazil", "Argentina", "Chile", "Colombia"],
  "Africa": ["South Africa", "Nigeria", "Kenya", "Egypt"],
  "Oceania": ["Australia", "New Zealand"],
  "Middle East": ["Israel", "UAE", "Saudi Arabia", "Turkey"],
};

export const ALL_REGIONS = ["All Regions", ...Object.keys(REGIONS)];

export const ALL_COUNTRIES = [
  "All Countries",
  ...Object.values(REGIONS).flat().sort(),
];

export function countriesForRegion(region: string): string[] | undefined {
  if (region === "All Regions") return undefined;
  return REGIONS[region];
}

export function regionForCountry(country: string): string | undefined {
  for (const [region, countries] of Object.entries(REGIONS)) {
    if (countries.includes(country)) return region;
  }
  return undefined;
}
