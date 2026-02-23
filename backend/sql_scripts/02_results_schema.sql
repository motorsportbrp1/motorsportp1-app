-- 02_results_schema.sql
-- Race events and results data (F1DB v2026.0.0 schema)

DROP TABLE IF EXISTS public.races CASCADE;
DROP TABLE IF EXISTS public.qualifying CASCADE;
DROP TABLE IF EXISTS public.results CASCADE;
DROP TABLE IF EXISTS public.sprint_results CASCADE;
DROP TABLE IF EXISTS public.constructor_standings CASCADE;
DROP TABLE IF EXISTS public.driver_standings CASCADE;

-- Races
CREATE TABLE IF NOT EXISTS public.races (
    id VARCHAR(255) PRIMARY KEY,
    year INT REFERENCES public.seasons(year),
    round INT NOT NULL,
    date DATE,
    time TIME,
    grandPrixId VARCHAR(255),
    officialName VARCHAR(255),
    qualifyingFormat VARCHAR(50),
    sprintQualifyingFormat VARCHAR(50),
    circuitId VARCHAR(255) REFERENCES public.circuits(id),
    circuitType VARCHAR(50),
    direction VARCHAR(50),
    courseLength FLOAT,
    turns INT,
    laps INT,
    distance FLOAT,
    scheduledLaps INT,
    scheduledDistance FLOAT,
    driversChampionshipDecider BOOLEAN,
    constructorsChampionshipDecider BOOLEAN,
    preQualifyingDate DATE,
    preQualifyingTime TIME,
    freePractice1Date DATE,
    freePractice1Time TIME,
    freePractice2Date DATE,
    freePractice2Time TIME,
    freePractice3Date DATE,
    freePractice3Time TIME,
    freePractice4Date DATE,
    freePractice4Time TIME,
    qualifying1Date DATE,
    qualifying1Time TIME,
    qualifying2Date DATE,
    qualifying2Time TIME,
    qualifyingDate DATE,
    qualifyingTime TIME,
    sprintQualifyingDate DATE,
    sprintQualifyingTime TIME,
    sprintRaceDate DATE,
    sprintRaceTime TIME,
    warmingUpDate DATE,
    warmingUpTime TIME
);

-- Qualifying
CREATE TABLE IF NOT EXISTS public.qualifying (
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
    time VARCHAR(20),
    timeMillis INT,
    q1 VARCHAR(20),
    q1Millis INT,
    q2 VARCHAR(20),
    q2Millis INT,
    q3 VARCHAR(20),
    q3Millis INT,
    gap VARCHAR(20),
    gapMillis INT,
    interval VARCHAR(20),
    intervalMillis INT,
    laps INT,
    PRIMARY KEY (raceId, driverId)
);

-- Results (Race Results)
CREATE TABLE IF NOT EXISTS public.results (
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
    sharedCar BOOLEAN,
    laps INT,
    time VARCHAR(50),
    timeMillis INT,
    timePenalty VARCHAR(50),
    timePenaltyMillis INT,
    gap VARCHAR(50),
    gapMillis INT,
    gapLaps INT,
    interval VARCHAR(50),
    intervalMillis INT,
    reasonRetired VARCHAR(255),
    points FLOAT,
    polePosition BOOLEAN,
    qualificationPositionNumber INT,
    qualificationPositionText VARCHAR(10),
    gridPositionNumber INT,
    gridPositionText VARCHAR(10),
    positionsGained INT,
    pitStops INT,
    fastestLap BOOLEAN,
    driverOfTheDay BOOLEAN,
    grandSlam BOOLEAN,
    PRIMARY KEY (raceId, driverId)
);

-- Sprint Results
CREATE TABLE IF NOT EXISTS public.sprint_results (
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
    sharedCar BOOLEAN,
    laps INT,
    time VARCHAR(50),
    timeMillis INT,
    timePenalty VARCHAR(50),
    timePenaltyMillis INT,
    gap VARCHAR(50),
    gapMillis INT,
    gapLaps INT,
    interval VARCHAR(50),
    intervalMillis INT,
    reasonRetired VARCHAR(255),
    points FLOAT,
    polePosition BOOLEAN,
    qualificationPositionNumber INT,
    qualificationPositionText VARCHAR(10),
    gridPositionNumber INT,
    gridPositionText VARCHAR(10),
    positionsGained INT,
    pitStops INT,
    fastestLap BOOLEAN,
    driverOfTheDay BOOLEAN,
    grandSlam BOOLEAN,
    PRIMARY KEY (raceId, driverId)
);

-- Constructor Standings (per Race)
CREATE TABLE IF NOT EXISTS public.constructor_standings (
    raceId VARCHAR(255) REFERENCES public.races(id),
    year INT,
    round INT,
    positionDisplayOrder INT,
    positionNumber INT,
    positionText VARCHAR(10),
    constructorId VARCHAR(255) REFERENCES public.constructors(id),
    engineManufacturerId VARCHAR(255),
    points FLOAT,
    positionsGained INT,
    championshipWon BOOLEAN,
    PRIMARY KEY (raceId, constructorId)
);

-- Driver Standings (per Race)
CREATE TABLE IF NOT EXISTS public.driver_standings (
    raceId VARCHAR(255) REFERENCES public.races(id),
    year INT,
    round INT,
    positionDisplayOrder INT,
    positionNumber INT,
    positionText VARCHAR(10),
    driverId VARCHAR(255) REFERENCES public.drivers(id),
    points FLOAT,
    positionsGained INT,
    championshipWon BOOLEAN,
    PRIMARY KEY (raceId, driverId)
);
