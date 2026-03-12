import axios from 'axios';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';
const OPENF1_CACHE_TTL_MS = 5 * 60 * 1000;
const OPENF1_BROWSER_CACHE_PREFIX = 'motorsportp1:openf1:v2:';

type CacheEntry<T> = {
    expiresAt: number;
    promise: Promise<T>;
};

const openF1Cache = new Map<string, CacheEntry<unknown>>();

type BrowserCachePayload<T> = {
    expiresAt: number;
    data: T;
};

function readBrowserCache<T>(cacheKey: string, allowExpired = false): BrowserCachePayload<T> | null {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(`${OPENF1_BROWSER_CACHE_PREFIX}${cacheKey}`);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as BrowserCachePayload<T>;
        if (!allowExpired && parsed.expiresAt <= Date.now()) {
            window.localStorage.removeItem(`${OPENF1_BROWSER_CACHE_PREFIX}${cacheKey}`);
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function writeBrowserCache<T>(cacheKey: string, data: T, ttlMs: number) {
    if (typeof window === 'undefined') return;

    try {
        const payload: BrowserCachePayload<T> = {
            expiresAt: Date.now() + ttlMs,
            data,
        };

        window.localStorage.setItem(
            `${OPENF1_BROWSER_CACHE_PREFIX}${cacheKey}`,
            JSON.stringify(payload)
        );
    } catch {
        // Ignore quota/storage errors and keep runtime cache only.
    }
}

function getCachedOpenF1<T>(cacheKey: string, loader: () => Promise<T>, ttlMs = OPENF1_CACHE_TTL_MS): Promise<T> {
    const now = Date.now();
    const existing = openF1Cache.get(cacheKey) as CacheEntry<T> | undefined;

    if (existing && existing.expiresAt > now) {
        return existing.promise;
    }

    const browserCached = readBrowserCache<T>(cacheKey);
    if (browserCached) {
        const promise = Promise.resolve(browserCached.data);
        openF1Cache.set(cacheKey, {
            expiresAt: browserCached.expiresAt,
            promise,
        });
        return promise;
    }

    const promise = loader()
        .then((data) => {
            writeBrowserCache(cacheKey, data, ttlMs);
            return data;
        })
        .catch((error) => {
            const staleBrowserCache = readBrowserCache<T>(cacheKey, true);
            if (staleBrowserCache && axios.isAxiosError(error) && error.response?.status === 429) {
                return staleBrowserCache.data;
            }

            openF1Cache.delete(cacheKey);
            throw error;
        });

    openF1Cache.set(cacheKey, {
        expiresAt: now + ttlMs,
        promise,
    });

    return promise;
}

export interface OpenF1Session {
    session_key: number;
    session_name: string;
    date_start: string;
    date_end: string;
    year: number;
    country_name: string;
    circuit_short_name: string;
}

export interface OpenF1Position {
    session_key: number;
    meeting_key: number;
    driver_number: number;
    date: string;
    position: number;
}

export interface OpenF1Interval {
    session_key: number;
    meeting_key: number;
    driver_number: number;
    date: string;
    gap_to_leader: number | null;
    interval: number | null;
}

export interface OpenF1Driver {
    session_key: number;
    meeting_key: number;
    driver_number: number;
    broadcast_name: string;
    full_name: string;
    name_acronym: string;
    team_name: string;
    team_colour: string;
    first_name?: string;
    last_name?: string;
    headshot_url?: string;
    country_code?: string | null;
}

export interface OpenF1RaceControl {
    session_key: number;
    meeting_key: number;
    date: string;
    category: string;
    message: string;
    flag: string | null;
}

export interface OpenF1Meeting {
    meeting_key: number;
    meeting_name: string;
    meeting_official_name: string;
    country_name: string;
    country_code: string;
    location: string;
    circuit_short_name: string;
    date_start: string;
    date_end: string;
    year: number;
}

export interface OpenF1WeekendSession {
    session_key: number;
    meeting_key: number;
    session_name: string;
    session_type: string;
    date_start: string;
    date_end: string;
    year: number;
    country_name?: string;
    location?: string;
    circuit_short_name?: string;
}

export interface OpenF1SessionResult {
    position: number;
    driver_number: number;
    gap_to_leader: number | string | null;
    session_key: number;
    meeting_key: number;
}

export interface OpenF1ChampionshipDriver {
    meeting_key: number;
    session_key: number;
    driver_number: number;
    position_start: number | null;
    position_current: number;
    points_start: number | null;
    points_current: number;
}

export interface OpenF1CurrentDriverStanding {
    id: string;
    driverNumber: number;
    name: string;
    firstName: string;
    lastName: string;
    abbreviation: string;
    teamName: string;
    teamColor: string;
    points: number;
    position: number;
}

export interface OpenF1CurrentConstructorStanding {
    id: string;
    name: string;
    color: string;
    points: number;
    position: number;
}

export async function getLatestSession(): Promise<OpenF1Session | null> {
    try {
        const response = await axios.get(`${OPENF1_BASE_URL}/sessions?session_key=latest`);
        if (response.data && response.data.length > 0) {
            return response.data[0];
        }
        return null;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
            console.log("No active live session found on OpenF1 at the moment.");
        } else if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
            console.log("OpenF1 locked (Live Session restricted). Mocking session to enable F1TV WebSocket fallback.");
            return {
                session_key: 9999,
                session_name: "Live Session (F1TV Stream)",
                date_start: new Date().toISOString(),
                date_end: new Date().toISOString(),
                year: new Date().getFullYear(),
                country_name: "Live",
                circuit_short_name: "Active Track"
            };
        } else {
            console.error("Error fetching latest session:", error);
        }
        return null;
    }
}

