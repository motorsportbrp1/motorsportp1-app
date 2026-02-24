"use client";

import { useState, useEffect } from "react";
import { Radio, Flag, AlertTriangle, Wifi, History, ChevronDown } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCompoundColor, getCompoundShort } from "@/lib/utils";
import { fetchReplayData, fetchAvailableRacesForReplay } from "@/lib/supabase-queries";
import { LiveTimingState, LiveDriver, RaceControlMessage } from "@/types";

export default function LiveTimingPage() {
    const [state, setState] = useState<LiveTimingState | null>(null);
    const [availableRaces, setAvailableRaces] = useState<any[]>([]);
    const [selectedRace, setSelectedRace] = useState<{ year: number; round: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPicker, setShowPicker] = useState(false);

    // Fetch available races for the dropdown
    useEffect(() => {
        async function loadRaces() {
            const races = await fetchAvailableRacesForReplay(30);
            setAvailableRaces(races);
            // Auto-select the most recent race
            if (races.length > 0) {
                const latest = races[0];
                setSelectedRace({ year: latest.year, round: latest.round });
            }
        }
        loadRaces();
    }, []);

    // Fetch replay data when race is selected
    useEffect(() => {
        if (!selectedRace) return;
        async function loadReplay() {
            setLoading(true);
            try {
                const data = await fetchReplayData(selectedRace!.year, selectedRace!.round);
                if (data) {
                    setState({
                        sessionStatus: "Finalised",
                        trackStatus: "AllClear",
                        timestamp: new Date().toISOString(),
                        currentLap: data.race.totalLaps,
                        totalLaps: data.race.totalLaps,
                        drivers: data.drivers as LiveDriver[],
                        raceControlMessages: generateReplayMessages(data),
                    });
                }
            } catch (err) {
                console.error("Error loading replay:", err);
            } finally {
                setLoading(false);
            }
        }
        loadReplay();
    }, [selectedRace]);

    // Generate race control messages from result data
    function generateReplayMessages(data: any): RaceControlMessage[] {
        const messages: RaceControlMessage[] = [];
        messages.push({ utc: new Date().toISOString(), category: "Flag", message: "CHEQUERED FLAG — RACE FINISHED", flag: "CHECKERED" });

        const retiredDrivers = data.drivers.filter((d: any) => d.retired);
        retiredDrivers.forEach((d: any) => {
            messages.push({ utc: new Date().toISOString(), category: "CarEvent", message: `${d.abbreviation} — RETIRED`, flag: "YELLOW" });
        });

        const winner = data.drivers.find((d: any) => d.position === 1);
        if (winner) {
            messages.push({ utc: new Date().toISOString(), category: "Other", message: `${winner.abbreviation} WINS THE RACE!`, flag: "GREEN" });
        }
        messages.push({ utc: new Date().toISOString(), category: "Flag", message: "DRS ENABLED", flag: null });
        messages.push({ utc: new Date().toISOString(), category: "Flag", message: "GREEN FLAG — RACE START", flag: "GREEN" });
        return messages;
    }

    const currentRaceLabel = availableRaces.find(r => r.year === selectedRace?.year && r.round === selectedRace?.round);

    const getSectorColor = (status: string | undefined) => {
        switch (status) {
            case "purple": return "var(--sector-purple)";
            case "green": return "var(--sector-green)";
            case "yellow": return "var(--sector-yellow)";
            default: return "var(--text-tertiary)";
        }
    };

    const getSectorBg = (status: string | undefined) => {
        switch (status) {
            case "purple": return "rgba(168, 85, 247, 0.15)";
            case "green": return "rgba(34, 197, 94, 0.15)";
            case "yellow": return "rgba(234, 179, 8, 0.12)";
            default: return "transparent";
        }
    };

    return (
        <>
            <Header />
            <main className="flex-grow p-6 max-w-[1400px] mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="page-title">
                            <History
                                size={24}
                                className="inline"
                                style={{ color: "var(--f1-red)", verticalAlign: "middle", marginRight: 8 }}
                            />
                            Race Replay
                        </h1>
                        <p className="page-subtitle">
                            {currentRaceLabel?.grands_prix?.name || currentRaceLabel?.officialname || "Select a race"} — Final Classification
                            {state && ` · ${state.totalLaps} Laps`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Race Picker */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPicker(!showPicker)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: "var(--bg-tertiary)",
                                    border: "1px solid var(--border-primary)",
                                    color: "var(--text-primary)",
                                }}
                            >
                                <History size={14} />
                                {currentRaceLabel?.grands_prix?.name || "Selecionar Corrida"}
                                <ChevronDown size={14} />
                            </button>
                            {showPicker && (
                                <div
                                    className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden shadow-2xl max-h-96 overflow-y-auto w-80"
                                    style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
                                >
                                    {availableRaces.map((race) => (
                                        <button
                                            key={`${race.year}-${race.round}`}
                                            className="w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors"
                                            style={{
                                                borderBottom: "1px solid var(--border-primary)",
                                                color: "var(--text-primary)",
                                                backgroundColor: selectedRace?.year === race.year && selectedRace?.round === race.round
                                                    ? "rgba(225, 6, 0, 0.1)"
                                                    : "transparent",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedRace?.year === race.year && selectedRace?.round === race.round ? "rgba(225, 6, 0, 0.1)" : "transparent")}
                                            onClick={() => { setSelectedRace({ year: race.year, round: race.round }); setShowPicker(false); }}
                                        >
                                            <div>
                                                <div className="font-bold">{race.grands_prix?.name || race.officialname}</div>
                                                <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>Round {race.round} · {race.year}</div>
                                            </div>
                                            <span className="text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>{race.date}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Replay badge */}
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                            }}
                        >
                            <History size={12} style={{ color: "var(--accent-blue)" }} />
                            <span className="text-xs font-medium" style={{ color: "var(--accent-blue)" }}>
                                Replay Mode
                            </span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--f1-red)", borderTopColor: "transparent" }} />
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Carregando dados da corrida...</p>
                        </div>
                    </div>
                ) : state ? (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Timing Table — 3/4 */}
                        <div className="xl:col-span-3">
                            <div className="card p-0 overflow-hidden">
                                <div className="overflow-x-auto" style={{ minWidth: 0 }}>
                                    <table className="w-full text-sm" style={{ minWidth: 800 }}>
                                        <thead>
                                            <tr
                                                style={{
                                                    borderBottom: "2px solid var(--border-primary)",
                                                    backgroundColor: "var(--bg-tertiary)",
                                                }}
                                            >
                                                {["Pos", "", "Driver", "Gap", "Int", "Best Lap", "Pits", "Status"].map((h) => (
                                                    <th
                                                        key={h}
                                                        className={`py-3 px-3 font-medium text-[11px] uppercase tracking-wider ${["Pos", "Pits"].includes(h) ? "text-center" : "text-left"}`}
                                                        style={{ color: "var(--text-tertiary)" }}
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {state.drivers.map((driver, idx) => (
                                                <tr
                                                    key={driver.driverNumber}
                                                    className="transition-colors duration-150"
                                                    style={{
                                                        borderBottom: idx < state.drivers.length - 1 ? "1px solid var(--border-primary)" : "none",
                                                        opacity: driver.retired ? 0.4 : 1,
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                                >
                                                    {/* Position */}
                                                    <td className="py-2.5 px-3 text-center">
                                                        <span className="font-bold" style={{ color: driver.position <= 3 ? "var(--f1-red)" : "var(--text-primary)" }}>
                                                            {driver.retired ? "RET" : driver.position}
                                                        </span>
                                                    </td>
                                                    {/* Team color bar */}
                                                    <td className="py-2.5 px-0 w-1">
                                                        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: driver.teamColor }} />
                                                    </td>
                                                    {/* Driver name */}
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{driver.abbreviation}</span>
                                                            <span className="text-[10px] uppercase" style={{ color: "var(--text-tertiary)" }}>{driver.team}</span>
                                                        </div>
                                                    </td>
                                                    {/* Gap */}
                                                    <td className="py-2.5 px-3 tabular-nums text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                                        {driver.gap}
                                                    </td>
                                                    {/* Interval */}
                                                    <td className="py-2.5 px-3 tabular-nums text-xs" style={{ color: "var(--text-secondary)" }}>
                                                        {driver.interval}
                                                    </td>
                                                    {/* Best Lap */}
                                                    <td className="py-2.5 px-3 tabular-nums text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                                        {driver.bestLapTime || "—"}
                                                    </td>
                                                    {/* Pits */}
                                                    <td className="py-2.5 px-3 text-center text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                                                        {driver.pitCount}
                                                    </td>
                                                    {/* Status */}
                                                    <td className="py-2.5 px-3 text-xs">
                                                        {driver.retired ? (
                                                            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>RET</span>
                                                        ) : driver.position <= 3 ? (
                                                            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }}>PODIUM</span>
                                                        ) : (
                                                            <span style={{ color: "var(--text-tertiary)" }}>Finished</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right panel */}
                        <div className="space-y-6">
                            {/* Race Progress */}
                            <div className="card p-5">
                                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                                    Race Summary
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
                                        <span>Completed</span>
                                        <span>{state.totalLaps} Laps</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                                        <div className="h-full rounded-full" style={{ width: "100%", background: "var(--gradient-primary)" }} />
                                    </div>
                                    <div className="flex justify-between text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                                        <span>Finishers: {state.drivers.filter(d => !d.retired).length}</span>
                                        <span>DNF: {state.drivers.filter(d => d.retired).length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Race Control Feed */}
                            <div className="card p-0 overflow-hidden">
                                <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                                    <Flag size={16} style={{ color: "var(--f1-red)" }} />
                                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                        Race Highlights
                                    </h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {state.raceControlMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className="px-5 py-3"
                                            style={{ borderBottom: idx < state.raceControlMessages.length - 1 ? "1px solid var(--border-primary)" : "none" }}
                                        >
                                            <div className="flex items-start gap-2">
                                                {msg.flag === "GREEN" && <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--accent-green)" }} />}
                                                {msg.flag === "YELLOW" && <AlertTriangle size={12} className="mt-1 shrink-0" style={{ color: "var(--accent-yellow)" }} />}
                                                {msg.flag === "CHECKERED" && <Flag size={12} className="mt-1 shrink-0" style={{ color: "var(--f1-red)" }} />}
                                                {!msg.flag && <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--text-tertiary)" }} />}
                                                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p style={{ color: "var(--text-secondary)" }}>Selecione uma corrida para visualizar</p>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
