"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { handleImageFallback, getCountryFlagUrl, getTeamLogoUrl } from "@/lib/utils";

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

interface Constructor {
    id: string;
    name: string;
    fullName: string;
    base: string;
    teamChief: string;
    championships: number;
    active: boolean;
    color: string;
    logo?: string;
    firstEntry: number;
    racesEntered: number;
    wins: number;
    poles: number;
    nationality: string;
    flag: string;
    seasons: string;
    podiums: number;
}

// Active Teams Config
const ACTIVE_TEAMS = ["ferrari", "mercedes", "red_bull", "mclaren", "aston_martin", "williams", "rb", "haas", "sauber", "alpine"];

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

export default function TeamsIndexPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All Status");
    const [teams, setTeams] = useState<Constructor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeams() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('constructors')
                    .select('*')
                    .order('totalchampionshipwins', { ascending: false, nullsFirst: false });

                if (error) throw error;

                if (data) {
                    // Fetch race years to map back to results
                    const { data: racesData } = await supabase
                        .from('races')
                        .select('raceid, year');

                    const { data: resultsData } = await supabase
                        .from('results')
                        .select('constructorid, raceid');

                    const raceYearMap: Record<number, number> = {};
                    if (racesData) {
                        racesData.forEach((r: any) => {
                            if (r.raceid && r.year) {
                                raceYearMap[r.raceid] = r.year;
                            }
                        });
                    }

                    // Build lookup maps: constructorId -> first/last year
                    const firstYearMap: Record<string, number> = {};
                    const lastYearMap: Record<string, number> = {};

                    if (resultsData) {
                        resultsData.forEach((r: any) => {
                            const year = raceYearMap[r.raceid];
                            if (year) {
                                if (!firstYearMap[r.constructorid] || year < firstYearMap[r.constructorid]) {
                                    firstYearMap[r.constructorid] = year;
                                }
                                if (!lastYearMap[r.constructorid] || year > lastYearMap[r.constructorid]) {
                                    lastYearMap[r.constructorid] = year;
                                }
                            }
                        });
                    }

                    const mappedTeams = data.map((t: any) => {
                        const visual = TEAM_VISUALS[t.id] || { color: "#e2e8f0", logoUrl: "" };
                        const first = firstYearMap[t.id] || 0;
                        const last = lastYearMap[t.id] || 0;
                        const isActive = ACTIVE_TEAMS.includes(t.id);
                        const seasonsStr = first > 0 ? `${first} — ${isActive ? 'Present' : last}` : '—';
                        return {
                            id: t.id,
                            name: t.name,
                            fullName: t.fullname || t.name,
                            base: t.countryid || "Unknown",
                            teamChief: "N/A",
                            championships: t.totalchampionshipwins || 0,
                            active: isActive,
                            color: visual.color,
                            logo: getTeamLogoUrl(t.id),
                            firstEntry: first,
                            racesEntered: t.totalraceentries || 0,
                            wins: t.totalracewins || 0,
                            poles: t.totalpolepositions || 0,
                            nationality: t.countryid || "Unknown",
                            flag: getCountryFlagUrl(t.countryid),
                            seasons: seasonsStr,
                            podiums: t.totalpodiums || 0
                        };
                    });
                    setTeams(mappedTeams.filter(t => t.racesEntered > 0));
                }
            } catch (err) {
                console.error("Failed to load constructors:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTeams();
    }, []);

    // Filtering Logic
    const filteredTeams = teams.filter(team => {
        const matchesQuery = team.name.toLowerCase().includes(searchQuery.toLowerCase()) || team.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "All Status" || (filterStatus === "Active" && team.active) || (filterStatus === "Defunct" && !team.active);
        return matchesQuery && matchesStatus;
    });

    return (
        <>
            <Header />

            <main className="flex-grow flex flex-col p-6 mx-auto w-full gap-6" style={{ maxWidth: 1400, minHeight: "80vh" }}>

                {/* ── Header Section ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                            <span className="material-symbols-outlined text-4xl" style={{ color: C.primary }}>engineering</span>
                            Constructors Archive
                        </h1>
                        <p className="text-sm max-w-xl" style={{ color: C.muted }}>
                            Historical database of all Formula 1 Constructors, tracing engineering dominance, dynasties, and legendary team line-ups from 1950 to present.
                        </p>
                    </div>
                </div>

                {/* ── Hall of Fame Carousel / Top Teams ── */}
                <div className="w-full rounded-2xl p-5 overflow-hidden relative shadow-lg card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-500">workspace_premium</span>
                            Most Successful Constructors
                        </h3>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                        {teams.sort((a, b) => b.championships - a.championships).slice(0, 5).map(team => (
                            <Link href={`/teams/${team.id}`} key={team.id} className="min-w-[280px] md:min-w-[320px] rounded-xl p-5 flex flex-col gap-4 snap-start group transition-all" style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center text-xl font-bold overflow-hidden shadow-lg shrink-0" style={{ borderColor: team.color, color: team.color }}>
                                            {/* TODO: AJUSTE DE ENQUADRAMENTO DO LOGO AQUI (ex: mexer no padding p-1, object-contain, ou scale) */}
                                            <img src={getTeamLogoUrl(team.id)} alt={team.name} className="w-full h-full object-cover" style={{borderRadius: '50%'}} onError={handleImageFallback} />
                                            <span className="hidden">{team.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white leading-none">{team.name}</h4>
                                            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: C.dimmed }}>{team.base}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 font-bold text-lg" style={{ color: "var(--primary)" }}>
                                        <span className="material-symbols-outlined text-base">emoji_events</span>
                                        {team.championships}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="rounded-lg p-2 text-center" style={{ background: C.surface }}>
                                        <span className="block text-[10px] uppercase font-bold tracking-wider" style={{ color: C.muted }}>Wins</span>
                                        <span className="text-lg font-bold text-white">{team.wins}</span>
                                    </div>
                                    <div className="rounded-lg p-2 text-center" style={{ background: C.surface }}>
                                        <span className="block text-[10px] uppercase font-bold tracking-wider" style={{ color: C.muted }}>Poles</span>
                                        <span className="text-lg font-bold text-white">{team.poles}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Filter & Search Toolbar ── */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center p-4 rounded-xl sticky top-0 z-20 shadow-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full md:w-80">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px]" style={{ color: C.dimmed }}>search</span>
                            <input
                                className="w-full rounded-lg pl-10 pr-4 py-2 focus:outline-none transition-colors text-sm text-white"
                                placeholder="Search Teams..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ background: C.bg, border: `1px solid ${C.border}` }}
                            />
                        </div>
                        <div className="h-8 w-px hidden md:block" style={{ background: C.border }}></div>
                        <div className="hidden md:flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
                            {["All Status", "Active", "Defunct"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                                    style={{
                                        background: filterStatus === status ? C.primary : "transparent",
                                        color: filterStatus === status ? "#fff" : C.muted
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-full lg:w-auto text-sm font-bold flex gap-2 items-center justify-end" style={{ color: C.dimmed }}>
                        Showing {filteredTeams.length} Constructors
                    </div>
                </div>

                {/* ── Advanced Data Table ── */}
                <div className="flex-1 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="text-xs uppercase font-bold tracking-wide sticky top-0 z-10" style={{ background: "rgba(46,48,54,0.5)", backdropFilter: "blur(4px)", color: C.muted }}>
                                <tr>
                                    <th className="px-5 py-4 w-12 text-center" style={{ borderBottom: `1px solid ${C.border}` }}>#</th>
                                    <th className="px-5 py-4 cursor-pointer hover:text-white transition-colors group" style={{ borderBottom: `1px solid ${C.border}` }}>
                                        Constructor <span className="material-symbols-outlined text-[14px] align-middle ml-1 opacity-0 group-hover:opacity-100 transition-opacity">arrow_downward</span>
                                    </th>
                                    <th className="px-5 py-4 cursor-pointer hover:text-white transition-colors group" style={{ borderBottom: `1px solid ${C.border}` }}>Nationality</th>
                                    <th className="px-5 py-4 cursor-pointer hover:text-white transition-colors group" style={{ borderBottom: `1px solid ${C.border}` }}>Seasons</th>
                                    <th className="px-5 py-4 cursor-pointer hover:text-white transition-colors group text-right" style={{ borderBottom: `1px solid ${C.border}` }}>WCC</th>
                                    <th className="px-5 py-4 cursor-pointer hover:text-white transition-colors group text-right" style={{ borderBottom: `1px solid ${C.border}` }}>Entries</th>
                                    <th className="px-5 py-4 cursor-pointer hover:text-white transition-colors group text-right" style={{ borderBottom: `1px solid ${C.border}` }}>Wins</th>
                                    <th className="px-5 py-4 cursor-pointer hover:text-white transition-colors group text-right" style={{ borderBottom: `1px solid ${C.border}` }}>Podiums</th>
                                    <th className="px-5 py-4 text-center" style={{ borderBottom: `1px solid ${C.border}` }}>Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y" style={{ borderColor: C.border }}>
                                {filteredTeams.map((team, idx) => {
                                    const winPercentage = Math.min((team.wins / 250) * 100, 100); // 250 as baseline max wins to scale the bar
                                    return (
                                        <tr key={team.id} className="transition-colors group hover:bg-white/5 cursor-pointer text-white">
                                            <td className="px-5 py-4 text-center font-bold" style={{ color: C.dimmed }}>{idx + 1}</td>
                                            <td className="px-5 py-4">
                                                <Link href={`/teams/${team.id}`} className="flex items-center gap-3">
                                                    <div className="w-2 h-8 rounded-full shadow-lg transition-transform group-hover:scale-y-110" style={{ background: team.color, boxShadow: `0 0 10px ${team.color}40` }}></div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-base group-hover:text-red-500 transition-colors">{team.name}</span>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: C.dimmed }}>Since {team.firstEntry}</span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4 font-medium" style={{ color: C.muted }}>
                                                <div className="flex items-center gap-2">
                                                    <img src={team.flag} alt={team.nationality} className="h-4 w-auto rounded-sm" />
                                                    <span className="capitalize">{team.nationality}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs tracking-wider" style={{ color: C.muted }}>{team.seasons}</td>
                                            <td className="px-5 py-4 text-right font-bold text-yellow-500 text-lg">{team.championships > 0 ? team.championships : "-"}</td>
                                            <td className="px-5 py-4 text-right font-mono" style={{ color: C.muted }}>{team.racesEntered}</td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-mono font-bold">{team.wins}</span>
                                                    {team.wins > 0 && (
                                                        <div className="w-16 h-1 rounded-full mt-1 overflow-hidden" style={{ background: C.border }}>
                                                            <div className="h-full" style={{ width: `${winPercentage}%`, background: team.color }}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right font-mono" style={{ color: C.muted }}>{team.podiums}</td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider" style={{
                                                    background: team.active ? "rgba(34, 197, 94, 0.1)" : "rgba(100, 116, 139, 0.1)",
                                                    color: team.active ? "#22c55e" : C.dimmed,
                                                    border: `1px solid ${team.active ? "rgba(34, 197, 94, 0.2)" : C.border}`
                                                }}>
                                                    {team.active ? "Active" : "Defunct"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredTeams.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm font-medium" style={{ color: C.dimmed }}>
                                            No constructors found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Placeholder */}
                    <div className="p-4 flex items-center justify-between" style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>Page 1 of 1</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50" disabled style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}>Prev</button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50" disabled style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}>Next</button>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </>
    );
}
