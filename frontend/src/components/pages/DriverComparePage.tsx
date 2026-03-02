"use client";

import { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { ArrowLeftRight, Zap, BarChart2, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
    mockTelemetryVER,
    mockTelemetryNOR,
    mockDelta,
    mockCornerDeltas,
} from "@/lib/mock-data/telemetry";
import { formatDelta } from "@/types";
import { fetchSeasonDrivers } from "@/lib/supabase-queries";
import { useDataFetch } from "@/hooks/useDataFetch";
import { f1Service } from "@/services/f1Service";
import { useTranslations } from "next-intl";

type DriverOption = { driverId: string; abbreviation: string; fullName: string; firstName: string; lastName: string; constructorId: string; teamColor: string; driverNumber: number; };

export default function DriverComparePage() {
    const t = useTranslations('DriverComparePage');
    const [drivers, setDrivers] = useState<DriverOption[]>([]);
    const [driver1, setDriver1] = useState("");
    const [driver2, setDriver2] = useState("");
    const [activeTab, setActiveTab] = useState<"speed" | "delta" | "corners">("speed");
    const [loadingDrivers, setLoadingDrivers] = useState(true);

    // Fetch real drivers from the latest season
    useEffect(() => {
        async function loadDrivers() {
            try {
                const data = await fetchSeasonDrivers(2025);
                if (data.length > 0) {
                    setDrivers(data);
                    setDriver1(data[0]?.abbreviation || "");
                    setDriver2(data[1]?.abbreviation || "");
                }
            } catch (err) {
                console.error("Error loading drivers:", err);
            } finally {
                setLoadingDrivers(false);
            }
        }
        loadDrivers();
    }, []);

    const DRIVERS = drivers;
    const d1Info = DRIVERS.find((d) => d.abbreviation === driver1);
    const d2Info = DRIVERS.find((d) => d.abbreviation === driver2);

    // Fetch real telemetry via background worker
    const { data: telemetryData, isLoading: loadingTelemetry, error: telemetryError } = useDataFetch(
        async () => {
            if (!driver1 || !driver2) return null;
            // Defaults to 2024 round 21 (Vegas) for guaranteed FastF1 data during testing
            return f1Service.getCompareTelemetry(2024, 21, "R", driver1, driver2);
        },
        [driver1, driver2],
        !driver1 || !driver2
    );

    // === SPEED TRACE OVERLAY ===
    const speedOption = useMemo(() => {
        const d1Data = (telemetryData as any)?.[driver1]?.telemetry;
        const d2Data = (telemetryData as any)?.[driver2]?.telemetry;

        const d1SpeedData = d1Data ? d1Data.Speed : mockTelemetryVER.map((s) => s.speed);
        const d2SpeedData = d2Data ? d2Data.Speed : mockTelemetryNOR.map((s) => s.speed);
        const distanceAxis = d1Data ? d1Data.Distance.map((d: number) => Math.round(d)) : mockTelemetryVER.map((s) => Math.round(s.distance));

        return {
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                backgroundColor: "#1a1a24",
                borderColor: "#2a2a38",
                textStyle: { color: "#f0f0f5", fontSize: 12 },
            },
            legend: { top: 0, textStyle: { color: "#a0a0b0", fontSize: 12 } },
            grid: { left: 55, right: 20, top: 40, bottom: 50 },
            xAxis: {
                name: t('distanceM'),
                nameLocation: "center",
                nameGap: 32,
                nameTextStyle: { color: "#6b6b80" },
                data: distanceAxis,
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: {
                    color: "#a0a0b0",
                    interval: 49,
                    formatter: (v: string) => `${(parseInt(v) / 1000).toFixed(1)}km`,
                },
                splitLine: { show: false },
            },
            yAxis: {
                name: t('speedKmh'),
                nameTextStyle: { color: "#6b6b80" },
                axisLine: { lineStyle: { color: "#2a2a38" } },
                axisLabel: { color: "#a0a0b0" },
                splitLine: { lineStyle: { color: "#1e1e28" } },
            },
            series: [
                {
                    name: driver1,
                    type: "line",
                    data: d1SpeedData,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: { width: 2, color: d1Info?.teamColor || "#3671C6" },
                    itemStyle: { color: d1Info?.teamColor || "#3671C6" },
                    areaStyle: { opacity: 0.1, color: d1Info?.teamColor || "#3671C6" },
                },
                {
                    name: driver2,
                    type: "line",
                    data: d2SpeedData,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: { width: 2, color: d2Info?.teamColor || "#FF8000" },
                    itemStyle: { color: d2Info?.teamColor || "#FF8000" },
                    areaStyle: { opacity: 0.1, color: d2Info?.teamColor || "#FF8000" },
                },
            ],
        };
    }, [driver1, driver2, d1Info, d2Info, telemetryData]);

    // === DELTA CHART ===
    const deltaOption = useMemo(() => ({
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            backgroundColor: "#1a1a24",
            borderColor: "#2a2a38",
            textStyle: { color: "#f0f0f5", fontSize: 12 },
            formatter: (params: Array<{ data: [number, number] }>) => {
                const d = params[0]?.data;
                return d
                    ? `${t('distanceM').split(' ')[0]}: ${(d[0] / 1000).toFixed(2)}km<br/>${t('delta')}: ${formatDelta(d[1])}s`
                    : "";
            },
        },
        grid: { left: 55, right: 20, top: 20, bottom: 50 },
        xAxis: {
            name: t('distanceM'),
            nameLocation: "center" as const,
            nameGap: 32,
            nameTextStyle: { color: "#6b6b80" },
            axisLine: { lineStyle: { color: "#2a2a38" } },
            axisLabel: {
                color: "#a0a0b0",
                formatter: (v: number) => `${(v / 1000).toFixed(1)}km`,
            },
            splitLine: { show: false },
        },
        yAxis: {
            name: t('deltaS'),
            nameTextStyle: { color: "#6b6b80" },
            axisLine: { lineStyle: { color: "#2a2a38" } },
            axisLabel: {
                color: "#a0a0b0",
                formatter: (v: number) => formatDelta(v),
            },
            splitLine: { lineStyle: { color: "#1e1e28" } },
        },
        visualMap: {
            show: false,
            pieces: [
                { lte: 0, color: d1Info?.teamColor || "#3671C6" },
                { gt: 0, color: d2Info?.teamColor || "#FF8000" },
            ],
        },
        series: [
            {
                type: "line",
                data: mockDelta.map((d) => [d.distance, d.deltaTime]),
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 2 },
                areaStyle: { opacity: 0.15 },
                markLine: {
                    data: [{ yAxis: 0, lineStyle: { color: "#6b6b80", type: "dashed" } }],
                    label: { show: false },
                    silent: true,
                },
            },
        ],
    }), [d1Info, d2Info]);

    const tabs = [
        { key: "speed" as const, label: t('tabSpeedTrace'), icon: Zap },
        { key: "delta" as const, label: t('tabDelta'), icon: BarChart2 },
        { key: "corners" as const, label: t('tabCorners'), icon: ArrowLeftRight },
    ];

    return (
        <>
            <Header />
            <main className="flex-grow p-6 max-w-[1400px] mx-auto w-full">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="page-title">
                        <ArrowLeftRight
                            size={24}
                            style={{ color: "var(--f1-red)", display: "inline", verticalAlign: "middle", marginRight: 8 }}
                        />
                        {t('title')}
                    </h1>
                    <p className="page-subtitle">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Demo Data Banner */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-6" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    {loadingTelemetry ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent-blue)' }}></div>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                <span className="font-bold" style={{ color: "var(--accent-blue)" }}>{t('loadingLiveData')}</span> — {t('loadingLiveDataDesc')}
                            </p>
                        </>
                    ) : telemetryData ? (
                        <>
                            <Zap size={16} style={{ color: "var(--accent-blue)" }} />
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                <span className="font-bold" style={{ color: "var(--accent-blue)" }}>{t('liveData')}</span> — {t('liveDataDesc')}
                            </p>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={16} style={{ color: "var(--accent-blue)" }} />
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                <span className="font-bold" style={{ color: "var(--accent-blue)" }}>{t('demoData')}</span> — {t('demoDataDesc')}
                            </p>
                        </>
                    )}
                </div>

                {/* Driver Picker Dual */}
                <div className="card p-5 mb-6">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        {/* Driver 1 */}
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{ backgroundColor: d1Info?.teamColor, color: "#fff" }}
                            >
                                {driver1}
                            </div>
                            <select
                                value={driver1}
                                onChange={(e) => setDriver1(e.target.value)}
                                className="h-10 px-3 rounded-lg text-sm font-medium outline-none cursor-pointer"
                                style={{
                                    backgroundColor: "var(--bg-tertiary)",
                                    border: "1px solid var(--border-primary)",
                                    color: "var(--text-primary)",
                                }}
                            >
                                {DRIVERS.map((d) => (
                                    <option key={d.abbreviation} value={d.abbreviation}>
                                        {d.fullName} ({d.abbreviation})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* VS */}
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black"
                            style={{
                                background: "var(--gradient-primary)",
                                color: "#fff",
                            }}
                        >
                            VS
                        </div>

                        {/* Driver 2 */}
                        <div className="flex items-center gap-3">
                            <select
                                value={driver2}
                                onChange={(e) => setDriver2(e.target.value)}
                                className="h-10 px-3 rounded-lg text-sm font-medium outline-none cursor-pointer"
                                style={{
                                    backgroundColor: "var(--bg-tertiary)",
                                    border: "1px solid var(--border-primary)",
                                    color: "var(--text-primary)",
                                }}
                            >
                                {DRIVERS.map((d) => (
                                    <option key={d.abbreviation} value={d.abbreviation}>
                                        {d.fullName} ({d.abbreviation})
                                    </option>
                                ))}
                            </select>
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{ backgroundColor: d2Info?.teamColor, color: "#fff" }}
                            >
                                {driver2}
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="flex justify-center gap-8 mt-5">
                        {[
                            { label: t('driver1'), v1: d1Info?.fullName || driver1, v2: "", single: true, color: d1Info?.teamColor },
                            {
                                label: t('telemetry'),
                                v1: "",
                                v2: telemetryData ? t('liveData') : t('demoData'),
                                single: true,
                                color: "var(--accent-blue)",
                            },
                            { label: t('driver2'), v1: "", v2: d2Info?.fullName || driver2, single: true, color: d2Info?.teamColor },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p
                                    className="text-[10px] uppercase tracking-wider font-medium mb-1"
                                    style={{ color: "var(--text-tertiary)" }}
                                >
                                    {stat.label}
                                </p>
                                <p className="text-sm font-bold" style={{ color: stat.color || "var(--text-primary)" }}>
                                    {stat.v2 || stat.v1}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div
                    className="flex gap-1 mb-6 p-1 rounded-lg w-fit"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer"
                            style={{
                                backgroundColor: activeTab === tab.key ? "var(--bg-card)" : "transparent",
                                color: activeTab === tab.key ? "var(--text-primary)" : "var(--text-tertiary)",
                                border: "none",
                                boxShadow: activeTab === tab.key ? "var(--shadow-sm)" : "none",
                            }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Chart Content */}
                <div className="card p-4">
                    {activeTab === "speed" && (
                        <div>
                            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                                {t('speedTraceTitle')}
                            </h3>
                            <ReactECharts option={speedOption} style={{ height: 400 }} opts={{ renderer: "canvas" }} />
                        </div>
                    )}

                    {activeTab === "delta" && (
                        <div>
                            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                                {t('timeDeltaTitle', { driver1, driver2 })}
                            </h3>
                            <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
                                {t('timeDeltaDesc', { driver1, driver2 })}
                            </p>
                            <ReactECharts option={deltaOption} style={{ height: 350 }} opts={{ renderer: "canvas" }} />
                        </div>
                    )}

                    {activeTab === "corners" && (
                        <div>
                            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>
                                {t('cornerAnalysisTitle')}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid var(--border-primary)" }}>
                                            <th className="text-center py-3 px-3 font-medium" style={{ color: "var(--text-tertiary)" }}>{t('corner')}</th>
                                            <th className="text-right py-3 px-3 font-medium" style={{ color: d1Info?.teamColor }}>{t('driverSpeed', { driver: driver1 })}</th>
                                            <th className="text-right py-3 px-3 font-medium" style={{ color: d2Info?.teamColor }}>{t('driverSpeed', { driver: driver2 })}</th>
                                            <th className="text-right py-3 px-3 font-medium" style={{ color: "var(--text-tertiary)" }}>{t('delta')}</th>
                                            <th className="text-center py-3 px-3 font-medium" style={{ color: "var(--text-tertiary)" }}>{t('advantage')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockCornerDeltas.map((corner) => (
                                            <tr
                                                key={corner.number}
                                                style={{ borderBottom: "1px solid var(--border-primary)" }}
                                            >
                                                <td className="text-center py-2.5 px-3 font-bold" style={{ color: "var(--text-primary)" }}>
                                                    T{corner.number}
                                                </td>
                                                <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: "var(--text-primary)" }}>
                                                    {corner.speed1} km/h
                                                </td>
                                                <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: "var(--text-primary)" }}>
                                                    {corner.speed2} km/h
                                                </td>
                                                <td className="text-right py-2.5 px-3 tabular-nums font-medium" style={{
                                                    color: corner.delta < 0 ? d1Info?.teamColor : d2Info?.teamColor,
                                                }}>
                                                    {formatDelta(corner.delta)}s
                                                </td>
                                                <td className="text-center py-2.5 px-3">
                                                    <span
                                                        className="inline-block w-6 h-6 rounded-full text-[10px] font-bold leading-6"
                                                        style={{
                                                            backgroundColor: corner.delta < 0 ? `${d1Info?.teamColor}30` : `${d2Info?.teamColor}30`,
                                                            color: corner.delta < 0 ? d1Info?.teamColor : d2Info?.teamColor,
                                                        }}
                                                    >
                                                        {corner.delta < 0 ? driver1[0] : driver2[0]}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
