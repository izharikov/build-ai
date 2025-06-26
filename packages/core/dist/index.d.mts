import * as ai from 'ai';
import { UIMessage, UIMessageStreamWriter } from 'ai';

type ChatContext = {
    messages: UIMessage[];
};
type Option = {
    label: string;
    value: string;
};
type ComponentConfig = {
    id: string;
    name: string;
    description: string;
    datasourceDefinition?: {
        name: string;
        fields: {
            name: string;
            type: 'text' | 'number' | 'image' | 'checkbox' | 'select' | 'multi-select' | 'rte' | 'date';
            options?: Option[];
        }[];
    };
    placeholders?: string[];
};
type PageBuilderContext = {
    config: {
        components: ComponentConfig[];
        startPlaceholder: string;
    };
};
declare const generatePage: (chat: ChatContext, writer: UIMessageStreamWriter) => Promise<unknown>;
declare const streamPage: (chat: ChatContext) => ReadableStream<{
    type: "text";
    text: string;
} | {
    type: "error";
    errorText: string;
} | {
    type: "tool-input-available";
    toolCallId: string;
    toolName: string;
    input: unknown;
} | {
    type: "tool-output-available";
    toolCallId: string;
    output: unknown;
    providerMetadata?: ai.ProviderMetadata;
} | {
    type: "tool-input-start";
    toolCallId: string;
    toolName: string;
} | {
    type: "tool-input-delta";
    toolCallId: string;
    inputTextDelta: string;
} | {
    type: "reasoning";
    text: string;
    providerMetadata?: ai.ProviderMetadata;
} | {
    type: "reasoning-part-finish";
} | {
    type: "source-url";
    sourceId: string;
    url: string;
    title?: string;
    providerMetadata?: ai.ProviderMetadata;
} | {
    type: "source-document";
    sourceId: string;
    mediaType: string;
    title: string;
    filename?: string;
    providerMetadata?: ai.ProviderMetadata;
} | {
    type: "file";
    url: string;
    mediaType: string;
} | {
    type: "start-step";
} | {
    type: "finish-step";
} | {
    type: `data-${string}`;
    id?: string;
    data: unknown;
} | {
    type: "start";
    messageId?: string;
    messageMetadata?: unknown;
} | {
    type: "finish";
    messageMetadata?: unknown;
} | {
    type: "message-metadata";
    messageMetadata: unknown;
}>;

export { type ChatContext, type ComponentConfig, type Option, type PageBuilderContext, generatePage, streamPage };
