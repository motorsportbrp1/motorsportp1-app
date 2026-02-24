import { create } from 'zustand';

interface AppState {
    // Global Application State
    theme: 'dark' | 'light' | 'system';
    selectedSeason: number;
    sidebarCollapsed: boolean;

    // Actions
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
    setSelectedSeason: (year: number) => void;
    toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    theme: 'system', // the ThemeProvider handles actual DOM classes, this is just state
    selectedSeason: 2024,
    sidebarCollapsed: false,

    setTheme: (theme) => set({ theme }),
    setSelectedSeason: (selectedSeason) => set({ selectedSeason }),
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
