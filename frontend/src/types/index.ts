// ===========================
// MotorSport P1 — Domain Types
// ===========================

// === Season & Schedule ===
export interface Season {
  year: number;
  totalRounds: number;
}

export interface Event {
  id: string;
  seasonYear: number;
  roundNumber: number;
  eventName: string;
  country: string;
  circuitKey: string;
  circuitName: string;
  eventDate: string; // ISO 8601
  eventFormat: "conventional" | "sprint" | "testing";
  sessions: SessionSummary[];
}

export interface SessionSummary {
  sessionType: SessionType;
  date: string;
  status: "upcoming" | "live" | "completed";
}

// === Session ===
export type SessionType = "FP1" | "FP2" | "FP3" | "Q" | "SQ" | "S" | "R";

export interface Session {
  id: string; // "2024_5_R"
  year: number;
  round: number;
  eventName: string;
  country: string;
  circuitKey: string;
  circuitName: string;
  sessionType: SessionType;
  date: string;
  totalLaps: number | null;
  isLoaded: boolean;
  drivers: DriverResult[];
}

// === Driver & Results ===
export interface DriverResult {
  driverNumber: string;
  abbreviation: string;
  fullName: string;
  team: string;
  teamColor: string; // "#3671C6"
  position: number | null;
  gridPosition: number | null;
  bestLapTime: string | null; // "1:28.256"
  bestLapTimeMs: number | null;
  status: string;
  points: number;
}

export interface Driver {
  driverNumber: string;
  abbreviation: string;
  fullName: string;
  team: string;
  teamColor: string;
  nationality: string;
  headshotUrl?: string;
}

// === Lap ===
export interface Lap {
  lapNumber: number;
  driver: string; // "VER"
  driverNumber: string;
  lapTime: number | null; // milliseconds
  sector1: number | null;
  sector2: number | null;
  sector3: number | null;
  stint: number;
  compound: TyreCompound;
  tyreLife: number;
  freshTyre: boolean;
  position: number | null;
  speedI1: number | null;
  speedI2: number | null;
  speedFL: number | null;
  speedST: number | null;
  isPersonalBest: boolean;
  deleted: boolean;
  trackStatus: string;
}

export type TyreCompound =
  | "SOFT"
  | "MEDIUM"
  | "HARD"
  | "INTERMEDIATE"
  | "WET";

// === Telemetry ===
export interface TelemetrySample {
  distance: number; // meters from start/finish
  time: number; // ms from lap start
  speed: number; // km/h
  throttle: number; // 0-100
  brake: boolean;
  rpm: number;
  gear: number;
  drs: number;
  x: number;
  y: number;
  z: number;
}

// === Stint ===
export interface Stint {
  stintNumber: number;
  driver: string;
  compound: TyreCompound;
  startLap: number;
  endLap: number;
  tyreAge: number;
  freshTyre: boolean;
  avgLapTime: number | null; // ms
  laps: number;
}

// === Track Map ===
export interface TrackMap {
  circuitKey: string;
  corners: Corner[];
  marshalSectors: { number: number; x: number; y: number }[];
  rotation: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface Corner {
  number: number;
  x: number;
  y: number;
  angle: number;
}

// === Compare ===
export interface CompareResult {
  drivers: Record<
    string,
    {
      telemetry: TelemetrySample[];
      bestLapTime: number;
    }
  >;
  delta: DeltaPoint[];
  trackMap: TrackMap;
}

export interface DeltaPoint {
  distance: number;
  deltaTime: number; // seconds, negative = driver1 ahead
}

export interface CornerDelta {
  number: number;
  delta: number; // seconds
  speed1: number;
  speed2: number;
}

// === Live Timing ===
export interface LiveTimingState {
  sessionStatus:
    | "Inactive"
    | "Started"
    | "Finished"
    | "Finalised"
    | "Aborted";
  trackStatus: string;
  timestamp: string;
  currentLap: number;
  totalLaps: number | null;
  drivers: LiveDriver[];
  raceControlMessages: RaceControlMessage[];
}

export interface LiveDriver {
  driverNumber: string;
  abbreviation: string;
  team: string;
  teamColor: string;
  position: number;
  lastLapTime: string | null;
  bestLapTime: string | null;
  sector1: SectorTiming | null;
  sector2: SectorTiming | null;
  sector3: SectorTiming | null;
  gap: string | null;
  interval: string | null;
  inPit: boolean;
  pitCount: number;
  retired: boolean;
  compound: TyreCompound | null;
  tyreAge: number | null;
}

export interface SectorTiming {
  time: string;
  status: "purple" | "green" | "yellow" | "white";
}

export interface RaceControlMessage {
  utc: string;
  category: string;
  message: string;
  flag: string | null;
}

// === Standings ===
export interface DriverStanding {
  position: number;
  driver: string;
  driverAbbr: string;
  team: string;
  teamColor: string;
  points: number;
  wins: number;
  nationality: string;
}

export interface ConstructorStanding {
  position: number;
  constructor: string;
  teamColor: string;
  points: number;
  wins: number;
}

// === Weather ===
export interface Weather {
  airTemp: number;
  trackTemp: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  rainfall: boolean;
}

// === Favorites ===
export interface Favorite {
  id: string;
  entityType: "driver" | "team" | "circuit" | "session";
  entityKey: string;
  label: string;
  createdAt: string;
}

// === Utility Types ===
export type CompoundColor = Record<TyreCompound, string>;

export const COMPOUND_COLORS: CompoundColor = {
  SOFT: "#ff3333",
  MEDIUM: "#ffd700",
  HARD: "#f0f0f0",
  INTERMEDIATE: "#00cc00",
  WET: "#0066ff",
};

export const TEAM_COLORS: Record<string, string> = {
  "Red Bull Racing": "#3671C6",
  "Ferrari": "#E8002D",
  "McLaren": "#FF8000",
  "Mercedes": "#27F4D2",
  "Aston Martin": "#229971",
  "Alpine": "#FF87BC",
  "Williams": "#64C4FF",
  "Haas F1 Team": "#B6BABD",
  "RB": "#6692FF",
  "Kick Sauber": "#52E252",
};

// Helper to format lap time from ms
export function formatLapTime(ms: number | null): string {
  if (ms === null) return "—";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${millis
      .toString()
      .padStart(3, "0")}`;
  }
  return `${seconds}.${millis.toString().padStart(3, "0")}`;
}

// Helper to format delta
export function formatDelta(seconds: number): string {
  const sign = seconds >= 0 ? "+" : "";
  return `${sign}${seconds.toFixed(3)}`;
}

// Session type display names
export const SESSION_NAMES: Record<SessionType, string> = {
  FP1: "Practice 1",
  FP2: "Practice 2",
  FP3: "Practice 3",
  Q: "Qualifying",
  SQ: "Sprint Qualifying",
  S: "Sprint",
  R: "Race",
};
