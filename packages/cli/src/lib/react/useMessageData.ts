import { UIMessage } from 'ai';
import { useEffect, useState } from 'react';
import { DataState, DeepPartial } from '../types';
import { StateTypes } from '@build-ai/core';

export function getData<T>(
    message: UIMessage | undefined,
    type: StateTypes,
): T | undefined {
    if (message?.role === 'assistant') {
        const part = message.parts.find((part) => part.type === `data-${type}`);
        if (part && 'data' in part) {
            const data = part.data as {
                data: T;
                state?: DataState;
            };
            return data.data;
        }
    }
}

export function useMessageData<T>(
    message: UIMessage,
    type: StateTypes,
): { data: DeepPartial<T> | undefined; state: DataState | undefined } {
    const [data, setData] = useState<DeepPartial<T>>();
    const [state, setState] = useState<DataState>();

    useEffect(() => {
        if (message.role === 'assistant') {
            const part = message.parts.find(
                (part) => part.type === `data-${type}`,
            );
            if (part && 'data' in part) {
                const data = part.data as {
                    data: unknown;
                    state?: DataState;
                };
                setData(data.data as DeepPartial<T>);
                setState(data.state);
            }
        }
    }, [message]);

    return { data, state };
}
