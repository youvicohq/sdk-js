# YouViCo Web API SDK

JavaScript SDK for the public YouViCo Web API.

## Getting Started

### Install

```sh
pnpm add @youvico/api
```

```sh
npm install @youvico/api
```

### Configure

Set your API key in your server environment.

```sh
YOUVICO_API_KEY="your-api-key"
```

API keys are secret. Do not expose them in public client-side applications.

### Initialize

```ts
import { Client } from "@youvico/api";

const youvico = new Client({
    apiKey: process.env.YOUVICO_API_KEY!
});
```

### Basic Usage

```ts
const projects = await youvico.projects.search({
    query: "launch"
});

const project = projects.data[0];

if (project) {
    const files = await youvico.files.list(project.id);
}
```

## Error Handling

Unsuccessful API responses throw `YouvicoError`.

```ts
import { YouvicoError } from "@youvico/api";

try {
    await youvico.projects.get("project-id");
}
catch (error) {
    if (error instanceof YouvicoError) {
        console.error(error.status, error.code, error.message);
    }

    throw error;
}
```

## Docs

See the [YouViCo SDK guide](https://developers.youvico.com/guides/sdk) for full usage documentation.

## License

MIT
