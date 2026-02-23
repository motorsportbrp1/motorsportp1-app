-- 01_schema.sql
-- Core entities for F1 historical data (F1DB v2026.0.0 schema)

-- Drop outdated tables to ensure clean recreation with the new F1DB schema
DROP TABLE IF EXISTS public.status CASCADE;
DROP TABLE IF EXISTS public.circuits CASCADE;
DROP TABLE IF EXISTS public.constructors CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.seasons CASCADE;

-- Circuits
CREATE TABLE IF NOT EXISTS public.circuits (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    fullName VARCHAR(255),
    previousNames TEXT,
    type VARCHAR(50),
    direction VARCHAR(50),
    placeName VARCHAR(255),
    countryId VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT,
    length FLOAT,
    turns INT,
    totalRacesHeld INT
);

-- Constructors (Equipes)
CREATE TABLE IF NOT EXISTS public.constructors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    countryId VARCHAR(255),
    logo_url text,
    car_url text,
    bestChampionshipPosition INT,
    bestStartingGridPosition INT,
    bestRaceResult INT,
    bestSprintRaceResult INT,
    totalChampionshipWins INT,
    totalRaceEntries INT,
    totalRaceStarts INT,
    totalRaceWins INT,
    total1And2Finishes INT,
    totalRaceLaps INT,
    totalPodiums INT,
    totalPodiumRaces INT,
    totalPoints FLOAT,
    totalChampionshipPoints FLOAT,
    totalPolePositions INT,
    totalFastestLaps INT,
    totalSprintRaceStarts INT,
    totalSprintRaceWins INT
);

-- Drivers
CREATE TABLE IF NOT EXISTS public.drivers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    fullName VARCHAR(255),
    abbreviation VARCHAR(10),
    headshot_url text,
    helmet_url text,
    permanentNumber INT,
    gender VARCHAR(10),
    dateOfBirth DATE,
    dateOfDeath DATE,
    placeOfBirth VARCHAR(255),
    countryOfBirthCountryId VARCHAR(255),
    nationalityCountryId VARCHAR(255),
    secondNationalityCountryId VARCHAR(255),
    bestChampionshipPosition INT,
    bestStartingGridPosition INT,
    bestRaceResult INT,
    bestSprintRaceResult INT,
    totalChampionshipWins INT,
    totalRaceEntries INT,
    totalRaceStarts INT,
    totalRaceWins INT,
    totalRaceLaps INT,
    totalPodiums INT,
    totalPoints FLOAT,
    totalChampionshipPoints FLOAT,
    totalPolePositions INT,
    totalFastestLaps INT,
    totalSprintRaceStarts INT,
    totalSprintRaceWins INT,
    totalDriverOfTheDay INT,
    totalGrandSlams INT
);

-- Seasons
CREATE TABLE IF NOT EXISTS public.seasons (
    year INT PRIMARY KEY
);
