// ===========================
// MotorSport P1 — Utility Functions
// ===========================

import { TyreCompound } from "@/types";

/**
 * Get CSS color for a tyre compound
 */
function normalizeCompound(compound: TyreCompound | string): TyreCompound | "UNKNOWN" {
    const value = String(compound || "").trim().toUpperCase();

    if (value.includes("SOFT") || value === "S") return "SOFT";
    if (value.includes("MEDIUM") || value === "M") return "MEDIUM";
    if (value.includes("HARD") || value === "H") return "HARD";
    if (value.includes("INTER") || value === "I") return "INTERMEDIATE";
    if (value.includes("WET") || value === "W") return "WET";

    return "UNKNOWN";
}

export function getCompoundColor(compound: TyreCompound | string): string {
    const normalized = normalizeCompound(compound);
    const colors: Record<TyreCompound | "UNKNOWN", string> = {
        SOFT: "#e10600",
        MEDIUM: "#ffd000",
        HARD: "#f3f4f6",
        INTERMEDIATE: "#43b02a",
        WET: "#0067ad",
        UNKNOWN: "#6b7280",
    };
    return colors[normalized];
}

/**
 * Get a shortened compound name
 */
export function getCompoundShort(compound: TyreCompound | string): string {
    const normalized = normalizeCompound(compound);
    const shorts: Record<TyreCompound | "UNKNOWN", string> = {
        SOFT: "S",
        MEDIUM: "M",
        HARD: "H",
        INTERMEDIATE: "I",
        WET: "W",
        UNKNOWN: "?",
    };
    return shorts[normalized];
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
 * -------------------------------------------------------------
 * AQUI VOCÊ MODIFICA AS LOGOS DOS CONSTRUTORES (HOMEPAGE / CARD)
 * O código abaixo procura pela "logo.png" de cada equipe. 
 * Para atualizar a foto da equipe basta entrar na pasta:
 * backend/media/teams/{nome-da-equipe}/logo.png
 * -------------------------------------------------------------
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
        sauber: { folder: 'sauber', filename: '2025-kick-sauber.png' },
        'kick-sauber': { folder: 'sauber', filename: '2025-kick-sauber.png' },
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

    const normalizedId = constructorId.toLowerCase()
        .replace(/_/g, '')
        .replace(/-/g, '');

    const localCars: Record<string, Record<string, string>> = {
        "2026": {
            "audi": "2026audicarright.avif",
            "cadillac": "2026cadillaccarright.avif",
            "williams": "2026williamscarright.avif"
        },
        "2025": {
            "ferrari": "2025ferraricarright.avif"
        }
    };

    if (localCars[year?.toString()] && localCars[year?.toString()][normalizedId]) {
        return `/images/cars/${localCars[year?.toString()][normalizedId]}`;
    }

    return getMediaUrl('cars', constructorId, `${year}.webp`);
}


