"use client";

import { Search, Bell } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <header
            className="sticky top-0 z-30 h-16 flex items-center justify-between px-6"
            style={{
                backgroundColor: "var(--bg-secondary)",
                borderBottom: "1px solid var(--border-primary)",
                backdropFilter: "blur(12px)",
            }}
        >
            {/* Breadcrumb / Page title area */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                    <span
                        className="text-xs uppercase tracking-wider font-medium"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        2024 Season
                    </span>
                    <span style={{ color: "var(--text-tertiary)" }}>/</span>
                    <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Dashboard
                    </span>
                </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                    {searchOpen ? (
                        <input
                            type="text"
                            placeholder="Search drivers, circuits, sessions..."
                            className="w-64 h-9 pl-9 pr-3 rounded-lg text-sm outline-none transition-all duration-200 animate-fade-in"
                            style={{
                                backgroundColor: "var(--bg-tertiary)",
                                border: "1px solid var(--border-secondary)",
                                color: "var(--text-primary)",
                            }}
                            onBlur={() => setSearchOpen(false)}
                            autoFocus
                        />
                    ) : null}
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200"
                        style={{
                            backgroundColor: searchOpen ? "transparent" : "var(--bg-tertiary)",
                            border: "none",
                            color: "var(--text-secondary)",
                            position: searchOpen ? "absolute" : "relative",
                            left: searchOpen ? "6px" : undefined,
                            top: searchOpen ? "50%" : undefined,
                            transform: searchOpen ? "translateY(-50%)" : undefined,
                        }}
                    >
                        <Search size={16} />
                    </button>
                </div>

                {/* Notifications */}
                <button
                    className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200 relative"
                    style={{
                        backgroundColor: "var(--bg-tertiary)",
                        border: "none",
                        color: "var(--text-secondary)",
                    }}
                >
                    <Bell size={16} />
                    <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: "var(--f1-red)" }}
                    />
                </button>

                {/* Session Status Badge */}
                <div
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{
                        backgroundColor: "rgba(0, 210, 106, 0.1)",
                        border: "1px solid rgba(0, 210, 106, 0.3)",
                    }}
                >
                    <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: "var(--accent-green)" }}
                    />
                    <span
                        className="text-xs font-medium"
                        style={{ color: "var(--accent-green)" }}
                    >
                        No Active Session
                    </span>
                </div>
            </div>
        </header>
    );
}
