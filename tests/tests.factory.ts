import { faker } from '@faker-js/faker';
import { FactoryProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Client } from '@opensearch-project/opensearch';
import { BulkStats, CreateAction, CreateActionOperation } from '@opensearch-project/opensearch/lib/Helpers';
import { OpenSearchModule } from '../source/opensearch.module';
import { OpenSearchUtilities } from '../source/opensearch.utilities';
import { OpenSearchContainerGeneric, OpenSearchContainerStarted } from './tests.container';
import { TestingData, TestingOpenSearchService } from './tests.types';

export class TestingOpenSearchFactory {
    private _testing: TestingModule;
    private _container: OpenSearchContainerStarted;

    private _token = faker.string.alpha({ length: 10 });
    private _index = faker.string.alpha({ length: 10, casing: 'lower' });

    public async init(): Promise<void> {
        const tContainer = new OpenSearchContainerGeneric();

        this._container = await tContainer.start();

        const tProvider: FactoryProvider<TestingOpenSearchService> = {
            provide: this._token,
            useFactory: (client: Client) => ({
                write: async(data): Promise<BulkStats> => {
                    const response = await client.helpers.bulk({
                        datasource: data,
                        onDocument: (doc: TestingData): CreateAction => {
                            const command: CreateActionOperation = {
                                create: {
                                    _index: this._index,
                                    _id: doc.id.toString(),
                                },
                            };
                            return [command, doc];
                        },
                    });
                    return response;
                },
                read: async(id: string): Promise<TestingData | undefined> => {
                    const reply = await client.search({
                        index: this._index,
                        body: {
                            query: {
                                bool: {
                                    filter: [
                                        {
                                            term: {
                                                id,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    });
                    return reply.body.hits.hits[0]?._source as TestingData;
                },
                ping: async(): Promise<boolean> => {
                    const reply = await client.ping();
                    return typeof reply.body === 'boolean' && reply.body === true;
                },
            }),
            inject: [
                OpenSearchUtilities.getClientToken(),
            ],
        };

        const tModule = Test.createTestingModule({
            imports: [
                OpenSearchModule.forRoot({
                    node: this._container.getNodeUrl(),
                }),
            ],
            providers: [
                tProvider,
            ],
        });

        this._testing = await tModule.compile();
    }

    public async close(): Promise<void> {
        const token = OpenSearchUtilities.getClientToken();
        const client = this._testing.get<Client>(token);

        await client.close();
        await this._testing.close();
        await this._container.stop();
    }

    public getService(): TestingOpenSearchService {
        return this._testing.get<TestingOpenSearchService>(this._token);
    }
}
