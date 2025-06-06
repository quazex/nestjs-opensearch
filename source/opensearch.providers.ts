import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import { Client, ClientOptions } from '@opensearch-project/opensearch';
import { OpenSearchAsyncOptions, OpenSearchOptionsFactory } from './opensearch.interfaces';
import { OpenSearchTokens } from './opensearch.tokens';

export class OpenSearchProviders {
    public static getOptions(options: ClientOptions): ValueProvider<ClientOptions> {
        const optionsToken = OpenSearchTokens.getOptions();
        return {
            provide: optionsToken,
            useValue: options,
        };
    }

    public static getAsyncOptions(options: OpenSearchAsyncOptions): Provider<ClientOptions> {
        const optionsToken = OpenSearchTokens.getOptions();
        if (options.useFactory) {
            return {
                provide: optionsToken,
                useFactory: options.useFactory,
                inject: options.inject,
            };
        }
        if (options.useExisting) {
            return {
                provide: optionsToken,
                useFactory: async(factory: OpenSearchOptionsFactory): Promise<ClientOptions> => {
                    const client = await factory.createOpenSearchOptions();
                    return client;
                },
                inject: [options.useExisting],
            };
        }
        throw new Error('Must provide useFactory or useClass');
    }

    public static getClient(): FactoryProvider<Client> {
        const optionsToken = OpenSearchTokens.getOptions();
        const clientToken = OpenSearchTokens.getClient();
        return {
            provide: clientToken,
            useFactory: (options: ClientOptions) => new Client(options),
            inject: [optionsToken],
        };
    }
}
