import { useEffect, useState } from 'react';

export function useLoad<TResult, TArgs>(
    load: (args: TArgs[]) => Promise<TResult>,
    args: TArgs[] = [],
    argSetError?: (error: string) => void,
) {
    const [data, setData] = useState<TResult>();
    const [loading, setLoading] = useState<'loading' | 'done' | 'error'>(
        'loading',
    );
    const [error, setError] = useState<Error>();
    useEffect(() => {
        if (argSetError && error) {
            console.error('Error:', error);
            argSetError((error as Error)?.message || 'An error occurred');
        }
    }, [argSetError, error]);

    useEffect(() => {
        load(args)
            .then((data) => {
                setData(data);
                setLoading('done');
            })
            .catch((error) => {
                console.error('Error loading data:', error);
                setError(error);
                setLoading('error');
            });
    }, [...args]);

    return { data, loading, error };
}
