import { Injectable } from '@nestjs/common'
import { API, Client } from '@opensearch-project/opensearch'
import { InjectOpenSearch } from '../source/opensearch.decorators'
import { TTestingDocument } from './tests.types'

@Injectable()
export class TestingOpenSearchService {
  private readonly index = 'testing_index'

  constructor(@InjectOpenSearch() private readonly client: Client) {}

  public async write(data: TTestingDocument[]): Promise<API.Bulk_ResponseBody> {
    const bulk = data.flatMap<API.Bulk_RequestBody>((item) => {
      const { id, ...doc } = item
      return [
        {
          create: {
            _index: this.index,
            _id: id.toString(),
          },
        },
        doc,
      ]
    })
    const result = await this.client.bulk({
      body: bulk,
      refresh: true,
    })
    return result.body
  }

  public async read(id: string): Promise<TTestingDocument | undefined> {
    const reply = await this.client.search({
      index: this.index,
      body: {
        query: {
          bool: {
            filter: [
              {
                term: {
                  _id: id,
                },
              },
            ],
          },
        },
      },
    })
    const first = reply.body.hits.hits.at(0)
    return first?._source as TTestingDocument
  }

  public async ping(): Promise<boolean> {
    const reply = await this.client.ping()
    return typeof reply.body === 'boolean' && reply.body === true
  }
}
