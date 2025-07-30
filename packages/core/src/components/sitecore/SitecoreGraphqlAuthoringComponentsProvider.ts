import {
    getById,
    GqlArrayResponse,
    GqlItemField,
    GqlItemTemplate,
    GqlRendering,
    GqlResponse,
    fetchGraphql,
    SitecoreConnection,
} from '@/lib/sitecore/gql';
import { ComponentsProvider, Component, Field } from '../index';
import { formatGuid, uuidCompare } from '@/lib';

function getFieldType(field: GqlItemField): Field['type'] {
    switch (field.type) {
        case 'Single-Line Text':
        case 'Multi-Line Text':
            return 'text';
        case 'Rich Text':
            return 'html';
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

type InternalComponent = Component & {
    placeholderSettingIds: string[] | undefined;
};

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
        const response = await fetchGraphql<
            GqlArrayResponse<{
                name: string;
                rootPath: string;
                language: string;
            }>
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
        const {
            data: { sites },
        } = response;
        const site = sites?.find((site) => site.name === this.site);
        if (!site) {
            throw new Error(`Site '${this.site}' not found`);
        }
        const {
            data: { item },
        } = await fetchGraphql<GqlResponse<GqlRendering>>(
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
        const availableRenderingNames =
            this.connection.settings.availableRenderingNames;
        const nameFilter = (x: { name: string }) =>
            availableRenderingNames.length === 0 ||
            availableRenderingNames.includes(x.name);
        const renderingIds = item?.children.nodes
            .filter(nameFilter)
            .flatMap((x) => x.field.value.split('|'));
        // main renderings
        const renderings = (
            await Promise.all(
                renderingIds?.map((x) => this.getRendering(x)) ?? [],
            )
        ).filter((x) => typeof x !== 'undefined');

        const queue = [...renderings];
        const wildcardPlaceholders: string[] = [];
        while (queue.length > 0) {
            const component = queue.shift()!;
            await this.fillRendering(
                component,
                renderings,
                queue,
                wildcardPlaceholders,
            );
        }

        // cleanup & finalize
        for (const component of renderings) {
            delete component.placeholderSettingIds;
            for (const placeholder of wildcardPlaceholders) {
                if (
                    !component.placement.allowedChildPlaceholders.includes(
                        placeholder,
                    )
                ) {
                    component.placement.allowedParentPlaceholders.push(
                        placeholder,
                    );
                }
            }
        }
        return renderings;
    }

    async fillRendering(
        rendering: InternalComponent,
        allRenderings: InternalComponent[],
        queue: InternalComponent[],
        wildcardPlaceholders: string[],
    ) {
        const placeholderSettingIds = rendering.placeholderSettingIds;
        if (!placeholderSettingIds) {
            return;
        }

        const placeholders = await Promise.all(
            placeholderSettingIds.map((x) => getById(x, this.connection)),
        );

        for (const response of placeholders) {
            const {
                data: { item },
            } = response;
            const key = item?.fields.nodes.find(
                (x) => x.name === 'Placeholder Key',
            )?.value;
            const allowedControls =
                item?.fields.nodes
                    .find((x) => x.name === 'Allowed Controls')
                    ?.value?.split('|')
                    .filter((x) => x) ?? [];
            // const placeholder = key?.endsWith('-{*}')
            //     ? key.slice(0, -4) + '__DYN'
            //     : key;
            const placeholder = key;
            if (!placeholder) {
                continue;
            }

            rendering.placement.allowedChildPlaceholders.push(placeholder);
            if (allowedControls.length === 0) {
                // need to allow all
                wildcardPlaceholders.push(placeholder);
                continue;
            }

            for (let i = 0; i < allowedControls.length; i++) {
                const allowed = allowedControls[i];
                const childRendering = allRenderings.find((x) =>
                    uuidCompare(x.id, allowed),
                );
                if (childRendering) {
                    childRendering.placement.allowedParentPlaceholders.push(
                        placeholder,
                    );
                } else {
                    const rendering = await this.getRendering(allowed, [
                        placeholder,
                    ]);
                    if (rendering) {
                        allRenderings.push(rendering);
                        queue.push(rendering);
                    }
                }
            }
        }
    }

    async getRendering(
        id: string,
        allowedParentPlaceholders: string[] = ['__main__'],
    ): Promise<InternalComponent | undefined> {
        const {
            data: { item },
        } = await getById(id, this.connection);
        const datasourcePath = item?.fields.nodes.find(
            (x) => x.name === 'Datasource Template',
        );
        if (!item) {
            return undefined;
        }
        const component: InternalComponent = {
            id: formatGuid(item.itemId),
            name: item.name,
            description: `Sitecore rendering under '${item.path.replace('/sitecore/layout/Renderings/', '')}'`,
            instructions: '',
            placement: {
                allowedChildPlaceholders: [],
                allowedParentPlaceholders,
            },
            placeholderSettingIds: item.fields.nodes
                .find((x) => x.name === 'Placeholders')
                ?.value?.split('|')
                .filter((x) => x),
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
            } = await fetchGraphql<GqlResponse<GqlItemTemplate>>(
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
                    templateId: formatGuid(itemTemplate.templateId),
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
