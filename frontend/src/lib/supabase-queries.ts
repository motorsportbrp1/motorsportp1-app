import { supabase } from "./supabase";

// ═══════════════════════════════════════════
// Supabase Query Functions — Real F1 Data
// ═══════════════════════════════════════════

// Team color mapping from constructor ID
const CONSTRUCTOR_COLORS: Record<string, string> = {
    "red-bull": "#3671C6",
    "ferrari": "#E8002D",
    "mclaren": "#FF8000",
    "mercedes": "#27F4D2",
    "aston-martin": "#229971",
    "alpine": "#FF87BC",
    "williams": "#64C4FF",
    "haas": "#B6BABD",
    "rs": "#6692FF",
    "rb": "#6692FF",
    "kick": "#52E252",
    "sauber": "#52E252",
};

export function getConstructorColor(id: string): string {
    return CONSTRUCTOR_COLORS[id] || "#888";
}

// ── Next Race ──
export async function fetchNextRace() {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
        .from("races")
        .select("*, grands_prix:grandprixid(id, name, fullname, countryid), circuits:circuitid(id, name, fullname, placename, countryid, length, turns)")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(1);

    if (data && data.length > 0) return data[0];

    // Fallback: get last race instead
    const { data: lastRace } = await supabase
        .from("races")
        .select("*, grands_prix:grandprixid(id, name, fullname, countryid), circuits:circuitid(id, name, fullname, placename, countryid, length, turns)")
        .lte("date", today)
        .order("date", { ascending: false })
        .limit(1);

    return lastRace?.[0] || null;
}

// ── Last Race Podium ──
export async function fetchLastRacePodium() {
    const today = new Date().toISOString().split("T")[0];

    // Get last completed race
    const { data: lastRaces } = await supabase
        .from("races")
        .select("id, year, round, grandprixid, officialname, grands_prix:grandprixid(name, fullname)")
        .lte("date", today)
        .order("date", { ascending: false })
        .limit(1);

    const lastRace = lastRaces?.[0];
    if (!lastRace) return null;

    // Get top 3 results
    const { data: podium } = await supabase
        .from("results")
        .select("positionnumber, driverid, constructorid, time, timemillis, gap, points, drivers:driverid(name, firstname, lastname, abbreviation, permanentnumber)")
        .eq("raceid", lastRace.id)
        .lte("positionnumber", 3)
        .order("positionnumber", { ascending: true });

    return {
        race: lastRace,
        podium: (podium || []).map((r: any) => ({
            position: r.positionnumber,
            driverId: r.driverid,
            driverName: r.drivers?.name || r.driverid,
            firstName: r.drivers?.firstname || "",
            lastName: r.drivers?.lastname || "",
            abbreviation: r.drivers?.abbreviation || "",
            number: r.drivers?.permanentnumber || 0,
            constructorId: r.constructorid,
            teamColor: getConstructorColor(r.constructorid),
            time: r.time || "",
            gap: r.gap || "",
            points: r.points || 0,
        })),
    };
}

// ── Race Schedule for a Season ──
export async function fetchSeasonRaces(year: number) {
    const { data } = await supabase
        .from("races")
        .select("id, year, round, date, time, grandprixid, officialname, circuitid, laps, distance, courselength, turns, freepractice1date, freepractice1time, freepractice2date, freepractice2time, freepractice3date, freepractice3time, qualifyingdate, qualifyingtime, sprintqualifyingdate, sprintqualifyingtime, sprintracedate, sprintracetime, grands_prix:grandprixid(id, name, fullname, countryid), circuits:circuitid(id, name, fullname, placename, countryid, length, turns)")
        .eq("year", year)
        .order("round", { ascending: true });

    return data || [];
}

