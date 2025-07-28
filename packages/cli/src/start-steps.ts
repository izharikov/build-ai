import dotenv from 'dotenv';
import findConfig from 'find-config';
import { Prompts, readPrompts, streamGenerateLayout } from '@page-builder/core';
import { StreamChatTransport } from './lib/StreamChatTransport';
import { ChatTransport, UIMessage } from 'ai';
import { FileStorage, Storage } from '@page-builder/core/storage';
import {
    ChainProcessor,
    GeneratedLayoutContext,
    LayoutResult,
    ResultProcessor,
    SitecorePageCreator,
    SitecorePageToLayoutProcessor,
} from '@page-builder/core/processors';
import {
    CachedComponentsProvider,
    ComponentsProvider,
    SitecoreGraphqlAuthoringComponentsProvider,
} from '@page-builder/core/components';
import { jwtDecode, JwtPayload } from 'jwt-decode';

type Platform = 'sitecore';

type Configuration = {
    platform: Platform;
    storage: 'local';
};

function checkNotEmpty(value: unknown, name: string) {
    if (value === undefined || value === null || value === '') {
        throw new Error(`${name} can't be empty`);
    }
}

function checkAccessToken(value: string) {
    const decoded = jwtDecode<JwtPayload>(value);
    if (!decoded || decoded.exp === undefined) {
        throw new Error(
            'Invalid access token (check SITECORE_GRAPHQL_ACCESS_TOKEN or run `dotnet sitecore cloud login`)',
        );
    }
    if (decoded.exp < Date.now() / 1000) {
        throw new Error(
            'Access token expired (check SITECORE_GRAPHQL_ACCESS_TOKEN or run `dotnet sitecore cloud login`)',
        );
    }
}

function validateConfig(config: Record<string, unknown>, platform: Platform) {
    switch (platform) {
        case 'sitecore':
            checkNotEmpty(config.site, 'site');
            checkNotEmpty(config.accessToken, 'accessToken');
            checkAccessToken(config.accessToken as string);
            checkNotEmpty(config.baseUrl, 'baseUrl');
            checkNotEmpty(config.pageTemplateId, 'pageTemplateId');
            checkNotEmpty(config.dataFolderTemplateId, 'dataFolderTemplateId');
            checkNotEmpty(config.parentItemId, 'parentItemId');
            checkNotEmpty(config.mainPlaceholder, 'mainPlaceholder');
            break;
        default:
            throw new Error('Unknown preset');
    }
}

function createProcessConfig(platform: Platform) {
    if (platform === 'sitecore') {
        return {
            site: process.env.SITECORE_SITE!,
            accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
            baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
            pageTemplateId: '{95CB88E7-8068-4A9C-9EEB-05F9A22C49D4}',
            dataFolderTemplateId: '{1C82E550-EBCD-4E5D-8ABD-D50D0809541E}',
            parentItemId: '{93091B69-996A-4564-A477-8D44A6684F5A}',
            mainPlaceholder: '/headless-main/sxa-main/container-1',
        };
    }

    return {};
}

function createComponentsProvider(
    platform: Platform,
    config: Record<string, unknown>,
): ComponentsProvider {
    if (platform === 'sitecore') {
        return new CachedComponentsProvider(
            new SitecoreGraphqlAuthoringComponentsProvider(
                {
                    accessToken: config.accessToken as string,
                    baseUrl: config.baseUrl as string,
                },
                config.site as string,
            ),
            ['.sitecore', config.site as string],
        );
    }

    return {
        getComponents: async () => [],
    };
}

function createSaveProcessor(
    config: Record<string, unknown>,
    platform: Platform,
) {
    if (platform !== 'sitecore') {
        throw new Error('Not implemented');
    }
    return new ChainProcessor([
        new SitecorePageToLayoutProcessor<
            LayoutResult,
            GeneratedLayoutContext
        >(),
        new SitecorePageCreator<LayoutResult, GeneratedLayoutContext>(
            {
                accessToken: config.accessToken as string,
                baseUrl: config.baseUrl as string,
            },
            {
                pageTemplateId: config.pageTemplateId as string,
                dataFolderTemplateId: config.dataFolderTemplateId as string,
                parentItemId: config.parentItemId as string,
                mainPlaceholder: config.mainPlaceholder as string,
            },
        ),
    ]);
}

export function initialSteps(appConfig: Configuration) {
    const { platform, storage: storageType } = appConfig;
    let prompts: Prompts;
    let transport: ChatTransport<UIMessage>;
    let storage: Storage<LayoutResult>;
    let componentsProvider: ComponentsProvider;
    let config: Record<string, unknown>;
    let saveProcessor: ResultProcessor<LayoutResult, GeneratedLayoutContext>;
    return {
        steps: [
            {
                name: 'Load and validate config',
                execute: async () => {
                    dotenv.config({ path: findConfig('.env') ?? undefined });
                    config = createProcessConfig(platform);
                    validateConfig(config, platform);
                    return Promise.resolve();
                },
            },
            {
                name: 'Initialize components provider',
                execute: async () => {
                    componentsProvider = createComponentsProvider(
                        platform,
                        config,
                    );
                },
            },
            {
                name: 'Initialize save processor',
                execute: async () => {
                    saveProcessor = createSaveProcessor(config, platform);
                },
            },
            {
                name: 'Load prompts',
                execute: async () => {
                    prompts = await readPrompts(['.' + platform, 'prompts']);
                },
            },
            {
                name: 'Init transport',
                execute: async () => {
                    transport = new StreamChatTransport(({ messages }) =>
                        streamGenerateLayout(
                            { messages, prompts },
                            componentsProvider,
                            storage,
                            saveProcessor,
                        ),
                    );
                },
            },
            {
                name: 'Init storage',
                execute: async () => {
                    storage =
                        storageType === 'local'
                            ? new FileStorage<LayoutResult>([
                                  '.' + platform,
                                  'layouts',
                              ])
                            : new FileStorage<LayoutResult>(['.tmp']);
                },
            },
        ],
        transport: () => transport,
        storage: () => storage,
    };
}
