import { DynamicModule, Global, Module, OnModuleDestroy } from '@nestjs/common'
import { Client, ClientOptions } from '@opensearch-project/opensearch'
import { InjectOpenSearch } from './opensearch.decorators'
import { OpenSearchAsyncOptions } from './opensearch.interfaces'
import { OpenSearchProviders } from './opensearch.providers'

@Global()
@Module({})
export class OpenSearchModule implements OnModuleDestroy {
  constructor(@InjectOpenSearch() private readonly client: Client) {}

  public async onModuleDestroy(): Promise<void> {
    if (this.client.connectionPool.size > 0) {
      await this.client.close()
    }
  }

  public static forRoot(options: ClientOptions): DynamicModule {
    const optionsProvider = OpenSearchProviders.getOptions(options)
    const clientProvider = OpenSearchProviders.getClient()

    const dynamicModule: DynamicModule = {
      module: OpenSearchModule,
      providers: [
        optionsProvider,
        clientProvider,
      ],
      exports: [
        clientProvider,
      ],
    }
    return dynamicModule
  }


  public static forRootAsync(asyncOptions: OpenSearchAsyncOptions): DynamicModule {
    const optionsProvider = OpenSearchProviders.getAsyncOptions(asyncOptions)
    const clientProvider = OpenSearchProviders.getClient()

    const dynamicModule: DynamicModule = {
      module: OpenSearchModule,
      imports: asyncOptions.imports,
      providers: [
        optionsProvider,
        clientProvider,
      ],
      exports: [
        clientProvider,
      ],
    }

    return dynamicModule
  }
}