// ── Race Results (full grid) ──
export async function fetchRaceResults(year: number, round: number) {
    const { data: races } = await supabase
        .from("races")
        .select("id, laps, distance, officialname, grands_prix:grandprixid(name, countryid)")
        .eq("year", year)
        .eq("round", round)
        .limit(1);

    const race = races?.[0];
    if (!race) return null;

    const { data: results } = await supabase
        .from("results")
        .select("positionnumber, positiontext, driverid, constructorid, drivernumber, time, timemillis, gap, gapmillis, interval, intervalmillis, points, laps, reasonretired, gridpositionnumber, fastestlap, pitstops, drivers:driverid(name, firstname, lastname, abbreviation, permanentnumber)")
        .eq("raceid", race.id)
        .order("positiondisplayorder", { ascending: true });

    return {
        race,
        results: (results || []).map((r: any) => ({
            position: r.positionnumber,
            positionText: r.positiontext,
            driverId: r.driverid,
            driverName: r.drivers?.name || r.driverid,
            firstName: r.drivers?.firstname || "",
            lastName: r.drivers?.lastname || "",
            abbreviation: r.drivers?.abbreviation || "",
            driverNumber: r.drivernumber || r.drivers?.permanentnumber || 0,
            constructorId: r.constructorid,
            teamColor: getConstructorColor(r.constructorid),
            time: r.time || "",
            timemillis: r.timemillis,
            gap: r.gap || "",
            interval: r.interval || "",
            points: r.points || 0,
            laps: r.laps || 0,
            reasonRetired: r.reasonretired || null,
            gridPosition: r.gridpositionnumber,
            fastestLap: r.fastestlap || false,
            pitstops: r.pitstops || 0,
        })),
    };
}

// ── Lap Times for a Race ──
export async function fetchLapTimes(raceId: string, driverIds?: string[]) {
    let query = supabase
        .from("lap_times")
        .select("driverid, lap, time, timemillis, gap, gapmillis, interval, intervalmillis, positionnumber, constructorid, drivers:driverid(abbreviation)")
        .eq("raceid", raceId)
        .order("lap", { ascending: true })
        .order("positionnumber", { ascending: true });

    if (driverIds && driverIds.length > 0) {
        query = query.in("driverid", driverIds);
    }

    const { data } = await query;
    return data || [];
}

// ── Pit Stops for a Race ──
export async function fetchPitStops(raceId: string) {
    const { data } = await supabase
        .from("pit_stops")
        .select("driverid, stop, lap, time, timemillis, constructorid, drivers:driverid(abbreviation, name)")
        .eq("raceid", raceId)
        .order("lap", { ascending: true })
        .order("stop", { ascending: true });

    return data || [];
}

// ── Fastest Laps for a Race ──
export async function fetchFastestLaps(year: number, round: number) {
    const { data } = await supabase
        .from("races_fastest_laps")
        .select("*")
        .eq("year", year)
        .eq("round", round)
        .order("positionnumber", { ascending: true });

    return data || [];
}

// ── Driver Career Spans (single aggregated query) ──
export async function fetchDriverCareerSpans() {
    const { data } = await supabase
        .from("driver_career_spans")
        .select("driverid, first_year, last_year");

    return data || [];
}

// ── Seasons List ──
export async function fetchSeasons() {
    const { data } = await supabase
        .from("seasons")
        .select("year")
        .order("year", { ascending: false });

    return data || [];
}

// ── Quick Stats ──
export async function fetchQuickStats(year: number) {
    // How many races completed so far this year
    const today = new Date().toISOString().split("T")[0];

    const { count: completedRaces } = await supabase
        .from("races")
        .select("*", { count: "exact", head: true })
        .eq("year", year)
        .lte("date", today);

    const { count: totalRaces } = await supabase
        .from("races")
        .select("*", { count: "exact", head: true })
        .eq("year", year);

    // Last season champion
    const { data: champions } = await supabase
        .from("seasons_driver_standings")
        .select("driverid, points")
        .eq("year", year - 1)
        .eq("championshipwon", true)
        .limit(1);

    const champion = champions?.[0] || null;

    let championInfo = null;
    if (champion) {
        const { data: driverResults } = await supabase
            .from("drivers")
            .select("name, firstname, lastname")
            .eq("id", champion.driverid)
            .limit(1);
        const driverData = driverResults?.[0] || null;

        const { data: entrants } = await supabase
            .from("seasons_entrants_drivers")
            .select("constructorid")
            .eq("year", year - 1)
            .eq("driverid", champion.driverid)
            .limit(1);
        const entrant = entrants?.[0] || null;

        championInfo = {
            driverId: champion.driverid,
            name: driverData?.firstname || champion.driverid,
            team: entrant?.constructorid || "Unknown",
        };
    }

    return {
        completedRaces: completedRaces || 0,
        totalRaces: totalRaces || 0,
        champion: championInfo,
    };
}

