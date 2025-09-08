import { useLoad } from '@/lib/react/useLoad';
import { Option, Select, Spinner } from '@inkjs/ui';
import { LayoutResult } from '@build-ai/core/processors';
import { Storage } from '@build-ai/core/storage';
import { useState } from 'react';
import { Chat } from './chat';
import { ChatTransport, UIMessage } from 'ai';
import { Text } from 'ink';

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
    transport,
}: {
    storage: Storage<LayoutResult>;
    setError: (error: string) => void;
    transport: ChatTransport<UIMessage>;
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
                    label: `[${x!.id}] '${x!.title}' -> ${x?.state}`,
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
            {options.length === 0 && <Text>No pages found</Text>}
            {!pageId && options.length > 0 && (
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
                            <Chat
                                transport={transport}
                                originalMessages={[
                                    {
                                        id: 'internal',
                                        role: 'assistant',
                                        parts: [
                                            {
                                                type: 'data-layout',
                                                data: {
                                                    data: layout,
                                                },
                                            },
                                            {
                                                type: 'text',
                                                text: `Type your message to view or edit the layout:`,
                                            },
                                        ],
                                    },
                                ]}
                                setError={setError}
                            />
                        </>
                    )}
                </>
            )}
        </>
    );
}
