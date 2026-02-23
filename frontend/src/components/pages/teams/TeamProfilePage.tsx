/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { getCountryFlagUrl, getMediaUrl, getTeamLogoUrl } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

interface TeamProfilePageProps {
    id: string;
}

// Global helper for dynamic colors
function hexToRgba(hex: string, alpha: number) {
    if (!hex) return `rgba(236,19,30,${alpha})`;
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = typeof c === 'string' ? c : '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return `rgba(236,19,30,${alpha})`;
}

export default function TeamProfilePage({ id }: TeamProfilePageProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [seasonPage, setSeasonPage] = useState(0);
    const SEASONS_PER_PAGE = 10;

    useEffect(() => {
        setIsMounted(true);
        async function fetchTeam() {
            setLoading(true);
            try {
                // Fetch Constructor Base
                const { data: cData, error: cErr } = await supabase
                    .from('constructors')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (cErr) throw cErr;

                const totalWins = cData.totalracewins || 0;
                const totalPodiums = cData.totalpodiums || 0;
                const totalPoles = cData.totalpolepositions || 0;
                const totalChamps = cData.totalchampionshipwins || 0;
                const totalEntries = cData.totalraceentries || 0;

                // Team overrides for classic data not in the DB
                const TEAM_INFO_OVERRIDES: Record<string, { firstEntryYear: number | string, teamPrincipal: string }> = {
                    ferrari: { firstEntryYear: 1950, teamPrincipal: 'Frédéric Vasseur' },
                    mclaren: { firstEntryYear: 1966, teamPrincipal: 'Andrea Stella' },
                    mercedes: { firstEntryYear: 1954, teamPrincipal: 'Toto Wolff' },
                    red_bull: { firstEntryYear: 2005, teamPrincipal: 'Christian Horner' },
                    williams: { firstEntryYear: 1978, teamPrincipal: 'James Vowles' },
                    aston_martin: { firstEntryYear: 1959, teamPrincipal: 'Mike Krack' },
                    alpine: { firstEntryYear: 1977, teamPrincipal: 'Oliver Oakes' },
                    sauber: { firstEntryYear: 1993, teamPrincipal: 'Mattia Binotto' },
                    haas: { firstEntryYear: 2016, teamPrincipal: 'Ayao Komatsu' },
                    rb: { firstEntryYear: 2006, teamPrincipal: 'Laurent Mekies' },
                };

                // ── Lineage Milestones ──
                // First entry year
                const { data: firstEntryData } = await supabase
                    .from('results')
                    .select('year')
                    .eq('constructorid', cData.id)
                    .order('year', { ascending: true })
                    .limit(1);
                const firstEntryYear = firstEntryData?.[0]?.year || '?';

                // First win year
                const { data: firstWinData } = await supabase
                    .from('results')
                    .select('year')
                    .eq('constructorid', cData.id)
                    .eq('positionnumber', 1)
                    .order('year', { ascending: true })
                    .limit(1);
                const firstWinYear = firstWinData?.[0]?.year;

                // First WCC year
                const { data: wccData } = await supabase
                    .from('constructor_standings')
                    .select('year')
                    .eq('constructorid', cData.id)
                    .eq('championshipwon', true)
                    .order('year', { ascending: true });
                const firstWccYear = wccData?.[0]?.year;

                // Build lineage dynamically
                const overrideInfo = TEAM_INFO_OVERRIDES[cData.id] || { firstEntryYear: firstEntryYear, teamPrincipal: 'N/A' };
                const displayFirstEntryYear = overrideInfo.firstEntryYear !== '?' ? overrideInfo.firstEntryYear : firstEntryYear;

                const lineage: any[] = [];
                lineage.push({ year: displayFirstEntryYear, text: `First F1 entry — ${totalEntries} races entered to date`, icon: 'flag' });
                if (firstWinYear) lineage.push({ year: firstWinYear, text: `1st race victory — now ${totalWins} total wins`, icon: 'emoji_events' });
                if (totalWins >= 10) lineage.push({ year: '', text: `10th victory milestone`, icon: 'military_tech' });
                if (totalWins >= 50) lineage.push({ year: '', text: `50th victory milestone`, icon: 'military_tech' });
                if (totalWins >= 100) lineage.push({ year: '', text: `100th victory milestone — Elite club`, icon: 'diamond' });
                if (firstWccYear) lineage.push({ year: firstWccYear, text: `1st Constructors' Championship — ${totalChamps} total WCC titles`, icon: 'workspace_premium' });
                if (totalPoles > 0) lineage.push({ year: '', text: `${totalPoles} pole positions achieved`, icon: 'speed' });
                lineage.push({ year: '', text: `${totalPodiums} podium finishes`, icon: 'podium' });

                // ── Current Lineup (latest year in results) ──
                const { data: latestResults } = await supabase
                    .from('results')
                    .select('driverid, year')
                    .eq('constructorid', cData.id)
                    .order('year', { ascending: false })
                    .limit(50);

                const latestYear = latestResults?.[0]?.year || 2024;
                const currentDriverIds = [...new Set(latestResults?.filter((r: any) => r.year === latestYear).map((r: any) => r.driverid))];

                // Fetch driver details
                let currentDrivers: any[] = [];
                if (currentDriverIds.length > 0) {
                    const { data: driverData } = await supabase
                        .from('drivers')
                        .select('id, name, permanentnumber')
                        .in('id', currentDriverIds);

                    if (driverData) {
                        currentDrivers = driverData.map((d: any) => ({
                            name: d.name,
                            number: d.permanentnumber || '?',
                            role: 'Driver',
                            imageUrl: getMediaUrl('drivers', d.id, `2026.webp`),
                        }));
                    }
                }

                // ── Visuals ──
                const TEAM_VISUALS: Record<string, { color: string; logoUrl: string }> = {
                    ferrari: { color: "#ec131e", logoUrl: "/images/teams/logo-ferrari-f1-2021.png" },
                    mercedes: { color: "#27F4D2", logoUrl: "/images/teams/logo-mercedes-2026.png" },
                    red_bull: { color: "#3671C6", logoUrl: "/images/teams/logo-red-bull-f1-2026.png" },
                    mclaren: { color: "#FF8000", logoUrl: "/images/teams/logo-mclaren-f1-2021.png" },
                    aston_martin: { color: "#229971", logoUrl: "/images/teams/logo-ston-martin-2026.png" },
                    alpine: { color: "#0093cc", logoUrl: "/images/teams/logo-alpine-f1-2021.png" },
                    williams: { color: "#005AFF", logoUrl: "/images/teams/logo-williams-f1-2026.png" },
                    rb: { color: "#6692FF", logoUrl: "/images/teams/visa-rb-soymotor.2024.png" },
                    haas: { color: "#ffffff", logoUrl: "/images/teams/logo-haas-f1-2021.png" },
                    sauber: { color: "#E20514", logoUrl: "/images/teams/logo-audi-f1-2026.png" },
                    audi: { color: "#E20514", logoUrl: "/images/teams/logo-audi-f1-2026.png" },
                    cadillac: { color: "#D3A13B", logoUrl: "/images/teams/logo-cadillac-f1-2026.png" }
                };

                const teamVisual = TEAM_VISUALS[cData.id] || {
                    color: "#0f172a",
                };

                const flagUrl = getCountryFlagUrl(cData.countryid);

                // ── Season History from constructor_standings ──
                const { data: standingsData } = await supabase
                    .from('constructor_standings')
                    .select('year, round, positionnumber, points, championshipwon')
                    .eq('constructorid', cData.id)
                    .order('year', { ascending: false })
                    .order('round', { ascending: false });

                // Group by year: keep only the last round per year
                const seasonMap: Record<number, any> = {};
                if (standingsData) {
                    standingsData.forEach((s: any) => {
                        if (!seasonMap[s.year]) {
                            seasonMap[s.year] = {
                                year: s.year,
                                position: s.positionnumber,
                                points: s.points,
                                championshipWon: s.championshipwon,
                                wins: 0,
                                podiums: 0,
                                poles: 0,
                            };
                        }
                    });
                }

                // Enrich with per-season wins & podiums
                const { data: raceResults } = await supabase
                    .from('results')
                    .select('year, positionnumber')
                    .eq('constructorid', cData.id)
                    .in('positionnumber', [1, 2, 3]);
                if (raceResults) {
                    raceResults.forEach((r: any) => {
                        if (seasonMap[r.year]) {
                            seasonMap[r.year].podiums += 1;
                            if (r.positionnumber === 1) seasonMap[r.year].wins += 1;
                        }
                    });
                }

                // Enrich with per-season poles
                const { data: qualResults } = await supabase
                    .from('qualifying')
                    .select('year, positionnumber')
                    .eq('constructorid', cData.id)
                    .eq('positionnumber', 1);
                if (qualResults) {
                    qualResults.forEach((q: any) => {
                        if (seasonMap[q.year]) seasonMap[q.year].poles += 1;
                    });
                }

                // Fetch drivers who actually raced (from results)
                const { data: racedDriversData } = await supabase
                    .from('results')
                    .select('year, driverid')
                    .eq('constructorid', cData.id);

                const racedSet = new Set<string>();
                if (racedDriversData) {
                    racedDriversData.forEach((rd: any) => {
                        racedSet.add(`${rd.year}-${rd.driverid}`);
                    });
                }

                // Fetch drivers per season map
                const { data: seasonDriversData } = await supabase
                    .from('seasons_entrants_drivers')
                    .select(`
                        year,
                        driverid
                    `)
                    .eq('constructorid', cData.id);

                if (seasonDriversData) {
                    seasonDriversData.forEach((sd: any) => {
                        if (seasonMap[sd.year]) {
                            if (!seasonMap[sd.year].drivers) seasonMap[sd.year].drivers = [];

                            // Transform 'lewis-hamilton' into 'Lewis Hamilton'
                            const formattedName = sd.driverid.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                            const isReserve = !racedSet.has(`${sd.year}-${sd.driverid}`);

                            const existing = seasonMap[sd.year].drivers.find((d: any) => d.id === sd.driverid);
                            if (!existing) {
                                seasonMap[sd.year].drivers.push({
                                    id: sd.driverid,
                                    name: formattedName,
                                    isReserve: isReserve
                                });
                            }
                        }
                    });
                }

                // ── Technical Evolution ──
                const constructorIds = cData.id === 'rb' || cData.id === 'racing-bulls'
                    ? ['rb', 'racing-bulls']
                    : [cData.id];

                const { data: techData } = await supabase
                    .from('vw_team_technical_evolution')
                    .select('*')
                    .in('constructor_id', constructorIds)
                    .order('year', { ascending: false });

                const techEvolution = (techData || []).map((car: any) => ({
                    year: car.year,
                    name: car.chassis_fullname || car.chassis_name || 'Generic Chassis',
                    engine: car.engine_name || 'Unknown Engine',
                    capacity: car.engine_capacity,
                    configuration: car.engine_configuration,
                    aspiration: car.engine_aspiration?.replace('_', ' ') || '',
                    wins: seasonMap[car.year]?.wins || 0,
                    poles: seasonMap[car.year]?.poles || 0,
                    podiums: seasonMap[car.year]?.podiums || 0,
                    imageUrl: getMediaUrl('cars', cData.id, `${car.year}.webp`)
                }));

                const seasons = Object.values(seasonMap).sort((a: any, b: any) => b.year - a.year);

                const dbTeam = {
                    id: cData.id,
                    name: cData.name,
                    fullName: cData.fullname || cData.name,
                    base: cData.countryid || "Unknown",
                    teamPrincipal: overrideInfo.teamPrincipal,
                    championships: totalChamps,
                    wins: totalWins,
                    podiums: totalPodiums,
                    poles: totalPoles,
                    color: teamVisual.color,
                    logoUrl: getTeamLogoUrl(cData.id),
                    flagUrl: flagUrl,
                    heroImageUrl: "https://images.unsplash.com/photo-1541348263662-e068662d82af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                    drivers: currentDrivers,
                    lineage: lineage,
                    techEvolution: techEvolution,
                    seasons: seasons,
                };

                setTeam(dbTeam);
            } catch (err) {
                console.error("Error fetching team details:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTeam();
    }, [id]);

    if (!isMounted) return <div className="min-h-screen" style={{ background: C.bg }} />;
    if (loading) return <div className="min-h-screen flex items-center justify-center text-white" style={{ background: C.bg }}>Loading Team...</div>;
    if (!team) return <div className="min-h-screen flex items-center justify-center text-white" style={{ background: C.bg }}>Team not found.</div>;

    const teamColor = team.color;

    const pageBgColor = C.bg; // Use dark aesthetic for the entire page
    const cardBgColor = hexToRgba(teamColor, 0.08);
    const cardBorderColor = hexToRgba(teamColor, 0.2);

    return (
        <div className="flex flex-col min-h-screen font-sans text-slate-100" style={{ backgroundColor: pageBgColor }}>
            <Header />

            {/* Breadcrumb */}
            <div className="flex flex-wrap gap-2 px-4 md:px-10 py-4 items-center mb-2 mx-auto w-full max-w-[1600px]">
                <Link href="/" className="text-sm font-medium leading-normal transition-colors" style={{ color: C.dimmed }}>Home</Link>
                <span className="material-symbols-outlined !text-sm" style={{ color: C.dimmed }}>chevron_right</span>
                <Link href="/teams" className="text-sm font-medium leading-normal transition-colors hover:text-white" style={{ color: C.dimmed }}>Teams</Link>
                <span className="material-symbols-outlined !text-sm" style={{ color: C.dimmed }}>chevron_right</span>
                <span className="text-sm font-medium leading-normal text-white">{team.name}</span>
            </div>

            {/* Main Content Grid */}
            <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-10 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Hero Section (Top Left) - Spans 8 columns */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Team Profile Card */}
                        <div className="relative overflow-hidden rounded-xl border h-full min-h-[420px] flex flex-col justify-between group" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>

                            {/* Background with Overlay */}
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 80%)` }}></div>
                                <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')` }}></div>
                                {/* Car Image configured to display uncropped like the reference */}
                                <img src={team.heroImageUrl} alt={`${team.name} Car`} className="w-full h-full object-contain object-center absolute inset-0 z-0 drop-shadow-2xl group-hover:scale-[1.02] transition-transform duration-700" />
                            </div>

                            {/* Top Info */}
                            <div className="relative z-20 p-8 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <img src={team.flagUrl} alt={`${team.base} flag`} className="h-5 w-auto rounded-sm shadow-sm" />
                                        <span className="font-bold tracking-wider uppercase text-sm" style={{ color: teamColor }}>{team.base}</span>
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">{team.name}</h1>
                                    <p className="text-lg" style={{ color: C.muted }}>
                                        Team Principal: <span className="text-white font-medium">{team.teamPrincipal}</span>
                                    </p>
                                </div>
                                <div className="hidden md:block bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/10">
                                    {/* TODO: AJUSTE DE ENQUADRAMENTO DO LOGO AQUI (ex: padding p-4 da div pai, h-24 da imagem ou object-contain) */}
                                    <img src={team.logoUrl} alt="Team Logo" className="h-24 w-auto drop-shadow-lg object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                            </div>

                            {/* Bottom Stats Strip */}
                            <div className="relative z-20 p-6 backdrop-blur-sm border-t border-white/10" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-white/10">
                                    <div className="px-4 first:pl-0">
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.dimmed }}>WCC Titles</p>
                                        <p className="text-3xl font-bold text-white flex items-center gap-2">
                                            {team.championships} <span className="material-symbols-outlined text-yellow-500 !text-xl">emoji_events</span>
                                        </p>
                                    </div>
                                    <div className="px-4">
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.dimmed }}>Race Wins</p>
                                        <p className="text-3xl font-bold text-white">{team.wins}</p>
                                    </div>
                                    <div className="px-4">
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.dimmed }}>Podiums</p>
                                        <p className="text-3xl font-bold text-white">{team.podiums}</p>
                                    </div>
                                    <div className="px-4">
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.dimmed }}>Poles</p>
                                        <p className="text-3xl font-bold text-white">{team.poles}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel (Drivers & Lineage) - Spans 4 columns */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <h3 className="text-xl font-bold text-white px-2">Current Lineup</h3>

                        {team.drivers.map((drv: any, idx: number) => (
                            <div key={idx} className="relative flex flex-col rounded-xl border overflow-hidden group hover:border-opacity-100 transition-colors duration-300" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor, '--tw-border-opacity': '0.5' } as React.CSSProperties}>
                                <div className="h-28 relative bg-gradient-to-r from-slate-900 to-slate-800">
                                    <div className="absolute right-4 top-3 text-5xl font-bold text-white/10 italic">#{drv.number}</div>
                                    {drv.imageUrl && (
                                        <div className="absolute -bottom-8 left-6">
                                            <div className="w-20 h-20 rounded-full border-4 shadow-xl overflow-hidden bg-zinc-900" style={{ borderColor: teamColor }}>
                                                <img src={drv.imageUrl} alt={drv.name} className="w-full h-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            </div>
                                        </div>
                                    )}
                                    {!drv.imageUrl && (
                                        <div className="absolute -bottom-8 left-6">
                                            <div className="w-20 h-20 rounded-full border-4 shadow-xl overflow-hidden flex items-center justify-center text-2xl font-bold" style={{ borderColor: teamColor, backgroundColor: hexToRgba(teamColor, 0.3), color: 'white' }}>
                                                {drv.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="px-6 pb-5 pt-10">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-lg font-bold text-white leading-tight">{drv.name}</h4>
                                            <p className="text-sm" style={{ color: C.dimmed }}>{drv.role}</p>
                                        </div>
                                        <div className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: hexToRgba(teamColor, 0.15), color: teamColor }}>
                                            #{drv.number}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Team Lineage Chart (Mini) */}
                        <div className="rounded-xl border p-6 flex-1 flex flex-col" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                            <h3 className="text-sm uppercase font-bold mb-4 tracking-wider" style={{ color: C.muted }}>Team Lineage</h3>
                            {/* Lineage Timeline with Scroll */}
                            <div className="flex flex-col gap-4 relative max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
                                {/* Connecting Line */}
                                <div className="absolute left-[19px] top-4 bottom-4 w-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></div>

                                {team.lineage.map((item: any, idx: number) => (
                                    <div key={idx} className="relative flex items-center gap-4">
                                        <div className="size-10 rounded-full border flex items-center justify-center z-10 shrink-0" style={{ backgroundColor: 'unset', borderColor: 'rgba(255,255,255,0.1)', background: C.surface }}>
                                            <span className="material-symbols-outlined !text-lg" style={{ color: C.muted }}>{item.icon}</span>
                                        </div>
                                        <div>
                                            {item.year && <div className="text-xs font-bold" style={{ color: teamColor }}>{item.year}</div>}
                                            <div className="font-medium text-white text-sm">{item.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Championship Position Evolution Chart */}
                {team.seasons.length > 0 && (
                    <div className="mt-8 rounded-xl border overflow-hidden" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ color: teamColor }}>show_chart</span>
                                Championship Position Evolution
                            </h3>
                            <p className="text-xs mt-1" style={{ color: C.dimmed }}>Lower position = better result. Hover for details.</p>
                        </div>
                        <div className="p-6" style={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[...team.seasons].reverse()} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} interval="preserveStartEnd" />
                                    <YAxis reversed domain={[1, 'auto']} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} label={{ value: 'Position', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload || !payload[0]) return null;
                                            const d = payload[0].payload;
                                            return (
                                                <div style={{ backgroundColor: '#1e293b', border: `1px solid ${teamColor}40`, borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                                                    <div className="text-white font-bold text-sm mb-2">{d.year} Season</div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                                        <span style={{ color: '#94a3b8' }}>WCC Position</span>
                                                        <span className="text-white font-bold text-right">P{d.position}</span>
                                                        <span style={{ color: '#94a3b8' }}>Points</span>
                                                        <span className="text-white font-bold text-right">{d.points}</span>
                                                        <span style={{ color: '#94a3b8' }}>Wins</span>
                                                        <span className="text-white font-bold text-right">{d.wins}</span>
                                                        <span style={{ color: '#94a3b8' }}>Podiums</span>
                                                        <span className="text-white font-bold text-right">{d.podiums}</span>
                                                        <span style={{ color: '#94a3b8' }}>Pole Positions</span>
                                                        <span className="text-white font-bold text-right">{d.poles}</span>
                                                    </div>
                                                    {d.championshipWon && (
                                                        <div className="mt-2 flex items-center gap-1 text-yellow-500 text-xs font-bold">
                                                            <span className="material-symbols-outlined !text-sm">emoji_events</span>
                                                            Championship Won!
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }}
                                    />
                                    <Line type="monotone" dataKey="position" stroke={teamColor} strokeWidth={2.5} dot={{ r: 3, fill: teamColor, strokeWidth: 0 }} activeDot={{ r: 6, fill: teamColor, stroke: '#fff', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Season History Table (Paginated) */}
                {team.seasons.length > 0 && (() => {
                    const totalPages = Math.ceil(team.seasons.length / SEASONS_PER_PAGE);
                    const paginatedSeasons = team.seasons.slice(seasonPage * SEASONS_PER_PAGE, (seasonPage + 1) * SEASONS_PER_PAGE);
                    return (
                        <div className="mt-8 rounded-xl border overflow-hidden" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                            <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined" style={{ color: teamColor }}>table_chart</span>
                                    Season History
                                </h3>
                                <span className="text-xs font-bold" style={{ color: C.dimmed }}>{team.seasons.length} seasons recorded</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-black/20 font-medium uppercase text-xs tracking-wider" style={{ color: C.muted }}>
                                        <tr>
                                            <th className="px-6 py-4">Season</th>
                                            <th className="px-6 py-4">Drivers</th>
                                            <th className="px-6 py-4 text-right">Points</th>
                                            <th className="px-6 py-4 text-center">WCC Pos</th>
                                            <th className="px-6 py-4 text-center">Wins</th>
                                            <th className="px-6 py-4 text-center">Podiums</th>
                                            <th className="px-6 py-4 text-center">Poles</th>
                                            <th className="px-6 py-4 text-center">Champion</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-slate-300" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        {paginatedSeasons.map((season: any, idx: number) => (
                                            <tr key={idx} className="transition-colors hover:bg-white/5" style={season.championshipWon ? { borderLeft: `4px solid ${teamColor}`, backgroundColor: hexToRgba(teamColor, 0.05) } : {}}>
                                                <td className="px-6 py-4 font-bold text-white">{season.year}</td>
                                                <td className="px-6 py-4">
                                                    {season.drivers && season.drivers.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                                                            {season.drivers
                                                                .sort((a: any, b: any) => (a.isReserve === b.isReserve ? 0 : a.isReserve ? 1 : -1))
                                                                .map((d: any, i: number) => (
                                                                    <span
                                                                        key={i}
                                                                        className={`text-[11px] px-2 py-0.5 rounded-full ${d.isReserve ? 'border border-white/10' : ''}`}
                                                                        style={d.isReserve ? { color: C.dimmed, backgroundColor: 'transparent' } : { backgroundColor: hexToRgba(teamColor, 0.15), color: '#fff', fontWeight: 500 }}
                                                                    >
                                                                        {d.name}
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: C.dimmed }}>—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-variant-numeric tabular-nums">{season.points}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {season.position === 1 ? (
                                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: teamColor }}>1st</span>
                                                    ) : season.position <= 3 ? (
                                                        <span className="inline-flex items-center rounded-full bg-yellow-400/10 px-2.5 py-0.5 text-xs font-medium text-yellow-500">{season.position}{season.position === 2 ? 'nd' : 'rd'}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">{season.position}th</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold">{season.wins > 0 ? season.wins : <span style={{ color: C.dimmed }}>—</span>}</td>
                                                <td className="px-6 py-4 text-center">{season.podiums > 0 ? season.podiums : <span style={{ color: C.dimmed }}>—</span>}</td>
                                                <td className="px-6 py-4 text-center">{season.poles > 0 ? season.poles : <span style={{ color: C.dimmed }}>—</span>}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {season.championshipWon ? (
                                                        <span className="material-symbols-outlined text-yellow-500 !text-lg">emoji_events</span>
                                                    ) : (
                                                        <span style={{ color: C.dimmed }}>—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>Page {seasonPage + 1} of {totalPages}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setSeasonPage(p => Math.max(0, p - 1))} disabled={seasonPage === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-30" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted }}>Prev</button>
                                    <button onClick={() => setSeasonPage(p => Math.min(totalPages - 1, p + 1))} disabled={seasonPage >= totalPages - 1} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-30" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted }}>Next</button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Technical Evolution */}
                {team.techEvolution && team.techEvolution.length > 0 && (
                    <div className="mt-8 rounded-xl border p-6" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ color: teamColor }}>history</span>
                                Technical Evolution
                            </h3>
                            <div className="flex gap-2">
                                <span className="text-sm font-bold" style={{ color: C.dimmed }}>{team.techEvolution.length} cars</span>
                            </div>
                        </div>

                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
                            {team.techEvolution.map((car: any, idx: number) => (
                                <div key={idx} className="group relative rounded-lg overflow-hidden border transition-colors hover:border-white/20 shrink-0 w-72 snap-start" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="h-32 w-full relative flex items-center justify-center p-4 transition-colors" style={{ backgroundColor: hexToRgba(teamColor, 0.15) }}>
                                        {car.imageUrl ? (
                                            <div className="relative w-full h-full drop-shadow-2xl">
                                                <img src={car.imageUrl} alt={car.name} className="w-full h-full object-contain filter brightness-110 contrast-125 transition-transform group-hover:scale-105" onError={(e) => { e.currentTarget.style.opacity = '0'; }} />
                                            </div>
                                        ) : (
                                            <span className="material-symbols-outlined !text-6xl opacity-20" style={{ color: teamColor }}>directions_car</span>
                                        )}
                                        <div className="absolute bottom-2 right-2 text-white text-xs font-bold px-2 py-1 rounded shadow-lg backdrop-blur-md" style={{ backgroundColor: hexToRgba(teamColor, 0.7) }}>
                                            {car.year}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="text-lg font-bold text-white mb-2 truncate" title={car.name}>{car.name}</h4>

                                        {/* Engine Specs */}
                                        <div className="mb-3 space-y-1">
                                            <div className="flex items-center gap-1 text-xs" style={{ color: C.muted }}>
                                                <span className="material-symbols-outlined !text-[14px]">settings</span>
                                                <span className="font-medium text-slate-300">{car.engine}</span>
                                            </div>
                                            {(car.capacity || car.configuration) && (
                                                <div className="flex items-center gap-1 text-xs pl-5" style={{ color: C.dimmed }}>
                                                    {car.capacity}L {car.configuration} {car.aspiration && <span className="capitalize text-[10px] px-1.5 py-0.5 rounded bg-white/5 ml-1">{car.aspiration.toLowerCase()}</span>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Performance Stats */}
                                        <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', color: C.muted }}>
                                            <div className="flex gap-3">
                                                <span className="font-bold flex items-center gap-1" title="Wins" style={{ color: car.wins > 0 ? teamColor : C.dimmed }}>
                                                    <span className="material-symbols-outlined !text-[13px]">emoji_events</span>
                                                    {car.wins}
                                                </span>
                                                <span className="font-bold flex items-center gap-1" title="Podiums" style={{ color: car.podiums > 0 ? '#fbbf24' : C.dimmed }}>
                                                    <span className="material-symbols-outlined !text-[13px]">podium</span>
                                                    {car.podiums}
                                                </span>
                                                <span className="font-bold flex items-center gap-1" title="Pole Positions" style={{ color: car.poles > 0 ? '#38bdf8' : C.dimmed }}>
                                                    <span className="material-symbols-outlined !text-[13px]">speed</span>
                                                    {car.poles}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
}
