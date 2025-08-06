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
console.log(JSON.stringify(finalSchema, null, 2));

const storage = await initializer.createStorage(config);

const processor = initializer.createSaveProcessor(config, storage);

export async function handleExample() {
    const example = await storage.get('marketingemailsitecore-send-features');

    if (example) {
        console.log('... Process existing layout');
        await processAndSaveLayout(
            { ...example, path: example.name },
            processor,
            () => initializer.createContext(config, componentsProvider),
        );
        console.log('Done');
    }
}

export async function handleStream() {
    const streamLayout = streamGenerateLayout(
        {
            messages: [
                {
                    id: '1',
                    role: 'user',
                    parts: [
                        {
                            type: 'text',
                            text: `Create an announcement email about Sitecore Send Transactional email feature. 
                            It was highly requested by the customer and now it's there. 
                            The audience is already existing customers and we need to enroll them to try it out.
                            `,
                        },
                    ],
                },
            ],
            prompts: {
                chooseStep: {
                    system: `Directly 'generate'`,
                },
                generateLayout: {
                    system: `Generate the layout for email. Add minimum 10 components
Use the following high level structure:
- Navigation
- Header
- Main content area with lots of media and CTAs
- Footer with social media links
- Legal information

## Rules
- use Spacer to logically separate components
- for Navigation use FOUR_ONE_FOURTHS component (and then each nav item in separated placeholder)
        
## Tools
- Use web_search to find the best content for the layout + add additional links or context.

{{globalContext}}

{{timeContext}}
                `,
                },
            },
        },
        componentsProvider,
        storage,
        processor,
        () => initializer.createContext(config, componentsProvider),
    );

    console.log('... Stream layout');

    for await (const part of streamLayout) {
        if (part.type === 'data-layout') {
            const data = part.data as {
                data: LayoutResponseStream;
                state: 'done' | 'loading';
            };
            if (data.state === 'done') {
                console.log('Done', data);
                await processAndSaveLayout(data.data, processor, () =>
                    initializer.createContext(config, componentsProvider),
                );
            }
        }
    }
}

await handleStream();
