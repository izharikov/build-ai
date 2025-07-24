import {
    LayoutResponseStream,
    processAndSaveLayout,
    Prompts,
    readPrompts,
    streamGenerateLayout,
} from '@page-builder/core';
import { StreamChatTransport } from './lib/StreamChatTransport';
import {
    CachedComponentsProvider,
    SitecoreGraphqlAuthoringComponentsProvider,
} from '@page-builder/core/components';
import { FileStorage } from '@page-builder/core/storage';
import {
    ChainProcessor,
    GeneratedLayoutContext,
    LayoutResult,
    SitecorePageCreator,
    SitecorePageToLayoutProcessor,
} from '@page-builder/core/processors';

export const loadPrompts = async () =>
    await readPrompts(['.sitecore', 'prompts']);

// TODO: make lazy init
const componentsProvider = () =>
    new CachedComponentsProvider(
        new SitecoreGraphqlAuthoringComponentsProvider(
            {
                accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
                baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
            },
            process.env.SITECORE_SITE!,
        ),
        ['.sitecore', process.env.SITECORE_SITE!],
        // true,
    );

const processor = new ChainProcessor([
    new SitecorePageToLayoutProcessor<LayoutResult, GeneratedLayoutContext>(),
    // new SitecorePageCreator<LayoutResult, GeneratedLayoutContext>(
    //     {
    //         accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
    //         baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
    //     },
    //     {
    //         pageTemplateId: '{95CB88E7-8068-4A9C-9EEB-05F9A22C49D4}',
    //         dateFolderTemplateId:
    //             '{1C82E550-EBCD-4E5D-8ABD-D50D0809541E}',
    //         parentItemId: '{93091B69-996A-4564-A477-8D44A6684F5A}',
    //         mainPlaceholder: '/headless-main/sxa-main/container-1',
    //     },
    // ),
]);

export const storage = new FileStorage<LayoutResult>(['.sitecore', 'pages']);

export const savePage = async (page: LayoutResponseStream) => {
    await processAndSaveLayout(page, processor, componentsProvider());
};

export function sitecorePageStream(
    prompts: Prompts,
): ConstructorParameters<typeof StreamChatTransport>[0] {
    return ({ messages }) =>
        streamGenerateLayout(
            { messages, prompts },
            componentsProvider(),
            storage,
        );
}