// ── Drivers for a Season (for dropdowns) ──
export async function fetchSeasonDrivers(year: number) {
    const { data: results } = await supabase
        .from("results")
        .select("driverid, constructorid, drivernumber")
        .eq("year", year)
        .order("positiondisplayorder", { ascending: true });

    if (!results) return [];

    // Deduplicate by driverid
    const seen = new Set<string>();
    const uniqueDrivers = results.filter((r: any) => {
        if (seen.has(r.driverid)) return false;
        seen.add(r.driverid);
        return true;
    });

    // Fetch driver names
    const driverIds = uniqueDrivers.map((r: any) => r.driverid);
    const { data: drivers } = await supabase
        .from("drivers")
        .select("id, name, firstname, lastname, abbreviation, permanentnumber")
        .in("id", driverIds);

    return uniqueDrivers.map((r: any) => {
        const d = drivers?.find((x: any) => x.id === r.driverid);
        return {
            driverId: r.driverid,
            driverNumber: r.drivernumber || d?.permanentnumber || 0,
            abbreviation: d?.abbreviation || "",
            fullName: d?.name || r.driverid,
            firstName: d?.firstname || "",
            lastName: d?.lastname || "",
            constructorId: r.constructorid,
            teamColor: getConstructorColor(r.constructorid),
        };
    });
}

// ── Historical "Replay" Data for Live Timing ──
export async function fetchReplayData(year: number, round: number) {
    // Get race info
    const { data: races } = await supabase
        .from("races")
        .select("id, laps, officialname, grands_prix:grandprixid(name, countryid)")
        .eq("year", year)
        .eq("round", round)
        .limit(1);

    const race = races?.[0];
    if (!race) return null;

    // Get race results with driver info
    const { data: results } = await supabase
        .from("results")
        .select("positionnumber, positiontext, driverid, constructorid, drivernumber, time, timemillis, gap, gapmillis, interval, intervalmillis, laps, pitstops, reasonretired, fastestlap, drivers:driverid(abbreviation, name)")
        .eq("raceid", race.id)
        .order("positiondisplayorder", { ascending: true });

    // Get fastest laps for the race
    const { data: fastestLaps } = await supabase
        .from("races_fastest_laps")
        .select("driverid, time, timemillis")
        .eq("year", year)
        .eq("round", round)
        .order("positionnumber", { ascending: true });

    const fastestLapMap: Record<string, any> = {};
    (fastestLaps || []).forEach((fl: any) => {
        fastestLapMap[fl.driverid] = fl;
    });

    return {
        race: {
            ...race,
            totalLaps: race.laps || 0,
        },
        drivers: (results || []).map((r: any) => ({
            driverNumber: String(r.drivernumber || 0),
            abbreviation: r.drivers?.abbreviation || r.driverid.substring(0, 3).toUpperCase(),
            team: r.constructorid?.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "",
            teamColor: getConstructorColor(r.constructorid),
            position: r.positionnumber || 99,
            lastLapTime: fastestLapMap[r.driverid]?.time || null,
            bestLapTime: fastestLapMap[r.driverid]?.time || null,
            sector1: null,
            sector2: null,
            sector3: null,
            gap: r.positionnumber === 1 ? "LEADER" : (r.gap || `+${r.positionnumber || 0} laps`),
            interval: r.positionnumber === 1 ? "—" : (r.interval || ""),
            inPit: false,
            pitCount: r.pitstops || 0,
            retired: !!r.reasonretired,
            compound: null,
            tyreAge: null,
        })),
    };
}

// ── Available Races for Replay Picker ──
export async function fetchAvailableRacesForReplay(limit = 24) {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
        .from("races")
        .select("id, year, round, officialname, date, grands_prix:grandprixid(name, countryid)")
        .lte("date", today)
        .order("date", { ascending: false })
        .limit(limit);

    return data || [];
}
