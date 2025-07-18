import { TextInput } from '@inkjs/ui';
import { useApp, useInput } from 'ink';
import { useState } from 'react';

export function InputMessage({
    placeholder = 'Type your message here... [q to quit]',
    sendMessage,
}: {
    placeholder?: string;
    sendMessage: (message: { text: string }) => void;
}) {
    const [input, setInput] = useState('');

    const { exit } = useApp();
    useInput((input) => {
        if (input === 'q') {
            exit();
        }
    });
    return (
        <TextInput
            placeholder={placeholder}
            onSubmit={() => sendMessage({ text: input })}
            onChange={setInput}
        />
    );
}
