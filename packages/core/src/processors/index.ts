import { logger } from '@/lib/logging';
import { Storage } from '@/storage';

export type ResultProcessorGeneric<TResult> = ResultProcessor<TResult, unknown>;

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

export class StorageContextProcessor<
    TResult extends { name: string },
    TContext,
    TFileReult = TContext,
> implements ResultProcessor<TResult, TContext>
{
    private readonly storage: Storage<TFileReult>;
    private readonly func: (x: TContext) => TFileReult;

    constructor(
        storage: Storage<TFileReult>,
        func: (x: TContext) => TFileReult,
    ) {
        this.storage = storage;
        this.func = func ?? ((x) => x);
    }

    async process(result: TResult, context: TContext): Promise<void> {
        logger.debug('Saving context', result);
        await this.storage.save(result.name, this.func(context));
    }
}

export { SitecorePageToLayoutProcessor } from './sitecore/SitecorePageToLayoutProcessor';
export { SitecorePageCreator } from './sitecore/SitecorePageCreator';
export * from './sitecore/types';
