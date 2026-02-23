import { Lap, Stint, DriverResult, Session } from "@/types";

export const mockSession: Session = {
    id: "2024_5_R",
    year: 2024,
    round: 5,
    eventName: "Chinese Grand Prix",
    country: "China",
    circuitKey: "shanghai",
    circuitName: "Shanghai International Circuit",
    sessionType: "R",
    date: "2024-04-21T07:00:00Z",
    totalLaps: 56,
    isLoaded: true,
    drivers: [],
};

export const mockDriverResults: DriverResult[] = [
    { driverNumber: "1", abbreviation: "VER", fullName: "Max Verstappen", team: "Red Bull Racing", teamColor: "#3671C6", position: 1, gridPosition: 1, bestLapTime: "1:37.845", bestLapTimeMs: 97845, status: "Finished", points: 25 },
    { driverNumber: "4", abbreviation: "NOR", fullName: "Lando Norris", team: "McLaren", teamColor: "#FF8000", position: 2, gridPosition: 4, bestLapTime: "1:37.942", bestLapTimeMs: 97942, status: "Finished", points: 18 },
    { driverNumber: "16", abbreviation: "LEC", fullName: "Charles Leclerc", team: "Ferrari", teamColor: "#E8002D", position: 3, gridPosition: 3, bestLapTime: "1:38.101", bestLapTimeMs: 98101, status: "Finished", points: 15 },
    { driverNumber: "11", abbreviation: "PER", fullName: "Sergio Pérez", team: "Red Bull Racing", teamColor: "#3671C6", position: 4, gridPosition: 2, bestLapTime: "1:38.256", bestLapTimeMs: 98256, status: "Finished", points: 12 },
    { driverNumber: "81", abbreviation: "PIA", fullName: "Oscar Piastri", team: "McLaren", teamColor: "#FF8000", position: 5, gridPosition: 5, bestLapTime: "1:38.312", bestLapTimeMs: 98312, status: "Finished", points: 10 },
    { driverNumber: "55", abbreviation: "SAI", fullName: "Carlos Sainz", team: "Ferrari", teamColor: "#E8002D", position: 6, gridPosition: 6, bestLapTime: "1:38.475", bestLapTimeMs: 98475, status: "Finished", points: 8 },
    { driverNumber: "44", abbreviation: "HAM", fullName: "Lewis Hamilton", team: "Mercedes", teamColor: "#27F4D2", position: 7, gridPosition: 8, bestLapTime: "1:38.598", bestLapTimeMs: 98598, status: "Finished", points: 6 },
    { driverNumber: "63", abbreviation: "RUS", fullName: "George Russell", team: "Mercedes", teamColor: "#27F4D2", position: 8, gridPosition: 7, bestLapTime: "1:38.654", bestLapTimeMs: 98654, status: "Finished", points: 4 },
    { driverNumber: "14", abbreviation: "ALO", fullName: "Fernando Alonso", team: "Aston Martin", teamColor: "#229971", position: 9, gridPosition: 9, bestLapTime: "1:38.890", bestLapTimeMs: 98890, status: "Finished", points: 2 },
    { driverNumber: "18", abbreviation: "STR", fullName: "Lance Stroll", team: "Aston Martin", teamColor: "#229971", position: 10, gridPosition: 12, bestLapTime: "1:39.012", bestLapTimeMs: 99012, status: "Finished", points: 1 },
];

