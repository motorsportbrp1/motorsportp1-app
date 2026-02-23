import { TelemetrySample, CompareResult, CornerDelta, DeltaPoint } from "@/types";

// Generate synthetic telemetry for a lap (~4.3km track)
function generateTelemetry(driverKey: string, basePace: number): TelemetrySample[] {
    const samples: TelemetrySample[] = [];
    const trackLength = 5451; // Shanghai track length in meters
    const numSamples = 300;

    for (let i = 0; i < numSamples; i++) {
        const distance = (i / numSamples) * trackLength;
        const progress = i / numSamples;

        // Simulate speed profile with corners and straights
        let speed: number;
        const cornerZones = [0.08, 0.15, 0.22, 0.30, 0.38, 0.45, 0.52, 0.60, 0.68, 0.75, 0.82, 0.90, 0.95];
        const isCorner = cornerZones.some(c => Math.abs(progress - c) < 0.02);

        if (isCorner) {
            speed = 80 + Math.random() * 60 + (driverKey === "VER" ? 3 : 0);
        } else {
            speed = 260 + Math.random() * 60 + (driverKey === "VER" ? 2 : 0);
        }

        const throttle = isCorner ? 20 + Math.random() * 30 : 90 + Math.random() * 10;
        const brake = isCorner && Math.random() > 0.3;

        samples.push({
            distance,
            time: (basePace / trackLength) * distance,
            speed: Math.round(speed * 10) / 10,
            throttle: Math.round(throttle),
            brake,
            rpm: Math.round(8000 + speed * 20 + Math.random() * 1000),
            gear: isCorner ? Math.floor(2 + Math.random() * 3) : Math.floor(6 + Math.random() * 2),
            drs: !isCorner && progress > 0.5 && progress < 0.7 ? 1 : 0,
            x: Math.cos(progress * Math.PI * 2) * 500 + Math.sin(progress * 3) * 200,
            y: Math.sin(progress * Math.PI * 2) * 400 + Math.cos(progress * 5) * 150,
            z: 0,
        });
    }

    return samples;
}

export const mockTelemetryVER = generateTelemetry("VER", 97845);
export const mockTelemetryNOR = generateTelemetry("NOR", 97942);

// Generate delta between two drivers
function generateDelta(): DeltaPoint[] {
    const points: DeltaPoint[] = [];
    let cumDelta = 0;

    for (let i = 0; i < 300; i++) {
        const distance = (i / 300) * 5451;
        // VER generally faster, but NOR gains in some corners
        const cornerZones = [0.15, 0.30, 0.52, 0.75, 0.90];
        const progress = i / 300;
        const isNorFaster = cornerZones.some(c => Math.abs(progress - c) < 0.03);

        if (isNorFaster) {
            cumDelta += 0.003 + Math.random() * 0.002;
        } else {
            cumDelta -= 0.001 + Math.random() * 0.002;
        }

        points.push({
            distance,
            deltaTime: cumDelta,
        });
    }

    return points;
}

export const mockDelta = generateDelta();

export const mockCornerDeltas: CornerDelta[] = [
    { number: 1, delta: -0.032, speed1: 125, speed2: 122 },
    { number: 2, delta: -0.018, speed1: 98, speed2: 96 },
    { number: 3, delta: 0.025, speed1: 145, speed2: 148 },
    { number: 4, delta: -0.041, speed1: 88, speed2: 84 },
    { number: 5, delta: 0.008, speed1: 132, speed2: 133 },
    { number: 6, delta: -0.055, speed1: 110, speed2: 105 },
    { number: 7, delta: 0.012, speed1: 195, speed2: 197 },
    { number: 8, delta: -0.022, speed1: 78, speed2: 75 },
    { number: 9, delta: 0.035, speed1: 165, speed2: 168 },
    { number: 10, delta: -0.015, speed1: 142, speed2: 140 },
    { number: 11, delta: -0.028, speed1: 105, speed2: 101 },
    { number: 12, delta: 0.019, speed1: 118, speed2: 120 },
    { number: 13, delta: -0.038, speed1: 92, speed2: 88 },
    { number: 14, delta: 0.005, speed1: 155, speed2: 156 },
    { number: 15, delta: -0.045, speed1: 72, speed2: 68 },
    { number: 16, delta: 0.022, speed1: 178, speed2: 180 },
];

export const mockCompareResult: CompareResult = {
    drivers: {
        VER: { telemetry: mockTelemetryVER, bestLapTime: 97845 },
        NOR: { telemetry: mockTelemetryNOR, bestLapTime: 97942 },
    },
    delta: mockDelta,
    trackMap: {
        circuitKey: "shanghai",
        corners: mockCornerDeltas.map((c) => ({
            number: c.number,
            x: Math.cos((c.number / 16) * Math.PI * 2) * 400,
            y: Math.sin((c.number / 16) * Math.PI * 2) * 300,
            angle: (c.number / 16) * 360,
        })),
        marshalSectors: [],
        rotation: 0,
        xMin: -500,
        xMax: 500,
        yMin: -400,
        yMax: 400,
    },
};
