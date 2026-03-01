"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <div className="relative inline-block text-left mr-4">
            <select
                defaultValue={locale}
                onChange={handleLanguageChange}
                disabled={isPending}
                className="appearance-none bg-transparent hover:text-white transition-colors text-sm font-medium tracking-wide cursor-pointer focus:outline-none pr-4"
                style={{ color: "#94a3b8" }}
            >
                <option value="pt-BR" className="bg-slate-800 text-white">PT</option>
                <option value="en" className="bg-slate-800 text-white">EN</option>
                <option value="es" className="bg-slate-800 text-white">ES</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-[-4px] flex items-center px-1 text-slate-400">
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
            </div>
        </div>
    );
}