export async function getSessionDrivers(sessionKey: number): Promise<OpenF1Driver[]> {
    try {
        const response = await getCachedOpenF1(
            `drivers:${sessionKey}`,
            async () => (await axios.get(`${OPENF1_BASE_URL}/drivers?session_key=${sessionKey}`)).data
        );
        return response;
    } catch (error) {
        console.error("Error fetching session drivers:", error);
        return [];
    }
}

export async function getLivePositions(sessionKey: number): Promise<OpenF1Position[]> {
    try {
        // Obter as ultimas posicoes conhecidas de cada piloto nesta sessao
        // Num ambiente de produção real com polling, filtra-se por "date>=(last fetched)"
        const response = await axios.get(`${OPENF1_BASE_URL}/position?session_key=${sessionKey}`);

        // A API retorna o historico inteiro de posicoes na sessao. Filtramos apenas a mais recente para cada form_numero
        const positions = response.data as OpenF1Position[];
        const latestPositions = new Map<number, OpenF1Position>();

        positions.forEach(pos => {
            const current = latestPositions.get(pos.driver_number);
            if (!current || new Date(pos.date) > new Date(current.date)) {
                latestPositions.set(pos.driver_number, pos);
            }
        });

        return Array.from(latestPositions.values());
    } catch (error) {
        console.error("Error fetching live positions:", error);
        return [];
    }
}

export async function getLiveIntervals(sessionKey: number): Promise<OpenF1Interval[]> {
    try {
        const response = await axios.get(`${OPENF1_BASE_URL}/intervals?session_key=${sessionKey}`);

        const intervals = response.data as OpenF1Interval[];
        const latestIntervals = new Map<number, OpenF1Interval>();

        intervals.forEach(int => {
            const current = latestIntervals.get(int.driver_number);
            if (!current || new Date(int.date) > new Date(current.date)) {
                latestIntervals.set(int.driver_number, int);
            }
        });

        return Array.from(latestIntervals.values());
    } catch (error) {
        console.error("Error fetching live intervals:", error);
        return [];
    }
}

export interface OpenF1Location {
    session_key: number;
    meeting_key: number;
    driver_number: number;
    date: string;
    x: number;
    y: number;
    z: number;
}

