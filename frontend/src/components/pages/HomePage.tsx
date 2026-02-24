"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { getCountryFlagUrl, getMediaUrl, getTeamLogoUrl } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { fetchNextRace, fetchLastRacePodium, getConstructorColor } from "@/lib/supabase-queries";

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

// Supabase client imported from @/lib/supabase

const TEAM_VISUALS: Record<string, { color: string; logoUrl: string }> = {
    ferrari: { color: "#ff2800", logoUrl: "/ferrari-logo.png" },
    mercedes: { color: "#00d2be", logoUrl: "/mercedes-logo.png" },
    mclaren: { color: "#ff8700", logoUrl: "/mclaren-logo.png" },
    "red-bull": { color: "#0600ef", logoUrl: "/redbull-logo.png" },
    "aston-martin": { color: "#006f62", logoUrl: "/aston-martin-logo.png" },
    "alpine": { color: "#0090ff", logoUrl: "/alpine-logo.png" },
    williams: { color: "#005aff", logoUrl: "/williams-logo.png" },
    kick: { color: "#52e252", logoUrl: "/kick-logo.png" },
    rs: { color: "#1e41ff", logoUrl: "/honda-logo.png" },
    "haas": { color: "#ffffff", logoUrl: "/haas-logo.png" },
};

const NEWS = [
    { title: "Verstappen tricampeão de forma espetacular em 2025", time: "2h atrás", category: "Campeonato" },
    { title: "GP da Austrália promete abrir 2026 com surpresas", time: "4h atrás", category: "Preview" },
    { title: 'Hamilton: "Preparado para levar a Ferrari ao topo"', time: "6h atrás", category: "Entrevista" },
];

const BARS = [
    { h: 40, color: "#334155" },
    { h: 60, color: "#475569" },
    { h: 85, color: "var(--primary)" },
    { h: 50, color: "#475569" },
    { h: 30, color: "#334155" },
];

// Podium is now fetched dynamically from Supabase

/* ============================================================ */

type DriverStanding = { id: string; name: string; number: number; team: string; teamColor: string; points: number; wins: number; podiums: number; poles: number; };
type ConstructorStanding = { id: string; name: string; color: string; points: number; };
type PodiumDriver = { id: string; name: string; team: string; teamColor: string; pos: number; time: string; };
type NextRaceInfo = { name: string; country: string; circuitName: string; circuitPlace: string; date: string; laps: number; length: number; fp1Date: string | null; fp1Time: string | null; fp2Date: string | null; fp2Time: string | null; fp3Date: string | null; fp3Time: string | null; qualDate: string | null; qualTime: string | null; raceDate: string | null; raceTime: string | null; year: number; round: number; };

