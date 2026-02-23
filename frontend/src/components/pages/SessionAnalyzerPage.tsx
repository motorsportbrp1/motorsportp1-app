"use client";

import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Timer, BarChart3, LayoutGrid, TrendingDown } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
    mockAllLaps,
    mockDriverResults,
    mockStints,
} from "@/lib/mock-data/session";
import { formatLapTime, TEAM_COLORS } from "@/types";
import { getCompoundColor } from "@/lib/utils";

/* ── Shorthand color helpers ── */
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

const AVAILABLE_DRIVERS = mockDriverResults.slice(0, 4);

export default function SessionAnalyzerPage() {
    const [selectedDrivers, setSelectedDrivers] = useState<string[]>(["VER", "NOR", "LEC"]);
    const [activeTab, setActiveTab] = useState<"laps" | "stints" | "position" | "sectors">("laps");

    const toggleDriver = (abbr: string) => {
        setSelectedDrivers((prev) =>
            prev.includes(abbr)
                ? prev.filter((d) => d !== abbr)
                : [...prev, abbr]
        );
    };

    const filteredLaps = useMemo(
        () => mockAllLaps.filter((l) => selectedDrivers.includes(l.driver)),
        [selectedDrivers]
    );

    const filteredStints = useMemo(
        () => mockStints.filter((s) => selectedDrivers.includes(s.driver)),
        [selectedDrivers]
    );

    // === LAP TIMES CHART ===
    const lapTimesOption = useMemo(() => {
        const series = selectedDrivers.map((driver) => {
            const driverInfo = AVAILABLE_DRIVERS.find((d) => d.abbreviation === driver);
            const laps = filteredLaps
                .filter((l) => l.driver === driver && l.lapTime && l.lapTime < 120000)
                .map((l) => [l.lapNumber, l.lapTime! / 1000]);

            return {
                name: driver,
                type: "scatter",
                data: laps,
                symbolSize: 6,
                itemStyle: {
                    color: driverInfo?.teamColor || "#888",
                    opacity: 0.85,
                },
            };
        });

        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "item",
                backgroundColor: "#1a1a24",
                borderColor: "#2a2a38",
                textStyle: { color: "#f0f0f5", fontSize: 12 },
                formatter: (p: { seriesName: string; data: number[] }) => {
                    return `<b>${p.seriesName}</b><br/>Lap ${p.data[0]}: ${formatLapTime(p.data[1] * 1000)}`;
                },
            },
            legend: {
                top: 0,
                textStyle: { color: "#a0a0b0", fontSize: 12 },
            },
            grid: { left: 60, right: 20, top: 40, bottom: 40 },
            xAxis: {
                name: "Lap",
                nameLocation: "center",
                nameGap: 28,
                nameTextStyle: { color: "#6b6b80" },
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: { color: "#a0a0b0" },
                splitLine: { show: false },
            },
            yAxis: {
                name: "Time (s)",
                nameTextStyle: { color: "#6b6b80" },
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: {
                    color: "#a0a0b0",
                    formatter: (v: number) => v.toFixed(1),
                },
                splitLine: { lineStyle: { color: "#1e1e28" } },
                min: "dataMin",
                max: (value: { max: number }) => value.max + 2,
            },
            series,
        };
    }, [selectedDrivers, filteredLaps]);

    // === POSITION CHART ===
    const positionOption = useMemo(() => {
        const series = selectedDrivers.map((driver) => {
            const driverInfo = AVAILABLE_DRIVERS.find((d) => d.abbreviation === driver);
            const laps = filteredLaps
                .filter((l) => l.driver === driver)
                .map((l, idx) => [l.lapNumber, Math.max(1, (driverInfo?.position || idx + 1) + Math.floor(Math.random() * 3 - 1))]);

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
            legend: { top: 0, textStyle: { color: "#a0a0b0", fontSize: 12 } },
            grid: { left: 50, right: 20, top: 40, bottom: 40 },
            xAxis: {
                name: "Lap",
                nameLocation: "center",
                nameGap: 28,
                nameTextStyle: { color: "#6b6b80" },
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: { color: "#a0a0b0" },
            },
            yAxis: {
                name: "Position",
                inverse: true,
                min: 1,
                max: 10,
                nameTextStyle: { color: "#6b6b80" },
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: { color: "#a0a0b0" },
                splitLine: { lineStyle: { color: "#1e1e28" } },
            },
            series,
        };
    }, [selectedDrivers, filteredLaps]);

    // Tab config
    const tabs = [
        { key: "laps" as const, label: "Lap Times", icon: Timer },
        { key: "stints" as const, label: "Tyre Strategy", icon: LayoutGrid },
        { key: "position" as const, label: "Positions", icon: TrendingDown },
        { key: "sectors" as const, label: "Sector Analysis", icon: BarChart3 },
    ];

    return (
        <>
            <Header />
            <main className="flex-grow p-6 mx-auto w-full" style={{ maxWidth: 1400 }}>
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase tracking-wider font-bold" style={{ color: C.muted }}>
                            Round 5 · 2024
                        </span>
                        <span style={{ color: C.dimmed }}>·</span>
                        <span className="text-xs font-bold uppercase" style={{ color: C.primary }}>
                            Race
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">🇨🇳 Chinese Grand Prix — Session Analyzer</h1>
                    <p className="text-sm font-medium" style={{ color: C.muted }}>Shanghai International Circuit · 56 Laps</p>
                </div>

                {/* Driver Selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {AVAILABLE_DRIVERS.map((driver) => {
                        const selected = selectedDrivers.includes(driver.abbreviation);
                        return (
                            <button
                                key={driver.abbreviation}
                                onClick={() => toggleDriver(driver.abbreviation)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${selected ? "ring-2" : "opacity-50"
                                    }`}
                                style={{
                                    backgroundColor: selected ? `${driver.teamColor}20` : C.surface,
                                    color: selected ? driver.teamColor : C.muted,
                                    border: `2px solid ${selected ? driver.teamColor : C.border}`,
                                }}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: driver.teamColor }}
                                />
                                {driver.abbreviation}
                                <span className="text-xs opacity-60">{driver.team}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div
                    className="flex gap-1 mb-6 p-1 rounded-lg w-fit"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                            style={{
                                backgroundColor: activeTab === tab.key ? C.lighter : "transparent",
                                color: activeTab === tab.key ? "#fff" : C.muted,
                                border: "none",
                            }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Chart Content */}
                <div className="rounded-xl p-5 card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    {activeTab === "laps" && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>
                                Lap Times — Scatter Plot
                            </h3>
                            <ReactECharts
                                option={lapTimesOption}
                                style={{ height: 420 }}
                                opts={{ renderer: "canvas" }}
                            />
                        </div>
                    )}

                    {activeTab === "stints" && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: C.muted }}>
                                Tyre Strategy Timeline
                            </h3>
                            <div className="space-y-3">
                                {selectedDrivers.map((driver) => {
                                    const driverStints = filteredStints.filter((s) => s.driver === driver);
                                    const driverInfo = AVAILABLE_DRIVERS.find((d) => d.abbreviation === driver);
                                    return (
                                        <div key={driver} className="flex items-center gap-4">
                                            <div className="w-12 flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: driverInfo?.teamColor }} />
                                                <span className="text-sm font-bold text-white">
                                                    {driver}
                                                </span>
                                            </div>
                                            <div className="flex-1 flex h-8 rounded overflow-hidden gap-0.5">
                                                {driverStints.map((stint) => {
                                                    const width = ((stint.endLap - stint.startLap + 1) / 56) * 100;
                                                    return (
                                                        <div
                                                            key={`${driver}-${stint.stintNumber}`}
                                                            className="h-full flex items-center justify-center text-[10px] font-bold transition-all duration-200"
                                                            style={{
                                                                width: `${width}%`,
                                                                backgroundColor: getCompoundColor(stint.compound),
                                                                color: stint.compound === "HARD" || stint.compound === "MEDIUM" ? "#111" : "#fff",
                                                                opacity: 0.9,
                                                            }}
                                                            title={`${stint.compound} · Laps ${stint.startLap}-${stint.endLap} · ${formatLapTime(stint.avgLapTime)}`}
                                                        >
                                                            {stint.compound[0]} ({stint.laps})
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Lap scale */}
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="w-12" />
                                    <div className="flex-1 flex justify-between text-[10px] uppercase font-bold" style={{ color: C.dimmed }}>
                                        <span>Lap 1</span>
                                        <span>Lap 14</span>
                                        <span>Lap 28</span>
                                        <span>Lap 42</span>
                                        <span>Lap 56</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "position" && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>
                                Position Chart
                            </h3>
                            <ReactECharts
                                option={positionOption}
                                style={{ height: 420 }}
                                opts={{ renderer: "canvas" }}
                            />
                        </div>
                    )}

                    {activeTab === "sectors" && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: C.muted }}>
                                Sector Analysis — Best Sectors
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-white">
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                            <th className="text-left py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>Driver</th>
                                            <th className="text-right py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>Sector 1</th>
                                            <th className="text-right py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>Sector 2</th>
                                            <th className="text-right py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>Sector 3</th>
                                            <th className="text-right py-3 px-3 font-bold uppercase text-[10px] tracking-wider" style={{ color: C.dimmed }}>Best Lap</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDrivers.map((driver) => {
                                            const driverInfo = AVAILABLE_DRIVERS.find((d) => d.abbreviation === driver);
                                            const laps = filteredLaps.filter((l) => l.driver === driver && l.sector1 && l.sector2 && l.sector3);
                                            const bestS1 = Math.min(...laps.map((l) => l.sector1!));
                                            const bestS2 = Math.min(...laps.map((l) => l.sector2!));
                                            const bestS3 = Math.min(...laps.map((l) => l.sector3!));
                                            const allS1s = selectedDrivers.flatMap((d) =>
                                                filteredLaps.filter((l) => l.driver === d && l.sector1).map((l) => l.sector1!)
                                            );
                                            const overallBestS1 = Math.min(...allS1s);

                                            return (
                                                <tr
                                                    key={driver}
                                                    style={{ borderBottom: `1px solid ${C.border}` }}
                                                >
                                                    <td className="py-3 px-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: driverInfo?.teamColor }} />
                                                            <span className="font-bold">{driver}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-right py-3 px-3 tabular-nums font-bold"
                                                        style={{ color: bestS1 === overallBestS1 ? "#c084fc" : "white" }}>
                                                        {formatLapTime(bestS1)}
                                                    </td>
                                                    <td className="text-right py-3 px-3 tabular-nums font-bold"
                                                        style={{ color: bestS2 <= Math.min(...filteredLaps.filter((l) => l.sector2).map((l) => l.sector2!)) ? "#c084fc" : "white" }}>
                                                        {formatLapTime(bestS2)}
                                                    </td>
                                                    <td className="text-right py-3 px-3 tabular-nums font-bold"
                                                        style={{ color: bestS3 <= Math.min(...filteredLaps.filter((l) => l.sector3).map((l) => l.sector3!)) ? "#c084fc" : "white" }}>
                                                        {formatLapTime(bestS3)}
                                                    </td>
                                                    <td className="text-right py-3 px-3 tabular-nums font-bold">
                                                        {driverInfo?.bestLapTime}
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

                {/* Results Table */}
                <div className="rounded-xl overflow-hidden mt-6 card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div
                        className="px-5 py-4"
                        style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(46,48,54,0.5)" }}
                    >
                        <h3 className="text-sm font-bold uppercase tracking-wide text-white">
                            Race Results
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    {["Pos", "Driver", "Team", "Time", "Points"].map((h) => (
                                        <th
                                            key={h}
                                            className={`py-3 px-4 font-bold uppercase text-[10px] tracking-wider ${h === "Pos" ? "text-center" : "text-left"}`}
                                            style={{ color: C.dimmed }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {mockDriverResults.map((d) => (
                                        <tr
                                        key={d.abbreviation}
                                        className="transition-colors duration-150 hover:bg-white/5"
                                        style={{ borderBottom: `1px solid ${C.border}` }}
                                    >
                                        <td className="py-3 px-4 text-center font-bold" style={{
                                            color: (d.position || 0) <= 3 ? C.primary : "white"
                                        }}>
                                            {d.position}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.teamColor }} />
                                                <span className="font-bold text-white">
                                                    {d.abbreviation}
                                                </span>
                                                <span className="text-xs uppercase" style={{ color: C.dimmed }}>
                                                    {d.fullName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-xs font-bold uppercase" style={{ color: C.muted }}>
                                            {d.team}
                                        </td>
                                        <td className="py-3 px-4 tabular-nums font-bold text-white">
                                            {d.bestLapTime}
                                        </td>
                                        <td className="py-3 px-4 font-bold" style={{ color: d.points > 0 ? C.primary : C.dimmed }}>
                                            {d.points > 0 ? d.points : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
