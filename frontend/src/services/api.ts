import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create a configured Axios instance
const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const remoteFallbackUrl = 'https://motorsport-backend.onrender.com/api/v1';
const formatBaseUrl = (url: string) => (
    url.endsWith('/api/v1')
        ? url
        : `${url.endsWith('/') ? url.slice(0, -1) : url}/api/v1`
);

const formattedBaseUrl = formatBaseUrl(envUrl);
const localFallbackBaseUrl = formatBaseUrl('http://localhost:8000');
const hostedFallbackBaseUrl = formatBaseUrl(remoteFallbackUrl);
const isLocalDevHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const buildCandidateBaseUrls = () => {
    const urls = isLocalDevHost
        ? [localFallbackBaseUrl, formattedBaseUrl, hostedFallbackBaseUrl]
        : [formattedBaseUrl, hostedFallbackBaseUrl];

    return Array.from(new Set(urls.filter(Boolean)));
};

const candidateBaseUrls = buildCandidateBaseUrls();

interface RetryableAxiosConfig extends InternalAxiosRequestConfig {
    _baseUrlAttemptIndex?: number;
}

const api = axios.create({
    baseURL: candidateBaseUrls[0],
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        // We can add auth tokens here later
        const retryableConfig = config as RetryableAxiosConfig;
        if (retryableConfig._baseUrlAttemptIndex == null) {
            retryableConfig._baseUrlAttemptIndex = 0;
        }
        config.baseURL = candidateBaseUrls[retryableConfig._baseUrlAttemptIndex] || candidateBaseUrls[0];
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error: AxiosError) => {
        const config = error.config as RetryableAxiosConfig | undefined;
        const currentAttempt = config?._baseUrlAttemptIndex ?? 0;
        const nextAttempt = currentAttempt + 1;
        const canRetryWithNextBaseUrl =
            config &&
            nextAttempt < candidateBaseUrls.length &&
            (
                !error.response ||
                error.response.status === 404 ||
                error.response.status >= 500
            );

        if (canRetryWithNextBaseUrl) {
            config._baseUrlAttemptIndex = nextAttempt;
            config.baseURL = candidateBaseUrls[nextAttempt];
            return api.request(config);
        }

        // Global error handling
        if (error.response) {
            console.error('API Error Response:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('API No Response:', error.request);
        } else {
            console.error('API Error Setup:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
