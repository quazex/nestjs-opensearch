import { faker } from '@faker-js/faker'
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { TestingOpenSearchFactory } from './tests.factory'
import { TTestingDocument } from './tests.types'

describe('OpenSearch > E2E', () => {
  const tModule = new TestingOpenSearchFactory()

  beforeAll(tModule.init.bind(tModule))
  afterAll(tModule.close.bind(tModule))

  test('Check connection', async() => {
    const isHealth = await tModule.service.ping()
    expect(isHealth).toBe(true)
  })

  test('Check write/read operations', async() => {
    const listCount = faker.number.int({ min: 2, max: 4 })
    const total = faker.number.int({ min: 10, max: 20 })

    const data = Array(total).fill({}).map<TTestingDocument>((_d, index) => ({
      id: faker.string.uuid(),
      name: faker.person.firstName(),
      orders: faker.number.int({ min: 0, max: 100 }),
      list: Array(listCount).fill(0).map(() => (index + 1)),
      is_new: faker.datatype.boolean(),
      updated_at: faker.date.past().toISOString(),
    }))
    const random = faker.helpers.arrayElement(data)

    const bulk = await tModule.service.write(data)
    expect(bulk.items.length).toBe(data.length)

    const reply = await tModule.service.read(random.id)
    expect(reply?.orders).toBe(random.orders)
    expect(reply?.is_new).toBe(random.is_new)
    expect(reply?.updated_at).toBe(random.updated_at)
  })
})
