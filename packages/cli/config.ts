import { streamPage } from '@page-builder/core';
import { StreamChatTransport } from './lib/StreamChatTransport';
import {
    CachedComponentsProvider,
    SitecoreGraphqlAuthoringComponentsProvider,
} from '@page-builder/core/components';
import { FileStorage } from '@page-builder/core/storage';
import {
    ChainProcessor,
    LayoutContext,
    PageResult,
    SitecorePageCreator,
    SitecorePageToLayoutProcessor,
} from '@page-builder/core/processors';

export const sitecorePageStream: ConstructorParameters<
    typeof StreamChatTransport
>[0] = ({ messages }) =>
    streamPage(
        { messages },
        new CachedComponentsProvider(
            new SitecoreGraphqlAuthoringComponentsProvider(
                {
                    accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
                    baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
                },
                process.env.SITECORE_SITE!,
            ),
            ['.sitecore', process.env.SITECORE_SITE!],
            true,
        ),
        new FileStorage(['.sitecore', 'pages']),
        new ChainProcessor([
            new SitecorePageToLayoutProcessor<PageResult, LayoutContext>(),
            new SitecorePageCreator<PageResult, LayoutContext>(
                {
                    accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
                    baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
                },
                {
                    pageTemplateId: '{95CB88E7-8068-4A9C-9EEB-05F9A22C49D4}',
                    dateFolderTemplateId:
                        '{1C82E550-EBCD-4E5D-8ABD-D50D0809541E}',
                    parentItemId: '{93091B69-996A-4564-A477-8D44A6684F5A}',
                    mainPlaceholder: '/headless-main/sxa-main/container-1',
                },
            ),
        ]),
    );
