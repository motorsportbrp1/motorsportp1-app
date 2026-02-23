-- 03_telemetry_schema.sql
-- Lap times and pit stops (F1DB v2026.0.0 schema)

DROP TABLE IF EXISTS public.lap_times CASCADE;
DROP TABLE IF EXISTS public.pit_stops CASCADE;

-- Lap Times (Fastest Laps)
CREATE TABLE IF NOT EXISTS public.lap_times (
    raceId VARCHAR(255) REFERENCES public.races(id),
    year INT,
    round INT,
    positionDisplayOrder INT,
    positionNumber INT,
    positionText VARCHAR(10),
    driverNumber INT,
    driverId VARCHAR(255) REFERENCES public.drivers(id),
    constructorId VARCHAR(255) REFERENCES public.constructors(id),
    engineManufacturerId VARCHAR(255),
    tyreManufacturerId VARCHAR(255),
    lap INT,
    time VARCHAR(20),
    timeMillis INT,
    gap VARCHAR(20),
    gapMillis INT,
    interval VARCHAR(20),
    intervalMillis INT,
    PRIMARY KEY (raceId, driverId, lap)
);

-- Pit Stops
CREATE TABLE IF NOT EXISTS public.pit_stops (
    raceId VARCHAR(255) REFERENCES public.races(id),
    year INT,
    round INT,
    positionDisplayOrder INT,
    positionNumber INT,
    positionText VARCHAR(10),
    driverNumber INT,
    driverId VARCHAR(255) REFERENCES public.drivers(id),
    constructorId VARCHAR(255) REFERENCES public.constructors(id),
    engineManufacturerId VARCHAR(255),
    tyreManufacturerId VARCHAR(255),
    stop INT,
    lap INT,
    time VARCHAR(20),
    timeMillis INT,
    PRIMARY KEY (raceId, driverId, stop)
);