export default function HomePage() {
    /* States */
    const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [sessionCd, setSessionCd] = useState("00:00:00");
    const [drivers, setDrivers] = useState<DriverStanding[]>([]);
    const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
    const [podiumData, setPodiumData] = useState<{ race: any; podium: PodiumDriver[] } | null>(null);
    const [nextRace, setNextRace] = useState<NextRaceInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAll() {
            try {
                // Fetch Constructors (latest year with data)
                const { data: cData } = await supabase.from('seasons_constructor_standings').select('constructorid, points').eq('year', 2025).order('points', { ascending: false }).limit(5);
                if (cData) {
                    const cIds = cData.map(c => c.constructorid);
                    const { data: cNames } = await supabase.from('constructors').select('id, name').in('id', cIds);
                    setConstructors(cData.map(c => {
                        const info = cNames?.find(x => x.id === c.constructorid);
                        return { id: c.constructorid, name: info?.name || c.constructorid, color: getConstructorColor(c.constructorid), points: c.points || 0 };
                    }));
                }

                // Fetch Drivers
                const { data: dData } = await supabase.from('seasons_driver_standings').select('driverid, points').eq('year', 2025).order('points', { ascending: false }).limit(10);
                if (dData) {
                    const dIds = dData.map(d => d.driverid);
                    const { data: dNames } = await supabase.from('drivers').select('id, name, permanentnumber').in('id', dIds);
                    const { data: entrants } = await supabase.from('seasons_entrants_drivers').select('driverid, constructorid').eq('year', 2025).in('driverid', dIds);
                    setDrivers(dData.map(d => {
                        const info = dNames?.find(x => x.id === d.driverid);
                        const entrant = entrants?.find(x => x.driverid === d.driverid);
                        const teamId = entrant?.constructorid || 'unknown';
                        return { id: d.driverid, name: info?.name || d.driverid, number: parseInt(info?.permanentnumber) || 0, team: String(teamId).replace(/-/g, ' '), teamColor: getConstructorColor(teamId), points: d.points || 0, wins: 0, podiums: 0, poles: 0 };
                    }));
                }

                // Fetch Next Race dynamically
                const raceData = await fetchNextRace();
                if (raceData) {
                    setNextRace({
                        name: raceData.grands_prix?.fullname || raceData.officialname || 'Próxima Corrida',
                        country: raceData.grands_prix?.countryid || '',
                        circuitName: raceData.circuits?.fullname || raceData.circuits?.name || '',
                        circuitPlace: raceData.circuits?.placename || '',
                        date: raceData.date,
                        laps: raceData.laps || raceData.scheduledlaps || 0,
                        length: raceData.courselength || raceData.circuits?.length || 0,
                        fp1Date: raceData.freepractice1date, fp1Time: raceData.freepractice1time,
                        fp2Date: raceData.freepractice2date, fp2Time: raceData.freepractice2time,
                        fp3Date: raceData.freepractice3date, fp3Time: raceData.freepractice3time,
                        qualDate: raceData.qualifyingdate, qualTime: raceData.qualifyingtime,
                        raceDate: raceData.date, raceTime: raceData.time,
                        year: raceData.year, round: raceData.round,
                    });
                }

                // Fetch Last Race Podium
                const podResult = await fetchLastRacePodium();
                if (podResult && podResult.podium.length > 0) {
                    const podiumOrdered = [1, 0, 2].map(i => podResult.podium[i]).filter(Boolean);
                    setPodiumData({
                        race: podResult.race,
                        podium: podiumOrdered.map(p => ({
                            id: p.driverId,
                            name: `${p.firstName} ${p.lastName}`,
                            team: p.constructorId?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || '',
                            teamColor: p.teamColor,
                            pos: p.position,
                            time: p.position === 1 ? (p.time || '') : (p.gap ? `+${p.gap}` : ''),
                        })),
                    });
                }
            } catch (err) {
                console.error('Error fetching home data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    // Dynamic countdown based on nextRace
    useEffect(() => {
        if (!nextRace?.date) return;
        const raceDate = nextRace.date;
        const raceTime = nextRace.raceTime || '14:00:00';
        const target = new Date(`${raceDate}T${raceTime}`);

        const tick = () => {
            const diff = target.getTime() - Date.now();
            if (diff <= 0) { setCd({ d: 0, h: 0, m: 0, s: 0 }); return; }
            setCd({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
            // Next session countdown (FP1 if available)
            const fp1Target = nextRace.fp1Date ? new Date(`${nextRace.fp1Date}T${nextRace.fp1Time || '10:00:00'}`) : null;
            const nextSession = fp1Target && fp1Target.getTime() > Date.now() ? fp1Target : target;
            const sDiff = nextSession.getTime() - Date.now();
            if (sDiff > 0) {
                const hh = Math.floor(sDiff / 3600000);
                const mm = Math.floor((sDiff % 3600000) / 60000);
                const ss = Math.floor((sDiff % 60000) / 1000);
                setSessionCd(`${p(hh)}:${p(mm)}:${p(ss)}`);
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [nextRace]);

    /* Driver Modal */
    const [modal, setModal] = useState<DriverStanding | null>(null);
    const openModal = useCallback((id: string) => {
        setModal(drivers.find((x) => x.id === id) || null);
    }, [drivers]);

    return (
        <>
            <Header />
            <main className="flex-grow p-6 mx-auto w-full" style={{ maxWidth: 1400 }}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ============ LEFT COLUMN ============ */}
                    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">

                        {/* ── HERO ── */}
                        <div className="rounded-2xl overflow-hidden relative shadow-lg group card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to right, ${C.bg}, ${C.bg}e6, transparent)` }} />
                                <div className="w-full h-full opacity-40 group-hover:scale-105 transition-transform duration-700" style={{ background: C.lighter }} />
                            </div>
                            <div className="relative z-20 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 min-h-[320px]">
                                <div className="flex flex-col gap-4 max-w-lg">
                                    {/* Badge */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit" style={{ background: "rgba(236,19,30,0.2)", color: C.primary, border: "1px solid rgba(236,19,30,0.2)" }}>
                                        <span className="animate-pulse w-2 h-2 rounded-full" style={{ background: C.primary }} />
                                        Próxima Corrida
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {nextRace?.country && (
                                                <div className="w-10 h-7 rounded overflow-hidden shadow-md border border-slate-700">
                                                    <img src={getCountryFlagUrl(nextRace.country)} alt={`${nextRace.country} Flag`} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{nextRace?.name || 'Próxima Corrida'}</h2>
                                        </div>
                                        <p className="text-lg flex items-center gap-2" style={{ color: C.muted }}>
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {nextRace?.circuitName || 'Circuito'}{nextRace?.circuitPlace ? `, ${nextRace.circuitPlace}` : ''}
                                        </p>
                                    </div>
                                    {/* Countdown */}
                                    <div className="flex gap-4 mt-2">
                                        {[
                                            { v: p(cd.d), l: "Dias" },
                                            { v: p(cd.h), l: "Hrs" },
                                            { v: p(cd.m), l: "Min" },
                                            { v: p(cd.s), l: "Seg" },
                                        ].map((u) => (
                                            <div key={u.l} className="flex flex-col items-center backdrop-blur-sm p-3 rounded-lg min-w-[70px]" style={{ background: "rgba(35,36,41,0.8)", border: `1px solid ${C.border}` }}>
                                                <span className="text-2xl font-bold text-white countdown-digit">{u.v}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: C.dimmed }}>{u.l}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <Link href={`/race/${nextRace?.year || 2026}/${nextRace?.round || 1}`} className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-sm transition-colors" style={{ background: C.primary }}>
                                            Race Hub <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </Link>
                                        <button className="text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-sm transition-colors" style={{ background: C.lighter, border: "1px solid #475569" }}>
                                            Guia do Circuito
                                        </button>
                                    </div>
                                </div>
                                {/* Circuit SVG */}
                                <div className="relative w-full md:w-1/3 h-64 flex items-center justify-center">
                                    <svg className="w-full h-full text-white stroke-current fill-none stroke-2" style={{ filter: "drop-shadow(0 0 15px rgba(255,255,255,0.3))" }} viewBox="0 0 200 200">
                                        <path d="M40,150 C40,150 20,130 30,110 C40,90 60,100 70,80 C80,60 60,40 90,30 C120,20 150,40 160,70 C170,100 150,120 140,140 C130,160 100,170 80,160 C60,150 40,150 40,150 Z" />
                                    </svg>
                                    <div className="absolute bottom-0 right-0 p-2 rounded text-xs" style={{ background: "rgba(35,36,41,0.9)", color: C.muted }}>
                                        <div>Extensão: <span className="text-white font-mono">{nextRace?.length ? `${nextRace.length.toFixed(3)} km` : '—'}</span></div>
                                        <div>Voltas: <span className="text-white font-mono">{nextRace?.laps || '—'}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── WEEKEND SCHEDULE ── */}
                        <div className="rounded-xl p-5 animate-slide-up" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                    <span className="w-1 h-5 rounded-full" style={{ background: C.primary }} />
                                    Programação do Fim de Semana
                                </h3>
                                <span className="text-xs" style={{ color: C.muted }}>Horários de Brasília</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Práticas */}
                                <div className="rounded-lg p-4" style={{ background: "rgba(46,48,54,0.5)", border: `1px solid ${C.border}` }}>
                                    <div className="text-xs font-bold uppercase mb-2" style={{ color: C.primary }}>Treinos Livres</div>
                                    <div className="space-y-3">
                                        {nextRace?.fp1Date && <ScheduleRow label={`${fmtDate(nextRace.fp1Date)} • Treino Livre 1`} time={fmtTime(nextRace.fp1Time)} />}
                                        {nextRace?.fp2Date && <ScheduleRow label={`${fmtDate(nextRace.fp2Date)} • Treino Livre 2`} time={fmtTime(nextRace.fp2Time)} />}
                                        {nextRace?.fp3Date && <ScheduleRow label={`${fmtDate(nextRace.fp3Date)} • Treino Livre 3`} time={fmtTime(nextRace.fp3Time)} />}
                                        {!nextRace?.fp1Date && !nextRace?.fp2Date && !nextRace?.fp3Date && <span className="text-xs" style={{ color: C.muted }}>Horários a confirmar</span>}
                                    </div>
                                </div>
                                {/* Qualifying */}
                                <div className="rounded-lg p-4" style={{ background: "rgba(46,48,54,0.5)", border: `1px solid ${C.border}` }}>
                                    <div className="text-xs font-bold uppercase mb-2" style={{ color: C.primary }}>Classificação</div>
                                    <div className="space-y-3">
                                        {nextRace?.qualDate ? (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-white font-bold">{fmtDate(nextRace.qualDate)} • Qualifying</span>
                                                <span className="text-xs font-mono px-2 py-1 rounded text-white" style={{ background: C.primary }}>{fmtTime(nextRace.qualTime)}</span>
                                            </div>
                                        ) : <span className="text-xs" style={{ color: C.muted }}>Horário a confirmar</span>}
                                    </div>
                                </div>
                                {/* Race */}
                                <div className="rounded-lg p-4" style={{ background: "linear-gradient(to bottom right, rgba(236,19,30,0.2), rgba(236,19,30,0.05))", border: "1px solid rgba(236,19,30,0.3)" }}>
                                    <div className="text-xs font-bold uppercase mb-2" style={{ color: C.primary }}>🏁 {nextRace?.raceDate ? fmtDate(nextRace.raceDate) : 'Corrida'}</div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-white font-bold">Corrida Oficial</span>
                                            <span className="text-xs font-mono px-2 py-1 rounded text-white" style={{ background: C.primary }}>{nextRace?.raceTime ? fmtTime(nextRace.raceTime) : '—'}</span>
                                        </div>
                                        <div className="pt-2" style={{ borderTop: "1px solid #334155" }}>
                                            <span className="text-xs" style={{ color: C.muted }}>{nextRace?.laps || '—'} voltas{nextRace?.length ? ` • ${(nextRace.length * (nextRace.laps || 1)).toFixed(1)} km` : ''}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── BENTO: Podium + Record ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Podium (span 2) */}
                            <div className="md:col-span-2 rounded-xl p-5 flex flex-col card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                        <span className="w-1 h-5 rounded-full" style={{ background: C.primary }} />
                                        Último Pódio
                                        <span className="text-sm font-normal ml-2" style={{ color: C.dimmed }}>{podiumData?.race?.grands_prix?.name || podiumData?.race?.officialname || ''}</span>
                                    </h3>
                                    {podiumData?.race && (
                                        <Link href={`/analysis/session/${podiumData.race.year}/${podiumData.race.round}/R`} className="text-xs font-bold uppercase hover:text-white transition-colors flex items-center gap-1" style={{ color: C.primary }}>
                                            Resultados Completos <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </Link>
                                    )}
                                </div>
                                <div className="flex flex-1 items-end justify-center gap-2 sm:gap-4 h-full pt-4">
                                    {(podiumData?.podium || []).map((d) => (
                                        <PodiumCard key={d.id} driver={d} onClick={() => openModal(d.id)} />
                                    ))}
                                    {!podiumData && !loading && <span className="text-sm" style={{ color: C.muted }}>Carregando pódio...</span>}
                                </div>
                            </div>

                            {/* Record */}
                            <div className="rounded-xl p-5 flex flex-col relative overflow-hidden group card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-8xl text-white">history_edu</span>
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-xl" style={{ color: C.primary }}>hotel_class</span>
                                        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>Recorde da Semana</h3>
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-2">Mais Poles em Monza</h4>
                                    <div className="my-3">
                                        <span className="text-5xl font-bold tracking-tighter" style={{ color: C.primary }}>5</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#334155" }}>
                                            <span className="material-symbols-outlined text-xl" style={{ color: C.muted }}>person</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-none">Lewis Hamilton</p>
                                            <p className="text-xs mt-1" style={{ color: C.dimmed }}>Dividido com Schumacher</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4" style={{ borderTop: "1px solid #334155" }}>
                                        <a className="text-xs font-bold text-white flex items-center justify-between group-hover:text-red-500 transition-colors" href="#">
                                            Ver Histórico
                                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── QUICK STATS ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
                            <QuickStat icon="emoji_events" iconColor={C.primary} label="Corridas 2026" value={<>0<span style={{ color: C.dimmed, fontSize: "1.125rem" }}>/24</span></>}>
                                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#334155" }}>
                                    <div className="h-full rounded-full" style={{ background: C.primary, width: "0%" }} />
                                </div>
                            </QuickStat>
                            <QuickStat icon="speed" iconColor="#ff8700" label="Campeão 2025" value="Max">
                                <div className="text-xs mt-1" style={{ color: C.dimmed }}>Red Bull Racing</div>
                            </QuickStat>
                            <QuickStat icon="timer" iconColor="#fe0000" label="Recorde Aust." value="1:19.815">
                                <div className="text-xs mt-1" style={{ color: C.dimmed }}>Leclerc - 2024</div>
                            </QuickStat>
                            <QuickStat icon="analytics" iconColor="#00d2be" label="Dados Supabase" value="76">
                                <div className="text-xs mt-1" style={{ color: C.dimmed }}>Temporadas compiladas</div>
                            </QuickStat>
                        </div>
                    </div>

                    {/* ============ RIGHT COLUMN ============ */}
                    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">

                        {/* ── DRIVER STANDINGS ── */}
                        <div className="rounded-xl overflow-hidden flex flex-col max-h-[800px] card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(46,48,54,0.5)" }}>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Classificação Pilotos</h3>
                                <span className="text-[10px] text-white px-2 py-0.5 rounded font-bold" style={{ background: C.primary }}>2025</span>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                                {drivers.map((d, i) => (
                                    <div
                                        key={d.id}
                                        className="standing-row flex items-center p-3 cursor-pointer"
                                        style={{ borderLeft: `3px solid ${i === 0 ? C.primary : d.teamColor}` }}
                                        onClick={() => openModal(d.id)}
                                    >
                                        <span className="text-lg font-bold w-6 text-center" style={{ color: i === 0 ? C.primary : C.dimmed }}>{i + 1}</span>
                                        <div className="flex-1 px-3">
                                            <div className="text-sm font-bold text-white uppercase">{d.name}</div>
                                            <div className="text-[10px] uppercase" style={{ color: C.muted }}>{d.team}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold" style={{ color: i === 0 ? C.primary : "#fff" }}>{d.points}</div>
                                            <div className="text-[10px]" style={{ color: C.dimmed }}>PTS</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 text-center mt-2" style={{ borderTop: "1px solid rgba(51,65,85,0.5)" }}>
                                <Link href="/settings" className="text-xs font-bold hover:text-white transition-colors uppercase tracking-wider" style={{ color: C.primary }}>Ver Tabela Completa</Link>
                            </div>
                        </div>

                        {/* ── CONSTRUCTOR STANDINGS ── */}
                        <div className="rounded-xl overflow-hidden card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(46,48,54,0.5)" }}>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Construtores</h3>
                                <span className="text-[10px] text-white px-2 py-0.5 rounded font-bold" style={{ background: "#475569" }}>Top 5</span>
                            </div>
                            <div className="p-2">
                                {constructors.map((t, i) => (
                                    <div key={t.name} className="flex items-center p-2 rounded-lg transition-colors cursor-pointer mb-1 hover:bg-white/5">
                                        <span className="text-sm font-bold w-5 text-center" style={{ color: i === 0 ? C.primary : C.dimmed }}>{i + 1}</span>
                                        <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-white/5 mx-3 p-1 shrink-0 border border-white/5 shadow-inner">
                                            <img src={getTeamLogoUrl(t.id)} alt={t.name} className="w-full h-full object-contain filter" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-white uppercase">{t.name}</div>
                                        </div>
                                        <div className="text-sm font-bold text-white">{t.points}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── TELEMETRY ── */}
                        <div className="rounded-xl p-5 card-hover" style={{ background: `linear-gradient(to bottom right, ${C.lighter}, ${C.surface})`, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Insight de Telemetria</h3>
                                <span className="material-symbols-outlined" style={{ color: C.dimmed }}>query_stats</span>
                            </div>
                            <div className="h-24 w-full flex items-end justify-between gap-1 mb-4 opacity-80">
                                {BARS.map((bar, i) => (
                                    <div key={i} className="w-1/6 telemetry-bar rounded-t-sm relative group cursor-pointer" style={{ height: `${bar.h}%`, background: bar.color }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ background: "#fff", color: "#000" }}>
                                            {280 + i * 5} km/h
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs mb-4" style={{ color: C.muted }}>
                                Verstappen levou <span className="text-white font-bold">5km/h</span> a mais de velocidade na Curva 12 comparado a Leclerc.
                            </p>
                            <Link href="/analysis/compare" className="block w-full py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wider text-center transition-all" style={{ background: C.surface, border: "1px solid #475569" }}>
                                Comparar Telemetria
                            </Link>
                        </div>

                        {/* ── LIVE SESSION ── */}
                        <div className="rounded-xl p-5 card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-3 h-3 rounded-full live-indicator" style={{ background: C.primary }} />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Sessão Ao Vivo</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs" style={{ color: C.muted }}>Próxima Sessão</span>
                                    <span className="text-xs text-white font-bold">Treino Livre 1</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs" style={{ color: C.muted }}>Início em</span>
                                    <span className="text-xs font-mono" style={{ color: C.primary }}>{sessionCd}</span>
                                </div>
                                <div className="pt-3" style={{ borderTop: "1px solid #334155" }}>
                                    <Link href="/analysis/live" className="w-full py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-all flex items-center justify-center gap-2" style={{ background: C.primary }}>
                                        <span className="material-symbols-outlined text-sm">live_tv</span>
                                        Acessar Live Timing
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── NEWS ── */}
                <div className="mt-8 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white uppercase tracking-wide">Últimas Notícias</h3>
                        <a className="text-xs font-bold uppercase hover:text-white transition-colors flex items-center gap-1" href="#" style={{ color: C.primary }}>
                            Ver Todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {NEWS.map((n) => (
                            <div key={n.title} className="rounded-xl p-4 card-hover cursor-pointer" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ background: "rgba(236,19,30,0.2)", color: C.primary }}>{n.category}</span>
                                    <span className="text-[10px]" style={{ color: C.dimmed }}>{n.time}</span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">{n.title}</h4>
                                <a className="text-xs font-bold flex items-center gap-1" href="#" style={{ color: C.primary }}>
                                    Ler mais <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />

            {/* ── DRIVER MODAL ── */}
            {modal && (
                <div className="fixed inset-0 z-[100] backdrop-blur-sm flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setModal(null)}>
                    <div className="rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up" style={{ background: C.surface, border: `1px solid ${C.border}` }} onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">{modal.name}</h2>
                                <button className="hover:text-white transition-colors" style={{ color: C.muted }} onClick={() => setModal(null)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden" style={{ border: `2px solid ${C.primary}`, background: "#1e293b" }}>
                                    <img src={getMediaUrl('drivers', modal.id, '2026.webp')} alt={modal.name} className="w-full h-full object-cover object-center scale-110" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                    <span className="material-symbols-outlined text-4xl hidden" style={{ color: C.muted }}>person</span>
                                </div>
                                <div>
                                    <div className="text-sm uppercase" style={{ color: C.muted }}>{modal.team}</div>
                                    <div className="text-3xl font-bold text-white">#{modal.number}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                <ModalStat label="Pontos" value={modal.points} color={C.primary} />
                                <ModalStat label="Vitórias" value={modal.wins} color="#eab308" />
                                <ModalStat label="Pódios" value={modal.podiums} color="#3b82f6" />
                                <ModalStat label="Poles" value={modal.poles} color="#22c55e" />
                            </div>
                            <div className="flex gap-3">
                                <Link href="/drivers" className="flex-1 py-3 rounded-lg text-white font-bold uppercase text-sm transition-colors text-center" style={{ background: C.primary }} onClick={() => setModal(null)}>
                                    Perfil Completo
                                </Link>
                                <Link href="/analysis/compare" className="flex-1 py-3 rounded-lg text-white font-bold uppercase text-sm transition-colors text-center" style={{ background: C.lighter, border: "1px solid #475569" }} onClick={() => setModal(null)}>
                                    Comparar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ── Helpers ── */
const p = (n: number) => String(n).padStart(2, "0");

function fmtDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

function fmtTime(timeStr: string | null): string {
    if (!timeStr) return '—';
    return timeStr.substring(0, 5); // "14:00"
}

function ScheduleRow({ label, time }: { label: string; time: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "#cbd5e1" }}>{label}</span>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: "#334155" }}>{time}</span>
        </div>
    );
}

function PodiumCard({ driver, onClick }: { driver: PodiumDriver; onClick: () => void }) {
    const isW = driver.pos === 1;
    const avatarCls = isW ? "w-24 h-24 sm:w-28 sm:h-28" : "w-20 h-20 sm:w-24 sm:h-24";
    const pedestalH = isW ? "h-40" : driver.pos === 2 ? "h-32" : "h-28";
    const [imgError, setImgError] = useState(false);

    // Try 2025 first, fallback to 2026
    const imgUrl = imgError
        ? ''
        : getMediaUrl('drivers', driver.id, '2025.webp');

    return (
        <div className={`podium-card flex flex-col items-center justify-end w-1/3 ${isW ? "z-20" : ""} cursor-pointer`} onClick={onClick}>
            <div className={`relative ${avatarCls} rounded-full overflow-hidden mb-[-10px] z-10 group-hover:scale-105 transition-transform`} style={{ border: `2px solid ${driver.teamColor}`, background: "#1e293b", boxShadow: isW ? "0 0 15px rgba(236,19,30,0.3)" : "none" }}>
                {imgUrl ? (
                    <img
                        src={imgUrl}
                        alt={driver.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        style={{ objectPosition: '60% 0%' }}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: driver.teamColor + '30' }}>
                        <span className="text-2xl font-black text-white">{driver.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                )}
                {isW && <div className="absolute bottom-0 inset-x-0 text-white text-[10px] font-bold text-center py-0.5 z-10" style={{ background: "var(--primary)" }}>VENCEDOR</div>}
            </div>
            <div className={`w-full pt-6 pb-3 px-2 rounded-t-lg flex flex-col items-center justify-between ${pedestalH} ${isW ? "shadow-lg" : ""}`} style={{ background: "var(--surface-lighter)", borderTop: `4px solid ${driver.teamColor}` }}>
                <div className="text-center">
                    <div className={`${isW ? "text-3xl" : "text-2xl"} font-bold leading-none`} style={{ color: isW ? driver.teamColor : "#64748b" }}>{driver.pos}</div>
                    <div className={`${isW ? "text-sm" : "text-xs"} font-bold uppercase text-white truncate w-full text-center mt-1`}>
                        {driver.name.split(" ")[0][0]}. {driver.name.split(" ").pop()}
                    </div>
                    <div className="text-[10px] font-bold uppercase" style={{ color: driver.teamColor }}>{driver.team}</div>
                </div>
                <div className="font-mono" style={{ fontSize: isW ? 12 : 10, color: isW ? "#fff" : "#94a3b8", background: isW ? "#1e293b" : "transparent", padding: isW ? "2px 8px" : 0, borderRadius: 4 }}>
                    {driver.time}
                </div>
            </div>
        </div>
    );
}

function QuickStat({ icon, iconColor, label, value, children }: { icon: string; iconColor: string; label: string; value: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-xl p-4 card-hover" style={{ background: "var(--surface)", border: "1px solid var(--surface-lighter)" }}>
            <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined" style={{ color: iconColor }}>{icon}</span>
                <span className="text-xs uppercase" style={{ color: "#94a3b8" }}>{label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
            {children}
        </div>
    );
}

function ModalStat({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="rounded-lg p-3 text-center" style={{ background: "var(--surface-lighter)" }}>
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-[10px] uppercase" style={{ color: "#94a3b8" }}>{label}</div>
        </div>
    );
}
