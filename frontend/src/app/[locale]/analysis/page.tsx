"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { BarChart3, GitCompare, Radio, LayoutDashboard } from "lucide-react";

const C = {
    primary: "var(--primary)",
    bg: "var(--bg-dark)",
    surface: "var(--surface)",
    border: "var(--surface-lighter)",
    muted: "#94a3b8",
};

const ANALYSIS_MODULES = [
    {
        title: "Session Analyzer",
        description: "Análise profunda de telemetria, stints de pneus e ritmo de corrida de cada sessão.",
        href: "/analysis/session/2024/5/R",
        icon: BarChart3,
        color: "#3b82f6",
    },
    {
        title: "Driver Compare",
        description: "Compare o desempenho de dois pilotos lado a lado com sobreposição de telemetria.",
        href: "/analysis/compare",
        icon: GitCompare,
        color: "#10b981",
    },
    {
        title: "Live Timing",
        description: "Monitoramento em tempo real de tempos de volta, setores e posições na pista.",
        href: "/analysis/live",
        icon: Radio,
        color: "var(--primary)",
    },
];

export default function AnalysisHub() {
    return (
        <>
            <Header />
            <main className="flex-grow p-6 mx-auto w-full max-w-7xl">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <LayoutDashboard size={24} style={{ color: C.primary }} />
                        <h1 className="text-3xl font-bold text-white tracking-tight">Módulo de Análise</h1>
                    </div>
                    <p className="text-lg" style={{ color: C.muted }}>
                        Selecione uma ferramenta para explorar dados e telemetria da Fórmula 1.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ANALYSIS_MODULES.map((module) => (
                        <Link
                            key={module.title}
                            href={module.href}
                            className="group rounded-2xl p-8 transition-all duration-300 card-hover flex flex-col items-start gap-4"
                            style={{
                                background: C.surface,
                                border: `1px solid ${C.border}`,
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{ background: `${module.color}20`, color: module.color }}
                            >
                                <module.icon size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                    {module.title}
                                </h2>
                                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                                    {module.description}
                                </p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: module.color }}>
                                Acessar Módulo
                                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
            <Footer />
        </>
    );
}
