-- Gerado automaticamente para as tabelas faltantes do F1DB

CREATE TABLE IF NOT EXISTS public.chassis (
    "id" TEXT,
    "constructorid" TEXT,
    "name" TEXT,
    "fullname" TEXT
);

CREATE TABLE IF NOT EXISTS public.constructors_chronology (
    "parentconstructorid" TEXT,
    "positiondisplayorder" INTEGER,
    "constructorid" TEXT,
    "yearfrom" INTEGER,
    "yearto" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.continents (
    "id" TEXT,
    "code" TEXT,
    "name" TEXT,
    "demonym" TEXT
);

CREATE TABLE IF NOT EXISTS public.countries (
    "id" TEXT,
    "alpha2code" TEXT,
    "alpha3code" TEXT,
    "ioccode" TEXT,
    "name" TEXT,
    "demonym" TEXT,
    "continentid" TEXT
);

CREATE TABLE IF NOT EXISTS public.drivers_family_relationships (
    "parentdriverid" TEXT,
    "positiondisplayorder" INTEGER,
    "driverid" TEXT,
    "type" TEXT
);

CREATE TABLE IF NOT EXISTS public.engine_manufacturers (
    "id" TEXT,
    "name" TEXT,
    "countryid" TEXT,
    "bestchampionshipposition" NUMERIC,
    "beststartinggridposition" NUMERIC,
    "bestraceresult" NUMERIC,
    "bestsprintraceresult" NUMERIC,
    "totalchampionshipwins" INTEGER,
    "totalraceentries" INTEGER,
    "totalracestarts" INTEGER,
    "totalracewins" INTEGER,
    "totalracelaps" INTEGER,
    "totalpodiums" INTEGER,
    "totalpodiumraces" INTEGER,
    "totalpoints" NUMERIC,
    "totalchampionshippoints" NUMERIC,
    "totalpolepositions" INTEGER,
    "totalfastestlaps" INTEGER,
    "totalsprintracestarts" INTEGER,
    "totalsprintracewins" INTEGER
);

CREATE TABLE IF NOT EXISTS public.engines (
    "id" TEXT,
    "enginemanufacturerid" TEXT,
    "name" TEXT,
    "fullname" TEXT,
    "capacity" NUMERIC,
    "configuration" TEXT,
    "aspiration" TEXT
);

CREATE TABLE IF NOT EXISTS public.entrants (
    "id" TEXT,
    "name" TEXT
);

CREATE TABLE IF NOT EXISTS public.grands_prix (
    "id" TEXT,
    "name" TEXT,
    "fullname" TEXT,
    "shortname" TEXT,
    "abbreviation" TEXT,
    "countryid" TEXT,
    "totalracesheld" INTEGER
);

CREATE TABLE IF NOT EXISTS public.races_constructor_standings (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "points" INTEGER,
    "positionsgained" NUMERIC,
    "championshipwon" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.races_driver_of_the_day_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "percentage" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_driver_standings (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "driverid" TEXT,
    "points" INTEGER,
    "positionsgained" NUMERIC,
    "championshipwon" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.races_fastest_laps (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "lap" NUMERIC,
    "time" TEXT,
    "timemillis" INTEGER,
    "gap" NUMERIC,
    "gapmillis" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_free_practice_1_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" TEXT,
    "timemillis" INTEGER,
    "gap" TEXT,
    "gapmillis" NUMERIC,
    "interval" TEXT,
    "intervalmillis" NUMERIC,
    "laps" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_free_practice_2_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" TEXT,
    "timemillis" INTEGER,
    "gap" TEXT,
    "gapmillis" NUMERIC,
    "interval" TEXT,
    "intervalmillis" NUMERIC,
    "laps" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_free_practice_3_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" TEXT,
    "timemillis" NUMERIC,
    "gap" NUMERIC,
    "gapmillis" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC,
    "laps" INTEGER
);

CREATE TABLE IF NOT EXISTS public.races_free_practice_4_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" TEXT,
    "timemillis" NUMERIC,
    "gap" NUMERIC,
    "gapmillis" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC,
    "laps" INTEGER
);

CREATE TABLE IF NOT EXISTS public.races_pit_stops (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "stop" INTEGER,
    "lap" INTEGER,
    "time" TEXT,
    "timemillis" INTEGER
);

CREATE TABLE IF NOT EXISTS public.races_pre_qualifying_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" TEXT,
    "timemillis" INTEGER,
    "q1" NUMERIC,
    "q1millis" NUMERIC,
    "q2" NUMERIC,
    "q2millis" NUMERIC,
    "q3" NUMERIC,
    "q3millis" NUMERIC,
    "gap" NUMERIC,
    "gapmillis" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC,
    "laps" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_qualifying_1_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" TEXT,
    "timemillis" NUMERIC,
    "q1" NUMERIC,
    "q1millis" NUMERIC,
    "q2" NUMERIC,
    "q2millis" NUMERIC,
    "q3" NUMERIC,
    "q3millis" NUMERIC,
    "gap" NUMERIC,
    "gapmillis" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC,
    "laps" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_qualifying_2_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" TEXT,
    "timemillis" NUMERIC,
    "q1" NUMERIC,
    "q1millis" NUMERIC,
    "q2" NUMERIC,
    "q2millis" NUMERIC,
    "q3" NUMERIC,
    "q3millis" NUMERIC,
    "gap" TEXT,
    "gapmillis" NUMERIC,
    "interval" TEXT,
    "intervalmillis" NUMERIC,
    "laps" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_qualifying_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" TEXT,
    "timemillis" NUMERIC,
    "q1" NUMERIC,
    "q1millis" NUMERIC,
    "q2" NUMERIC,
    "q2millis" NUMERIC,
    "q3" NUMERIC,
    "q3millis" NUMERIC,
    "gap" NUMERIC,
    "gapmillis" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC,
    "laps" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_race_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "sharedcar" BOOLEAN,
    "laps" NUMERIC,
    "time" TEXT,
    "timemillis" NUMERIC,
    "timepenalty" NUMERIC,
    "timepenaltymillis" NUMERIC,
    "gap" TEXT,
    "gapmillis" NUMERIC,
    "gaplaps" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC,
    "reasonretired" TEXT,
    "points" NUMERIC,
    "poleposition" BOOLEAN,
    "qualificationpositionnumber" NUMERIC,
    "qualificationpositiontext" NUMERIC,
    "gridpositionnumber" NUMERIC,
    "gridpositiontext" NUMERIC,
    "positionsgained" NUMERIC,
    "pitstops" NUMERIC,
    "fastestlap" BOOLEAN,
    "driveroftheday" NUMERIC,
    "grandslam" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.races_sprint_qualifying_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" NUMERIC,
    "timemillis" NUMERIC,
    "q1" TEXT,
    "q1millis" NUMERIC,
    "q2" TEXT,
    "q2millis" NUMERIC,
    "q3" TEXT,
    "q3millis" NUMERIC,
    "gap" NUMERIC,
    "gapmillis" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC,
    "laps" INTEGER
);

CREATE TABLE IF NOT EXISTS public.races_sprint_race_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "sharedcar" BOOLEAN,
    "laps" NUMERIC,
    "time" TEXT,
    "timemillis" NUMERIC,
    "timepenalty" NUMERIC,
    "timepenaltymillis" NUMERIC,
    "gap" TEXT,
    "gapmillis" NUMERIC,
    "gaplaps" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC,
    "reasonretired" TEXT,
    "points" NUMERIC,
    "poleposition" BOOLEAN,
    "qualificationpositionnumber" NUMERIC,
    "qualificationpositiontext" TEXT,
    "gridpositionnumber" NUMERIC,
    "gridpositiontext" TEXT,
    "positionsgained" NUMERIC,
    "pitstops" NUMERIC,
    "fastestlap" BOOLEAN,
    "driveroftheday" BOOLEAN,
    "grandslam" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.races_sprint_starting_grid_positions (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "qualificationpositionnumber" NUMERIC,
    "qualificationpositiontext" TEXT,
    "gridpenalty" TEXT,
    "gridpenaltypositions" NUMERIC,
    "time" TEXT,
    "timemillis" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_starting_grid_positions (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "qualificationpositionnumber" INTEGER,
    "qualificationpositiontext" INTEGER,
    "gridpenalty" NUMERIC,
    "gridpenaltypositions" NUMERIC,
    "time" TEXT,
    "timemillis" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.races_warming_up_results (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "drivernumber" INTEGER,
    "driverid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT,
    "time" TEXT,
    "timemillis" INTEGER,
    "gap" NUMERIC,
    "gapmillis" NUMERIC,
    "interval" NUMERIC,
    "intervalmillis" NUMERIC,
    "laps" NUMERIC
);

CREATE TABLE IF NOT EXISTS public.seasons_constructor_standings (
    "year" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "points" INTEGER,
    "championshipwon" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.seasons_constructors (
    "year" INTEGER,
    "constructorid" TEXT,
    "positionnumber" NUMERIC,
    "positiontext" NUMERIC,
    "beststartinggridposition" NUMERIC,
    "bestraceresult" NUMERIC,
    "bestsprintraceresult" NUMERIC,
    "totalraceentries" INTEGER,
    "totalracestarts" INTEGER,
    "totalracewins" INTEGER,
    "total1and2finishes" INTEGER,
    "totalracelaps" INTEGER,
    "totalpodiums" INTEGER,
    "totalpodiumraces" INTEGER,
    "totalpoints" NUMERIC,
    "totalpolepositions" INTEGER,
    "totalfastestlaps" INTEGER,
    "totalsprintracestarts" INTEGER,
    "totalsprintracewins" INTEGER
);

CREATE TABLE IF NOT EXISTS public.seasons_driver_standings (
    "year" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" INTEGER,
    "positiontext" INTEGER,
    "driverid" TEXT,
    "points" NUMERIC,
    "championshipwon" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.seasons_drivers (
    "year" INTEGER,
    "driverid" TEXT,
    "positionnumber" NUMERIC,
    "positiontext" NUMERIC,
    "beststartinggridposition" NUMERIC,
    "bestraceresult" NUMERIC,
    "bestsprintraceresult" NUMERIC,
    "totalraceentries" INTEGER,
    "totalracestarts" INTEGER,
    "totalracewins" INTEGER,
    "totalracelaps" INTEGER,
    "totalpodiums" INTEGER,
    "totalpoints" INTEGER,
    "totalpolepositions" INTEGER,
    "totalfastestlaps" INTEGER,
    "totalsprintracestarts" INTEGER,
    "totalsprintracewins" INTEGER,
    "totaldriveroftheday" INTEGER,
    "totalgrandslams" INTEGER
);

CREATE TABLE IF NOT EXISTS public.seasons_engine_manufacturers (
    "year" INTEGER,
    "enginemanufacturerid" TEXT,
    "positionnumber" NUMERIC,
    "positiontext" NUMERIC,
    "beststartinggridposition" NUMERIC,
    "bestraceresult" NUMERIC,
    "bestsprintraceresult" NUMERIC,
    "totalraceentries" INTEGER,
    "totalracestarts" INTEGER,
    "totalracewins" INTEGER,
    "totalracelaps" INTEGER,
    "totalpodiums" INTEGER,
    "totalpodiumraces" INTEGER,
    "totalpoints" NUMERIC,
    "totalpolepositions" INTEGER,
    "totalfastestlaps" INTEGER,
    "totalsprintracestarts" INTEGER,
    "totalsprintracewins" INTEGER
);

CREATE TABLE IF NOT EXISTS public.seasons_entrants_chassis (
    "year" INTEGER,
    "entrantid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "chassisid" TEXT
);

CREATE TABLE IF NOT EXISTS public.seasons_entrants_constructors (
    "year" INTEGER,
    "entrantid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT
);

CREATE TABLE IF NOT EXISTS public.seasons_entrants_drivers (
    "year" INTEGER,
    "entrantid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "driverid" TEXT,
    "rounds" TEXT,
    "roundstext" TEXT,
    "testdriver" BOOLEAN
);

CREATE TABLE IF NOT EXISTS public.seasons_entrants_engines (
    "year" INTEGER,
    "entrantid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "engineid" TEXT
);

CREATE TABLE IF NOT EXISTS public.seasons_entrants_tyre_manufacturers (
    "year" INTEGER,
    "entrantid" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "tyremanufacturerid" TEXT
);

CREATE TABLE IF NOT EXISTS public.seasons_entrants (
    "year" INTEGER,
    "entrantid" TEXT,
    "countryid" TEXT
);

CREATE TABLE IF NOT EXISTS public.seasons_tyre_manufacturers (
    "year" INTEGER,
    "tyremanufacturerid" TEXT,
    "beststartinggridposition" INTEGER,
    "bestraceresult" NUMERIC,
    "bestsprintraceresult" NUMERIC,
    "totalraceentries" INTEGER,
    "totalracestarts" INTEGER,
    "totalracewins" INTEGER,
    "totalracelaps" INTEGER,
    "totalpodiums" INTEGER,
    "totalpodiumraces" INTEGER,
    "totalpolepositions" INTEGER,
    "totalfastestlaps" INTEGER,
    "totalsprintracestarts" INTEGER,
    "totalsprintracewins" INTEGER
);

CREATE TABLE IF NOT EXISTS public.tyre_manufacturers (
    "id" TEXT,
    "name" TEXT,
    "countryid" TEXT,
    "beststartinggridposition" INTEGER,
    "bestraceresult" INTEGER,
    "bestsprintraceresult" NUMERIC,
    "totalraceentries" INTEGER,
    "totalracestarts" INTEGER,
    "totalracewins" INTEGER,
    "totalracelaps" INTEGER,
    "totalpodiums" INTEGER,
    "totalpodiumraces" INTEGER,
    "totalpolepositions" INTEGER,
    "totalfastestlaps" INTEGER,
    "totalsprintracestarts" INTEGER,
    "totalsprintracewins" INTEGER
);