"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Globe, ChevronDown } from "lucide-react";

const languages = [
    { code: "pt-BR", label: "PT", flagCode: "br", name: "Português" },
    { code: "en", label: "EN", flagCode: "gb", name: "English" },
    { code: "es", label: "ES", flagCode: "es", name: "Español" },
];

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeLanguage = languages.find(lang => lang.code === locale) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (nextLocale: string) => {
        setIsOpen(false);
        if (nextLocale === locale) return;

        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <div className="relative inline-block text-left mr-4" ref={dropdownRef}>
            <button
                type="button"
                className={`flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium focus:outline-none ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2">
                    <img
                        src={`https://flagcdn.com/w20/${activeLanguage.flagCode}.png`}
                        srcSet={`https://flagcdn.com/w40/${activeLanguage.flagCode}.png 2x`}
                        width="20"
                        alt={activeLanguage.name}
                        className="rounded-[2px]"
                    />
                    <span className="text-slate-200 hidden sm:inline-block">{activeLanguage.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-slate-800 border border-slate-700 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden py-1">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors hover:bg-slate-700
                                ${locale === lang.code ? 'bg-slate-700/50 text-white font-medium' : 'text-slate-300'}
                            `}
                        >
                            <img
                                src={`https://flagcdn.com/w20/${lang.flagCode}.png`}
                                srcSet={`https://flagcdn.com/w40/${lang.flagCode}.png 2x`}
                                width="20"
                                alt={lang.name}
                                className="rounded-[2px]"
                            />
                            <span className="flex-1">{lang.name}</span>
                            {locale === lang.code && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
