"use client";

import { Radio, Flag, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { mockLiveTimingState } from "@/lib/mock-data/live";
import { getCompoundColor, getCompoundShort } from "@/lib/utils";

export default function LiveTimingPage() {
    const state = mockLiveTimingState;

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
                            <Radio
                                size={24}
                                className="inline animate-pulse-glow"
                                style={{ color: "var(--f1-red)", verticalAlign: "middle", marginRight: 8 }}
                            />
                            Live Timing
                        </h1>
                        <p className="page-subtitle">
                            🇨🇳 Chinese Grand Prix — Race · Lap {state.currentLap}/{state.totalLaps}
                        </p>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: "rgba(225, 6, 0, 0.1)",
                                border: "1px solid rgba(225, 6, 0, 0.3)",
                            }}
                        >
                            <span
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: "var(--f1-red)" }}
                            />
                            <span className="text-xs font-medium" style={{ color: "var(--f1-red)" }}>
                                LIVE (Mock)
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-1.5 px-2 py-1"
                            style={{ color: "var(--accent-green)" }}
                        >
                            <Wifi size={14} />
                            <span className="text-xs font-medium">Connected</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Timing Table — 3/4 */}
                    <div className="xl:col-span-3">
                        <div className="card p-0 overflow-hidden">
                            <div
                                className="overflow-x-auto"
                                style={{ minWidth: 0 }}
                            >
                                <table className="w-full text-sm" style={{ minWidth: 800 }}>
                                    <thead>
                                        <tr
                                            style={{
                                                borderBottom: "2px solid var(--border-primary)",
                                                backgroundColor: "var(--bg-tertiary)",
                                            }}
                                        >
                                            {["Pos", "", "Driver", "Gap", "Int", "Last Lap", "S1", "S2", "S3", "Tyre", "Pits"].map((h) => (
                                                <th
                                                    key={h}
                                                    className={`py-3 px-3 font-medium text-[11px] uppercase tracking-wider ${["Pos", "Pits"].includes(h) ? "text-center" : "text-left"
                                                        }`}
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
                                                    <span
                                                        className="font-bold"
                                                        style={{
                                                            color: driver.position <= 3 ? "var(--f1-red)" : "var(--text-primary)",
                                                        }}
                                                    >
                                                        {driver.position}
                                                    </span>
                                                </td>

                                                {/* Team color bar */}
                                                <td className="py-2.5 px-0 w-1">
                                                    <div
                                                        className="w-1 h-5 rounded-full"
                                                        style={{ backgroundColor: driver.teamColor }}
                                                    />
                                                </td>

                                                {/* Driver name */}
                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                                                            {driver.abbreviation}
                                                        </span>
                                                        {driver.inPit && (
                                                            <span
                                                                className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                                                                style={{
                                                                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                                                                    color: "var(--accent-blue)",
                                                                }}
                                                            >
                                                                PIT
                                                            </span>
                                                        )}
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

                                                {/* Last Lap */}
                                                <td className="py-2.5 px-3 tabular-nums text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                                    {driver.lastLapTime || "—"}
                                                </td>

                                                {/* Sectors */}
                                                {[driver.sector1, driver.sector2, driver.sector3].map((sector, si) => (
                                                    <td key={si} className="py-2.5 px-2">
                                                        {sector ? (
                                                            <span
                                                                className="inline-block px-2 py-0.5 rounded text-[11px] font-bold tabular-nums"
                                                                style={{
                                                                    backgroundColor: getSectorBg(sector.status),
                                                                    color: getSectorColor(sector.status),
                                                                }}
                                                            >
                                                                {sector.time}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>—</span>
                                                        )}
                                                    </td>
                                                ))}

                                                {/* Tyre */}
                                                <td className="py-2.5 px-3">
                                                    {driver.compound ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span
                                                                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
                                                                style={{
                                                                    backgroundColor: getCompoundColor(driver.compound),
                                                                    color: driver.compound === "HARD" || driver.compound === "MEDIUM" ? "#111" : "#fff",
                                                                }}
                                                            >
                                                                {getCompoundShort(driver.compound)}
                                                            </span>
                                                            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                                                                L{driver.tyreAge}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>—</span>
                                                    )}
                                                </td>

                                                {/* Pits */}
                                                <td className="py-2.5 px-3 text-center text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                                                    {driver.pitCount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right panel — Race Control */}
                    <div className="space-y-6">
                        {/* Race Progress */}
                        <div className="card p-5">
                            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                                Race Progress
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
                                    <span>Lap {state.currentLap}</span>
                                    <span>{state.totalLaps} Laps</span>
                                </div>
                                <div
                                    className="w-full h-2 rounded-full overflow-hidden"
                                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${((state.currentLap || 0) / (state.totalLaps || 56)) * 100}%`,
                                            background: "var(--gradient-primary)",
                                        }}
                                    />
                                </div>
                                <p className="text-center text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
                                    {(state.totalLaps || 56) - (state.currentLap || 0)} laps remaining
                                </p>
                            </div>
                        </div>

                        {/* Race Control Feed */}
                        <div className="card p-0 overflow-hidden">
                            <div
                                className="px-5 py-4 flex items-center gap-2"
                                style={{ borderBottom: "1px solid var(--border-primary)" }}
                            >
                                <Flag size={16} style={{ color: "var(--f1-red)" }} />
                                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                    Race Control
                                </h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {state.raceControlMessages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className="px-5 py-3"
                                        style={{
                                            borderBottom:
                                                idx < state.raceControlMessages.length - 1
                                                    ? "1px solid var(--border-primary)"
                                                    : "none",
                                        }}
                                    >
                                        <div className="flex items-start gap-2">
                                            {msg.flag === "GREEN" && (
                                                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--accent-green)" }} />
                                            )}
                                            {msg.flag === "YELLOW" && (
                                                <AlertTriangle size={12} className="mt-1 shrink-0" style={{ color: "var(--accent-yellow)" }} />
                                            )}
                                            {msg.flag === "VSC" && (
                                                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse" style={{ backgroundColor: "var(--accent-yellow)" }} />
                                            )}
                                            {!msg.flag && (
                                                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--text-tertiary)" }} />
                                            )}
                                            <div>
                                                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                                    {msg.message}
                                                </p>
                                                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                                                    {new Date(msg.utc).toLocaleTimeString("en-US", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
