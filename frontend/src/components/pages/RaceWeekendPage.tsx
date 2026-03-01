"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { mockEvents } from "@/lib/mock-data/schedule";
import { mockDriverResults } from "@/lib/mock-data/session";
import { getCountryFlag } from "@/lib/utils";
import { SESSION_NAMES, SessionType } from "@/types";

export default function RaceWeekendPage() {
    const event = mockEvents[4]; // Chinese GP (sprint weekend)
    const [activeSession, setActiveSession] = useState<SessionType>("R");
    const sessions = event.sessions;

    return (
        <div className="bg-[#1a1b1e] text-slate-100 min-h-screen flex flex-col font-display">
            <Header />
            <main className="flex-grow p-4 lg:p-8 max-w-[1500px] mx-auto w-full">

                {/* Header Superior */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/5 gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#2a2b30] text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border border-white/5">
                                {event.eventName}
                            </span>
                            <span className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] items-center gap-1 uppercase font-bold tracking-widest">
                                Session Completed
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                            {SESSION_NAMES[activeSession]} Results
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 font-medium">
                            Saturday, May 25th • Circuit de Monaco • Dry Conditions
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#232429] border border-white/10 hover:border-white/30 text-white text-xs font-bold uppercase tracking-widest shadow-md transition-colors">
                            <span className="material-symbols-outlined text-[16px]">download</span> Export CSV
                        </button>
                        <Link
                            href={`/session/${event.seasonYear}/${event.roundNumber}/${activeSession}`}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">analytics</span> Deep Analysis
                        </Link>
                    </div>
                </div>

                {/* Grid Principal Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Coluna Esquerda: Tabela e Long Run */}
                    <div className="xl:col-span-8 flex flex-col gap-8">

                        {/* Classificação da Sessão */}
                        <div className="bg-[#232429] border border-[#303238] rounded-2xl shadow-xl overflow-hidden">
                            <div className="flex justify-between items-center p-5 border-b border-[#303238]">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">format_list_bulleted</span>
                                    Session Classification
                                </h3>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1b1e] border border-[#303238]">
                                        <span className="w-2 h-2 rounded-full bg-[#ff3b30]"></span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Soft</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1b1e] border border-[#303238]">
                                        <span className="w-2 h-2 rounded-full bg-[#ffcc00]"></span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Medium</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1b1e] border border-[#303238]">
                                        <span className="w-2 h-2 rounded-full bg-[#f2f2f7]"></span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Hard</span>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#1c1d21]/50 text-[10px] text-slate-500 uppercase tracking-widest font-bold border-b border-[#303238]">
                                            <th className="py-4 text-center w-12">Pos</th>
                                            <th className="py-4 pl-4">Driver</th>
                                            <th className="py-4">Team</th>
                                            <th className="py-4">Time</th>
                                            <th className="py-4">Gap</th>
                                            <th className="py-4 text-center">Laps</th>
                                            <th className="py-4 text-center">Tire</th>
                                            <th className="py-4 text-center hidden md:table-cell">Sectors</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-[#303238]">
                                        {mockDriverResults.map((d, idx) => {
                                            const tireType = idx % 3 === 0 ? "tire-filled-s text-[#1a1b1e]" : idx % 2 === 0 ? "tire-filled-m text-[#1a1b1e]" : "tire-h";
                                            // Mock de setores
                                            const s1 = idx === 0 ? "bg-[#e81932]" : "bg-[#2dd4bf]";
                                            const s2 = (idx === 0 || idx === 1) ? "bg-[#e81932]" : idx === 3 ? "bg-[#eab308]" : "bg-[#2dd4bf]";
                                            const s3 = idx === 1 ? "bg-[#e81932]" : "bg-[#2dd4bf]";

                                            return (
                                                <tr key={d.abbreviation} className="group hover:bg-[#2a2b30] transition-colors">
                                                    <td className="py-3 text-center font-bold text-white relative">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ backgroundColor: d.teamColor }}></div>
                                                        {d.position}
                                                    </td>
                                                    <td className="py-3 font-bold text-white px-4">
                                                        {d.fullName}
                                                    </td>
                                                    <td className="py-3 text-slate-400 text-xs">{d.team}</td>
                                                    <td className={`py-3 font-mono ${idx === 0 ? 'text-primary font-bold' : 'text-slate-300'}`}>
                                                        {d.bestLapTime}
                                                    </td>
                                                    <td className="py-3 text-slate-500 font-mono text-xs">
                                                        {idx === 0 ? "-" : `+${(((d.bestLapTimeMs || 0) - (mockDriverResults[0].bestLapTimeMs || 0)) / 1000).toFixed(3)}`}
                                                    </td>
                                                    <td className="py-3 text-center text-white font-mono text-xs">
                                                        {20 + (idx % 8)}
                                                    </td>
                                                    <td className="py-3 flex justify-center">
                                                        <div className={tireType}></div>
                                                    </td>
                                                    <td className="py-3 hidden md:table-cell">
                                                        <div className="flex justify-center gap-1.5">
                                                            <div className={`w-6 h-1 ${s1} rounded-full`}></div>
                                                            <div className={`w-6 h-1 ${s2} rounded-full`}></div>
                                                            <div className={`w-6 h-1 ${s3} rounded-full`}></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-[#1c1d21]/30 text-center border-t border-[#303238]">
                                <button className="text-[10px] text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-bold flex items-center justify-center gap-1 w-full m-auto">
                                    Show Full Grid <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                </button>
                            </div>
                        </div>

                        {/* Ritmo de Corrida (Long Runs) */}
                        <div className="bg-[#232429] border border-[#303238] rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Long Run Pace Analysis</h3>
                                    <p className="text-[11px] text-slate-500 mt-1">Average lap time over stints &gt; 5 laps (Medium Compound)</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="text-[10px] bg-[#1a1b1e] border border-[#303238] rounded-lg px-3 py-1.5 font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Soft</button>
                                    <button className="text-[10px] bg-primary text-white rounded-lg px-3 py-1.5 font-bold uppercase tracking-widest">Medium</button>
                                    <button className="text-[10px] bg-[#1a1b1e] border border-[#303238] rounded-lg px-3 py-1.5 font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Hard</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { team: "Red Bull", time: "1:15.420", color: "#0600ef", diff: "0.05s", badge: null },
                                    { team: "Ferrari", time: "1:15.380", color: "#e81932", diff: "0.08s", badge: "FASTEST" },
                                    { team: "McLaren", time: "1:15.650", color: "#ff8700", diff: "0.12s", badge: null },
                                    { team: "Mercedes", time: "1:15.820", color: "#00d2be", diff: "0.25s", badge: null },
                                ].map((t, i) => (
                                    <div key={i} className="relative flex flex-col group p-5 bg-[#1a1b1e] rounded-xl border border-[#303238] overflow-hidden">
                                        {/* Accent top border */}
                                        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: t.color }}></div>
                                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <span className="material-symbols-outlined text-5xl">speed</span>
                                        </div>

                                        {t.badge && (
                                            <div className="absolute top-4 right-4 text-[8px] bg-green-500/20 border border-green-500/20 text-green-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                                                {t.badge}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mb-3 mt-1">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></div>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.team}</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-mono mt-auto">{t.time}</div>
                                        <div className="text-[10px] text-slate-500 mt-1">Avg Dev: <span className="text-green-500">{t.diff}</span></div>

                                        <div className="w-full bg-[#2a2b30] rounded-full h-1 mt-4 overflow-hidden">
                                            <div className="h-full" style={{ backgroundColor: t.color, width: t.badge ? '100%' : i === 0 ? '98%' : i === 2 ? '90%' : '85%' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right column */}
                    <div className="xl:col-span-3 flex flex-col gap-8">

                        {/* Domínio de Setor */}
                        <div className="bg-[#232429] border border-[#303238] rounded-2xl flex flex-col overflow-hidden shadow-xl">
                            <div className="p-5 border-b border-[#303238]">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sector Dominance</h3>
                            </div>
                            <div className="relative p-6 h-64 flex items-center justify-center bg-[#1a1b1e]">
                                <svg className="w-full h-full drop-shadow-2xl opacity-90" viewBox="0 0 200 200">
                                    <path d="M40,150 C40,150 20,130 30,110 C35,100 45,100 50,90" fill="none" stroke="#e81932" strokeLinecap="round" strokeWidth="4"></path>
                                    <path d="M50,90 C60,60 60,40 90,30 C110,23 130,30 140,50" fill="none" stroke="#0600ef" strokeLinecap="round" strokeWidth="4"></path>
                                    <path d="M140,50 C160,80 150,120 140,140 C130,160 100,170 80,160 C60,150 40,150 40,150" fill="none" stroke="#e81932" strokeLinecap="round" strokeWidth="4"></path>
                                    <circle cx="50" cy="90" fill="#232429" stroke="white" strokeWidth="1.5" r="3"></circle>
                                    <text fill="white" fontFamily="monospace" fontSize="8" x="35" y="85">S1</text>
                                    <circle cx="140" cy="50" fill="#232429" stroke="white" strokeWidth="1.5" r="3"></circle>
                                    <text fill="white" fontFamily="monospace" fontSize="8" x="145" y="45">S2</text>
                                </svg>
                                <div className="absolute bottom-4 left-4 right-4 space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 uppercase font-bold tracking-widest text-[9px]">Sector 1</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-white text-xs">18.342</span>
                                            <div className="w-2 h-2 rounded-full bg-[#e81932]"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 uppercase font-bold tracking-widest text-[9px]">Sector 2</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-white text-xs">33.561</span>
                                            <div className="w-2 h-2 rounded-full bg-[#0600ef]"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 uppercase font-bold tracking-widest text-[9px]">Sector 3</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-white text-xs">19.466</span>
                                            <div className="w-2 h-2 rounded-full bg-[#e81932]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Speed Trap */}
                        <div className="bg-[#232429] border border-[#303238] rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Speed Trap (S2)</h3>
                                <span className="material-symbols-outlined text-slate-500 text-[18px]">speed</span>
                            </div>
                            <div className="flex flex-col gap-0">
                                {[
                                    { pos: 1, name: "A. Albon", val: "292.4", pct: "100%", color: "bg-[#005aff]" },
                                    { pos: 2, name: "S. Perez", val: "291.8", pct: "99.0%", color: "bg-[#0600ef]" },
                                    { pos: 3, name: "M. Verstappen", val: "291.2", pct: "98.5%", color: "bg-[#0600ef]" },
                                    { pos: 4, name: "N. Hulkenberg", val: "290.5", pct: "98.0%", color: "bg-white" },
                                ].map((t) => (
                                    <div key={t.pos} className="flex items-center justify-between border-b border-[#303238] py-4 first:pt-0 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-4 font-bold text-slate-500 text-[11px] text-center">{t.pos}</div>
                                            <div className="flex-1 max-w-[140px]">
                                                <div className="text-[10px] font-bold text-white uppercase mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{t.name}</div>
                                                <div className="w-full bg-[#1a1b1e] rounded-full h-1 overflow-hidden">
                                                    <div className={`${t.color} h-full`} style={{ width: t.pct }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono font-bold text-white">{t.val}</div>
                                            <div className="text-[8px] text-slate-500 uppercase">km/h</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weather */}
                        <div className="bg-[#232429] border border-[#303238] rounded-2xl p-6 shadow-xl">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Track Conditions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center bg-[#1a1b1e] border border-[#303238] rounded-xl p-4">
                                    <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">device_thermostat</span>
                                    <div className="text-xl font-bold text-white">42°C</div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Track Temp</div>
                                </div>
                                <div className="text-center bg-[#1a1b1e] border border-[#303238] rounded-xl p-4">
                                    <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">air</span>
                                    <div className="text-xl font-bold text-white">24°C</div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Air Temp</div>
                                </div>
                                <div className="text-center bg-[#1a1b1e] border border-[#303238] rounded-xl p-4">
                                    <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">humidity_percentage</span>
                                    <div className="text-xl font-bold text-white">58%</div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Humidity</div>
                                </div>
                                <div className="text-center bg-[#1a1b1e] border border-[#303238] rounded-xl p-4">
                                    <span className="material-symbols-outlined text-slate-400 text-2xl mb-1">directions_car</span>
                                    <div className="text-xl font-bold text-white">3.2 <span className="text-[10px] font-normal text-slate-500">m/s</span></div>
                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Wind SE</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
