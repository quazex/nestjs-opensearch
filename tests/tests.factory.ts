import { Test, TestingModule } from '@nestjs/testing'
import { ElasticsearchContainer, StartedElasticsearchContainer } from '@testcontainers/elasticsearch'
import { OpenSearchModule } from '../source/opensearch.module'
import { TestingOpenSearchService } from './tests.service'

export class TestingOpenSearchFactory {
  private _testing: TestingModule
  private _container: StartedElasticsearchContainer

  public async init(): Promise<void> {
    const tContainer = new ElasticsearchContainer('elasticsearch:7.17.28')
    this._container = await tContainer.withReuse().start()

    const tModule = Test.createTestingModule({
      imports: [
        OpenSearchModule.forRoot({
          node: this._container.getHttpUrl(),
          requestTimeout: 1_000,
          pingTimeout: 1_000,
        }),
      ],
      providers: [
        TestingOpenSearchService,
      ],
    })

    this._testing = await tModule.compile()
    this._testing = await this._testing.init()

    this._testing.enableShutdownHooks()
  }

  public async close(): Promise<void> {
    await this._testing.close()
    await this._container.stop()
  }

  public get service(): TestingOpenSearchService {
    return this._testing.get(TestingOpenSearchService)
  }
}
