# NestJS OpenSearch Module

Core features:

- Based on [official OpenSearch client for NodeJS](https://github.com/opensearch-project/opensearch-js);
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

Once the module is registered, you can inject instance of `Client` into your providers:

```typescript
import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { InjectOpenSearch } from '@quazex/nestjs-opensearch';

@Injectable()
export class SearchService {
  private readonly INDEX_NAME = 'search_index'

  constructor(@InjectOpenSearch() private readonly client: Client) {}

  async createIndex(body: any) {
    return this.client.indices.create({
      index: this.INDEX_NAME,
      body,
    });
  }

  async indexDocument(id: string, body: any) {
    return this.client.index({
      index: this.INDEX_NAME,
      id,
      body,
    });
  }

  async search(query: any) {
    return this.client.search({
      index: this.INDEX_NAME,
      body: query,
    });
  }
}
```

### Async Configuration

If you need dynamic configuration, use `forRootAsync`:

```typescript
import { Module } from '@nestjs/common';
import { OpenSearchModule } from '@quazex/nestjs-opensearch';

@Module({
  imports: [
    OpenSearchModule.forRootAsync({
      useFactory: async (config: SomeConfigProvider) => ({
        node: config.OPENSEARCH_NODE,
        auth: {
          username: config.OPENSEARCH_USERNAME,
          password: config.OPENSEARCH_PASSWORD,
        },
      }),
      inject: [
        SomeConfigProvider,
      ],
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

// Starts listening for shutdown hooks
app.enableShutdownHooks(); // <<<

await app.listen(process.env.PORT ?? 3000);
```

## License

MIT

