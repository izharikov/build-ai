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
        if (context.layout.datasources.length > 0) {
            const dataFolder = await this.createDataFolder(
                context,
                page as GqlItem,
            );
            for (let i = 0; i < context.layout.datasources.length; i++) {
                const ds = context.layout.datasources[i];
                const item = await this.createDataSource(
                    context,
                    dataFolder as GqlItem,
                    ds.templateId,
                    {
                        name: ds.name,
                        fields: ds.fields,
                    },
                );
                ds.id = formatGuid((item as GqlItem).itemId);
            }
        }
        const finalResult = await this.updatePage(page as GqlItem, {
            __Renderings: context.layout.raw(this.config.mainPlaceholder),
        });

        if ('data' in finalResult) {
            result.state = 'saved';
            result.itemId = finalResult?.data?.updateItem?.item?.itemId;
        }
    }

    async createDataFolder<TContext>(context: TContext, page: GqlItem) {
        const item = await createItem(
            {
                name: 'Data',
                templateId: this.config.dataFolderTemplateId,
                parent: formatGuid(page.itemId),
            },
            this.connection,
        );
        return item?.data?.createItem?.item;
    }
    async createDataSource<TContext>(
        context: TContext,
        dataFolder: GqlItem,
        templateId: string,
        datasource: { name: string } & Fields,
    ) {
        const item = await createItem(
            {
                name: datasource.name,
                templateId: templateId,
                parent: formatGuid(dataFolder.itemId),
                fields: {
                    ...datasource.fields,
                },
            },
            this.connection,
        );
        return item?.data?.createItem?.item;
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
        return response?.data?.createItem?.item;
    }
}
