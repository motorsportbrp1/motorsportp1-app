// ===========================
// MotorSport P1 — Utility Functions
// ===========================

import { TyreCompound } from "@/types";

/**
 * Get CSS color for a tyre compound
 */
export function getCompoundColor(compound: TyreCompound): string {
    const colors: Record<TyreCompound, string> = {
        SOFT: "var(--tyre-soft)",
        MEDIUM: "var(--tyre-medium)",
        HARD: "var(--tyre-hard)",
        INTERMEDIATE: "var(--tyre-intermediate)",
        WET: "var(--tyre-wet)",
    };
    return colors[compound] || "var(--text-tertiary)";
}

/**
 * Get a shortened compound name
 */
export function getCompoundShort(compound: TyreCompound): string {
    const shorts: Record<TyreCompound, string> = {
        SOFT: "S",
        MEDIUM: "M",
        HARD: "H",
        INTERMEDIATE: "I",
        WET: "W",
    };
    return shorts[compound] || "?";
}

/**
 * Format a countdown to a date
 */
export function getCountdown(targetDate: string): {
    days: number;
    hours: number;
    minutes: number;
    label: string;
} {
    const target = new Date(targetDate);
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, label: "Completed" };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, label: `${days}d ${hours}h ${minutes}m` };
}

/**
 * Get country flag emoji from country name
 */
export function getCountryFlag(country: string): string {
    const flags: Record<string, string> = {
        Bahrain: "🇧🇭",
        "Saudi Arabia": "🇸🇦",
        Australia: "🇦🇺",
        Japan: "🇯🇵",
        China: "🇨🇳",
        "United States": "🇺🇸",
        USA: "🇺🇸",
        Italy: "🇮🇹",
        Monaco: "🇲🇨",
        Canada: "🇨🇦",
        Spain: "🇪🇸",
        Austria: "🇦🇹",
        "Great Britain": "🇬🇧",
        UK: "🇬🇧",
        Hungary: "🇭🇺",
        Belgium: "🇧🇪",
        Netherlands: "🇳🇱",
        Singapore: "🇸🇬",
        Azerbaijan: "🇦🇿",
        Mexico: "🇲🇽",
        Brazil: "🇧🇷",
        "Las Vegas": "🇺🇸",
        Qatar: "🇶🇦",
        "Abu Dhabi": "🇦🇪",
        UAE: "🇦🇪",
        Miami: "🇺🇸",
        Emilia: "🇮🇹",
    };
    return flags[country] || "🏁";
}

/**
 * Get country flag image URL from F1DB country ID
 */
