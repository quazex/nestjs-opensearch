import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common'
import { Client, ClientOptions } from '@opensearch-project/opensearch'
import { OpenSearchAsyncOptions, OpenSearchOptionsFactory } from './opensearch.interfaces'
import { OpenSearchTokens } from './opensearch.tokens'

export class OpenSearchProviders {
  public static getOptions(options: ClientOptions): ValueProvider<ClientOptions> {
    return {
      provide: OpenSearchTokens.OPTIONS,
      useValue: options,
    }
  }

  public static getAsyncOptions(options: OpenSearchAsyncOptions): Provider<ClientOptions> {
    if (options.useFactory) {
      return {
        provide: OpenSearchTokens.OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject,
      }
    }
    if (options.useExisting) {
      return {
        provide: OpenSearchTokens.OPTIONS,
        useFactory: async(factory: OpenSearchOptionsFactory): Promise<ClientOptions> => {
          const client = await factory.createOpenSearchOptions()
          return client
        },
        inject: [options.useExisting],
      }
    }
    throw new Error('Must provide useFactory or useClass')
  }

  public static getClient(): FactoryProvider<Client> {
    return {
      provide: OpenSearchTokens.CLIENT,
      useFactory: (options: ClientOptions) => new Client(options),
      inject: [
        OpenSearchTokens.OPTIONS,
      ],
    }
  }
}
