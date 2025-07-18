import { UIMessage } from 'ai';
import { useEffect, useState } from 'react';

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export function useMessageData<T>(
    message: UIMessage,
    type: string,
    // id?: string,
): DeepPartial<T> | undefined {
    const [data, setData] = useState<DeepPartial<T>>();

    useEffect(() => {
        if (message.role === 'assistant') {
            const part = message.parts.find(
                (part) => part.type === `data-${type}`,
            );
            if (part && 'data' in part) {
                const data = part.data as { data: unknown };
                setData(data.data as DeepPartial<T>);
            }
        }
    }, [message]);

    return data;
}
