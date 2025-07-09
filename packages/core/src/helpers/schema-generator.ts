import { JSONSchemaMeta } from 'zod/v4/core';
import { Component } from '../components';
import { z } from 'zod/v4';
import { ZodObject, SchemaRepository } from '../lib/ai';

const idFunc = (component: Component) => component.name;

function getExistingScema(
  repo: SchemaRepository,
  component: Component,
): ZodObject {
  const res = repo[idFunc(component)];
  if (!res) {
    throw new Error(`Schema for component '${component.name}' not found`);
  }

  return res;
}

function getDatasourceSchema(component: Component) {
  if (!component.datasource) {
    return undefined;
  }
  const fields: Parameters<typeof z.object>[0] = {};
  for (const field of component.datasource.fields) {
    const key = field.name;
    switch (field.type) {
      case 'text':
        fields[key] = z.string().describe('Text value');
        break;
      case 'number':
        fields[key] = z.number().describe('Numeric value');
        break;
      case 'image':
        fields[key] = z.string().describe('Image URL');
        break;
      case 'checkbox':
        fields[key] = z.boolean();
        break;
      case 'select':
        fields[key] = z.string();
        break;
      case 'multi-select':
        fields[key] = z.array(z.string());
        break;
      case 'rte':
        fields[key] = z
          .string()
          .describe('HTML field content (used in RTE field)');
        break;
      case 'date':
        fields[key] = z.iso.datetime().describe('Date value');
        break;
    }
  }
  return z
    .object({
      name: z.string().describe('Name of the datasource'),
      fields: z.object(fields),
    })
    .describe('Content datasource for ' + component.name);
}

function registerComponentSchema(component: Component, repo: SchemaRepository) {
  let schema = z.object({
    name: z.literal(component.name).describe('Component name'),
    internalDescription: z
      .string()
      .describe('internal short component description (max 5 words)'),
  });

  const datasourceSchema = getDatasourceSchema(component);
  if (datasourceSchema) {
    schema = schema.extend({
      datasource: datasourceSchema,
    });
  }
  const description = [
    ['Component', component.name],
    ['Description', component.description],
    ['Instructions', component.instructions],
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' ');
  schema = schema.describe(description);
  repo[idFunc(component)] = schema;
  return schema;
}

function populateSchema(
  repo: SchemaRepository,
  component: Component,
  allComponents: Component[],
) {
  let schema = getExistingScema(repo, component);
  const childPlaceholders = component.placement.allowedChildPlaceholders;
  if (childPlaceholders.length > 0) {
    for (const childPlaceholder of childPlaceholders) {
      const allowedChildrenComponents = allComponents.filter((c) =>
        c.placement.allowedParentPlaceholders.includes(childPlaceholder),
      );

      if (allowedChildrenComponents.length == 0) {
        continue;
      }

      if (allowedChildrenComponents.length == 1) {
        schema = schema.extend({
          [childPlaceholder]: z
            .array(getExistingScema(repo, allowedChildrenComponents[0]))
            .describe(
              `Components inserted into placeholder '${childPlaceholder}'`,
            ),
        });
        continue;
      }
      schema = schema.extend({
        [childPlaceholder]: z
          .array(
            z.union(
              allowedChildrenComponents.map((component) =>
                getExistingScema(repo, component),
              ),
            ),
          )
          .describe(
            `Components inserted into placeholder '${childPlaceholder}'`,
          ),
      });
    }

    repo[idFunc(component)] = schema;
  }
}

export function pageStructureSchema(
  components: Component[],
  mainPlaceholder: string = '__main__',
) {
  const registry = z.registry<JSONSchemaMeta>();
  const repo: SchemaRepository = {};
  for (const component of components) {
    registerComponentSchema(component, repo);
  }

  for (const component of components) {
    populateSchema(repo, component, components);
  }

  const schema = z
    .object({
      title: z.string().describe('Page title'),
      description: z.string().describe('Page description'),
      main: z
        .array(
          z.union(
            components
              .filter((x) =>
                x.placement.allowedParentPlaceholders.includes(mainPlaceholder),
              )
              .map((c) => getExistingScema(repo, c)),
          ),
        )
        .describe('Page components'),
    })
    .register(registry, {
      id: 'PageStructure',
    });

  for (const component of components) {
    registry.add(getExistingScema(repo, component), {
      id: idFunc(component),
    });
  }
  return { schema, registry };
}
