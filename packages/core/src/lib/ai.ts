import {
    convertToModelMessages,
    DataUIPart,
    DeepPartial,
    jsonSchema,
    JSONSchema7,
    ModelMessage,
    Output,
    stepCountIs,
    streamObject,
    streamText,
    tool,
    UIMessage,
} from 'ai';
import { JSONSchemaMeta } from 'zod/v4/core';
import { z } from 'zod/v4';
import { Prompts } from '..';
import Exa from 'exa-js';

export type ZodObject = ReturnType<typeof z.object>;
export type ZodObjectT<T extends object> = ReturnType<typeof z.object<T>>;
export type ZodRegistry = ReturnType<typeof z.registry<JSONSchemaMeta>>;

export type SchemaRepository = {
    [key: string]: ZodObject;
};

export function objectSchema<T extends object>(
    schema: ZodObjectT<T>,
    registry: ZodRegistry,
) {
    return jsonSchema(
        z.toJSONSchema(schema, {
            metadata: registry,
            target: 'draft-7',
            io: 'output',
        }) as JSONSchema7,
        {
            validate: (value) => {
                const result = schema.safeParse(value);
                return result.success
                    ? { success: true, value: result.data }
                    : { success: false, error: result.error };
            },
        },
    );
}

export type SchemaType<T extends object> = ReturnType<typeof objectSchema<T>>;

export function customConvertMessages(messages: UIMessage[]): ModelMessage[] {
    return messages.flatMap((message) => {
        const res = convertToModelMessages([message]);
        if (message.role !== 'assistant') {
            return res;
        }

        const dataParts = message.parts
            .filter((x) => x.type.startsWith('data'))
            .map((s) => s as DataUIPart<Record<string, unknown>>);
        const dataMessages = dataParts.map((x) => ({
            role: 'assistant' as const,
            content: JSON.stringify(x.data),
        }));
        return [...res, ...dataMessages];
    });
}

export function getPrompt(promtp: string, config: Prompts) {
    return promtp
        .replace(/{{globalContext}}/g, config.globalContext ?? '')
        .replace(
            /{{timeContext}}/g,
            `Current date and time: ${new Date().toISOString()}`,
        );
}

type params<SCHEMA extends ZodObject> = Parameters<
    typeof streamObject<SCHEMA, 'object', z.infer<SCHEMA>>
>[0];

type OutputObjectSchemaParam<T> = Parameters<
    typeof Output.object<T>
>[0]['schema'];

export type ObjectStreamResult<T> = {
    partialObjectStream: AsyncIterable<DeepPartial<T>>;
    object: Promise<T>;
};

export function generateObjectStream<SCHEMA extends ZodObject>(opts: {
    model: params<SCHEMA>['model'];
    messages: params<SCHEMA>['messages'];
    system: params<SCHEMA>['system'];
    schema: SCHEMA;
    dynamicSchema?: SchemaType<z.infer<SCHEMA>>;
    tools?: Parameters<typeof streamText>[0]['tools'];
}) {
    type ResultType = z.infer<SCHEMA>;
    const output = Output.object<ResultType>({
        schema: (opts.dynamicSchema ??
            opts.schema) as OutputObjectSchemaParam<ResultType>,
    });
    const res = streamText({
        model: opts.model,
        messages: opts.messages,
        system: opts.system,
        experimental_output: output,
        tools: opts.tools,
        stopWhen: stepCountIs(10),
    });
    return {
        partialObjectStream: res.experimental_partialOutputStream,
        object: (async () => {
            return output.parseOutput(
                { text: await res.text },
                {
                    response: await res.response,
                    usage: await res.usage,
                    finishReason: await res.finishReason,
                },
            );
        })(),
    };
}

export const webSearch = (exa: Exa) =>
    tool({
        description: 'Search the web for up-to-date information',
        inputSchema: z.object({
            query: z.string().min(1).max(100).describe('The search query'),
        }),
        execute: async ({ query }) => {
            const { results } = await exa.searchAndContents(query, {
                livecrawl: 'always',
                numResults: 3,
            });
            return results.map((result) => ({
                title: result.title,
                url: result.url,
                content: result.text.slice(0, 1000), // take just the first 1000 characters
                publishedDate: result.publishedDate,
            }));
        },
    });
