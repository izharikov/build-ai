import { useLoad } from '@/lib/react/useLoad';
import { Option, Select, Spinner } from '@inkjs/ui';
import { LayoutResult } from '@page-builder/core/processors';
import { Storage } from '@page-builder/core/storage';
import { useState } from 'react';
import { LayoutPreview } from './message/layout-preview';

function LoadingSpinner({
    loading,
    label,
}: {
    loading: 'loading' | 'done' | 'error';
    label: string;
}) {
    return <>{loading === 'loading' && <Spinner label={label} />}</>;
}

export function ListPages({
    storage,
    setError,
}: {
    storage: Storage<LayoutResult>;
    setError: (error: string) => void;
}) {
    const { data, loading } = useLoad(
        async () => {
            return storage.getAll();
        },
        [],
        setError,
    );

    const options: Option[] =
        (data &&
            data.length > 0 &&
            data
                .filter((x) => x)
                .map((x) => ({
                    label: x!.title,
                    value: x!.id || '',
                }))) ||
        [];

    const [pageId, setPageId] = useState<string>();

    const { data: layout, loading: layoutLoading } = useLoad(
        async ([layoutId]) => {
            if (!layoutId) {
                return undefined;
            }
            return await storage.get(layoutId);
        },
        [pageId],
        setError,
    );

    return (
        <>
            <LoadingSpinner loading={loading} label="Loading..." />
            {!pageId && (
                <Select
                    options={options}
                    onChange={(x) => setPageId(x)}
                ></Select>
            )}
            {pageId && (
                <>
                    <LoadingSpinner
                        loading={layoutLoading}
                        label="Loading layout..."
                    />
                    {layoutLoading === 'done' && layout && (
                        <>
                            <LayoutPreview layout={layout} />
                        </>
                    )}
                </>
            )}
        </>
    );
}
