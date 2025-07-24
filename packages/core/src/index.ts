import {
    createUIMessageStream,
    ModelMessage,
    streamObject,
    UIMessage,
    UIMessageStreamWriter,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import z from 'zod/v4';
import { layoutStructureSchema } from './helpers/schema-generator';
import { customConvertMessages, getPrompt, objectSchema } from './lib/ai';
import { ComponentsProvider } from './components';
import { Storage } from './storage';
import {
    GeneratedLayoutContext,
    LayoutResult,
} from './processors/sitecore/types';
import { ResultProcessor } from './processors';

const model = openai('gpt-4.1-nano');

export type Prompts = {
    chooseStep: {
        system: string;
    };
    generateLayout: {
        system: string;
    };
    globalContext?: string;
};

export const defaultPrompts: Prompts = {
    chooseStep: {
        system: `
Your task is to choose the best step to take next based on conversation.
You are very first and important part of the system, the final goal is to generate the page.

ALSWAYS CHOOSE 'generate' step.
        `,
    },
    generateLayout: {
        system: `
## Instructions
Generate a page based on user requirements.

## Components rules
- Always start with Container component in the main content area. And then place row/column components to style and organize the page.
- Try to use 'Rich Text' component as minimum as possible (only when it's absolutely necessary, e.g. for code blocks).

## Datasource rules
- For any RTE field use HTML (markdown is not supported).

## Page structure rules
- Generate the page with minimum 7 components with datasources, if not specified.

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
    return streamObject({
        model,
        messages,
        system: getPrompt(chat.prompts.chooseStep.system, chat.prompts),
        schema: z.object({
            step: z.union([
                z
                    .literal('generate')
                    .describe(
                        "when it's enough information to generate the page",
                    ),
                z
                    .literal('refine')
                    .describe(
                        'need to ask more questions to refine the page generation',
                    ),
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

type SchemaType<T extends Record<string, unknown>> = ReturnType<
    typeof objectSchema<T>
>;

type LayoutStructureSchema = ReturnType<typeof layoutStructureSchema>;

function layoutStream(
    chat: ChatContext,
    messages: ModelMessage[],
    schema: LayoutStructureSchema['schema'],
    registry: LayoutStructureSchema['registry'],
) {
    return streamObject({
        model,
        messages,
        system: getPrompt(chat.prompts.generateLayout.system, chat.prompts),
        schema: objectSchema(schema, registry),
    });
}

export type LayoutResponseStream = Awaited<
    ReturnType<typeof layoutStream>['object']
>;

export const generateLayout = async (
    chat: ChatContext,
    writer: UIMessageStreamWriter,
    componentsProvider: ComponentsProvider,
    storage: Storage<unknown>,
) => {
    const messages = customConvertMessages(chat.messages);

    function state(type: string, data?: unknown) {
        if (!type) {
            return;
        }
        writer.write({
            type: `data-${type}`,
            id: type,
            data,
        });
    }

    async function writeObjectStream<
        K extends Record<string, unknown>,
        T extends SchemaType<K>,
    >(type: string, stream: ReturnType<typeof streamObject<T>>) {
        state(type, { state: 'loading' });
        for await (const part of stream.partialObjectStream) {
            state(type, { state: 'streaming', data: part });
        }
        const result = await stream.object;
        state(type, { state: 'done', data: result });
        return result;
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
    await storage.save('layout', layout);
};

export const processAndSaveLayout = async (
    layout: LayoutResponseStream,
    resultProcessor: ResultProcessor<LayoutResult, GeneratedLayoutContext>,
    componentsProvider: ComponentsProvider,
) =>
    await resultProcessor.process(
        {
            name: layout.path
                .replaceAll('/', '')
                .replace(/[^a-zA-Z0-9_]/g, '-')
                .toLowerCase(),
            ...layout,
            state: 'new',
            main: layout.main as LayoutResult['main'],
        },
        {
            layout: {
                raw: () => '',
                datasources: [],
            },
            components: await componentsProvider.getComponents(),
        },
    );

export const streamGenerateLayout = (
    chat: ChatContext,
    componentsProvider: ComponentsProvider,
    storage: Storage<unknown>,
) => {
    return createUIMessageStream({
        execute: async ({ writer }) => {
            await generateLayout(chat, writer, componentsProvider, storage);
        },
        onError: (error) => {
            const { message } = error as Error;
            return message || 'An error occurred while processing the layout.';
        },
    });
};

export * from './util';
