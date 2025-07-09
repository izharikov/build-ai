import dotenv from 'dotenv';
import { SitecoreGraphqlAuthoringComponentsProvider } from '../src/components/sitecore/SitecoreGraphqlAuthoringComponentsProvider';
import findConfig from 'find-config';
import { SitecorePageToLayoutExporter } from '../src/export/sitecore/PageToLayoutExport';
import { LayoutContext, PageResult } from '../src/export/sitecore/types';
import { FileStorage } from '../src/storage';
import { CachedComponentsProvider } from '../src/components';

dotenv.config({ path: findConfig('.env') ?? undefined });

const provider = new SitecoreGraphqlAuthoringComponentsProvider(
  {
    accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
    baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
  },
  process.env.SITECORE_SITE!,
);

console.dir(await provider.getComponents(), { depth: null });

const exporter = new SitecorePageToLayoutExporter<PageResult, LayoutContext>();
const storage = new FileStorage(['.sitecore', 'pages']);
const page = await storage.get('page');

const componentsProvider = new CachedComponentsProvider(
  provider,
  ['.sitecore', process.env.SITECORE_SITE!],
  // true,
);

const context: LayoutContext = {
  layout: {
    raw: () => '',
    datasources: [],
  },
  components: await componentsProvider.getComponents(),
};

await exporter.export(page as PageResult, context);

console.log(JSON.stringify(context.layout.datasources, null, 2));
console.log(context.layout.raw());
