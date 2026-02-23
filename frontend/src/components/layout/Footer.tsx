export default function Footer() {
    return (
        <footer className="mt-8 py-8 px-6" style={{ borderTop: "1px solid var(--surface-lighter)", background: "var(--surface)" }}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ color: "#475569" }}>flag</span>
                    <span className="font-bold tracking-tight text-sm" style={{ color: "#64748b" }}>F1 INSIGHT ENGINE</span>
                </div>
                <div className="flex gap-6 text-xs font-medium uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                    <a className="hover:text-white transition-colors" href="#">Política de Privacidade</a>
                    <a className="hover:text-white transition-colors" href="#">Termos de Uso</a>
                    <a className="hover:text-white transition-colors" href="#">Configurações de Cookie</a>
                </div>
                <div className="text-xs" style={{ color: "#475569" }}>
                    © 2024 F1 Insight. Aplicação Não-Oficial.
                </div>
            </div>
        </footer>
    );
}
