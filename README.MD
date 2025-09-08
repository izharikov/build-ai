# AI Layout Builder

[![NPM Version](https://img.shields.io/npm/v/@build-ai/cli)](https://www.npmjs.com/package/@build-ai/cli)

AI Layout Builder is a tool that helps you create a page for a blog or website based on available components and a structure.

## Usage

Create `config.json` file (see [config explanation](#config-explanation) for more details) and `.env` (see [.env reference](#env-file-reference) for more details).

Then run:

```txt
  Usage
      $ npx @build-ai/cli [options]

  Options
      --config, -c    config file path (default: config.json)
      --help          display help for command
```

## Config explanation

Example config is available in [examples](https://github.com/izharikov/build-ai/tree/main/examples) folder.

```json5
{
    "platform": "sitecore | send", // the platform to use
    "storage": "local", // the only supported storage at the moment
    "sitecore": { // Sitecore platform config, required if platform is sitecore
        "useDotEnv": true, // if true, use .env to load SITECORE_CLIENT_ID and SITECORE_CLIENT_SECRET
        "site": "blueprint", // Sitecore site name (to retrieve components for)
        "tenant": "[Connect Tenant]", // Sitecore tenant name
        "organization": "[Organization ID]", // Sitecore organization name
        "graphql": { // Sitecore GraphQL config
            "baseUrl": "https://example.sitecorecloud.io/"
        },
        "authentication": { // Sitecore authentication config
            "type": "client_credentials | user_json",
            "clientCredentials": { // client_credentials authentication config
                "clientId": "Client ID or SITECORE_CLIENT_ID in .env", // client id
                "clientSecret": "Client Secret or SITECORE_CLIENT_SECRET in .env", // client secret
                "authority": "https://auth.sitecorecloud.io", // optional, default value is https://auth.sitecorecloud.io
                "audience": "https://api.sitecorecloud.io" // optional, default value is https://api.sitecorecloud.io
            }
        },
        "pageTemplateId": "{PAGE_TEMPLATE_ID}", // Sitecore page template id (which will be used to create a page)
        "dataFolderTemplateId": "{DATA_FOLDER_TEMPLATE_ID}", // Sitecore data folder template id (which will be used to create a data folder)
        "parentItemId": "{PARENT_ITEM_ID}", // Sitecore parent item id (the parent, where the page will be created)
        "mainPlaceholder": "/headless-main/sxa-main/container-1" // Sitecore main placeholder, where all components will be placed on the page
    },
    "loadDotEnv": true, // load .env file or not
    "env": { // optional, if you want to extend process.env with some values
        "OPENAI_API_KEY": "",
        "EXA_API_KEY_": ""
    }
}
```

## `.env` file reference

```properties
# those are required
OPENAI_API_KEY=
AI_PROVIDER=openai
AI_MODEL=gpt-4.1-mini

# those are optional
# to provide web search tool into LLM
EXA_API_KEY=
# Sitecore client config authentication (when sitecore.useDotEnv is true in config.json file)
SITECORE_CLIENT_ID=
SITECORE_CLIENT_SECRET=
```

## Roadmap
- [x] Fix issue with components (currently only one component is added by LLM)
- [x] Extract prompts to files (with option to override)
- [x] Add overall flow: chat, save, refine, repeat
- [x] Load .sitecore/user.json file to connect to Sitecore
- [x] Add initial load + populate .env file
- [x] add tools
- [x] Add components structure: use 'Layout Service Placeholders'
- [x] fix flickering issue while page preview
- [x] actions based on state (new, saved => preview link in pages)
- [x] move init to core package
- [x] add open url support
- [x] Send support
- [x] use default promtps based on platform
- [ ] write an article with examples
- [ ] add support for various AI providers
- [x] add documentation with sample config for Send & Sitecore
- [ ] add non-interactive support
- [x] use https://placehold.co/600x400?text=Hello+World
- [ ] add correct graphql support (Future)
