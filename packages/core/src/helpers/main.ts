import { pageStructureSchema } from './schema-generator';
import { HardcodedSitecoreComponentsProvider } from '../components/sitecore/HardcodedSitecoreComponentsProvider';
import { z } from 'zod/v4';

const components =
  await new HardcodedSitecoreComponentsProvider().getComponents();

const { schema, registry } = pageStructureSchema(components);
console.dir(z.toJSONSchema(schema, { metadata: registry }), {
  depth: null,
  colors: true,
});
