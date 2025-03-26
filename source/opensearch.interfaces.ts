import { InjectionToken, ModuleMetadata, OptionalFactoryDependency, Type } from '@nestjs/common';
import { OpenSearchOptions } from './opensearch.types';

export interface OpenSearchOptionsFactory {
    createOpenSearchOptions(): Promise<OpenSearchOptions> | OpenSearchOptions;
}

export interface OpenSearchAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    name?: string;
    inject?: Array<InjectionToken | OptionalFactoryDependency>;
    useExisting?: Type<OpenSearchOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<OpenSearchOptions> | OpenSearchOptions;
}