export interface OpenF1Lap {
    session_key: number;
    meeting_key: number;
    driver_number: number;
    lap_number: number;
    lap_duration: number | null;
    date_start: string;
    duration_sector_1: number | null;
    duration_sector_2: number | null;
    duration_sector_3: number | null;
    i1_speed: number | null;
    i2_speed: number | null;
    st_speed: number | null;
    is_pit_out_lap: boolean;
}

export interface OpenF1Stint {
    meeting_key: number;
    session_key: number;
    stint_number: number;
    driver_number: number;
    lap_start: number;
    lap_end: number;
    compound: string | null;
    tyre_age_at_start: number | null;
}

// ... existing functions ...

export async function getLiveLocations(sessionKey: number, dateAfter?: string): Promise<OpenF1Location[]> {
    try {
        let url = `${OPENF1_BASE_URL}/location?session_key=${sessionKey}`;
        if (dateAfter) {
            url += `&date>=${dateAfter}`;
        }
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching live locations:", error);
        return [];
    }
}

export async function getLiveLaps(sessionKey: number): Promise<OpenF1Lap[]> {
    try {
        const response = await axios.get(`${OPENF1_BASE_URL}/laps?session_key=${sessionKey}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching live laps:", error);
        return [];
    }
}

async function getSessionLaps(sessionKey: number): Promise<OpenF1Lap[]> {
    try {
        return await getCachedOpenF1(
            `laps:${sessionKey}`,
            async () => (await axios.get(`${OPENF1_BASE_URL}/laps?session_key=${sessionKey}`)).data
        );
    } catch (error) {
        console.error("Error fetching session laps:", error);
        return [];
    }
}

async function getSessionStints(sessionKey: number): Promise<OpenF1Stint[]> {
    try {
        return await getCachedOpenF1(
            `stints:${sessionKey}`,
            async () => (await axios.get(`${OPENF1_BASE_URL}/stints?session_key=${sessionKey}`)).data
        );
    } catch (error) {
        console.error("Error fetching session stints:", error);
        return [];
    }
}

export async function getRaceControlMessages(sessionKey: number): Promise<OpenF1RaceControl[]> {
    try {
        const response = await axios.get(`${OPENF1_BASE_URL}/race_control?session_key=${sessionKey}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching race control messages:", error);
        return [];
    }
}

export async function getMeetings(year: number): Promise<OpenF1Meeting[]> {
    try {
        const response = await getCachedOpenF1(
            `meetings:${year}`,
            async () => (await axios.get(`${OPENF1_BASE_URL}/meetings?year=${year}`)).data
        );
        return response;
    } catch (error) {
        console.error("Error fetching meetings:", error);
        return [];
    }
}

export async function getMeetingSessions(meetingKey: number): Promise<OpenF1WeekendSession[]> {
    try {
        const response = await getCachedOpenF1(
            `sessions:${meetingKey}`,
            async () => (await axios.get(`${OPENF1_BASE_URL}/sessions?meeting_key=${meetingKey}`)).data
        );
        return response;
    } catch (error) {
        console.error("Error fetching meeting sessions:", error);
        return [];
    }
}

export async function getSessionResults(sessionKey: number): Promise<OpenF1SessionResult[]> {
    try {
        const response = await getCachedOpenF1(
            `session_result:${sessionKey}`,
            async () => (await axios.get(`${OPENF1_BASE_URL}/session_result?session_key=${sessionKey}`)).data
        );
        return response;
    } catch (error) {
        console.error("Error fetching session results:", error);
        return [];
    }
}

export async function getChampionshipDrivers(sessionKey: number): Promise<OpenF1ChampionshipDriver[]> {
    try {
        const response = await getCachedOpenF1(
            `championship_drivers:${sessionKey}`,
            async () => (await axios.get(`${OPENF1_BASE_URL}/championship_drivers?session_key=${sessionKey}`)).data
        );
        return response;
    } catch (error) {
        console.error("Error fetching championship drivers:", error);
        return [];
    }
}

async function getRaceSessions(year = new Date().getUTCFullYear()): Promise<OpenF1WeekendSession[]> {
    try {
        return await getCachedOpenF1(
            `race_sessions:${year}`,
            async () => (await axios.get(`${OPENF1_BASE_URL}/sessions?year=${year}&session_name=Race`)).data
        );
    } catch (error) {
        console.error("Error fetching race sessions:", error);
        return [];
    }
}

async function getLatestCompletedRaceSession(year = new Date().getUTCFullYear()): Promise<OpenF1WeekendSession | null> {
    const now = Date.now();
    const completedSessions = (await getRaceSessions(year))
        .filter((session) => new Date(session.date_end).getTime() <= now)
        .sort((a, b) => new Date(b.date_end).getTime() - new Date(a.date_end).getTime());

    return completedSessions[0] || null;
}

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

const OPENF1_TEAM_ID_ALIASES: Record<string, string> = {
    "red-bull-racing": "red-bull",
    "oracle-red-bull-racing": "red-bull",
    "haas-f1-team": "haas",
    "moneygram-haas-f1-team": "haas",
    "aston-martin-aramco-formula-one-team": "aston-martin",
    "aston-martin": "aston-martin",
    "atlassian-williams-racing": "williams",
    "williams-racing": "williams",
    "visa-cash-app-racing-bulls-f1-team": "rb",
    "racing-bulls": "rb",
    "stake-f1-team-kick-sauber": "sauber",
    "kick-sauber": "sauber",
    "sauber": "sauber",
    "mercedes-amg-petronas-f1-team": "mercedes",
    "scuderia-ferrari": "ferrari",
};

export function normalizeOpenF1TeamId(teamNameOrId: string | null | undefined): string {
    if (!teamNameOrId) return "unknown";

    const normalized = slugify(teamNameOrId);
    return OPENF1_TEAM_ID_ALIASES[normalized] || normalized;
}

export function isChampionshipMeeting(meeting: Pick<OpenF1Meeting, "meeting_name" | "meeting_official_name">) {
    const label = `${meeting.meeting_name} ${meeting.meeting_official_name}`.toLowerCase();
    return !label.includes("testing");
}

async function getCurrentSeasonStandingsData(year = new Date().getUTCFullYear()) {
    const session = await getLatestCompletedRaceSession(year);
    if (!session) {
        return {
            drivers: [] as OpenF1CurrentDriverStanding[],
            constructors: [] as OpenF1CurrentConstructorStanding[],
        };
    }

    const [standings, drivers] = await Promise.all([
        getChampionshipDrivers(session.session_key),
        getSessionDrivers(session.session_key),
    ]);

    const driversByNumber = new Map<number, OpenF1Driver>(
        drivers.map((driver) => [driver.driver_number, driver])
    );

    const currentDrivers = standings
        .map((standing) => {
            const driver = driversByNumber.get(standing.driver_number);
            const fullName = driver?.full_name || String(standing.driver_number);
            const firstName = driver?.first_name || fullName.split(" ")[0] || "";
            const lastName = driver?.last_name || fullName.split(" ").slice(1).join(" ") || "";
            return {
                id: slugify(`${firstName} ${lastName}`.trim() || fullName),
                driverNumber: standing.driver_number,
                name: `${firstName} ${lastName}`.trim() || fullName,
                firstName,
                lastName,
                abbreviation: driver?.name_acronym || fullName.slice(0, 3).toUpperCase(),
                teamName: driver?.team_name || "Unknown",
                teamColor: driver?.team_colour ? `#${driver.team_colour}` : "#888888",
                points: standing.points_current || 0,
                position: standing.position_current,
            };
        })
        .sort((a, b) => a.position - b.position);

    const teams = new Map<string, OpenF1CurrentConstructorStanding>();

    currentDrivers.forEach((driver) => {
        const teamId = normalizeOpenF1TeamId(driver.teamName);
        const current = teams.get(teamId);

        if (current) {
            current.points += driver.points;
            return;
        }

        teams.set(teamId, {
            id: teamId,
            name: driver.teamName || "Unknown",
            color: driver.teamColor,
            points: driver.points,
            position: 0,
        });
    });

    const currentConstructors = Array.from(teams.values())
        .sort((a, b) => b.points - a.points)
        .map((team, index) => ({
            ...team,
            position: index + 1,
        }));

    return {
        drivers: currentDrivers,
        constructors: currentConstructors,
    };
}

export async function getCurrentSeasonDriverStandings(year = new Date().getUTCFullYear()): Promise<OpenF1CurrentDriverStanding[]> {
    const standings = await getCurrentSeasonStandingsData(year);
    return standings.drivers;
}

export async function getCurrentSeasonConstructorStandings(year = new Date().getUTCFullYear()): Promise<OpenF1CurrentConstructorStanding[]> {
    const standings = await getCurrentSeasonStandingsData(year);
    return standings.constructors;
}

export async function getCurrentSeasonStandings(year = new Date().getUTCFullYear()) {
    return getCachedOpenF1(
        `current_standings:${year}`,
        async () => getCurrentSeasonStandingsData(year)
    );
}

export async function getNextMeetingWithSessions(year = new Date().getUTCFullYear()) {
    return getCachedOpenF1(`next_meeting:${year}`, async () => {
        const meetings = (await getMeetings(year)).filter(isChampionshipMeeting);
        const now = Date.now();
        const sortedMeetings = [...meetings].sort(
            (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        );

        const meeting =
            sortedMeetings.find((item) => new Date(item.date_end).getTime() >= now)
            || sortedMeetings[sortedMeetings.length - 1]
            || null;

        if (!meeting) return null;

        const sessions = await getMeetingSessions(meeting.meeting_key);
        return {
            meeting,
            sessions: [...sessions].sort(
                (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
            ),
        };
    });
}

export async function getLatestRacePodium(year = new Date().getUTCFullYear()) {
    return getCachedOpenF1(`latest_podium:${year}`, async () => {
        const raceSessions = (await getRaceSessions(year))
            .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
        const raceSession = await getLatestCompletedRaceSession(year);
        if (!raceSession) return null;
        const raceRound = raceSessions.findIndex((session) => session.session_key === raceSession.session_key) + 1;

        const [results, drivers] = await Promise.all([
            getSessionResults(raceSession.session_key),
            getSessionDrivers(raceSession.session_key),
        ]);

        const topThree = results
            .filter((result) => typeof result.position === "number" && result.position > 0 && result.position <= 3)
            .sort((a, b) => a.position - b.position)
            .map((result) => {
                const driver = drivers.find((item) => item.driver_number === result.driver_number);
                return {
                    position: result.position,
                    driverId: slugify(`${driver?.first_name || ""} ${driver?.last_name || ""}`.trim() || driver?.full_name || String(result.driver_number)),
                    firstName: driver?.first_name || driver?.full_name?.split(" ")[0] || driver?.broadcast_name || String(result.driver_number),
                    lastName: driver?.last_name || driver?.full_name?.split(" ").slice(1).join(" ") || "",
                    constructorId: normalizeOpenF1TeamId(driver?.team_name),
                    teamColor: driver?.team_colour ? `#${driver.team_colour}` : "#888",
                    time: result.position === 1 ? "WIN" : "",
                    gap: typeof result.gap_to_leader === "number" ? `${result.gap_to_leader}s` : result.gap_to_leader || "",
                };
            });

        return {
            race: {
                year: raceSession.year,
                round: raceRound,
                officialname: `${raceSession.country_name} Grand Prix ${raceSession.year}`,
                grands_prix: {
                    name: raceSession.country_name,
                    fullname: `${raceSession.country_name} Grand Prix`,
                },
            },
            podium: topThree,
        };
    });
}

const OPENF1_SESSION_CODE_MAP: Record<string, string[]> = {
    FP1: ["Practice 1"],
    FP2: ["Practice 2"],
    FP3: ["Practice 3"],
    SQ: ["Sprint Qualifying", "Sprint Shootout"],
    S: ["Sprint"],
    Q: ["Qualifying"],
    R: ["Race"],
};

function getOpenF1SessionByCode(sessions: OpenF1WeekendSession[], sessionCode: string) {
    const candidates = OPENF1_SESSION_CODE_MAP[sessionCode] || [sessionCode];
    return sessions.find((session) => candidates.includes(session.session_name)) || null;
}

function getOpenF1ResultStatus(result: OpenF1SessionResult & { dnf?: boolean; dns?: boolean; dsq?: boolean }) {
    if (result.dsq) return "DSQ";
    if (result.dns) return "DNS";
    if (result.dnf) return "DNF";
    return "Finished";
}

export async function getOpenF1SessionSummary(year: number, round: number, sessionCode: string) {
    return getCachedOpenF1(`session_summary:${year}:${round}:${sessionCode}`, async () => {
        const meetings = (await getMeetings(year))
            .filter(isChampionshipMeeting)
            .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());

        const meeting = meetings[round - 1];
        if (!meeting) return null;

        const sessions = await getMeetingSessions(meeting.meeting_key);
        const session = getOpenF1SessionByCode(sessions, sessionCode);
        if (!session) return null;

        const [drivers, laps, stints, results] = await Promise.all([
            getSessionDrivers(session.session_key),
            getSessionLaps(session.session_key),
            getSessionStints(session.session_key),
            getSessionResults(session.session_key),
        ]);

        const driversByNumber = new Map<number, OpenF1Driver>(
            drivers.map((driver) => [driver.driver_number, driver])
        );

        const stintsByDriver = new Map<number, OpenF1Stint[]>();
        stints.forEach((stint) => {
            const current = stintsByDriver.get(stint.driver_number) || [];
            current.push(stint);
            stintsByDriver.set(stint.driver_number, current);
        });

        stintsByDriver.forEach((driverStints) => {
            driverStints.sort((a, b) => a.lap_start - b.lap_start);
        });

        const validLapTimesByDriver = new Map<number, number>();
        laps.forEach((lap) => {
            if (lap.lap_duration == null) return;
            const currentBest = validLapTimesByDriver.get(lap.driver_number);
            if (currentBest == null || lap.lap_duration < currentBest) {
                validLapTimesByDriver.set(lap.driver_number, lap.lap_duration);
            }
        });

        const normalizedLaps = laps
            .map((lap) => {
                const driver = driversByNumber.get(lap.driver_number);
                if (!driver) return null;

                const matchingStint = (stintsByDriver.get(lap.driver_number) || []).find(
                    (stint) => lap.lap_number >= stint.lap_start && lap.lap_number <= stint.lap_end
                );

                return {
                    Driver: driver.name_acronym || driver.broadcast_name || String(lap.driver_number),
                    Team: driver.team_name || "Unknown",
                    LapNumber: lap.lap_number,
                    LapTime: lap.lap_duration != null ? Math.round(lap.lap_duration * 1000) : null,
                    Sector1Time: lap.duration_sector_1 != null ? Math.round(lap.duration_sector_1 * 1000) : null,
                    Sector2Time: lap.duration_sector_2 != null ? Math.round(lap.duration_sector_2 * 1000) : null,
                    Sector3Time: lap.duration_sector_3 != null ? Math.round(lap.duration_sector_3 * 1000) : null,
                    Position: null,
                    Compound: matchingStint?.compound || "UNKNOWN",
                    Stint: matchingStint?.stint_number || 1,
                    IsPersonalBest: lap.lap_duration != null && validLapTimesByDriver.get(lap.driver_number) != null
                        ? Math.abs(lap.lap_duration - Number(validLapTimesByDriver.get(lap.driver_number))) < 0.001
                        : false,
                };
            })
            .filter(Boolean);

        const bestS1 = Math.min(...normalizedLaps.map((lap) => lap?.Sector1Time || Number.POSITIVE_INFINITY));
        const bestS2 = Math.min(...normalizedLaps.map((lap) => lap?.Sector2Time || Number.POSITIVE_INFINITY));
        const bestS3 = Math.min(...normalizedLaps.map((lap) => lap?.Sector3Time || Number.POSITIVE_INFINITY));

        const lapsByDriver = new Map<string, Array<NonNullable<(typeof normalizedLaps)[number]>>>();
        normalizedLaps.forEach((lap) => {
            if (!lap) return;
            const current = lapsByDriver.get(lap.Driver) || [];
            current.push(lap);
            lapsByDriver.set(lap.Driver, current);
        });

        const bestSectors = Array.from(lapsByDriver.entries())
            .map(([driver, driverLaps]) => {
                const timedLaps = driverLaps.filter((lap) => lap.LapTime != null);
                if (!timedLaps.length) return null;

                const fastestLap = [...timedLaps].sort((a, b) => Number(a.LapTime) - Number(b.LapTime))[0];
                const personalBestS1 = Math.min(...timedLaps.map((lap) => lap.Sector1Time || Number.POSITIVE_INFINITY));
                const personalBestS2 = Math.min(...timedLaps.map((lap) => lap.Sector2Time || Number.POSITIVE_INFINITY));
                const personalBestS3 = Math.min(...timedLaps.map((lap) => lap.Sector3Time || Number.POSITIVE_INFINITY));

                const classify = (value: number | null, personalBest: number, overallBest: number) => {
                    if (value == null) return 0;
                    if (value <= overallBest + 1) return 2;
                    if (value <= personalBest + 1) return 1;
                    return 0;
                };

                return {
                    driver,
                    s1: fastestLap.Sector1Time,
                    s1_color: classify(fastestLap.Sector1Time, personalBestS1, bestS1),
                    s2: fastestLap.Sector2Time,
                    s2_color: classify(fastestLap.Sector2Time, personalBestS2, bestS2),
                    s3: fastestLap.Sector3Time,
                    s3_color: classify(fastestLap.Sector3Time, personalBestS3, bestS3),
                };
            })
            .filter(Boolean);

        const speedTraps = Array.from(stintsByDriver.keys()).map((driverNumber) => {
            const driver = driversByNumber.get(driverNumber);
            const driverLaps = laps.filter((lap) => lap.driver_number === driverNumber);

            return {
                driver: driver?.name_acronym || String(driverNumber),
                top_speed: Math.max(...driverLaps.map((lap) => lap.st_speed || 0), 0),
                SpeedST: Math.max(...driverLaps.map((lap) => lap.st_speed || 0), 0),
                SpeedI1: Math.max(...driverLaps.map((lap) => lap.i1_speed || 0), 0),
                SpeedI2: Math.max(...driverLaps.map((lap) => lap.i2_speed || 0), 0),
                SpeedFL: null,
            };
        }).filter((entry) => entry.top_speed > 0);

        const normalizedResults = results.map((result, index) => {
            const driver = driversByNumber.get(result.driver_number);
            return {
                Position: result.position ?? null,
                ClassifiedPosition: result.position ?? String(index + 1),
                Abbreviation: driver?.name_acronym || String(result.driver_number),
                FullName: driver?.full_name || driver?.broadcast_name || String(result.driver_number),
                TeamName: driver?.team_name || "Unknown",
                TeamColor: driver?.team_colour || null,
                DriverNumber: result.driver_number,
                GridPosition: null,
                Status: getOpenF1ResultStatus(result),
                Points: "points" in result ? (result as { points?: number }).points ?? null : null,
                Time: "duration" in result && typeof (result as { duration?: number | null }).duration === "number"
                    ? Math.round(Number((result as { duration?: number }).duration) * 1000)
                    : null,
                Q1: null,
                Q2: null,
                Q3: null,
            };
        });

        return {
            source: "openf1",
            session_info: {
                year,
                round,
                session_name: session.session_name,
                event_name: meeting.meeting_name,
                official_event_name: meeting.meeting_official_name,
                country: meeting.country_name,
                location: meeting.location,
                circuit: meeting.circuit_short_name,
                event_date: meeting.date_start,
                laps: Math.max(...normalizedLaps.map((lap) => Number(lap?.LapNumber || 0)), 0),
                f1_api_support: true,
            },
            results: normalizedResults,
            laps: normalizedLaps,
            stints,
            speed_traps: speedTraps,
            minisectors: [],
            best_sectors: bestSectors,
        };
    });
}

