"use client";

import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { ArrowLeftRight, Zap, BarChart2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
    mockTelemetryVER,
    mockTelemetryNOR,
    mockDelta,
    mockCornerDeltas,
} from "@/lib/mock-data/telemetry";
import { mockDriverResults } from "@/lib/mock-data/session";
import { formatDelta } from "@/types";

const DRIVERS = mockDriverResults.slice(0, 6);

export default function DriverComparePage() {
    const [driver1, setDriver1] = useState("VER");
    const [driver2, setDriver2] = useState("NOR");
    const [activeTab, setActiveTab] = useState<"speed" | "delta" | "corners">("speed");

    const d1Info = DRIVERS.find((d) => d.abbreviation === driver1);
    const d2Info = DRIVERS.find((d) => d.abbreviation === driver2);

    // === SPEED TRACE OVERLAY ===
    const speedOption = useMemo(() => ({
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
            name: "Distance (m)",
            nameLocation: "center" as const,
            nameGap: 32,
            nameTextStyle: { color: "#6b6b80" },
            data: mockTelemetryVER.map((s) => Math.round(s.distance)),
            axisLine: { lineStyle: { color: "#2a2a38" } },
            axisLabel: {
                color: "#a0a0b0",
                interval: 49,
                formatter: (v: string) => `${(parseInt(v) / 1000).toFixed(1)}km`,
            },
            splitLine: { show: false },
        },
        yAxis: {
            name: "Speed (km/h)",
            nameTextStyle: { color: "#6b6b80" },
            axisLine: { lineStyle: { color: "#2a2a38" } },
            axisLabel: { color: "#a0a0b0" },
            splitLine: { lineStyle: { color: "#1e1e28" } },
        },
        series: [
            {
                name: driver1,
                type: "line",
                data: mockTelemetryVER.map((s) => s.speed),
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 2, color: d1Info?.teamColor || "#3671C6" },
                itemStyle: { color: d1Info?.teamColor || "#3671C6" },
                areaStyle: { opacity: 0.05, color: d1Info?.teamColor || "#3671C6" },
            },
            {
                name: driver2,
                type: "line",
                data: mockTelemetryNOR.map((s) => s.speed),
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 2, color: d2Info?.teamColor || "#FF8000" },
                itemStyle: { color: d2Info?.teamColor || "#FF8000" },
                areaStyle: { opacity: 0.05, color: d2Info?.teamColor || "#FF8000" },
            },
        ],
    }), [driver1, driver2, d1Info, d2Info]);

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
                    ? `Distance: ${(d[0] / 1000).toFixed(2)}km<br/>Delta: ${formatDelta(d[1])}s`
                    : "";
            },
        },
        grid: { left: 55, right: 20, top: 20, bottom: 50 },
        xAxis: {
            name: "Distance (m)",
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
            name: "Delta (s)",
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
        { key: "speed" as const, label: "Speed Trace", icon: Zap },
        { key: "delta" as const, label: "Delta", icon: BarChart2 },
        { key: "corners" as const, label: "Corner Analysis", icon: ArrowLeftRight },
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
                        Driver Compare
                    </h1>
                    <p className="page-subtitle">
                        Telemetry overlay, time delta, and corner-by-corner analysis
                    </p>
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
                            { label: "Best Lap", v1: d1Info?.bestLapTime || "—", v2: d2Info?.bestLapTime || "—" },
                            {
                                label: "Delta",
                                v1: "",
                                v2: formatDelta(
                                    ((d1Info?.bestLapTimeMs || 0) - (d2Info?.bestLapTimeMs || 0)) / 1000
                                ) + "s",
                                single: true,
                            },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p
                                    className="text-[10px] uppercase tracking-wider font-medium mb-1"
                                    style={{ color: "var(--text-tertiary)" }}
                                >
                                    {stat.label}
                                </p>
                                {stat.single ? (
                                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                        {stat.v2}
                                    </p>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold tabular-nums" style={{ color: d1Info?.teamColor }}>
                                            {stat.v1}
                                        </span>
                                        <span style={{ color: "var(--text-tertiary)" }}>|</span>
                                        <span className="text-sm font-bold tabular-nums" style={{ color: d2Info?.teamColor }}>
                                            {stat.v2}
                                        </span>
                                    </div>
                                )}
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
                                Speed Trace Overlay — Best Lap
                            </h3>
                            <ReactECharts option={speedOption} style={{ height: 400 }} opts={{ renderer: "canvas" }} />
                        </div>
                    )}

                    {activeTab === "delta" && (
                        <div>
                            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                                Time Delta — {driver1} vs {driver2}
                            </h3>
                            <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
                                Below zero = {driver1} ahead · Above zero = {driver2} ahead
                            </p>
                            <ReactECharts option={deltaOption} style={{ height: 350 }} opts={{ renderer: "canvas" }} />
                        </div>
                    )}

                    {activeTab === "corners" && (
                        <div>
                            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>
                                Corner-by-Corner Analysis
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid var(--border-primary)" }}>
                                            <th className="text-center py-3 px-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Corner</th>
                                            <th className="text-right py-3 px-3 font-medium" style={{ color: d1Info?.teamColor }}>{driver1} Speed</th>
                                            <th className="text-right py-3 px-3 font-medium" style={{ color: d2Info?.teamColor }}>{driver2} Speed</th>
                                            <th className="text-right py-3 px-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Delta</th>
                                            <th className="text-center py-3 px-3 font-medium" style={{ color: "var(--text-tertiary)" }}>Advantage</th>
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
