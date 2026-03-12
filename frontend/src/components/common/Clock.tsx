"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Clock() {
    const [time, setTime] = useState<Date | null>(null);
    const t = useTranslations('Navbar'); // Using Navbar namespace or layout for shared bits

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return null;

    return (
        <div className="flex flex-col items-end px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs font-bold text-white font-mono leading-none">
                {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-tighter text-slate-500 mt-0.5">
                Local Time (GMT-3)
            </span>
        </div>
    );
}
