# AI Layout Builder

AI Layout Builder is a tool that helps you create a page for a blog or website based on available components and a structure.

## Usage

Create a config file (see [config reference](#config-reference) for more details) and `.env` file.

Then run:

```bash
npx @build-ai/cli --config config.json
```

## Config explanation

Example config is available in [examples](examples) folder.

Common parameters:
- storage: local
- loadDotEnv: true (load .env file)
- env: object (key-value pairs to load into process.env)

### Platforms

#### Sitecore
JSON explanation:

- platform: `sitecore`
- site: Sitecore site name (to retrieve components for)
- tenant: Sitecore tenant name
- organization: Sitecore organization name
- graphql.baseUrl: Sitecore GraphQL base URL

#### Send
JSON explanation:
- platform: `send`

### Send

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
