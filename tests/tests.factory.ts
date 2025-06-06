import { faker } from '@faker-js/faker';
import { FactoryProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Client } from '@opensearch-project/opensearch';
import { BulkStats, CreateAction, CreateActionOperation } from '@opensearch-project/opensearch/lib/Helpers';
import { ElasticsearchContainer, StartedElasticsearchContainer } from '@testcontainers/elasticsearch';
import { OpenSearchModule } from '../source/opensearch.module';
import { OpenSearchTokens } from '../source/opensearch.tokens';
import { TestingData, TestingOpenSearchService } from './tests.types';

export class TestingOpenSearchFactory {
    private _testing: TestingModule;
    private _container: StartedElasticsearchContainer;

    private _token = faker.string.alpha({ length: 10 });
    private _index = faker.string.alpha({ length: 10, casing: 'lower' });

    public async init(): Promise<void> {
        const tContainer = new ElasticsearchContainer();

        this._container = await tContainer.start();

        const tProvider: FactoryProvider<TestingOpenSearchService> = {
            provide: this._token,
            useFactory: (client: Client) => ({
                onApplicationShutdown: async(): Promise<void> => {
                    await client.close();
                },
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
                OpenSearchTokens.getClient(),
            ],
        };

        const tModule = Test.createTestingModule({
            imports: [
                OpenSearchModule.forRoot({
                    node: this._container.getHttpUrl(),
                }),
            ],
            providers: [
                tProvider,
            ],
        });

        this._testing = await tModule.compile();
        this._testing = await this._testing.init();

        this._testing.enableShutdownHooks();
    }

    public async close(): Promise<void> {
        await this._testing.close();
        await this._container.stop();
    }

    public getService(): TestingOpenSearchService {
        return this._testing.get<TestingOpenSearchService>(this._token);
    }
}
