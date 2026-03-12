"use client";

import Image from "next/image";
import { Fragment, useState, useMemo, useEffect, useRef, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { Timer, BarChart3, LayoutGrid, TrendingDown } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { formatLapTime, TEAM_COLORS } from "@/types";
import { getCompoundColor, getTireImageUrl } from "@/lib/utils";
import { fetchSeasonRaces, fetchSeasons as fetchSupabaseSeasons } from "@/lib/supabase-queries";
import { getOpenF1SessionSummary } from "@/services/openf1";
import { useTranslations } from "next-intl";
import { f1Service, Season } from "@/services/f1Service";
import { usePathname, useRouter } from "next/navigation";
/* â”€â”€ Shorthand color helpers â”€â”€ */
const C = {
    primary: "var(--primary)",
    bg: "var(--bg-dark)",
    surface: "var(--surface)",
    lighter: "var(--surface-lighter)",
    muted: "#94a3b8",
    dimmed: "#64748b",
    faint: "#475569",
    border: "var(--surface-lighter)",
};

function hexToRgba(hex: string, alpha: number): string {
    const sanitized = hex.replace("#", "");
    const normalized = sanitized.length === 3
        ? sanitized.split("").map((char) => char + char).join("")
        : sanitized;

    if (normalized.length !== 6) {
        return `rgba(107, 114, 128, ${alpha})`;
    }

    const value = Number.parseInt(normalized, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type RaceWeekend = {
    round: number;
    officialname?: string;
    grandprixid?: string;
    circuitid?: string;
    laps?: number;
    date?: string;
    freepractice1date?: string | null;
    freepractice2date?: string | null;
    freepractice3date?: string | null;
    qualifyingdate?: string | null;
    sprintqualifyingdate?: string | null;
    sprintracedate?: string | null;
};

type SessionSummary = {
    session_info?: {
        year?: number;
        round?: number;
        session_name?: string;
        event_name?: string;
        official_event_name?: string;
        country?: string;
        location?: string;
        circuit?: string;
        laps?: number;
    };
    laps?: any[];
    stints?: any[];
    results?: any[];
    speed_traps?: any[];
    best_sectors?: any[];
};

type SessionAnalyzerPageProps = {
    initialYear?: number;
    initialRound?: number;
    initialSession?: string;
};

const SESSION_LABELS: Record<string, string> = {
    FP1: "FP1",
    FP2: "FP2",
    FP3: "FP3",
    Q: "Qualifying",
    SQ: "Sprint Shootout",
    S: "Sprint",
    R: "Race",
};

const OPENF1_SUPPORTED_START_YEAR = 2023;

function prettifySlug(value?: string | null) {
    if (!value) return "";

    return value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function toTitleCase(value: string) {
    return value
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function getRaceDisplayName(race?: RaceWeekend | null) {
    if (!race) return "";
    if (race.grandprixid) return `GP ${prettifySlug(race.grandprixid)}`;
    return race.officialname || "";
}

function getRaceDropdownLabel(race?: RaceWeekend | null) {
    if (!race) return "";
    if (race.officialname) {
        const match = race.officialname.match(/([A-Za-z][A-Za-z\s-]+Grand Prix)/i);
        if (match?.[1]) return toTitleCase(match[1]);
    }
    if (race.grandprixid) {
        const pretty = prettifySlug(race.grandprixid);
        return pretty.toLowerCase().includes("grand prix") ? pretty : `${pretty} Grand Prix`;
    }
    return `Round ${race.round}`;
}

function getCircuitDisplayName(race?: RaceWeekend | null) {
    if (!race?.circuitid) return "";
    return prettifySlug(race.circuitid);
}

function buildSessionOptions(race?: RaceWeekend | null) {
    if (!race) return [];

    const options: string[] = [];
    if (race.freepractice1date) options.push("FP1");
    if (race.freepractice2date) options.push("FP2");
    if (race.freepractice3date) options.push("FP3");
    if (race.sprintqualifyingdate) options.push("SQ");
    if (race.sprintracedate) options.push("S");
    if (race.qualifyingdate) options.push("Q");
    if (race.date) options.push("R");

    return options;
}

function normalizeSummaryData(data: any): SessionSummary {
    const normalizeSectorTime = (value: number | null | undefined) => {
        if (value == null) return value;
        return value < 1000 ? Math.round(value * 1000) : value;
    };

    return {
        session_info: data?.session_info || {},
        laps: (data?.laps || []).map((lap: any) => ({
            ...lap,
            Team: lap.Team || "Unknown",
        })),
        stints: data?.stints || [],
        results: data?.results || [],
        speed_traps: data?.speed_traps || [],
        best_sectors: (data?.best_sectors || []).map((sector: any) => ({
            ...sector,
            s1: normalizeSectorTime(sector.s1),
            s2: normalizeSectorTime(sector.s2),
            s3: normalizeSectorTime(sector.s3),
        })),
    };
}

function getAnalysisErrorMessage(error: unknown) {
    const apiError = error as {
        message?: string;
        response?: { status?: number; data?: { detail?: string } | string };
    };

    if (apiError?.response?.status === 404) {
        return "The analysis backend is unavailable right now and this session could not be recovered from the OpenF1 fallback.";
    }

    if (typeof apiError?.response?.data === "string" && apiError.response.data.trim()) {
        return apiError.response.data;
    }

    if (typeof apiError?.response?.data === "object" && apiError.response.data?.detail) {
        return apiError.response.data.detail;
    }

    return apiError?.message || "This session does not have analysis data available right now.";
}

function shouldPreferOpenF1Analysis(year: number) {
    if (typeof window === "undefined") return false;
    const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    return !isLocalHost && year >= OPENF1_SUPPORTED_START_YEAR;
}

export default function SessionAnalyzerPage({
    initialYear,
    initialRound,
    initialSession,
}: SessionAnalyzerPageProps) {
    const t = useTranslations('SessionAnalyzerPage');
    const router = useRouter();
    const pathname = usePathname();
    const initialSelectionApplied = useRef(false);
    const autoAnalyzeTriggered = useRef(false);
    const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"laps" | "stints" | "position" | "speed" | "sectors" | "results">("laps");

    // --- State for Cascading Dropdowns ---
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | "">("");
    const [races, setRaces] = useState<RaceWeekend[]>([]);
    const [selectedRound, setSelectedRound] = useState<number | "">("");
    const [sessions, setSessions] = useState<string[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>("");

    // --- Selected Analysis Data ---
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [telemetrySummary, setTelemetrySummary] = useState<any>(null);

    // Load available seasons on mount
    useEffect(() => {
        async function loadSeasons() {
            try {
                const data = await f1Service.getSeasons();
                if (data.length > 0) {
                    const sortedSeasons = [...data].sort((a, b) => b.year - a.year);
                    setSeasons(sortedSeasons);
                    const preferredYear = initialYear && sortedSeasons.some((season) => season.year === initialYear)
                        ? initialYear
                        : (sortedSeasons[0]?.year ?? "");
                    setSelectedYear(preferredYear);
                }
            } catch (err) {
                console.error("Failed to load seasons:", err);
                try {
                    const fallbackSeasons = await fetchSupabaseSeasons();
                    if (fallbackSeasons.length > 0) {
                        const normalizedSeasons = fallbackSeasons.map((season: { year: number }) => ({
                            year: Number(season.year),
                            url: "",
                        }));
                        const sortedSeasons = [...normalizedSeasons].sort((a, b) => b.year - a.year);
                        setSeasons(sortedSeasons);
                        const preferredYear = initialYear && sortedSeasons.some((season) => season.year === initialYear)
                            ? initialYear
                            : (sortedSeasons[0]?.year ?? "");
                        setSelectedYear(preferredYear);
                    }
                } catch (fallbackError) {
                    console.error("Failed to load seasons from Supabase fallback:", fallbackError);
                }
            }
        }
        loadSeasons();
    }, [initialYear]);

    // Load races when season changes
    useEffect(() => {
        async function loadRaces() {
            if (!selectedYear) return;
            try {
                const data: any = await f1Service.getSeasonRaces(Number(selectedYear));
                if (data && data.races) {
                    setRaces(data.races);
                    if (!initialSelectionApplied.current && initialYear === Number(selectedYear) && initialRound) {
                        setSelectedRound(initialRound);
                    } else {
                        setSelectedRound("");
                    }
                    setSessions([]);
                    setSelectedSession("");
                }
            } catch (err) {
                console.error("Failed to load races:", err);
                try {
                    const fallbackRaces = await fetchSeasonRaces(Number(selectedYear));
                    if (fallbackRaces.length > 0) {
                        setRaces(fallbackRaces as RaceWeekend[]);
                        if (!initialSelectionApplied.current && initialYear === Number(selectedYear) && initialRound) {
                            setSelectedRound(initialRound);
                        } else {
                            setSelectedRound("");
                        }
                        setSessions([]);
                        setSelectedSession("");
                    }
                } catch (fallbackError) {
                    console.error("Failed to load races from Supabase fallback:", fallbackError);
                }
            }
        }
        loadRaces();
    }, [initialRound, initialYear, selectedYear]);

    // Set sessions when a race is selected
    useEffect(() => {
        if (!selectedRound || !races.length) {
            setSessions([]);
            setSelectedSession("");
            return;
        }

        const selectedRace = races.find((race) => race.round === Number(selectedRound));
        const availableSessions = buildSessionOptions(selectedRace);
        setSessions(availableSessions);

        if (!initialSelectionApplied.current && initialSession && availableSessions.includes(initialSession)) {
            setSelectedSession(initialSession);
            initialSelectionApplied.current = true;
            return;
        }

        setSelectedSession((current) => availableSessions.includes(current) ? current : "");
    }, [initialSession, selectedRound, races]);

    // Handle "Analyze" click
    const handleAnalyze = useCallback(async () => {
        if (!selectedYear || !selectedRound || !selectedSession) return;
        setIsAnalyzing(true);
        setTelemetrySummary(null);
        setSelectedDrivers([]);

        const locale = pathname.split("/").filter(Boolean)[0] || "pt-BR";
        const analysisYear = Number(selectedYear);
        const analysisRound = Number(selectedRound);
        router.replace(`/${locale}/analysis/session/${selectedYear}/${selectedRound}/${selectedSession}`);

        const tryOpenF1Fallback = async () => {
            const fallbackData = await getOpenF1SessionSummary(
                analysisYear,
                analysisRound,
                selectedSession
            );

            if (fallbackData && ((fallbackData.laps || []).length > 0 || (fallbackData.results || []).length > 0)) {
                setTelemetrySummary(normalizeSummaryData(fallbackData));
                return true;
            }

            return false;
        };

        try {
            if (shouldPreferOpenF1Analysis(analysisYear)) {
                const loadedFromOpenF1 = await tryOpenF1Fallback();
                if (loadedFromOpenF1) return;
            }

            const data = await f1Service.getFastF1Summary(analysisYear, analysisRound, selectedSession);
            setTelemetrySummary(normalizeSummaryData(data));
        } catch (err) {
            console.error("Failed to extract FastF1 telemetry, trying OpenF1 fallback:", err);

            try {
                const loadedFromOpenF1 = await tryOpenF1Fallback();
                if (loadedFromOpenF1) {
                    return;
                }
            } catch (fallbackError) {
                console.error("OpenF1 fallback also failed:", fallbackError);
            }

            alert(getAnalysisErrorMessage(err));
        } finally {
            setIsAnalyzing(false);
        }
    }, [pathname, router, selectedRound, selectedSession, selectedYear]);

    useEffect(() => {
        if (
            !autoAnalyzeTriggered.current &&
            initialYear &&
            initialRound &&
            initialSession &&
            selectedYear === initialYear &&
            selectedRound === initialRound &&
            selectedSession === initialSession
        ) {
            autoAnalyzeTriggered.current = true;
            handleAnalyze();
        }
    }, [handleAnalyze, initialRound, initialSession, initialYear, selectedRound, selectedSession, selectedYear]);

    const selectedRace = useMemo(
        () => races.find((race) => race.round === Number(selectedRound)) || null,
        [races, selectedRound]
    );

    // Extract unique drivers from lap data dynamically
    const availableDrivers = useMemo(() => {
        if (!telemetrySummary || !telemetrySummary.laps) return [];
        const driverOrder = new Map<string, number>();
        telemetrySummary.results?.forEach((result: any, index: number) => {
            const abbreviation = result.Abbreviation || result.ClassifiedPosition;
            if (abbreviation) {
                driverOrder.set(String(abbreviation), Number(result.Position || result.ClassifiedPosition || index + 1));
            }
        });

        const drivers = new Set<string>();
        telemetrySummary.laps.forEach((lap: any) => {
            if (lap.Driver) drivers.add(lap.Driver);
        });

        return Array.from(drivers)
            .map((abbr) => ({
            abbreviation: abbr,
            teamColor: TEAM_COLORS[telemetrySummary.laps.find((l: any) => l.Driver === abbr)?.Team] || "#888",
            team: telemetrySummary.laps.find((l: any) => l.Driver === abbr)?.Team || "Unknown"
            }))
            .sort((a, b) => (driverOrder.get(a.abbreviation) || 99) - (driverOrder.get(b.abbreviation) || 99));
    }, [telemetrySummary]);

    const selectAllDrivers = useCallback(() => {
        setSelectedDrivers(availableDrivers.map((driver) => driver.abbreviation));
    }, [availableDrivers]);

    const toggleDriver = useCallback((abbr: string) => {
        setSelectedDrivers((prev) => {
            if (prev.includes(abbr)) {
                return prev.length === 1 ? prev : prev.filter((driver) => driver !== abbr);
            }
            return [...prev, abbr];
        });
    }, []);

    // Update selected drivers when data loads if currently empty
    useEffect(() => {
        if (availableDrivers.length > 0 && selectedDrivers.length === 0) {
            setSelectedDrivers(availableDrivers.map(d => d.abbreviation));
        }
    }, [availableDrivers, selectedDrivers.length]);

    const filteredLaps = useMemo(() => {
        if (!telemetrySummary || !telemetrySummary.laps) return [];
        return telemetrySummary.laps.filter((l: any) => selectedDrivers.includes(l.Driver));
    }, [telemetrySummary, selectedDrivers]);

    const filteredStints = useMemo(() => {
        if (!filteredLaps.length) return [];

        const grouped: Array<{ Driver: string; Stint: number; Compound: string; LapStart: number; LapEnd: number }> = [];
        const sortedLaps = [...filteredLaps].sort((a, b) => {
            if (a.Driver === b.Driver) return Number(a.LapNumber) - Number(b.LapNumber);
            return String(a.Driver).localeCompare(String(b.Driver));
        });

        sortedLaps.forEach((lap: any) => {
            const last = grouped[grouped.length - 1];
            if (
                last &&
                last.Driver === lap.Driver &&
                last.Stint === lap.Stint &&
                last.Compound === lap.Compound
            ) {
                last.LapEnd = Number(lap.LapNumber);
                return;
            }

            grouped.push({
                Driver: lap.Driver,
                Stint: Number(lap.Stint || 1),
                Compound: lap.Compound || "UNKNOWN",
                LapStart: Number(lap.LapNumber),
                LapEnd: Number(lap.LapNumber),
            });
        });

        return grouped;
    }, [filteredLaps]);

    const totalLaps = useMemo(() => {
        if (selectedRace?.laps) return Number(selectedRace.laps);
        if (telemetrySummary?.session_info?.laps) return Number(telemetrySummary.session_info.laps);
        return Math.max(...filteredLaps.map((lap: any) => Number(lap.LapNumber || 0)), 1);
    }, [filteredLaps, selectedRace?.laps, telemetrySummary?.session_info?.laps]);

    const displayLapCount = useMemo(() => {
        const maxSelectedLap = Math.max(...filteredLaps.map((lap: any) => Number(lap.LapNumber || 0)), 0);
        return maxSelectedLap || totalLaps;
    }, [filteredLaps, totalLaps]);

    const hasPositionData = filteredLaps.some((lap: any) => lap.Position != null);
    const showPositionTab = (selectedSession === "R" || selectedSession === "S") && hasPositionData;
    const showResultsTab = (telemetrySummary?.results || []).length > 0;
    const activeEventName = telemetrySummary?.session_info?.event_name || getRaceDisplayName(selectedRace);
    const activeSessionLabel = SESSION_LABELS[selectedSession] || selectedSession || "";

    const lapNumbers = useMemo(
        () => Array.from({ length: displayLapCount }, (_, index) => index + 1),
        [displayLapCount]
    );

    const lapLookup = useMemo(() => {
        const lookup = new Map<string, any>();
        filteredLaps.forEach((lap: any) => {
            lookup.set(`${lap.Driver}-${Number(lap.LapNumber)}`, lap);
        });
        return lookup;
    }, [filteredLaps]);

    const allDriversSelected = selectedDrivers.length === availableDrivers.length;

    const bestSectorRows = useMemo(() => {
        if (!telemetrySummary?.best_sectors?.length) return [];
        return telemetrySummary.best_sectors.filter((row: any) => selectedDrivers.includes(row.driver));
    }, [selectedDrivers, telemetrySummary]);

    const sessionBestSectors = useMemo(() => {
        const sectorRows = telemetrySummary?.best_sectors || [];
        const sectorConfig = [
            { key: "s1", colorKey: "s1_color", label: t("sector1") },
            { key: "s2", colorKey: "s2_color", label: t("sector2") },
            { key: "s3", colorKey: "s3_color", label: t("sector3") },
        ];

        return sectorConfig.map(({ key, colorKey, label }) => {
            const purpleRow = sectorRows.find((row: any) => row[colorKey] === 2 && row[key] != null);
            const fallbackRow = [...sectorRows]
                .filter((row: any) => row[key] != null)
                .sort((a: any, b: any) => Number(a[key]) - Number(b[key]))[0];
            const bestRow = purpleRow || fallbackRow;

            return {
                label,
                driver: bestRow?.driver || null,
                value: bestRow?.[key] ?? null,
            };
        });
    }, [t, telemetrySummary?.best_sectors]);

    const speedTrapOption = useMemo(() => {
        const traps = (telemetrySummary?.speed_traps || [])
            .filter((trap: any) => selectedDrivers.includes(trap.driver))
            .sort((a: any, b: any) => (b.SpeedST || b.top_speed || 0) - (a.SpeedST || a.top_speed || 0));

        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                backgroundColor: "#1a1a24",
                borderColor: "#2a2a38",
                textStyle: { color: "#f0f0f5", fontSize: 12 },
            },
            grid: { left: 50, right: 20, top: 30, bottom: 55 },
            xAxis: {
                type: "category",
                data: traps.map((trap: any) => trap.driver),
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: { color: "#f8fafc", fontWeight: "bold" },
            },
            yAxis: {
                type: "value",
                name: "km/h",
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: { color: "#a0a0b0" },
                splitLine: { lineStyle: { color: "#1e1e28" } },
            },
            series: [
                {
                    type: "bar",
                    data: traps.map((trap: any) => ({
                        value: trap.SpeedST || trap.top_speed || 0,
                        itemStyle: {
                            color: availableDrivers.find((driver) => driver.abbreviation === trap.driver)?.teamColor || C.primary,
                        },
                    })),
                    barMaxWidth: 56,
                    borderRadius: [6, 6, 0, 0],
                    label: {
                        show: true,
                        position: "top",
                        color: "#f8fafc",
                        formatter: ({ value }: { value: number }) => `${Math.round(value)} km/h`,
                    },
                },
            ],
        };
    }, [availableDrivers, selectedDrivers, telemetrySummary]);

    useEffect(() => {
        if (!showPositionTab && activeTab === "position") {
            setActiveTab("laps");
        }
        if (!showResultsTab && activeTab === "results") {
            setActiveTab("laps");
        }
    }, [activeTab, showPositionTab, showResultsTab]);

    // === LAP TIMES CHART ===
    const lapTimesOption = useMemo(() => {
        const series = selectedDrivers.map((driver) => {
            const driverInfo = availableDrivers.find((d) => d.abbreviation === driver);
            const laps = filteredLaps
                .filter((l: any) => l.Driver === driver && l.LapTime && l.LapTime < 180000)
                .map((l: any) => [l.LapNumber, l.LapTime! / 1000]);

            return {
                name: driver,
                type: "line",
                data: laps,
                smooth: true,
                connectNulls: false,
                showSymbol: true,
                symbolSize: 7,
                lineStyle: {
                    width: 2.25,
                    color: driverInfo?.teamColor || "#888",
                },
                itemStyle: {
                    color: driverInfo?.teamColor || "#888",
                    borderColor: "#d9dde7",
                    borderWidth: 1.5,
                    opacity: 0.95,
                },
                emphasis: { focus: "series" },
            };
        });

        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                backgroundColor: "#1a1a24",
                borderColor: "#2a2a38",
                textStyle: { color: "#f0f0f5", fontSize: 12 },
                formatter: (params: Array<{ seriesName: string; data: number[] }>) => {
                    if (!params?.length) return "";
                    const lapNumber = params[0]?.data?.[0];
                    const rows = params
                        .map((point) => `<b>${point.seriesName}</b>: ${formatLapTime(point.data[1] * 1000)}`)
                        .join("<br/>");
                    return `${t('lapNum', { num: lapNumber })}<br/>${rows}`;
                },
            },
            legend: {
                type: "scroll",
                top: 0,
                selectedMode: false,
                pageTextStyle: { color: "#94a3b8" },
                pageIconColor: "#ef4444",
                pageIconInactiveColor: "#475569",
                textStyle: { color: "#a0a0b0", fontSize: 11, fontWeight: "bold" },
            },
            grid: { left: 56, right: 18, top: 52, bottom: 38 },
            xAxis: {
                type: "value",
                name: t('lap'),
                nameLocation: "center",
                nameGap: 28,
                nameTextStyle: { color: "#6b6b80" },
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: { color: "#a0a0b0" },
                splitLine: { lineStyle: { color: "#1e1e28", type: "dashed" } },
                min: 1,
                max: displayLapCount,
            },
            yAxis: {
                name: "Lap time",
                nameTextStyle: { color: "#6b6b80" },
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: {
                    color: "#a0a0b0",
                    formatter: (v: number) => formatLapTime(v * 1000),
                },
                splitLine: { lineStyle: { color: "#1e1e28", type: "dashed" } },
                min: (value: { min: number }) => Math.max(0, value.min - 2),
                max: (value: { max: number }) => value.max + 2,
            },
            series,
        };
    }, [availableDrivers, displayLapCount, filteredLaps, selectedDrivers, t]);

    // === POSITION CHART ===
    const positionOption = useMemo(() => {
        const series = selectedDrivers.map((driver) => {
            const driverInfo = availableDrivers.find((d) => d.abbreviation === driver);
            const laps = filteredLaps
                .filter((l: any) => l.Driver === driver)
                .map((l: any, idx: number) => [l.LapNumber, Math.max(1, (l.Position || idx + 1))]);

            return {
                name: driver,
                type: "line",
                data: laps,
                smooth: true,
                lineStyle: { width: 2.5, color: driverInfo?.teamColor || "#888" },
                itemStyle: { color: driverInfo?.teamColor || "#888" },
                showSymbol: false,
            };
        });

        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                backgroundColor: "#1a1a24",
                borderColor: "#2a2a38",
                textStyle: { color: "#f0f0f5", fontSize: 12 },
            },
            legend: {
                type: "scroll",
                top: 0,
                selectedMode: false,
                pageTextStyle: { color: "#94a3b8" },
                pageIconColor: "#ef4444",
                pageIconInactiveColor: "#475569",
                textStyle: { color: "#a0a0b0", fontSize: 11 }
            },
            grid: { left: 50, right: 20, top: 40, bottom: 40 },
            xAxis: {
                type: "value",
                name: t('lap'),
                nameLocation: "center",
                nameGap: 28,
                nameTextStyle: { color: "#6b6b80" },
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: { color: "#a0a0b0" },
                min: 1,
                max: displayLapCount,
            },
            yAxis: {
                name: t('position'),
                inverse: true,
                min: 1,
                max: Math.max(availableDrivers.length, 10),
                nameTextStyle: { color: "#6b6b80" },
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: { color: "#a0a0b0" },
                splitLine: { lineStyle: { color: "#1e1e28" } },
            },
            series,
        };
    }, [availableDrivers, displayLapCount, filteredLaps, selectedDrivers, t]);

    // Tab config
    const tabs = [
        { key: "laps" as const, label: t('tabLapTimes'), icon: Timer },
        { key: "stints" as const, label: t('tabTyreStrategy'), icon: LayoutGrid },
        ...(showPositionTab ? [{ key: "position" as const, label: t('tabPositions'), icon: TrendingDown }] : []),
        { key: "speed" as const, label: t('speedTrap'), icon: BarChart3 },
        { key: "sectors" as const, label: t('tabSectorAnalysis'), icon: BarChart3 },
        ...(showResultsTab ? [{ key: "results" as const, label: t('tabResults'), icon: LayoutGrid }] : []),
    ];

    return (
        <div className="bg-[#05070b] min-h-screen text-slate-200">
            <Header />
            <main className="flex-grow px-3 py-6 md:px-4 lg:px-6 mx-auto w-full" style={{ maxWidth: 1920 }}>
                {/* Header */}
                <div className="mb-5 rounded-3xl p-5 md:p-6 shadow-xl" style={{ background: "linear-gradient(180deg, rgba(16,18,24,0.98) 0%, rgba(10,12,17,0.96) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[11px] uppercase tracking-[0.22em] font-bold" style={{ color: "#8aa0c6" }}>
                                    {activeEventName || `${t('round')} ${selectedRound || "?"}`} - {selectedYear || "----"}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-[2rem] font-bold text-white tracking-tight mb-2 leading-none">
                                {t('title')}
                            </h1>
                            <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
                                {selectedRace
                                    ? [
                                        activeEventName || getRaceDropdownLabel(selectedRace),
                                        activeSessionLabel,
                                        getCircuitDisplayName(selectedRace) || telemetrySummary?.session_info?.location,
                                        `${totalLaps} ${t('lap')}${totalLaps > 1 ? "s" : ""}`,
                                    ].filter(Boolean).join(" - ")
                                    : t('subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[180px_minmax(0,1.35fr)_180px_170px] gap-3 items-end">
                        {/* 1. SEASONS */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">{t('seasonLabel') || "Season"}</label>
                            <select
                                className="w-full appearance-none bg-[#151821] border border-white/8 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer font-medium"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value) || "")}
                            >
                                <option value="" disabled>Select Season</option>
                                {seasons.map((s) => (
                                    <option key={s.year} value={s.year}>{s.year}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. RACES */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">{t('raceLabel') || "Race Weekend"}</label>
                            <select
                                className="w-full appearance-none bg-[#151821] border border-white/8 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                value={selectedRound}
                                onChange={(e) => setSelectedRound(Number(e.target.value) || "")}
                                disabled={!selectedYear || races.length === 0}
                            >
                                <option value="" disabled>Select Race</option>
                                {races.map((r) => (
                                    <option key={r.round} value={r.round}>{getRaceDropdownLabel(r)}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. SESSIONS */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">{t('sessionLabel') || "Session"}</label>
                            <select
                                className="w-full appearance-none bg-[#151821] border border-white/8 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                                disabled={!selectedRound || sessions.length === 0}
                            >
                                <option value="" disabled>Select Session</option>
                                {sessions.map((ses) => (
                                    <option key={ses} value={ses}>{SESSION_LABELS[ses] || ses}</option>
                                ))}
                            </select>
                        </div>

                        {/* ANALYZE BUTTON */}
                        <div className="flex flex-col justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !selectedYear || !selectedRound || !selectedSession}
                                className="h-[48px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.14em]"
                            >
                                {isAnalyzing ? 'Extracting...' : 'Analyze'}
                            </button>
                        </div>
                    </div>
                </div>

                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-[#111111] rounded-2xl border border-white/5 space-y-4 shadow-xl mb-6">
                        <div className="w-12 h-12 rounded-full border-4 border-red-500/20 border-t-red-600 animate-spin"></div>
                        <p className="text-slate-400 font-medium">Extracting Telemetry from FastF1...</p>
                    </div>
                ) : !telemetrySummary ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-[#111111] rounded-2xl border border-white/5 space-y-4 shadow-xl mb-6">
                        <BarChart3 size={48} className="text-slate-700" />
                        <p className="text-slate-500 font-medium text-lg">Select a session context above and click Analyze.</p>
                    </div>
                ) : (
                    <>

                        {/* Tabs */}
                        <div
                            className="flex flex-wrap gap-1 mb-4 p-1 rounded-2xl w-full"
                            style={{ backgroundColor: "#12151d", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer"
                                    style={{
                                        backgroundColor: activeTab === tab.key ? "#202531" : "transparent",
                                        color: activeTab === tab.key ? "#fff" : "#8ea0bd",
                                        border: "none",
                                    }}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Driver Selector */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-2 mb-5">
                            <button
                                onClick={selectAllDrivers}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer"
                                style={{
                                    backgroundColor: allDriversSelected ? "#1f2937" : "#11151d",
                                    color: allDriversSelected ? "#f8fafc" : C.muted,
                                    border: `1px solid ${allDriversSelected ? "#475569" : "rgba(255,255,255,0.08)"}`,
                                }}
                            >
                                TODOS
                            </button>
                            {availableDrivers.map((driver) => {
                                const selected = selectedDrivers.includes(driver.abbreviation);
                                return (
                                    <button
                                        key={driver.abbreviation}
                                        onClick={() => toggleDriver(driver.abbreviation)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer min-w-0 ${selected ? "ring-2" : "opacity-60 hover:opacity-100"
                                            }`}
                                        style={{
                                            backgroundColor: selected ? `${driver.teamColor}18` : "#11151d",
                                            color: selected ? driver.teamColor : C.muted,
                                            border: `1px solid ${selected ? driver.teamColor : "rgba(255,255,255,0.08)"}`,
                                        }}
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: driver.teamColor }}
                                        />
                                        <span className="shrink-0">{driver.abbreviation}</span>
                                        <span className="text-[10px] opacity-60 truncate">{driver.team}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Chart Content */}
                        <div className="rounded-3xl p-4 md:p-5 card-hover" style={{ background: "linear-gradient(180deg, rgba(20,23,31,0.98) 0%, rgba(15,18,25,0.96) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            {activeTab === "laps" && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "#8ea0bd" }}>
                                        {t('scatterPlotTitle')}
                                    </h3>
                                    <div className="rounded-2xl border p-3 md:p-4" style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#10131a" }}>
                                        <ReactECharts
                                            key={`laps-chart-${selectedDrivers.join("-")}`}
                                            option={lapTimesOption}
                                            style={{ height: 360 }}
                                            notMerge
                                            opts={{ renderer: "canvas" }}
                                        />
                                    </div>
                                    <div className="mt-4 rounded-2xl border overflow-x-auto overflow-y-visible" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                        <div
                                            className="min-w-max"
                                        >
                                            <div
                                                className="grid"
                                                style={{ gridTemplateColumns: `64px repeat(${displayLapCount}, minmax(96px, 1fr))` }}
                                            >
                                                <div className="sticky left-0 z-20 px-2.5 py-3 font-bold text-base border-b" style={{ color: "#e5e7eb", backgroundColor: "#0f1218", borderColor: "rgba(255,255,255,0.06)" }}>
                                                    {t('lap')}:
                                                </div>
                                                {lapNumbers.map((lapNumber) => (
                                                    <div
                                                        key={`lap-header-${lapNumber}`}
                                                        className="px-2 py-3 text-center text-sm font-bold border-b border-l"
                                                        style={{ color: "#e5e7eb", borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#0f1218" }}
                                                    >
                                                        {lapNumber}
                                                    </div>
                                                ))}
                                                {selectedDrivers.map((driver) => (
                                                    <Fragment key={`laps-grid-${driver}`}>
                                                        <div className="sticky left-0 z-10 px-2.5 py-3.5 text-sm font-semibold border-t" style={{ color: "#e5e7eb", borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#0f1218" }}>
                                                            {driver}
                                                        </div>
                                                        {lapNumbers.map((lapNumber) => {
                                                            const lap = lapLookup.get(`${driver}-${lapNumber}`);
                                                            const isPersonalBest = Boolean(lap?.IsPersonalBest);
                                                            return (
                                                                <div
                                                                    key={`${driver}-lap-${lapNumber}`}
                                                                    className="p-2 border-t border-l"
                                                                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                                                                >
                                                                    <div
                                                                        className="rounded-xl px-3 py-2.5 min-h-[52px] flex items-center justify-between gap-2 border"
                                                                        style={{
                                                                            backgroundColor: "#171b24",
                                                                            borderColor: isPersonalBest ? "#00c853" : "#343746",
                                                                            boxShadow: isPersonalBest ? "0 0 0 1px rgba(0, 200, 83, 0.25) inset" : "none",
                                                                        }}
                                                                    >
                                                                        <span className="text-[13px] font-semibold tabular-nums leading-none" style={{ color: lap ? "#e5e7eb" : "#7c8294" }}>
                                                                            {lap?.LapTime ? formatLapTime(lap.LapTime) : "N/A"}
                                                                        </span>
                                                                        {lap?.Compound ? (
                                                                            <Image
                                                                                src={getTireImageUrl(lap.Compound)}
                                                                                alt={lap.Compound}
                                                                                width={16}
                                                                                height={16}
                                                                                className="w-4 h-4 shrink-0"
                                                                                unoptimized
                                                                            />
                                                                        ) : (
                                                                            <span className="text-xs font-bold uppercase" style={{ color: "#7c8294" }}>
                                                                                --
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "stints" && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#8ea0bd" }}>
                                        {t('tyreTimelineTitle')}
                                    </h3>
                                    <div className="rounded-2xl border overflow-x-auto overflow-y-visible" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                        <div
                                            className="min-w-max"
                                        >
                                            <div
                                                className="grid"
                                                style={{ gridTemplateColumns: `64px repeat(${displayLapCount}, minmax(52px, 1fr))` }}
                                            >
                                                <div className="sticky left-0 z-20 px-2.5 py-3 font-bold text-sm border-b" style={{ color: "#e5e7eb", borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#0f1218" }}>
                                                    {t('lap')}:
                                                </div>
                                                {lapNumbers.map((lapNumber) => (
                                                    <div
                                                        key={`stint-header-${lapNumber}`}
                                                        className="px-1.5 py-3 text-center text-[11px] font-bold border-b border-l"
                                                        style={{ color: "#e5e7eb", borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#0f1218" }}
                                                    >
                                                        {lapNumber}
                                                    </div>
                                                ))}
                                                {selectedDrivers.map((driver) => {
                                                    const driverStints = filteredStints.filter((s: any) => s.Driver === driver);
                                                    const driverInfo = availableDrivers.find((d) => d.abbreviation === driver);
                                                    if (driverStints.length === 0) return null;

                                                    return (
                                                        <Fragment key={`stint-grid-${driver}`}>
                                                            <div className="sticky left-0 z-10 px-3 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#0f1218" }}>
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: driverInfo?.teamColor }} />
                                                                <span className="text-sm font-bold text-white">{driver}</span>
                                                            </div>
                                                            <div className="relative border-b" style={{ borderColor: "rgba(255,255,255,0.06)", gridColumn: `span ${displayLapCount}` }}>
                                                                <div
                                                                    className="absolute inset-0 grid"
                                                                    style={{ gridTemplateColumns: `repeat(${displayLapCount}, minmax(52px, 1fr))` }}
                                                                >
                                                                    {lapNumbers.map((lapNumber) => (
                                                                        <div
                                                                            key={`${driver}-stint-cell-${lapNumber}`}
                                                                            className="border-l"
                                                                            style={{ borderColor: "rgba(255,255,255,0.06)" }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <div
                                                                    className="relative grid min-h-[88px] items-center px-1.5 py-3"
                                                                    style={{ gridTemplateColumns: `repeat(${displayLapCount}, minmax(52px, 1fr))` }}
                                                                >
                                                                    {driverStints.map((stint: any) => {
                                                                        const lapSpan = stint.LapEnd - stint.LapStart + 1;
                                                                        const compoundColor = getCompoundColor(stint.Compound);
                                                                        const compoundGlow = hexToRgba(compoundColor, 0.28);
                                                                        const compoundFillStrong = hexToRgba(compoundColor, 0.88);
                                                                        const compoundFillSoft = hexToRgba(compoundColor, 0.72);
                                                                        return (
                                                                            <div
                                                                                key={`${driver}-${stint.Stint}`}
                                                                                className="relative h-[56px] mx-1 rounded-xl border overflow-hidden"
                                                                                style={{
                                                                                    gridColumn: `${stint.LapStart} / span ${lapSpan}`,
                                                                                    background: `linear-gradient(90deg, ${compoundFillStrong} 0%, ${compoundFillSoft} 100%)`,
                                                                                    color: stint.Compound === "HARD" || stint.Compound === "MEDIUM" ? "#111" : "#fff",
                                                                                    borderColor: compoundColor,
                                                                                    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.18), 0 0 0 1px ${hexToRgba(compoundColor, 0.18)}, 0 10px 24px ${compoundGlow}`,
                                                                                }}
                                                                                title={`${stint.Compound} · ${t('lap')} ${stint.LapStart}-${stint.LapEnd}`}
                                                                            >
                                                                                <div
                                                                                    className="absolute inset-0"
                                                                                    style={{
                                                                                        background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.12) 100%)",
                                                                                    }}
                                                                                />
                                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                                    <div
                                                                                        className="w-7 h-7 rounded-full flex items-center justify-center border overflow-hidden"
                                                                                        style={{
                                                                                            backgroundColor: "rgba(255,255,255,0.82)",
                                                                                            borderColor: "rgba(0,0,0,0.30)",
                                                                                        }}
                                                                                    >
                                                                                        <Image
                                                                                            src={getTireImageUrl(stint.Compound)}
                                                                                            alt={stint.Compound}
                                                                                            width={18}
                                                                                            height={18}
                                                                                            className="w-[18px] h-[18px] shrink-0"
                                                                                            unoptimized
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 min-w-0">
                                                                                    <span className="text-[9px] font-bold uppercase opacity-80">
                                                                                        P{stint.Stint}
                                                                                    </span>
                                                                                </div>
                                                                                {lapSpan > 2 && (
                                                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold whitespace-nowrap opacity-75">
                                                                                        {lapSpan}L
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "speed" && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "#8ea0bd" }}>
                                        {t('speedTrap')}
                                    </h3>
                                    {(telemetrySummary?.speed_traps || []).length > 0 ? (
                                        <ReactECharts
                                            key={`speed-chart-${selectedDrivers.join("-")}`}
                                            option={speedTrapOption}
                                            style={{ height: 385 }}
                                            notMerge
                                            opts={{ renderer: "canvas" }}
                                        />
                                    ) : (
                                        <div className="h-[385px] rounded-xl border border-white/5 flex items-center justify-center text-sm" style={{ color: C.dimmed }}>
                                            {t('speedTrapEmpty')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {showPositionTab && activeTab === "position" && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "#8ea0bd" }}>
                                        {t('positionChartTitle')}
                                    </h3>
                                    <ReactECharts
                                        key={`position-chart-${selectedDrivers.join("-")}`}
                                        option={positionOption}
                                        style={{ height: 340 }}
                                        notMerge
                                        opts={{ renderer: "canvas" }}
                                    />
                                </div>
                            )}

                            {activeTab === "sectors" && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#8ea0bd" }}>
                                        {t('sectorAnalysisTitle')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                                        {sessionBestSectors.map((sector) => (
                                            <div
                                                key={sector.label}
                                                className="rounded-2xl border p-4"
                                                style={{ backgroundColor: "#11151d", borderColor: "#7c3aed40" }}
                                            >
                                                <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-2" style={{ color: "#c084fc" }}>
                                                    {sector.label}
                                                </p>
                                                <div className="flex items-end justify-between gap-3">
                                                    <div>
                                                        <p className="text-lg font-bold text-white">
                                                            {sector.value ? formatLapTime(sector.value) : "--"}
                                                        </p>
                                                        <p className="text-xs mt-1" style={{ color: C.muted }}>
                                                            {sector.driver || "--"}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full" style={{ backgroundColor: "#7c3aed22", color: "#c084fc" }}>
                                                        {t('sessionBest')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-white">
                                            <thead>
                                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                                    <th className="text-left py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>{t('driver')}</th>
                                                    <th className="text-right py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>{t('sector1')}</th>
                                                    <th className="text-right py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>{t('sector2')}</th>
                                                    <th className="text-right py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>{t('sector3')}</th>
                                                    <th className="text-right py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>{t('bestLap')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedDrivers.map((driver) => {
                                                    const driverInfo = availableDrivers.find((d) => d.abbreviation === driver);
                                                    const sectorRow = bestSectorRows.find((row: any) => row.driver === driver);
                                                    const s1 = sectorRow?.s1;
                                                    const s2 = sectorRow?.s2;
                                                    const s3 = sectorRow?.s3;
                                                    const isSessionBestS1 = sectorRow?.s1_color === 2;
                                                    const isSessionBestS2 = sectorRow?.s2_color === 2;
                                                    const isSessionBestS3 = sectorRow?.s3_color === 2;

                                                    const bestLap = filteredLaps.filter((l: any) => l.Driver === driver).reduce((min: any, l: any) =>
                                                        min === undefined || (l.LapTime && l.LapTime < min) ? l.LapTime : min, undefined
                                                    );

                                                    return (
                                                        <tr
                                                            key={driver}
                                                            style={{ borderBottom: `1px solid ${C.border}` }}
                                                        >
                                                            <td className="py-2.5 px-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: driverInfo?.teamColor }} />
                                                                    <span className="font-bold">{driver}</span>
                                                                </div>
                                                            </td>
                                                            <td className="text-right py-2.5 px-3 tabular-nums font-bold"
                                                                style={{ color: isSessionBestS1 ? "#c084fc" : "white" }}>
                                                                <span className="inline-flex min-w-[88px] justify-center rounded-lg px-3 py-2" style={{ backgroundColor: isSessionBestS1 ? "#7c3aed22" : "#17181d" }}>
                                                                    {s1 ? formatLapTime(s1) : "--"}
                                                                </span>
                                                            </td>
                                                            <td className="text-right py-2.5 px-3 tabular-nums font-bold"
                                                                style={{ color: isSessionBestS2 ? "#c084fc" : "white" }}>
                                                                <span className="inline-flex min-w-[88px] justify-center rounded-lg px-3 py-2" style={{ backgroundColor: isSessionBestS2 ? "#7c3aed22" : "#17181d" }}>
                                                                    {s2 ? formatLapTime(s2) : "--"}
                                                                </span>
                                                            </td>
                                                            <td className="text-right py-2.5 px-3 tabular-nums font-bold"
                                                                style={{ color: isSessionBestS3 ? "#c084fc" : "white" }}>
                                                                <span className="inline-flex min-w-[88px] justify-center rounded-lg px-3 py-2" style={{ backgroundColor: isSessionBestS3 ? "#7c3aed22" : "#17181d" }}>
                                                                    {s3 ? formatLapTime(s3) : "--"}
                                                                </span>
                                                            </td>
                                                            <td className="text-right py-2.5 px-3 tabular-nums font-bold">
                                                                <span className="inline-flex min-w-[88px] justify-center rounded-lg px-3 py-2" style={{ backgroundColor: "#17181d" }}>
                                                                    {bestLap ? formatLapTime(bestLap) : "--"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {activeTab === "results" && showResultsTab && (
                            <div className="rounded-3xl overflow-hidden mt-5 card-hover" style={{ background: "linear-gradient(180deg, rgba(20,23,31,0.98) 0%, rgba(15,18,25,0.96) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div
                                    className="px-5 py-4"
                                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
                                >
                                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                                        {activeSessionLabel ? `${activeSessionLabel} - ${t('tabResults')}` : t('tabResults')}
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                                {[t('pos'), t('driver'), t('team'), t('time'), t('points')].map((h) => (
                                                    <th
                                                        key={h}
                                                        className={`py-3 px-4 font-bold uppercase text-[10px] tracking-wider ${h === t('pos') ? "text-center" : "text-left"}`}
                                                        style={{ color: C.dimmed }}
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableDrivers.map((d, index) => {
                                                const sessionResult = telemetrySummary?.results?.find((result: any) => result.Abbreviation === d.abbreviation);
                                                const bestLap = filteredLaps.filter((l: any) => l.Driver === d.abbreviation).reduce((min: any, l: any) =>
                                                    min === undefined || (l.LapTime && l.LapTime < min) ? l.LapTime : min, undefined
                                                );

                                                return (
                                                    <tr
                                                        key={d.abbreviation}
                                                        className="transition-colors duration-150 hover:bg-white/5"
                                                        style={{ borderBottom: `1px solid ${C.border}` }}
                                                    >
                                                        <td className="py-3 px-4 text-center font-bold" style={{
                                                            color: index <= 2 ? C.primary : "white"
                                                        }}>
                                                            {sessionResult?.Position || sessionResult?.ClassifiedPosition || index + 1}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.teamColor }} />
                                                                <span className="font-bold text-white">
                                                                    {d.abbreviation}
                                                                </span>
                                                                <span className="text-xs uppercase hidden md:block" style={{ color: C.dimmed }}>
                                                                    {d.team}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-xs font-bold uppercase" style={{ color: C.muted }}>
                                                            {d.team}
                                                        </td>
                                                        <td className="py-3 px-4 tabular-nums font-bold text-white">
                                                            {bestLap ? formatLapTime(bestLap) : "--"}
                                                        </td>
                                                        <td className="py-3 px-4 font-bold" style={{ color: C.dimmed }}>
                                                            {sessionResult?.Points ?? "--"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}






