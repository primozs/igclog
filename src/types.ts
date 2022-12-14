export type Options = {
  skipPrompts: boolean;
  onlyFindIGCFiles: boolean;
  deleteMeta: boolean;
  help: boolean;
  version: boolean;
  directory: string | undefined;
  auth: boolean;
  username: string | undefined;
  password: string | undefined;
  elevations: boolean;
  configuration: boolean;
  pilot: string | undefined;
  glider: string | undefined;
  storeDefaultDir: boolean;
  displaySettings: boolean;
  setInitialValues: boolean;
  distance: number | undefined;
  duration: number | undefined;
  flights: number | undefined;
  generateCsv: boolean;
  recalculateFrom: boolean;
  recYear: number | undefined;
  recMonth: number | undefined;
  recDay: number | undefined;
  watchMode: boolean;
};

export type FlightMetaCu = {
  distance: number;
  duration: number;
  flight_date: string;
  glider: string;
  landing_date: string;
  landing_location: string;
  max_altitude: string;
  pilot: string;
  takeoff_date: string;
  takeoff_location: string;
  timezone: number;
  filename: string;
  best_thermal_avg_vario: number;
  competition_number: string;
  glider_registration: string;
  sport: string;
  favorite: boolean;
};

export type FlightMeta = {
  distance: number;
  duration: number | null;
  date: string;
  glider: string | null;
  landing_date: string | null;
  landing_pos: number[] | null;
  landing_location: string;
  max_altitude: number | null;
  pilot: string | null;
  copilot: string | null;
  takeoff_date: string | null;
  takeoff_pos: number[] | null;
  takeoff_location: string;
  timezone: number | null;
  filename: string;
  filepath: string | null;
  numFlight: number | null;
  registration: string | null;
  callsign: string | null;
  competitionClass: string | null;
  loggerId: string | null;
  loggerManufacturer: string | null;
  xcDistance: number | null;
  xcScore: number | null;
  xcType: string | null;
  xcCode: string | null;
  best_thermal_avg_vario: number | null;
  sport: string | null;
  favorite: boolean;
};

export type Config = {
  accessToken: string | null | undefined;
  pilot: string | null | undefined;
  glider: string | null | undefined;
  directory: string | null | undefined;
  distance: number;
  duration: number;
  flights: number;
};
