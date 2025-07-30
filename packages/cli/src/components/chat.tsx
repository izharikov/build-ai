import { useChat } from '@ai-sdk/react';
import { InputMessage, Message } from './message';
import { ChatTransport, UIMessage } from 'ai';
import React, { useState } from 'react';
import { AgentMessage } from './message/agent';
import { Text } from 'ink';
import { getData } from '@/lib/react/useMessageData';

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
    const [layoutScrollEnabled, setLayoutScrollEnabled] = useState(true);

    const openLink = messages
        .map((x) => getData(x, 'layout'))
        .findLast((x) => x)?.['openLink'] as string | undefined;

    const expandEnabled = messages.some(
        (x) =>
            x.role === 'assistant' &&
            x.parts.some((y) => y.type === 'data-layout'),
    );

    const expandSteps = expandEnabled
        ? [
              {
                  name: 'ui_expand',
                  description: 'Expand the layout',
              },
          ]
        : [];

    const commands = [
        {
            name: 'save',
            description: 'Save the page',
            confirmation: true,
        },
        ...expandSteps,
        ...(openLink
            ? [
                  {
                      name: 'ui_open',
                      description: 'Open layout',
                  },
              ]
            : []),
    ];

    return (
        <>
            {messages.map((message, index) => {
                const uiCommand =
                    message.role === 'user' &&
                    message.parts[0].type === 'text' &&
                    message.parts[0].text.startsWith('/ui_');
                const command = uiCommand
                    ? (message.parts[0] as { text: string }).text.substring(4)
                    : '';
                const lastPageMsg = uiCommand
                    ? messages.findLast(
                          (x, i) =>
                              x.role === 'assistant' &&
                              i < index &&
                              x.parts.some((y) => y.type === 'data-layout'),
                      )
                    : undefined;
                const streaming =
                    chatStatus === 'streaming' && index === messages.length - 1;
                return (
                    <React.Fragment key={message.id}>
                        <Message message={message} streaming={streaming} />
                        {uiCommand && (
                            <>
                                {command === 'expand' && lastPageMsg && (
                                    <>
                                        {index === messages.length - 1 && (
                                            <AgentMessage
                                                message={lastPageMsg}
                                                layoutMode="full"
                                                streaming={streaming}
                                                layoutScrollEnabled={
                                                    layoutScrollEnabled &&
                                                    index ===
                                                        messages.length - 1
                                                }
                                            />
                                        )}
                                        {index !== messages.length - 1 && (
                                            <Text color="gray">
                                                [Expanded view]
                                            </Text>
                                        )}
                                    </>
                                )}
                                {command === 'open' && lastPageMsg && (
                                    <Text>Open requested: {openLink}</Text>
                                )}
                            </>
                        )}
                        {/* needs to be here to rerender after messages changed */}
                        {index === messages.length - 1 &&
                            chatStatus === 'ready' && (
                                <InputMessage
                                    sendMessage={sendMessage}
                                    placeholder="Type your message here... (or / to choose command)"
                                    commands={commands}
                                    onCommandShown={(x) =>
                                        setLayoutScrollEnabled(!x)
                                    }
                                />
                            )}
                    </React.Fragment>
                );
            })}
            {messages.length === 0 && chatStatus === 'ready' && (
                <InputMessage
                    sendMessage={sendMessage}
                    placeholder="Type your message here... (or / to choose command)"
                    commands={commands}
                />
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
