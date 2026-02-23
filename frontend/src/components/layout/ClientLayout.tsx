"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ThemeProvider } from "./ThemeProvider";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed] = useState(false);

    return (
        <ThemeProvider>
            <div className="flex min-h-screen">
                <Sidebar />
                <div
                    className="flex flex-col flex-1 transition-all duration-300"
                    style={{
                        marginLeft: sidebarCollapsed
                            ? "var(--sidebar-collapsed)"
                            : "var(--sidebar-width)",
                    }}
                >
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </div>
            </div>
        </ThemeProvider>
    );
}
