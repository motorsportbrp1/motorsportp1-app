"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    BarChart3,
    GitCompare,
    Radio,
    Settings,
    Flag,
    Moon,
    Sun,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/session/2024/5/R", label: "Session Analyzer", icon: BarChart3 },
    { href: "/compare", label: "Driver Compare", icon: GitCompare },
    { href: "/live", label: "Live Timing", icon: Radio },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? "w-[72px]" : "w-[260px]"
                }`}
            style={{
                backgroundColor: "var(--bg-secondary)",
                borderRight: "1px solid var(--border-primary)",
            }}
        >
            {/* Logo */}
            <div
                className="flex items-center gap-3 px-5 h-16 shrink-0"
                style={{ borderBottom: "1px solid var(--border-primary)" }}
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--gradient-primary)" }}
                >
                    <Flag size={18} color="white" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1
                            className="text-sm font-bold tracking-tight"
                            style={{ color: "var(--text-primary)" }}
                        >
                            MotorSport<span style={{ color: "var(--f1-red)" }}>P1</span>
                        </h1>
                        <p
                            className="text-[10px] uppercase tracking-widest"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            F1 Analytics
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${collapsed ? "justify-center" : ""
                                }`}
                            style={{
                                backgroundColor: active
                                    ? "rgba(225, 6, 0, 0.12)"
                                    : "transparent",
                                color: active ? "var(--f1-red)" : "var(--text-secondary)",
                                borderLeft: active ? "3px solid var(--f1-red)" : "3px solid transparent",
                            }}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon
                                size={20}
                                className="shrink-0 transition-colors group-hover:text-[var(--text-primary)]"
                            />
                            {!collapsed && (
                                <span className="text-sm font-medium transition-colors group-hover:text-[var(--text-primary)]">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div
                className="px-3 py-4 space-y-2"
                style={{ borderTop: "1px solid var(--border-primary)" }}
            >
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200 cursor-pointer ${collapsed ? "justify-center" : ""
                        }`}
                    style={{
                        color: "var(--text-secondary)",
                        backgroundColor: "transparent",
                        border: "none",
                    }}
                    title={collapsed ? (theme === "dark" ? "Light mode" : "Dark mode") : undefined}
                >
                    {theme === "dark" ? (
                        <Sun size={20} className="shrink-0" />
                    ) : (
                        <Moon size={20} className="shrink-0" />
                    )}
                    {!collapsed && (
                        <span className="text-sm font-medium">
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                    )}
                </button>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200 cursor-pointer ${collapsed ? "justify-center" : ""
                        }`}
                    style={{
                        color: "var(--text-tertiary)",
                        backgroundColor: "transparent",
                        border: "none",
                    }}
                >
                    {collapsed ? (
                        <ChevronRight size={20} className="shrink-0" />
                    ) : (
                        <>
                            <ChevronLeft size={20} className="shrink-0" />
                            <span className="text-sm font-medium">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
