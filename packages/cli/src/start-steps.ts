import { Prompts, streamGenerateLayout } from '@page-builder/core';
import { StreamChatTransport } from './lib/StreamChatTransport';
import { ChatTransport, UIMessage } from 'ai';
import { Storage } from '@page-builder/core/storage';
import {
    GeneratedLayoutContext,
    LayoutResult,
    ResultProcessor,
} from '@page-builder/core/processors';
import { ComponentsProvider } from '@page-builder/core/components';
import { initializer } from '@page-builder/core';
import dotenv from 'dotenv';
import findConfig from 'find-config';

export function initialSteps(configFile?: string) {
    let prompts: Prompts;
    let transport: ChatTransport<UIMessage>;
    let storage: Storage<LayoutResult>;
    let componentsProvider: ComponentsProvider;
    let config: initializer.PageBuilderConfig;
    let saveProcessor: ResultProcessor<LayoutResult, GeneratedLayoutContext>;
    return {
        steps: [
            {
                name: 'Load configuration',
                execute: async () => {
                    config = await initializer.loadPageBuilderJson(
                        configFile ?? '.page-builder.example.json',
                        () => {
                            dotenv.config({
                                path: findConfig('.env') ?? undefined,
                            });
                        },
                    );
                },
            },
            {
                name: 'Valdate configuration',
                execute: async () => {
                    initializer.validateConfig(config);
                },
            },
            {
                name: 'Initialize components provider',
                execute: async () => {
                    componentsProvider =
                        initializer.createComponentsProvider(config);
                    await componentsProvider.getComponents();
                },
            },
            {
                name: 'Initialize storage',
                execute: async () => {
                    storage = await initializer.createStorage(config);
                },
            },
            {
                name: 'Initialize save processor',
                execute: async () => {
                    saveProcessor = initializer.createSaveProcessor(
                        config,
                        storage,
                    );
                },
            },
            {
                name: 'Load prompts',
                execute: async () => {
                    prompts = await initializer.readPrompts(config);
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
