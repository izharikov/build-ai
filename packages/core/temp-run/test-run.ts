import dotenv from 'dotenv';
import { layoutStructureSchema } from '../src/helpers/schema-generator';
import { objectSchema } from '../src/lib/ai';
import findConfig from 'find-config';
import {
    initializer,
    LayoutResponseStream,
    processAndSaveLayout,
    streamGenerateLayout,
} from '../src';

const config = await initializer.loadPageBuilderJson(
    './.page-builder.send.json',
    () => dotenv.config({ path: findConfig('.env') ?? undefined }),
);

initializer.validateConfig(config);

const componentsProvider = initializer.createComponentsProvider(config);
await componentsProvider.getComponents();

console.log('... Generate schema');

const { schema, registry } = layoutStructureSchema(
    await componentsProvider.getComponents(),
);

const finalSchema = objectSchema(schema, registry);
console.log(finalSchema);

const storage = await initializer.createStorage(config);

const processor = initializer.createSaveProcessor(config, storage);

const example = await storage.get('marketingemailsitecore-send-features');

if (example) {
    await processAndSaveLayout(
        { ...example, path: example.name },
        processor,
        () => initializer.createContext(config, componentsProvider),
    );
}
// const streamLayout = streamGenerateLayout(
//     {
//         messages: [
//             {
//                 id: '1',
//                 role: 'user',
//                 parts: [
//                     {
//                         type: 'text',
//                         text: 'Create a marketing email about Sitecore Send email features.',
//                     },
//                 ],
//             },
//         ],
//         prompts: {
//             chooseStep: {
//                 system: `Directly 'generate'`,
//             },
//             generateLayout: {
//                 system: `Generate the layout for email. Add minimum 10 components.
// ## Tools
// - Use web_search to find the best content for the layout + add additional links or context.

// {{globalContext}}

// {{timeContext}}
//                 `,
//             },
//         },
//     },
//     componentsProvider,
//     storage,
//     processor,
//     () => initializer.createContext(config, componentsProvider),
// );

// console.log('... Stream layout');

// for await (const part of streamLayout) {
//     if (part.type === 'data-layout') {
//         const data = part.data as {
//             data: LayoutResponseStream;
//             state: 'done' | 'loading';
//         };
//         if (data.state === 'done') {
//             console.log('Done', data);
//             await processAndSaveLayout(data.data, processor, () =>
//                 initializer.createContext(config, componentsProvider),
//             );
//         }
//     }
// }
