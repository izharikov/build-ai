import { useLoad } from '@/lib/react/useLoad';
import { Option, Select, Spinner } from '@inkjs/ui';
import { LayoutResult } from '@page-builder/core/processors';
import { Storage } from '@page-builder/core/storage';
import { useState } from 'react';
import { LayoutPreview } from './message/layout-preview';
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
                    label: `${x!.title} [${x!.id}]`,
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

    const [command, setCommand] = useState<{ name: string; args: string[] }>();

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
                            <LayoutPreview
                                layout={layout}
                                id={pageId}
                                onCommand={(name, args) =>
                                    setCommand({ name, args })
                                }
                            />
                            {command && command.name === 'chat' && (
                                <Chat
                                    transport={transport}
                                    originalMessages={[
                                        {
                                            id: 'internal',
                                            role: 'assistant',
                                            parts: [
                                                {
                                                    type: 'data-fetch',
                                                    data: {
                                                        data: command.args[0],
                                                    },
                                                },
                                            ],
                                        },
                                    ]}
                                    setError={setError}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
}
