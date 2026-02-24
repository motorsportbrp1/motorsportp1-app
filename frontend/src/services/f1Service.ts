import api from './api';

// --- Types (to be moved to types/index.ts eventually) ---
export interface Season {
    year: number;
    url: string;
}

export interface Driver {
    driverId: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
}

/**
 * F1 Service
 * 
 * This service handles all HTTP requests to the FastAPI backend.
 * Replacing the direct mock-data imports in the UI components.
 */
export const f1Service = {
    // --- Championships & Schedule ---

    async getSeasons(): Promise<Season[]> {
        return api.get('/seasons');
    },

    async getSchedule(year: number | 'current') {
        return api.get(`/schedule?year=${year}`);
    },

    // --- Drivers & Teams ---

    async getDrivers(year?: number) {
        const url = year ? `/drivers?year=${year}` : '/drivers';
        return api.get(url);
    },

    async getDriverById(driverId: string) {
        return api.get(`/drivers/${driverId}`);
    },

    async getConstructors(year?: number) {
        const url = year ? `/constructors?year=${year}` : '/constructors';
        return api.get(url);
    },

    // --- Job Polling ---

    async pollJob<T>(jobId: string, intervalMs = 2000): Promise<T> {
        return new Promise((resolve, reject) => {
            const timer = setInterval(async () => {
                try {
                    // Make sure our axios instance handles JSON normally
                    const res: any = await api.get(`/jobs/${jobId}`);
                    if (res.status === 'completed') {
                        clearInterval(timer);
                        resolve(res.result as T);
                    } else if (res.status === 'failed') {
                        clearInterval(timer);
                        reject(new Error(res.error || 'Background Job failed'));
                    }
                } catch (error) {
                    clearInterval(timer);
                    reject(error);
                }
            }, intervalMs);
        });
    },

    // --- Session Analytics (FastF1 Data) ---

    async getSessionLaps(year: number, round: number, sessionName: string) {
        // Start the background job
        const job: any = await api.post(`/sessions/${year}/${round}/${sessionName}/laps/job`);
        // Wait for it to finish gracefully
        return this.pollJob(job.job_id);
    },

    async getTelemetry(year: number, round: number, sessionName: string, driverId: string) {
        // Start the background job
        const job: any = await api.post(`/telemetry/${year}/${round}/${sessionName}/${driverId}/job`);
        return this.pollJob(job.job_id);
    },

    async getCompareTelemetry(year: number, round: number, sessionName: string, driver1: string, driver2: string) {
        // Start the background job
        const job: any = await api.post(`/telemetry/${year}/${round}/${sessionName}/compare/job?driver1=${driver1}&driver2=${driver2}`);
        return this.pollJob(job.job_id);
    }
};
