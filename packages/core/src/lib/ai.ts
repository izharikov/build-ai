import { jsonSchema, JSONSchema7 } from 'ai';
import { JSONSchemaMeta } from 'zod/v4/core';
import { z } from 'zod/v4';

export type ZodObject = ReturnType<typeof z.object>;
export type ZodRegistry = ReturnType<typeof z.registry<JSONSchemaMeta>>;

export type SchemaRepository = {
  [key: string]: ZodObject;
};

export function objectSchema(schema: ZodObject, registry: ZodRegistry) {
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
