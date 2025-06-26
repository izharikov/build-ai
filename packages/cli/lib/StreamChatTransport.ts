import { ChatRequestOptions, ChatTransport, UIMessage, UIMessageStreamPart } from 'ai';

import { createUIMessageStream } from 'ai';

export type StreamFunc<UI_MESSAGE extends UIMessage> = (options: {messages: UI_MESSAGE[]}) => ReturnType<typeof createUIMessageStream>;

export class StreamChatTransport<UI_MESSAGE extends UIMessage>
    implements ChatTransport<UI_MESSAGE> {
    private readonly func: StreamFunc<UI_MESSAGE>;

    constructor(func: StreamFunc<UI_MESSAGE>) {
        this.func = func;
    }
    sendMessages: (options: { chatId: string; messages: UI_MESSAGE[]; abortSignal: AbortSignal | undefined; } & { trigger: 'submit-user-message' | 'submit-tool-result' | 'regenerate-assistant-message'; messageId: string | undefined; } & ChatRequestOptions) => Promise<ReadableStream<UIMessageStreamPart>> = async (options) => {
        return this.func({messages: options.messages});
    }
    reconnectToStream: (options: { chatId: string; } & ChatRequestOptions) => Promise<ReadableStream<UIMessageStreamPart> | null> = async (options) => {
        throw new Error('Method not implemented.');
    }
}