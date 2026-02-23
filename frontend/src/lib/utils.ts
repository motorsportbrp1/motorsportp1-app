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
        "italy": "/images/flags/it-2.svg",
        "austria": "/images/flags/at-2.svg",
        "united-states-of-america": "/images/flags/us-2.svg",
        "spain": "/images/flags/es-2.svg",
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
export function getTeamLogoUrl(constructorId: string): string {
    if (!constructorId) return "";

    // Mapeamento dos nomes de arquivo exatos salvos no Supabase Storage
    const logoFiles: Record<string, { folder: string, filename: string }> = {
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
        haas: { folder: 'haas', filename: 'logo.svg' },
        sauber: { folder: 'audi', filename: 'logo-audi-f1-2026.png' },
        audi: { folder: 'audi', filename: 'logo-audi-f1-2026.png' },
        cadillac: { folder: 'cadillac', filename: 'logo-cadillac-f1-2026.png' }
    };

    const id = constructorId.toLowerCase();
    const mapping = logoFiles[id];

    if (mapping) {
        return getMediaUrl('teams', mapping.folder, mapping.filename);
    }

    // Fallback generico
    return getMediaUrl('teams', id, 'logo.png');
}

/**
 * Get Car Image URL from Supabase Storage
 */
export function getCarImageUrl(constructorId: string, year: number | string): string {
    if (!constructorId) return "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpoiazqcfawbozfzweym.supabase.co";
    const normalizedId = constructorId.toLowerCase().replace(/_/g, '').replace(/ /g, '');
    return `${supabaseUrl}/storage/v1/object/public/f1-media/cars/${normalizedId}/${year}.webp`;
}


/**
 * Get Supabase Storage URL for dynamic media
 */
export function getMediaUrl(type: 'drivers' | 'cars' | 'teams' | 'tracks', id: string, filename: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpoiazqcfawbozfzweym.supabase.co";
    // Convert underscores to dashes for cars and drivers, since media buckets are usually formatted with dashes
    const normalizedId = (type === 'drivers' || type === 'cars') ? id.toLowerCase().replace(/_/g, '-') : id;
    return `${baseUrl}/storage/v1/object/public/f1-media/${type}/${normalizedId}/${filename}`;
}
