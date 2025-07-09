import {
  convertToModelMessages,
  DataUIPart,
  jsonSchema,
  JSONSchema7,
  UIMessage,
} from 'ai';
import { JSONSchemaMeta } from 'zod/v4/core';
import { z } from 'zod/v4';

export type ZodObject = ReturnType<typeof z.object>;
export type ZodObjectT<T extends Record<string, unknown>> = ReturnType<
  typeof z.object<T>
>;
export type ZodRegistry = ReturnType<typeof z.registry<JSONSchemaMeta>>;

export type SchemaRepository = {
  [key: string]: ZodObject;
};

export function objectSchema<T extends Record<string, unknown>>(
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

export function customConvertMessages(messages: UIMessage[]) {
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
