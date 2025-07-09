export interface ResultExporter<TResult, TContext> {
  export(result: TResult, context: TContext): Promise<void>;
}

export class ChainExporter<TResult, TContext>
  implements ResultExporter<TResult, TContext>
{
  private readonly exporters: ResultExporter<TResult, TContext>[];

  constructor(exporters: ResultExporter<TResult, TContext>[]) {
    this.exporters = exporters;
  }

  async export(result: TResult, context: TContext) {
    for (const exporter of this.exporters) {
      await exporter.export(result, context);
    }
  }
}
