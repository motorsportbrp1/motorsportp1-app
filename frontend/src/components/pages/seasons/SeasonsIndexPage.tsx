"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { getMediaUrl, getTeamLogoUrl } from "@/lib/utils";

// Era definitions
const ERAS = [
    { id: "all", label: "Todas as Eras", sublabel: "" },
    { id: "ground-effect", label: "Efeito Solo", sublabel: "(2022-Presente)" },
    { id: "hybrid", label: "Era Híbrida", sublabel: "(2014-2021)" },
    { id: "v8", label: "Era V8", sublabel: "(2006-2013)" },
    { id: "v10", label: "Era V10", sublabel: "(1996-2005)" },
    { id: "early", label: "Anos Iniciais", sublabel: "(1950-1995)" },
];

function getEraForYear(year: number) {
    if (year >= 2022) return "ground-effect";
    if (year >= 2014) return "hybrid";
    if (year >= 2006) return "v8";
    if (year >= 1996) return "v10";
    return "early";
}



// ── Season card images (local assets) ──
const SEASON_IMAGES: Record<number, string> = {
    2025: "/images/seasons/2025-season-norris.jpg",
    2024: "/images/seasons/2024-season-verstappen.jpg",
};

// ── Constructor visual config ──
function getConstructorColor(id: string) {
    const map: Record<string, string> = {
        "mercedes": "bg-teal-800 border-teal-700 text-white",
        "red_bull": "bg-blue-900 border-blue-800 text-yellow-400",
        "ferrari": "bg-red-600 border-red-500 text-white",
        "mclaren": "bg-orange-500 border-orange-400 text-black",
        "williams": "bg-blue-800 border-blue-700 text-white",
        "renault": "bg-yellow-400 border-yellow-300 text-black",
        "brawn": "bg-white border-gray-300 text-black",
        "benetton": "bg-green-600 border-green-500 text-white",
        "lotus": "bg-yellow-600 border-yellow-500 text-black",
        "tyrrell": "bg-blue-600 border-blue-500 text-white",
    };
    return map[id] || "bg-surface-lighter border-surface-lighter text-white";
}

function getConstructorAbbr(id: string, name: string) {
    const map: Record<string, string> = {
        "mercedes": "ME", "red_bull": "RB", "ferrari": "FE", "mclaren": "MC",
        "williams": "WI", "renault": "RE", "brawn": "BGP", "benetton": "BE",
        "lotus": "LO", "tyrrell": "TY", "brabham": "BR",
    };
    return map[id] || name.substring(0, 2).toUpperCase();
}

