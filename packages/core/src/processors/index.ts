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
            try {
                await processor.process(result, context);
            } catch (e) {
                console.error('Error while processing result', e);
            }
        }
    }
}

export { SitecorePageToLayoutProcessor } from './sitecore/SitecorePageToLayoutProcessor';
export { SitecorePageCreator } from './sitecore/SitecorePageCreator';
export * from './sitecore/types';
