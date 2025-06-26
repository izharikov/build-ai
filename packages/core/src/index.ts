import {
  convertToModelMessages,
  createUIMessageStream,
  streamObject,
  StreamObjectResult,
  UIMessage,
  UIMessageStreamWriter,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import z from 'zod';

const model = openai('gpt-4.1-nano');

export type ChatContext = {
  messages: UIMessage[];
  // TODO: add model config
};

function chooseStep(chat: ChatContext) {
  return streamObject({
    model,
    messages: convertToModelMessages(chat.messages),
    system: `
## Instructions
Based on conversation, choose the best step to take next.
Choose 'generate' step if ALL the following:
- context of the page is clear
- all components and their place in the page are known
- the overall structure of the page is clear
- the overview is confirmed with the user

If any of the above is not true, choose 'refine' step.
        `,
    schema: z.object({
      step: z.union([
        z
          .literal('generate')
          .describe("when it's enough information to generate the page"),
        z
          .literal('refine')
          .describe('need to ask more questions to refine the page generation'),
      ]),
      question: z
        .string()
        .describe(
          'Questions to ask the user, if need to refine. Empty if generate.',
        ),
    }),
  });
}

function streamHighLevelStructure(chat: ChatContext) {
  return streamObject({
    model,
    messages: convertToModelMessages(chat.messages),
    system: `
## Instructions
Generate a page based on the provided structure and components.
        `,
    schema: z.object({
      page: z
        .object({
          title: z.string().describe('Page title'),
          description: z.string().describe('Page description'),
          components: z
            .array(
              z.object({
                name: z.string().describe('Component name'),
              }),
            )
            .describe('Components to include in the page'),
        })
        .describe('Page structure and content'),
    }),
  });
}

export const generatePage = async (
  chat: ChatContext,
  writer: UIMessageStreamWriter,
) => {
  function state(type: string, data?: unknown) {
    writer.write({
      type: `data-${type}`,
      id: type,
      data,
    });
  }

  async function writeObjectStream<T>(
    type: string,
    streamObject: StreamObjectResult<unknown, T, unknown>,
  ) {
    state(type, { state: 'loading' });
    for await (const part of streamObject.partialObjectStream) {
      state(type, { state: 'streaming', data: part });
    }
    const result = await streamObject.object;
    state(type, { state: 'done', data: result });
    return result;
  }

  const step = await writeObjectStream('step', chooseStep(chat));

  // need to ask additional questions from user, so return
  if (step.step === 'refine') {
    return;
  }

  // page structure is clear, need to summarize it and generate the page
  const highLevelStructure = await writeObjectStream(
    'high-level-structure',
    streamHighLevelStructure(chat),
  );

  // now we have the high level structure, we can generate the page
  const page = await writeObjectStream(
    'page',
    streamObject({
      model,
      messages: convertToModelMessages(chat.messages),
      system: `
## Instructions
Generate a page based on the provided structure and components.

Structure: ${JSON.stringify(highLevelStructure, null, 2)}
        `,
      schema: z.object({
        page: z
          .object({
            title: z.string().describe('Page title'),
            description: z.string().describe('Page description'),
            components: z
              .array(
                z.object({
                  name: z.string().describe('Component name'),
                }),
              )
              .describe('Components to include in the page'),
          })
          .describe('Page structure and content'),
      }),
    }),
  );

  return page;
};

export const streamPage = (chat: ChatContext) => {
  return createUIMessageStream({
    execute: async ({ writer }) => {
      await generatePage(chat, writer);
    },
    onError: (error) => {
      console.log('Error:', error);
      return 'ERROR occurred while generating the page.';
    },
  });
};