export function getCountryFlagUrl(countryId: string | null | undefined): string {
    if (!countryId) return "https://upload.wikimedia.org/wikipedia/commons/b/b0/No_flag.svg";

    const normalizedId = countryId.toLowerCase().trim();

    // Some local overrides the user prefers, plus standard ISO alpha-2 mapping for FlagCDN
    const flags: Record<string, string> = {
        "italy": "https://flagcdn.com/it.svg",
        "austria": "https://flagcdn.com/at.svg",
        "united-states-of-america": "https://flagcdn.com/us.svg",
        "spain": "https://flagcdn.com/es.svg",
        "united-kingdom": "https://flagcdn.com/gb.svg",
        "germany": "https://flagcdn.com/de.svg",
        "france": "https://flagcdn.com/fr.svg",
        "switzerland": "https://flagcdn.com/ch.svg",
        "japan": "https://flagcdn.com/jp.svg",
        "new-zealand": "https://flagcdn.com/nz.svg",
        "south-africa": "https://flagcdn.com/za.svg",
        "brazil": "https://flagcdn.com/br.svg",
        "canada": "https://flagcdn.com/ca.svg",
        "ireland": "https://flagcdn.com/ie.svg",
        "mexico": "https://flagcdn.com/mx.svg",
        "hong-kong": "https://flagcdn.com/hk.svg",
        "netherlands": "https://flagcdn.com/nl.svg",
        "india": "https://flagcdn.com/in.svg",
        "malaysia": "https://flagcdn.com/my.svg",
        "belgium": "https://flagcdn.com/be.svg",
        "russia": "https://flagcdn.com/ru.svg",
        "australia": "https://flagcdn.com/au.svg",
        "argentina": "https://flagcdn.com/ar.svg",
        "colombia": "https://flagcdn.com/co.svg",
        "portugal": "https://flagcdn.com/pt.svg",
        "monaco": "https://flagcdn.com/mc.svg",
        "finland": "https://flagcdn.com/fi.svg",
        "sweden": "https://flagcdn.com/se.svg",

        // F1 2024/2025 Calendar additions
        "bahrain": "https://flagcdn.com/bh.svg",
        "saudi-arabia": "https://flagcdn.com/sa.svg",
        "china": "https://flagcdn.com/cn.svg",
        "hungary": "https://flagcdn.com/hu.svg",
        "azerbaijan": "https://flagcdn.com/az.svg",
        "singapore": "https://flagcdn.com/sg.svg",
        "qatar": "https://flagcdn.com/qa.svg",
        "united-arab-emirates": "https://flagcdn.com/ae.svg",
        "saudi arabia": "https://flagcdn.com/sa.svg",
        "great-britain": "https://flagcdn.com/gb.svg",
        "great britain": "https://flagcdn.com/gb.svg",
        "uae": "https://flagcdn.com/ae.svg",
    };

    return flags[normalizedId] || "https://upload.wikimedia.org/wikipedia/commons/b/b0/No_flag.svg";
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate a deterministic color from a string
 */
export function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Get Team Logo URL from Supabase Storage
 */
export function getTeamLogoUrl(constructorId: string, year?: number): string {
    if (!constructorId) return "";

    const id = constructorId.toLowerCase();

    // Mapeamento dos nomes de arquivo exatos salvos no Supabase Storage
    const logoFiles: Record<string, { folder: string, filename: string } | ((y: number) => { folder: string, filename: string })> = {
        ferrari: { folder: 'ferrari', filename: 'logo-ferrari-f1-2021.png' },
        mclaren: { folder: 'mclaren', filename: 'logo-mclaren-f1-2021.png' },
        mercedes: { folder: 'mercedes', filename: 'logo.webp' },
        red_bull: { folder: 'redbull', filename: 'logo-red-bull-f1-2026.png' },
        'red-bull': { folder: 'redbull', filename: 'logo-red-bull-f1-2026.png' },
        aston_martin: { folder: 'aston_martin', filename: 'logo-ston-martin-2026.png' },
        'aston-martin': { folder: 'aston_martin', filename: 'logo-ston-martin-2026.png' },
        alpine: { folder: 'alpine', filename: 'logo-alpine-f1-2021.png' },
        williams: { folder: 'williams', filename: 'logo-williams-f1-2026.png' },
        rb: { folder: 'racingbulls', filename: 'visa-rb-soymotor.2024.png' },
        'racing-bulls': { folder: 'racingbulls', filename: 'visa-rb-soymotor.2024.png' },
        haas: { folder: 'haas', filename: 'logo.svg' },
        'haas-f1-team': { folder: 'haas', filename: 'logo.svg' },
        sauber: { folder: 'sauber', filename: 'logo.webp' },
        'kick-sauber': { folder: 'sauber', filename: 'logo.webp' },
        audi: { folder: 'audi', filename: 'logo-audi-f1-2026.png' },
        cadillac: { folder: 'cadillac', filename: 'logo-cadillac-f1-2026.png' },
        lotus: { folder: 'lotusf1team', filename: 'Lotus_F1_Team_logo.svg' },
        team_lotus: { folder: 'lotusf1team', filename: 'Lotus_F1_Team_logo.svg' },
        brabham: { folder: 'brabham', filename: 'logo-brabham.jfif' },
        brawn: { folder: 'brawngp', filename: '2009.png' },
        // Dynamic historical logo mappings based on year
        renault: (y) => {
            if (y === 2004) return { folder: 'renault', filename: '2004.png' };
            if (y === 2005) return { folder: 'renault', filename: '2005.png' };
            if (y === 2006) return { folder: 'renault', filename: '2006.png' };
            if (y === 2007) return { folder: 'renault', filename: '2007.png' };
            if (y === 2008) return { folder: 'renault', filename: '2008.png' };
            return { folder: 'renault', filename: '2016.webp' };
        }
    };

    const mapping = logoFiles[id];

    if (mapping) {
        if (typeof mapping === 'function') {
            const result = mapping(year || new Date().getFullYear());
            return getMediaUrl('teams', result.folder, result.filename);
        } else {
            return getMediaUrl('teams', mapping.folder, mapping.filename);
        }
    }

    // Fallback generico
    return getMediaUrl('teams', id, 'logo.png');
}

/**
 * Get Car Image URL from Supabase Storage
 */
export function getCarImageUrl(constructorId: string, year: number | string): string {
    if (!constructorId) return "";
    return getMediaUrl('cars', constructorId, `${year}.webp`);
}


export function getDriverImageUrl(driverId: string, fallbackYear?: number): string {
    if (!driverId) return "";

    const normalizedId = driverId.toLowerCase().replace(/_/g, '-');
    const year = fallbackYear || new Date().getFullYear();

    // Specific logic for drivers with multiple known years
    const specialAssets: Record<string, number[]> = {
        "fernando-alonso": [2005, 2006, 2022, 2026],
        "lewis-hamilton": [2022, 2025, 2026],
        "max-verstappen": [2025, 2026],
        "michael-schumacher": [2006, 2012],
        "ayrton-senna": [1994],
        "alain-prost": [1993]
    };

    let filename = "2026.webp"; // Default

    if (specialAssets[normalizedId]) {
        const availableYears = specialAssets[normalizedId];
        // Find the closest year that is <= requested year
        const bestYear = availableYears.reduce((prev, curr) => {
            return (curr <= year) ? curr : prev;
        }, availableYears[0]);

        filename = `${bestYear}.webp`;

        // Edge case for Alonso 2006 (it's a .png according to list_dir)
        if (normalizedId === "fernando-alonso" && bestYear === 2006) filename = "2006.png";
    } else {
        // Generic fallback logic
        filename = `${Math.min(year, 2026)}.webp`;
    }

    return getMediaUrl('drivers', normalizedId, filename);
}

/**
 * Get Supabase Storage URL for dynamic media
 */
export function getMediaUrl(type: 'drivers' | 'cars' | 'teams' | 'tracks' | 'seasons-index-cards', id: string, filename: string): string {
    const backendUrl = "http://localhost:8000"; // Local media server

    let normalizedId = id.toLowerCase();

    if (type === 'drivers') {
        normalizedId = normalizedId.replace(/_/g, '-');
    } else if (type === 'cars') {
        if (normalizedId === 'red_bull' || normalizedId === 'red-bull') normalizedId = 'redbull';
        else if (normalizedId === 'rb' || normalizedId === 'racing_bulls' || normalizedId === 'racing-bulls') normalizedId = 'racingbulls';
    }

    return `${backendUrl}/media/${type}/${normalizedId}/${filename}`;
}