export default function SeasonsIndexPage() {
    const [activeEra, setActiveEra] = useState("all");
    const [seasonsData, setSeasonsData] = useState<any[]>([]);
    const [topDrivers, setTopDrivers] = useState<any[]>([]);
    const [topConstructors, setTopConstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSeasons() {
            try {
                // 1. Fetch seasons
                const { data: seasons, error: err1 } = await supabase.from('seasons').select('year').order('year', { ascending: false });
                if (err1) console.error("Error fetching seasons:", err1);

                // 2. Fetch driver champions
                const { data: dChamps } = await supabase.from('driver_standings')
                    .select('year, driverid, drivers(firstname, lastname)')
                    .eq('championshipwon', true);

                // 3. Fetch constructor champions
                const { data: cChamps } = await supabase.from('constructor_standings')
                    .select('year, constructorid, constructors(name)')
                    .eq('championshipwon', true);

                // 4. Fetch rounds count from races table
                const { data: racesData } = await supabase.from('races').select('year, round').order('year', { ascending: false });

                // 5. Fetch results to determine champion's team (constructor)
                // We get year + driverid + constructorid from the results table
                const { data: resultsBatch } = await supabase.from('results')
                    .select('year, driverid, constructorid')
                    .order('year', { ascending: false });

                // Build a map: year+driverid -> constructorid (the team they drove for that year)
                const driverTeamByYear: Record<string, string> = {};
                if (resultsBatch) {
                    resultsBatch.forEach((r: any) => {
                        const key = `${r.year}_${r.driverid}`;
                        if (!driverTeamByYear[key]) {
                            driverTeamByYear[key] = r.constructorid;
                        }
                    });
                }

                // Build constructor name lookup
                const constructorNameMap: Record<string, string> = {};

                // Fetch all constructors to guarantee team name mapping even if they didn't win Constructors' Champ
                const { data: allConstructors } = await supabase.from('constructors').select('*');
                if (allConstructors) {
                    allConstructors.forEach((c: any) => {
                        const id = c.constructorid || c.id;
                        if (id && c.name) {
                            constructorNameMap[id] = c.name;
                        }
                    });
                }

                // Rounds per year — count distinct rounds from races table
                const roundsPerYear: Record<number, number> = {};
                if (racesData) {
                    const seenRounds = new Set<string>();
                    racesData.forEach((r: any) => {
                        const key = `${r.year}_${r.round}`;
                        if (!seenRounds.has(key)) {
                            seenRounds.add(key);
                            roundsPerYear[r.year] = (roundsPerYear[r.year] || 0) + 1;
                        }
                    });
                }

                // Driver champion by year (deduplicated)
                const driverChampionByYear: Record<number, any> = {};
                const driverCounts: Record<string, { name: string, val: number, id: string }> = {};
                if (dChamps) {
                    dChamps.forEach((dc: any) => {
                        const id = dc.driverid;
                        if (!driverChampionByYear[dc.year]) {
                            driverChampionByYear[dc.year] = dc;
                            if (!driverCounts[id]) {
                                driverCounts[id] = {
                                    name: dc.drivers ? `${dc.drivers.firstname[0]}. ${dc.drivers.lastname}` : id,
                                    val: 0,
                                    id: id,
                                };
                            }
                            driverCounts[id].val += 1;
                        }
                    });
                }

                // Constructor champion by year (deduplicated)
                const constructorCounts: Record<string, { name: string, abbr: string, val: number, id: string }> = {};
                const constructorChampionByYear: Record<number, any> = {};
                if (cChamps) {
                    cChamps.forEach((cc: any) => {
                        const id = cc.constructorid;
                        if (!constructorChampionByYear[cc.year]) {
                            constructorChampionByYear[cc.year] = cc;
                            if (!constructorCounts[id]) {
                                constructorCounts[id] = {
                                    name: cc.constructors ? cc.constructors.name : id,
                                    abbr: getConstructorAbbr(id, cc.constructors ? cc.constructors.name : id),
                                    val: 0,
                                    id: id
                                };
                            }
                            constructorCounts[id].val += 1;
                        }
                    });
                }

                // Build final seasons data
                if (seasons) {
                    const finalData = seasons.map((s: any) => {
                        const y = s.year;
                        const dChamp = driverChampionByYear[y];
                        const cChamp = constructorChampionByYear[y];

                        // Resolve champion's team for this year
                        let championTeam = "N/A";
                        let championTeamId = "unknown";
                        if (dChamp) {
                            const teamKey = `${y}_${dChamp.driverid}`;
                            championTeamId = driverTeamByYear[teamKey] || "unknown";
                            championTeam = constructorNameMap[championTeamId] || championTeamId;
                        }

                        return {
                            year: y,
                            rounds: roundsPerYear[y] || 0,
                            champion: dChamp && dChamp.drivers ? `${dChamp.drivers.firstname} ${dChamp.drivers.lastname}` : "N/A",
                            championImage: dChamp ? getMediaUrl('drivers', dChamp.driverid, `2025.webp`) : "",
                            championTeam: championTeam,
                            championTeamId: championTeamId,
                            championTeamColor: getConstructorColor(championTeamId),
                            championAbbr: getConstructorAbbr(championTeamId, championTeam),
                            constructorsChampion: cChamp && cChamp.constructors ? cChamp.constructors.name : (y < 1958 ? "—" : "N/A"),
                            constructorsChampionId: cChamp ? cChamp.constructorid : "",
                            image: SEASON_IMAGES[y] || "",
                            era: getEraForYear(y)
                        };
                    });
                    setSeasonsData(finalData);

                    // Top drivers for sidebar
                    const topD = Object.values(driverCounts).sort((a, b) => b.val - a.val).slice(0, 5);
                    const maxD = topD.length > 0 ? topD[0].val : 7;
                    setTopDrivers(topD.map(d => ({ ...d, max: maxD, img: getMediaUrl('drivers', d.id, '2026.webp') })));

                    // Top constructors for sidebar
                    const topC = Object.values(constructorCounts).sort((a, b) => b.val - a.val).slice(0, 5);
                    const maxC = topC.length > 0 ? topC[0].val : 16;
                    setTopConstructors(topC.map(c => ({
                        ...c,
                        max: maxC,
                        logo: getTeamLogoUrl(c.id),
                        badgeColor: getConstructorColor(c.id),
                        barColor: "bg-white/30"
                    })));
                }
            } catch (error) {
                console.error("Unexpected error fetching seasons:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSeasons();
    }, []);

    const filteredSeasons = activeEra === "all"
        ? seasonsData
        : seasonsData.filter((s: any) => s.era === activeEra);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 lg:p-8 gap-8">

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-6">

                    {/* Header & Description */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                            Biblioteca de Temporadas
                        </h1>
                        <p className="text-white/60 max-w-2xl text-lg">
                            Explore o histórico completo da Fórmula 1. Acesse os resultados, a telemetria detalhada e a classificação corrida por corrida de campeonatos passados.
                        </p>
                    </div>

                    {/* Era Selector */}
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg uppercase tracking-wide">
                                Selecione a Era
                            </h3>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            {ERAS.map((era) => (
                                <button
                                    key={era.id}
                                    onClick={() => setActiveEra(era.id)}
                                    className={`snap-start shrink-0 px-5 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${activeEra === era.id
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-surface-dark border border-white/5 text-white/60 hover:text-white hover:border-primary/50"
                                        }`}
                                >
                                    {era.label}
                                    {era.sublabel && (
                                        <span className="opacity-50 text-xs ml-1">{era.sublabel}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Seasons Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-white/50">Carregando as temporadas históricas...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                            {filteredSeasons.map((season) => (
                                <Link
                                    key={season.year}
                                    href={`/seasons/${season.year}`}
                                    className="group relative bg-surface-dark rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 flex flex-col"
                                >
                                    {/* Badge Ano — dark glass effect */}
                                    <div className="absolute top-4 left-4 z-10 text-xs font-bold px-3 py-1.5 rounded-md shadow-lg backdrop-blur-md transition-colors" style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {season.year}
                                    </div>

                                    {/* Image area */}
                                    <div className="h-48 w-full relative bg-gradient-to-b from-slate-800 to-surface-dark overflow-hidden">
                                        {season.image ? (
                                            <img
                                                src={season.image}
                                                alt={`Temporada ${season.year}`}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                            />
                                        ) : (
                                            /* Fallback: team color gradient + year */
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541348263662-e068662d82af?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60')" }}></div>
                                                <span className="text-7xl font-bold text-white/10 tracking-tighter">{season.year}</span>
                                            </div>
                                        )}
                                        {/* Gradient overlay for text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent"></div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col gap-2">
                                                    {season.championImage && (
                                                        <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 shrink-0 bg-surface-darker shadow mt-1">
                                                            <img src={season.championImage} alt={season.champion} className="w-full h-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                                            <div className="hidden w-full h-full flex items-center justify-center text-white font-bold text-xl">{season.champion?.[0]}</div>
                                                        </div>
                                                    )}
                                                    <h3 className="text-xl font-bold text-white leading-none">{season.champion}</h3>
                                                </div>
                                                <span className="text-white/60 text-xs border border-white/10 rounded px-2 py-1 shrink-0">
                                                    {season.rounds} Corridas
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                {/* Team logo badge */}
                                                {season.championTeamId && season.championTeamId !== "unknown" ? (
                                                    <div className="size-6 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                                                        <img src={getTeamLogoUrl(season.championTeamId)} alt={season.championTeam} className="w-full h-full object-contain p-0.5 scale-[1.2]" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                                        <span className={`hidden size-6 rounded-full flex flex-col items-center justify-center text-[10px] font-bold border ${season.championTeamColor}`}>
                                                            {season.championAbbr}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${season.championTeamColor} shrink-0`}>
                                                        {season.championAbbr}
                                                    </span>
                                                )}
                                                <span className="text-sm text-white/60 font-medium">
                                                    {season.championTeam}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                                            <span className="text-xs text-white/40 uppercase tracking-widest leading-tight">Equipe<br />Campeã</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-white text-sm font-bold text-right">{season.constructorsChampion}</span>
                                                {season.constructorsChampionId && (
                                                    <div className="size-10 rounded-md overflow-hidden bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                                                        <img src={getTeamLogoUrl(season.constructorsChampionId)} alt="" className="w-full h-full object-contain p-1.5 drop-shadow-sm scale-[1.4]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                </div>

                {/* Right Column: Sidebar Stats */}
                <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6">

                    {/* Driver Titles Widget */}
                    <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-surface-darker/50">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">emoji_events</span>
                                Títulos de Pilotos
                            </h3>
                        </div>

                        <div className="p-4 flex flex-col gap-4">
                            {topDrivers.length > 0 ? topDrivers.map((driver, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 ${idx >= 2 ? 'grayscale' : ''}`}>
                                        <img src={driver.img} alt={driver.name} className="w-full h-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                        <div className="hidden w-10 h-10 rounded-full bg-surface-lighter border border-white/10 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                            {driver.name.split(' ').map((w: string) => w[0]).join('')}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white font-medium">{driver.name}</span>
                                            <span className={idx < 2 ? "text-primary font-bold" : "text-white/60 font-bold"}>
                                                {driver.val}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${idx < 2 ? 'bg-primary' : 'bg-white/30'} rounded-full`} style={{ width: `${(driver.val / driver.max) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-xs text-white/50">Carregando...</div>
                            )}
                        </div>
                    </div>

                    {/* Constructors Titles Widget */}
                    <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-surface-darker/50">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">engineering</span>
                                Títulos de Equipes
                            </h3>
                        </div>

                        <div className="p-4 flex flex-col gap-4">
                            {topConstructors.length > 0 ? topConstructors.map((team, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="size-8 rounded overflow-hidden bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                                        <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                        <div className={`hidden size-8 rounded flex items-center justify-center font-bold text-xs ${team.badgeColor}`}>
                                            {team.abbr}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white font-medium">{team.name}</span>
                                            <span className={idx === 0 ? "text-primary font-bold" : "text-white/60 font-bold"}>
                                                {team.val}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${idx === 0 ? 'bg-primary' : team.barColor} rounded-full`} style={{ width: `${(team.val / team.max) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-xs text-white/50">Carregando...</div>
                            )}
                        </div>
                    </div>

                </aside>

            </main>

            <Footer />
        </div>
    );
}
