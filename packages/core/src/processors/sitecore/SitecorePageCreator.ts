import {
    createItem,
    GqlItem,
    SitecoreConnection,
    updateItem,
} from '@/lib/sitecore/gql';
import { ResultProcessor } from '..';
import { LayoutResult, GeneratedLayoutContext } from './types';
import { PagesConfiguration } from '@/lib/sitecore/page';
import { formatGuid } from '@/lib';

type Fields = { fields: Record<string, string | undefined> };

export class SitecorePageCreator<
    TResult extends LayoutResult,
    TContext extends GeneratedLayoutContext,
> implements ResultProcessor<TResult, TContext>
{
    private readonly connection: SitecoreConnection;
    private readonly config: PagesConfiguration;

    constructor(connection: SitecoreConnection, config: PagesConfiguration) {
        this.connection = connection;
        this.config = config;
    }

    async process(result: TResult, context: TContext): Promise<void> {
        const page = await this.createPage(result);
        if (!page) {
            throw new Error('Page not created');
        }
        if (context.layout.datasources.length > 0) {
            const dataFolder = await this.createDataFolder(context, page);
            if (!dataFolder) {
                throw new Error('Data folder not created');
            }
            for (let i = 0; i < context.layout.datasources.length; i++) {
                const ds = context.layout.datasources[i];
                const item = await this.createDataSource(
                    context,
                    dataFolder,
                    ds.templateId,
                    {
                        name: ds.name,
                        fields: ds.fields,
                    },
                );
                ds.id = formatGuid(item?.itemId);
            }
        }
        await this.updatePage(page, {
            __Renderings: context.layout.raw(this.config.mainPlaceholder),
        });
    }

    async createDataFolder<TContext>(context: TContext, page: GqlItem) {
        return (
            await createItem(
                {
                    name: 'Data',
                    templateId: this.config.dataFolderTemplateId,
                    parent: formatGuid(page.itemId),
                },
                this.connection,
            )
        ).data.createItem?.item;
    }
    async createDataSource<TContext>(
        context: TContext,
        dataFolder: GqlItem,
        templateId: string,
        datasource: { name: string } & Fields,
    ) {
        return (
            await createItem(
                {
                    name: datasource.name,
                    templateId: templateId,
                    parent: formatGuid(dataFolder.itemId),
                    fields: {
                        ...datasource.fields,
                    },
                },
                this.connection,
            )
        ).data.createItem?.item;
    }

    async updatePage(page: GqlItem, fields: Fields['fields']) {
        return await updateItem(
            {
                id: formatGuid(page.itemId),
                language: page.language.name,
                fields,
            },
            this.connection,
        );
    }

    async createPage<TResult extends LayoutResult>(result: TResult) {
        const response = await createItem(
            {
                name: result.name,
                templateId: this.config.pageTemplateId,
                parent: this.config.parentItemId,
                fields: {
                    Title: result.title,
                },
            },
            this.connection,
        );
        return response.data.createItem?.item;
    }
}
