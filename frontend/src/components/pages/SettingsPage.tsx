"use client";

import { useState } from "react";
import {
    Settings as SettingsIcon,
    Moon,
    Sun,
    Star,
    Trash2,
    Download,
    Database,
    Palette,
    Monitor,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface FavoriteItem {
    id: string;
    type: string;
    label: string;
    key: string;
}

const mockFavorites: FavoriteItem[] = [
    { id: "1", type: "driver", label: "Max Verstappen (VER)", key: "VER" },
    { id: "2", type: "driver", label: "Lando Norris (NOR)", key: "NOR" },
    { id: "3", type: "team", label: "McLaren", key: "mclaren" },
    { id: "4", type: "circuit", label: "Monza", key: "monza" },
    { id: "5", type: "session", label: "Bahrain 2024 Qualifying", key: "2024_1_Q" },
];

export default function SettingsPage() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    const [favorites, setFavorites] = useState(mockFavorites);
    const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

    const removeFavorite = (id: string) => {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
    };

    const typeIcons: Record<string, string> = {
        driver: "👤",
        team: "🏎️",
        circuit: "🏁",
        session: "📊",
    };

    return (
        <>
            <Header />
            <main className="flex-grow p-6 max-w-[1400px] mx-auto w-full">
                <div className="mb-6">
                    <h1 className="page-title">
                        <SettingsIcon
                            size={24}
                            style={{ color: "var(--f1-red)", display: "inline", verticalAlign: "middle", marginRight: 8 }}
                        />
                        Settings
                    </h1>
                    <p className="page-subtitle">Manage preferences, favorites, and data sources</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Appearance */}
                    <div className="card p-0 overflow-hidden">
                        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                <Palette size={16} style={{ color: "var(--accent-purple)" }} />
                                Appearance
                            </h2>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        Theme
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                                        Toggle between dark and light mode
                                    </p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                                    style={{
                                        backgroundColor: "var(--bg-tertiary)",
                                        border: "1px solid var(--border-primary)",
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {theme === "dark" ? (
                                        <>
                                            <Moon size={16} /> Dark
                                        </>
                                    ) : (
                                        <>
                                            <Sun size={16} /> Light
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Sidebar Style */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        Sidebar
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                                        Default sidebar state
                                    </p>
                                </div>
                                <select
                                    className="h-9 px-3 rounded-lg text-sm outline-none cursor-pointer"
                                    style={{
                                        backgroundColor: "var(--bg-tertiary)",
                                        border: "1px solid var(--border-primary)",
                                        color: "var(--text-primary)",
                                    }}
                                    defaultValue="expanded"
                                >
                                    <option value="expanded">Expanded</option>
                                    <option value="collapsed">Collapsed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Export Preferences */}
                    <div className="card p-0 overflow-hidden">
                        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                <Download size={16} style={{ color: "var(--accent-blue)" }} />
                                Export Preferences
                            </h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        Default Format
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                                        Preferred export format for data
                                    </p>
                                </div>
                                <div className="flex gap-1 p-0.5 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                                    {(["csv", "json"] as const).map((fmt) => (
                                        <button
                                            key={fmt}
                                            onClick={() => setExportFormat(fmt)}
                                            className="px-3 py-1.5 rounded-md text-xs font-medium uppercase transition-all duration-200 cursor-pointer"
                                            style={{
                                                backgroundColor: exportFormat === fmt ? "var(--bg-card)" : "transparent",
                                                color: exportFormat === fmt ? "var(--text-primary)" : "var(--text-tertiary)",
                                                border: "none",
                                            }}
                                        >
                                            {fmt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        Chart Export
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                                        Image format for chart exports
                                    </p>
                                </div>
                                <select
                                    className="h-9 px-3 rounded-lg text-sm outline-none cursor-pointer"
                                    style={{
                                        backgroundColor: "var(--bg-tertiary)",
                                        border: "1px solid var(--border-primary)",
                                        color: "var(--text-primary)",
                                    }}
                                    defaultValue="png"
                                >
                                    <option value="png">PNG</option>
                                    <option value="svg">SVG</option>
                                    <option value="webp">WebP</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Favorites */}
                    <div className="card p-0 overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                <Star size={16} style={{ color: "var(--accent-yellow)" }} />
                                Favorites ({favorites.length})
                            </h2>
                        </div>
                        <div>
                            {favorites.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Star size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
                                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                                        No favorites yet
                                    </p>
                                </div>
                            ) : (
                                favorites.map((fav, idx) => (
                                    <div
                                        key={fav.id}
                                        className="flex items-center justify-between px-5 py-3"
                                        style={{
                                            borderBottom: idx < favorites.length - 1 ? "1px solid var(--border-primary)" : "none",
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{typeIcons[fav.type]}</span>
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                    {fav.label}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                                                    {fav.type}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFavorite(fav.id)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200"
                                            style={{
                                                backgroundColor: "transparent",
                                                border: "none",
                                                color: "var(--text-tertiary)",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--f1-red)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Data Sources */}
                    <div className="card p-0 overflow-hidden">
                        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                <Database size={16} style={{ color: "var(--accent-green)" }} />
                                Data Sources
                            </h2>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { name: "FastF1", status: "Mock Data", color: "var(--accent-orange)" },
                                { name: "jolpica-f1", status: "Mock Data", color: "var(--accent-orange)" },
                                { name: "Supabase", status: "Not Connected", color: "var(--text-tertiary)" },
                                { name: "F1 Live Timing", status: "Mock Data", color: "var(--accent-orange)" },
                                { name: "Redis Cache", status: "Not Connected", color: "var(--text-tertiary)" },
                            ].map((source) => (
                                <div key={source.name} className="flex items-center justify-between">
                                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        {source.name}
                                    </span>
                                    <span
                                        className="text-xs font-medium px-2 py-1 rounded"
                                        style={{
                                            backgroundColor: `${source.color}15`,
                                            color: source.color,
                                        }}
                                    >
                                        {source.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
