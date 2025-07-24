import { useChat } from '@ai-sdk/react';
import { ChooseStepResponse } from '@page-builder/core';
import { InputMessage, Message } from './message';
import { Box, Text } from 'ink';
import { ChatTransport, UIMessage } from 'ai';
import { useState } from 'react';
import { Spinner } from '@inkjs/ui';

export function Chat<UI_MESSAGE extends UIMessage>({
    transport,
    originalMessages = [],
    setError,
}: {
    transport: ChatTransport<UI_MESSAGE>;
    originalMessages?: UI_MESSAGE[];
    setError: (error: string) => void;
}) {
    const {
        messages,
        sendMessage,
        status: chatStatus,
    } = useChat({
        transport,
        messages: originalMessages,
        onError: (error) => {
            console.error('Error:', error);
            setError(error.message);
        },
    });

    const [flowState, setFlowState] = useState<ChooseStepResponse['step']>();

    const showSpinner = chatStatus !== 'ready' && chatStatus !== 'error';

    return (
        <>
            {messages.map((message) => (
                <Message
                    key={message.id}
                    message={message}
                    setFlowState={(s) =>
                        setFlowState(s as ChooseStepResponse['step'])
                    }
                />
            ))}
            <Box>{showSpinner && <Spinner label={chatStatus} />}</Box>
            {chatStatus === 'ready' && (
                <>
                    {flowState !== 'generate' && (
                        <InputMessage sendMessage={sendMessage} />
                    )}
                    {flowState === 'generate' && (
                        <>
                            <Text color="green">
                                Page generated successfully!
                            </Text>
                            <InputMessage
                                sendMessage={() => {}}
                                placeholder="type / to choose command"
                                commands={[
                                    {
                                        name: 'edit',
                                        description: 'Edit the page',
                                    },
                                    {
                                        name: 'save',
                                        description: 'Save the page',
                                    },
                                    {
                                        name: 'exit',
                                        description: 'Exit',
                                        confirmation: true,
                                    },
                                ]}
                            />
                        </>
                    )}
                </>
            )}
            {chatStatus === 'error' && (
                <InputMessage
                    sendMessage={() => {}}
                    placeholder="Error occurred. Please try again."
                />
            )}
        </>
    );
}
