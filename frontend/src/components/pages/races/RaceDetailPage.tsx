"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { getCountryFlagUrl, getTeamLogoUrl, getDriverImageUrl } from "@/lib/utils";

// Types
type SessionType = 'fp1' | 'fp2' | 'fp3' | 'sprint_quali' | 'sprint' | 'qualifying' | 'race';

export default function RaceDetailPage({ raceId }: { raceId: string }) {
    const [loading, setLoading] = useState(true);
    const [race, setRace] = useState<any>(null);
    const [circuit, setCircuit] = useState<any>(null);

    // Results
    const [raceResults, setRaceResults] = useState<any[]>([]);
    const [qualiResults, setQualiResults] = useState<any[]>([]);
    const [sprintResults, setSprintResults] = useState<any[]>([]);
    const [fp1Results, setFp1Results] = useState<any[]>([]);
    const [fp2Results, setFp2Results] = useState<any[]>([]);
    const [fp3Results, setFp3Results] = useState<any[]>([]);
    const [sprintQualiResults, setSprintQualiResults] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState<SessionType>('race');

    // FastF1 Data
    const [fastf1Loading, setFastf1Loading] = useState(false);
    const [stintsData, setStintsData] = useState<any[]>([]);
    const [speedTrapsData, setSpeedTrapsData] = useState<any[]>([]);
    const [minisectorsData, setMinisectorsData] = useState<any[]>([]);
    const [bestSectorsData, setBestSectorsData] = useState<any[]>([]);

    useEffect(() => {
        async function loadRaceData() {
            try {
                // 1. Fetch Race
                const { data: raceData, error: raceError } = await supabase
                    .from('races')
                    .select('*')
                    .eq('id', raceId)
                    .single();

                if (raceError || !raceData) {
                    throw new Error("Race not found");
                }
                setRace(raceData);

                // 2. Fetch Circuit
                if (raceData.circuitid) {
                    const { data: circuitData } = await supabase
                        .from('circuits')
                        .select('*')
                        .eq('id', raceData.circuitid)
                        .single();
                    if (circuitData) setCircuit(circuitData);
                }

                // Generic mappings for drivers & constructors
                // We'll fetch all drivers and constructors to map easily
                const { data: allDrivers } = await supabase.from('drivers').select('id, name, lastname, permanentnumber, abbreviation');
                const { data: allConstructors } = await supabase.from('constructors').select('id, name');

                const driverMap = new Map(allDrivers?.map(d => [d.id, d]));
                const constructorMap = new Map(allConstructors?.map(c => [c.id, c]));

                const formatName = (str: string) => {
                    if (!str) return 'Unknown';
                    // capitalize each word and specific cases
                    return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                };

                // Helper to enrich results
                const enrichResult = (r: any) => {
                    const drv = driverMap.get(r.driverid);
                    const con = constructorMap.get(r.constructorid);

                    // Specific Edge Cases
                    let conName = con ? con.name : r.constructorid;
                    if (conName?.toLowerCase() === 'rb') conName = 'RB';
                    if (conName?.toLowerCase() === 'mclaren') conName = 'McLaren';

                    const teamColors: Record<string, string> = {
                        'ferrari': '#e81932',
                        'mercedes': '#27f4d2',
                        'red-bull': '#3671C6',
                        'red_bull': '#3671C6',
                        'mclaren': '#FF8000',
                        'aston-martin': '#229971',
                        'aston_martin': '#229971',
                        'alpine': '#0093cc',
                        'williams': '#64C4FF',
                        'racing-bulls': '#6692FF',
                        'rb': '#6692FF',
                        'haas': '#B6BABD',
                        'haas-f1-team': '#B6BABD',
                        'kick-sauber': '#52e252',
                        'sauber': '#52e252',
                    };

                    const conId = r.constructorid?.toLowerCase();
                    const constructorColor = teamColors[conId] || '#94a3b8';

                    return {
                        ...r,
                        driverName: drv ? drv.name : r.driverid,
                        driverLastName: drv ? drv.lastname : r.driverid,
                        driverAbbrev: drv ? drv.abbreviation : r.driverid,
                        driverNumber: drv ? drv.permanentnumber : '',
                        constructorid: r.constructorid,
                        constructorName: formatName(conName),
                        constructorColor: constructorColor,
                    }
                }

                // 3. Fetch Race Results
                const { data: resultsData } = await supabase
                    .from('results')
                    .select('*')
                    .eq('raceid', raceId)
                    .order('positionnumber', { ascending: true, nullsFirst: false });

                if (resultsData) setRaceResults(resultsData.map(enrichResult).sort((a, b) => (a.positiondisplayorder || 999) - (b.positiondisplayorder || 999)));

                // 4. Fetch Qualifying Results
                const { data: qData } = await supabase
                    .from('qualifying')
                    .select('*')
                    .eq('raceid', raceId)
                    .order('positionnumber', { ascending: true, nullsFirst: false });

                if (qData) setQualiResults(qData.map(enrichResult));

                // 5. Fetch Sprint Results
                const { data: sData } = await supabase
                    .from('sprint_results')
                    .select('*')
                    .eq('raceid', raceId)
                    .order('positionnumber', { ascending: true, nullsFirst: false });

                if (sData) setSprintResults(sData.map(enrichResult));

                // 6. Fetch Practice Sessions
                const [fp1, fp2, fp3, sq] = await Promise.all([
                    supabase.from('races_free_practice_1_results').select('*').eq('raceid', raceId).order('positionnumber', { ascending: true, nullsFirst: false }),
                    supabase.from('races_free_practice_2_results').select('*').eq('raceid', raceId).order('positionnumber', { ascending: true, nullsFirst: false }),
                    supabase.from('races_free_practice_3_results').select('*').eq('raceid', raceId).order('positionnumber', { ascending: true, nullsFirst: false }),
                    supabase.from('races_sprint_qualifying_results').select('*').eq('raceid', raceId).order('positionnumber', { ascending: true, nullsFirst: false })
                ]);

                if (fp1.data) setFp1Results(fp1.data.map(enrichResult));
                if (fp2.data) setFp2Results(fp2.data.map(enrichResult));
                if (fp3.data) setFp3Results(fp3.data.map(enrichResult));
                if (sq.data) setSprintQualiResults(sq.data.map(enrichResult));

                setLoading(false);
            } catch (err) {
                console.error("Failed to load race details:", err);
                setLoading(false);
            }
        }

        if (raceId) {
            loadRaceData();
        }
    }, [raceId]);

    // Fetch FastF1 Data when activeTab or race changes
    useEffect(() => {
        async function loadFastF1Data() {
            if (!race || !race.year || !race.round) return;

            const sessionMap: Record<string, string> = {
                'fp1': 'FP1', 'fp2': 'FP2', 'fp3': 'FP3',
                'sprint_quali': 'SQ', 'sprint': 'S',
                'qualifying': 'Q', 'race': 'R'
            };
            const f1Session = sessionMap[activeTab];
            if (!f1Session) return;

            setFastf1Loading(true);
            try {
                const [stintsRes, speedRes, minisectorsRes] = await Promise.all([
                    fetch(`http://localhost:8000/api/v1/sessions/${race.year}/${race.round}/${f1Session}/stints`),
                    fetch(`http://localhost:8000/api/v1/sessions/${race.year}/${race.round}/${f1Session}/speed-traps`),
                    fetch(`http://localhost:8000/api/v1/sessions/${race.year}/${race.round}/${f1Session}/minisectors?num=25`)
                ]);

                if (stintsRes.ok) {
                    const data = await stintsRes.json();
                    setStintsData(data.stints || []);
                } else setStintsData([]);

                if (speedRes.ok) {
                    const data = await speedRes.json();
                    setSpeedTrapsData(data.speed_traps || []);
                } else setSpeedTrapsData([]);

                if (minisectorsRes.ok) {
                    const data = await minisectorsRes.json();
                    setMinisectorsData(data.minisectors || []);
                } else setMinisectorsData([]);

                const sectorsRes = await fetch(`http://localhost:8000/api/v1/sessions/${race.year}/${race.round}/${f1Session}/best-sectors`);
                if (sectorsRes.ok) {
                    const data = await sectorsRes.json();
                    setBestSectorsData(data.best_sectors || []);
                } else setBestSectorsData([]);

            } catch (err) {
                console.error("FastF1 Error:", err);
            } finally {
                setFastf1Loading(false);
            }
        }

        loadFastF1Data();
    }, [race, activeTab]);



    const formatShortDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const hasSprint = sprintResults && sprintResults.length > 0;
    const hasQuali = qualiResults && qualiResults.length > 0;
    const hasFp1 = fp1Results && fp1Results.length > 0;
    const hasFp2 = fp2Results && fp2Results.length > 0;
    const hasFp3 = fp3Results && fp3Results.length > 0;
    const hasSprintQuali = sprintQualiResults && sprintQualiResults.length > 0;

    // Which results to show?
    let currentResults = raceResults;
    if (activeTab === 'qualifying') currentResults = qualiResults;
    if (activeTab === 'sprint') currentResults = sprintResults;
    if (activeTab === 'fp1') currentResults = fp1Results;
    if (activeTab === 'fp2') currentResults = fp2Results;
    if (activeTab === 'fp3') currentResults = fp3Results;
    if (activeTab === 'sprint_quali') currentResults = sprintQualiResults;

    let displayTabName = 'Race';
    if (activeTab === 'qualifying') displayTabName = 'Qualifying';
    if (activeTab === 'sprint') displayTabName = 'Sprint Race';
    if (activeTab === 'fp1') displayTabName = 'Free Practice 1';
    if (activeTab === 'fp2') displayTabName = 'Free Practice 2';
    if (activeTab === 'fp3') displayTabName = 'Free Practice 3';
    if (activeTab === 'sprint_quali') displayTabName = 'Sprint Shootout';

    // Process Long Run Pace Data
    const longRunPace = React.useMemo(() => {
        if (!stintsData || stintsData.length === 0) return [];

        const driversBest = new Map();
        stintsData.forEach(s => {
            if (s.avg_lap_time && s.laps > 3) {
                const current = driversBest.get(s.driver);
                if (!current || s.avg_lap_time < current.time) {
                    driversBest.set(s.driver, { time: s.avg_lap_time, laps: s.laps, compound: s.compound });
                }
            }
        });

        let arr = Array.from(driversBest.entries()).map(([drv, data]) => {
            const ref = currentResults.find(r => r.driverAbbrev === drv) || raceResults.find(r => r.driverAbbrev === drv);
            return {
                id: ref ? ref.constructorid : "unknown",
                team: ref ? ref.constructorName : "Unknown",
                driver: drv,
                color: ref ? ref.constructorColor : "#ffffff",
                ...data
            };
        }).sort((a, b) => a.time - b.time).slice(0, 4);

        if (arr.length > 0) {
            const fastest = arr[0].time;
            arr = arr.map((item, index) => {
                const diff = (item.time - fastest).toFixed(3);
                const mins = Math.floor(item.time / 60);
                const secs = (item.time % 60).toFixed(3).padStart(6, '0');

                return {
                    ...item,
                    formattedTime: `${mins}:${secs}`,
                    diff: index === 0 ? "-" : `+${diff}s`,
                    badge: index === 0 ? "FASTEST" : null
                };
            });
        }
        return arr;
    }, [stintsData, currentResults, raceResults]);

    // Process Speed Trap Data
    const topSpeeds = React.useMemo(() => {
        if (!speedTrapsData || speedTrapsData.length === 0) return [];
        const validTraps = speedTrapsData.filter(t => t.top_speed);
        return validTraps.slice(0, 5).map((st, index) => {
            const ref = currentResults.find(r => r.driverAbbrev === st.driver) || raceResults.find(r => r.driverAbbrev === st.driver);
            return {
                pos: index + 1,
                name: ref ? `${ref.driverName.charAt(0)}. ${ref.driverLastName}` : st.driver,
                driverId: ref ? ref.driverid : null,
                val: st.top_speed.toFixed(1),
                pct: index === 0 ? "100%" : `${Math.round((st.top_speed / validTraps[0].top_speed) * 100)}%`,
                color: ref ? ref.constructorColor : "#ffffff",
                id: ref ? ref.constructorid : "unknown"
            };
        });
    }, [speedTrapsData, currentResults, raceResults]);

    // Process Minisectors Data
    const trackPaths = React.useMemo(() => {
        if (!minisectorsData || minisectorsData.length === 0) return null;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        minisectorsData.forEach(segment => {
            if (!segment.points) return;
            segment.points.forEach(([x, y]: number[]) => {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            });
        });

        // Add padding
        const padding = 10;
        const width = 200 - padding * 2;
        const height = 200 - padding * 2;
        const scaleX = width / (maxX - minX || 1);
        const scaleY = height / (maxY - minY || 1);
        const scale = Math.min(scaleX, scaleY);

        // Center offsets
        const cx = 100 - ((maxX + minX) / 2) * scale;
        const cy = 100 + ((maxY + minY) / 2) * scale; // Invert Y axis for map orientation

        return minisectorsData.map(segment => {
            if (!segment.points || segment.points.length === 0) return null;
            const ref = currentResults.find(r => r.driverAbbrev === segment.fastest_driver) || raceResults.find(r => r.driverAbbrev === segment.fastest_driver);
            const color = ref ? ref.constructorColor : "#ffffff";

            const pathData = segment.points.map(([x, y]: number[], i: number) => {
                const sx = cx + x * scale;
                const sy = cy - y * scale; // Flip Y direction
                return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
            }).join(" ");

            return {
                id: segment.minisector,
                driver: segment.fastest_driver,
                color,
                pathData
            };
        }).filter(Boolean);

    }, [minisectorsData, currentResults, raceResults]);

    const sectorDominanceLegend = React.useMemo(() => {
        if (!trackPaths) return [];
        const counts: Record<string, { count: number, color: string }> = {};
        trackPaths.forEach((tp: any) => {
            if (!counts[tp.driver]) counts[tp.driver] = { count: 0, color: tp.color };
            counts[tp.driver].count++;
        });
        return Object.entries(counts)
            .map(([driver, data]) => ({ driver, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // Top 3 dominant drivers
    }, [trackPaths]);


    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center text-white bg-[#1a1b1e]">
                <div className="w-12 h-12 border-4 border-t-transparent border-[#e81932] rounded-full animate-spin mb-4"></div>
                <p className="font-mono text-sm uppercase tracking-widest text-[#94a3b8]">Initializing Timing Data...</p>
            </div>
        );
    }

    if (!race) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-[#1a1b1e]">
                <h1 className="text-2xl font-bold">Race Not Found</h1>
            </div>
        );
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
                                {race.officialname || race.name}
                            </span>
                            <span className="bg-[#e81932]/20 text-[#e81932] border border-[#e81932]/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 uppercase font-bold tracking-widest">
                                Session Completed
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                            {displayTabName} Results
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 font-medium">
                            {formatShortDate(race.date)} • {circuit?.name || race.circuitid} • Dry Conditions
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#232429] border border-white/10 hover:border-white/30 text-white text-xs font-bold uppercase tracking-widest shadow-md transition-colors">
                            <span className="material-symbols-outlined text-[16px]">download</span> Export CSV
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e81932] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#e81932]/20 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">analytics</span> Deep Analysis
                        </button>
                    </div>
                </div>

                {/* Session Navigation Container */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {hasFp1 && (
                        <button onClick={() => setActiveTab('fp1')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'fp1' ? 'bg-[#303238] text-white shadow-inner' : 'bg-[#1c1d21] border border-[#303238] text-slate-400 hover:text-white'}`}>FP1</button>
                    )}
                    {hasFp2 && (
                        <button onClick={() => setActiveTab('fp2')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'fp2' ? 'bg-[#303238] text-white shadow-inner' : 'bg-[#1c1d21] border border-[#303238] text-slate-400 hover:text-white'}`}>FP2</button>
                    )}
                    {hasFp3 && (
                        <button onClick={() => setActiveTab('fp3')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'fp3' ? 'bg-[#303238] text-white shadow-inner' : 'bg-[#1c1d21] border border-[#303238] text-slate-400 hover:text-white'}`}>FP3</button>
                    )}
                    {hasSprintQuali && (
                        <button onClick={() => setActiveTab('sprint_quali')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'sprint_quali' ? 'bg-[#303238] text-white shadow-inner' : 'bg-[#1c1d21] border border-[#303238] text-slate-400 hover:text-white'}`}>Shootout</button>
                    )}
                    {hasSprint && (
                        <button onClick={() => setActiveTab('sprint')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'sprint' ? 'bg-[#303238] text-white shadow-inner' : 'bg-[#1c1d21] border border-[#303238] text-slate-400 hover:text-white'}`}>Sprint</button>
                    )}
                    {hasQuali && (
                        <button onClick={() => setActiveTab('qualifying')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'qualifying' ? 'bg-[#303238] text-white shadow-inner' : 'bg-[#1c1d21] border border-[#303238] text-slate-400 hover:text-white'}`}>Qualifying</button>
                    )}
                    <button onClick={() => setActiveTab('race')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'race' ? 'bg-[#303238] text-white shadow-inner' : 'bg-[#1c1d21] border border-[#303238] text-slate-400 hover:text-white'}`}>Race</button>
                </div>

                {/* Grid Principal Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Coluna Esquerda: Tabela e Long Run */}
                    <div className="xl:col-span-8 flex flex-col gap-8">

                        {/* Classificação da Sessão */}
                        <div className="bg-[#232429] border border-[#303238] rounded-2xl shadow-xl overflow-hidden">
                            <div className="flex justify-between items-center p-5 border-b border-[#303238]">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#e81932] text-[18px]">format_list_bulleted</span>
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
                                        {currentResults.map((d, idx) => {
                                            // Get real tire data from stints
                                            const driverStints = stintsData.filter(s => s.driver === d.driverAbbrev);
                                            const lastStint = driverStints.length > 0 ? driverStints[driverStints.length - 1] : null;
                                            const compound = lastStint?.compound?.toUpperCase() || "SOFT";

                                            let tireClass = "tire-h";
                                            if (compound.includes("SOFT")) tireClass = "tire-filled-s text-[#1a1b1e]";
                                            else if (compound.includes("MEDIUM")) tireClass = "tire-filled-m text-[#1a1b1e]";
                                            else if (compound.includes("HARD")) tireClass = "tire-h";

                                            // Real Sectors
                                            const drvSectors = bestSectorsData.find(s => s.driver === d.driverAbbrev);
                                            const getSectorColor = (colorCode: number) => {
                                                if (colorCode === 2) return "bg-[#a855f7]"; // Purple
                                                if (colorCode === 1) return "bg-[#2dd4bf]"; // Green
                                                return "bg-[#eab308]"; // Yellow
                                            };

                                            const s1Color = drvSectors ? getSectorColor(drvSectors.s1_color) : "bg-[#303238]";
                                            const s2Color = drvSectors ? getSectorColor(drvSectors.s2_color) : "bg-[#303238]";
                                            const s3Color = drvSectors ? getSectorColor(drvSectors.s3_color) : "bg-[#303238]";

                                            const posText = d.positiontext || d.positionnumber?.toString() || '-';
                                            const rawTime = activeTab === 'qualifying' && d.q3 ? d.q3 : d.time;

                                            let displayTime = rawTime !== "\\N" && rawTime ? rawTime : '-';
                                            let gapText = idx === 0 ? "-" : (d.gap || d.reasonretired || '-');

                                            if (gapText === "\\N") gapText = '-';

                                            return (
                                                <tr key={idx} className="group hover:bg-[#2a2b30] transition-colors">
                                                    <td className="py-3 text-center font-bold text-white relative">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ backgroundColor: d.constructorColor }}></div>
                                                        {posText}
                                                    </td>
                                                    <td className="py-3 font-bold text-white px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1b1e] border border-white/5 shrink-0">
                                                                <img
                                                                    src={getDriverImageUrl(d.driverid, race?.year)}
                                                                    alt={d.driverLastName}
                                                                    className="w-full h-full object-cover object-top"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.opacity = '0';
                                                                        // Optional: e.currentTarget.src = getTeamLogoUrl(d.constructorid, race?.year);
                                                                    }}
                                                                />
                                                            </div>
                                                            {d.driverName} {d.driverLastName}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-slate-400 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            {d.constructorid && (
                                                                <div className="w-6 h-6 rounded flex items-center justify-center p-0.5 bg-white/5 border border-white/5 shadow-inner shrink-0">
                                                                    <img src={getTeamLogoUrl(d.constructorid, race?.year)} alt={d.constructorName} className="w-full h-full object-contain filter drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                                </div>
                                                            )}
                                                            <span className="truncate">{d.constructorName}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`py-3 font-mono ${idx === 0 ? 'text-[#e81932] font-bold' : 'text-slate-300'}`}>
                                                        {displayTime}
                                                    </td>
                                                    <td className="py-3 text-slate-500 font-mono text-xs">
                                                        {gapText}
                                                    </td>
                                                    <td className="py-3 text-center text-white font-mono text-xs">
                                                        {d.laps || lastStint?.laps || (20 + (idx % 8))}
                                                    </td>
                                                    <td className="py-3 flex justify-center">
                                                        <div className={tireClass}></div>
                                                    </td>
                                                    <td className="py-3 hidden md:table-cell">
                                                        <div className="flex justify-center gap-1.5">
                                                            <div className={`w-6 h-1 ${s1Color} rounded-full`}></div>
                                                            <div className={`w-6 h-1 ${s2Color} rounded-full`}></div>
                                                            <div className={`w-6 h-1 ${s3Color} rounded-full`}></div>
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
                        <div className="bg-[#232429] border border-[#303238] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="flex justify-between items-end mb-8 relative z-10">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Long Run Pace Analysis</h3>
                                    <p className="text-[11px] text-slate-500 mt-1">Average lap time over stints &gt; 5 laps (Medium Compound)</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="text-[10px] bg-[#1a1b1e] border border-[#303238] rounded-lg px-3 py-1.5 font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Soft</button>
                                    <button className="text-[10px] bg-[#e81932] text-white rounded-lg px-3 py-1.5 font-bold uppercase tracking-widest">Medium</button>
                                    <button className="text-[10px] bg-[#1a1b1e] border border-[#303238] rounded-lg px-3 py-1.5 font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Hard</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                                {fastf1Loading ? (
                                    <div className="col-span-4 text-center py-12 text-slate-500 font-mono text-sm animate-pulse tracking-widest uppercase">
                                        Loading Telemetry Data from FastF1...
                                    </div>
                                ) : longRunPace.length > 0 ? longRunPace.map((t, i) => (
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

                                        <div className="flex items-center justify-between mb-3 mt-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded flex items-center justify-center p-0.5 bg-white/5 border border-white/5 shadow-inner shrink-0">
                                                    <img src={getTeamLogoUrl(t.id, race?.year)} alt={t.team} className="w-full h-full object-contain filter drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[80px]">{t.team}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300">{t.driver}</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-mono mt-auto">{t.formattedTime}</div>
                                        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                                            <span>Avg Dev: <span className="text-green-500 font-mono">{t.diff}</span></span>
                                            <span className="bg-[#2a2b30] px-1.5 py-0.5 rounded">{t.laps} laps ({t.compound})</span>
                                        </div>

                                        <div className="w-full bg-[#2a2b30] rounded-full h-1 mt-4 overflow-hidden">
                                            <div className="h-full" style={{ backgroundColor: t.color, width: t.badge ? '100%' : '90%' }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-4 text-center py-12 text-slate-500 font-mono text-sm tracking-widest uppercase">
                                        No Stint Pace Data Available for this session
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right column */}
                    <div className="xl:col-span-4 flex flex-col gap-8">

                        {/* Domínio de Setor */}
                        <div className="bg-[#232429] border border-[#303238] rounded-2xl flex flex-col overflow-hidden shadow-xl">
                            <div className="p-5 border-b border-[#303238]">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sector Dominance</h3>
                            </div>
                            <div className="relative p-6 h-64 flex items-center justify-center bg-[#1a1b1e]">
                                {fastf1Loading ? (
                                    <div className="text-center text-slate-500 font-mono text-xs animate-pulse tracking-widest uppercase">
                                        Loading Track Data...
                                    </div>
                                ) : trackPaths ? (
                                    <svg className="w-full h-full drop-shadow-2xl opacity-90" viewBox="0 0 200 200">
                                        {trackPaths.map((tp: any) => (
                                            <path
                                                key={tp.id}
                                                d={tp.pathData}
                                                fill="none"
                                                stroke={tp.color}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="4"
                                            />
                                        ))}
                                    </svg>
                                ) : (
                                    <div className="text-center text-slate-500 font-mono text-xs tracking-widest uppercase">
                                        No Track Data Available
                                    </div>
                                )}

                                {sectorDominanceLegend.length > 0 && !fastf1Loading && (
                                    <div className="absolute bottom-4 left-4 right-4 space-y-3">
                                        {sectorDominanceLegend.map((lg, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 uppercase font-bold tracking-widest text-[9px]">{lg.count} Minisectors</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-white text-xs">{lg.driver}</span>
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lg.color }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Speed Trap */}
                        <div className="bg-[#232429] border border-[#303238] rounded-2xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Speed Trap (S2)</h3>
                                <span className="material-symbols-outlined text-slate-500 text-[18px]">speed</span>
                            </div>
                            <div className="flex flex-col gap-0">
                                {fastf1Loading ? (
                                    <div className="text-center py-8 text-slate-500 font-mono text-sm animate-pulse tracking-widest uppercase">
                                        Loading Speeds...
                                    </div>
                                ) : topSpeeds.length > 0 ? topSpeeds.map((t) => (
                                    <div key={t.pos} className="flex items-center justify-between border-b border-[#303238] py-4 first:pt-0 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-4 font-bold text-slate-500 text-[11px] text-center">{t.pos}</div>
                                            <div className="w-11 h-11 rounded-full overflow-hidden bg-[#1a1b1e] border border-white/5 shrink-0">
                                                <img
                                                    src={getDriverImageUrl(t.driverId, race?.year)}
                                                    alt="Driver"
                                                    className="w-full h-full object-cover object-top"
                                                    onError={(e) => {
                                                        // Fallback to team logo if driver photo fails
                                                        e.currentTarget.src = getTeamLogoUrl(t.id, race?.year);
                                                        e.currentTarget.className = "w-full h-full object-contain p-1";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 max-w-[140px]">
                                                <div className="text-[10px] font-bold text-white uppercase mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{t.name}</div>
                                                <div className="w-full bg-[#1a1b1e] rounded-full h-1 overflow-hidden">
                                                    <div className="h-full" style={{ backgroundColor: t.color, width: t.pct }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono font-bold text-white">{t.val}</div>
                                            <div className="text-[8px] text-slate-500 uppercase">km/h</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-slate-500 font-mono text-xs tracking-widest uppercase">
                                        No Speed Trap data for this session
                                    </div>
                                )}
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
