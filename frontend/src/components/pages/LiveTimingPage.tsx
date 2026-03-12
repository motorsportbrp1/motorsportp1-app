"use client";

import { useState, useEffect, useRef } from "react";
import { Flag, AlertTriangle, Wifi, Activity, Volume2, AlertOctagon } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useTranslations } from "next-intl";
import LiveTrackMap from './LiveTrackMap';
import { OpenF1Session, OpenF1Driver, OpenF1Location, OpenF1RaceControl, getLatestSession } from "@/services/openf1";

// WebSocket baseline
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const WS_URL = API_BASE_URL.replace(/^http/i, "ws").replace(/\/api\/v1\/?$/, "/api/v1/live/ws");

// Interfaces adaptadas para a UI
interface LiveUIRow {
    driverNumber: number;
    position: number;
    teamColor: string;
    abbreviation: string;
    team: string;
    gap: string;
    interval: string;
}

export default function LiveTimingPage() {
    const t = useTranslations('LiveTimingPage');

    const [session, setSession] = useState<OpenF1Session | null>(null);
    const [driversMap, setDriversMap] = useState<Map<number, OpenF1Driver>>(new Map());
    const [locationsMap, setLocationsMap] = useState<Map<number, OpenF1Location>>(new Map());
    const [tableData, setTableData] = useState<LiveUIRow[]>([]);
    const [messages, setMessages] = useState<OpenF1RaceControl[]>([]);
    const [teamRadios, setTeamRadios] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const socketRef = useRef<WebSocket | null>(null);

    // Bootstrap basic session data if available (optional, but good for context)
    useEffect(() => {
        async function fetchInitial() {
            const latestSession = await getLatestSession();
            setSession(latestSession ?? {
                session_key: 9999,
                session_name: "Live Session (F1TV Stream)",
                date_start: new Date().toISOString(),
                date_end: new Date().toISOString(),
                year: new Date().getFullYear(),
                country_name: "Live",
                circuit_short_name: "Active Track"
            });
            setLoading(false);
        }
        fetchInitial();
    }, []);

    // WebSocket Management
    useEffect(() => {
        if (loading) return;

        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Connected to MotorsportP1 Live Proxy");
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'feed' && message.data) {
                    processLiveFeed(message.data);
                    setLastSync(new Date());
                }
            } catch (err) {
                console.error("WS Message Error:", err);
            }
        };

        socket.onclose = () => {
            console.log("Disconnected from MotorsportP1 Live Proxy");
            // Reconnect logic could be added here
        };

        return () => {
            socket.close();
        };
    }, [loading]);

    // Data Processing logic for F1 SignalR
    function processLiveFeed(items: any[]) {
        items.forEach(item => {
            const { method, data } = item;

            // Handle Position Data
            if (method === "Position.z") {
                // SignalR Position.z structure: { Position: [ { Timestamp: "...", Entries: { "44": { "Line": [...] } } } ] }
                if (data?.Position) {
                    setLocationsMap(prev => {
                        const newMap = new Map(prev);
                        data.Position.forEach((pos: any) => {
                            Object.entries(pos.Entries).forEach(([driverNum, detail]: [string, any]) => {
                                const lastLine = detail.Line?.[detail.Line.length - 1];
                                if (lastLine) {
                                    newMap.set(parseInt(driverNum), {
                                        driver_number: parseInt(driverNum),
                                        date: pos.Timestamp,
                                        x: lastLine.X,
                                        y: lastLine.Y,
                                        z: lastLine.Z,
                                        session_key: session?.session_key ?? 0
                                    } as any);
                                }
                            });
                        });
                        return newMap;
                    });
                }
            }

            // Handle Timing Data
            if (method === "TimingData") {
                // TimingData update: { Lines: { "44": { "GapToLeader": "+1.2s", "IntervalToNext": "+0.5s", "Position": 1 } } }
                if (data?.Lines) {
                    setTableData(prev => {
                        const existing = new Map(prev.map(row => [row.driverNumber, row]));

                        Object.entries(data.Lines).forEach(([num, timing]: [string, any]) => {
                            const dNum = parseInt(num);
                            const driver = driversMap.get(dNum);
                            if (!driver) return;

                            const current = existing.get(dNum);
                            existing.set(dNum, {
                                driverNumber: dNum,
                                position: timing.Position ?? current?.position ?? 0,
                                teamColor: driver.team_colour ? `#${driver.team_colour}` : (current?.teamColor ?? "#999"),
                                abbreviation: driver.name_acronym,
                                team: driver.team_name,
                                gap: timing.GapToLeader ?? current?.gap ?? "—",
                                interval: timing.IntervalToNext ?? current?.interval ?? "—"
                            });
                        });

                        return Array.from(existing.values()).sort((a, b) => a.position - b.position);
                    });
                }
            }

            // Handle Race Control Messages
            if (method === "RaceControlMessages") {
                if (data?.Messages) {
                    setMessages(prev => {
                        const newMsgs = [...(data.Messages as any[])];
                        // Convert SignalR message to OpenF1 format for compatibility
                        const normalized = newMsgs.map(m => ({
                            date: m.Utc,
                            message: m.Message,
                            category: m.Category,
                            flag: m.Flag,
                            session_key: session?.session_key ?? 0
                        } as any));

                        const merged = [...normalized, ...prev].slice(0, 50); // Keep last 50
                        return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    });
                }
            }

            // Handle Driver List
            if (method === "DriverList" && data) {
                setDriversMap(prev => {
                    const newMap = new Map(prev);
                    // F1TV DriverList format is an object of drivers with car number as keys
                    Object.entries(data).forEach(([carStr, driverData]: [string, any]) => {
                        const dNum = parseInt(carStr);
                        if (!isNaN(dNum)) {
                            newMap.set(dNum, {
                                session_key: session?.session_key ?? 0,
                                meeting_key: 0,
                                driver_number: dNum,
                                broadcast_name: driverData.BroadcastName ?? 'Unknown',
                                full_name: driverData.FullName ?? 'Unknown',
                                name_acronym: driverData.Tla ?? 'UNK',
                                team_name: driverData.TeamName ?? 'Unknown',
                                team_colour: driverData.TeamColour ?? '999999',
                            });
                        }
                    });
                    return newMap;
                });
            }
            // Handle Team Radio
            if (method === "TeamRadio" && data?.Captures) {
                setTeamRadios(prev => {
                    const newRadios = [...data.Captures];
                    const merged = [...newRadios, ...prev].slice(0, 20); // Maintain last 20
                    return merged.sort((a, b) => new Date(b.Utc).getTime() - new Date(a.Utc).getTime());
                });
            }
        });
    }

    return (
        <div className="bg-[#1a1b1e] text-slate-100 min-h-screen flex flex-col font-display">
            <Header />
            <main className="flex-grow p-4 lg:p-8 max-w-[1500px] mx-auto w-full">

                {/* Header Superior */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-6 border-b border-white/5 gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#2a2b30] text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border border-white/5">
                                {session ? `${session.country_name} — ${session.circuit_short_name}` : t('connectingOpenF1')}
                            </span>
                            <span className="bg-[#e81932]/20 text-[#e81932] border border-[#e81932]/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 uppercase font-bold tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#e81932] animate-pulse"></span>
                                {t('live')}
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                            {session ? session.session_name : t('title')}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 font-medium flex items-center gap-2">
                            <Wifi size={14} className="text-green-500 animate-pulse" />
                            {t('connectedStream')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-[#232429] border border-[#303238] rounded-xl px-4 py-2">
                        <Activity size={16} className="text-slate-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('lastSync')}</span>
                            <span className="text-xs font-mono text-white">{loading ? '--:--:--' : lastSync.toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-t-transparent border-[#e81932] rounded-full animate-spin mb-4" />
                        <p className="text-sm font-mono text-slate-400 tracking-widest uppercase">{t('connectingTiming')}</p>
                    </div>
                ) : !session ? (
                    <div className="text-center py-32 bg-[#111111] border border-white/5 rounded-xl shadow-2xl">
                        <p className="text-slate-400">{t('noActiveSessions')}</p>
                        <p className="text-sm text-slate-500 mt-2">{t('waitingSession')}</p>
                    </div>
                ) : (
                    <div className="flex w-full flex-col gap-4">

                        {/* Top Row: Leaderboard (Left) + Map (Right) */}
                        <div className="flex w-full flex-col gap-4 xl:flex-row">

                            {/* Timing Table */}
                            <div className="w-full xl:w-[500px] shrink-0 bg-[#111111] border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col xl:max-h-[850px]">
                                <div className="overflow-x-auto overflow-y-auto w-full no-scrollbar flex-grow">
                                    <table className="w-full text-left border-collapse min-w-[450px]">
                                        <thead className="sticky top-0 bg-[#111111] z-10 shadow-md">
                                            <tr className="text-[10px] text-slate-500 uppercase tracking-widest font-bold border-b border-white/5">
                                                <th className="py-3 text-center w-12">{t('pos')}</th>
                                                <th className="py-3 pl-4">{t('driver')}</th>
                                                <th className="py-3 text-right pr-4">{t('gap')}</th>
                                                <th className="py-3 text-right pr-4">{t('interval')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-white/5">
                                            {tableData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center text-slate-500 font-mono text-sm tracking-widest uppercase">
                                                        {t('waitingTiming')}
                                                    </td>
                                                </tr>
                                            ) : (
                                                tableData.map((driver) => (
                                                    <tr key={driver.driverNumber} className="group hover:bg-[#1a1b1e] transition-colors">
                                                        <td className="py-2.5 text-center font-bold text-white relative">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ backgroundColor: driver.teamColor }} />
                                                            <span>{driver.position}</span>
                                                        </td>
                                                        <td className="py-2.5 font-bold text-white px-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm w-6 text-center font-mono text-slate-500">{driver.driverNumber}</span>
                                                                <div className="flex flex-col">
                                                                    <span className="text-slate-100 text-sm leading-tight">{driver.abbreviation}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 text-slate-300 font-mono text-xs text-right pr-4">
                                                            {driver.gap}
                                                        </td>
                                                        <td className="py-2.5 text-slate-500 font-mono text-xs text-right pr-4">
                                                            {driver.interval}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Track Map */}
                            <div className="flex-1 bg-[#111111] border border-white/5 rounded-xl shadow-2xl overflow-hidden min-h-[400px] xl:max-h-[850px] relative">
                                <LiveTrackMap sessionKey={session.session_key} drivers={driversMap} locations={locationsMap} />
                            </div>

                        </div>

                        {/* Bottom Row: Info Panels */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                            {/* Race Control */}
                            <div className="bg-[#111111] border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111111]">
                                    <div className="flex items-center gap-2">
                                        <Flag size={15} className="text-[#e81932]" />
                                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                                            {t('raceControl')}
                                        </h3>
                                    </div>
                                    <span className="bg-white/5 text-xs px-2 py-0.5 rounded font-mono text-slate-400">{messages.length} MSGS</span>
                                </div>
                                <div className="overflow-y-auto flex-grow p-4 space-y-4 no-scrollbar">
                                    {messages.length === 0 ? (
                                        <p className="text-center text-slate-600 text-sm italic mt-10">{t('noMessages')}</p>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const time = new Date(msg.date).toLocaleTimeString();
                                            let flagColor = "text-slate-500";
                                            if (msg.flag === "GREEN" || msg.flag === "CLEAR" || msg.message.includes("CLEAR")) flagColor = "text-green-500";
                                            if (msg.flag === "YELLOW" || msg.message.includes("YELLOW")) flagColor = "text-yellow-400";
                                            if (msg.flag === "RED" || msg.message.includes("RED FLAG")) flagColor = "text-red-500";

                                            return (
                                                <div key={idx} className="flex gap-3 bg-[#1a1b1e] p-3 rounded-lg border border-white/5">
                                                    <span className="text-[10px] font-mono text-slate-500 shrink-0 mt-0.5">{time}</span>
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="flex items-center gap-1.5">
                                                                {msg.flag === "YELLOW" && <AlertTriangle size={12} className={flagColor} />}
                                                                {(msg.flag === "GREEN" || msg.flag === "CLEAR") && <Flag size={12} className={flagColor} />}
                                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${flagColor}`}>{msg.category}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                                            {msg.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Team Radios */}
                            <div className="bg-[#111111] border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111111]">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <Volume2 size={15} className="text-blue-400" />
                                        Team Radios
                                    </h3>
                                    <span className="bg-white/5 text-xs px-2 py-0.5 rounded font-mono text-slate-400">{teamRadios.length} MSGS</span>
                                </div>
                                <div className="overflow-y-auto flex-grow p-4 space-y-4 no-scrollbar">
                                    {teamRadios.length === 0 ? (
                                        <div className="flex h-full items-center justify-center">
                                            <p className="text-center text-slate-600 text-sm italic">Waiting for radio messages...</p>
                                        </div>
                                    ) : (
                                        teamRadios.map((radio, idx) => {
                                            const driver = driversMap.get(parseInt(radio.RacingNumber));
                                            return (
                                                <div key={`radio-${idx}`} className="flex flex-col gap-2 bg-[#1a1b1e] p-3 rounded-lg border border-white/5 relative overflow-hidden">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: driver?.team_colour ? `#${driver.team_colour}` : '#999' }}></div>
                                                    <div className="flex items-center gap-2 pl-2">
                                                        <span className="font-mono font-bold text-white text-sm">{radio.RacingNumber}</span>
                                                        <span className="text-slate-300 font-medium text-sm">{driver?.name_acronym || 'UNK'}</span>
                                                        <span className="ml-auto text-[10px] text-slate-500 font-mono">
                                                            {new Date(radio.Utc).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="pl-2 mt-1 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                                            <Volume2 size={14} className="text-blue-400" />
                                                        </div>
                                                        <p className="text-xs text-slate-400 italic flex-grow">"Audio clip received"</p>
                                                        {/* Feature integration: radio.Path would point to the audio stream */}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Track Violations */}
                            <div className="bg-[#111111] border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111111]">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <AlertOctagon size={15} className="text-orange-500" />
                                        Track Violations
                                    </h3>
                                    <span className="bg-white/5 text-xs px-2 py-0.5 rounded font-mono text-slate-400">
                                        {messages.filter(m => m.message.includes("TRACK LIMITS") || m.message.includes("DELETED")).length} LAPS
                                    </span>
                                </div>
                                <div className="overflow-y-auto flex-grow p-4 space-y-3 no-scrollbar">
                                    {messages.filter(m => m.message.includes("TRACK LIMITS") || m.message.includes("DELETED")).length === 0 ? (
                                        <div className="flex h-full items-center justify-center">
                                            <p className="text-center text-slate-600 text-sm italic">No track limits reported</p>
                                        </div>
                                    ) : (
                                        Object.entries(
                                            messages
                                                .filter(m => m.message.includes("TRACK LIMITS") || m.message.includes("DELETED"))
                                                .reduce((acc, curr) => {
                                                    // Try to match "CAR XX" in message
                                                    const match = curr.message.match(/CAR (\d+)/);
                                                    if (match && match[1]) {
                                                        const num = parseInt(match[1]);
                                                        acc[num] = (acc[num] || 0) + 1;
                                                    }
                                                    return acc;
                                                }, {} as Record<number, number>)
                                        )
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([driverNumStr, count]) => {
                                                const driverNum = parseInt(driverNumStr);
                                                const driver = driversMap.get(driverNum);
                                                return (
                                                    <div key={driverNum} className="flex justify-between items-center bg-[#1a1b1e] p-3 rounded-lg border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: driver?.team_colour ? `#${driver.team_colour}` : '#999' }}></div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-white w-6">{driverNum}</span>
                                                                <span className="text-slate-300 font-medium">{driver?.name_acronym || 'UNK'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            {[1, 2, 3, 4].map(idx => (
                                                                <div
                                                                    key={idx}
                                                                    className={`w-3 h-3 rounded-sm ${idx <= count
                                                                        ? idx === 4 ? 'bg-red-500' : 'bg-orange-500'
                                                                        : 'bg-white/10'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
