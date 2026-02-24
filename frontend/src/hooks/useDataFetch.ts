import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Custom hook for data fetching
 * Generic T defines the expected return type of the fetcher function.
 * 
 * @param fetcher A function that returns a Promise resolving to data of type T
 * @param dependencies Array of dependencies that trigger a re-fetch when changed
 * @param defer If true, the fetcher will not run automatically on mount
 */
export function useDataFetch<T>(
    fetcher: () => Promise<T>,
    dependencies: any[] = [],
    defer = false
) {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        isLoading: !defer,
        error: null,
    });

    const execute = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const result = await fetcher();
            setState({ data: result, isLoading: false, error: null });
            return result;
        } catch (error) {
            const e = error instanceof Error ? error : new Error(String(error));
            setState({ data: null, isLoading: false, error: e });
            throw e;
        }
    }, [fetcher]);

    useEffect(() => {
        if (!defer) {
            execute().catch(() => {
                // Error is handled in execute and saved to state
            });
        }
    }, [...dependencies, defer, execute]);

    return { ...state, execute };
}
