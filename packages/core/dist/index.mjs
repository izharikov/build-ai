// src/index.ts
import { convertToModelMessages, createUIMessageStream, streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import z from "zod";
var model = openai("gpt-4.1-nano");
function chooseStep(chat) {
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
        z.literal("generate").describe("when it's enough information to generate the page"),
        z.literal("refine").describe("need to ask more questions to refine the page generation")
      ]),
      question: z.string().describe("Questions to ask the user, if need to refine. Empty if generate.")
    })
  });
}
function streamHighLevelStructure(chat) {
  return streamObject({
    model,
    messages: convertToModelMessages(chat.messages),
    system: `
## Instructions
Generate a page based on the provided structure and components.
        `,
    schema: z.object({
      page: z.object({
        title: z.string().describe("Page title"),
        description: z.string().describe("Page description"),
        components: z.array(z.object({
          name: z.string().describe("Component name")
        })).describe("Components to include in the page")
      }).describe("Page structure and content")
    })
  });
}
var generatePage = async (chat, writer) => {
  function state(type, data) {
    writer.write({
      type: `data-${type}`,
      id: type,
      data
    });
  }
  ;
  async function writeObjectStream(type, streamObject2) {
    state(type, { state: "loading" });
    for await (const part of streamObject2.partialObjectStream) {
      state(type, { state: "streaming", data: part });
    }
    const result = await streamObject2.object;
    state(type, { state: "done", data: result });
    return result;
  }
  const step = await writeObjectStream("step", chooseStep(chat));
  if (step.step === "refine") {
    return;
  }
  const highLevelStructure = await writeObjectStream("high-level-structure", streamHighLevelStructure(chat));
  const page = await writeObjectStream("page", streamObject({
    model,
    messages: convertToModelMessages(chat.messages),
    system: `
## Instructions
Generate a page based on the provided structure and components.
        `,
    schema: z.object({
      page: z.object({
        title: z.string().describe("Page title"),
        description: z.string().describe("Page description"),
        components: z.array(z.object({
          name: z.string().describe("Component name")
        })).describe("Components to include in the page")
      }).describe("Page structure and content")
    })
  }));
  return page;
};
var streamPage = (chat) => {
  return createUIMessageStream({
    execute: async ({ writer }) => {
      await generatePage(chat, writer);
    },
    onError: (error) => {
      console.log("Error:", error);
      return "ERROR occurred while generating the page.";
    }
  });
};
export {
  generatePage,
  streamPage
};
//# sourceMappingURL=index.mjs.map