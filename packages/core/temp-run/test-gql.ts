import dotenv from 'dotenv';
import { SitecoreGraphqlAuthoringComponentsProvider } from '../src/components/sitecore/SitecoreGraphqlAuthoringComponentsProvider';
import findConfig from 'find-config';
import {
    GeneratedLayoutContext,
    LayoutResult,
} from '../src/processors/sitecore/types';
import { FileStorage } from '../src/storage';
import { CachedComponentsProvider } from '../src/components';
import {
    ChainProcessor,
    SitecorePageToLayoutProcessor,
} from '../src/processors';
import { SitecorePageCreator } from '../src/processors/sitecore/SitecorePageCreator';

dotenv.config({ path: findConfig('.env') ?? undefined });

const provider = new SitecoreGraphqlAuthoringComponentsProvider(
    {
        accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
        baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
    },
    process.env.SITECORE_SITE!,
);

const resultProcessor = new ChainProcessor<
    LayoutResult,
    GeneratedLayoutContext
>([
    new SitecorePageToLayoutProcessor<LayoutResult, GeneratedLayoutContext>(),
    new SitecorePageCreator<LayoutResult, GeneratedLayoutContext>(
        {
            accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
            baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
        },
        {
            pageTemplateId: '{95CB88E7-8068-4A9C-9EEB-05F9A22C49D4}',
            dataFolderTemplateId: '{1C82E550-EBCD-4E5D-8ABD-D50D0809541E}',
            parentItemId: '{93091B69-996A-4564-A477-8D44A6684F5A}',
            mainPlaceholder: '/headless-main/sxa-main/container-1',
        },
    ),
]);
const storage = new FileStorage(['.sitecore', 'pages']);
const page = await storage.get('page');

const componentsProvider = new CachedComponentsProvider(
    provider,
    ['.sitecore', process.env.SITECORE_SITE!],
    true,
);

const context: GeneratedLayoutContext = {
    layout: {
        raw: () => '',
        datasources: [],
    },
    components: await componentsProvider.getComponents(),
};

await resultProcessor.process(page as LayoutResult, context);

console.log('Datasources', JSON.stringify(context.layout.datasources, null, 2));
console.log('Created', context.layout.raw());
