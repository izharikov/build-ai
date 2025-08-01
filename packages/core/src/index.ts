import {
    createUIMessageStream,
    ModelMessage,
    UIMessage,
    UIMessageStreamWriter,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import z from 'zod/v4';
import { layoutStructureSchema } from './helpers/schema-generator';
import {
    customConvertMessages,
    generateObjectStream,
    getPrompt,
    objectSchema,
    ObjectStreamResult,
    webSearch,
} from './lib/ai';
import { ComponentsProvider } from './components';
import { Storage } from './storage';
import { LayoutResult } from './processors/sitecore/types';
import { ResultProcessor } from './processors';
import { itemName } from './lib';
import Exa from 'exa-js';

const model = openai('gpt-4.1-mini');

export type Prompts = {
    chooseStep: {
        system: string;
    };
    generateLayout: {
        system: string;
    };
    globalContext?: string;
};

export type CommandState = {
    command: string;
    state: 'loading' | 'done';
    success: boolean;
    message?: string;
    result?: string;
};

export const defaultPrompts: Prompts = {
    chooseStep: {
        system: `
        ## Instructions
        Based on conversation, choose the best step to take next.

        You are very first and important part of the system, the final goal is to generate the layout.

        Choose 'generate' step if ALL the following:
        - content of the layout is clear: topic, target audience, style, etc.
        - quick summary of content is approved by the user

        If any of the above is not true, choose 'refine' step.
                `,
    },
    generateLayout: {
        system: `
## Instructions
Generate the layout based on user requirements.

## Components rules
- Always start with Container component in the main content area. And then place row/column components to style and organize the layout.
- Try to use 'Rich Text' component as minimum as possible (only when it's absolutely necessary, e.g. for code blocks).

## Datasource rules
- For any RTE field use HTML (markdown is not supported).

## Layout structure rules
- Generate the layout with minimum 7 components with datasources, if not specified.

## Tools
- Use web_search to find the best content for the layout + add additional links or context.

{{globalContext}}

{{timeContext}}
        `,
    },
};

export type ChatContext = {
    messages: UIMessage[];
    prompts: Prompts;
};

function chooseStep(chat: ChatContext, messages: ModelMessage[]) {
    return generateObjectStream({
        model,
        messages,
        system: getPrompt(chat.prompts.chooseStep.system, chat.prompts),
        schema: z.object({
            layoutContent: z
                .string()
                .describe('current content for datasources'),
            step: z.union([
                z
                    .literal('generate')
                    .describe("when it's enough information to start generate"),
                z
                    .literal('refine')
                    .describe('need to ask more questions / get approval'),
            ]),
            question: z
                .string()
                .describe(
                    'Questions to ask the user, if need to refine. Empty if generate.',
                ),
        }),
    });
}

export type ChooseStepResponse = Awaited<
    ReturnType<typeof chooseStep>['object']
>;

type LayoutStructureSchema = ReturnType<typeof layoutStructureSchema>;

function layoutStream(
    chat: ChatContext,
    messages: ModelMessage[],
    schema: LayoutStructureSchema['schema'],
    registry: LayoutStructureSchema['registry'],
) {
    const exa = new Exa(process.env.EXA_API_KEY);
    return generateObjectStream({
        model,
        messages,
        system: getPrompt(chat.prompts.generateLayout.system, chat.prompts),
        schema: schema,
        dynamicSchema: objectSchema(schema, registry),
        tools: {
            web_search: webSearch(exa),
        },
    });
}

export type LayoutResponseStream = Awaited<
    ReturnType<typeof layoutStream>['object']
>;

function getCommand(message: UIMessage) {
    if (
        message.role === 'user' &&
        message.parts.length === 1 &&
        message.parts[0].type === 'text' &&
        message.parts[0].text.startsWith('/')
    ) {
        return message.parts[0].text.substring(1);
    }
}

function getLastDataStream<T>(
    messages: UIMessage[],
    type: StateTypes,
): T | undefined {
    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if (message.role === 'assistant') {
            const part = message.parts.find(
                (part) => part.type === `data-${type}`,
            );
            if (part && 'data' in part) {
                return (part.data as { data: T }).data;
            }
        }
    }
}

