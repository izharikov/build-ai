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
    StorageProcessor,
} from '@page-builder/core/processors';
import {
    CachedComponentsProvider,
    ComponentsProvider,
    SitecoreGraphqlAuthoringComponentsProvider,
} from '@page-builder/core/components';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import fs from 'fs/promises';

// TODO: move to core package

type Platform = 'sitecore';

type PageBuilderConfig = {
    platform: Platform;
    storage: 'local';
    sitecore?: {
        useDotEnv: boolean;
        site: string;
        tenant?: string;
        organization?: string;
        graphql: {
            baseUrl: string;
            accessToken?: string;
        };
        authentication: {
            type: 'client_credentials' | 'user_json';
            userJsonPath?: string;
            clientCredentials?: {
                clientId: string;
                clientSecret: string;
                authority?: string;
                audience?: string;
            };
        };
        pageTemplateId: string;
        dataFolderTemplateId: string;
        parentItemId: string;
        mainPlaceholder: string;
    };
    loadDotEnv: boolean;
    env?: Record<string, string>;
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

function validateConfig(config: PageBuilderConfig) {
    switch (config.platform) {
        case 'sitecore':
            const sitecore = config.sitecore!;
            checkNotEmpty(sitecore.site, 'site');
            checkNotEmpty(sitecore.graphql.accessToken, 'graphql.accessToken');
            checkAccessToken(sitecore.graphql.accessToken as string);
            checkNotEmpty(sitecore.graphql.baseUrl, 'graphql.baseUrl');
            checkNotEmpty(sitecore.pageTemplateId, 'pageTemplateId');
            checkNotEmpty(
                sitecore.dataFolderTemplateId,
                'dataFolderTemplateId',
            );
            checkNotEmpty(sitecore.parentItemId, 'parentItemId');
            checkNotEmpty(sitecore.mainPlaceholder, 'mainPlaceholder');
            break;
        default:
            throw new Error('Unknown preset');
    }
}

function createComponentsProvider(
    config: PageBuilderConfig,
): ComponentsProvider {
    if (config.platform === 'sitecore') {
        const sitecore = config.sitecore!;
        return new CachedComponentsProvider(
            new SitecoreGraphqlAuthoringComponentsProvider(
                {
                    accessToken: sitecore.graphql.accessToken as string,
                    baseUrl: sitecore.graphql.baseUrl as string,
                    settings: {
                        availableRenderingNames: [
                            'Page Content',
                            'Page Structure',
                        ],
                    },
                    additional:
                        sitecore.tenant && sitecore.organization
                            ? {
                                  tenant: sitecore.tenant,
                                  site: sitecore.site,
                                  organization: sitecore.organization,
                              }
                            : undefined,
                },
                sitecore.site as string,
            ),
            ['.sitecore', sitecore.site as string],
        );
    }

    return {
        getComponents: async () => [],
    };
}

function createSaveProcessor(
    config: PageBuilderConfig,
    storage: Storage<LayoutResult>,
) {
    if (config.platform === 'sitecore') {
        const sitecore = config.sitecore!;
        return new ChainProcessor([
            new SitecorePageToLayoutProcessor<
                LayoutResult,
                GeneratedLayoutContext
            >(),
            new SitecorePageCreator<LayoutResult, GeneratedLayoutContext>(
                {
                    accessToken: sitecore.graphql.accessToken!,
                    baseUrl: sitecore.graphql.baseUrl,
                    settings: {
                        availableRenderingNames: [
                            'Page Content',
                            'Page Structure',
                        ],
                    },
                    additional:
                        sitecore.tenant && sitecore.organization
                            ? {
                                  tenant: sitecore.tenant,
                                  site: sitecore.site,
                                  organization: sitecore.organization,
                              }
                            : undefined,
                },
                {
                    pageTemplateId: sitecore.pageTemplateId,
                    dataFolderTemplateId: sitecore.dataFolderTemplateId,
                    parentItemId: sitecore.parentItemId,
                    mainPlaceholder: sitecore.mainPlaceholder,
                },
            ),
            new StorageProcessor<LayoutResult, GeneratedLayoutContext>(storage),
        ]);
    }
    throw new Error('Not implemented');
}

async function loadPageBuilderJson(
    path: string = '.page-builder.json',
): Promise<PageBuilderConfig> {
    const file = await fs.readFile(path, 'utf-8');
    const config = JSON.parse(file) as PageBuilderConfig;
    if (config.env) {
        for (const key in config.env) {
            if (config.env![key]) {
                process.env[key] = config.env![key];
            }
        }
    }

    if (config.loadDotEnv) {
        dotenv.config({ path: findConfig('.env') ?? undefined });
    }

    checkNotEmpty(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY');

    if (config.platform === 'sitecore' && config.sitecore) {
        if (config.sitecore.useDotEnv) {
            const clietnCred = config.sitecore.authentication.clientCredentials;
            if (clietnCred) {
                clietnCred.clientId = process.env.SITECORE_CLIENT_ID!;
                clietnCred.clientSecret = process.env.SITECORE_CLIENT_SECRET!;
            }
        }
        const authentication = config.sitecore.authentication;
        if (authentication.type === 'user_json') {
            if (!authentication.userJsonPath) {
                throw new Error(
                    'userJsonPath is required for user_json authentication',
                );
            }
            try {
                const userJson = await fs.readFile(
                    authentication.userJsonPath,
                    'utf-8',
                );
                config.sitecore.graphql.accessToken = JSON.parse(userJson)
                    .endpoints.xmCloud.accessToken as string;
            } catch (e) {
                console.error('Error loading user.json', e);
            }
        }
        if (authentication.type === 'client_credentials') {
            if (!authentication.clientCredentials) {
                throw new Error(
                    'clientCredentials are required for client_credentials authentication',
                );
            }
            const authority =
                authentication.clientCredentials.authority ??
                'https://auth.sitecorecloud.io';
            const audience =
                authentication.clientCredentials.audience ??
                'https://api.sitecorecloud.io';
            const response = await fetch(`${authority}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: authentication.clientCredentials.clientId,
                    client_secret:
                        authentication.clientCredentials.clientSecret,
                    audience,
                }),
            });
            const json = await response.json();
            config.sitecore.graphql.accessToken = json.access_token as string;
        }
    }

    return config;
}

export function initialSteps(configFile?: string) {
    let prompts: Prompts;
    let transport: ChatTransport<UIMessage>;
    let storage: Storage<LayoutResult>;
    let componentsProvider: ComponentsProvider;
    let config: PageBuilderConfig;
    let saveProcessor: ResultProcessor<LayoutResult, GeneratedLayoutContext>;
    return {
        steps: [
            {
                name: 'Load configuration',
                execute: async () => {
                    config = await loadPageBuilderJson(configFile);
                },
            },
            {
                name: 'Valdate configuration',
                execute: async () => {
                    validateConfig(config);
                },
            },
            {
                name: 'Initialize components provider',
                execute: async () => {
                    componentsProvider = createComponentsProvider(config);
                    await componentsProvider.getComponents();
                },
            },
            {
                name: 'Initialize storage',
                execute: async () => {
                    storage =
                        config.storage === 'local'
                            ? new FileStorage<LayoutResult>([
                                  '.' + config.platform,
                                  'layouts',
                              ])
                            : new FileStorage<LayoutResult>(['.tmp']);
                    await storage.initialize();
                },
            },
            {
                name: 'Initialize save processor',
                execute: async () => {
                    saveProcessor = createSaveProcessor(config, storage);
                },
            },
            {
                name: 'Load prompts',
                execute: async () => {
                    prompts = await readPrompts([
                        '.' + config.platform,
                        'prompts',
                    ]);
                },
            },
            {
                name: 'Initialize transport',
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
        ],
        transport: () => transport,
        storage: () => storage,
    };
}
