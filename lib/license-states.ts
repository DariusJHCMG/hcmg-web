export type LicenseStatus = "active" | "coming_soon" | "unavailable";

export const STATE_NAMES: Record<string, string> = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California", CO:"Colorado",
  CT:"Connecticut", DC:"Washington D.C.", DE:"Delaware", FL:"Florida", GA:"Georgia",
  HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa", KS:"Kansas", KY:"Kentucky",
  LA:"Louisiana", ME:"Maine", MD:"Maryland", MA:"Massachusetts", MI:"Michigan", MN:"Minnesota",
  MS:"Mississippi", MO:"Missouri", MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire",
  NJ:"New Jersey", NM:"New Mexico", NY:"New York", NC:"North Carolina", ND:"North Dakota",
  OH:"Ohio", OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina",
  SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont", VA:"Virginia",
  WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming",
};
export const STATE_CODES = Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));
export const DEFAULT_ACTIVE_STATES = ["FL","TX","GA","NV","CO","VA","DC","MD","CA","MS"];
export const DEFAULT_COMING_SOON_STATES = ["OH","MI","AL","OR","NJ","TN","NC","SC","IL","IN","OK","NM","AZ","PA"];

export function normalizeLicenseStates(value?: Partial<Record<string, LicenseStatus>>): Record<string, LicenseStatus> {
  return Object.fromEntries(STATE_CODES.map(code => [code, value?.[code]
    ?? (DEFAULT_ACTIVE_STATES.includes(code) ? "active" : DEFAULT_COMING_SOON_STATES.includes(code) ? "coming_soon" : "unavailable")])) as Record<string, LicenseStatus>;
}

export function licenseStateLists(value?: Partial<Record<string, LicenseStatus>>) {
  const states = normalizeLicenseStates(value);
  return { states, active: STATE_CODES.filter(c => states[c] === "active"), comingSoon: STATE_CODES.filter(c => states[c] === "coming_soon"), unavailable: STATE_CODES.filter(c => states[c] === "unavailable") };
}