export type StateTypes = 'command' | 'step' | 'layout' | 'fetch' | 'open-link';

export async function generateLayout<T>(
    chat: ChatContext,
    writer: UIMessageStreamWriter,
    componentsProvider: ComponentsProvider,
    storage: Storage<unknown>,
    resultProcessor: ResultProcessor<LayoutResult, T>,
    createContext: () => Promise<T>,
) {
    const lastUserMessage = chat.messages.findLast((x) => x.role === 'user');

    const messages = customConvertMessages(chat.messages);

    function state(type: StateTypes, data?: unknown) {
        if (!type) {
            return;
        }
        // console.log('state', type, JSON.stringify(data));
        writer.write({
            type: `data-${type}`,
            id: type,
            data,
        });
    }

    async function writeObjectStream<T>(
        type: StateTypes,
        stream: ObjectStreamResult<T>,
    ) {
        state(type, { state: 'loading' });
        for await (const part of stream.partialObjectStream) {
            state(type, { state: 'streaming', data: part });
        }
        const result = await stream.object;
        state(type, { state: 'done', data: result });
        return result;
    }

    // command handler
    const command = lastUserMessage && getCommand(lastUserMessage);
    if (command && command.startsWith('ui_')) {
        return;
    }
    if (command === 'save') {
        state('command', {
            state: 'loading',
            data: {
                command: '/save',
            },
        });
        const layout = getLastDataStream<LayoutResponseStream>(
            chat.messages,
            'layout',
        );
        if (!layout) {
            state('command', {
                state: 'done',
                data: {
                    command: '/save',
                    success: false,
                    message: 'Layout not found',
                },
            });
            return;
        }
        try {
            const res = await processAndSaveLayout(
                layout,
                resultProcessor,
                createContext,
            );
            state('layout', { state: 'done', data: res });
        } catch (e) {
            state('command', {
                state: 'done',
                data: {
                    command: '/save',
                    success: false,
                    message: (e as Error).message ?? 'An error occurred',
                },
            });
            return;
        }
        state('command', {
            state: 'done',
            data: {
                command: '/save',
                success: true,
                result: 'Layout saved' /*TODO: add e.g. item id, path */,
            },
        });
        return;
    }

    const step = await writeObjectStream('step', chooseStep(chat, messages));

    // need to ask additional questions from user, so return
    if (step.step === 'refine') {
        return;
    }

    const { schema, registry } = layoutStructureSchema(
        await componentsProvider.getComponents(),
    );

    // now we have the high level structure, we can generate the layout

    const stream = layoutStream(chat, messages, schema, registry);
    await writeObjectStream('layout', stream);
    const layout = await stream.object;
    await storage.save(itemName(layout.path ?? ''), layout);
}

export async function processAndSaveLayout<T>(
    layout: LayoutResponseStream,
    resultProcessor: ResultProcessor<LayoutResult, T>,
    createContext: () => Promise<T>,
): Promise<LayoutResult> {
    const result = {
        name: itemName(layout.path ?? ''),
        ...layout,
        state: 'new' as const,
        main: layout.main as LayoutResult['main'],
    };
    await resultProcessor.process(result, await createContext());
    return result;
}

export function streamGenerateLayout<T>(
    chat: ChatContext,
    componentsProvider: ComponentsProvider,
    storage: Storage<unknown>,
    resultProcessor: ResultProcessor<LayoutResult, T>,
    createContext: () => Promise<T>,
) {
    return createUIMessageStream({
        execute: async ({ writer }) => {
            console.log('execute');
            await generateLayout(
                chat,
                writer,
                componentsProvider,
                storage,
                resultProcessor,
                createContext,
            );
        },
        onError: (error) => {
            const { message } = error as Error;
            return message || 'An error occurred while processing the layout.';
        },
    });
}

export * as utils from './util';
export * as initializer from './initializer';
