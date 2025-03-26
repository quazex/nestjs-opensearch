import { BulkStats } from '@opensearch-project/opensearch/lib/Helpers';

export type TestingData = Record<string, unknown> & {
    id: string;
};

export interface TestingOpenSearchService {
    write: (data: TestingData[]) => Promise<BulkStats>;
    read: (id: string) => Promise<TestingData | undefined>;
    ping: () => Promise<boolean>;
}
