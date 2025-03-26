import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { OpenSearchAsyncOptions, OpenSearchOptionsFactory } from './opensearch.interfaces';
import { OpenSearchOptions } from './opensearch.types';
import { OpenSearchUtilities } from './opensearch.utilities';

export class OpenSearchProviders {
    public static getOptions(options: OpenSearchOptions): ValueProvider<OpenSearchOptions> {
        const optionsToken = OpenSearchUtilities.getOptionsToken(options.name);
        return {
            provide: optionsToken,
            useValue: options,
        };
    }

    public static getAsyncOptions(options: OpenSearchAsyncOptions): Provider<OpenSearchOptions> {
        const optionsToken = OpenSearchUtilities.getOptionsToken(options.name);
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
                useFactory: async(factory: OpenSearchOptionsFactory): Promise<OpenSearchOptions> => {
                    const client = await factory.createOpenSearchOptions();
                    return client;
                },
                inject: [options.useExisting],
            };
        }
        throw new Error('Must provide useFactory or useClass');
    }

    public static getClient(name?: string): FactoryProvider<Client> {
        const optionsToken = OpenSearchUtilities.getOptionsToken(name);
        const clientToken = OpenSearchUtilities.getClientToken(name);
        return {
            provide: clientToken,
            useFactory: (options: OpenSearchOptions) => new Client(options),
            inject: [optionsToken],
        };
    }
}
