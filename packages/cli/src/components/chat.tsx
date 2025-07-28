import { useChat } from '@ai-sdk/react';
import { ChooseStepResponse } from '@page-builder/core';
import { InputMessage, Message } from './message';
import { ChatTransport, UIMessage } from 'ai';
import { getData } from '@/lib/react/useMessageData';
import React from 'react';
import { AgentMessage } from './message/agent';

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

    const computedFlowState = getData<ChooseStepResponse>(
        messages.findLast((x) => x.role === 'assistant'),
        'step',
    );

    const commands =
        computedFlowState?.step === 'generate'
            ? [
                  {
                      name: 'save',
                      description: 'Save the page',
                      confirmation: true,
                  },
                  {
                      name: 'ui_expand',
                      description: 'Expand the layout',
                  },
              ]
            : [
                  {
                      name: 'save',
                      description: 'Save the page',
                      confirmation: true,
                  },
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
                return (
                    <React.Fragment key={message.id}>
                        <Message message={message} />
                        {uiCommand && (
                            <>
                                {command === 'expand' && lastPageMsg && (
                                    <AgentMessage
                                        message={lastPageMsg}
                                        layoutMode="full"
                                    />
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
