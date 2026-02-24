"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/seasons", label: "Temporadas" },
    { href: "/drivers", label: "Pilotos" },
    { href: "/teams", label: "Equipes" },
    { href: "/analysis", label: "Análise" },
    { href: "/analysis/live", label: "Live", isLive: true },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header
            className="sticky top-0 z-50 backdrop-blur-md px-6 py-4"
            style={{ background: "rgba(35,36,41,0.95)", borderBottom: "1px solid var(--surface-lighter)" }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                {/* Logo + Nav */}
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-3 text-white">
                        <span className="material-symbols-outlined text-4xl" style={{ color: "var(--primary)" }}>flag_circle</span>
                        <div>
                            <h1 className="text-xl font-bold leading-none tracking-tight">MotorsportP1</h1>
                            <span className="text-[10px] font-medium tracking-[0.2em] uppercase" style={{ color: "#94a3b8" }}>Engine</span>
                        </div>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`nav-link ${isActive ? "active" : ""} hover:text-white transition-colors text-sm font-medium uppercase tracking-wide`}
                                    style={{ color: isActive ? "#fff" : "#cbd5e1" }}
                                >
                                    {link.isLive ? (
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full live-indicator" style={{ background: "var(--primary)" }} />
                                            {link.label}
                                        </span>
                                    ) : link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Search + Actions */}
                <div className="flex items-center gap-6 flex-1 justify-end">
                    <div className="relative hidden sm:flex w-full max-w-xs group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined" style={{ color: "#64748b" }}>search</span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-2 border-none rounded-full leading-5 text-slate-100 placeholder-slate-500 focus:outline-none sm:text-sm"
                            style={{ background: "var(--surface-lighter)", boxShadow: "none" }}
                            placeholder="Buscar piloto, circuito, telemetria..."
                            type="text"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] rounded" style={{ background: "#334155", color: "#94a3b8" }}>⌘K</kbd>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hover:text-white transition-colors relative" style={{ color: "#94a3b8" }}>
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 0 2px var(--surface)" }} />
                        </button>
                        <button className="hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
                            <span className="material-symbols-outlined">dashboard_customize</span>
                        </button>
                        <div
                            className="h-9 w-9 rounded-full flex items-center justify-center hover:border-primary transition-colors"
                            style={{ background: "var(--surface-lighter)", border: "2px solid var(--surface-lighter)" }}
                        >
                            <span className="material-symbols-outlined text-xl" style={{ color: "#94a3b8" }}>person</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
