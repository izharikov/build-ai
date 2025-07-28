import { useEffect, useState } from 'react';

export function useCommand(onCommand: (command: string) => Promise<void>) {
    const [command, setCommand] = useState<string>();
    const [status, setStatus] = useState<'success' | 'error'>();
    useEffect(() => {
        if (command) {
            onCommand(command)
                .then(() => setStatus('success'))
                .catch(() => setStatus('error'))
                .finally(() => setCommand(undefined));
        }
    }, [command, onCommand]);
    return { command, setCommand, status };
}
