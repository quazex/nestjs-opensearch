import { DynamicModule, Global, Module } from '@nestjs/common';
import { OpenSearchAsyncOptions } from './opensearch.interfaces';
import { OpenSearchProviders } from './opensearch.providers';
import { OpenSearchOptions } from './opensearch.types';

@Global()
@Module({})
export class OpenSearchModule {
    public static forRoot(options: OpenSearchOptions): DynamicModule {
        const optionsProvider = OpenSearchProviders.getOptions(options);
        const clientProvider = OpenSearchProviders.getClient(options.name);

        const dynamicModule: DynamicModule = {
            module: OpenSearchModule,
            providers: [
                optionsProvider,
                clientProvider,
            ],
            exports: [
                clientProvider,
            ],
        };
        return dynamicModule;
    }


    public static forRootAsync(asyncOptions: OpenSearchAsyncOptions): DynamicModule {
        const optionsProvider = OpenSearchProviders.getAsyncOptions(asyncOptions);
        const clientProvider = OpenSearchProviders.getClient(asyncOptions.name);

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
        };

        return dynamicModule;
    }
}
