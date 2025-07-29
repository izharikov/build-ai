import { logger } from '@/lib/logging';
import { Storage } from '@/storage';

export interface ResultProcessor<TResult, TContext> {
    process(result: TResult, context: TContext): Promise<void>;
}

export class ChainProcessor<TResult, TContext>
    implements ResultProcessor<TResult, TContext>
{
    private readonly processors: ResultProcessor<TResult, TContext>[];

    constructor(processors: ResultProcessor<TResult, TContext>[]) {
        this.processors = processors;
    }

    async process(result: TResult, context: TContext) {
        for (const processor of this.processors) {
            await processor.process(result, context);
        }
    }
}

export class StorageProcessor<TResult extends { name: string }, TContext>
    implements ResultProcessor<TResult, TContext>
{
    private readonly storage: Storage<TResult>;

    constructor(storage: Storage<TResult>) {
        this.storage = storage;
    }

    async process(result: TResult): Promise<void> {
        logger.debug('Saving result', result);
        await this.storage.save(result.name, result);
    }
}

export { SitecorePageToLayoutProcessor } from './sitecore/SitecorePageToLayoutProcessor';
export { SitecorePageCreator } from './sitecore/SitecorePageCreator';
export * from './sitecore/types';
