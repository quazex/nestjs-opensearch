# NestJS OpenSearch Module

Core features:

- Based on [official OpenSearch client for NodeJS](https://github.com/opensearch-project/opensearch-js);
- Supports multiple instances;
- Covered with unit and e2e tests;
- Basic module without unnecessary boilerplate.

## Installation

To install the package, run:

```sh
npm install @quazex/nestjs-opensearch @opensearch-project/opensearch
```

## Usage

### Importing the Module

To use the OpenSearch module in your NestJS application, import it into your root module (e.g., `AppModule`).

```typescript
import { Module } from '@nestjs/common';
import { OpenSearchModule } from '@quazex/nestjs-opensearch';

@Module({
  imports: [
    OpenSearchModule.forRoot({
        name: 'my-opensearch', // optional
        node: 'https://localhost:9200',
        auth: {
            username: 'your-username',
            password: 'your-password',
        },
    }),
  ],
})
export class AppModule {}
```

### Using OpenSearch Service

Once the module is registered, you can inject the `OpenSearchService` into your providers or controllers:

```typescript
import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { InjectOpenSearch } from '@quazex/nestjs-opensearch';

@Injectable()
export class SearchService {
    constructor(@InjectOpenSearch() private readonly openSearchClient: Client) {}

    async createIndex(index: string, body: any) {
        return this.openSearchClient.indices.create({
            index,
            body,
        });
    }

    async indexDocument(index: string, id: string, body: any) {
        return this.openSearchClient.index({
            index,
            id,
            body,
        });
    }

    async search(index: string, query: any) {
        return this.openSearchClient.search({
            index,
            body: query,
        });
    }
}
```

### Async Configuration

If you need dynamic configuration, use `forRootAsync`:

```typescript
@Module({
    imports: [
        OpenSearchModule.forRootAsync({
            useFactory: async () => ({
                node: process.env.OPENSEARCH_NODE,
                auth: {
                    username: process.env.OPENSEARCH_USERNAME,
                    password: process.env.OPENSEARCH_PASSWORD,
                },
            }),
        }),
    ],
})
export class AppModule {}
```

### Graceful shutdown

By default, this module doesn't manage client connection on application shutdown. You can read more about lifecycle hooks on the NestJS [documentation page](https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown). 

```typescript
// main.ts
const app = await NestFactory.create(AppModule);

app.useLogger(logger);
app.enableShutdownHooks(); // <<<

app.setGlobalPrefix('api');
app.enableVersioning({
    type: VersioningType.URI,
});

await app.listen(appConfig.port, '0.0.0.0');
```

```typescript
// app.bootstrap.ts
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { InjectOpenSearch } from '@quazex/nestjs-opensearch';

@Injectable()
export class AppBootstrap implements OnApplicationShutdown {
    constructor(@InjectOpenSearch() private readonly openSearchClient: Client) {}

    public async onApplicationShutdown(): Promise<void> {
        await this.client.close();
    }
}
```

## License

MIT

