"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReactECharts from 'echarts-for-react';
import { supabase } from "@/lib/supabase";
import { getCountryFlagUrl, getMediaUrl, getCarImageUrl, getTeamLogoUrl } from "@/lib/utils";

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



const DRIVER_COLORS: Record<string, string> = {
    "lewis-hamilton": "#ec131e",
    "charles-leclerc": "#ec131e",
    "max-verstappen": "#3671C6",
    "lando-norris": "#ff8000",
    "carlos-sainz": "#005AFF",
    "fernando-alonso": "#229971",
    "lance-stroll": "#229971",
    "pierre-gasly": "#0093cc",
    "franco-colapinto": "#0093cc",
    "andrea-kimi-antonelli": "#27F4D2",
    "alexander-albon": "#005AFF",
    "michael-schumacher": "#ec131e",
    "ayrton-senna": "#ffc906",
    "alain-prost": "#ec131e",
    "sebastian-vettel": "#3671C6",
    "niki-lauda": "#ec131e",
};

interface DriverProfilePageProps {
    id: string;
}

export default function DriverProfilePage({ id }: DriverProfilePageProps) {
    const [dbDriver, setDbDriver] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [victories, setVictories] = useState<any[]>([]);
    const [careerYears, setCareerYears] = useState<{ first: number | null; last: number | null }>({ first: null, last: null });
    const [trend, setTrend] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [h2h, setH2h] = useState<any>(null);
    const [insights, setInsights] = useState<any>(null);
    const [firstPole, setFirstPole] = useState<any>(null);
    const [firstPodium, setFirstPodium] = useState<any>(null);
    const [victoriesPage, setVictoriesPage] = useState(1);

    useEffect(() => {
        async function loadDriver() {
            setLoading(true);

            // Fetch driver info
            const { data } = await supabase.from('drivers').select('*').eq('id', id).single();
            if (data) {
                setDbDriver(data);
            }

            // Fetch race victories (position 1)
            const { data: winsData } = await supabase
                .from('results')
                .select('raceid, year, round, constructorid, gridpositionnumber')
                .eq('driverid', id)
                .eq('positionnumber', 1)
                .order('year', { ascending: false });

            if (winsData && winsData.length > 0) {
                // Fetch race details for each win
                const raceIds = winsData.map(w => w.raceid);

                // Fetch races in chunks to avoid URL length issues or fetch all if small enough
                // 100-200 races is usually fine for a Supabase .in() filter
                const { data: racesData } = await supabase
                    .from('races')
                    .select('id, officialname, circuitid, year, circuits(countryid)')
                    .in('id', raceIds);

                const raceMap: Record<string, any> = {};
                (racesData || []).forEach(r => { raceMap[r.id] = r; });

                const { data: constructorsData } = await supabase.from('constructors').select('id, name');
                const constructorMap: Record<string, string> = {};
                (constructorsData || []).forEach(c => constructorMap[c.id] = c.name);

                const enrichedVictories = winsData.map(w => {
                    const race = raceMap[w.raceid];
                    const rawCountry = race?.circuits?.countryid;

                    return {
                        year: w.year,
                        gp: race?.officialname || race?.name || w.raceid,
                        circuit: race?.circuitid || "Unknown",
                        country: rawCountry || "Unknown",
                        flagUrl: getCountryFlagUrl(rawCountry),
                        constructor: constructorMap[w.constructorid] || w.constructorid || "Unknown",
                        constructorLogo: getTeamLogoUrl(w.constructorid),
                        carImage: getCarImageUrl(w.constructorid, w.year),
                        constructorColor: "#94a3b8",
                        grid: w.gridpositionnumber || "N/A"
                    };
                });
                setVictories(enrichedVictories);
            }

            // Fetch first/last year
            const { data: firstYearData } = await supabase
                .from('results')
                .select('year')
                .eq('driverid', id)
                .order('year', { ascending: true })
                .limit(1);

            const { data: lastYearData } = await supabase
                .from('results')
                .select('year')
                .eq('driverid', id)
                .order('year', { ascending: false })
                .limit(1);

            setCareerYears({
                first: firstYearData?.[0]?.year || null,
                last: lastYearData?.[0]?.year || null
            });

            // Fetch First Pole Position
            const { data: firstPoleData } = await supabase
                .from('results')
                .select('year, gap, constructorid, gridpositionnumber, raceid, races(officialname, name)')
                .eq('driverid', id)
                .eq('gridpositionnumber', 1)
                .order('year', { ascending: true })
                .order('round', { ascending: true })
                .limit(1);

            if (firstPoleData && firstPoleData.length > 0) {
                setFirstPole(firstPoleData[0]);
            } else {
                setFirstPole(null);
            }

            // Fetch First Podium (Top 3 finish)
            const { data: firstPodiumData } = await supabase
                .from('results')
                .select('year, positionnumber, constructorid, raceid, races(officialname, name)')
                .eq('driverid', id)
                .lte('positionnumber', 3)
                .order('year', { ascending: true })
                .order('round', { ascending: true })
                .limit(1);

            if (firstPodiumData && firstPodiumData.length > 0) {
                setFirstPodium(firstPodiumData[0]);
            } else {
                setFirstPodium(null);
            }

            // Fetch views
            const [
                { data: trendData },
                { data: timelineData },
                { data: h2hData },
                { data: insightsData }
            ] = await Promise.all([
                supabase.from('vw_driver_championship_trend').select('*').eq('driverid', id).order('year', { ascending: true }),
                supabase.from('vw_driver_career_timeline').select('*').eq('driverid', id).order('year', { ascending: false }),
                supabase.from('vw_driver_teammate_h2h').select('*').eq('driver_id', id),
                supabase.from('vw_driver_insights').select('*').eq('driverid', id).single()
            ]);

            setTrend(trendData || []);
            setTimeline(timelineData || []);

            if (h2hData && h2hData.length > 0) {
                // Aggregate across all teammates
                const agg = h2hData.reduce((acc, curr) => ({
                    races_together: acc.races_together + curr.races_together,
                    driver_higher_finish: acc.driver_higher_finish + curr.driver_higher_finish,
                    driver_higher_grid: acc.driver_higher_grid + curr.driver_higher_grid,
                    driver_points: acc.driver_points + curr.driver_points,
                    teammate_points: acc.teammate_points + curr.teammate_points,
                }), { races_together: 0, driver_higher_finish: 0, driver_higher_grid: 0, driver_points: 0, teammate_points: 0 });
                setH2h(agg);
            } else {
                setH2h(null);
            }

            setInsights(insightsData || null);

            setLoading(false);
        }
        loadDriver();
    }, [id]);

    if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading Driver...</div>;
    if (!dbDriver) return <div className="min-h-screen text-white flex items-center justify-center">Driver Not Found in Database</div>;

    const driverColor = DRIVER_COLORS[dbDriver.id] || "#1e40af";
    const driverImage = getMediaUrl('drivers', dbDriver.id, '2025.webp');
    const isActive = careerYears.last && careerYears.last >= 2025;
    const activeYearsLabel = careerYears.first
        ? (isActive ? `${careerYears.first} — Present` : `${careerYears.first} — ${careerYears.last}`)
        : "Historic";

    const driver = {
        id: dbDriver.id,
        firstName: dbDriver.firstname || "",
        lastName: dbDriver.lastname || "",
        activeYears: activeYearsLabel,
        championships: dbDriver.totalchampionshipwins || 0,
        wins: dbDriver.totalracewins || 0,
        poles: dbDriver.totalpolepositions || 0,
        podiums: dbDriver.totalpodiums || 0,
        nationality: dbDriver.nationalitycountryid || "N/A",
        image: driverImage,
        color: driverColor,
        number: dbDriver.permanentnumber || "",
        radar: [85, 80, 75, 90, 95, 80],
        h2h: h2h,
        timeline: timeline,
        trend: trend,
        insights: insights,
        victories: victories
    };


    const RADAR_CHART_OPTIONS = {
        backgroundColor: 'transparent',
        radar: {
            indicator: [
                { name: 'QUALIFYING', max: 100 },
                { name: 'RACE CRAFT', max: 100 },
                { name: 'WET WEATHER', max: 100 },
                { name: 'CONSISTENCY', max: 100 },
                { name: 'EXPERIENCE', max: 100 },
                { name: 'TYRE MGMT', max: 100 }
            ],
            shape: 'polygon',
            splitNumber: 4,
            axisName: { color: C.dimmed, fontSize: 10, fontWeight: 'bold' },
            splitLine: { lineStyle: { color: C.border } },
            splitArea: { show: false },
            axisLine: { lineStyle: { color: C.border } }
        },
        series: [
            {
                type: 'radar',
                data: [
                    {
                        value: driver.radar,
                        name: 'Attributes',
                        itemStyle: { color: driver.color },
                        areaStyle: { color: hexToRgba(driver.color, 0.2) },
                        lineStyle: { color: driver.color, width: 2 }
                    }
                ]
            }
        ]
    };

    const h2hTotal = driver.h2h ? driver.h2h.races_together : 0;
    const h2hTotalPts = driver.h2h ? (driver.h2h.driver_points + driver.h2h.teammate_points) : 0;
    const h2hWinsPerc = h2hTotal > 0 ? Math.round((driver.h2h.driver_higher_finish / h2hTotal) * 100) : 50;
    const h2hQualiPerc = h2hTotal > 0 ? Math.round((driver.h2h.driver_higher_grid / h2hTotal) * 100) : 50;
    const h2hPointsPerc = h2hTotalPts > 0 ? Math.round((driver.h2h.driver_points / h2hTotalPts) * 100) : 50;

    // Build Qualitative Milestones
    const milestones: any[] = [];
    if (careerYears.first) {
        const debutTeam = timeline.find(t => t.year === careerYears.first)?.constructor_name || "Formula 1";
        milestones.push({
            year: careerYears.first,
            type: "DEBUT",
            title: "Formula 1 Debut",
            desc: `Made debut driving for ${debutTeam}`,
            icon: "sports_motorsports",
            color: C.dimmed,
            border: C.border
        });
    }

    const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);
    let currentTeam = null;
    for (const t of sortedTimeline) {
        if (currentTeam !== t.constructorid && t.year > (careerYears.first || 0)) {
            milestones.push({
                year: t.year,
                type: "TEAM_JOIN",
                title: `Joined ${t.constructor_name}`,
                desc: `Signed with ${t.constructor_name} for the ${t.year} season.`,
                icon: "handshake",
                color: "#fff",
                border: C.border
            });
            currentTeam = t.constructorid;
        } else if (!currentTeam) {
            currentTeam = t.constructorid;
        }
    }

    if (victories && victories.length > 0) {
        const sortedWins = [...victories].sort((a, b) => a.year - b.year);
        const firstWin = sortedWins[0];
        milestones.push({
            year: firstWin.year,
            type: "FIRST_WIN",
            title: "First Grand Prix Win",
            desc: `Won the ${firstWin.year} ${firstWin.gp} for ${firstWin.constructor}.`,
            icon: "workspace_premium",
            color: "#fbbf24",
            border: "#fbbf24"
        });
    }

    if (firstPole) {
        milestones.push({
            year: firstPole.year,
            type: "FIRST_POLE",
            title: "First Pole Position",
            desc: `Qualified P1 at the ${firstPole.year} ${firstPole.races?.name || firstPole.races?.officialname || 'Grand Prix'}.`,
            icon: "timer",
            color: "#38bdf8",
            border: "#38bdf8"
        });
    }

    if (firstPodium) {
        milestones.push({
            year: firstPodium.year,
            type: "FIRST_PODIUM",
            title: "First Podium Finish",
            desc: `Finished P${firstPodium.positionnumber} at the ${firstPodium.year} ${firstPodium.races?.name || firstPodium.races?.officialname || 'Grand Prix'}.`,
            icon: "emoji_events",
            color: "#a78bfa",
            border: "#a78bfa"
        });
    }

    const champYears = trend.filter((t: any) => t.position === 1);
    for (const champ of champYears) {
        const team = timeline.find(t => t.year === champ.year)?.constructor_name || "Formula 1";
        milestones.push({
            year: champ.year,
            type: "CHAMPIONSHIP",
            title: "World Champion",
            desc: `Won the ${champ.year} Formula 1 World Championship with ${team}.`,
            icon: "workspace_premium",
            color: driverColor,
            border: driverColor
        });
    }

    if (careerYears.last && careerYears.last < 2025 && careerYears.last !== careerYears.first) {
        const lastTeam = timeline.find(t => t.year === careerYears.last)?.constructor_name || "Formula 1";
        milestones.push({
            year: careerYears.last,
            type: "RETIREMENT",
            title: "Final Season",
            desc: `Concluded F1 career driving for ${lastTeam}.`,
            icon: "flag",
            color: C.dimmed,
            border: C.border
        });
    }

    // Process milestones: sort by year, assign order within same year (Debut -> Team Join -> Podium -> Pole -> Win -> Championship -> Retirement)
    const typeOrder: Record<string, number> = { "DEBUT": 1, "TEAM_JOIN": 2, "FIRST_PODIUM": 3, "FIRST_POLE": 4, "FIRST_WIN": 5, "CHAMPIONSHIP": 6, "RETIREMENT": 7 };
    milestones.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year; // Descending year like the old timeline
        return typeOrder[b.type] - typeOrder[a.type]; // Reverse order within same year so it reads correctly top to bottom
    });

    const driverWithMilestones = { ...driver, milestones };

    return (
        <div className="flex flex-col min-h-screen text-slate-100" style={{ background: C.bg }}>
            <Header />

            <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">

                {/* ── Breadcrumb & Top Bar ── */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                        <Link href="/drivers" className="hover:text-white transition-colors" style={{ color: C.primary }}>
                            Drivers
                        </Link>
                        <span style={{ color: C.faint }}>/</span>
                        <span style={{ color: C.dimmed }}>{driver.id}</span>
                    </div>
                </div>

                {/* ── Hero Section ── */}
                <section className="relative rounded-2xl overflow-hidden shadow-2xl card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    {/* Background Texture dynamically colored */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${driver.color} 1.5px, transparent 1px)`, backgroundSize: "24px 24px" }}></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between p-6 lg:p-10 gap-8">
                        {/* Driver Info */}
                        <div className="flex flex-col gap-6 w-full lg:w-auto">
                            <div className="flex items-start gap-6">
                                <div className="relative group">
                                    {driver.image ? (
                                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 overflow-hidden shadow-2xl transition-transform group-hover:scale-105 bg-zinc-900" style={{ borderColor: hexToRgba(driver.color, 0.4) }}>
                                            <img src={driver.image} alt={driver.lastName} className="w-full h-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                            <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold hidden">
                                                {driver.firstName ? driver.firstName[0] : ""}
                                                {driver.lastName ? driver.lastName[0] : ""}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 overflow-hidden shadow-2xl transition-transform group-hover:scale-105 flex items-center justify-center text-white text-5xl font-bold bg-zinc-900" style={{ borderColor: hexToRgba(driver.color, 0.4) }}>
                                            {driver.firstName ? driver.firstName[0] : ""}
                                            {driver.lastName ? driver.lastName[0] : ""}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 rounded-full border-4 shadow-lg overflow-hidden flex items-center justify-center" style={{ borderColor: C.bg, width: 36, height: 36, background: driver.color }}>
                                        {driver.nationality !== "N/A" ? (
                                            <img src={getCountryFlagUrl(driver.nationality)} alt={driver.nationality} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white text-[10px] font-bold">{driver.nationality}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col pt-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-md border tracking-widest uppercase" style={{ background: hexToRgba(driver.color, 0.15), color: driver.color, borderColor: hexToRgba(driver.color, 0.3) }}>Legend</span>
                                        <span className="text-sm font-medium tracking-wider" style={{ color: C.muted }}>{driver.activeYears}</span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tighter uppercase leading-none mt-2">
                                        {driver.firstName}<br /><span style={{ color: driver.color }}>{driver.lastName}</span>
                                    </h1>
                                    <div className="flex items-center gap-2 mt-4" style={{ color: C.muted }}>
                                        <span className="material-symbols-outlined text-base" style={{ color: driver.color }}>trophy</span>
                                        <span className="text-sm font-bold tracking-wide">{driver.championships}x World Champion</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Primary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto mt-6 lg:mt-0">
                            <StatBlock label="Titles" value={driver.championships} color={driver.color} />
                            <StatBlock label="Wins" value={driver.wins} color={driver.color} />
                            <StatBlock label="Poles" value={driver.poles} color={driver.color} />
                            <StatBlock label="Podiums" value={driver.podiums} color={driver.color} />
                        </div>
                    </div>
                </section>

                {/* ── Middle Section: Timeline & Analysis ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column: Career Timeline */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="rounded-2xl p-6 shadow-xl flex flex-col flex-1 card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined" style={{ color: driver.color }}>history</span>
                                    Career Timeline
                                </h3>
                            </div>

                            <div className="relative flex-1 px-2 overflow-y-auto max-h-[450px] custom-scrollbar pr-4">
                                {/* Connecting Line */}
                                <div className="absolute left-[23px] top-4 bottom-4 w-0.5" style={{ background: C.border }}></div>

                                {driverWithMilestones.milestones.map((item: any, idx) => {
                                    const isHighlight = item.type === 'CHAMPIONSHIP' || item.type === 'FIRST_WIN';
                                    return (
                                        <div key={idx} className="relative flex items-start gap-5 pb-8 group">
                                            {isHighlight ? (
                                                <div className="z-10 flex items-center justify-center w-12 h-12 rounded-xl shrink-0 shadow-lg" style={{ background: hexToRgba(item.color, 0.15), border: `1px solid ${item.color}`, color: item.color, boxShadow: `0 0 15px ${hexToRgba(item.color, 0.3)}` }}>
                                                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                                </div>
                                            ) : (
                                                <div className="z-10 flex items-center justify-center w-12 h-12 rounded-xl transition-colors shrink-0" style={{ background: C.bg, border: `1px solid ${item.border}` }}>
                                                    <span className="material-symbols-outlined text-xl transition-colors" style={{ color: item.color }}>{item.icon}</span>
                                                </div>
                                            )}
                                            <div className="flex-1 pt-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-lg leading-tight" style={{ color: isHighlight ? item.color : "#fff" }}>{item.title}</h4>
                                                        <p className="text-sm mt-0.5 leading-snug" style={{ color: C.dimmed }}>{item.desc}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                                                        <span className="text-xs font-mono font-bold px-2 py-1 rounded" style={{ background: C.border, color: C.muted }}>
                                                            {item.year}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Performance Radar & Teammate Battle & Insights */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

                            {/* Radar Chart Card */}
                            <div className="rounded-2xl p-6 flex flex-col shadow-xl card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined" style={{ color: driver.color }}>radar</span>
                                    Driver Attributes
                                </h3>
                                <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
                                    <ReactECharts option={RADAR_CHART_OPTIONS} style={{ height: '100%', width: '100%', position: 'absolute' }} />
                                </div>
                            </div>

                            {/* Teammate Comparison */}
                            <div className="rounded-2xl p-6 flex flex-col shadow-xl card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined" style={{ color: driver.color }}>compare_arrows</span>
                                    Vs. Teammate
                                </h3>
                                <div className="flex-1 flex flex-col justify-center gap-8">
                                    <ProgressBarMetric label="Qualifying H2H" driverVal={h2hQualiPerc} teammateVal={100 - h2hQualiPerc} color={driver.color} driverName={driver.lastName} />
                                    <ProgressBarMetric label="Race Finish H2H" driverVal={h2hWinsPerc} teammateVal={100 - h2hWinsPerc} color={driver.color} driverName={driver.lastName} />
                                    <ProgressBarMetric label="Total Points H2H" driverVal={h2hPointsPerc} teammateVal={100 - h2hPointsPerc} color={driver.color} driverName={driver.lastName} />
                                </div>
                                <p className="text-[11px] mt-6 text-center italic" style={{ color: C.dimmed }}>* Aggregated career statistics against all teammates.</p>
                            </div>
                        </div>

                        {/* Insights Block */}
                        <div className="rounded-2xl overflow-hidden shadow-xl flex flex-col flex-1 card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <div className="p-6 relative z-10" style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined" style={{ color: driver.color }}>lightbulb</span>
                                    Career Insights
                                </h3>
                                <p className="text-xs mt-1 font-medium" style={{ color: C.dimmed }}>Wikipedia-style statistical milestones</p>
                            </div>
                            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InsightItem icon="social_leaderboard" label="Total Laps Raced" value={driver.insights?.total_laps_raced?.toLocaleString() || "0"} color={driver.color} />
                                <InsightItem icon="build" label="Teams Driven For" value={driver.insights?.total_teams_driven_for || "0"} color={driver.color} />
                                <InsightItem icon="timer" label="Fastest Laps" value={driver.insights?.total_fastest_laps || "0"} color={driver.color} />
                                <InsightItem icon="star" label="Driver of the Day" value={driver.insights?.total_driver_of_the_day || "0"} color={driver.color} />
                                <InsightItem icon="warning" label="Total DNFs" value={driver.insights?.total_dnfs || "0"} color={driver.color} />
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── Bottom Section: Detailed Wins & Map ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">

                    {/* Data Table */}
                    <div className="lg:col-span-12 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[500px]" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                        <div className="p-6 flex justify-between items-center sticky top-0 z-20" style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ color: driver.color }}>flag</span>
                                Grand Prix Victories
                                <span className="ml-2 text-sm px-2 py-0.5 rounded-full bg-white/10 font-mono text-white/70">{driver.victories.length}</span>
                            </h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setVictoriesPage(p => Math.max(1, p - 1))}
                                    disabled={victoriesPage === 1}
                                    className="p-1 rounded-md transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <span className="material-symbols-outlined text-white">chevron_left</span>
                                </button>
                                <span className="text-xs font-bold text-white/70 tracking-widest uppercase">
                                    Page {victoriesPage} of {Math.max(1, Math.ceil(driver.victories.length / 10))}
                                </span>
                                <button
                                    onClick={() => setVictoriesPage(p => Math.min(Math.ceil(driver.victories.length / 10), p + 1))}
                                    disabled={victoriesPage >= Math.ceil(driver.victories.length / 10)}
                                    className="p-1 rounded-md transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <span className="material-symbols-outlined text-white">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs font-bold uppercase sticky top-0 z-10 tracking-wider" style={{ background: "rgba(34, 16, 17, 0.9)", backdropFilter: "blur(4px)", color: C.muted }}>
                                    <tr>
                                        <th className="px-6 py-4" scope="col">Year</th>
                                        <th className="px-6 py-4" scope="col">Grand Prix</th>
                                        <th className="px-6 py-4" scope="col">Car</th>
                                        <th className="px-6 py-4" scope="col">Constructor</th>
                                        <th className="px-6 py-4" scope="col">Circuit</th>
                                        <th className="px-6 py-4 text-center" scope="col">Grid Start</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: C.border }}>
                                    {driver.victories.slice((victoriesPage - 1) * 10, victoriesPage * 10).map((v, i) => (
                                        <tr key={i} className="transition-colors hover:bg-white/5 cursor-pointer group">
                                            <td className="px-6 py-5 font-mono font-medium" style={{ color: C.dimmed }}>{v.year}</td>
                                            <td className="px-6 py-5 font-bold text-white text-base group-hover:text-white transition-colors">{v.gp}</td>
                                            <td className="px-6 py-2">
                                                <div className="w-[120px] aspect-video relative flex items-center justify-center">
                                                    <img src={v.carImage} alt={`Car ${v.year}`} className="object-contain w-full h-full drop-shadow-2xl transition-transform group-hover:scale-110" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                                                        <img src={v.constructorLogo} alt={v.constructor} className="object-contain w-full h-full scale-[1.0]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                    </div>
                                                    <span className="font-bold text-sm tracking-wide">{v.constructor}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-medium" style={{ color: C.muted }}>
                                                <div className="flex items-center gap-2">
                                                    <img src={v.flagUrl} alt={v.country} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                                                    {v.circuit}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center font-mono font-bold text-white">
                                                <span className="bg-white/10 px-3 py-1.5 rounded-md border border-white/5 shadow-inner">P{v.grid}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}

// ── Components ──

function StatBlock({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className="p-5 rounded-2xl flex flex-col items-center justify-center min-w-[120px] transition-all cursor-default group hover:-translate-y-1" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
            <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.muted }}>{label}</span>
            <span className="text-4xl font-black text-white transition-colors" style={{ textShadow: `0 0 20px transparent` }} onMouseEnter={(e) => { e.currentTarget.style.color = color; e.currentTarget.style.textShadow = `0 0 15px ${hexToRgba(color, 0.5)}`; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textShadow = 'none'; }}>
                {value}
            </span>
        </div>
    );
}

// Global helper for nested components
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

function ProgressBarMetric({ label, driverVal, teammateVal, color, driverName }: { label: string, driverVal: number, teammateVal: number, color: string, driverName: string }) {
    return (
        <div>
            <div className="flex justify-between mb-3 text-sm font-bold uppercase tracking-wider">
                <span style={{ color: color }}>{driverName}</span>
                <span style={{ color: C.dimmed }}>{label}</span>
                <span style={{ color: C.muted }}>Teammate</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xl font-black w-10 text-right text-white">{driverVal}%</span>
                <div className="flex-1 h-3 rounded-full overflow-hidden flex" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                    <div className="h-full rounded-r-[4px]" style={{ background: color, width: `${driverVal}%`, boxShadow: `0 0 10px ${color}` }}></div>
                </div>
                <span className="text-xl font-black w-10 text-white">{teammateVal}%</span>
            </div>
        </div>
    );
}

function MapPin({ top, left, location, desc, isRecord, color }: { top: string, left: string, location: string, desc: string, isRecord: boolean, color: string }) {
    return (
        <div className="absolute group cursor-pointer" style={{ top, left }}>
            <div className={`rounded-full ${isRecord ? 'w-3.5 h-3.5 animate-pulse' : 'w-2.5 h-2.5 opacity-50 bg-white'}`} style={{ background: isRecord ? color : "white", boxShadow: isRecord ? `0 0 15px ${color}` : "none" }}></div>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-2xl whitespace-nowrap hidden group-hover:block z-20" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-white text-sm font-bold mb-0.5">{location}</p>
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: color }}>{desc}</p>
            </div>
        </div>
    );
}

function InsightItem({ icon, label, value, color }: { icon: string, label: string, value: string | number, color: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: hexToRgba(color, 0.1), border: `1px solid ${hexToRgba(color, 0.3)}`, color: color }}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.dimmed }}>{label}</p>
                <p className="text-lg font-black text-white">{value}</p>
            </div>
        </div>
    );
}
