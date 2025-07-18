import { logger } from '../logging';

export type SitecoreConnection = {
    accessToken: string;
    baseUrl: string;
};

export type GqlResponse<T> = {
    data: Record<string, T | undefined>;
};

export type GqlArrayResponse<T> = GqlResponse<T[]>;

let increment = 0;

export async function graphql<T>(
    query: string,
    connection: SitecoreConnection,
    variables?: Record<string, unknown>,
): Promise<T> {
    const id = increment++;
    logger.info(`[${id}] Executing GraphQL query: ${query}`);
    logger.debug(`[${id}] GraphQL variables: ${JSON.stringify(variables)}`);
    return await fetch(
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
    ).then((res) => {
        const data = res.json() as T;
        logger.debug(`[${id}] GraphQL response: ${JSON.stringify(data)}`);
        return data;
    });
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
    return await graphql<GqlResponse<GqlItem>>(
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
    const entries = Object.entries(item.fields ?? {});
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
    `;
    const res = await graphql<{
        data: {
            createItem: {
                item: GqlItem | undefined;
            };
        };
    }>(query, connection, item.fields);
    return res;
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
    return await graphql<{
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
