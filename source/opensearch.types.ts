import { ClientOptions } from '@opensearch-project/opensearch';

export interface OpenSearchOptions extends Omit<ClientOptions, 'name'> {
    name?: string;
}
