"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { getCountryFlagUrl, getMediaUrl, getTeamLogoUrl } from "@/lib/utils";

// ── Season card images ──
const SEASON_IMAGES: Record<number, string> = {
    2025: "/images/seasons/2025-season-norris.jpg",
    2024: "/images/seasons/2024-season-verstappen.jpg",
    // fallback uses patterned background
};



// ── Color mapping ──
const TEAM_COLORS: Record<string, string> = {
    "ferrari": "#ec131e",
    "mercedes": "#27F4D2",
    "red_bull": "#3671C6",
    "red-bull": "#3671C6",
    "mclaren": "#FF8000",
    "williams": "#005AFF",
    "alpine": "#0093cc",
    "aston_martin": "#229971",
    "aston-martin": "#229971",
    "haas": "#ffffff",
    "sauber": "#E20514",
    "rb": "#6692FF",
    "renault": "#ffd800",
    "brawn": "#b0d828",
    "lotus": "#ffc906",
    "benetton": "#00a86b",
};

function getTeamColor(id: string): string {
    return TEAM_COLORS[id] || "#94a3b8";
}



export default function SeasonDetailPage({ year }: { year: string }) {
    const [loading, setLoading] = useState(true);
    const [races, setRaces] = useState<any[]>([]);
    const [driverStandings, setDriverStandings] = useState<any[]>([]);
    const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
    const [driverLeader, setDriverLeader] = useState<any>(null);
    const [constructorLeader, setConstructorLeader] = useState<any>(null);
    const [totalRaces, setTotalRaces] = useState(0);
    const [completedRaces, setCompletedRaces] = useState(0);
    const [polesLeader, setPolesLeader] = useState<any>(null);
    const [biggestWinner, setBiggestWinner] = useState<any>(null);
    const [standingsView, setStandingsView] = useState<"drivers" | "constructors">("drivers");

    useEffect(() => {
        async function fetchSeasonData() {
            setLoading(true);
            try {
                const yr = parseInt(year);

                // 1. Fetch all races for this season, including countryId from circuits
                const { data: racesData } = await supabase
                    .from('races')
                    .select('id, year, round, date, officialname, grandprixid, circuitid, circuits(countryid)')
                    .eq('year', yr)
                    .order('round', { ascending: true });

                const racesList = racesData || [];
                setTotalRaces(racesList.length);

                // 2. Fetch race results to get winners
                const { data: resultsData } = await supabase
                    .from('results')
                    .select('raceid, year, round, driverid, constructorid, positionnumber, points, poleposition, gridpositionnumber')
                    .eq('year', yr)
                    .order('round', { ascending: true });

                // Build a map of race results: round -> winner + pole sitter
                const raceResultsByRound: Record<number, { winnerDriverId: string; winnerConstructorId: string; poleDriverId: string }> = {};
                const poleCounts: Record<string, number> = {};
                const winCounts: Record<string, number> = {};
                const completedRoundsSet = new Set<number>();

                if (resultsData) {
                    resultsData.forEach((r: any) => {
                        completedRoundsSet.add(r.round);

                        if (!raceResultsByRound[r.round]) {
                            raceResultsByRound[r.round] = { winnerDriverId: "", winnerConstructorId: "", poleDriverId: "" };
                        }

                        if (r.positionnumber === 1) {
                            raceResultsByRound[r.round].winnerDriverId = r.driverid;
                            raceResultsByRound[r.round].winnerConstructorId = r.constructorid;
                            winCounts[r.driverid] = (winCounts[r.driverid] || 0) + 1;
                        }

                        // Treat grid 1 or poleposition flag as pole sitter for display and counting
                        if (r.poleposition === true || r.gridpositionnumber === 1) {
                            raceResultsByRound[r.round].poleDriverId = r.driverid;
                            // only count for pole leader once per race (in case both flags trigger)
                            if (r.gridpositionnumber === 1) {
                                poleCounts[r.driverid] = (poleCounts[r.driverid] || 0) + 1;
                            }
                        }
                    });
                }
                setCompletedRaces(completedRoundsSet.size);

                // 3. Fetch driver names for winners and poles
                const allDriverIds = new Set<string>();
                Object.values(raceResultsByRound).forEach(r => {
                    if (r.winnerDriverId) allDriverIds.add(r.winnerDriverId);
                    if (r.poleDriverId) allDriverIds.add(r.poleDriverId);
                });

                let driverNameMap: Record<string, { firstname: string; lastname: string; abbr: string }> = {};
                if (allDriverIds.size > 0) {
                    const { data: driversData } = await supabase
                        .from('drivers')
                        .select('id, firstname, lastname, abbreviation')
                        .in('id', Array.from(allDriverIds));
                    if (driversData) {
                        driversData.forEach((d: any) => {
                            driverNameMap[d.id] = { firstname: d.firstname, lastname: d.lastname, abbr: d.abbreviation || d.lastname?.substring(0, 3).toUpperCase() };
                        });
                    }
                }

                // Build enriched races list
                const enrichedRaces = racesList.map((race: any) => {
                    const rr = raceResultsByRound[race.round];
                    const winnerName = rr?.winnerDriverId && driverNameMap[rr.winnerDriverId]
                        ? `${driverNameMap[rr.winnerDriverId].firstname?.[0]}. ${driverNameMap[rr.winnerDriverId].lastname}`
                        : null;
                    const poleName = rr?.poleDriverId && driverNameMap[rr.poleDriverId]
                        ? `${driverNameMap[rr.poleDriverId].firstname?.[0]}. ${driverNameMap[rr.poleDriverId].lastname}`
                        : null;

                    const hasResults = completedRoundsSet.has(race.round);

                    const raceDate = race.date ? new Date(race.date) : null;
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                    return {
                        id: race.id,
                        round: race.round,
                        name: race.officialname || race.grandprixid || `Round ${race.round}`,
                        location: race.circuitid || "",
                        countryId: race.circuits?.countryid || "",
                        date: raceDate ? {
                            month: monthNames[raceDate.getMonth()],
                            day: String(raceDate.getDate()).padStart(2, '0')
                        } : { month: "—", day: "—" },
                        status: hasResults ? "Finished" : "Upcoming",
                        winner: winnerName,
                        winnerTeam: rr?.winnerConstructorId || null,
                        poleSitter: poleName,
                    };
                });
                setRaces(enrichedRaces);

                // 4. Fetch driver standings (final round for this year)
                const { data: dStandings } = await supabase
                    .from('driver_standings')
                    .select('year, round, driverid, positionnumber, points')
                    .eq('year', yr)
                    .order('round', { ascending: false })
                    .order('positionnumber', { ascending: true });

                // Get standings from the latest round only
                let lastRound = 0;
                const dStandingsMap: Record<string, any> = {};
                if (dStandings) {
                    dStandings.forEach((s: any) => {
                        if (lastRound === 0) lastRound = s.round;
                        if (s.round === lastRound && !dStandingsMap[s.driverid]) {
                            dStandingsMap[s.driverid] = s;
                        }
                    });
                }

                // Fetch all driver names for standings
                const standingsDriverIds = Object.keys(dStandingsMap);
                let allDriverNameMap: Record<string, { firstname: string; lastname: string; id: string }> = {};
                if (standingsDriverIds.length > 0) {
                    const { data: dData } = await supabase
                        .from('drivers')
                        .select('id, firstname, lastname')
                        .in('id', standingsDriverIds);
                    if (dData) {
                        dData.forEach((d: any) => {
                            allDriverNameMap[d.id] = d;
                        });
                    }
                }

                // Get driver's constructor from results for this year
                const driverTeamMap: Record<string, string> = {};
                if (resultsData) {
                    resultsData.forEach((r: any) => {
                        if (!driverTeamMap[r.driverid]) {
                            driverTeamMap[r.driverid] = r.constructorid;
                        }
                    });
                }

                const finalDriverStandings = Object.values(dStandingsMap)
                    .sort((a: any, b: any) => a.positionnumber - b.positionnumber)
                    .slice(0, 10)
                    .map((s: any) => {
                        const d = allDriverNameMap[s.driverid];
                        const teamId = driverTeamMap[s.driverid] || "";
                        return {
                            pos: s.positionnumber,
                            name: d ? `${d.firstname?.[0]}. ${d.lastname}` : s.driverid,
                            pts: s.points,
                            team: teamId,
                            teamColor: getTeamColor(teamId),
                        };
                    });
                setDriverStandings(finalDriverStandings);

                // Set driver leader
                if (finalDriverStandings.length > 0) {
                    const leader = finalDriverStandings[0];
                    const leaderDriverObj = Object.values(allDriverNameMap).find(d => `${d.firstname?.[0]}. ${d.lastname}` === leader.name);
                    setDriverLeader({
                        name: leader.name,
                        team: leader.team,
                        image: leaderDriverObj ? getMediaUrl('drivers', leaderDriverObj.id, `2025.webp`) : "",
                    });
                }

                // 5. Fetch constructor standings
                const { data: cStandings } = await supabase
                    .from('constructor_standings')
                    .select('year, round, constructorid, positionnumber, points, constructors(name)')
                    .eq('year', yr)
                    .order('round', { ascending: false })
                    .order('positionnumber', { ascending: true });

                let cLastRound = 0;
                const cStandingsMap: Record<string, any> = {};
                if (cStandings) {
                    cStandings.forEach((s: any) => {
                        if (cLastRound === 0) cLastRound = s.round;
                        if (s.round === cLastRound && !cStandingsMap[s.constructorid]) {
                            cStandingsMap[s.constructorid] = s;
                        }
                    });
                }

                const finalConstructorStandings = Object.values(cStandingsMap)
                    .sort((a: any, b: any) => a.positionnumber - b.positionnumber)
                    .slice(0, 10)
                    .map((s: any) => ({
                        pos: s.positionnumber,
                        name: s.constructors?.name || s.constructorid,
                        id: s.constructorid,
                        pts: s.points,
                        teamColor: getTeamColor(s.constructorid),
                    }));
                setConstructorStandings(finalConstructorStandings);

                // Constructor leader
                if (finalConstructorStandings.length > 0) {
                    const cl = finalConstructorStandings[0];
                    setConstructorLeader({
                        name: cl.name,
                        id: cl.id,
                        points: cl.pts,
                    });
                }

                // Poles leader
                if (Object.keys(poleCounts).length > 0) {
                    const poleLeaderId = Object.entries(poleCounts).sort((a, b) => b[1] - a[1])[0];
                    const poleDriverName = allDriverNameMap[poleLeaderId[0]] || driverNameMap[poleLeaderId[0]];
                    setPolesLeader({
                        name: poleDriverName ? poleDriverName.lastname : poleLeaderId[0],
                        count: poleLeaderId[1],
                        image: getMediaUrl('drivers', poleLeaderId[0], `2025.webp`),
                    });
                }

                // Biggest Winner
                if (Object.keys(winCounts).length > 0) {
                    const winLeaderId = Object.entries(winCounts).sort((a, b) => b[1] - a[1])[0];
                    const winDriverName = allDriverNameMap[winLeaderId[0]] || driverNameMap[winLeaderId[0]];
                    setBiggestWinner({
                        name: winDriverName ? winDriverName.lastname : winLeaderId[0],
                        count: winLeaderId[1],
                        image: getMediaUrl('drivers', winLeaderId[0], `2025.webp`),
                    });
                }

            } catch (error) {
                console.error("Error loading season data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSeasonData();
    }, [year]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center text-white/50">
                    Carregando dados da temporada {year}...
                </div>
                <Footer />
            </div>
        );
    }

    const maxPts = driverStandings.length > 0 ? driverStandings[0].pts : 1;
    const maxCPts = constructorStandings.length > 0 ? constructorStandings[0].pts : 1;

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-dark)]">
            <Header />

            <main className="flex-grow p-6 mx-auto w-full gap-8" style={{ maxWidth: 1400 }}>
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Season Content */}
                    <div className="flex flex-col flex-1 gap-6 min-w-0">

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-lighter)]">
                            <Link href="/seasons" className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Voltar para Temporadas
                            </Link>
                        </div>

                        {/* Season Hero Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Main Stat Card */}
                            <div className="md:col-span-2 relative overflow-hidden rounded-xl bg-[var(--surface)] border border-[var(--surface-lighter)] p-6 flex flex-col justify-between min-h-[220px]">
                                <div
                                    className="absolute right-0 top-0 h-full w-1/2 opacity-30 bg-cover bg-center mask-image-gradient"
                                    style={{
                                        backgroundImage: SEASON_IMAGES[parseInt(year)]
                                            ? `url('${SEASON_IMAGES[parseInt(year)]}')`
                                            : "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
                                    }}
                                ></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/20">
                                            Temporada
                                        </span>
                                        <span className="text-white/40 text-xs">{totalRaces} Corridas ({completedRaces} completas)</span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-1">
                                        Campeonato {year}
                                    </h1>
                                </div>

                                <div className="relative z-10 flex flex-wrap gap-8 mt-6">
                                    {driverLeader && (
                                        <div>
                                            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Campeão de Pilotos</p>
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <p className="text-white font-bold text-lg leading-none">{driverLeader.name}</p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        {driverLeader.team && (
                                                            <div className="size-4 rounded overflow-hidden shrink-0">
                                                                <img src={getTeamLogoUrl(driverLeader.team)} alt="" className="w-full h-full object-contain filter" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                            </div>
                                                        )}
                                                        <p className="text-primary text-sm font-medium">{driverLeader.team}</p>
                                                    </div>
                                                </div>
                                                <div className="w-20 h-20 rounded-full bg-surface-darker border border-white/10 overflow-hidden shadow-lg mt-1">
                                                    <img alt={driverLeader.name} className="w-full h-full object-cover object-top" src={driverLeader.image} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                                    <div className="hidden w-full h-full flex flex-col items-center justify-center text-white font-bold text-2xl">{driverLeader.name?.[0]}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {constructorLeader && (
                                        <div>
                                            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Campeã de Construtores</p>
                                            <div className="flex items-center gap-3">
                                                <div className="size-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 shadow-sm">
                                                    {constructorLeader.id ? (
                                                        <img src={getTeamLogoUrl(constructorLeader.id)} alt="" className="w-full h-full object-contain p-2 drop-shadow-sm filter scale-[1.0]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-white">sports_motorsports</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-lg leading-none mb-1">{constructorLeader.name}</p>
                                                    <p className="text-white/40 text-sm font-medium">{constructorLeader.points} Pontos</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-rows-2 gap-4">
                                {/* Biggest Winner */}
                                <div className="bg-[var(--surface)] border border-[var(--surface-lighter)] rounded-xl p-5 flex flex-col justify-center">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Maior Vencedor</p>
                                            {biggestWinner ? (
                                                <div className="flex items-center gap-3">
                                                    {biggestWinner.image && (
                                                        <div className="size-10 rounded-full overflow-hidden bg-surface-darker border border-white/10 shrink-0">
                                                            <img src={biggestWinner.image} alt={biggestWinner.name} className="w-full h-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{biggestWinner.name}</p>
                                                        <p className="text-xl font-bold text-primary mt-0.5 leading-none">{biggestWinner.count} Vitórias</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-white/40 text-sm">Sem dados</p>
                                            )}
                                        </div>
                                        <div className="text-primary bg-primary/10 p-2 rounded-lg">
                                            <span className="material-symbols-outlined">emoji_events</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Poles Stats */}
                                <div className="bg-[var(--surface)] border border-[var(--surface-lighter)] rounded-xl p-5 flex flex-col justify-center">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Maior Pole Position</p>
                                            {polesLeader ? (
                                                <div className="flex items-center gap-3">
                                                    {polesLeader.image && (
                                                        <div className="size-10 rounded-full overflow-hidden bg-surface-darker border border-white/10 shrink-0">
                                                            <img src={polesLeader.image} alt={polesLeader.name} className="w-full h-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{polesLeader.name}</p>
                                                        <p className="text-xl font-bold text-purple-400 mt-0.5 leading-none">{polesLeader.count} Poles</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-white/40 text-sm">Sem dados</p>
                                            )}
                                        </div>
                                        <div className="text-purple-400 bg-purple-400/10 p-2 rounded-lg">
                                            <span className="material-symbols-outlined">timer</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Calendar Grid */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">Calendário de Corridas</h3>
                                <span className="text-white/40 text-sm">{races.length} GPs</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {races.map((race) => (
                                    <Link href={`/races/${race.id}`} key={race.id} className={`group relative bg-[var(--surface)] border transition-all rounded-xl overflow-hidden p-4 block ${race.status === "Finished"
                                        ? "border-[var(--surface-lighter)] hover:border-primary/50"
                                        : "border-[var(--surface-lighter)] hover:border-white/20"
                                        }`}>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex flex-col items-center justify-center rounded w-10 h-10 border shrink-0 ${race.status === "Finished" ? 'bg-white/5 border-white/5 text-white' : 'bg-primary/10 border-primary/20 text-primary'
                                                    }`}>
                                                    <span className={`text-[10px] font-bold uppercase ${race.status !== 'Finished' && 'text-primary/60'}`}>{race.date.month}</span>
                                                    <span className="text-sm font-bold">{race.date.day}</span>
                                                </div>

                                                {race.countryId && (
                                                    <div className="h-6 w-8 shrink-0 rounded overflow-hidden shadow border border-white/10 hidden sm:block">
                                                        <img src={getCountryFlagUrl(race.countryId)} alt={race.countryId} className="w-full h-full object-cover" />
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-white font-bold truncate text-sm">{race.name}</h4>
                                                        <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded shrink-0">R{race.round}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {race.countryId && (
                                                            <div className="h-3 w-4 shrink-0 rounded-[2px] overflow-hidden shadow sm:hidden inline-block">
                                                                <img src={getCountryFlagUrl(race.countryId)} alt={race.countryId} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <p className="text-white/40 text-xs truncate capitalize">{race.location?.replace(/-/g, ' ')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Removed 'Finalizado' tag per user request */}
                                            {race.status === 'Upcoming' && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 px-2 py-1 rounded shrink-0">Em Breve</span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 border-t border-white/5 pt-3 mt-3">
                                            <div className="flex items-center justify-between">
                                                {race.status === 'Finished' && race.winner && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-yellow-500 text-lg">emoji_events</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-white/40 uppercase tracking-wider">Vencedor</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm text-white font-medium">{race.winner}</span>
                                                                {race.winnerTeam && (
                                                                    <div className="size-4 rounded overflow-hidden">
                                                                        <img src={getTeamLogoUrl(race.winnerTeam)} alt="" className="w-full h-full object-contain filter" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {race.status === 'Finished' && race.poleSitter && (
                                                    <div className="flex items-center gap-2 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[10px] text-white/40 uppercase tracking-wider">Pole Position</span>
                                                            <span className="text-sm text-white font-medium">{race.poleSitter}</span>
                                                        </div>
                                                        <span className="material-symbols-outlined text-primary text-lg">timer</span>
                                                    </div>
                                                )}

                                                {race.status === 'Upcoming' && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-white/40 text-lg">schedule</span>
                                                        <span className="text-xs text-white/40">Aguardando corrida</span>
                                                    </div>
                                                )}
                                                {!race.winner && race.status === 'Finished' && (
                                                    <span className="text-xs text-white/30">Resultados pendentes</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Standings Sidebar */}
                    <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
                        <div className="bg-[var(--surface)] border border-[var(--surface-lighter)] rounded-xl p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white">Classificação</h3>
                                <div className="flex bg-[var(--surface-lighter)] rounded-lg p-0.5 border border-white/5">
                                    <button
                                        onClick={() => setStandingsView("drivers")}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${standingsView === "drivers" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}
                                    >
                                        Pilotos
                                    </button>
                                    <button
                                        onClick={() => setStandingsView("constructors")}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${standingsView === "constructors" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"}`}
                                    >
                                        Equipes
                                    </button>
                                </div>
                            </div>

                            {/* Driver standings */}
                            {standingsView === "drivers" && (
                                <div className="flex flex-col gap-5">
                                    {driverStandings.map((driver) => (
                                        <div key={driver.pos} className="flex items-center gap-3 group cursor-pointer">
                                            <div className="w-6 text-center text-sm font-bold text-white/40 group-hover:text-primary transition-colors">
                                                {driver.pos}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-bold text-white">{driver.name}</span>
                                                    <span className="text-sm font-bold text-primary">{driver.pts}</span>
                                                </div>
                                                <div className="w-full bg-[var(--surface-lighter)] h-1.5 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${(driver.pts / maxPts) * 100}%`, backgroundColor: driver.teamColor }}></div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className="text-[10px] text-white/40 capitalize">{driver.team?.replace(/_/g, ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Constructor standings */}
                            {standingsView === "constructors" && (
                                <div className="flex flex-col gap-5">
                                    {constructorStandings.map((team) => (
                                        <div key={team.pos} className="flex items-center gap-3 group cursor-pointer">
                                            <div className="w-6 text-center text-sm font-bold text-white/40 group-hover:text-primary transition-colors">
                                                {team.pos}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-bold text-white">{team.name}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-primary">{team.pts}</span>
                                                </div>
                                                <div className="w-full bg-[var(--surface-lighter)] h-1.5 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${(team.pts / maxCPts) * 100}%`, backgroundColor: team.teamColor }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Link href={`/seasons`} className="block w-full mt-8 py-3 rounded-lg border border-[var(--surface-lighter)] text-white/60 text-sm text-center hover:bg-white/5 hover:text-white transition-colors">
                                Ver Todas as Temporadas
                            </Link>
                        </div>
                    </aside>

                </div>
            </main>

            <Footer />
        </div>
    );
}
