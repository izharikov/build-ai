var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  generatePage: () => generatePage,
  streamPage: () => streamPage
});
module.exports = __toCommonJS(index_exports);
var import_ai = require("ai");
var import_openai = require("@ai-sdk/openai");
var import_zod = __toESM(require("zod"));
var model = (0, import_openai.openai)("gpt-4.1-nano");
function chooseStep(chat) {
  return (0, import_ai.streamObject)({
    model,
    messages: (0, import_ai.convertToModelMessages)(chat.messages),
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
    schema: import_zod.default.object({
      step: import_zod.default.union([
        import_zod.default.literal("generate").describe("when it's enough information to generate the page"),
        import_zod.default.literal("refine").describe("need to ask more questions to refine the page generation")
      ]),
      question: import_zod.default.string().describe("Questions to ask the user, if need to refine. Empty if generate.")
    })
  });
}
function streamHighLevelStructure(chat) {
  return (0, import_ai.streamObject)({
    model,
    messages: (0, import_ai.convertToModelMessages)(chat.messages),
    system: `
## Instructions
Generate a page based on the provided structure and components.
        `,
    schema: import_zod.default.object({
      page: import_zod.default.object({
        title: import_zod.default.string().describe("Page title"),
        description: import_zod.default.string().describe("Page description"),
        components: import_zod.default.array(import_zod.default.object({
          name: import_zod.default.string().describe("Component name")
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
  const page = await writeObjectStream("page", (0, import_ai.streamObject)({
    model,
    messages: (0, import_ai.convertToModelMessages)(chat.messages),
    system: `
## Instructions
Generate a page based on the provided structure and components.
        `,
    schema: import_zod.default.object({
      page: import_zod.default.object({
        title: import_zod.default.string().describe("Page title"),
        description: import_zod.default.string().describe("Page description"),
        components: import_zod.default.array(import_zod.default.object({
          name: import_zod.default.string().describe("Component name")
        })).describe("Components to include in the page")
      }).describe("Page structure and content")
    })
  }));
  return page;
};
var streamPage = (chat) => {
  return (0, import_ai.createUIMessageStream)({
    execute: async ({ writer }) => {
      await generatePage(chat, writer);
    },
    onError: (error) => {
      console.log("Error:", error);
      return "ERROR occurred while generating the page.";
    }
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generatePage,
  streamPage
});
//# sourceMappingURL=index.js.map