export function getDriverImageUrl(driverId: string, fallbackYear?: number): string {
    if (!driverId) return "";

    let normalizedId = driverId.toLowerCase().replace(/_/g, '-');

    // Map F1DB standard driverIds (usually last names) to specific folder names
    const aliasMap: Record<string, string> = {
        "tsunoda": "yuki-tsunoda",
        "albon": "alexander-albon",
        "lawson": "liam-lawson",
        "sainz": "carlos-sainz",
        "carlos-sainz-jr": "carlos-sainz",
        "hadjar": "isack-hadjar",
        "doohan": "jack-doohan",
        "ocon": "esteban-ocon",
        "russell": "george-russell",
        "antonelli": "kimi-antonelli",
        "bearman": "oliver-bearman",
        "colapinto": "franco-colapinto",
        "bortoleto": "gabriel-bortoleto",
        "stroll": "lance-stroll",
        "lindblad": "arvid-lindblad",
        "gasly": "pierre-gasly",
        "hulkenberg": "nico-hulkenberg",
        "norris": "lando-norris",
        "leclerc": "charles-leclerc",
        "alonso": "fernando-alonso",
        "magnussen": "kevin-magnussen",
        "bottas": "valtteri-bottas",
        "ricciardo": "daniel-ricciardo",
        "sargeant": "logan-sargeant",
        "zhou": "guanyu-zhou",
        "perez": "sergio-perez",
        "piastri": "oscar-piastri",
        "hamilton": "lewis-hamilton",
    };

    if (aliasMap[normalizedId]) {
        normalizedId = aliasMap[normalizedId];
    }

    const year = fallbackYear || new Date().getFullYear();

    // Specific logic for drivers with multiple known years
    const specialAssets: Record<string, number[]> = {
        "alain-prost": [1993],
        "alexander-albon": [2025],
        "arvid-lindblad": [2026],
        "ayrton-senna": [1994],
        "carlos-sainz": [2015, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "carlos-sainz-jr": [2015, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "charles-leclerc": [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "daniel-ricciardo": [2011, 2020, 2021, 2022, 2023],
        "emerson-fittipaldi": [1975],
        "esteban-ocon": [2022, 2023, 2026],
        "fernando-alonso": [2005, 2006, 2010, 2014, 2015, 2017, 2021, 2022, 2023, 2024, 2025, 2026],
        "franco-colapinto": [2025, 2026],
        "gabriel-bortoleto": [2025, 2026],
        "george-russell": [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "guanyu-zhou": [2023],
        "isack-hadjar": [2025, 2026],
        "jack-doohan": [2025],
        "juan-manuel-fangio": [1950],
        "kimi-antonelli": [2025, 2026],
        "kimi-raikkonen": [2007, 2015, 2016, 2019, 2020, 2021],
        "lance-stroll": [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "lando-norris": [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "lewis-hamilton": [2015, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "liam-lawson": [2026],
        "martin-brundle": [1996],
        "max-verstappen": [2015, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        "michael-schumacher": [2006, 2012],
        "michele-alboreto": [1986],
        "nico-hulkenberg": [2015, 2019, 2020, 2023, 2024, 2025, 2026],
        "nico-rosberg": [2016],
        "oliver-bearman": [2024, 2025],
        "oscar-piastri": [2026],
        "pierre-gasly": [2023],
        "sebastian-vettel": [2022],
        "sergio-perez": [2023],
        "stefan-johansson": [1986],
        "valtteri-bottas": [2023, 2024],
        "yuki-tsunoda": [2021, 2022, 2023, 2024, 2025],
        "zhou-guanyu": [2023]
    };

    let filename = "2026.webp"; // Default

    const localDrivers: Record<string, string> = {
        "franco-colapinto": "2026alpinefracol01right.avif",
        "pierre-gasly": "2026alpinepiegas01right.avif",
        "fernando-alonso": "2026astonmartinferalo01right.avif",
        "lance-stroll": "2026astonmartinlanstr01right.avif",
        "charles-leclerc": "2026ferrarichalec01right.avif",
        "lewis-hamilton": "2026ferrarilewham01right.avif",
        "lando-norris": "2026mclarenlannor01right.avif",
        "kimi-antonelli": "2026mercedesandant01right.avif",
        "max-verstappen": "2026redbullracingmaxver01right.avif",
        "alexander-albon": "2026williamsalealb01right.avif",
        "carlos-sainz": "2026williamscarsai01right.avif",
        "alain-prost": "alain-prost.jpg",
        "ayrton-senna": "ayrtons-senna.avif",
        "michael-schumacher": "michael-schumacher.png",
    };

    if (localDrivers[normalizedId] && (year >= 2026 || localDrivers[normalizedId].indexOf("2026") === -1)) {
        return `/images/drivers/${localDrivers[normalizedId]}`;
    }

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
export function getMediaUrl(type: 'drivers' | 'cars' | 'teams' | 'tracks' | 'seasons-index-cards' | 'circuit-layouts' | 'homepage', id: string, filename: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpoiazqcfawbozfzweym.supabase.co";

    // Modificado: Agora usando o Supabase sempre, mesmo em localhost (desenvolvimento) para você conseguir visualizar as imagens recém-upadas no Supabase.
    // Antes estava fallbacking para localhost:8000 se não estivesse em produção.
    const rootUrl = `${supabaseUrl}/storage/v1/object/public/f1-media`;

    // Adicionamos este parâmetro para quebrar o cache do navegador e do CDN do Supabase,
    // forçando a baixar a imagem mais recente que você substituiu mantendo o mesmo nome.
    const cacheBuster = "?v=1.1";

    let normalizedId = id.toLowerCase();

    if (type === 'drivers') {
        normalizedId = normalizedId.replace(/_/g, '-');
    } else if (type === 'cars') {
        if (normalizedId === 'red_bull' || normalizedId === 'red-bull') normalizedId = 'redbull';
        else if (normalizedId === 'rb' || normalizedId === 'racing_bulls' || normalizedId === 'racing-bulls') normalizedId = 'racingbulls';
    }

    if (type === 'circuit-layouts' || type === 'homepage') {
        return `${rootUrl}/${type}/${filename}${cacheBuster}`;
    }

    return `${rootUrl}/${type}/${normalizedId}/${filename}${cacheBuster}`;
}

/**
 * Get Season Card Background Image URL
 */
export function getSeasonCardImageUrl(year: number): string {
    const KNOWN_CARDS: Record<number, string> = {
        1950: "1950-season-farina.webp",
        1951: "1951-season-fangio.webp",
        1994: "1994-season-schumacher.webp",
        2003: "2003-season-schumacher.jpg",
        2004: "2004-season-schumacher.jpg",
        2005: "2005-season-alonso.jpg",
        2006: "2006-season-alonso.jpg",
        2007: "2007-season-raikkonen.jpg",
        2008: "2008-season-hamilton.webp",
        2009: "2009-season-button.webp",
        2010: "2010-season-vettel.jpg",
        2011: "2011-season-vettel.jpg",
        2012: "2012-season-vettel.jpg",
        2013: "2013-season-vettel.jpg",
        2014: "2014-season-hamilton.webp",
        2015: "2015-season-hamilton.webp",
        2016: "2016-season-rosberg.webp",
        2017: "2017-season-hamilton.jpg",
        2018: "2018-season-hamilton.jpg",
        2019: "2019-season-hamilton.webp",
        2020: "2020-season-hamilton.jpg",
        2021: "2021-season-verstappen.jpg",
        2022: "2022-season-verstappen.jpg",
        2023: "2023-season-verstappen.jpg",
        2024: "2024-season-verstappen.jpg",
        2025: "2025-season-norris.jpg",
    };

    if (KNOWN_CARDS[year]) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpoiazqcfawbozfzweym.supabase.co";

        const rootUrl = `${supabaseUrl}/storage/v1/object/public/f1-media`;
        const cacheBuster = "?v=1.1";
        return `${rootUrl}/seasons-index-cards/${KNOWN_CARDS[year]}${cacheBuster}`;
    }

    return "";
}

/**
 * Handle image loading errors by trying alternative file extensions (.webp -> .png -> .jpg -> .jpeg).
 * Use this in React: <img src={src} onError={handleImageFallback} />
 */
export function handleImageFallback(e: React.SyntheticEvent<HTMLImageElement, Event>) {
    const img = e.currentTarget;
    let currentSrc = img.src;

    // Remover cacheBuster para a checagem de extensões caso ele exista
    const cacheBuster = "?v=1.1";
    if (currentSrc.includes(cacheBuster)) {
        currentSrc = currentSrc.replace(cacheBuster, "");
    }

    // Prevent infinite loops if the fallback itself fails
    if (img.dataset.failed) return;

    if (currentSrc.includes('.webp')) {
        img.src = currentSrc.replace('.webp', '.png') + cacheBuster;
    } else if (currentSrc.includes('.png')) {
        img.src = currentSrc.replace('.png', '.jpg') + cacheBuster;
    } else if (currentSrc.includes('.jpg')) {
        img.src = currentSrc.replace('.jpg', '.jpeg') + cacheBuster;
    } else {
        // All known extensions failed, mark it to avoid looping
        img.dataset.failed = 'true';
        // Hide the broken image icon
        img.style.display = 'none';

        // Automatically reveal any hidden placeholder siblings (e.g. initials icons)
        if (img.nextElementSibling && img.nextElementSibling.classList.contains('hidden')) {
            img.nextElementSibling.classList.remove('hidden');
        }
    }
}

/**
 * Get Tire Image URL from Supabase Storage
 */
export function getTireImageUrl(compound: TyreCompound | string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpoiazqcfawbozfzweym.supabase.co";

    const rootUrl = `${supabaseUrl}/storage/v1/object/public/f1-media`;

    const normalized = normalizeCompound(compound);
    const c = normalized.toLowerCase();
    let filename = "pirelli-soft.png";
    if (c.includes("soft")) filename = "pirelli-soft.png";
    else if (c.includes("medium")) filename = "pirelli-medium.png";
    else if (c.includes("hard")) filename = "pirelli-hard.png";
    else if (c.includes("inter")) filename = "pirelli-inter.png";
    else if (c.includes("wet")) filename = "pirelli-wet.png";

    return `${rootUrl}/tires/${filename}?v=1.1`;
}
