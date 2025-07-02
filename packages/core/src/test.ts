import { generateObject } from 'ai';
import { HardcodedSitecoreComponentsProvider } from './components/sitecore/HardcodedSitecoreComponentsProvider';
import { pageStructureSchema } from './helpers/schema-generator';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { objectSchema } from './lib/ai';

dotenv.config();

const componentsProvider = new HardcodedSitecoreComponentsProvider();
const { schema, registry } = pageStructureSchema(
  await componentsProvider.getComponents(),
);

const finalSchema = objectSchema(schema, registry);

const { object: page } = await generateObject({
  model: openai('gpt-4.1-mini'),
  messages: [
    {
      role: 'user',
      content:
        'Generate a page for a blog about React development. Decide all parts for yourself.',
    },
  ],
  system: `
## Instructions
Generate a page based on user requirements.

Use container/row components to structure the page.
        `,
  schema: finalSchema,
});

console.dir(page, { depth: null });
