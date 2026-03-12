import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className="mt-8 py-8 px-6" style={{ borderTop: "1px solid var(--surface-lighter)", background: "var(--surface)" }}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ color: "#475569" }}>flag</span>
                    <span className="font-bold tracking-tight text-sm" style={{ color: "#64748b" }}>{t('engineTitle')}</span>
                </div>
                <div className="flex gap-6 text-xs font-medium uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                    <a className="hover:text-white transition-colors" href="#">{t('privacy')}</a>
                    <a className="hover:text-white transition-colors" href="#">{t('terms')}</a>
                    <a className="hover:text-white transition-colors" href="#">{t('cookies')}</a>
                </div>
                <div className="text-xs" style={{ color: "#475569" }}>
                    {t('copyright')}
                </div>
            </div>
        </footer>
    );
}
