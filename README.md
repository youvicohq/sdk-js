# YouViCo JavaScript SDK

The YouViCo JavaScript SDK is a collection of packages for building with YouViCo from Node.js and TypeScript applications.

Visit the [YouViCo developer docs](https://developers.youvico.com/guides/getting-started) for guides, API concepts, and examples.

## Packages

| Package | Description |
| --- | --- |
| [`@youvico/api`](./packages/api) | JavaScript SDK for the public YouViCo Web API. |

More packages may be added as the YouViCo platform grows.

## Installation

Install the package that matches the YouViCo API you want to use:

```sh
npm install @youvico/api
```

```sh
pnpm add @youvico/api
```

## Usage

```ts
import { Client } from "@youvico/api";

const youvico = new Client({
    apiKey: process.env.YOUVICO_API_KEY!
});

const projects = await youvico.projects.search({
    query: "launch"
});
```

See the [`@youvico/api` package README](./packages/api) and the [SDK guide](https://developers.youvico.com/guides/sdk) for more details.

## Requirements

The SDK supports Node.js 18 and higher.

## Development

```sh
pnpm install
pnpm lint:api
pnpm typecheck:api
pnpm test:api
pnpm build:api
```

## Getting Help

Use the [GitHub issue tracker](https://github.com/youvicohq/sdk-js/issues) for bug reports and feature requests.

## License

MIT
