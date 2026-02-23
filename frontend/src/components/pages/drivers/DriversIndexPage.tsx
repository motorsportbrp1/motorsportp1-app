"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { getCountryFlagUrl } from "@/lib/utils";

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

export default function DriversIndexPage() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterEra, setFilterEra] = useState<string>("All Eras");
    const [statusFilter, setStatusFilter] = useState({ active: true, retired: true });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    // Reset page to 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, rowsPerPage, filterEra, statusFilter]);

    // Carousel ref
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDrivers = async () => {
            // Fetch drivers
            const { data, error } = await supabase
                .from('drivers')
                .select('*')
                .order('totalracewins', { ascending: false });

            if (error) {
                console.error("Error fetching drivers:", error);
                setLoading(false);
                return;
            }

            // Fetch ACTIVE drivers (those who raced in 2025 season)
            const { data: activeData } = await supabase
                .from('driver_standings')
                .select('driverid')
                .eq('year', 2025);

            const activeDriverIds = new Set(
                (activeData || []).map((s: any) => s.driverid)
            );

            // Fetch first and last race year for each driver (paginated)
            let careerMap: Record<string, { first: number; last: number }> = {};
            let offset = 0;
            const batchSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data: batch } = await supabase
                    .from('results')
                    .select('driverid, year')
                    .range(offset, offset + batchSize - 1);

                if (!batch || batch.length === 0) {
                    hasMore = false;
                    break;
                }

                batch.forEach((r: any) => {
                    const existing = careerMap[r.driverid];
                    if (!existing) {
                        careerMap[r.driverid] = { first: r.year, last: r.year };
                    } else {
                        if (r.year < existing.first) existing.first = r.year;
                        if (r.year > existing.last) existing.last = r.year;
                    }
                });

                if (batch.length < batchSize) {
                    hasMore = false;
                } else {
                    offset += batchSize;
                }
            }

            // Enrich drivers with career + active data
            const enrichedDrivers = (data || []).map((d: any) => ({
                ...d,
                firstYear: careerMap[d.id]?.first || null,
                lastYear: careerMap[d.id]?.last || null,
                isActive: activeDriverIds.has(d.id),
                isDeceased: !!d.dateofdeath,
            }));

            setDrivers(enrichedDrivers);
            setLoading(false);
        };

        fetchDrivers();
    }, []);

    const DRIVER_IMAGES: Record<string, string> = {
        "franco-colapinto": "/images/drivers/2026alpinefracol01right.avif",
        "pierre-gasly": "/images/drivers/2026alpinepiegas01right.avif",
        "fernando-alonso": "/images/drivers/2026astonmartinferalo01right.avif",
        "lance-stroll": "/images/drivers/2026astonmartinlanstr01right.avif",
        "charles-leclerc": "/images/drivers/2026ferrarichalec01right.avif",
        "lewis-hamilton": "/images/drivers/2026ferrarilewham01right.avif",
        "lando-norris": "/images/drivers/2026mclarenlannor01right.avif",
        "andrea-kimi-antonelli": "/images/drivers/2026mercedesandant01right.avif",
        "max-verstappen": "/images/drivers/2026redbullracingmaxver01right.avif",
        "alexander-albon": "/images/drivers/2026williamsalealb01right.avif",
        "carlos-sainz": "/images/drivers/2026williamscarsai01right.avif",
        "alain-prost": "/images/drivers/alain-prost.jpg",
        "ayrton-senna": "/images/drivers/ayrtons-senna.avif",
        "michael-schumacher": "/images/drivers/michael-schumacher.png"
    };

    // Include the top 7 legends to cover Senna, Prost, Lauda along with the top 4
    const LEGENDS = drivers.filter(d => (d.totalchampionshipwins || 0) >= 3).sort((a, b) => b.totalracewins - a.totalracewins).slice(0, 7).map(d => ({
        ...d,
        headshot_url: DRIVER_IMAGES[d.id] || d.headshot_url
    }));

    const filteredDrivers = drivers.filter(d => {
        const first = d.firstname || "";
        const last = d.lastname || "";
        const matchesSearch = first.toLowerCase().includes(searchQuery.toLowerCase()) ||
            last.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter: Active / Retired
        const matchesStatus = (statusFilter.active && d.isActive) || (statusFilter.retired && !d.isActive);

        // Era filter based on first or last year range
        let matchesEra = true;
        if (filterEra === "Hybrid Era") {
            matchesEra = (d.lastYear || 0) >= 2014;
        } else if (filterEra === "V8 Era") {
            matchesEra = (d.firstYear || 9999) <= 2013 && (d.lastYear || 0) >= 2006;
        } else if (filterEra === "V10 Era") {
            matchesEra = (d.firstYear || 9999) <= 2005 && (d.lastYear || 0) >= 2000;
        }

        return matchesSearch && matchesStatus && matchesEra;
    }).map(d => ({
        ...d,
        headshot_url: DRIVER_IMAGES[d.id] || d.headshot_url
    }));

    const totalPages = Math.ceil(filteredDrivers.length / rowsPerPage);
    const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <>
            <Header />

            <main className="flex-grow flex flex-col p-6 mx-auto w-full gap-6" style={{ maxWidth: 1400 }}>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Drivers Analytic Index</h1>
                        <p className="text-sm max-w-xl" style={{ color: C.muted }}>Comprehensive historical records and advanced performance metrics from 1950 to present. Analyzing over 800+ drivers.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                        <button className="px-4 py-2 rounded-lg text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 hover:bg-white/5 w-full md:w-auto" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export CSV
                        </button>
                        <button className="px-4 py-2 rounded-lg text-white font-bold text-sm transition-colors shadow-lg hover:bg-red-700 w-full md:w-auto" style={{ background: C.primary, boxShadow: "0 10px 15px -3px rgba(236, 19, 30, 0.2)" }}>
                            Generate Report
                        </button>
                    </div>
                </div>

                {/* Hall of Fame Carousel */}
                <div className="w-full rounded-2xl p-5 overflow-hidden relative shadow-lg card-hover" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ color: C.primary }}>military_tech</span>
                            Hall of Fame Legends
                        </h3>
                        <div className="flex gap-1">
                            <button onClick={() => carouselRef.current?.scrollBy({ left: -280, behavior: 'smooth' })} className="size-8 rounded flex items-center justify-center transition-colors hover:bg-white/5 hover:text-white cursor-pointer" style={{ color: C.dimmed }}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button onClick={() => carouselRef.current?.scrollBy({ left: 280, behavior: 'smooth' })} className="size-8 rounded flex items-center justify-center transition-colors hover:bg-white/5 hover:text-white cursor-pointer" style={{ color: C.dimmed }}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x scroll-smooth">
                        {LEGENDS.map((legend, i) => (
                            <Link href={`/drivers/${legend.id}`} key={i} className="flex-none w-64 rounded-lg p-5 relative group transition-colors cursor-pointer snap-start"
                                style={{
                                    background: `linear-gradient(to bottom right, ${C.lighter}, ${C.bg})`,
                                    border: `1px solid ${C.border}`
                                }}
                            >
                                <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded" style={{ color: C.primary, background: "rgba(236, 19, 30, 0.1)" }}>
                                    {legend.totalchampionshipwins || 0} WDC
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    {legend.headshot_url ? (
                                        <img src={legend.headshot_url} alt={`${legend.firstname} ${legend.lastname}`} className="size-14 rounded-full object-cover object-top" style={{ border: `2px solid ${C.border}` }} />
                                    ) : (
                                        <div className="size-14 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: C.lighter, border: `2px solid ${C.border}` }}>
                                            {legend.firstname ? legend.firstname[0] : ""}
                                            {legend.lastname ? legend.lastname[0] : ""}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-white font-bold group-hover:text-primary transition-colors">{(legend.firstname || "?")[0]}. {legend.lastname}</div>
                                        <div className="text-xs" style={{ color: C.dimmed }}>{legend.nationalitycountryid}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2 rounded flex flex-col items-center justify-center gap-1" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                                        <div className="flex items-center gap-1" style={{ color: C.dimmed }}>
                                            <span className="material-symbols-outlined text-[14px]">emoji_events</span> Wins
                                        </div>
                                        <div className="text-white font-bold text-sm tracking-tight">{legend.totalracewins || 0}</div>
                                    </div>
                                    <div className="p-2 rounded flex flex-col items-center justify-center gap-1" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                                        <div className="flex items-center gap-1" style={{ color: C.dimmed }}>
                                            <span className="material-symbols-outlined text-[14px]">timer</span> Poles
                                        </div>
                                        <div className="text-white font-bold text-sm tracking-tight">{legend.totalpolepositions || 0}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center p-4 rounded-xl sticky top-0 z-20 shadow-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full md:w-80">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px]" style={{ color: C.dimmed }}>search</span>
                            <input
                                className="w-full rounded-lg pl-10 pr-4 py-2 focus:outline-none transition-colors text-sm text-white"
                                placeholder="Search Driver..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ background: C.bg, border: `1px solid ${C.border}` }}
                            />
                        </div>
                        <div className="h-8 w-px hidden md:block" style={{ background: C.border }}></div>
                        <div className="hidden md:flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
                            {["All Eras", "Hybrid Era", "V8 Era", "V10 Era"].map(era => (
                                <button
                                    key={era}
                                    onClick={() => setFilterEra(era)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                                    style={{
                                        background: filterEra === era ? C.primary : "transparent",
                                        color: filterEra === era ? "#fff" : C.muted
                                    }}
                                >
                                    {era}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                        <div className="flex items-center gap-3 text-xs px-3 py-2 rounded" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}>
                            <span className="font-bold">Status:</span>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={statusFilter.active}
                                    onChange={(e) => setStatusFilter({ ...statusFilter, active: e.target.checked })}
                                    className="rounded border-none focus:ring-0 size-3"
                                    style={{ background: C.lighter, accentColor: C.primary }}
                                />
                                <span>Active</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer ml-1 hover:text-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={statusFilter.retired}
                                    onChange={(e) => setStatusFilter({ ...statusFilter, retired: e.target.checked })}
                                    className="rounded border-none focus:ring-0 size-3"
                                    style={{ background: C.lighter, accentColor: C.primary }}
                                />
                                <span>Retired</span>
                            </label>
                        </div>
                        <button className="p-2 rounded transition-colors flex items-center justify-center hover:bg-white/5" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}>
                            <span className="material-symbols-outlined text-[20px]">tune</span>
                        </button>
                    </div>
                </div>

                {/* Advanced Data Table */}
                <div className="flex-1 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="text-xs uppercase font-bold tracking-wide sticky top-0 z-10" style={{ background: "rgba(46,48,54,0.5)", color: C.muted }}>
                                <tr>
                                    <th className="px-5 py-4 w-12 text-center" style={{ borderBottom: `1px solid ${C.border}` }}>#</th>
                                    <th className="px-5 py-4 cursor-pointer hover:text-white transition-colors group" style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <div className="flex items-center gap-1">
                                            Driver
                                            <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100">unfold_more</span>
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 w-20" style={{ borderBottom: `1px solid ${C.border}` }}>Nat.</th>
                                    <th className="px-5 py-4 text-right cursor-pointer group" style={{ borderBottom: `1px solid ${C.border}`, color: C.primary, background: "rgba(236,19,30,0.05)" }}>
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="material-symbols-outlined text-[16px]">emoji_events</span> Title
                                            <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors group" style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <div className="flex items-center justify-end gap-1">
                                            GP Starts
                                            <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100">unfold_more</span>
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors group" style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <div className="flex items-center justify-end gap-1">
                                            Wins
                                            <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100">unfold_more</span>
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors group" style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <div className="flex items-center justify-end gap-1">
                                            Poles
                                            <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100">unfold_more</span>
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors group" style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <div className="flex items-center justify-end gap-1">
                                            Podiums
                                            <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100">unfold_more</span>
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors group" style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <div className="flex items-center justify-end gap-1">
                                            Pts/Race
                                            <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100">unfold_more</span>
                                        </div>
                                    </th>
                                    <th className="px-5 py-4 text-right w-24" style={{ borderBottom: `1px solid ${C.border}` }}>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y" style={{ borderColor: C.border }}>
                                {paginatedDrivers.map((driver, idx) => (
                                    <tr key={driver.id} className="transition-colors group hover:bg-white/5 cursor-pointer">
                                        <td className="px-5 py-4 text-center font-bold" style={{ color: C.dimmed }}>{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                                        <td className="px-5 py-4">
                                            <Link href={`/drivers/${driver.id}`} className="flex items-center gap-3">
                                                {driver.headshot_url ? (
                                                    <img src={driver.headshot_url} alt={`${driver.firstname} ${driver.lastname}`} className="size-9 rounded-full object-cover object-top" style={{ border: `1px solid ${C.border}` }} />
                                                ) : (
                                                    <div className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: C.lighter, border: `1px solid ${C.border}` }}>
                                                        {driver.firstname ? driver.firstname[0] : ""}
                                                        {driver.lastname ? driver.lastname[0] : ""}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold group-hover:text-primary transition-colors">{driver.firstname} {driver.lastname}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1" style={{ color: C.dimmed }}>
                                                        {driver.firstYear
                                                            ? (driver.isActive
                                                                ? `${driver.firstYear} — Present`
                                                                : driver.isDeceased
                                                                    ? <>{driver.firstYear} — {driver.lastYear} <span className="text-[10px]">✝</span></>
                                                                    : `${driver.firstYear} — ${driver.lastYear}`)
                                                            : "Historic Driver"}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-5 py-4 font-medium" style={{ color: C.muted }}>
                                            <div className="flex items-center gap-2">
                                                {driver.nationalitycountryid && (
                                                    <img src={getCountryFlagUrl(driver.nationalitycountryid)} alt={driver.nationalitycountryid} className="h-4 w-auto rounded-sm" />
                                                )}
                                                <span className="font-mono text-xs uppercase">{driver.nationalitycountryid || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-base" style={{ color: C.primary, background: "rgba(236,19,30,0.05)" }}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                {driver.totalchampionshipwins || 0}
                                                {(driver.totalchampionshipwins || 0) > 0 && <span className="material-symbols-outlined text-[14px] text-yellow-500">emoji_events</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right text-white font-mono">{driver.totalracestarts || 0}</td>
                                        <td className="px-5 py-4 text-right font-mono" style={{ color: C.muted }}>{driver.totalracewins || 0}</td>
                                        <td className="px-5 py-4 text-right font-mono" style={{ color: C.muted }}>{driver.totalpolepositions || 0}</td>
                                        <td className="px-5 py-4 text-right font-mono" style={{ color: C.muted }}>{driver.totalpodiums || 0}</td>
                                        <td className="px-5 py-4 text-right font-mono" style={{ color: C.muted }}>{((driver.totalpoints || 0) / (driver.totalracestarts || 1)).toFixed(1)}</td>
                                        <td className="px-5 py-4 text-right">
                                            {driver.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                                                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest" style={{ background: C.lighter, color: C.dimmed, border: `1px solid ${C.border}` }}>
                                                    Retired
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {filteredDrivers.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-5 py-16 text-center">
                                            <span className="material-symbols-outlined text-4xl mb-2 block" style={{ color: C.dimmed }}>sentiment_dissatisfied</span>
                                            <p className="text-white font-bold">No drivers found matching your criteria</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col md:flex-row items-center justify-between px-5 py-3" style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}>
                        <div className="text-xs mb-3 md:mb-0" style={{ color: C.dimmed }}>
                            Showing <span className="text-white font-bold">{filteredDrivers.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> to <span className="text-white font-bold">{Math.min(currentPage * rowsPerPage, filteredDrivers.length)}</span> of <span className="text-white font-bold">{filteredDrivers.length}</span> Drivers
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs" style={{ color: C.dimmed }}>
                                Rows per page:
                                <select
                                    className="rounded text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                    style={{ background: C.surface, border: `1px solid ${C.border}`, color: "white" }}
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={70}>70</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="size-8 flex items-center justify-center rounded hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.dimmed }}
                                >
                                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                </button>
                                <div className="flex items-center justify-center px-3 rounded text-white text-xs font-bold" style={{ background: C.primary }}>
                                    {currentPage}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="size-8 flex items-center justify-center rounded hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.dimmed }}
                                >
                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
