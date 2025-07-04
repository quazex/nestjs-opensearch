import { Faker, faker } from '@faker-js/faker';
import { describe, expect, jest, test } from '@jest/globals';
import { Injectable, Module, ValueProvider } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClientOptions } from '@opensearch-project/opensearch';
import { OpenSearchOptionsFactory } from '../source/opensearch.interfaces';
import { OpenSearchModule } from '../source/opensearch.module';

jest.mock('@opensearch-project/opensearch', () => ({
    Client: jest.fn(),
}));

describe('OpenSearch > Unit', () => {
    test('forRoot()', async() => {
        const tBuilder = Test.createTestingModule({
            imports: [
                OpenSearchModule.forRoot({
                    node: faker.internet.url(),
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(OpenSearchModule);
        expect(oModule).toBeDefined();

        await tFixture.close();
    });

    test('forRootAsync with useFactory()', async() => {
        const configToken = faker.word.adjective();
        const provider: ValueProvider<Faker> = {
            provide: configToken,
            useValue: faker,
        };

        @Module({
            providers: [provider],
            exports: [provider],
        })
        class ConfigModule {}

        const tBuilder = Test.createTestingModule({
            imports: [
                OpenSearchModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (f: Faker) => ({
                        node: f.internet.url(),
                    }),
                    inject: [configToken],
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(OpenSearchModule);
        expect(oModule).toBeInstanceOf(OpenSearchModule);

        await tFixture.close();
    });

    test('forRootAsync with useExisting()', async() => {
        @Injectable()
        class OpenSearchConfig implements OpenSearchOptionsFactory {
            public createOpenSearchOptions(): ClientOptions {
                return {
                    node: faker.internet.url(),
                };
            }
        }

        @Module({
            providers: [OpenSearchConfig],
            exports: [OpenSearchConfig],
        })
        class ConfigModule {}

        const tBuilder = Test.createTestingModule({
            imports: [
                OpenSearchModule.forRootAsync({
                    imports: [ConfigModule],
                    useExisting: OpenSearchConfig,
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(OpenSearchModule);
        expect(oModule).toBeInstanceOf(OpenSearchModule);

        await tFixture.close();
    });
});
