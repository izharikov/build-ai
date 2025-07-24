import { UIMessage } from 'ai';
import { useEffect, useState } from 'react';
import { DataState, DeepPartial } from '../types';

export function useMessageData<T>(
    message: UIMessage,
    type: string,
    // id?: string,
): { data: DeepPartial<T> | undefined; state: DataState | undefined } {
    const [data, setData] = useState<DeepPartial<T>>();
    const [state, setState] = useState<DataState>();

    useEffect(() => {
        if (message.role === 'assistant') {
            const part = message.parts.find(
                (part) => part.type === `data-${type}`,
            );
            if (part && 'data' in part) {
                const data = part.data as { data: unknown; state?: DataState };
                setData(data.data as DeepPartial<T>);
                setState(data.state);
            }
        }
    }, [message]);

    return { data, state };
}
