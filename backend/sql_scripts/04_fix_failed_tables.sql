-- Gerado para recriar as tabelas que falharam com tipagem mais segura

DROP TABLE IF EXISTS public.races_constructor_standings CASCADE;
CREATE TABLE public.races_constructor_standings (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "points" NUMERIC,
    "positionsgained" NUMERIC,
    "championshipwon" BOOLEAN
);

DROP TABLE IF EXISTS public.races_driver_standings CASCADE;
CREATE TABLE public.races_driver_standings (
    "raceid" INTEGER,
    "year" INTEGER,
    "round" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
    "driverid" TEXT,
    "points" NUMERIC,
    "positionsgained" NUMERIC,
    "championshipwon" BOOLEAN
);

DROP TABLE IF EXISTS public.races_fastest_laps CASCADE;
CREATE TABLE public.races_fastest_laps (
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
    "gap" TEXT,
    "gapmillis" NUMERIC,
    "interval" TEXT,
    "intervalmillis" NUMERIC
);

DROP TABLE IF EXISTS public.races_pre_qualifying_results CASCADE;
CREATE TABLE public.races_pre_qualifying_results (
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

DROP TABLE IF EXISTS public.races_qualifying_1_results CASCADE;
CREATE TABLE public.races_qualifying_1_results (
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

DROP TABLE IF EXISTS public.races_qualifying_2_results CASCADE;
CREATE TABLE public.races_qualifying_2_results (
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

DROP TABLE IF EXISTS public.races_qualifying_results CASCADE;
CREATE TABLE public.races_qualifying_results (
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
    "time" TEXT,
    "timemillis" NUMERIC,
    "q1" TEXT,
    "q1millis" NUMERIC,
    "q2" TEXT,
    "q2millis" NUMERIC,
    "q3" TEXT,
    "q3millis" NUMERIC,
    "gap" TEXT,
    "gapmillis" NUMERIC,
    "interval" TEXT,
    "intervalmillis" NUMERIC,
    "laps" NUMERIC
);

DROP TABLE IF EXISTS public.races_race_results CASCADE;
CREATE TABLE public.races_race_results (
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
    "interval" TEXT,
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
    "fastestlap" TEXT,
    "driveroftheday" TEXT,
    "grandslam" BOOLEAN
);

DROP TABLE IF EXISTS public.races_starting_grid_positions CASCADE;
CREATE TABLE public.races_starting_grid_positions (
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

DROP TABLE IF EXISTS public.races_warming_up_results CASCADE;
CREATE TABLE public.races_warming_up_results (
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
    "gap" TEXT,
    "gapmillis" NUMERIC,
    "interval" TEXT,
    "intervalmillis" NUMERIC,
    "laps" NUMERIC
);

DROP TABLE IF EXISTS public.seasons_constructor_standings CASCADE;
CREATE TABLE public.seasons_constructor_standings (
    "year" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
    "constructorid" TEXT,
    "enginemanufacturerid" TEXT,
    "points" NUMERIC,
    "championshipwon" BOOLEAN
);

DROP TABLE IF EXISTS public.seasons_constructors CASCADE;
CREATE TABLE public.seasons_constructors (
    "year" INTEGER,
    "constructorid" TEXT,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
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

DROP TABLE IF EXISTS public.seasons_driver_standings CASCADE;
CREATE TABLE public.seasons_driver_standings (
    "year" INTEGER,
    "positiondisplayorder" INTEGER,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
    "driverid" TEXT,
    "points" NUMERIC,
    "championshipwon" BOOLEAN
);

DROP TABLE IF EXISTS public.seasons_drivers CASCADE;
CREATE TABLE public.seasons_drivers (
    "year" INTEGER,
    "driverid" TEXT,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
    "beststartinggridposition" NUMERIC,
    "bestraceresult" NUMERIC,
    "bestsprintraceresult" NUMERIC,
    "totalraceentries" INTEGER,
    "totalracestarts" INTEGER,
    "totalracewins" INTEGER,
    "totalracelaps" INTEGER,
    "totalpodiums" INTEGER,
    "totalpoints" NUMERIC,
    "totalpolepositions" INTEGER,
    "totalfastestlaps" INTEGER,
    "totalsprintracestarts" INTEGER,
    "totalsprintracewins" INTEGER,
    "totaldriveroftheday" INTEGER,
    "totalgrandslams" INTEGER
);

DROP TABLE IF EXISTS public.seasons_engine_manufacturers CASCADE;
CREATE TABLE public.seasons_engine_manufacturers (
    "year" INTEGER,
    "enginemanufacturerid" TEXT,
    "positionnumber" NUMERIC,
    "positiontext" TEXT,
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