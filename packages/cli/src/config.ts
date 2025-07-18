import { defaultPrompts, Prompts, streamPage } from '@page-builder/core';
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

const prompts: Prompts = {
    ...defaultPrompts,
    globalContext: `## Global context
This page will be published by Igor Zharikov - Sitecore Developer, working at Brimit. He is Sitecore MVP 2023 - 2025.
Please use strict and concrete language, don't be emotinal.
Whenever the topic is technical and related to programming, try to include code examples and official documentation, if not said otherwise.
`,
};

export const sitecorePageStream: ConstructorParameters<
    typeof StreamChatTransport
>[0] = ({ messages }) =>
    streamPage(
        { messages, prompts },
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
        ),
        new FileStorage(['.sitecore', 'pages']),
        new ChainProcessor([
            new SitecorePageToLayoutProcessor<PageResult, LayoutContext>(),
            // new SitecorePageCreator<PageResult, LayoutContext>(
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
        ]),
    );
