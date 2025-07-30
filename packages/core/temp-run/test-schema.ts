import dotenv from 'dotenv';
import { layoutStructureSchema } from '../src/helpers/schema-generator';
import { objectSchema } from '../src/lib/ai';
import { CachedComponentsProvider } from '../src/components';
import { SitecoreGraphqlAuthoringComponentsProvider } from '../src/components/sitecore/SitecoreGraphqlAuthoringComponentsProvider';
import findConfig from 'find-config';

dotenv.config({ path: findConfig('.env') ?? undefined });

const site = 'blueprint';

const provider = new SitecoreGraphqlAuthoringComponentsProvider(
    {
        accessToken: process.env.SITECORE_GRAPHQL_ACCESS_TOKEN!,
        baseUrl: process.env.SITECORE_GRAPHQL_BASE_URL!,
        settings: {
            availableRenderingNames: ['Page Content', 'Page Structure'],
        },
        additional: {
            tenant: 'brimit14221-demo9d1d-dev2bfc',
            site: 'blueprint',
            organization: 'org_Ih9vHlhOvNqXRg7A',
        },
    },
    site,
);
const componentsProvider = new CachedComponentsProvider(
    provider,
    ['.sitecore', site],
    true,
);

await componentsProvider.getComponents();

console.log('... Generate schema');

const { schema, registry } = layoutStructureSchema(
    await componentsProvider.getComponents(),
);

console.log('... Generate object');

const finalSchema = objectSchema(schema, registry);
console.log(finalSchema);

// const stream = streamObject({
//     model: openai('gpt-4.1-mini'),
//     messages: [
//         {
//             role: 'user',
//             content: `I write a comprehensive guide on Sitecore pipeline: ootb pipelines, how to write a custom pipeline, etc.`,
//         },
//     ],
//     system: `
// ## Instructions
// Generate a page based on user requirements.

// ## Components rules
// - Always start with Container component in the main content area. And then place row/column components to style and organize the page.
// - Try to use 'Rich Text' component as minimum as possible (only when it's absolutely necessary, e.g. for code blocks).

// ## Datasource rules
// - For any RTE field use HTML (markdown is not supported).
//         `,
//     schema: finalSchema,
// });

// for await (const part of stream.textStream) {
//     process.stdout.write(part);
// }

// const finalObject = await stream.object;
// console.dir(finalObject, { depth: null });
