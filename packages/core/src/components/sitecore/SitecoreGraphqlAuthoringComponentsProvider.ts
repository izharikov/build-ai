import { ComponentsProvider, Component, Field } from '../index';

export type SitecoreConnection = {
  accessToken: string;
  baseUrl: string;
};

type GqlResponse<T> = {
  data: Record<string, T | undefined>;
};

type GqlArrayResponse<T> = GqlResponse<T[]>;

async function graphql<T>(
  query: string,
  connection: SitecoreConnection,
): Promise<T> {
  return await fetch(`${connection.baseUrl}sitecore/api/authoring/graphql/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${connection.accessToken}`,
    },
    body: JSON.stringify({
      query,
    }),
  }).then((res) => res.json() as T);
}

type GqlRendering = {
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

type GqlItem = {
  name: string;
  path: string;
  itemId: string;
  fields: {
    nodes: {
      name: string;
      value?: string;
    }[];
  };
};

type GqlItemField = {
  name: string;
  defaultValue?: string;
  type: string;
  description: string;
};

type GqlItemTemplate = {
  fullName: string;
  name: string;
  templateId: string;
  fields: {
    nodes: GqlItemField[];
  };
};

function getFieldType(field: GqlItemField): Field['type'] {
  switch (field.type) {
    case 'Single-Line Text':
    case 'Multi-Line Text':
      return 'text';
    case 'Rich Text':
      return 'rte';
    case 'Date':
      return 'date';
    case 'Checkbox':
      return 'checkbox';
    case 'Droplist':
      return 'select';
    case 'Multi-List':
      return 'multi-select';
    case 'Image':
      return 'image';
    case 'General Link':
    case 'General Link with Search':
      return 'link';
    default:
      return 'text';
  }
}

export class SitecoreGraphqlAuthoringComponentsProvider
  implements ComponentsProvider
{
  private readonly site: string;
  private readonly connection: SitecoreConnection;

  constructor(connection: SitecoreConnection, site: string) {
    this.site = site;
    this.connection = connection;
  }

  async getComponents(): Promise<Component[]> {
    const {
      data: { sites },
    } = await graphql<
      GqlArrayResponse<{ name: string; rootPath: string; language: string }>
    >(
      `
        query Sites {
          sites {
            name
            rootPath
            language
          }
        }
      `,
      this.connection,
    );
    const site = sites?.find((site) => site.name === this.site);
    if (!site) {
      throw new Error(`Site '${this.site}' not found`);
    }
    const {
      data: { item },
    } = await graphql<GqlResponse<GqlRendering>>(
      `query Item {
    item(
        where: {
            path: "${site.rootPath}/Presentation/Available Renderings"
        }
    ) {
        name
        children {
            nodes {
                name
                field(name: "Renderings"){
                    value
                }
            }
        }
    }
}
`,
      this.connection,
    );
    const renderings = item?.children.nodes.flatMap((x) =>
      x.field.value.split('|'),
    );
    return (
      await Promise.all(renderings?.map((x) => this.getRendering(x)) ?? [])
    ).filter((x) => typeof x !== 'undefined');
  }

  async getRendering(id: string): Promise<Component | undefined> {
    const {
      data: { item },
    } = await graphql<GqlResponse<GqlItem>>(
      `
        query Item {
          item(where: { itemId: "${id}" }) {
            name
            path
            itemId
            fields(excludeStandardFields: true) {
              nodes {
                name
                value
              }
            }
          }
        }
      `,
      this.connection,
    );
    const datasourcePath = item?.fields.nodes.find(
      (x) => x.name === 'Datasource Template',
    );
    if (!item) {
      return undefined;
    }
    const component: Component = {
      id: item.itemId,
      name: item.name,
      description: `Sitecore rendering under '${item.path.replace('/sitecore/layout/Renderings/', '')}'`,
      instructions: '',
      placement: {
        allowedChildPlaceholders: [],
        allowedParentPlaceholders: ['__main__'],
      },
    };

    // TODO: add support for branches
    if (
      datasourcePath?.value &&
      !datasourcePath.value.startsWith('/sitecore/templates/Branches')
    ) {
      const query = datasourcePath.value.startsWith('/sitecore/templates')
        ? `path: "${datasourcePath.value.replace('/sitecore/templates/', '')}"`
        : `id: "${datasourcePath.value}`;
      const {
        data: { itemTemplate },
      } = await graphql<GqlResponse<GqlItemTemplate>>(
        `
          query ItemTemplate {
            itemTemplate(
              where: { ${query} }
            ) {
              fullName
              name
              templateId
              fields {
                nodes {
                  name
                  defaultValue
                  type
                  description(language: "en")
                }
              }
            }
          }
        `,
        this.connection,
      );
      if (itemTemplate) {
        component.datasource = {
          templateId: itemTemplate.templateId,
          name: itemTemplate.name,
          fields: itemTemplate.fields.nodes
            .filter((x) => !x.name.startsWith('__')) // filter out internal fields
            .map((x) => ({
              name: x.name,
              type: getFieldType(x),
            })),
        };
      }
    }

    return component;
  }
}
