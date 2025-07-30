import { logger } from '../logging';

export type SitecoreConnection = {
    accessToken: string;
    baseUrl: string;
    settings: {
        availableRenderingNames: string[];
    };
};

export type GqlResponse<T> = {
    data: Record<string, T | undefined>;
};

export type GqlArrayResponse<T> = GqlResponse<T[]>;

let increment = 0;

async function graphql<T>(
    query: string,
    connection: SitecoreConnection,
    variables?: Record<string, unknown>,
): Promise<T | GqlError> {
    const id = increment++;
    logger.info(`[${id}] Executing GraphQL query: ${query}`);
    logger.debug(`[${id}] GraphQL variables: ${JSON.stringify(variables)}`);
    const res = await fetch(
        `${connection.baseUrl}sitecore/api/authoring/graphql/v1`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${connection.accessToken}`,
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        },
    );
    const json = await res.json();
    logger.debug(`[${id}] GraphQL response: ${JSON.stringify(json)}`);
    if (json.errros) {
        return json as GqlError;
    }
    const data = json as T;
    return data;
}

export async function fetchGraphql<T extends object>(
    query: string,
    connection: SitecoreConnection,
    variables?: Record<string, unknown>,
): Promise<T> {
    const res = await graphql<T>(query, connection, variables);
    if (!res || 'errors' in res) {
        console.error(res);
        throw new Error(res.errors.map((x) => x.message).join('; '));
    }
    return res;
}

export type GqlRendering = {
    name: string;
    children: {
        nodes: {
            name: string;
            field: {
                value: string;
            };
        }[];
    };
};

export type GqlError = {
    errors: {
        message: string;
    }[];
};

export type GqlItem = {
    name: string;
    path: string;
    itemId: string;
    language: {
        name: string;
    };
    fields: {
        nodes: {
            name: string;
            value?: string;
        }[];
    };
};

export type GqlItemField = {
    name: string;
    defaultValue?: string;
    type: string;
    description: string;
};

export type GqlItemTemplate = {
    fullName: string;
    name: string;
    templateId: string;
    fields: {
        nodes: GqlItemField[];
    };
};

const DEFAULT_ITEM_QUERY = `itemId
name
path
language {
  name
}
fields(excludeStandardFields: true) {
  nodes {
    name
    value
  }
}
`;

export async function getById(id: string, connection: SitecoreConnection) {
    return await fetchGraphql<GqlResponse<GqlItem>>(
        `
        query Item {
          item(where: { itemId: "${id}" }) {
            ${DEFAULT_ITEM_QUERY}
          }
        }
      `,
        connection,
    );
}

export async function createItem(
    item: {
        name: string;
        templateId: string;
        parent: string;
        language?: string;
        fields?: Record<string, string | undefined>;
    },
    connection: SitecoreConnection,
) {
    const entries = Object.entries(item.fields ?? {}).filter(
        ([k, v]) => k && v,
    );
    const fieldsPart =
        entries.length > 0
            ? entries.map(([key]) => `$${key}: String!`).join(',')
            : undefined;
    const query = `
      mutation ${fieldsPart ? `(${fieldsPart})` : ''} {
        createItem(
          input: {
            name: "${item.name}"
            templateId: "${item.templateId}"
            parent: "${item.parent}"
            language: "${item.language ?? 'en'}"
            ${
                item.fields
                    ? `fields: [
              ${entries
                  .map(([key]) => `{ name: "${key}", value: $${key} }`)
                  .join('\n')}
            ]`
                    : ''
            }
          }
        ) {
          item {
            ${DEFAULT_ITEM_QUERY}
          }
        }
      }
    `;
    return await fetchGraphql<{
        data: {
            createItem: {
                item: GqlItem | undefined;
            };
        };
    }>(query, connection, item.fields);
}

export async function updateItem(
    item: {
        id: string;
        language: string;
        fields: Record<string, string | undefined>;
    },
    connection: SitecoreConnection,
) {
    const entries = Object.entries(item.fields ?? {});
    const fieldsPart =
        entries.length > 0
            ? entries.map(([key]) => `$${key}: String!`).join(',')
            : undefined;
    return await fetchGraphql<{
        data: {
            updateItem: {
                item: GqlItem | undefined;
            };
        };
    }>(
        `
      mutation ${fieldsPart ? `(${fieldsPart})` : ''} {
        updateItem(
          input: {
            itemId: "${item.id}"
            language: "${item.language}"
            ${
                item.fields
                    ? `fields: [
              ${Object.entries(item.fields)
                  .filter(([k, v]) => k && v)
                  .map(([key]) => `{ name: "${key}", value: $${key} }`)
                  .join('\n')}
            ]`
                    : ''
            }
          }
        ) {
          item {
            ${DEFAULT_ITEM_QUERY}
          }
        }
      }
    `,
        connection,
        item.fields,
    );
}