// Generate realistic lap data for a race
function generateLaps(driver: string, driverNumber: string, totalLaps: number, basePace: number, compound: "SOFT" | "MEDIUM" | "HARD"): Lap[] {
    const laps: Lap[] = [];
    let currentStint = 1;
    let tyreLife = 1;

    for (let i = 1; i <= totalLaps; i++) {
        // Simulate pit stops
        if (i === 18 && compound !== "HARD") {
            currentStint = 2;
            tyreLife = 1;
        }
        if (i === 38) {
            currentStint = 3;
            tyreLife = 1;
        }

        const degradation = tyreLife * 0.035 * 1000; // ms per lap of deg
        const fuelEffect = (totalLaps - i) * 0.06 * 1000; // lighter = faster
        const variation = (Math.random() - 0.5) * 600; // ±300ms random variation
        const isPitLap = i === 18 || i === 38;
        const lapTime = isPitLap
            ? basePace + 22000 + variation // pit stop ~22s penalty
            : basePace + degradation - fuelEffect + variation;

        const s1Ratio = 0.28;
        const s2Ratio = 0.42;
        const s3Ratio = 0.30;

        const currentCompound = currentStint === 1 ? "MEDIUM" : currentStint === 2 ? "HARD" : "SOFT";

        laps.push({
            lapNumber: i,
            driver,
            driverNumber,
            lapTime: Math.round(lapTime),
            sector1: Math.round(lapTime * s1Ratio + (Math.random() - 0.5) * 200),
            sector2: Math.round(lapTime * s2Ratio + (Math.random() - 0.5) * 200),
            sector3: Math.round(lapTime * s3Ratio + (Math.random() - 0.5) * 200),
            stint: currentStint,
            compound: currentCompound,
            tyreLife,
            freshTyre: tyreLife === 1,
            position: null,
            speedI1: 295 + Math.random() * 15,
            speedI2: 280 + Math.random() * 20,
            speedFL: 310 + Math.random() * 10,
            speedST: 325 + Math.random() * 8,
            isPersonalBest: false,
            deleted: false,
            trackStatus: "1",
        });

        tyreLife++;
    }

    return laps;
}

export const mockLapsVER = generateLaps("VER", "1", 56, 97500, "MEDIUM");
export const mockLapsNOR = generateLaps("NOR", "4", 56, 97700, "MEDIUM");
export const mockLapsLEC = generateLaps("LEC", "16", 56, 97900, "MEDIUM");
export const mockLapsHAM = generateLaps("HAM", "44", 56, 98400, "MEDIUM");

export const mockAllLaps: Lap[] = [
    ...mockLapsVER,
    ...mockLapsNOR,
    ...mockLapsLEC,
    ...mockLapsHAM,
];

export const mockStints: Stint[] = [
    { stintNumber: 1, driver: "VER", compound: "MEDIUM", startLap: 1, endLap: 17, tyreAge: 17, freshTyre: true, avgLapTime: 97850, laps: 17 },
    { stintNumber: 2, driver: "VER", compound: "HARD", startLap: 18, endLap: 37, tyreAge: 20, freshTyre: true, avgLapTime: 98200, laps: 20 },
    { stintNumber: 3, driver: "VER", compound: "SOFT", startLap: 38, endLap: 56, tyreAge: 19, freshTyre: true, avgLapTime: 97600, laps: 19 },
    { stintNumber: 1, driver: "NOR", compound: "MEDIUM", startLap: 1, endLap: 17, tyreAge: 17, freshTyre: true, avgLapTime: 98050, laps: 17 },
    { stintNumber: 2, driver: "NOR", compound: "HARD", startLap: 18, endLap: 37, tyreAge: 20, freshTyre: true, avgLapTime: 98350, laps: 20 },
    { stintNumber: 3, driver: "NOR", compound: "SOFT", startLap: 38, endLap: 56, tyreAge: 19, freshTyre: true, avgLapTime: 97800, laps: 19 },
    { stintNumber: 1, driver: "LEC", compound: "MEDIUM", startLap: 1, endLap: 17, tyreAge: 17, freshTyre: true, avgLapTime: 98250, laps: 17 },
    { stintNumber: 2, driver: "LEC", compound: "HARD", startLap: 18, endLap: 37, tyreAge: 20, freshTyre: true, avgLapTime: 98500, laps: 20 },
    { stintNumber: 3, driver: "LEC", compound: "SOFT", startLap: 38, endLap: 56, tyreAge: 19, freshTyre: true, avgLapTime: 98000, laps: 19 },
    { stintNumber: 1, driver: "HAM", compound: "MEDIUM", startLap: 1, endLap: 17, tyreAge: 17, freshTyre: true, avgLapTime: 98700, laps: 17 },
    { stintNumber: 2, driver: "HAM", compound: "HARD", startLap: 18, endLap: 37, tyreAge: 20, freshTyre: true, avgLapTime: 98900, laps: 20 },
    { stintNumber: 3, driver: "HAM", compound: "SOFT", startLap: 38, endLap: 56, tyreAge: 19, freshTyre: true, avgLapTime: 98400, laps: 19 },
];
