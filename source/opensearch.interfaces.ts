import { InjectionToken, ModuleMetadata, OptionalFactoryDependency, Type } from '@nestjs/common';
import { ClientOptions } from '@opensearch-project/opensearch';

export interface OpenSearchOptionsFactory {
    createOpenSearchOptions(): Promise<ClientOptions> | ClientOptions;
}

export interface OpenSearchAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: Array<InjectionToken | OptionalFactoryDependency>;
    useExisting?: Type<OpenSearchOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<ClientOptions> | ClientOptions;
}
