import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import { Spinner, Alert } from '@inkjs/ui';
import dotenv from 'dotenv';
import { useChat } from '@ai-sdk/react';
import { StreamChatTransport } from './lib/StreamChatTransport';

import findConfig from 'find-config';

import { sitecorePageStream } from './config';
import { InputMessage, Message } from './components/message';

dotenv.config({ path: findConfig('.env') ?? undefined });

const transport = new StreamChatTransport(sitecorePageStream);

const PageBuilder = () => {
    const [error, setError] = useState<string>();

    const { messages, sendMessage, status } = useChat({
        transport,
        onError: (error) => {
            console.error('Error:', error);
            setError(error.message);
        },
    });

    const showSpinner = status !== 'ready' && status !== 'error';

    return (
        <Box flexDirection="column" padding={1}>
            <Box>
                <Text color="cyanBright">Page Builder CLI</Text>
            </Box>
            <Box>{error && <Alert variant="error">{error}</Alert>}</Box>
            {messages.map((message) => (
                <Message key={message.id} message={message} />
            ))}
            <Box>{showSpinner && <Spinner label={status} />}</Box>
            {status === 'ready' && <InputMessage sendMessage={sendMessage} />}
            {status === 'error' && (
                <InputMessage
                    sendMessage={() => {}}
                    placeholder="Error occurred. Please try again."
                />
            )}
        </Box>
    );
};

render(<PageBuilder />);
