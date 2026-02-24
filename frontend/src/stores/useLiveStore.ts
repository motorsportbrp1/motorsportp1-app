import { create } from 'zustand';

// Temporary type, to be moved to types/index.ts
interface LiveDriverData {
    driverId: string;
    position: number;
    gapToLeader: string;
    lastLapTime: string;
    sectors: string[];
    tyre: string;
    isPit: boolean;
}

interface LiveState {
    isConnected: boolean;
    sessionStatus: 'Red' | 'Green' | 'Yellow' | 'Finished' | 'Waiting';
    lapInfo: {
        currentLap: number;
        totalLaps: number;
    };
    leaderboard: LiveDriverData[];

    // Actions
    setConnectionStatus: (status: boolean) => void;
    updateLeaderboard: (data: LiveDriverData[]) => void;
    updateSessionStatus: (status: LiveState['sessionStatus']) => void;
}

export const useLiveStore = create<LiveState>((set) => ({
    isConnected: false,
    sessionStatus: 'Waiting',
    lapInfo: { currentLap: 0, totalLaps: 0 },
    leaderboard: [],

    setConnectionStatus: (isConnected) => set({ isConnected }),
    updateLeaderboard: (leaderboard) => set({ leaderboard }),
    updateSessionStatus: (sessionStatus) => set({ sessionStatus }),
}));
