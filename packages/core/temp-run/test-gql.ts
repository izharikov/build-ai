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

dotenv.config({ path: findConfig('.env') ?? undefined });

const provider = new SitecoreGraphqlAuthoringComponentsProvider(
    {
        accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
        baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
        settings: {
            availableRenderingNames: ['Page Content', 'Page Structure'],
        },
        additional: {
            tenant: 'brimit14221-demo9d1d-dev2bfc',
            site: 'blueprint',
            organization: 'org_Ih9vHlhOvNqXRg7A',
        },
    },
    process.env.SITECORE_SITE!,
);

const resultProcessor = new ChainProcessor<
    LayoutResult,
    GeneratedLayoutContext
>([new SitecorePageToLayoutProcessor<LayoutResult, GeneratedLayoutContext>()]);
const storage = new FileStorage(['.sitecore', 'pages']);
const page = await storage.get('sitecore-content-hub');

const componentsProvider = new CachedComponentsProvider(
    provider,
    ['.sitecore', process.env.SITECORE_SITE!],
    // true,
);

const context: GeneratedLayoutContext = {
    layout: {
        raw: () => '',
        datasources: [],
    },
    components: await componentsProvider.getComponents(),
};

await resultProcessor.process(page as LayoutResult, context);

// console.log('Datasources', JSON.stringify(context.layout.datasources, null, 2));
console.log('Created', context.layout.raw());
